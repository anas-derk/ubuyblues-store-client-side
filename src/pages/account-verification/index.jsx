import Head from "next/head";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { FaLongArrowAltRight } from "react-icons/fa";

export default function AccountVerification() {
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    useEffect(() => {
        setIsLoadingPage(false);
    }, []);
    return (
        <div className="account-verification">
            <Head>
                <title>Asfour Store - User Auth</title>
            </Head>
            {!isLoadingPage && <>
                <Header />
                <div className="page-content">
                    <h1 className="welcome-msg border-bottom pb-3 mb-5 text-center text-white">Welcome To You In Account Verification Page</h1>
                    <section className="verification p-4">
                        <h6 className="mb-3 fw-bold">You're almost done!</h6>
                        <h6 className="mb-3 fw-bold">
                            <span className="me-2">We sent a launch code to</span>
                            <span className="text-danger email-box">anas.derk2023@gmail.com</span>
                        </h6>
                        <h6 className="mb-3 fw-bold">
                            <FaLongArrowAltRight className="me-2" />
                            <span className="text-danger fw-bold">Enter code *</span>
                        </h6>
                        <div className="code-write-box d-flex mb-4">
                            <input
                                type="number"
                                className="form-control p-3"
                            />
                            <input
                                type="number"
                                className="form-control p-3"
                            />
                            <input
                                type="number"
                                className="form-control p-3"
                            />
                            <input
                                type="number"
                                className="form-control p-3"
                            />
                            <input
                                type="number"
                                className="form-control p-3"
                            />
                            <input
                                type="number"
                                className="form-control p-3"
                            />
                            <input
                                type="number"
                                className="form-control p-3"
                            />
                            <input
                                type="number"
                                className="form-control p-3"
                            />
                        </div>
                        <div className="email-sent-manager-box">
                            <span>Didn't get your email? </span>
                            <button className="btn btn-danger me-2">Resend The Code</button>
                            <span className="me-2">Or</span>
                            <button className="btn btn-danger">Update Your Email Address</button>
                        </div>
                        {/* <h6>Result</h6> */}
                    </section>
                </div>
            </>}
        </div>
    );
}