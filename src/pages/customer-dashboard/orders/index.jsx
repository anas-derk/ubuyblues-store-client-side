import Head from "next/head";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import Link from "next/link";

export default function CustomerOrders() {
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
    return (
        <div className="customer-orders">
            <Head>
                <title>Asfour Store - Customer Orders</title>
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
                                <div className="customer-orders">
                                    <h1 className="h5 text-white">
                                        <span className="me-2">No order has been made yet.</span>
                                        <Link href="/" className="btn btn-danger">Browse Products</Link>
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </> : <LoaderPage />}
        </div>
    );
}