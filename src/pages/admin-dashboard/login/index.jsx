import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import ubuybluesLogo from "../../../../public/images/UbuyBlues_Logo_merged_Purple.jpg";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BiSolidUser } from "react-icons/bi";
import { FiLogIn } from "react-icons/fi";
import validations from "../../../../public/global_functions/validations";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";

export default function AdminLogin() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [isLoginingStatus, setIsLoginingStatus] = useState(false);

    const [errMsg, setErrorMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isVisiblePassword, setIsVisiblePassword] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const userToken = localStorage.getItem("asfour-store-admin-user-token");
        if (userToken) {
            axios.get(`${process.env.BASE_API_URL}/admins/user-info`, {
                headers: {
                    "Authorization": userToken,
                },
            })
                .then(async (res) => {
                    const result = res.data;
                    if (result.error) {
                        await router.push("/admin-dashboard");
                    } else {
                        localStorage.removeItem("asfour-store-admin-user-id");
                        setIsLoadingPage(false);
                    }
                }).catch(() => {
                    setIsLoadingPage(false);
                    setIsErrorMsgOnLoadingThePage(true);
                });
        } else setIsLoadingPage(false);
    }, []);

    const validateFormFields = () => {
        return validations.inputValuesValidation([
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
    }

    const adminLogin = async (e) => {
        e.preventDefault();
        setFormValidationErrors({});
        let errorsObject = validateFormFields();
        setFormValidationErrors(errorsObject);
        if (Object.keys(errorsObject).length == 0) {
            setIsLoginingStatus(true);
            try {
                const res = await axios.get(`${process.env.BASE_API_URL}/admins/login?email=${email}&password=${password}`);
                const result = await res.data;
                console.log(result)
                if (result.error) {
                    setIsLoginingStatus(false);
                    setErrorMsg(result.msg);
                    setTimeout(() => {
                        setErrorMsg("");
                    }, 3000);
                } else {
                    localStorage.setItem("asfour-store-admin-user-token", result.data.token);
                    await router.push("/admin-dashboard");
                }
            } catch (err) {
                setIsLoginingStatus(false);
                setErrorMsg("Sorry, Someting Went Wrong, Please Try Again The Process !!");
                setTimeout(() => {
                    setErrorMsg("");
                }, 3000);
            }
        }
    }

    return (
        <div className="admin-login d-flex flex-column justify-content-center">
            <Head>
                <title>Ubuyblues Store - Admin Dashboard Login</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <div className="page-content text-center w-50 mx-auto">
                <div className="container p-4">
                    <img src={ubuybluesLogo.src} alt="logo" width="200" height="200" className="mb-5" />
                    <form className="admin-login-form mb-3" onSubmit={adminLogin}>
                        <div className="email-field-box">
                            <input
                                type="text"
                                placeholder="Please Enter Your Email"
                                className={`form-control p-3 border-2 ${formValidationErrors["email"] ? "border-danger mb-2" : "mb-4"}`}
                                onChange={(e) => setEmail(e.target.value.trim())}
                            />
                            <div className='icon-box other-languages-mode'>
                                <BiSolidUser className="icon" />
                            </div>
                        </div>
                        {formValidationErrors["email"] && <p className='error-msg text-danger'>{formValidationErrors["email"]}</p>}
                        <div className="password-field-box">
                            <input
                                type={isVisiblePassword ? "text" : "password"}
                                placeholder="Please Enter Your Password"
                                className={`form-control p-3 border-2 ${formValidationErrors["password"] ? "border-danger mb-2" : "mb-4"}`}
                                onChange={(e) => setPassword(e.target.value.trim())}
                            />
                            <div className='icon-box other-languages-mode'>
                                {!isVisiblePassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisiblePassword(value => value = !value)} />}
                                {isVisiblePassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisiblePassword(value => value = !value)} />}
                            </div>
                        </div>
                        {formValidationErrors["password"] && <p className='error-msg text-danger'>{formValidationErrors["password"]}</p>}
                        {!isLoginingStatus && !errMsg && <button type="submit" className="btn btn-success mx-auto d-block mb-4 p-3">
                            <span className="me-2">Login</span>
                            <FiLogIn />
                        </button>}
                        {isLoginingStatus && <button disabled className="btn btn-primary mx-auto d-block mb-4">
                            <span className="me-2">Wait Logining ...</span>
                        </button>}
                        {errMsg && <button disabled className="btn btn-danger mx-auto d-block mb-4">
                            <span className="me-2">{errMsg}</span>
                            <FiLogIn />
                        </button>}
                    </form>
                </div>
            </div>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}