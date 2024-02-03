import Head from "next/head";
import Header from "@/components/Header";

export default function ReturnAndRefundPolicy() {
    return (
        <div className="return-and-refund-policy">
            <Head>
                <title>Ubuyblues Store - Return And Refund Policy</title>
            </Head>
            <Header />
            <div className="page-content text-white p-4">
                <div className="container-fluid">
                    <h1 className="welcome-msg mb-5 border-bottom border-2 pb-3 w-fit mx-auto">Return And Refund Policy Page</h1>
                    <div className="content">
                        
                    </div>
                </div>
            </div>
        </div>
    );
}