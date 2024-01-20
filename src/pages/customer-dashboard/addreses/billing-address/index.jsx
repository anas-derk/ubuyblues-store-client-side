import Head from "next/head";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import validations from "../../../../../public/global_functions/validations";
import { HiOutlineBellAlert } from "react-icons/hi2";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { countries, getCountryCode } from 'countries-list';
import { parsePhoneNumber } from "libphonenumber-js";
import { useTranslation } from "react-i18next";

export default function CustomerBillingAddress() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [userInfo, setUserInfo] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const router = useRouter();

    const { t, i18n } = useTranslation();

    const countryList = Object.values(countries);

    useEffect(() => {
        const userId = localStorage.getItem("asfour-store-user-id");
        const userLanguage = localStorage.getItem("asfour-store-language");
        if (userId) {
            axios.get(`${process.env.BASE_API_URL}/users/user-info/${userId}`)
                .then((res) => {
                    const result = res.data;
                    if (result !== "Sorry, The User Is Not Exist !!, Please Enter Another User Id ..") {
                        setUserInfo(result);
                        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
                        setIsLoadingPage(false);
                    } else {
                        router.push("/auth");
                    }
                })
                .catch(() => {
                    handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
                    setIsLoadingPage(false);
                    setIsErrorMsgOnLoadingThePage(true);
                });
        } else {
            router.push("/auth");
        }
    }, []);

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    const getPhoneNumberFromString = (text, country) => {
        try{
            return parsePhoneNumber(text, country).nationalNumber;
        }
        catch(err) {
            return "";
        }
    }

    const validateFormFields = () => {
        let errorsObject = validations.inputValuesValidation([
            {
                name: "first_name",
                value: userInfo.billing_address.first_name,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "last_name",
                value: userInfo.billing_address.last_name,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "country",
                value: userInfo.billing_address.country,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "street_address",
                value: userInfo.billing_address.street_address,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "city",
                value: userInfo.billing_address.city,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "postal_code",
                value: userInfo.billing_address.postal_code,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "phone_number",
                value: userInfo.billing_address.phone_number,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                    isValidMobilePhone: {
                        msg: "Sorry, Invalid Mobile Phone !!",
                        countryCode: getCountryCode(userInfo.billing_address.country),
                    }
                },
            },
            {
                name: "email",
                value: userInfo.billing_address.email,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                    isEmail: {
                        msg: "Sorry, Invalid Email !!",
                    },
                },
            },
        ]);
        return errorsObject;
    }

    const updateBillingAddressInfoForUser = async (e) => {
        try {
            e.preventDefault();
            const errorsObject = validateFormFields();
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitStatus(true);
                const res = await axios.put(`${process.env.BASE_API_URL}/users/update-user-info/${userInfo._id}`, {
                    billing_address: userInfo.billing_address,
                });
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
            setIsWaitStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Try Again The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 2000);
        }
    }

    return (
        <div className="customer-billing-address customer-dashboard">
            <Head>
                <title>Ubuyblues Store - Customer Billing Address</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content d-flex align-items-center">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xl-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <div className="col-xl-9">
                                <form className="edit-customer-billing-address-form p-4" onSubmit={updateBillingAddressInfoForUser}>
                                    <section className="first-and-last-name mb-4">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h6>{t("First Name")} <span className="text-danger">*</span></h6>
                                                <input
                                                    type="text"
                                                    className={`p-2 ${formValidationErrors.first_name ? "border-3 border-danger mb-3" : ""}`}
                                                    placeholder={t("Please Enter New First Name Here")}
                                                    defaultValue={userInfo.billing_address.first_name}
                                                    onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, first_name: e.target.value.trim() } })}
                                                />
                                                {formValidationErrors.first_name && <p className="bg-danger p-2 form-field-error-box m-0">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{t(formValidationErrors.first_name)}</span>
                                                </p>}
                                            </div>
                                            <div className="col-md-6">
                                                <h6>{t("Last Name")} <span className="text-danger">*</span></h6>
                                                <input
                                                    type="text"
                                                    className={`p-2 ${formValidationErrors.last_name ? "border-3 border-danger mb-3" : ""}`}
                                                    placeholder={t("Please Enter New Last Name Here")}
                                                    defaultValue={userInfo.billing_address.last_name}
                                                    onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, last_name: e.target.value.trim() } })}
                                                />
                                                {formValidationErrors.last_name && <p className="bg-danger p-2 form-field-error-box m-0">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{t(formValidationErrors.last_name)}</span>
                                                </p>}
                                            </div>
                                        </div>
                                    </section>
                                    <section className="company-name mb-4">
                                        <h6>{t("Company Name")} ({t("Optional")})</h6>
                                        <input
                                            type="text"
                                            className="p-2"
                                            placeholder={t("Please Enter New Company Name Here")}
                                            defaultValue={userInfo.billing_address.company_name}
                                            onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, company_name: e.target.value.trim() } })}
                                        />
                                    </section>
                                    <section className="country mb-4">
                                        <h6>{t("Country / Area")} <span className="text-danger">*</span></h6>
                                        <select
                                            className={`p-2 ${formValidationErrors.country ? "border-3 border-danger mb-3" : ""}`}
                                            onChange={(e) => {
                                                const countryCode = getCountryCode(e.target.value);
                                                setUserInfo({ ...userInfo,
                                                    billing_address: {
                                                        ...userInfo.billing_address,
                                                        country: e.target.value,
                                                        phone_number: "00" + countries[countryCode].phone + getPhoneNumberFromString(userInfo.billing_address.phone_number, countryCode),
                                                    },
                                                })
                                            }}
                                            style={{
                                                backgroundColor: "var(--main-color-one)",
                                            }}
                                        >
                                            <option value={countries[getCountryCode(userInfo.billing_address.country)].name} hidden>{userInfo.billing_address.country}</option>
                                            {countryList.map((country) => (
                                                <option key={country.name} value={country.name}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                        {formValidationErrors.country && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{t(formValidationErrors.country)}</span>
                                        </p>}
                                    </section>
                                    <section className="street-address mb-4">
                                        <h6>{t("Street Address / Neighborhood")} <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.street_address ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder={t("Please Enter New Street Address / Neighborhood")}
                                            defaultValue={userInfo.billing_address.street_address}
                                            onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, street_address: e.target.value.trim() } })}
                                        />
                                        {formValidationErrors.street_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{t(formValidationErrors.street_address)}</span>
                                        </p>}
                                    </section>
                                    <section className="apartment-number mb-4">
                                        <h6>{t("Apartment Number, Ward, Unit, Etc")} . ( {t("Optional")} )</h6>
                                        <input
                                            type="number"
                                            className="p-2"
                                            placeholder={t("Please Enter New Apartment Number, Ward, Unit, Etc")}
                                            defaultValue={userInfo.billing_address.apartment_number.toString()}
                                            onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, apartment_number: e.target.value } })}
                                        />
                                    </section>
                                    <section className="city-number mb-4">
                                        <h6>{t("City")} <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.city ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder={t("Please Enter New City Name")}
                                            defaultValue={userInfo.billing_address.city}
                                            onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, city: e.target.value.trim() } })}
                                        />
                                        {formValidationErrors.city && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{t(formValidationErrors.city)}</span>
                                        </p>}
                                    </section>
                                    <section className="postal-code-number mb-4">
                                        <h6>{t("Postal Code / Zip")} <span className="text-danger">*</span></h6>
                                        <input
                                            type="number"
                                            className={`p-2 ${formValidationErrors.postal_code ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder={t("Please Enter New Postal Code / Zip")}
                                            defaultValue={userInfo.billing_address.postal_code.toString()}
                                            onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, postal_code: e.target.value } })}
                                        />
                                        {formValidationErrors.postal_code && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{t(formValidationErrors.postal_code)}</span>
                                        </p>}
                                    </section>
                                    <section className="phone-number mb-4">
                                        <h6>{t("Phone Number")} <span className="text-danger">*</span></h6>
                                        <div className="row">
                                            <div className="col-md-2">
                                                <input
                                                    type="text"
                                                    className="p-2 text-center"
                                                    disabled
                                                    value={"00" + countries[getCountryCode(userInfo.billing_address.country)].phone}
                                                />
                                            </div>
                                            <div className="col-md-10">
                                                <input
                                                    type="text"
                                                    className={`p-2 ${formValidationErrors.phone_number ? "border-3 border-danger mb-3" : ""}`}
                                                    placeholder={t("Please Enter New Phone Number")}
                                                    defaultValue={userInfo ? getPhoneNumberFromString(userInfo.billing_address.phone_number, getCountryCode(userInfo.billing_address.country)) : ""}
                                                    onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, phone_number: "00" + countries[getCountryCode(userInfo.billing_address.country)].phone + e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                        {formValidationErrors.phone_number && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{t(formValidationErrors.phone_number)}</span>
                                        </p>}
                                    </section>
                                    <section className="email mb-4">
                                        <h6>{t("Email")} <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.email ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder={t("Please Enter New Email")}
                                            defaultValue={userInfo.billing_address.email}
                                            onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, email: e.target.value.trim() } })}
                                        />
                                        {formValidationErrors.email && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{t(formValidationErrors.email)}</span>
                                        </p>}
                                    </section>
                                    {!isWaitStatus && !successMsg && !errorMsg && <button
                                        type="submit"
                                        className="btn btn-success d-block mx-auto"
                                    >
                                        {t("Save Changes")}
                                    </button>}
                                    {isWaitStatus && <button
                                        className="btn btn-success d-block mx-auto"
                                        disabled
                                    >
                                        {t("Saving")} ...
                                    </button>}
                                    {errorMsg && <button
                                        className="btn btn-danger d-block mx-auto"
                                        disabled
                                    >
                                        {t(errorMsg)}
                                    </button>}
                                    {successMsg && <button
                                        className="btn btn-success d-block mx-auto"
                                        disabled
                                    >
                                        {t(successMsg)}
                                    </button>}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}