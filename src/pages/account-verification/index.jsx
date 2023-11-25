import Head from "next/head";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { FaLongArrowAltRight } from "react-icons/fa";
import axios from "axios";

export default function AccountVerification() {
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const sendTheCodeToUserEmail = async() => {
        try{
            const res = await axios.post(`${process.env.BASE_API_URL}/users/send-account-verification-code?email=anas.derk2023@gmail.com`);
            const result = await res.data;
            console.log(result);
        }
        catch(err) {
            console.log(err);
        }
    }
    useEffect(() => {
        setIsLoadingPage(false);
    }, []);
    const checkAccountVerificationCode = (e) => {
        e.preventDefault();
    }
    return (
        <div className="account-verification">
            <Head>
                <title>Asfour Store - Account Verification</title>
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
                        <form className="code-write-form d-flex mb-4" onSubmit={checkAccountVerificationCode}>
                            <input
                                type="number"
                                className="form-control p-3"
                                required
                                min="0"
                            />
                            <input
                                type="number"
                                className="form-control p-3"
                                required
                                min="0"
                            />
                            <input
                                type="number"
                                className="form-control p-3"
                                required
                                min="0"
                            />
                            <input
                                type="number"
                                className="form-control p-3"
                                required
                                min="0"
                            />
                            <input
                                type="number"
                                className="form-control p-3"
                                required
                                min="0"
                            />
                            <input
                                type="number"
                                className="form-control p-3"
                                required
                                min="0"
                            />
                            <input
                                type="number"
                                className="form-control p-3"
                                required
                                min="0"
                            />
                            <input
                                type="number"
                                className="form-control p-3"
                                required
                                min="0"
                            />
                            <input type="submit" hidden />
                        </form>
                        <div className="email-sent-manager-box">
                            <span>Didn't get your email? </span>
                            <button className="btn btn-danger me-2" onClick={sendTheCodeToUserEmail}>Resend The Code</button>
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