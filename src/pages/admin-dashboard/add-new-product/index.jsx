import Head from "next/head";
import AdminDashboardSideBar from "@/components/AdminDashboardSideBar";
import { PiHandWavingThin } from "react-icons/pi";

export default function AddNewProduct({ activeParentLink, activeChildLink }) {
    return (
        <div className="add-new-product admin-dashboard">
            <Head>
                <title>Asfour Store - Add New Product</title>
            </Head>
            <AdminDashboardSideBar activeParentLink={activeParentLink} activeChildLink={activeChildLink} />
            <div className="page-content d-flex justify-content-center align-items-center">
                <h1 className="fw-bold w-fit pb-2">
                    <PiHandWavingThin className="me-2" />
                    Hi, Mr Asfour In Your Add New Product Page
                </h1>
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