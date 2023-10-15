import Head from "next/head";
import AdminDashboardSideBar from "@/components/AdminDashboardSideBar";
import { PiHandWavingThin } from "react-icons/pi";
import { useState } from "react";
import Axios from "axios";

export default function AddNewCategory({ activeParentLink, activeChildLink }) {
    const [categoryName, setCategoryName] = useState("");
    const [isWaitStatus, setIsWaitStatus] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const addNewCategory = async (e, categoryName) => {
        e.preventDefault();
        try {
            setIsWaitStatus(true);
            const res = await Axios.post(`${process.env.BASE_API_URL}/categories/add-new-category`, {
                categoryName,
            });
            const result = await res.data;
            setIsWaitStatus(false);
            if (result === "Adding New Category Process It Successfuly ...") {
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
            console.log(err.response.data);
            setIsWaitStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }
    return (
        <div className="add-new-cateogry admin-dashboard">
            <Head>
                <title>Asfour Store - Add New Category</title>
            </Head>
            <AdminDashboardSideBar activeParentLink={activeParentLink} activeChildLink={activeChildLink} />
            <div className="page-content d-flex justify-content-center align-items-center flex-column">
                <h1 className="fw-bold w-fit pb-2 mb-3">
                    <PiHandWavingThin className="me-2" />
                    Hi, Mr Asfour In Your Add New Category Page
                </h1>
                <form className="add-new-category-form w-50" onSubmit={(e) => addNewCategory(e, categoryName)}>
                    <input
                        type="text"
                        className="form-control product-name-field p-2 mb-4"
                        placeholder="Please Enter Category Name"
                        required
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                    {!isWaitStatus && !successMsg && !errorMsg && <button
                        type="submit"
                        className="btn btn-success w-50 d-block mx-auto p-2"
                    >
                        Add Now
                    </button>}
                    {isWaitStatus && <button
                        type="button"
                        className="btn btn-danger w-50 d-block mx-auto p-2"
                        disabled
                    >
                        Waiting Add New Category ...
                    </button>}
                    {errorMsg && <button
                        type="button"
                        className="btn btn-danger w-50 d-block mx-auto p-2"
                        disabled
                    >
                        {errorMsg}
                    </button>}
                    {successMsg && <button
                        type="button"
                        className="btn btn-success w-75 d-block mx-auto p-2"
                        disabled
                    >
                        {successMsg}
                    </button>}
                </form>
            </div>
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