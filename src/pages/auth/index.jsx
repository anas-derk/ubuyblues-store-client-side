import Head from "next/head";
import Header from "@/components/Header";
import { useRouter } from "next/router";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BiSolidUser } from "react-icons/bi";
import { FiLogIn } from "react-icons/fi";
import validations from "../../../public/global_functions/validations";
import Axios from "axios";

export default function UserLogin() {

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [isLoginingStatus, setIsLoginingStatus] = useState(false);

    const [errMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isVisiblePassword, setIsVisiblePassword] = useState(false);

    const router = useRouter();

    const userLogin = async (e) => {
        e.preventDefault();
        setFormValidationErrors({});
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
            {
                name: "password",
                value: password,
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
                const res = await Axios.get(`${process.env.BASE_API_URL}/admin/login?email=${email}&password=${password}`);
                const data = await res.data;
                if (typeof data === "string") {
                    setIsLoginingStatus(false);
                    setErrorMsg(data);
                    setTimeout(() => {
                        setErrorMsg("");
                    }, 2000);
                } else {
                    localStorage.setItem("asfour-admin-user-id", data._id);
                    router.push("/admin-dashboard");
                }
            } catch (err) {
                console.log(err);
                setErrorMsg("Sorry, Someting Went Wrong, Please Try Again The Process !!");
            }
        }
    }

    const userSignup = async (e) => {
        e.preventDefault();
        setFormValidationErrors({});
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
            {
                name: "password",
                value: password,
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
                const res = await Axios.get(`${process.env.BASE_API_URL}/admin/login?email=${email}&password=${password}`);
                const data = await res.data;
                if (typeof data === "string") {
                    setIsLoginingStatus(false);
                    setErrorMsg(data);
                    setTimeout(() => {
                        setErrorMsg("");
                    }, 2000);
                } else {
                    localStorage.setItem("asfour-admin-user-id", data._id);
                    router.push("/admin-dashboard");
                }
            } catch (err) {
                console.log(err);
                setErrorMsg("Sorry, Someting Went Wrong, Please Try Again The Process !!");
            }
        }
    }

    return (
        <div className="auth d-flex flex-column justify-content-center">
            <Head>
                <title>Asfour Store - User Auth</title>
            </Head>
            <Header />
            <div className="page-content text-white p-4 text-center">
                <div className="container-fluid">
                    {(errMsg || successMsg) && <p className={`result-auth-msg text-start mb-5 p-3 alert ${errMsg ? "alert-danger" : ""} ${successMsg ? "alert-success" : ""}`}>aa</p>}
                    <div className="row">
                        <div className="col-md-6">
                            <div className="signup-section ps-5">
                                <h3 className="part-name mb-4">Create New Account</h3>
                                <form className="user-signup-form mb-3" onSubmit={userSignup}>
                                    <div className="email-field-box">
                                        <input
                                            type="text"
                                            placeholder="Please Enter Your Email"
                                            className={`form-control p-3 border-2 ${formValidationErrors["email"] ? "border-danger mb-2" : "mb-5"}`}
                                            onChange={(e) => setEmail(e.target.value.trim())}
                                        />
                                        <div className='icon-box text-dark'>
                                            <BiSolidUser className="icon" />
                                        </div>
                                    </div>
                                    {formValidationErrors["email"] && <p className='error-msg text-danger'>{formValidationErrors["email"]}</p>}
                                    <div className="password-field-box">
                                        <input
                                            type={isVisiblePassword ? "text" : "password"}
                                            placeholder="Please Enter Your Password"
                                            className={`form-control p-3 border-2 ${formValidationErrors["password"] ? "border-danger mb-2" : "mb-5"}`}
                                            onChange={(e) => setPassword(e.target.value.trim())}
                                        />
                                        <div className='icon-box text-dark'>
                                            {!isVisiblePassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisiblePassword(value => value = !value)} />}
                                            {isVisiblePassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisiblePassword(value => value = !value)} />}
                                        </div>
                                    </div>
                                    {formValidationErrors["password"] && <p className='error-msg text-danger'>{formValidationErrors["password"]}</p>}
                                    {!isLoginingStatus && !errMsg && <button type="submit" className="btn btn-success w-100 mb-4 p-3">
                                        <span className="me-2">Signup</span>
                                        <FiLogIn />
                                    </button>}
                                    {isLoginingStatus && <button disabled className="btn btn-primary w-100 mb-4">
                                        <span className="me-2">Wait Signup ...</span>
                                    </button>}
                                    {errMsg && <button disabled className="btn btn-danger w-100 mb-4">
                                        <span className="me-2">{errMsg}</span>
                                        <FiLogIn />
                                    </button>}
                                </form>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="login-section ps-5">
                                <h3 className="part-name mb-4">Login</h3>
                                <form className="user-login-form mb-3" onSubmit={userLogin}>
                                    <div className="email-field-box">
                                        <input
                                            type="text"
                                            placeholder="Please Enter Your Email"
                                            className={`form-control p-3 border-2 ${formValidationErrors["email"] ? "border-danger mb-2" : "mb-5"}`}
                                            onChange={(e) => setEmail(e.target.value.trim())}
                                        />
                                        <div className='icon-box text-dark'>
                                            <BiSolidUser className="icon" />
                                        </div>
                                    </div>
                                    {formValidationErrors["email"] && <p className='error-msg text-danger'>{formValidationErrors["email"]}</p>}
                                    <div className="password-field-box">
                                        <input
                                            type={isVisiblePassword ? "text" : "password"}
                                            placeholder="Please Enter Your Password"
                                            className={`form-control p-3 border-2 ${formValidationErrors["password"] ? "border-danger mb-2" : "mb-5"}`}
                                            onChange={(e) => setPassword(e.target.value.trim())}
                                        />
                                        <div className='icon-box text-dark'>
                                            {!isVisiblePassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisiblePassword(value => value = !value)} />}
                                            {isVisiblePassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisiblePassword(value => value = !value)} />}
                                        </div>
                                    </div>
                                    {formValidationErrors["password"] && <p className='error-msg text-danger'>{formValidationErrors["password"]}</p>}
                                    {!isLoginingStatus && !errMsg && <button type="submit" className="btn btn-success w-100 mb-4 p-3">
                                        <span className="me-2">Login</span>
                                        <FiLogIn />
                                    </button>}
                                    {isLoginingStatus && <button disabled className="btn btn-primary w-100 mb-4">
                                        <span className="me-2">Wait Loging ...</span>
                                    </button>}
                                    {errMsg && <button disabled className="btn btn-danger w-100 mb-4">
                                        <span className="me-2">{errMsg}</span>
                                        <FiLogIn />
                                    </button>}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}