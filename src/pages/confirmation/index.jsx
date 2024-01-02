import Head from "next/head";
import Header from "@/components/Header";
import LoaderPage from "@/components/LoaderPage";
import { useState, useEffect } from "react";

export default function Confirmation() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    useEffect(() => {
        setIsLoadingPage(false);
    }, []);

    return (
        <div className="confirmation">
            <Head>
                <title>Asfour Store - Confirmation</title>
            </Head>
            {!isLoadingPage && <>
                <Header />
                <div className="page-content text-white p-4">
                    <h1 className="welcome-msg text-center mb-3">Welcome To You In Payment Confirmation Page</h1>
                    aa
                </div>
            </>}
        </div>
    );
}