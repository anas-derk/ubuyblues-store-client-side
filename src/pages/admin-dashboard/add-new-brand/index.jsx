import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import validations from "../../../../public/global_functions/validations";
import { useRouter } from "next/router";
import { HiOutlineBellAlert } from "react-icons/hi2";

export default function AddNewBrand() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [token, setToken] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [brandImage, setBrandImage] = useState("");

    const [brandTitle, setBrandTitle] = useState("");

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const fileElementRef = useRef();

    const router = useRouter();

    useEffect(() => {
        const adminToken = localStorage.getItem("asfour-store-admin-user-token");
        if (adminToken) {
            validations.getAdminInfo(adminToken)
                .then(async (result) => {
                    if (result.error) {
                        localStorage.removeItem("asfour-store-admin-user-token");
                        await router.push("/admin-dashboard/login");
                    } else {
                        setAdminInfo(result.data);
                        setToken(adminToken);
                        setIsLoadingPage(false);
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem("asfour-store-admin-user-token");
                        await router.push("/admin-dashboard/login");
                    }
                    else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else router.push("/admin-dashboard/login");
    }, []);

    const validateFormFields = (validateDetailsList) => {
        return validations.inputValuesValidation(validateDetailsList);
    }

    const addNewBrand = async (e, brandTitle) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            let errorsObject = validateFormFields([
                {
                    name: "brandImage",
                    value: brandImage,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isImage: {
                            msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Image File !!",
                        },
                    },
                },
                {
                    name: "brandTitle",
                    value: brandTitle,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                let formData = new FormData();
                formData.append("brandImg", brandImage);
                formData.append("title", brandTitle);
                formData.append("storeId", adminInfo.storeId);
                setIsWaitStatus(true);
                const res = await axios.post(`${process.env.BASE_API_URL}/brands/add-new-brand`, formData, {
                    headers: {
                        Authorization: token,
                    }
                });
                const result = await res.data;
                setIsWaitStatus(false);
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setBrandImage("");
                        setBrandTitle("");
                        fileElementRef.current.value = "";
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setIsWaitStatus(false);
                    setErrorMsg(result.msg);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 1500);
                }
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem("asfour-store-admin-user-token");
                await router.push("/admin-dashboard/login");
                return;
            }
            setIsWaitStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="add-new-brand admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Add New Brand</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr { adminInfo.firstName + " " + adminInfo.lastName } In Your Add New Brand Page
                    </h1>
                    <form className="add-new-category-form w-50" onSubmit={(e) => addNewBrand(e, brandTitle)}>
                        <h6 className="mb-3 fw-bold">Please Select Brand Image</h6>
                        <section className="brand-image mb-4">
                            <input
                                type="file"
                                className={`form-control p-2 border-2 brand-image-field ${formValidationErrors["brandImage"] ? "border-danger mb-3" : "mb-4"}`}
                                onChange={(e) => setBrandImage(e.target.files[0])}
                                ref={fileElementRef}
                                value={fileElementRef.current?.value}
                                accept=".png, .jpg, .webp"
                            />
                            {formValidationErrors["brandImage"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors["brandImage"]}</span>
                            </p>}
                        </section>
                        <section className="brand-title mb-4">
                            <input
                                type="text"
                                className={`form-control p-2 border-2 brand-title-field ${formValidationErrors["brandTitle"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter Brand Title"
                                onChange={(e) => setBrandTitle(e.target.value)}
                                value={brandTitle}
                            />
                            {formValidationErrors["brandTitle"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors["brandTitle"]}</span>
                            </p>}
                        </section>
                        {!isWaitStatus && !successMsg && !errorMsg && <button
                            type="submit"
                            className="btn btn-success w-50 d-block mx-auto p-2 global-button"
                        >
                            Add Now
                        </button>}
                        {isWaitStatus && <button
                            type="button"
                            className="btn btn-danger w-50 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            Waiting Add New Brand ...
                        </button>}
                        {errorMsg && <button
                            type="button"
                            className="btn btn-danger w-50 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {errorMsg}
                        </button>}
                        {successMsg && <button
                            type="button"
                            className="btn btn-success w-75 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {successMsg}
                        </button>}
                    </form>
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}