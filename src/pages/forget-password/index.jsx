import Head from "next/head";
import Header from "@/components/Header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LoaderPage from "@/components/LoaderPage";
import validations from "../../../public/global_functions/validations";
import { BiSolidUser } from "react-icons/bi";
import { RiLockPasswordLine } from "react-icons/ri";
import axios from "axios";

export default function ForgetPassword() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    const [email, setEmail] = useState("");

    const [errMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isDisplayResetPasswordForm, setIsDisplayResetPasswordForm] = useState(false);

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

    const forgetPassword = async (e) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            setErrorMsg("");
            setSuccessMsg("");
            let errorsObject = validations.inputValuesValidation([
                {
                    name: "email",
                    value: email,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isEmail: {
                            msg: "Sorry, This Email Is Not Valid !!",
                        }
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsCheckingStatus(true);
                const res = await axios.get(`${process.env.BASE_API_URL}/users/forget-password?email=${email}`);
                const result = await res.data;
                console.log(result);
                if (result === "Sorry, This Email Is Not Exist !!") {
                    setIsCheckingStatus(false);
                    setErrorMsg(result);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 5000);
                } else {
                    if (result.isVerified) {
                        setIsDisplayResetPasswordForm(true);
                    } else router.push(`/account-verification?email=${email}`);
                }
            }
        }
        catch (err) {
            setIsCheckingStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Try Again The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 5000);
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
                        {!isDisplayResetPasswordForm && <form className="user-forget-form mb-3" onSubmit={forgetPassword}>
                            <div className="email-field-box">
                                <input
                                    type="text"
                                    placeholder={t("Please Enter Your Email")}
                                    className={`form-control p-3 border-2 ${formValidationErrors["email"] ? "border-danger mb-3" : "mb-5"}`}
                                    onChange={(e) => setEmail(e.target.value.trim())}
                                />
                                <div className={`icon-box text-dark ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                    <BiSolidUser className="icon" />
                                </div>
                            </div>
                            {formValidationErrors["email"] && <p className='error-msg text-white bg-danger p-2 mb-4'>{t(formValidationErrors["email"])}</p>}
                            {!isCheckingStatus && !errMsg && !successMsg && <button type="submit" className="btn btn-success w-100 mb-4 p-3">
                                {i18n.language === "ar" && <RiLockPasswordLine />}
                                <span className="me-2">{t("Forget Password")}</span>
                                {i18n.language !== "ar" && <RiLockPasswordLine />}
                            </button>}
                            {isCheckingStatus && <button disabled className="btn btn-primary w-100 mb-4 p-3">
                                <span className="me-2">{t("Wait Checking")} ...</span>
                            </button>}
                            {(errMsg || successMsg) && <p className={`text-center text-white text-start mb-5 p-3 alert ${errMsg ? "alert-danger bg-danger" : ""} ${successMsg ? "alert-success bg-success" : ""}`}>{t(errMsg || successMsg)}</p>}
                        </form>}
                    </div>
                </div>
            </>}
            {isLoadingPage && <LoaderPage />}
        </div>
    )
}