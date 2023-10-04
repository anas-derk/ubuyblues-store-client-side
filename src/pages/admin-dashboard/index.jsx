import Head from "next/head";
import AdminDashboardSideBar from "@/components/AdminDashboardSideBar";
import { PiHandWavingThin } from "react-icons/pi";

export default function AdminDashboard() {
    return (
        <div className="admin-dashboard">
            <Head>
                <title>Asfour Store - Admin Dashboard</title>
            </Head>
            <AdminDashboardSideBar />
            <div className="page-content d-flex justify-content-center align-items-center">
                <h1 className="fw-bold w-fit pb-2">
                    <PiHandWavingThin className="me-2" />
                    Hi, Mr Asfour In Your Admin Dashboard Page
                </h1>
            </div>
        </div>
    );
}