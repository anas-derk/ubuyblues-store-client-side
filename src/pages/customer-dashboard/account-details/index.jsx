import Head from "next/head";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import Link from "next/link";

export default function CustomerAccountDetails() {
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [userInfo, setUserInfo] = useState(true);
    const router = useRouter();
    useEffect(() => {
        const userId = localStorage.getItem("asfour-store-user-id");
        if (userId) {
            Axios.get(`${process.env.BASE_API_URL}/users/user-info/${userId}`)
                .then((res) => {
                    const result = res.data;
                    if (result !== "Sorry, The User Is Not Exist !!, Please Enter Another User Id ..") {
                        setUserInfo(result);
                        setIsLoadingPage(false);
                    } else {
                        router.push("/auth");
                    }
                })
                .catch((err) => console.log(err));
        } else {
            router.push("/auth");
        }
    }, []);
    const saveChanges = (e) => {
        e.preventDefault();
    }
    return (
        <div className="customer-account-details">
            <Head>
                <title>Asfour Store - Customer Account Details</title>
            </Head>
            {!isLoadingPage ? <>
                <Header />
                <div className="page-content d-flex align-items-center">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <div className="col-md-9">
                                <form className="edit-customer-account-details-form p-4" onSubmit={saveChanges}>
                                    <section className="first-and-last-name mb-4">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h6>First Name <span className="text-danger">*</span></h6>
                                                <input
                                                    type="text"
                                                    className="form form-control"
                                                    placeholder="Please Enter New First Name Here"
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <h6>Last Name <span className="text-danger">*</span></h6>
                                                <input
                                                    type="text"
                                                    className="form form-control"
                                                    placeholder="Please Enter Last Name Here"
                                                />
                                            </div>
                                        </div>
                                    </section>
                                    <section className="preview-name mb-4">
                                        <h6>Preview Name <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className="form form-control"
                                            placeholder="Please Enter New Preview Name Here"
                                        />
                                        <h6 className="note mt-2">This way your name will be displayed in the accounts section and in reviews</h6>
                                    </section>
                                    <section className="email mb-4">
                                        <h6>Email <span className="text-danger">*</span></h6>
                                        <input
                                            type="email"
                                            className="form form-control"
                                            placeholder="Please Enter New Email Here"
                                        />
                                        <h6 className="note mt-2">This way your name will be displayed in the accounts section and in reviews</h6>
                                    </section>
                                    <section className="change-password mb-4">
                                        <fieldset className="p-4">
                                            <section className="current-password mb-3">
                                                <h6>Current password (leave the field blank if you do not want to change it)</h6>
                                                <input
                                                    type="password"
                                                    className="form form-control"
                                                    placeholder="Please Enter Current Password Here"
                                                />
                                            </section>
                                            <section className="new-password mb-3">
                                                <h6>New password (leave the field blank if you do not want to change it)</h6>
                                                <input
                                                    type="password"
                                                    className="form form-control"
                                                    placeholder="Please Enter New Here"
                                                />
                                            </section>
                                            <section className="confirm-new-password mb-3">
                                                <h6>New password (leave the field blank if you do not want to change it)</h6>
                                                <input
                                                    type="password"
                                                    className="form form-control"
                                                    placeholder="Please Re-Enter New Password Here"
                                                />
                                            </section>
                                        </fieldset>
                                    </section>
                                    <button type="submit" className="btn btn-danger d-block mx-auto">Save Changes</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </> : <LoaderPage />}
        </div>
    );
}