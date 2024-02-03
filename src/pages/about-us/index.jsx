import Head from "next/head";
import Header from "@/components/Header";

export default function AboutUs() {
    return (
        <div className="about-us">
            <Head>
                <title>Ubuyblues Store - About Us</title>
            </Head>
            <Header />
            <div className="page-content text-white p-4">
                <div className="container-fluid">
                    <h1 className="welcome-msg mb-5 border-bottom border-2 pb-3 w-fit mx-auto">About Us Page</h1>
                    <div className="content">
                        
                    </div>
                </div>
            </div>
        </div>
    );
}