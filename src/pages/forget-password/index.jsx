import Head from "next/head";
import Header from "@/components/Header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LoaderPage from "@/components/LoaderPage";
import validations from "../../../public/global_functions/validations";
import { BiSolidUser } from "react-icons/bi";
import { FiLogIn } from "react-icons/fi";

export default function ForgetPassword() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    const [errMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const { t, i18n } = useTranslation();

    const router = useRouter();

    useEffect(() => {
        const userId = localStorage.getItem("asfour-store-user-id");
        const userLanguage = localStorage.getItem("asfour-store-language");
        if (userId) {
            router.push("/");
        } else {
            handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
            setIsLoadingPage(false);
        }
    }, []);

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    const forgetPassword = (e) => {
        try{
            e.preventDefault();
        }
        catch(err) {

        }
    }

    return (
        <div className="forget-password">
            <Head>
                <title>Ubuyblues Store - Forget Password</title>
            </Head>
            {!isLoadingPage && <>
                <Header />
                <div className="page-content text-white p-4 text-center">
                    <div className="container-fluid">
                        <h1 className="h3 mb-5 fw-bold text-center">{t("Welcome To You In Forget Password Page")}</h1>
                        <form className="user-signup-form mb-3" onSubmit={forgetPassword}>
                            <div className="email-field-box">
                                <input
                                    type="text"
                                    placeholder={t("Please Enter Your Email")}
                                    className={`form-control p-3 border-2 ${formValidationErrors["emailForSignup"] ? "border-danger mb-3" : "mb-5"}`}
                                    onChange={(e) => setEmailForSignup(e.target.value.trim())}
                                />
                                <div className={`icon-box text-dark ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                    <BiSolidUser className="icon" />
                                </div>
                            </div>
                            {!isCheckingStatus && !errMsg && !successMsg && <button type="submit" className="btn btn-success w-100 mb-4 p-3">
                                {i18n.language === "ar" && <FiLogIn />}
                                <span className="me-2">{t("Forget Password")}</span>
                                {i18n.language !== "ar" && <FiLogIn />}
                            </button>}
                            {isCheckingStatus && <button disabled className="btn btn-primary w-100 mb-4 p-3">
                                <span className="me-2">{t("Wait Checking")} ...</span>
                            </button>}
                            {(errMsg || successMsg) && <p className={`text-center text-white text-start mb-5 p-3 alert ${errMsg ? "alert-danger bg-danger" : ""} ${successMsg ? "alert-success bg-success" : ""}`}>{t(errMsg || successMsg)}</p>}
                        </form>
                    </div>
                </div>
            </>}
            {isLoadingPage && <LoaderPage />}
        </div>
    )
}