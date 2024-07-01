import Head from "next/head";
import Header from "@/components/Header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LoaderPage from "@/components/LoaderPage";
import { BiSolidUser } from "react-icons/bi";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaCode } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axios from "axios";
import { inputValuesValidation } from "../../../public/global_functions/validations";
import { getUserInfo } from "../../../public/global_functions/popular";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";

export default function ForgetPassword({ userTypeAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    const [isResetingPasswordStatus, setIsResetingPasswordStatus] = useState(false);

    const [userType, setUserType] = useState("");

    const [email, setEmail] = useState("");

    const [errMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isDisplayResetPasswordForm, setIsDisplayResetPasswordForm] = useState(false);

    const [typedUserCode, setTypedUser] = useState(false);

    const [newPassword, setNewPassword] = useState("");

    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [isVisibleNewPassword, setIsVisibleNewPassword] = useState(false);

    const [isVisibleConfirmNewPassword, setIsVisibleConfirmNewPassword] = useState(false);

    const { t, i18n } = useTranslation();

    const router = useRouter();

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        const userLanguage = localStorage.getItem("asfour-store-language");
        if (userToken) {
            getUserInfo()
                .then(async (res) => {
                    const result = res.data;
                    if (!result.error) {
                        await router.replace("/");
                    } else {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
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

    const handleSelectUserType = (userType) => {
        setUserType(userType);
        router.replace(`/forget-password?userType=${userType}`);
    }

    const forgetPassword = async (e) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            setErrorMsg("");
            setSuccessMsg("");
            const errorsObject = inputValuesValidation([
                {
                    name: "userType",
                    value: userType,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
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
                const res = await axios.get(`${process.env.BASE_API_URL}/users/forget-password?email=${email}&userType=${userType}`);
                const result = res.data;
                if (result.error) {
                    setIsCheckingStatus(false);
                    setErrorMsg(result.msg);
                    if (result.msg === "Sorry, The Email For This User Is Not Verified !!") {
                        let errorTimeout = setTimeout(async () => {
                            await router.push(`/account-verification?email=${email}`);
                            clearTimeout(errorTimeout);
                        }, 5000);
                    }
                    else {
                        let errorTimeout = setTimeout(async () => {
                            setErrorMsg("");
                            clearTimeout(errorTimeout);
                        }, 5000);
                    }
                } else {
                    setIsDisplayResetPasswordForm(true);
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
            const errorsObject = inputValuesValidation([
                {
                    name: "typedUserCode",
                    value: typedUserCode,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
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
                const res = await axios.put(`${process.env.BASE_API_URL}/users/reset-password?email=${email}&code=${typedUserCode}&newPassword=${newPassword}&userType=${userType}`);
                const result = res.data;
                setIsResetingPasswordStatus(false);
                if (!result.error) {
                    if (userTypeAsProperty === "user") {
                        setSuccessMsg(`${result.msg}, Please Wait To Navigate To Login Page !!`);
                        let successTimeout = setTimeout(async () => {
                            await router.push("/auth");
                            clearTimeout(successTimeout);
                        }, 6000);
                    } else {
                        setSuccessMsg(result.msg);
                        let successTimeout = setTimeout(async () => {
                            setSuccessMsg("");
                            clearTimeout(successTimeout);
                        }, 6000);
                    }
                } else {
                    setErrorMsg(result.msg);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 5000);
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
        <div className="forget-password page d-flex flex-column justify-content-center align-items-center">
            <Head>
                <title>{t("Ubuyblues Store")} - {t("Forget Password")}</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content text-white ps-4 pe-4 text-center">
                    <div className="container-fluid">
                        <h1 className="h3 mb-5 fw-bold text-center">{t("Welcome To You In Forget Password Page")}</h1>
                        {!isDisplayResetPasswordForm && <form className="user-forget-form mb-3" onSubmit={forgetPassword}>
                            <div className="select-user-type-field-box">
                                <select
                                    className={`select-user-type form-select p-3 border-2 ${i18n.language === "ar" ? "ar" : ""} ${formValidationErrors["userType"] ? "border-danger mb-3" : "mb-5"}`}
                                    onChange={(e) => handleSelectUserType(e.target.value)}
                                >
                                    <option value="" hidden>{t("Pleae Select User Type")}</option>
                                    <option value="user">{t("Normal User")}</option>
                                    <option value="admin">{t("Admin")}</option>
                                </select>
                            </div>
                            {formValidationErrors["userType"] && <p className='error-msg text-white bg-danger p-2 mb-4'>{t(formValidationErrors["userType"])}</p>}
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
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}

export async function getServerSideProps({ query }) {
    const allowedUserTypes = ["user", "admin"];
    if (query.userType) {
        if (!allowedUserTypes.includes(query.userType)) {
            return {
                redirect: {
                    permanent: false,
                    destination: `/forget-password?userType=user`,
                },
                props: {
                    userTypeAsProperty: query.userType,
                },
            }
        }
        if (Object.keys(query).filter((key) => key !== "userType").length > 1) {
            return {
                redirect: {
                    permanent: false,
                    destination: `/?userType=${query.userType}`,
                },
                props: {
                    userTypeAsProperty: query.userType,
                },
            }
        }
        return {
            props: {
                userTypeAsProperty: query.userType,
            },
        }
    }
    return {
        redirect: {
            permanent: false,
            destination: `/forget-password?userType=user`,
        },
        props: {
            userTypeAsProperty: query.userType,
        },
    }
}