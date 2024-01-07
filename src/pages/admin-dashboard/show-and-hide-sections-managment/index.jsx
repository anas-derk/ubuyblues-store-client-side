import Head from "next/head";
import AdminDashboardSideBar from "@/components/AdminDashboardSideBar";
import { PiHandWavingThin } from "react-icons/pi";
import { useState, useEffect } from "react";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import axios from "axios";

export default function ShowAndHideSections({ activeParentLink, activeChildLink }) {
    
    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

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

    return (
        <div className="show-and-hide-sections admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Show And Hide Sections</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminDashboardSideBar activeParentLink={activeParentLink} activeChildLink={activeChildLink} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr Asfour In Your Add Show And Hide Sections Page
                    </h1>
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