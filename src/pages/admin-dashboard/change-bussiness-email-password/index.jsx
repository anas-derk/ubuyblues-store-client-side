import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useState, useEffect } from "react";
import axios from "axios";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import validations from "../../../../public/global_functions/validations";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { HiOutlineBellAlert } from "react-icons/hi2";

export default function ChangeBussinessEmailPassword() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [email, setEmail] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");

    const [newPassword, setNewPassword] = useState("");

    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [isVisibleCurrentPassword, setIsVisibleCurrentPassword] = useState(false);

    const [isVisibleNewPassword, setIsVisibleNewPassword] = useState(false);

    const [isVisibleConfirmNewPassword, setIsVisibleConfirmNewPassword] = useState(false);

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    useEffect(() => {
        const adminToken = localStorage.getItem("asfour-store-admin-user-token");
        if (adminToken) {
            validations.getAdminInfo(adminToken)
                .then(async (res) => {
                    const result = res.data;
                    if (result.error) {
                        localStorage.removeItem("asfour-store-admin-user-token");
                        await router.push("/admin-dashboard/login");
                    } else setIsLoadingPage(false);
                })
                .catch(async (err) => {
                    if (err.response.data?.msg === "jwt expired") {
                        localStorage.removeItem("asfour-store-admin-user-token");
                        await router.push("/admin-dashboard/login");
                    }
                    else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else router.push("/admin-dashboard/login");
    }, []);

    const validateFormFields = () => {
        let errorsObject = validations.inputValuesValidation([
            {
                name: "email",
                value: email,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                    isEmail: {
                        msg: "Sorry, Invalid Email !!",
                    },
                },
            },
            {
                name: "currentPassword",
                value: currentPassword,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                }
            },
            {
                name: "newPassword",
                value: newPassword,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                    isMatch: {
                        value: confirmNewPassword,
                        msg: "Sorry, There Is No Match Between New Password And Confirm It !!",
                    },
                }
            },
            {
                name: "confirmNewPassword",
                value: confirmNewPassword,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                    isMatch: {
                        value: newPassword,
                        msg: "Sorry, There Is No Match Between New Password And Confirm It !!",
                    },
                }
            },
        ]);
        return errorsObject;
    }

    const changeBussinessEmailPassword = async (e) => {
        try {
            e.preventDefault();
            const errorsObject = validateFormFields();
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitStatus(true);
                const res = await axios.put(`${process.env.BASE_API_URL}/global-passwords/change-bussiness-email-password?email=${email}&password=${currentPassword}&newPassword=${newPassword}`);
                const result = await res.data;
                setIsWaitStatus(false);
                if (result === "Changing Global Password Process Has Been Successfully !!") {
                    setSuccessMsg(result);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setEmail("");
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmNewPassword("");
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg(result);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 1500);
                }
            }
        }
        catch (err) {
            setIsWaitStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="change-bussiness-email-password admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Change Bussiness Email Password</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminPanelHeader />
                <div className="page-content d-flex justify-content-center align-items-center flex-column">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr Asfour In  Change Bussiness Email Password Page
                    </h1>
                    <form className="change-bussiness-email-password-form w-50" onSubmit={changeBussinessEmailPassword}>
                        <section className="email mb-4">
                            <input
                                type="text"
                                className={`p-2 form-control ${formValidationErrors.email ? "border-3 border-danger mb-3" : ""}`}
                                placeholder="Please Enter Bussiness Email Here"
                                onChange={(e) => setEmail(e.target.value.trim())}
                                value={email}
                            />
                            {formValidationErrors.email && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors.email}</span>
                            </p>}
                        </section>
                        <section className="current-password mb-3">
                            <div className={`current-password-field-box ${formValidationErrors.currentPassword ? "error-in-field" : ""}`}>
                                <input
                                    type={isVisibleCurrentPassword ? "text" : "password"}
                                    className={`p-2 form-control ${formValidationErrors.currentPassword ? "border-3 border-danger mb-3" : ""}`}
                                    placeholder="Please Enter Current Password"
                                    onChange={(e) => setCurrentPassword(e.target.value.trim())}
                                    value={currentPassword}
                                />
                                <div className="icon-box other-languages-mode">
                                    {!isVisibleCurrentPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleCurrentPassword(value => value = !value)} />}
                                    {isVisibleCurrentPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleCurrentPassword(value => value = !value)} />}
                                </div>
                            </div>
                            {formValidationErrors.currentPassword && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors.currentPassword}</span>
                            </p>}
                        </section>
                        <section className="new-password mb-3">
                            <div className={`new-password-field-box ${formValidationErrors.newPassword ? "error-in-field" : ""}`}>
                                <input
                                    type={isVisibleNewPassword ? "text" : "password"}
                                    className={`p-2 form-control ${formValidationErrors.newPassword ? "border-3 border-danger mb-3" : ""}`}
                                    placeholder="Please Enter New Password"
                                    onChange={(e) => setNewPassword(e.target.value.trim())}
                                    value={newPassword}
                                />
                                <div className="icon-box other-languages-mode">
                                    {!isVisibleNewPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleNewPassword(value => value = !value)} />}
                                    {isVisibleNewPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleNewPassword(value => value = !value)} />}
                                </div>
                            </div>
                            {formValidationErrors.newPassword && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors.newPassword}</span>
                            </p>}
                        </section>
                        <section className="confirm-new-password mb-3">
                            <div className={`confirm-new-password-field-box ${formValidationErrors.confirmNewPassword ? "error-in-field" : ""}`}>
                                <input
                                    type={isVisibleConfirmNewPassword ? "text" : "password"}
                                    className={`p-2 form-control ${formValidationErrors.confirmNewPassword ? "border-3 border-danger mb-3" : ""}`}
                                    placeholder="Please Enter Confirm New Password"
                                    onChange={(e) => setConfirmNewPassword(e.target.value.trim())}
                                    value={confirmNewPassword}
                                />
                                <div className="icon-box other-languages-mode">
                                    {!isVisibleConfirmNewPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleConfirmNewPassword(value => value = !value)} />}
                                    {isVisibleConfirmNewPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleConfirmNewPassword(value => value = !value)} />}
                                </div>
                            </div>
                            {formValidationErrors.confirmNewPassword && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors.confirmNewPassword}</span>
                            </p>}
                        </section>
                        {!isWaitStatus && !successMsg && !errorMsg && <button
                            type="submit"
                            className="btn btn-success w-50 d-block mx-auto p-2 global-button"
                        >
                            Change Now
                        </button>}
                        {isWaitStatus && <button
                            type="button"
                            className="btn btn-danger w-50 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            Wait Changing ...
                        </button>}
                        {errorMsg && <button
                            type="button"
                            className="btn btn-danger w-50 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {errorMsg}
                        </button>}
                        {successMsg && <button
                            type="button"
                            className="btn btn-success w-75 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {successMsg}
                        </button>}
                    </form>
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}