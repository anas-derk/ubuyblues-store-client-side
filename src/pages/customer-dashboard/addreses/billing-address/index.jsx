import Head from "next/head";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Axios from "axios";
import LoaderPage from "@/components/LoaderPage";

export default function CustomerBillingAddress() {
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
        <div className="customer-billing-address">
            <Head>
                <title>Asfour Store - Customer Billing Address</title>
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
                                <form className="edit-customer-billing-address-form p-4" onSubmit={saveChanges}>
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
                                    <section className="company-name mb-4">
                                        <h6>Company Name (Optional)</h6>
                                        <input
                                            type="text"
                                            className="form form-control"
                                            placeholder="Please Enter New Company Name Here"
                                        />
                                    </section>
                                    <section className="country mb-4">
                                        <h6>Country / Area <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className="form form-control"
                                            placeholder="Please Enter New Country / Area Here"
                                        />
                                    </section>
                                    <section className="street-address mb-4">
                                        <h6>Street Addres <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className="form form-control"
                                            placeholder="Please Enter New Street Address"
                                        />
                                    </section>
                                    <section className="street-address mb-4">
                                        <h6>Street Address / Neighborhood <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className="form form-control"
                                            placeholder="Please Enter New Street Address / Neighborhood"
                                        />
                                    </section>
                                    <section className="apartment-number mb-4">
                                        <h6>Apartment Number, Ward, Unit, Etc . ( Optional )</h6>
                                        <input
                                            type="text"
                                            className="form form-control"
                                            placeholder="Please Enter New Apartment Number, Ward, Unit, Etc"
                                        />
                                    </section>
                                    <section className="city-number mb-4">
                                        <h6>City <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className="form form-control"
                                            placeholder="Please Enter New Apartment Number, Ward, Unit, Etc"
                                        />
                                    </section>
                                    <section className="postal-code-number mb-4">
                                        <h6>Postal Code / Zip <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className="form form-control"
                                            placeholder="Please Enter New Postal Code / Zip"
                                        />
                                    </section>
                                    <section className="phone-number mb-4">
                                        <h6>Phone Number <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className="form form-control"
                                            placeholder="Please Enter New Phone Number"
                                        />
                                    </section>
                                    <section className="email mb-4">
                                        <h6>Email <span className="text-danger">*</span></h6>
                                        <input
                                            type="email"
                                            className="form form-control"
                                            placeholder="Please Enter New Email"
                                        />
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