import Head from "next/head";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { HiOutlineBellAlert } from "react-icons/hi2";
import validations from "../../../../public/global_functions/validations";

export default function CustomerAccountDetails() {
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [userInfo, setUserInfo] = useState({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        preview_name: "",
        favorite_products_list: [],
    });
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isVisibleCurrentPassword, setIsVisibleCurrentPassword] = useState(false);
    const [isVisibleNewPassword, setIsVisibleNewPassword] = useState(false);
    const [isVisibleConfirmNewPassword, setIsVisibleConfirmNewPassword] = useState(false);
    const [formValidationErrors, setFormValidationErrors] = useState({});
    const [isWaitStatus, setIsWaitStatus] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();
    useEffect(() => {
        const userId = localStorage.getItem("asfour-store-user-id");
        if (userId) {
            Axios.get(`${process.env.BASE_API_URL}/users/user-info/${userId}`)
                .then((res) => {
                    const result = res.data;
                    if (result !== "Sorry, The User Is Not Exist !!, Please Enter Another User Id ..") {
                        setUserInfo(result);
                        setIsLoadingPage(false);
                    } else {
                        router.push("/auth");
                    }
                })
                .catch((err) => console.log(err));
        } else {
            router.push("/auth");
        }
    }, []);
    const validateFormFields = () => {
        let errorsObject = validations.inputValuesValidation([
            {
                name: "first_name",
                value: userInfo.first_name,
                rules: {
                    isRequired: {
                        msg: "Sorry, First Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "last_name",
                value: userInfo.last_name,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "preview_name",
                value: userInfo.preview_name,
                rules: {
                    isRequired: {
                        msg: "Sorry, Preview Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "email",
                value: userInfo.email,
                rules: {
                    isRequired: {
                        msg: "Sorry, Email Field Can't Be Empty !!",
                    },
                    isEmail: {
                        msg: "Sorry, Invalid Email !!",
                    },
                },
            },
            (newPassword || confirmNewPassword) ? {
                name: "currentPassword",
                value: currentPassword,
                rules: {
                    isRequired: {
                        msg: "Sorry, Current Password Field Can't Be Empty !!",
                    },
                }
            } : null,
            (currentPassword || confirmNewPassword) ? {
                name: "newPassword",
                value: newPassword,
                rules: {
                    isRequired: {
                        msg: "Sorry, New Password Field Can't Be Empty !!",
                    },
                    isMatch: {
                        value: confirmNewPassword,
                        msg: "Sorry, There Is No Match Between New Password And Confirm It !!",
                    },
                }
            } : null,
            (currentPassword || newPassword) ? {
                name: "confirmNewPassword",
                value: confirmNewPassword,
                rules: {
                    isRequired: {
                        msg: "Sorry, Confirm New Password Field Can't Be Empty !!",
                    },
                    isMatch: {
                        value: newPassword,
                        msg: "Sorry, There Is No Match Between New Password And Confirm It !!",
                    },
                }
            } : null,
        ]);
        return errorsObject;
    }
    const updateUserInfo = async (e) => {
        try {
            e.preventDefault();
            const errorsObject = validateFormFields();
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                let newUserInfo = {
                    email: userInfo.email,
                    first_name: userInfo.first_name,
                    last_name: userInfo.last_name,
                    preview_name: userInfo.preview_name,
                };
                if (currentPassword && newPassword && confirmNewPassword) {
                    newUserInfo = { ...newUserInfo, password: currentPassword, newPassword: newPassword };
                }
                setIsWaitStatus(true);
                const res = await Axios.put(`${process.env.BASE_API_URL}/users/update-user-info/${userInfo._id}`, newUserInfo);
                const result = await res.data;
                setIsWaitStatus(false);
                if (result === "Updating User Info Process Has Been Successfuly ...") {
                    setSuccessMsg(result);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        clearTimeout(successTimeout);
                    }, 2000);
                } else if (result === "Sorry, This Password Is Uncorrect !!") {
                    setErrorMsg(result);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 2000);
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    return (
        <div className="customer-account-details">
            <Head>
                <title>Asfour Store - Customer Account Details</title>
            </Head>
            {!isLoadingPage ? <>
                <Header />
                <div className="page-content d-flex align-items-center">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <div className="col-md-9">
                                <form className="edit-customer-account-details-form p-4" onSubmit={updateUserInfo}>
                                    <section className="first-and-last-name mb-4">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h6>First Name <span className="text-danger">*</span></h6>
                                                <input
                                                    type="text"
                                                    className={`p-2 ${formValidationErrors.first_name ? "border-3 border-danger mb-3" : ""}`}
                                                    placeholder="Please Enter New First Name Here"
                                                    defaultValue={userInfo.first_name}
                                                    onChange={(e) => setUserInfo({ ...userInfo, first_name: e.target.value.trim() })}
                                                />
                                                {formValidationErrors.first_name && <p className="bg-danger p-2 form-field-error-box m-0">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors.first_name}</span>
                                                </p>}
                                            </div>
                                            <div className="col-md-6">
                                                <h6>Last Name <span className="text-danger">*</span></h6>
                                                <input
                                                    type="text"
                                                    className={`p-2 ${formValidationErrors.last_name ? "border-3 border-danger mb-3" : ""}`}
                                                    placeholder="Please Enter Last Name Here"
                                                    defaultValue={userInfo.last_name}
                                                    onChange={(e) => setUserInfo({ ...userInfo, last_name: e.target.value.trim() })}
                                                />
                                                {formValidationErrors.last_name && <p className="bg-danger p-2 form-field-error-box m-0">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors.last_name}</span>
                                                </p>}
                                            </div>
                                        </div>
                                    </section>
                                    <section className="preview-name mb-4">
                                        <h6>Preview Name <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.preview_name ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder="Please Enter New Preview Name Here"
                                            defaultValue={userInfo.preview_name}
                                            onChange={(e) => setUserInfo({ ...userInfo, preview_name: e.target.value.trim() })}
                                        />
                                        {formValidationErrors.preview_name && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{formValidationErrors.preview_name}</span>
                                        </p>}
                                        <h6 className="note mt-2">This way your name will be displayed in the accounts section and in reviews</h6>
                                    </section>
                                    <section className="email mb-4">
                                        <h6>Email <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.email ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder="Please Enter New Email Here"
                                            defaultValue={userInfo.email}
                                            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value.trim() })}
                                        />
                                        {formValidationErrors.email && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{formValidationErrors.email}</span>
                                        </p>}
                                    </section>
                                    <section className="change-password mb-4">
                                        <fieldset className="p-4">
                                            <section className="current-password mb-3">
                                                <h6>Current password (leave the field blank if you do not want to change it)</h6>
                                                <div className="current-password-field-box">
                                                    <input
                                                        type={isVisibleCurrentPassword ? "text" : "password"}
                                                        placeholder="Please Enter Current Password Here"
                                                        className={`p-2 ${formValidationErrors.currentPassword ? "border-3 border-danger mb-3" : ""}`}
                                                        onChange={(e) => setCurrentPassword(e.target.value.trim())}
                                                    />
                                                    <div className='icon-box'>
                                                        {!isVisibleCurrentPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleCurrentPassword(value => value = !value)} />}
                                                        {isVisibleCurrentPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleCurrentPassword(value => value = !value)} />}
                                                    </div>
                                                </div>
                                                {formValidationErrors.currentPassword && <p className="bg-danger p-2 form-field-error-box m-0">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors.currentPassword}</span>
                                                </p>}
                                            </section>
                                            <section className="new-password mb-3">
                                                <h6>New password (leave the field blank if you do not want to change it)</h6>
                                                <div className="new-password-field-box">
                                                    <input
                                                        type={isVisibleNewPassword ? "text" : "password"}
                                                        placeholder="Please Enter New Password Here"
                                                        className={`p-2 ${formValidationErrors.newPassword ? "border-3 border-danger mb-3" : ""}`}
                                                        onChange={(e) => setNewPassword(e.target.value.trim())}
                                                    />
                                                    <div className='icon-box'>
                                                        {!isVisibleNewPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleNewPassword(value => value = !value)} />}
                                                        {isVisibleNewPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleNewPassword(value => value = !value)} />}
                                                    </div>
                                                </div>
                                                {formValidationErrors.newPassword && <p className="bg-danger p-2 form-field-error-box m-0">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors.newPassword}</span>
                                                </p>}
                                            </section>
                                            <section className="confirm-new-password mb-3">
                                                <h6>Confirm New password (leave the field blank if you do not want to change it)</h6>
                                                <div className="confirm-new-password-field-box">
                                                    <input
                                                        type={isVisibleConfirmNewPassword ? "text" : "password"}
                                                        placeholder="Please Enter New Password Here"
                                                        className={`p-2 ${formValidationErrors.confirmNewPassword ? "border-3 border-danger mb-3" : ""}`}
                                                        onChange={(e) => setConfirmNewPassword(e.target.value.trim())}
                                                    />
                                                    <div className='icon-box'>
                                                        {!isVisibleConfirmNewPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleConfirmNewPassword(value => value = !value)} />}
                                                        {isVisibleConfirmNewPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleConfirmNewPassword(value => value = !value)} />}
                                                    </div>
                                                </div>
                                                {formValidationErrors.confirmNewPassword && <p className="bg-danger p-2 form-field-error-box m-0">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors.confirmNewPassword}</span>
                                                </p>}
                                            </section>
                                        </fieldset>
                                    </section>
                                    {!isWaitStatus && !successMsg && !errorMsg && <button
                                        type="submit"
                                        className="btn btn-success d-block mx-auto"
                                    >
                                        Save Changes
                                    </button>}
                                    {isWaitStatus && <button
                                        className="btn btn-success d-block mx-auto"
                                        disabled
                                    >
                                        Saving ...
                                    </button>}
                                    {errorMsg && <button
                                        className="btn btn-danger d-block mx-auto"
                                        disabled
                                    >
                                        { errorMsg }
                                    </button>}
                                    {successMsg && <button
                                        className="btn btn-success d-block mx-auto"
                                        disabled
                                    >
                                        { successMsg }
                                    </button>}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </> : <LoaderPage />}
        </div>
    );
}