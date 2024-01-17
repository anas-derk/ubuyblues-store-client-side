import Head from "next/head";
import Header from "@/components/Header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BiSolidUser } from "react-icons/bi";
import { FiLogIn } from "react-icons/fi";
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import validations from "../../../public/global_functions/validations";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { signIn } from "next-auth/react";
import { useTranslation } from "react-i18next";

export default function UserAuth() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [appearedAuthPartName, setAppearedAuthPartName] = useState("login");

    const [emailForLogin, setEmailForLogin] = useState("");

    const [passwordForLogin, setPasswordForLogin] = useState("");

    const [isLoginingStatus, setIsLoginingStatus] = useState(false);

    const [emailForSignup, setEmailForSignup] = useState("");

    const [passwordForSignup, setPasswordForSignup] = useState("");

    const [isSignupStatus, setIsSignupStatus] = useState(false);

    const [errMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isVisiblePasswordForLogin, setIsVisiblePasswordForLogin] = useState(false);

    const [isVisiblePasswordForSignup, setIsVisiblePasswordForSignup] = useState(false);

    const { t } = useTranslation();

    const router = useRouter();

    useEffect(() => {
        const userId = localStorage.getItem("asfour-store-user-id");
        if (userId) {
            axios.get(`${process.env.BASE_API_URL}/users/user-info/${userId}`)
                .then((res) => {
                    const result = res.data;
                    if (result !== "Sorry, The User Is Not Exist !!, Please Enter Another User Id ..") {
                        router.push("/");
                    } else {
                        setIsLoadingPage(false);
                    }
                }).catch(() => {
                    setIsLoadingPage(false);
                    setIsErrorMsgOnLoadingThePage(true);
                });
        } else {
            setIsLoadingPage(false);
        }
    }, []);

    const userLogin = async (e) => {
        e.preventDefault();
        setFormValidationErrors({});
        setErrorMsg("");
        setSuccessMsg("");
        let errorsObject = validations.inputValuesValidation([
            {
                name: "emailForLogin",
                value: emailForLogin,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                    isEmail: {
                        msg: "Sorry, This Email Is Not Valid !!",
                    }
                },
            },
            {
                name: "passwordForLogin",
                value: passwordForLogin,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
        ]);
        setFormValidationErrors(errorsObject);
        if (Object.keys(errorsObject).length == 0) {
            setIsLoginingStatus(true);
            try {
                const res = await axios.get(`${process.env.BASE_API_URL}/users/login?email=${emailForLogin}&password=${passwordForLogin}`);
                const result = await res.data;
                if (result === "Sorry, Email Or Password Incorrect !!") {
                    setIsLoginingStatus(false);
                    setErrorMsg(result);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 5000);
                } else {
                    if (result.isVerified) {
                        localStorage.setItem("asfour-store-user-id", result._id);
                        router.push("/");
                    } else router.push(`/account-verification?email=${result.email}`);
                }
            } catch (err) {
                setIsLoginingStatus(false);
                setErrorMsg("Sorry, Someting Went Wrong, Please Try Again The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 5000);
            }
        }
    }

    const userSignup = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setFormValidationErrors({});
        let errorsObject = validations.inputValuesValidation([
            {
                name: "emailForSignup",
                value: emailForSignup,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                    isEmail: {
                        msg: "Sorry, This Email Is Not Valid !!",
                    }
                },
            },
            {
                name: "passwordForSignup",
                value: passwordForSignup,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                    isValidPassword: {
                        msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter."
                    },
                },
            },
        ]);
        setFormValidationErrors(errorsObject);
        if (Object.keys(errorsObject).length == 0) {
            setIsSignupStatus(true);
            try {
                const res = await axios.post(`${process.env.BASE_API_URL}/users/create-new-user`, {
                    email: emailForSignup,
                    password: passwordForSignup,
                });
                const result = await res.data;
                setIsSignupStatus(false);
                if (result === "Sorry, Can't Create User Because it is Exist !!!") {
                    setErrorMsg(result);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 2000);
                } else {
                    setSuccessMsg(`${result}, Please Wait To Navigate To Verification Page !!`);
                    let successTimeout = setTimeout(() => {
                        router.push(`/account-verification?email=${emailForSignup}`);
                        clearTimeout(successTimeout);
                    }, 6000);
                }
            } catch (err) {
                setErrorMsg("Sorry, Someting Went Wrong, Please Try Again The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 2000);
            }
        }
    }

    return (
        <div className="auth d-flex flex-column justify-content-center">
            <Head>
                <title>Ubuyblues Store - User Auth</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content text-white p-4 text-center">
                    <div className="container-fluid">
                        <section className="auth-part-display-control mb-5">
                            <h4
                                className="m-0 display-login-btn display-btn p-3"
                                onClick={() => setAppearedAuthPartName("login")}
                            >
                                {t("login")}
                            </h4>
                            <h4
                                className="m-0 display-signup-btn display-btn p-3"
                                onClick={() => setAppearedAuthPartName("sign-up")}
                            >
                                Sign-up
                            </h4>
                        </section>
                        <section className="authentication">
                            <div className="row">
                                {appearedAuthPartName === "sign-up" && <div className="col-md-12">
                                    <div className="signup-section">
                                        <h3 className="part-name mb-4">Create New Account</h3>
                                        <form className="user-signup-form mb-3" onSubmit={userSignup}>
                                            <div className="email-field-box">
                                                <input
                                                    type="text"
                                                    placeholder="Please Enter Your Email"
                                                    className={`form-control p-3 border-2 ${formValidationErrors["emailForSignup"] ? "border-danger mb-3" : "mb-5"}`}
                                                    onChange={(e) => setEmailForSignup(e.target.value.trim())}
                                                />
                                                <div className='icon-box text-dark'>
                                                    <BiSolidUser className="icon" />
                                                </div>
                                            </div>
                                            {formValidationErrors["emailForSignup"] && <p className='error-msg text-white bg-danger p-2 mb-4'>{formValidationErrors["emailForSignup"]}</p>}
                                            <div className="password-field-box">
                                                <input
                                                    type={isVisiblePasswordForSignup ? "text" : "password"}
                                                    placeholder="Please Enter Your Password"
                                                    className={`form-control p-3 border-2 ${formValidationErrors["passwordForSignup"] ? "border-danger mb-3" : "mb-5"}`}
                                                    onChange={(e) => setPasswordForSignup(e.target.value.trim())}
                                                />
                                                <div className='icon-box text-dark'>
                                                    {!isVisiblePasswordForSignup && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisiblePasswordForSignup(value => value = !value)} />}
                                                    {isVisiblePasswordForSignup && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisiblePasswordForSignup(value => value = !value)} />}
                                                </div>
                                            </div>
                                            {formValidationErrors["passwordForSignup"] && <p className='error-msg text-white bg-danger p-2 mb-4'>{formValidationErrors["passwordForSignup"]}</p>}
                                            {!isSignupStatus && !errMsg && !successMsg && <button type="submit" className="btn btn-success w-100 mb-4 p-3">
                                                <span className="me-2">Signup</span>
                                                <FiLogIn />
                                            </button>}
                                            {isSignupStatus && <button disabled className="btn btn-primary w-100 mb-4 p-3">
                                                <span className="me-2">Wait Signup ...</span>
                                            </button>}
                                            {(errMsg || successMsg) && <p className={`text-center text-white text-start mb-5 p-3 alert ${errMsg ? "alert-danger bg-danger" : ""} ${successMsg ? "alert-success bg-success" : ""}`}>{errMsg || successMsg}</p>}
                                        </form>
                                    </div>
                                </div>}
                                {appearedAuthPartName === "login" && <div className="col-md-12">
                                    <div className="login-section">
                                        <h3 className="part-name mb-4">Login</h3>
                                        <form className="user-login-form mb-3" onSubmit={userLogin}>
                                            <div className="email-field-box">
                                                <input
                                                    type="text"
                                                    placeholder="Please Enter Your Email"
                                                    className={`form-control p-3 border-2 ${formValidationErrors["emailForLogin"] ? "border-danger mb-4" : "mb-5"}`}
                                                    onChange={(e) => setEmailForLogin(e.target.value.trim())}
                                                />
                                                <div className='icon-box text-dark'>
                                                    <BiSolidUser className="icon" />
                                                </div>
                                            </div>
                                            {formValidationErrors["emailForLogin"] && <p className='error-msg text-white bg-danger p-2 mb-4'>{formValidationErrors["emailForLogin"]}</p>}
                                            <div className="password-field-box">
                                                <input
                                                    type={isVisiblePasswordForLogin ? "text" : "password"}
                                                    placeholder="Please Enter Your Password"
                                                    className={`form-control p-3 border-2 ${formValidationErrors["passwordForLogin"] ? "border-danger mb-4" : "mb-5"}`}
                                                    onChange={(e) => setPasswordForLogin(e.target.value.trim())}
                                                />
                                                <div className='icon-box text-dark'>
                                                    {!isVisiblePasswordForLogin && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisiblePasswordForLogin(value => value = !value)} />}
                                                    {isVisiblePasswordForLogin && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisiblePasswordForLogin(value => value = !value)} />}
                                                </div>
                                            </div>
                                            {formValidationErrors["passwordForLogin"] && <p className='error-msg text-white bg-danger p-2 mb-4'>{formValidationErrors["passwordForLogin"]}</p>}
                                            {!isLoginingStatus && !errMsg && !successMsg && <button type="submit" className="btn btn-success w-100 mb-4 p-3">
                                                <span className="me-2">Login</span>
                                                <FiLogIn />
                                            </button>}
                                            {isLoginingStatus && <button disabled className="btn btn-primary w-100 mb-4 p-3">
                                                <span className="me-2">Wait Logining ...</span>
                                            </button>}
                                            {(errMsg || successMsg) && <p className={`text-center text-white text-start mb-5 p-3 alert ${errMsg ? "alert-danger bg-danger" : ""} ${successMsg ? "alert-success bg-success" : ""}`}>{errMsg || successMsg}</p>}
                                            <h6 className="fw-bold mb-4">Or Sign In With</h6>
                                            <ul className="external-auth-sites-list">
                                                <li className="external-auth-site-item" onClick={() => signIn("google")}>
                                                    <FaGoogle className="external-auth-site-icon" />
                                                </li>
                                                <li className="external-auth-site-item" onClick={() => signIn("facebook")}>
                                                    <FaFacebook className="external-auth-site-icon" />
                                                </li>
                                                {/* <li className="external-auth-site-item">
                                                    <FaApple className="external-auth-site-icon" />
                                                </li> */}
                                            </ul>
                                        </form>
                                    </div>
                                </div>}
                            </div>
                        </section>
                    </div>
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}