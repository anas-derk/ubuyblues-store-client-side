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

    const [allSections, setAllSections] = useState(["brands", "whatsapp button"]);

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState(false);

    const [successMsg, setSuccessMsg] = useState(false);

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

    const changeSectionsStatus = () => {

    }

    return (
        <div className="show-and-hide-sections admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Show And Hide Sections</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminDashboardSideBar activeParentLink={activeParentLink} activeChildLink={activeChildLink} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr Asfour In Your Add Show And Hide Sections Page
                    </h1>
                    <div className="sections-box w-100">
                        <table className="sections-table mb-4 managment-table bg-white w-100">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Show Or Hide</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allSections.map((sectionName, index) => (
                                    <tr key={sectionName}>
                                        <td className="section-name-cell">
                                            {sectionName}
                                        </td>
                                        <td className="select-section-status-cell">

                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={2}>
                                        {!isWaitStatus && !errorMsg && !successMsg &&
                                            <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                onClick={() => changeSectionsStatus(index)}
                                            >Change Sections Status</button>
                                        }
                                        {isWaitStatus && <button
                                            className="btn btn-warning d-block mx-auto global-button"
                                        >Please Waiting</button>}
                                        {successMsg && <button
                                            className="btn btn-success d-block mx-auto global-button"
                                        >{ successMsg }</button>}
                                        {errorMsg && <button
                                            className="btn btn-success d-block mx-auto global-button"
                                        >{ errorMsg }</button>}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
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