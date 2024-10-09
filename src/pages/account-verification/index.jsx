import Head from "next/head";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { FaLongArrowAltRight } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/router";
import LoaderPage from "@/components/LoaderPage";
import { MdOutlineErrorOutline } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { isEmail } from "../../../public/global_functions/validations";
import { getUserInfo, handleSelectUserLanguage, sendTheCodeToUserEmail } from "../../../public/global_functions/popular";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";

export default function AccountVerification({ email }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [minutes, setMinutes] = useState(1);

    const [seconds, setSeconds] = useState(59);

    const [isWaitCheckingStatus, setIsWaitCheckingStatus] = useState(false);

    const [isWaitSendTheCode, setIsWaitSendTheCode] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsgOnLoading, setErrorMsgOnLoading] = useState("");

    const [accountVerificationCodeCharactersList, setAccountVerificationCodeCharactersList] = useState([]);

    const router = useRouter();

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.userlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        if (userToken) {
            getUserInfo()
                .then(async (res) => {
                    const result = res.data;
                    if (!result.error) {
                        await router.push("/");
                    } else {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                        await router.push("/auth");
                    }
                }).catch(async (err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.replace("/auth");
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        }
        else {
            if (isEmail(email)) {
                setIsWaitSendTheCode(true);
                sendTheCodeToUserEmail(email, "to activate account", "user")
                    .then((result) => {
                        setIsWaitSendTheCode(false);
                        if (!result.error) {
                            setSuccessMsg(result.msg);
                            setIsLoadingPage(false);
                            handleTimeCounter();
                            let successMsgTimeout = setTimeout(() => {
                                setSuccessMsg("");
                                clearTimeout(successMsgTimeout);
                            }, 2000);
                        } else {
                            setErrorMsgOnLoading(result.msg);
                            setIsLoadingPage(false);
                        }
                    })
                    .catch((err) => {
                        setIsWaitSendTheCode(false);
                        const errorMsg = err.message;
                        if (errorMsg === "Network Error") {
                            setErrorMsgOnLoading(errorMsg);
                        } else {
                            setErrorMsg("Sorry, Someting Went Wrong, Please Repeat The Process !!");
                            let errorMsgTimeout = setTimeout(() => {
                                setErrorMsg("");
                                clearTimeout(errorMsgTimeout);
                            }, 2000);
                        }
                        setIsLoadingPage(false);
                    });
            } else {
                setErrorMsgOnLoading("Sorry, Invalid Email Address !!");
                setIsLoadingPage(false);
            }
        }
    }, []);

    const resendTheCodeToEmail = async () => {
        try {
            setIsWaitSendTheCode(true);
            const result = await sendTheCodeToUserEmail(email, "to activate account", "user");
            setIsWaitSendTheCode(false);
            if (!result.error) {
                setSuccessMsg(result.msg);
                handleTimeCounter();
                let successMsgTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    clearTimeout(successMsgTimeout);
                }, 2000);
            } else {
                setErrorMsg(result.msg);
                let errorMsgTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorMsgTimeout);
                }, 2000);
            }
        }
        catch (err) {
            setIsWaitSendTheCode(false);
            setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
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
            const result = (await axios.put(`${process.env.BASE_API_URL}/users/update-verification-status?email=${email}&code=${accountVerificationCodeCharactersList.join("")}&language=${i18n.language}`)).data;
            if (!result.error) {
                localStorage.setItem(process.env.userTokenNameInLocalStorage, result.data.token);
                await router.replace("/");
            } else {
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
            setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorMsgTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorMsgTimeout);
            }, 2000);
        }
    }

    const handleWritePartOfVerificationCode = (character, inputIndex) => {
        accountVerificationCodeCharactersList[inputIndex] = character;
        if (inputIndex < 3) {
            const nextCodeCharacterInputField = document.getElementById(`field${inputIndex + 2}`);
            if (nextCodeCharacterInputField.value.length === 0) {
                nextCodeCharacterInputField.focus();
            }
        } else if (inputIndex === 3 || !accountVerificationCodeCharactersList.includes("")) {
            checkAccountVerificationCode(event);
        }
    }

    const handlePasteVerificationCode = (word) => {
        if (word.length > 0) {
            for (let i = 0; i < 4; i++) {
                const currentCharacterInputField = document.getElementById(`field${i + 1}`);
                currentCharacterInputField.value = word[i];
                handleWritePartOfVerificationCode(word[i], i);
            }
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
        <div className="account-verification page">
            <Head>
                <title>{t(process.env.storeName)} - {t("Account Verification")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content">
                    <div className="container-fluid pb-5">
                        {!errorMsgOnLoading ? <>
                            <h1 className="welcome-msg border-bottom pb-3 mb-5 text-center text-white">{t("Welcome To You In Account Verification Page")}</h1>
                            <section className="verification p-4">
                                {errorMsg && <p className="alert alert-danger">{t(errorMsg)}</p>}
                                {successMsg && <p className="alert alert-success">{t(successMsg)}</p>}
                                {isWaitCheckingStatus && <div className="overlay d-flex align-items-center justify-content-center flex-column text-white">
                                    <span className="check-loader mb-4"></span>
                                    <h6>{t("Checking")} ....</h6>
                                </div>}
                                <div className="row">
                                    <div className="col-md-5">
                                        <h6 className="mb-3 fw-bold">{t("You're almost done!")}</h6>
                                    </div>
                                    <div className="col-md-7 text-xl-end">
                                        <h6 className="mb-3 fw-bold">
                                            {t("You can redial the message after")}
                                        </h6>
                                        <h6 className="mb-3 fw-bold">{minutes} : {seconds}</h6>
                                    </div>
                                </div>
                                <h6 className="mb-3 fw-bold">
                                    <span className="me-2">{t("We sent a launch code to")}</span>
                                    <span className="text-danger email-box">{email}</span>
                                </h6>
                                <h6 className="mb-3 fw-bold">
                                    <FaLongArrowAltRight className="me-2" />
                                    <span className="text-danger fw-bold">{t("Enter code Here")} *</span>
                                </h6>
                                <form className="code-write-form d-flex mb-4" onSubmit={checkAccountVerificationCode}>
                                    {
                                        ["field1", "field2", "field3", "field4"]
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
                                                    onPaste={(e) => handlePasteVerificationCode(e.clipboardData.getData("text"))}
                                                />
                                            ))
                                    }
                                    <input type="submit" hidden />
                                </form>
                                <div className="email-sent-manager-box pb-3">
                                    <span className="fw-bold">{t("Didn't get your email?")} </span>
                                    {!isWaitSendTheCode && !errorMsg && <button
                                        className="btn btn-danger me-2"
                                        onClick={resendTheCodeToEmail}
                                        disabled={seconds === 0 && minutes === 0 ? false : true}
                                    >
                                        {t("Resend The Code")}
                                    </button>}
                                    {isWaitSendTheCode && <button
                                        className="btn btn-danger me-2 global-button"
                                        disabled
                                    >
                                        {t("Resending The Code")} ...
                                    </button>}
                                </div>
                            </section>
                        </> : <section className="error-msg-on-loading d-flex justify-content-center align-items-center flex-column">
                            <main className="error-box p-4 text-center">
                                <MdOutlineErrorOutline className="error-icon mb-4" />
                                <p className="error-msg">{t(errorMsgOnLoading)}</p>
                            </main>
                        </section>}
                    </div>
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoading} />}
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