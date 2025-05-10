import Head from "next/head";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { countries, getCountryCode } from "countries-list";
import { parsePhoneNumber } from "libphonenumber-js";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import { inputValuesValidation } from "../../../../../public/global_functions/validations";
import { getAnimationSettings, getInitialStateForElementBeforeAnimation, getUserInfo, handleSelectUserLanguage } from "../../../../../public/global_functions/popular";
import { motion } from "motion/react";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";

export default function CustomerBillingAddress() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [userInfo, setUserInfo] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const router = useRouter();

    const { t, i18n } = useTranslation();

    const countryList = Object.values(countries);

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
        if (userToken) {
            getUserInfo()
                .then(async (result) => {
                    if (!result.error) {
                        setUserInfo(result.data);
                        setIsLoadingPage(false);
                    } else {
                        localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                        await router.replace("/auth");
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                        await router.replace("/auth");
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        } else {
            router.replace("/auth");
        }
    }, []);

    const getPhoneNumberFromString = (text, country) => {
        try {
            return parsePhoneNumber(text, country).nationalNumber;
        }
        catch (err) {
            return "";
        }
    }

    const updateBillingAddressInfoForUser = async (e) => {
        try {
            e.preventDefault();
            const errorsObject = inputValuesValidation([
                {
                    name: "firstName",
                    value: userInfo.billingAddress.firstName,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isName: {
                            msg: "Sorry, This Name Is Not Valid !!",
                        }
                    },
                },
                {
                    name: "lastName",
                    value: userInfo.billingAddress.lastName,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isName: {
                            msg: "Sorry, This Name Is Not Valid !!",
                        }
                    },
                },
                {
                    name: "country",
                    value: userInfo.billingAddress.country,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isName: {
                            msg: "Sorry, This Name Is Not Valid !!",
                        }
                    },
                },
                {
                    name: "streetAddress",
                    value: userInfo.billingAddress.streetAddress,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "city",
                    value: userInfo.billingAddress.city,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isName: {
                            msg: "Sorry, This Name Is Not Valid !!",
                        }
                    },
                },
                {
                    name: "postalCode",
                    value: userInfo.billingAddress.postalCode,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "phoneNumber",
                    value: userInfo.billingAddress.phoneNumber,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isValidMobilePhone: {
                            msg: "Sorry, Invalid Mobile Phone !!",
                            countryCode: userInfo.billingAddress.country,
                        }
                    },
                },
                {
                    name: "email",
                    value: userInfo.billingAddress.email,
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
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitStatus(true);
                const result = (await axios.put(`${process.env.BASE_API_URL}/users/update-user-info?language=${i18n.language}`, {
                    billingAddress: userInfo.billingAddress,
                }, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE),
                    }
                })).data;
                setIsWaitStatus(false);
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        clearTimeout(successTimeout);
                    }, 2000);
                } else {
                    setErrorMsg(result.msg);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 2000);
                }
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                await router.replace("/auth");
            }
            else {
                setIsWaitStatus(false);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeat The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="customer-billing-address customer-dashboard">
            <Head>
                <title>{t(process.env.STORE_NAME)} - {t("Customer Billing Address")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content page pt-5">
                    <div className="container-fluid align-items-center pb-4">
                        <div className="row">
                            <div className="col-xl-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <div className="col-xl-9">
                                <form className="edit-customer-billing-address-form p-4" onSubmit={updateBillingAddressInfoForUser}>
                                    <section className="first-and-last-name mb-4">
                                        <div className="row">
                                            <motion.div className="col-md-6" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                <h6>{t("First Name")} <span className="text-danger">*</span></h6>
                                                <input
                                                    type="text"
                                                    className={`p-2 ${formValidationErrors.firstName ? "border-3 border-danger mb-3" : ""}`}
                                                    placeholder={t("Please Enter New First Name Here")}
                                                    defaultValue={userInfo.billingAddress.firstName}
                                                    onChange={(e) => setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, firstName: e.target.value.trim() } })}
                                                />
                                                {formValidationErrors.firstName && <FormFieldErrorBox errorMsg={t(formValidationErrors.firstName)} />}
                                            </motion.div>
                                            <motion.div className="col-md-6" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                <h6>{t("Last Name")} <span className="text-danger">*</span></h6>
                                                <input
                                                    type="text"
                                                    className={`p-2 ${formValidationErrors.lastName ? "border-3 border-danger mb-3" : ""}`}
                                                    placeholder={t("Please Enter New Last Name Here")}
                                                    defaultValue={userInfo.billingAddress.lastName}
                                                    onChange={(e) => setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, lastName: e.target.value.trim() } })}
                                                />
                                                {formValidationErrors.lastName && <FormFieldErrorBox errorMsg={t(formValidationErrors.lastName)} />}
                                            </motion.div>
                                        </div>
                                    </section>
                                    <motion.section className="company-name mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                        <h6>{t("Company Name")} ({t("Optional")})</h6>
                                        <input
                                            type="text"
                                            className="p-2"
                                            placeholder={t("Please Enter New Company Name Here")}
                                            defaultValue={userInfo.billingAddress.companyName}
                                            onChange={(e) => setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, companyName: e.target.value.trim() } })}
                                        />
                                    </motion.section>
                                    <motion.section className="country mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                        <h6>{t("Country / Area")} <span className="text-danger">*</span></h6>
                                        <select
                                            className={`p-2 ${formValidationErrors.country ? "border-3 border-danger mb-3" : ""}`}
                                            onChange={(e) => {
                                                const countryCode = getCountryCode(e.target.value);
                                                setUserInfo({
                                                    ...userInfo,
                                                    billingAddress: {
                                                        ...userInfo.billingAddress,
                                                        country: countryCode,
                                                        phoneNumber: "00" + countries[countryCode].phone + getPhoneNumberFromString(userInfo.billingAddress.phoneNumber, countryCode),
                                                    },
                                                })
                                            }}
                                            style={{
                                                backgroundColor: "var(--main-color-one)",
                                            }}
                                        >
                                            <option value={userInfo.billingAddress.country} hidden>{countries[userInfo.billingAddress.country].name}</option>
                                            {countryList.map((country) => (
                                                <option key={country.name} value={country.name}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                        {formValidationErrors.country && <FormFieldErrorBox errorMsg={t(formValidationErrors.country)} />}
                                    </motion.section>
                                    <motion.section className="street-address mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                        <h6>{t("Street Address / Neighborhood")} <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.streetAddress ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder={t("Please Enter New Street Address / Neighborhood Here")}
                                            defaultValue={userInfo.billingAddress.streetAddress}
                                            onChange={(e) => setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, streetAddress: e.target.value.trim() } })}
                                        />
                                        {formValidationErrors.streetAddress && <FormFieldErrorBox errorMsg={t(formValidationErrors.streetAddress)} />}
                                    </motion.section>
                                    <motion.section className="apartment-number mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                        <h6>{t("Apartment Number, Ward, Unit, Etc")} . ( {t("Optional")} )</h6>
                                        <input
                                            type="number"
                                            className="p-2"
                                            placeholder={t("Please Enter New Apartment Number, Ward, Unit, Etc Here")}
                                            defaultValue={userInfo.billingAddress?.apartmentNumber?.toString()}
                                            onChange={(e) => setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, apartmentNumber: e.target.value } })}
                                        />
                                    </motion.section>
                                    <motion.section className="city-number mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                        <h6>{t("City")} <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.city ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder={t("Please Enter New City Name Here")}
                                            defaultValue={userInfo.billingAddress.city}
                                            onChange={(e) => setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, city: e.target.value.trim() } })}
                                        />
                                        {formValidationErrors.city && <FormFieldErrorBox errorMsg={t(formValidationErrors.city)} />}
                                    </motion.section>
                                    <motion.section className="postal-code-number mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                        <h6>{t("Postal Code / Zip")} <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.postalCode ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder={t("Please Enter New Postal Code / Zip Here")}
                                            defaultValue={userInfo.billingAddress.postalCode.toString()}
                                            onChange={(e) => setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, postalCode: e.target.value } })}
                                        />
                                        {formValidationErrors.postalCode && <FormFieldErrorBox errorMsg={t(formValidationErrors.postalCode)} />}
                                    </motion.section>
                                    <motion.section className="phone-number mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                        <h6>{t("Phone Number")} <span className="text-danger">*</span></h6>
                                        <div className="row">
                                            <div className="col-md-2">
                                                <input
                                                    type="text"
                                                    className="p-2 text-center"
                                                    disabled
                                                    value={"00" + countries[userInfo.billingAddress.country].phone}
                                                />
                                            </div>
                                            <div className="col-md-10">
                                                <input
                                                    type="text"
                                                    className={`p-2 ${formValidationErrors.phoneNumber ? "border-3 border-danger mb-3" : ""}`}
                                                    placeholder={t("Please Enter New Phone Number Here")}
                                                    defaultValue={userInfo ? getPhoneNumberFromString(userInfo.billingAddress.phoneNumber, userInfo.billingAddress.country) : ""}
                                                    onChange={(e) => setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, phoneNumber: "00" + countries[userInfo.billingAddress.country].phone + e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                        {formValidationErrors.phoneNumber && <FormFieldErrorBox errorMsg={t(formValidationErrors.phoneNumber)} />}
                                    </motion.section>
                                    <motion.section className="email mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                        <h6>{t("Email")} <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.email ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder={t("Please Enter New Email Here")}
                                            defaultValue={userInfo.billingAddress.email}
                                            onChange={(e) => setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, email: e.target.value.trim() } })}
                                        />
                                        {formValidationErrors.email && <FormFieldErrorBox errorMsg={t(formValidationErrors.email)} />}
                                    </motion.section>
                                    {!isWaitStatus && !successMsg && !errorMsg && <motion.button
                                        type="submit"
                                        className="btn btn-success d-block mx-auto"
                                        initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                    >
                                        {t("Save Changes")}
                                    </motion.button>}
                                    {isWaitStatus && <motion.button
                                        className="btn btn-success d-block mx-auto"
                                        disabled
                                        initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                    >
                                        {t("Saving")} ...
                                    </motion.button>}
                                    {errorMsg && <motion.button
                                        className="btn btn-danger d-block mx-auto"
                                        disabled
                                        initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                    >
                                        {t(errorMsg)}
                                    </motion.button>}
                                    {successMsg && <motion.button
                                        className="btn btn-success d-block mx-auto"
                                        disabled
                                        initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                    >
                                        {t(successMsg)}
                                    </motion.button>}
                                </form>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}