import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { getAdminInfo, inputValuesValidation } from "../../../../public/global_functions/validations";
import { useRouter } from "next/router";
import { HiOutlineBellAlert } from "react-icons/hi2";

export default function AddNewAdmin() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [adminInfo, setAdminInfo] = useState({});

    const [adminData, setAdminData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        storeId: "",
    });

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

    useEffect(() => {
        const adminToken = localStorage.getItem(process.env.adminTokenNameInLocalStorage);
        if (adminToken) {
            getAdminInfo()
                .then(async (result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.push("/admin-dashboard/login");
                    } else {
                        const adminDetails = result.data;
                        if (adminDetails.isBlocked) {
                            localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                            await router.push("/admin-dashboard/login");
                        } else {
                            setAdminInfo(adminDetails);
                            setIsLoadingPage(false);
                        }
                    }
                })
                .catch(async (err) => {
                    if (err?.message === "Network Error") {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.push("/admin-dashboard/login");
                    }
                    else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else router.push("/admin-dashboard/login");
    }, []);

    const addNewAdmin = async (e, adminData) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            let errorsObject = inputValuesValidation([
                {
                    name: "firstName",
                    value: adminData.firstName,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isName: {
                            msg: "Sorry, This Name Is Not Valid !!",
                        }
                    },
                },
                {
                    name: "lastName",
                    value: adminData.lastName,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isName: {
                            msg: "Sorry, This Name Is Not Valid !!",
                        },
                    },
                },
                {
                    name: "email",
                    value: adminData.email,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isEmail: {
                            msg: "Sorry, Invalid Email !!",
                        },
                    },
                },
                {
                    name: "password",
                    value: adminData.password,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isValidPassword: {
                            msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter."
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                let formData = new FormData();
                formData.append("firstName", adminData.firstName);
                formData.append("lastName", adminData.lastName);
                formData.append("email", adminData.email);
                formData.append("password", adminData.password);
                formData.append("storeId", adminInfo.storeId);
                setIsWaitStatus(true);
                const res = await axios.post(`${process.env.BASE_API_URL}/admins/add-new-admin`, formData, {
                    headers: {
                        Authorization: localStorage.getItem("asfour-store-admin-user-token"),
                    }
                });
                const result = res.data;
                setIsWaitStatus(false);
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setAdminData({
                            firstName: "",
                            lastName: "",
                            email: "",
                            password: "",
                        });
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
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
        <div className="add-new-admin admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Add New Admin</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column pt-5 pb-5 p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Add New Admin Page
                    </h1>
                    <form className="add-new-product-form admin-dashbboard-form" onSubmit={(e) => addNewAdmin(e, adminData)}>
                        <section className="first-name mb-4">
                            <input
                                type="text"
                                className={`form-control p-2 border-2 product-name-field ${formValidationErrors["firstName"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter First Name"
                                onChange={(e) => setAdminData({ ...adminData, firstName: e.target.value })}
                                value={adminData.firstName}
                            />
                            {formValidationErrors["firstName"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors["firstName"]}</span>
                            </p>}
                        </section>
                        <section className="last-name mb-4">
                            <input
                                type="text"
                                className={`form-control p-2 border-2 product-name-field ${formValidationErrors["lastName"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter Last Name"
                                onChange={(e) => setAdminData({ ...adminData, lastName: e.target.value })}
                                value={adminData.lastName}
                            />
                            {formValidationErrors["lastName"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors["lastName"]}</span>
                            </p>}
                        </section>
                        <section className="email mb-4">
                            <input
                                type="text"
                                className={`form-control p-2 border-2 admin-email-field ${formValidationErrors["email"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter Email"
                                onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                                value={adminData.email}
                            />
                            {formValidationErrors["email"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors["email"]}</span>
                            </p>}
                        </section>
                        <section className="password mb-4">
                            <input
                                type="text"
                                className={`form-control p-2 border-2 admin-password-field ${formValidationErrors["password"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter Password"
                                onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                                value={adminData.password}
                            />
                            {formValidationErrors["password"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors["password"]}</span>
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
                            Waiting Add New Product ...
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