import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useState, useEffect } from "react";
import axios from "axios";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { getAdminInfo, inputValuesValidation } from "../../../../public/global_functions/validations";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { useRouter } from "next/router";

export default function ChangeBussinessEmailPassword() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [adminInfo, setAdminInfo] = useState({});

    const [websiteOwnerEmail, setWebsiteOwnerEmail] = useState("");

    const [websiteOwnerPassword, setWebsiteOwnerPassword] = useState("");

    const [adminEmail, setAdminEmail] = useState("");

    const [newAdminPassword, setNewAdminPassword] = useState("");

    const [confirmNewAdminPassword, setConfirmNewAdminPassword] = useState("");

    const [isVisibleWebsiteOwnerPassword, setIsVisibleWebsiteOwnerPassword] = useState(false);
    
    const [isVisibleNewAdminPassword, setIsVisibleNewAdminPassword] = useState(false);

    const [isVisibleConfirmNewAdminPassword, setIsVisibleConfirmNewAdminPassword] = useState(false);

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

    useEffect(() => {
        const adminToken = localStorage.getItem(process.env.adminTokenNameInLocalStorage);
        if (adminToken) {
            getAdminInfo()
                .then(async (result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.push("/admin-dashboard/login");
                    } else {
                        const adminDetails = result.data;
                        if (adminDetails.isWebsiteOwner) {
                            setAdminInfo(adminDetails);
                            setIsLoadingPage(false);
                        } else {
                            await router.replace("/admin-dashboard");
                        }
                    }
                })
                .catch(async (err) => {
                    if(err?.message === "Network Error") {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.push("/admin-dashboard/login");
                    }
                    else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else router.push("/admin-dashboard/login");
    }, []);

    const changeAdminPassword = async (e) => {
        try {
            e.preventDefault();
            const errorsObject = inputValuesValidation([
                {
                    name: "websiteOwnerEmail",
                    value: websiteOwnerEmail,
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
                    name: "websiteOwnerPassword",
                    value: websiteOwnerPassword,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isValidPassword: {
                            msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter."
                        },
                    }
                },
                {
                    name: "adminEmail",
                    value: adminEmail,
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
                    name: "newAdminPassword",
                    value: newAdminPassword,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isMatch: {
                            value: confirmNewAdminPassword,
                            msg: "Sorry, There Is No Match Between New Password And Confirm It !!",
                        },
                        isValidPassword: {
                            msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter."
                        },
                    }
                },
                {
                    name: "confirmNewAdminPassword",
                    value: confirmNewAdminPassword,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isMatch: {
                            value: newAdminPassword,
                            msg: "Sorry, There Is No Match Between New Password And Confirm It !!",
                        },
                        isValidPassword: {
                            msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter."
                        },
                    }
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitStatus(true);
                const res = await axios.put(`${process.env.BASE_API_URL}/admins/change-admin-password?websiteOwnerEmail=${websiteOwnerEmail}&websiteOwnerPassword=${websiteOwnerPassword}&adminEmail=${adminEmail}&newAdminPassword=${newAdminPassword}`, undefined, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    },
                });
                const result = await res.data;
                setIsWaitStatus(false);
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setWebsiteOwnerEmail("");
                        setWebsiteOwnerPassword("");
                        setAdminEmail("");
                        setNewAdminPassword("");
                        setConfirmNewAdminPassword("");
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg(result.msg);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 1500);
                }
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.push("/admin-dashboard/login");
                return;
            }
            setIsWaitStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="change-admin-password admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Change Admin Password</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column pt-5 pb-5 p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr { adminInfo.firstName + " " + adminInfo.lastName } In  Change Admin Password Page
                    </h1>
                    <form className="change-bussiness-email-password-form admin-dashbboard-form" onSubmit={changeAdminPassword}>
                        <section className="website-owner-email mb-4">
                            <input
                                type="text"
                                className={`p-2 form-control ${formValidationErrors.websiteOwnerEmail ? "border-3 border-danger mb-3" : ""}`}
                                placeholder="Please Enter Website Owner Email Here"
                                onChange={(e) => setWebsiteOwnerEmail(e.target.value.trim())}
                                value={websiteOwnerEmail}
                            />
                            {formValidationErrors.websiteOwnerEmail && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors.websiteOwnerEmail}</span>
                            </p>}
                        </section>
                        <section className="website-owner-password mb-3">
                            <div className={`website-owner-password-field-box ${formValidationErrors.websiteOwnerPassword ? "error-in-field" : ""}`}>
                                <input
                                    type={isVisibleWebsiteOwnerPassword ? "text" : "password"}
                                    className={`p-2 form-control ${formValidationErrors.websiteOwnerPassword ? "border-3 border-danger mb-3" : ""}`}
                                    placeholder="Please Enter Website Owner Password"
                                    onChange={(e) => setWebsiteOwnerPassword(e.target.value.trim())}
                                    value={websiteOwnerPassword}
                                />
                                <div className="icon-box other-languages-mode">
                                    {!isVisibleWebsiteOwnerPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleWebsiteOwnerPassword(value => value = !value)} />}
                                    {isVisibleWebsiteOwnerPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleWebsiteOwnerPassword(value => value = !value)} />}
                                </div>
                            </div>
                            {formValidationErrors.websiteOwnerPassword && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors.websiteOwnerPassword}</span>
                            </p>}
                        </section>
                        <section className="admin-email mb-4">
                            <input
                                type="text"
                                className={`p-2 form-control ${formValidationErrors.adminEmail ? "border-3 border-danger mb-3" : ""}`}
                                placeholder="Please Enter Admin Email Here"
                                onChange={(e) => setAdminEmail(e.target.value.trim())}
                                value={adminEmail}
                            />
                            {formValidationErrors.adminEmail && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors.adminEmail}</span>
                            </p>}
                        </section>
                        <section className="new-password mb-3">
                            <div className={`new-password-field-box ${formValidationErrors.newAdminPassword ? "error-in-field" : ""}`}>
                                <input
                                    type={isVisibleNewAdminPassword ? "text" : "password"}
                                    className={`p-2 form-control ${formValidationErrors.newAdminPassword ? "border-3 border-danger mb-3" : ""}`}
                                    placeholder="Please Enter New Admin Password"
                                    onChange={(e) => setNewAdminPassword(e.target.value.trim())}
                                    value={newAdminPassword}
                                />
                                <div className="icon-box other-languages-mode">
                                    {!isVisibleNewAdminPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleNewAdminPassword(value => value = !value)} />}
                                    {isVisibleNewAdminPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleNewAdminPassword(value => value = !value)} />}
                                </div>
                            </div>
                            {formValidationErrors.newAdminPassword && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors.newAdminPassword}</span>
                            </p>}
                        </section>
                        <section className="confirm-new-password mb-3">
                            <div className={`confirm-new-password-field-box ${formValidationErrors.confirmNewAdminPassword ? "error-in-field" : ""}`}>
                                <input
                                    type={isVisibleConfirmNewAdminPassword ? "text" : "password"}
                                    className={`p-2 form-control ${formValidationErrors.confirmNewAdminPassword ? "border-3 border-danger mb-3" : ""}`}
                                    placeholder="Please Enter Confirm New Admin Password"
                                    onChange={(e) => setConfirmNewAdminPassword(e.target.value.trim())}
                                    value={confirmNewAdminPassword}
                                />
                                <div className="icon-box other-languages-mode">
                                    {!isVisibleConfirmNewAdminPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleConfirmNewAdminPassword(value => value = !value)} />}
                                    {isVisibleConfirmNewAdminPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleConfirmNewAdminPassword(value => value = !value)} />}
                                </div>
                            </div>
                            {formValidationErrors.confirmNewAdminPassword && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors.confirmNewAdminPassword}</span>
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