import Head from "next/head";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { FaLongArrowAltRight } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/router";
import LoaderPage from "@/components/LoaderPage";

export default function AccountVerification({ email }) {
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [accountVerificationCodeCharactersList, setAccountVerificationCodeCharactersList] = useState([]);
    const [minutes, setMinutes] = useState(1);
    const [seconds, setSeconds] = useState(59);
    const [accountVerificationCode, setAccountVerificationCode] = useState("");
    const [isWaitCheckingStatus, setIsWaitCheckingStatus] = useState(false);
    const [isWaitResendTheCode, setIsWaitResendTheCode] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const router = useRouter();
    useEffect(() => {
        sendTheCodeToUserEmail()
            .then(() => setIsLoadingPage(false))
            .catch((err) => console.log(err));
    }, []);
    const sendTheCodeToUserEmail = async () => {
        try {
            setIsWaitResendTheCode(true);
            const res = await axios.post(`${process.env.BASE_API_URL}/users/send-account-verification-code?email=${email}`);
            const result = await res.data;
            setAccountVerificationCode(result);
            setIsWaitResendTheCode(false);
            setSuccessMsg("Sending Code To Your Email Process Has Been Succssfuly !!");
            handleTimeCounter();
            let successMsgTimeout = setTimeout(() => {
                setSuccessMsg("");
                clearTimeout(successMsgTimeout);
            }, 2000);
        }
        catch (err) {
            setIsWaitResendTheCode(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeat The Process !!");
            let errorMsgTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorMsgTimeout);
            }, 2000);
        }
    }
    const checkAccountVerificationCode = async (e) => {
        try {
            e.preventDefault();
            setIsWaitCheckingStatus(true);
            console.log(accountVerificationCodeCharactersList.join(""), accountVerificationCode)
            if (accountVerificationCodeCharactersList.join("") === accountVerificationCode) {
                const res = await axios.put(`${process.env.BASE_API_URL}/users/update-verification-status?email=${email}`);
                const result = await res.data;
                localStorage.setItem("asfour-store-user-id", result);
                router.push("/");
            }
            else {
                let checkAccountVerificationCodeTimeout = setTimeout(() => {
                    setIsWaitCheckingStatus(false);
                    setErrorMsg("Sorry, Invalid Code !!");
                    let errorMsgTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorMsgTimeout);
                    }, 3000);
                    clearTimeout(checkAccountVerificationCodeTimeout);
                }, 1500);
            }
        }
        catch (err) {
            setIsWaitCheckingStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeat The Process !!");
            let errorMsgTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorMsgTimeout);
            }, 2000);
        }
    }
    const handleWritePartOfVerificationCode = (character, inputIndex) => {
        accountVerificationCodeCharactersList[inputIndex] = character;
        if (inputIndex < 7) {
            const nextCodeCharacterInputField = document.getElementById(`field${inputIndex + 2}`);
            if (nextCodeCharacterInputField.value.length === 0) {
                nextCodeCharacterInputField.focus();
            }
        } else if (inputIndex === 7 || !accountVerificationCodeCharactersList.includes("")) {
            checkAccountVerificationCode(event);
        }
    }
    const handleTimeCounter = () => {
        let secondsTemp = 59, minutesTemp = 1;
        let timeCounter = setInterval(() => {
            if (secondsTemp === 0 && minutesTemp !== 0) {
                secondsTemp = 59;
                setSeconds(59);
                minutesTemp = minutesTemp - 1;
                setMinutes(minutesTemp);
            } else if (secondsTemp !== 0 && (minutesTemp !== 0 || minutesTemp === 0)) {
                secondsTemp = secondsTemp - 1;
                setSeconds(secondsTemp);
            } else if (secondsTemp === 0 && minutesTemp === 0) {
                clearInterval(timeCounter);
            }
        }, 1000);
    }
    return (
        <div className="account-verification">
            <Head>
                <title>Asfour Store - Account Verification</title>
            </Head>
            {!isLoadingPage ? <>
                <Header />
                <div className="page-content">
                    <h1 className="welcome-msg border-bottom pb-3 mb-5 text-center text-white">Welcome To You In Account Verification Page</h1>
                    <section className="verification p-4">
                        {errorMsg && <p className="alert alert-danger">{errorMsg}</p>}
                        {successMsg && <p className="alert alert-success">{successMsg}</p>}
                        {isWaitCheckingStatus && <div className="overlay d-flex align-items-center justify-content-center flex-column text-white">
                            <span className="check-loader mb-4"></span>
                            <h6>Checking ....</h6>
                        </div>}
                        <div className="row">
                            <div className="col-md-5">
                                <h6 className="mb-3 fw-bold">You're almost done!</h6>
                            </div>
                            <div className="col-md-7 text-end">
                                <h6 className="mb-3 fw-bold">
                                    You can redial the message after {minutes} : {seconds}
                                </h6>
                            </div>
                        </div>
                        <h6 className="mb-3 fw-bold">
                            <span className="me-2">We sent a launch code to</span>
                            <span className="text-danger email-box">{ email }</span>
                        </h6>
                        <h6 className="mb-3 fw-bold">
                            <FaLongArrowAltRight className="me-2" />
                            <span className="text-danger fw-bold">Enter code *</span>
                        </h6>
                        <form className="code-write-form d-flex mb-4" onSubmit={checkAccountVerificationCode}>
                            {
                                ["field1", "field2", "field3", "field4", "field5", "field6", "field7", "field8"]
                                    .map((el, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            className="form-control p-3 text-center"
                                            required
                                            min="0"
                                            maxLength="1"
                                            id={el}
                                            onChange={(e) => handleWritePartOfVerificationCode(e.target.value, index)}
                                        />
                                    ))
                            }
                            <input type="submit" hidden />
                        </form>
                        <div className="email-sent-manager-box pb-3">
                            <span>Didn't get your email? </span>
                            {!isWaitResendTheCode && !errorMsg && <button
                                className="btn btn-danger me-2"
                                onClick={sendTheCodeToUserEmail}
                                disabled={seconds == 0 && minutes == 0 ? false : true}
                            >
                                Resend The Code
                            </button>}
                            {isWaitResendTheCode && <button
                                className="btn btn-danger me-2"
                                disabled
                            >
                                Resending The Code ...
                            </button>}
                            <span className="me-2">Or</span>
                            <button className="btn btn-danger">Update Your Email Address</button>
                        </div>
                    </section>
                </div>
            </>: <LoaderPage />}
        </div>
    );
}

export async function getServerSideProps({ query }) {
    return {
        props: {
            email: query.email,
        },
    };
}