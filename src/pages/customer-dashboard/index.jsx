import Head from "next/head";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";

export default function CustomerDashboard() {
    return (
        <div className="customer-dashboard">
            <Head>
                <title>Asfour Store - Customer Dashboard</title>
            </Head>
            <Header />
            <div className="page-content d-flex align-items-center">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-3">
                            <CustomerDashboardSideBar />
                        </div>
                        <div className="col-md-9">
                            aaa
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}