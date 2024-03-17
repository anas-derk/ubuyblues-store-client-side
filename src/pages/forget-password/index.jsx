import Head from "next/head";
import Header from "@/components/Header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LoaderPage from "@/components/LoaderPage";
import validations from "../../../public/global_functions/validations";
import { BiSolidUser } from "react-icons/bi";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaCode } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axios from "axios";

export default function ForgetPassword() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    const [isResetingPasswordStatus, setIsResetingPasswordStatus] = useState(false);

    const [email, setEmail] = useState("");

    const [errMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isDisplayResetPasswordForm, setIsDisplayResetPasswordForm] = useState(false);

    const [code, setCode] = useState("");

    const [userId, setUserId] = useState("");

    const [typedUserCode, setTypedUser] = useState(false);

    const [newPassword, setNewPassword] = useState("");

    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [isVisibleNewPassword, setIsVisibleNewPassword] = useState(false);

    const [isVisibleConfirmNewPassword, setIsVisibleConfirmNewPassword] = useState(false);

    const { t, i18n } = useTranslation();

    const router = useRouter();

    useEffect(() => {
        const userToken = localStorage.getItem("asfour-store-user-token");
        const userLanguage = localStorage.getItem("asfour-store-language");
        if (userToken) {
            validations.getUserInfo(userToken)
                .then(async (res) => {
                    const result = res.data;
                    if (!result.error) {
                        await router.push("/");
                    } else {
                        localStorage.removeItem("asfour-store-user-token");
                        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
                        setIsLoadingPage(false);
                    }
                }).catch(() => {
                    handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
                    setIsLoadingPage(false);
                    setIsErrorMsgOnLoadingThePage(true);
                });
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
                if (result.error) {
                    setIsCheckingStatus(false);
                    setErrorMsg(result.msg);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 5000);
                } else {
                    if (result.data.isVerified) {
                        setCode(result.data.code);
                        setUserId(result.data._id);
                        setIsDisplayResetPasswordForm(true);
                    } else await router.push(`/account-verification?email=${email}`);
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

    const resetPassword = async (e) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            setErrorMsg("");
            setSuccessMsg("");
            let errorsObject = validations.inputValuesValidation([
                {
                    name: "typedUserCode",
                    value: typedUserCode,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isMatch: {
                            value: code,
                            msg: "Sorry, This Code Is Not Valid !!",
                        },
                    },
                },
                {
                    name: "newPassword",
                    value: newPassword,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isValidPassword: {
                            msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter."
                        },
                    },
                },
                {
                    name: "confirmNewPassword",
                    value: confirmNewPassword,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isValidPassword: {
                            msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter."
                        },
                        isMatch: {
                            value: confirmNewPassword,
                            msg: "Sorry, There Is No Match Between New Password And Confirm It !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsResetingPasswordStatus(true);
                const res = await axios.put(`${process.env.BASE_API_URL}/users/reset-password/${userId}?newPassword=${newPassword}`);
                const result = await res.data;
                if(!result.error) {
                    setSuccessMsg(`${result.msg}, Please Wait To Navigate To Login Page !!`);
                    let successTimeout = setTimeout(async () => {
                        await router.push(`/auth`);
                        clearTimeout(successTimeout);
                    }, 6000);
                }
            }
        }
        catch (err) {
            setIsResetingPasswordStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Try Again The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 5000);
        }
    }

    return (
        <div className="forget-password page">
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
                        {isDisplayResetPasswordForm && <form className="user-reset-form mb-3" onSubmit={resetPassword}>
                            <div className="code-field-box">
                                <input
                                    type="text"
                                    placeholder={t("Please Enter The Code Here")}
                                    className={`form-control p-3 border-2 ${formValidationErrors["typedUserCode"] ? "border-danger mb-3" : "mb-5"}`}
                                    onChange={(e) => setTypedUser(e.target.value.trim())}
                                />
                                <div className={`icon-box text-dark ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                    <FaCode className="icon" />
                                </div>
                            </div>
                            {formValidationErrors["typedUserCode"] && <p className='error-msg text-white bg-danger p-2 mb-4'>{t(formValidationErrors["typedUserCode"])}</p>}
                            <div className="new-password-field-box">
                                <input
                                    type={isVisibleNewPassword ? "text" : "password"}
                                    placeholder={t("Please Enter New Password Here")}
                                    className={`form-control p-3 border-2 ${formValidationErrors["newPassword"] ? "border-danger mb-3" : "mb-5"}`}
                                    onChange={(e) => setNewPassword(e.target.value.trim())}
                                />
                                <div className={`icon-box text-dark ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                    {!isVisibleNewPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleNewPassword(value => value = !value)} />}
                                    {isVisibleNewPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleNewPassword(value => value = !value)} />}
                                </div>
                            </div>
                            {formValidationErrors["newPassword"] && <p className='error-msg text-white bg-danger p-2 mb-4'>{t(formValidationErrors["newPassword"])}</p>}
                            <div className="confirm-new-password-field-box">
                                <input
                                    type={isVisibleConfirmNewPassword ? "text" : "password"}
                                    placeholder={t("Please Enter Confirm New Password Here")}
                                    className={`form-control p-3 border-2 ${formValidationErrors["confirmNewPassword"] ? "border-danger mb-3" : "mb-5"}`}
                                    onChange={(e) => setConfirmNewPassword(e.target.value.trim())}
                                />
                                <div className={`icon-box text-dark ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                    {!isVisibleConfirmNewPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleConfirmNewPassword(value => value = !value)} />}
                                    {isVisibleConfirmNewPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleConfirmNewPassword(value => value = !value)} />}
                                </div>
                            </div>
                            {formValidationErrors["confirmNewPassword"] && <p className='error-msg text-white bg-danger p-2 mb-4'>{t(formValidationErrors["confirmNewPassword"])}</p>}
                            {!isResetingPasswordStatus && !errMsg && !successMsg && <button type="submit" className="btn btn-success w-100 mb-4 p-3">
                                {i18n.language === "ar" && <RiLockPasswordLine />}
                                <span className="me-2">{t("Reset Password")}</span>
                                {i18n.language !== "ar" && <RiLockPasswordLine />}
                            </button>}
                            {isResetingPasswordStatus && <button disabled className="btn btn-primary w-100 mb-4 p-3">
                                <span className="me-2">{t("Wait Reseting")} ...</span>
                            </button>}
                            {(errMsg || successMsg) && <p className={`text-center text-white text-start mb-5 p-3 alert ${errMsg ? "alert-danger bg-danger" : ""} ${successMsg ? "alert-success bg-success" : ""}`}>{t(errMsg || successMsg)}</p>}
                        </form>}
                    </div>
                </div>
            </>}
            {isLoadingPage && <LoaderPage />}
        </div>
    );
}