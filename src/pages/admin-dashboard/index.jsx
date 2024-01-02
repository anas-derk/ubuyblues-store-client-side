import Head from "next/head";
import AdminDashboardSideBar from "@/components/AdminDashboardSideBar";
import { PiHandWavingThin } from "react-icons/pi";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";

export default function AdminDashboard() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const userId = localStorage.getItem("asfour-store-admin-user-id");
        if (userId) {
            axios.get(`${process.env.BASE_API_URL}/admins/user-info/${userId}`)
                .then((res) => {
                    const result = res.data;
                    if (result === "Sorry, The User Is Not Exist !!, Please Enter Another User Id ..") {
                        localStorage.removeItem("asfour-store-admin-user-id");
                        router.push("/admin-dashboard/login");
                    } else {
                        setIsLoadingPage(false);
                    }
                });
        } else {
            router.push("/admin-dashboard/login");
        }
    }, []);

    return (
        <div className="main admin-dashboard">
            <Head>
                <title>Asfour Store - Admin Dashboard</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminDashboardSideBar />
            <div className="page-content d-flex justify-content-center align-items-center">
                <h1 className="fw-bold w-fit pb-2">
                    <PiHandWavingThin className="me-2" />
                    Hi, Mr Asfour In Your Admin Dashboard Page
                </h1>
            </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}