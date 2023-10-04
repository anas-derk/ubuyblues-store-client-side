import Head from "next/head";
import AdminDashboardSideBar from "@/components/AdminDashboardSideBar";

export default function AdminDashboard() {
    return (
        <div className="admin-dashboard">
            <Head>
                <title>Asfour Store - Admin Dashboard</title>
            </Head>
            <div className="page-content">
                <AdminDashboardSideBar />
            </div>
        </div>
    );
}