import Head from "next/head";
import AdminDashboardSideBar from "@/components/AdminDashboardSideBar";
import { PiHandWavingThin } from "react-icons/pi";
import { useState, useEffect } from "react";
import axios from "axios";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";

export default function AddNewBrand({ activeParentLink, activeChildLink }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [brandImage, setBrandImage] = useState("");

    const [brandTitle, setBrandTitle] = useState("");

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        const adminId = localStorage.getItem("asfour-store-admin-user-id");
        if (adminId) {
            axios.get(`${process.env.BASE_API_URL}/admins/user-info/${adminId}`)
                .then((res) => {
                    const result = res.data;
                    if (result === "Sorry, The User Is Not Exist !!, Please Enter Another User Id ..") {
                        localStorage.removeItem("asfour-store-admin-user-id");
                        router.push("/admin-dashboard/login");
                    } else {
                        setIsLoadingPage(false);
                    }
                })
                .catch(() => {
                    setIsLoadingPage(false);
                    setIsErrorMsgOnLoadingThePage(true);
                });
        } else {
            router.push("/admin-dashboard/login");
        }
    }, []);

    const addNewBrand = async (e, brandTitle) => {
        try {
            e.preventDefault();
            let formData = new FormData();
            formData.append("brandImg", brandImage);
            formData.append("title", brandTitle);
            setIsWaitStatus(true);
            const res = await axios.post(`${process.env.BASE_API_URL}/brands/add-new-brand`, formData);
            const result = await res.data;
            setIsWaitStatus(false);
            if (result === "Adding New Brand Process Has Been Successfuly ...") {
                setSuccessMsg(result);
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setIsWaitStatus(false);
                setErrorMsg(result);
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
        catch (err) {
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
                <AdminDashboardSideBar activeParentLink={activeParentLink} activeChildLink={activeChildLink} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr Asfour In Your Add New Brand Page
                    </h1>
                    <form className="add-new-category-form w-50" onSubmit={(e) => addNewBrand(e, brandTitle)}>
                        <h6 className="mb-3 fw-bold">Please Select Product Image</h6>
                        <input
                            type="file"
                            className="form-control brand-image-field p-2 mb-4"
                            placeholder="Please Enter Brand Image"
                            required
                            onChange={(e) => setBrandImage(e.target.files[0])}
                        />
                        <input
                            type="text"
                            className="form-control product-name-field p-2 mb-4"
                            placeholder="Please Enter Brand Title"
                            required
                            onChange={(e) => setBrandTitle(e.target.value)}
                        />
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

export const getServerSideProps = async ({ query }) => {
    return {
        props: {
            activeParentLink: query.activeParentLink,
            activeChildLink: query.activeChildLink,
        }
    }
}