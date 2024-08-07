import Head from "next/head";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import LoaderPage from "@/components/LoaderPage";
import axios from "axios";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { useRouter } from "next/router";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { countries, getCountryCode } from 'countries-list';
import { FaCcPaypal, FaTape } from "react-icons/fa";
import { parsePhoneNumber } from "libphonenumber-js";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import NotFoundError from "@/components/NotFoundError";
import { getStoreDetails, getProductQuantity, calcTotalPrices, isExistOfferOnProduct, getUserInfo } from "../../../public/global_functions/popular";
import { getCurrencyNameByCountry, getUSDPriceAgainstCurrency } from "../../../public/global_functions/prices";
import { inputValuesValidation } from "../../../public/global_functions/validations";

export default function Checkout({ countryAsProperty, storeId }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [storeDetails, setStoreDetails] = useState({});

    const [isGetStoreDetails, setIsGetStoreDetails] = useState(true);

    const [allProductsData, setAllProductsData] = useState([]);

    const [currentDate, setCurrentDate] = useState("");

    const [pricesDetailsSummary, setPricesDetailsSummary] = useState({
        totalPriceBeforeDiscount: 0,
        totalDiscount: 0,
        totalPriceAfterDiscount: 0,
    });

    const [userInfo, setUserInfo] = useState({});

    const [isGetUserInfo, setIsGetUserInfo] = useState(true);

    const [requestNotes, setRequestNotes] = useState("");

    const [isShippingToOtherAddress, setIsShippingToOtherAddress] = useState(false);

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [paymentMethod, setPaymentMethod] = useState("tap");

    const [shippingMethod, setShippingMethod] = useState({ forLocalProducts: "ubuyblues", forInternationalProducts: "normal" });

    const [localAndInternationlProducts, setLocalAndInternationlProducts] = useState({ local: [], international: [] });

    const [shippingCost, setShippingCost] = useState({ forLocalProducts: 0, forInternationalProducts: 0 });

    const [isDisplayPaypalPaymentButtons, setIsDisplayPaypalPaymentButtons] = useState(false);

    const [isWaitApproveOnPayPalOrder, setIsWaitApproveOnPayPalOrder] = useState(false);

    const [isWaitCreateNewOrder, setIsWaitCreateNewOrder] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [isSavePaymentInfo, setIsSavePaymentInfo] = useState(false);

    const [orderResult, setOrderResult] = useState({});

    const countryList = Object.values(countries);

    const router = useRouter();

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
    }, []);

    useEffect(() => {
        setIsLoadingPage(true);
        getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(getCurrencyNameByCountry(countryAsProperty));
            if (!isGetUserInfo && !isGetStoreDetails) {
                setIsLoadingPage(false);
            }
        })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
    }, [countryAsProperty]);

    useEffect(() => {
        getStoreDetails(storeId)
            .then(async (result) => {
                if (!result.error) {
                    if (result.data?.status === "approving") {
                        setStoreDetails(result.data);
                        const tempAllProductsDataInsideTheCart = JSON.parse(localStorage.getItem("asfour-store-customer-cart"));
                        if (Array.isArray(tempAllProductsDataInsideTheCart)) {
                            if (tempAllProductsDataInsideTheCart.length > 0) {
                                result = await getProductsByIdsAnsStoreId(storeId, tempAllProductsDataInsideTheCart.map((product) => product._id));
                                if (result.data.products.length > 0) {
                                    setCurrentDate(result.data.currentDate);
                                    const totalPrices = calcTotalPrices(result.data.currentDate, result.data.products);
                                    setPricesDetailsSummary(totalPrices);
                                    setAllProductsData(result.data.products);
                                    const userData = await getAndSetUserInfoData();
                                    setUserInfo(userData);
                                    const localAndInternationlProductsTemp = getLocalAndInternationalProducts(result.data.products, isShippingToOtherAddress ? userData.shippingAddress.country : userData.billingAddress.country);
                                    setLocalAndInternationlProducts(localAndInternationlProductsTemp);
                                    setShippingCost(getShippingCost(localAndInternationlProductsTemp.local.length, localAndInternationlProductsTemp.international.length, shippingMethod , totalPrices.totalPriceAfterDiscount));
                                    setIsGetUserInfo(false);
                                }
                            }
                        }
                    }
                }
                setIsGetStoreDetails(false);
            })
            .catch((err) => {
                if (err?.response?.data?.msg === "Unauthorized Error") {
                    localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                    setIsGetUserInfo(false);
                } else {
                    setIsLoadingPage(false);
                    setIsErrorMsgOnLoadingThePage(true);
                }
            });
    }, [storeId]);

    useEffect(() => {
        if (!isGetUserInfo && !isGetStoreDetails) {
            setIsLoadingPage(false);
        }
    }, [isGetUserInfo, isGetStoreDetails]);

    const getAndSetUserInfoAsGuest = () => {
        const userAddresses = JSON.parse(localStorage.getItem("asfour-store-user-addresses"));
        if (userAddresses) {
            const userInfo = { billingAddress: userAddresses.billingAddress, shippingAddress: userAddresses.shippingAddress };
            setUserInfo(userInfo);
            setIsSavePaymentInfo(true);
            return userInfo;
        } else {
            const userInfo = {
                billingAddress: {
                    firstName: "",
                    lastName: "",
                    companyName: "",
                    country: "Kuwait",
                    streetAddress: "",
                    apartmentNumber: 1,
                    city: "",
                    postalCode: 1,
                    phoneNumber: "0096560048235",
                    email: "",
                },
                shippingAddress: {
                    firstName: "",
                    lastName: "",
                    companyName: "",
                    country: "Kuwait",
                    streetAddress: "",
                    apartmentNumber: 1,
                    city: "",
                    postalCode: 1,
                    phoneNumber: "0096560048235",
                    email: "",
                },
            };
            setUserInfo(userInfo);
            return userInfo;
        }
    }

    async function getAndSetUserInfoData() {
        try {
            const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
            if (userToken) {
                const result = await getUserInfo();
                if (!result.error) {
                    setUserInfo(result.data);
                    return result.data;
                } else {
                    localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                    return getAndSetUserInfoAsGuest();
                }
            } else {
                return getAndSetUserInfoAsGuest();
            }
        }
        catch (err) {
            throw err;
        }
    }

    const getLocalAndInternationalProducts = (products, shippingCountry) => {
        let local = [], international = [];
        products.forEach((product) => {
            if (countries[product.country].name === shippingCountry) {
                local.push(product.name);
            } else {
                international.push(product.name);
            }
        });
        return { local, international };
    }

    const getShippingCost = (localProductsLength, internationalProductsLength, shippingMethod, totalPriceAfterDiscount) => {
        let tempShippingCost = { forLocalProducts: 0, forInternationalProducts: 0 };
        if (localProductsLength !== 0) {
            if (shippingMethod.forLocalProducts === "ubuyblues") {
                tempShippingCost.forLocalProducts = 1;
            }
        }
        if (internationalProductsLength !== 0) {
            if (shippingMethod.forInternationalProducts === "normal") {
                tempShippingCost.forInternationalProducts = totalPriceAfterDiscount * 0.15;
            }
            else {
                tempShippingCost.forInternationalProducts = totalPriceAfterDiscount * 0.25;
            }
        }
        return tempShippingCost;
    }

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    const getProductsByIdsAnsStoreId = async (storeId, productsIds) => {
        try {
            return (await axios.post(`${process.env.BASE_API_URL}/products/products-by-ids-and-store-id?storeId=${storeId}`, {
                productsIds,
            })).data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getPhoneNumberFromString = (text, country) => {
        try {
            return parsePhoneNumber(text, country).nationalNumber;
        }
        catch (err) {
            return "";
        }
    }

    const handleSelectCountry = (country, section) => {
        setIsDisplayPaypalPaymentButtons(false);
        const countryCode = getCountryCode(country);
        const newUserInfo = {
            ...userInfo,
            ...(section === "billing" ? {
                billingAddress: {
                    ...userInfo.billingAddress,
                    country,
                    phoneNumber: "00" + countries[countryCode].phone + getPhoneNumberFromString(userInfo.billingAddress.phoneNumber, countryCode),
                }
            } : {
                shippingAddress: {
                    ...userInfo.shippingAddress,
                    country,
                    phoneNumber: "00" + countries[countryCode].phone + getPhoneNumberFromString(userInfo.shippingAddress.phoneNumber, countryCode),
                }
            }),
        };
        setUserInfo(newUserInfo);
        const localAndInternationlProductsTemp = getLocalAndInternationalProducts(allProductsData, isShippingToOtherAddress ? newUserInfo.shippingAddress.country : newUserInfo.billingAddress.country);
        setLocalAndInternationlProducts(localAndInternationlProductsTemp);
        setShippingCost(getShippingCost(localAndInternationlProductsTemp.local.length, localAndInternationlProductsTemp.international.length, shippingMethod, pricesDetailsSummary.totalPriceAfterDiscount));
    }

    const handleIsShippingToOtherAddress = (isShippingToOtherAddress) => {
        setIsShippingToOtherAddress(isShippingToOtherAddress);
        setIsDisplayPaypalPaymentButtons(false);
        const localAndInternationlProductsTemp = getLocalAndInternationalProducts(allProductsData, isShippingToOtherAddress ? userInfo.shippingAddress.country : userInfo.billingAddress.country);
        setLocalAndInternationlProducts(localAndInternationlProductsTemp);
        setShippingCost(getShippingCost(localAndInternationlProductsTemp.local.length, localAndInternationlProductsTemp.international.length, shippingMethod, pricesDetailsSummary.totalPriceAfterDiscount));
    }

    const createNewOrder = async (orderDetails) => {
        try {
            return (await axios.post(`${process.env.BASE_API_URL}/orders/create-new-order?country=${countryAsProperty}`, orderDetails)).data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const handleSelectPaypalPayment = async () => {
        try {
            const errorsObject = inputValuesValidation([
                {
                    name: "first_name_for_billing_address",
                    value: userInfo ? userInfo.billingAddress.firstName : "",
                    rules: {
                        isRequired: {
                            msg: "Sorry, First Name Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "last_name_for_billing_address",
                    value: userInfo ? userInfo.billingAddress.lastName : "",
                    rules: {
                        isRequired: {
                            msg: "Sorry, Last Name Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "country_for_billing_address",
                    value: userInfo ? userInfo.billingAddress.country : "",
                    rules: {
                        isRequired: {
                            msg: "Sorry, Last Name Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "street_address_for_billing_address",
                    value: userInfo ? userInfo.billingAddress.streetAddress : "",
                    rules: {
                        isRequired: {
                            msg: "Sorry, Last Name Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "city_for_billing_address",
                    value: userInfo ? userInfo.billingAddress.city : "",
                    rules: {
                        isRequired: {
                            msg: "Sorry, Last Name Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "postal_code_for_billing_address",
                    value: userInfo ? userInfo.billingAddress.postalCode : "",
                    rules: {
                        isRequired: {
                            msg: "Sorry, Last Name Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "phone_number_for_billing_address",
                    value: userInfo.billingAddress.phoneNumber,
                    rules: {
                        isRequired: {
                            msg: "Sorry, Last Name Field Can't Be Empty !!",
                        },
                        isValidMobilePhone: {
                            msg: "Sorry, Invalid Mobile Phone !!",
                            countryCode: getCountryCode(userInfo.billingAddress.country),
                        },
                    },
                },
                {
                    name: "email_for_billing_address",
                    value: userInfo ? userInfo.billingAddress.email : "",
                    rules: {
                        isRequired: {
                            msg: "Sorry, Email Field Can't Be Empty !!",
                        },
                        isEmail: {
                            msg: "Sorry, Invalid Email !!",
                        },
                    },
                },
                isShippingToOtherAddress ? {
                    name: "firstName_for_shipping_address",
                    value: userInfo ? userInfo.shippingAddress.firstName : "",
                    rules: {
                        isRequired: {
                            msg: "Sorry, First Name Field Can't Be Empty !!",
                        },
                    },
                } : null,
                isShippingToOtherAddress ? {
                    name: "lastName_for_shipping_address",
                    value: userInfo ? userInfo.shippingAddress.lastName : "",
                    rules: {
                        isRequired: {
                            msg: "Sorry, Last Name Field Can't Be Empty !!",
                        },
                    },
                } : null,
                isShippingToOtherAddress ? {
                    name: "country_for_shipping_address",
                    value: userInfo ? userInfo.shippingAddress.country : "",
                    rules: {
                        isRequired: {
                            msg: "Sorry, Last Name Field Can't Be Empty !!",
                        },
                    },
                } : null,
                isShippingToOtherAddress ? {
                    name: "streetAddress_for_shipping_address",
                    value: userInfo ? userInfo.shippingAddress.streetAddress : "",
                    rules: {
                        isRequired: {
                            msg: "Sorry, Last Name Field Can't Be Empty !!",
                        },
                    },
                } : null,
                isShippingToOtherAddress ? {
                    name: "city_for_shipping_address",
                    value: userInfo ? userInfo.shippingAddress.city : "",
                    rules: {
                        isRequired: {
                            msg: "Sorry, Last Name Field Can't Be Empty !!",
                        },
                    },
                } : null,
                isShippingToOtherAddress ? {
                    name: "postalCode_for_shipping_address",
                    value: userInfo ? userInfo.shippingAddress.postalCode : "",
                    rules: {
                        isRequired: {
                            msg: "Sorry, Last Name Field Can't Be Empty !!",
                        },
                    },
                } : null,
                isShippingToOtherAddress ? {
                    name: "phoneNumber_for_shipping_address",
                    value: userInfo.shippingAddress.phoneNumber,
                    rules: {
                        isRequired: {
                            msg: "Sorry, Last Name Field Can't Be Empty !!",
                        },
                        isValidMobilePhone: {
                            msg: "Sorry, Invalid Mobile Phone !!",
                            countryCode: getCountryCode(userInfo.shippingAddress.country),
                        },
                    },
                } : null,
                isShippingToOtherAddress ? {
                    name: "email_for_shipping_address",
                    value: userInfo ? userInfo.shippingAddress.email : "",
                    rules: {
                        isRequired: {
                            msg: "Sorry, Email Field Can't Be Empty !!",
                        },
                        isEmail: {
                            msg: "Sorry, Invalid Email !!",
                        },
                    },
                } : null,
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitCreateNewOrder(true);
                if (isSavePaymentInfo) {
                    localStorage.setItem("asfour-store-user-addresses", JSON.stringify({
                        billingAddress: {
                            firstName: userInfo ? userInfo.billingAddress.firstName : "",
                            lastName: userInfo ? userInfo.billingAddress.lastName : "",
                            companyName: userInfo ? userInfo.billingAddress.companyName : "",
                            country: userInfo.billingAddress.country,
                            streetAddress: userInfo ? userInfo.billingAddress.streetAddress : "",
                            apartmentNumber: userInfo.billingAddress.apartmentNumber,
                            city: userInfo ? userInfo.billingAddress.city : "",
                            postalCode: userInfo.billingAddress.postalCode,
                            phoneNumber: userInfo.billingAddress.phoneNumber,
                            email: userInfo ? userInfo.billingAddress.email : "",
                        },
                        shippingAddress: {
                            firstName: userInfo && isShippingToOtherAddress ? userInfo.shippingAddress.firstName : userInfo.billingAddress.firstName,
                            lastName: userInfo && isShippingToOtherAddress ? userInfo.shippingAddress.lastName : userInfo.billingAddress.lastName,
                            companyName: userInfo && isShippingToOtherAddress ? userInfo.shippingAddress.companyName : userInfo.billingAddress.companyName,
                            country: userInfo && isShippingToOtherAddress ? userInfo.shippingAddress.country : userInfo.billingAddress.country,
                            streetAddress: userInfo && isShippingToOtherAddress ? userInfo.shippingAddress.streetAddress : userInfo.billingAddress.streetAddress,
                            apartmentNumber: userInfo && isShippingToOtherAddress ? userInfo.shippingAddress.apartmentNumber : userInfo.billingAddress.apartmentNumber,
                            city: userInfo && isShippingToOtherAddress ? userInfo.shippingAddress.city : userInfo.billingAddress.city,
                            postalCode: userInfo && isShippingToOtherAddress ? userInfo.shippingAddress.postalCode : userInfo.billingAddress.postalCode,
                            phoneNumber: userInfo && isShippingToOtherAddress ? userInfo.shippingAddress.phoneNumber : userInfo.billingAddress.phoneNumber,
                            email: userInfo && isShippingToOtherAddress ? userInfo.shippingAddress.email : userInfo.billingAddress.email,
                        },
                    }));
                } else {
                    localStorage.removeItem("asfour-store-user-addresses");
                }
                const result = await createNewOrder(getOrderDetailsForCreating());
                setIsWaitCreateNewOrder(false);
                if (!result.error) {
                    setOrderResult(result.data);
                    setIsDisplayPaypalPaymentButtons(true);
                }
                else {
                    setErrorMsg(result.msg);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 2000);
                }
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                await router.replace("/auth");
                return;
            }
            setIsWaitCreateNewOrder(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 2000);
        }
    }

    const getOrderDetailsForCreating = () => {
        return {
            customerId: userInfo ? userInfo._id : "",
            billingAddress: {
                firstName: userInfo.billingAddress.firstName,
                lastName: userInfo.billingAddress.lastName,
                companyName: userInfo.billingAddress.companyName,
                country: userInfo.billingAddress.country,
                streetAddress: userInfo.billingAddress.streetAddress,
                apartmentNumber: userInfo.billingAddress.apartmentNumber,
                city: userInfo.billingAddress.city,
                postalCode: userInfo.billingAddress.postalCode,
                phone: userInfo.billingAddress.phoneNumber,
                email: userInfo.billingAddress.email,
            },
            shippingAddress: {
                firstName: isShippingToOtherAddress ? userInfo.shippingAddress.firstName : userInfo.billingAddress.firstName,
                lastName: isShippingToOtherAddress ? userInfo.shippingAddress.lastName : userInfo.billingAddress.lastName,
                companyName: isShippingToOtherAddress ? userInfo.shippingAddress.companyName : userInfo.billingAddress.companyName,
                country: isShippingToOtherAddress ? userInfo.shippingAddress.country : userInfo.billingAddress.country,
                streetAddress: isShippingToOtherAddress ? userInfo.shippingAddress.streetAddress : userInfo.billingAddress.streetAddress,
                apartmentNumber: isShippingToOtherAddress ? userInfo.shippingAddress.apartmentNumber : userInfo.billingAddress.apartmentNumber,
                city: isShippingToOtherAddress ? userInfo.shippingAddress.city : userInfo.billingAddress.city,
                postalCode: isShippingToOtherAddress ? userInfo.shippingAddress.postalCode : userInfo.billingAddress.postalCode,
                phone: isShippingToOtherAddress ? userInfo.shippingAddress.phoneNumber : userInfo.billingAddress.phoneNumber,
                email: isShippingToOtherAddress ? userInfo.shippingAddress.email : userInfo.billingAddress.email,
            },
            products: allProductsData.map((product) => ({
                productId: product._id,
                quantity: getProductQuantity(product._id),
            })),
            requestNotes
        }
    }

    const createPayPalOrder = async (data, actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: pricesDetailsSummary.totalPriceAfterDiscount + shippingCost.forLocalProducts + shippingCost.forInternationalProducts,
                    }
                }
            ]
        });
    }

    const approveOnPayPalOrder = async () => {
        try {
            setIsWaitApproveOnPayPalOrder(true);
            const result = (await axios.put(`${process.env.BASE_API_URL}/orders/handle-checkout-complete/${orderResult.orderId}`)).data;
            const tempAllProductsDataInsideTheCart = JSON.parse(localStorage.getItem("asfour-store-customer-cart"));
            const orderProductsIds = allProductsData.map((product) => product._id);
            localStorage.setItem("asfour-store-customer-cart", JSON.stringify(tempAllProductsDataInsideTheCart.filter((product) => !orderProductsIds.includes(product._id))));
            await router.push(`/confirmation/${result.data.orderId}?country=${countryAsProperty}`);
        }
        catch (err) {
            setIsWaitApproveOnPayPalOrder(false);
        }
    }

    const createPaymentOrder = async (paymentName) => {
        try {
            setIsWaitCreateNewOrder(true);
            const result = (await axios.post(`${process.env.BASE_API_URL}/orders/create-payment-order-by-${paymentName}?country=${countryAsProperty}`, getOrderDetailsForCreating())).data;
            if (!result.error) {
                if (paymentName === "tap") {
                    await router.push(result.data.transaction.url);
                } else if (paymentMethod === "pilisio") {
                    await router.push(result.data.data.invoice_url);
                }
            } else {
                setIsWaitCreateNewOrder(false);
                setErrorMsg(result.msg);
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 2000);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                await router.replace("/auth");
                return;
            }
            setIsWaitCreateNewOrder(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 2000);
        }
    }

    const handleSelectShippingMethod = (newShippingMethod) => {
        setShippingMethod(newShippingMethod);
        setShippingCost(getShippingCost(localAndInternationlProducts.local.length, localAndInternationlProducts.international.length, newShippingMethod, pricesDetailsSummary.totalPriceAfterDiscount));
    }

    return (
        <div className="checkout page d-flex flex-column justify-content-center align-items-center">
            <Head>
                <title>{t("Ubuyblues Store")} - {t("Checkout")}</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                {isWaitApproveOnPayPalOrder && <div className="overlay text-white d-flex flex-column align-items-center justify-content-center">
                    <span class="loader mb-4"></span>
                    <p>{t("Please Wait")} ...</p>
                </div>}
                <Header />
                <div className="page-content">
                    <div className="container-fluid text-white p-4">
                        <h1 className="h3 mb-4 fw-bold text-center">{t("Welcome To You In Checkout Page")}</h1>
                        {Object.keys(storeDetails).length > 0 ?
                            allProductsData.length > 0 ? <div className="row align-items-center">
                                <div className="col-xl-6">
                                    <h6 className="mb-4 fw-bold">{t("Billing Details")}</h6>
                                    <form className="edit-customer-billing-address-form" onSubmit={(e) => e.preventDefault()}>
                                        <section className="first-and-last-name mb-4">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <h6>{t("First Name")} <span className="text-danger">*</span></h6>
                                                    <input
                                                        type="text"
                                                        className={`p-2 ${formValidationErrors.firstName_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                        placeholder={t("Please Enter First Name Here")}
                                                        defaultValue={userInfo ? userInfo.billingAddress.firstName : ""}
                                                        onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, firstName: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false) }}
                                                    />
                                                    {formValidationErrors.firstName_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{t(formValidationErrors.firstName_for_billing_address)}</span>
                                                    </p>}
                                                </div>
                                                <div className="col-md-6">
                                                    <h6>{t("Last Name")} <span className="text-danger">*</span></h6>
                                                    <input
                                                        type="text"
                                                        className={`p-2 ${formValidationErrors.last_name_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                        placeholder={t("Please Enter Last Name Here")}
                                                        defaultValue={userInfo ? userInfo.billingAddress.lastName : ""}
                                                        onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, lastName: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false) }}
                                                    />
                                                    {formValidationErrors.last_name_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{t(formValidationErrors.last_name_for_billing_address)}</span>
                                                    </p>}
                                                </div>
                                            </div>
                                        </section>
                                        <section className="company-name mb-4">
                                            <h6>{t("Company Name")} ({t("Optional")})</h6>
                                            <input
                                                type="text"
                                                className="p-2"
                                                placeholder={t("Please Enter Company Name Here")}
                                                defaultValue={userInfo ? userInfo.billingAddress.companyName : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, companyName: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                        </section>
                                        <section className="country mb-4">
                                            <h6>{t("Country / Area")} <span className="text-danger">*</span></h6>
                                            <select
                                                className={`p-2 ${formValidationErrors.country_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                onChange={(e) => handleSelectCountry(e.target.value, "billing")}
                                                style={{
                                                    backgroundColor: "var(--main-color-one)",
                                                }}
                                            >
                                                <option value={countries[getCountryCode(userInfo.billingAddress.country)].name} hidden>{userInfo.billingAddress.country}</option>
                                                {countryList.map((country) => (
                                                    <option key={country.name} value={country.name}>
                                                        {country.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {formValidationErrors.country_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                <span>{t(formValidationErrors.country_for_billing_address)}</span>
                                            </p>}
                                        </section>
                                        <section className="street-address mb-4">
                                            <h6>{t("Street Address / Neighborhood")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.street_address_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter Street Address / Neighborhood Here")}
                                                defaultValue={userInfo ? userInfo.billingAddress.streetAddress : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, streetAddress: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.street_address_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                <span>{t(formValidationErrors.street_address_for_billing_address)}</span>
                                            </p>}
                                        </section>
                                        <section className="apartment-number mb-4">
                                            <h6>{t("Apartment Number, Ward, Unit, Etc")} . ( {t("Optional")} )</h6>
                                            <input
                                                type="number"
                                                className="p-2"
                                                placeholder={t("Please Enter Apartment Number, Ward, Unit, Etc Here")}
                                                defaultValue={userInfo ? userInfo.billingAddress.apartmentNumber : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, apartmentNumber: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                        </section>
                                        <section className="city-number mb-4">
                                            <h6>{t("City")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.city_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter City Name Here")}
                                                defaultValue={userInfo ? userInfo.billingAddress.city : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, city: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.city_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                <span>{t(formValidationErrors.city_for_billing_address)}</span>
                                            </p>}
                                        </section>
                                        <section className="postal-code-number mb-4">
                                            <h6>{t("Postal Code / Zip")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.postal_code_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter Postal Code / Zip Here")}
                                                defaultValue={userInfo ? userInfo.billingAddress.postalCode : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, postalCode: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.postal_code_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                <span>{t(formValidationErrors.postal_code_for_billing_address)}</span>
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
                                                        value={"00" + countries[getCountryCode(userInfo.billingAddress.country)].phone}
                                                    />
                                                </div>
                                                <div className="col-md-10">
                                                    <input
                                                        type="text"
                                                        className={`p-2 ${formValidationErrors.phone_number_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                        placeholder={t("Please Enter Phone Number")}
                                                        defaultValue={userInfo ? getPhoneNumberFromString(userInfo.billingAddress.phoneNumber, getCountryCode(userInfo.billingAddress.country)) : ""}
                                                        onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, phoneNumber: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
                                                    />
                                                </div>
                                            </div>
                                            {formValidationErrors.phone_number_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                <span>{t(formValidationErrors.phone_number_for_billing_address)}</span>
                                            </p>}
                                        </section>
                                        <section className="email mb-4">
                                            <h6>{t("Email")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.email_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter Email Here")}
                                                defaultValue={userInfo ? userInfo.billingAddress.email : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, email: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.email_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                <span>{t(formValidationErrors.email_for_billing_address)}</span>
                                            </p>}
                                        </section>
                                    </form>
                                    {!userInfo._id && <div className="form-check mb-3">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            defaultChecked={isSavePaymentInfo}
                                            id="flexCheckDefault"
                                            onChange={(e) => setIsSavePaymentInfo(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="flexCheckDefault">
                                            {t("Do You Want To Save Payment Information ?")}
                                        </label>
                                    </div>}
                                    <div className="form-check mb-3">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="flexCheckDefault"
                                            onChange={(e) => handleIsShippingToOtherAddress(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="flexCheckDefault">
                                            {t("Do You Want To Ship To A Different Address ?")}
                                        </label>
                                    </div>
                                    {isShippingToOtherAddress && <form className="edit-customer-shipping-address-form" onSubmit={(e) => e.preventDefault()}>
                                        <section className="first-and-last-name mb-4">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <h6>{t("First Name")} <span className="text-danger">*</span></h6>
                                                    <input
                                                        type="text"
                                                        className={`p-2 ${formValidationErrors.first_name_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                        placeholder={t("Please Enter First Name Here")}
                                                        defaultValue={userInfo ? userInfo.shippingAddress.firstName : ""}
                                                        onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, firstName: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                                    />
                                                    {formValidationErrors.first_name_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{t(formValidationErrors.first_name_for_shipping_address)}</span>
                                                    </p>}
                                                </div>
                                                <div className="col-md-6">
                                                    <h6>{t("Last Name")} <span className="text-danger">*</span></h6>
                                                    <input
                                                        type="text"
                                                        className={`p-2 ${formValidationErrors.last_name_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                        placeholder={t("Please Enter Last Name Here")}
                                                        defaultValue={userInfo ? userInfo.shippingAddress.lastName : ""}
                                                        onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, lastName: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                                    />
                                                    {formValidationErrors.last_name_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{t(formValidationErrors.last_name_for_shipping_address)}</span>
                                                    </p>}
                                                </div>
                                            </div>
                                        </section>
                                        <section className="company-name mb-4">
                                            <h6>{t("Company Name")} ({t("Optional")})</h6>
                                            <input
                                                type="text"
                                                className="p-2"
                                                placeholder={t("Please Enter Company Name Here")}
                                                defaultValue={userInfo ? userInfo.shippingAddress.companyName : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, companyName: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                        </section>
                                        <section className="country mb-4">
                                            <h6>{t("Country / Area")} <span className="text-danger">*</span></h6>
                                            <select
                                                className={`p-2 ${formValidationErrors.country_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                onChange={(e) => handleSelectCountry(e.target.value, "shipping")}
                                                style={{
                                                    backgroundColor: "var(--main-color-one)",
                                                }}
                                            >
                                                <option value={countries[getCountryCode(userInfo.shippingAddress.country)].name} hidden>{userInfo.shippingAddress.country}</option>
                                                {countryList.map((country) => (
                                                    <option key={country.name} value={country.name}>
                                                        {country.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {formValidationErrors.country_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                <span>{formValidationErrors.country_for_shipping_address}</span>
                                            </p>}
                                        </section>
                                        <section className="street-address mb-4">
                                            <h6>{t("Street Address / Neighborhood")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.street_address_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter Street Address / Neighborhood Here")}
                                                defaultValue={userInfo ? userInfo.shippingAddress.streetAddress : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, streetAddress: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.street_address_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                <span>{t(formValidationErrors.street_address_for_shipping_address)}</span>
                                            </p>}
                                        </section>
                                        <section className="apartment-number mb-4">
                                            <h6>{t("Apartment Number, Ward, Unit, Etc")} . ( {t("Optional")} )</h6>
                                            <input
                                                type="number"
                                                className="p-2"
                                                placeholder={t("Please Enter Apartment Number, Ward, Unit, Etc Here")}
                                                defaultValue={userInfo ? userInfo.shippingAddress.apartmentNumber.toString() : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, apartmentNumber: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                        </section>
                                        <section className="city-number mb-4">
                                            <h6>{t("City")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.city_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter City Name Here")}
                                                defaultValue={userInfo ? userInfo.shippingAddress.city : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, city: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.city_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                <span>{t(formValidationErrors.city_for_shipping_address)}</span>
                                            </p>}
                                        </section>
                                        <section className="postal-code-number mb-4">
                                            <h6>{t("Postal Code / Zip")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.postal_code_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder="Please Enter Postal Code / Zip Here"
                                                defaultValue={userInfo ? userInfo.shippingAddress.postalCode.toString() : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, postalCode: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.postal_code_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                <span>{t(formValidationErrors.postal_code_for_shipping_address)}</span>
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
                                                        value={"00" + countries[getCountryCode(userInfo.shippingAddress.country)].phone}
                                                    />
                                                </div>
                                                <div className="col-md-10">
                                                    <input
                                                        type="text"
                                                        className={`p-2 ${formValidationErrors.phone_number_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                        placeholder={t("Please Enter Phone Number Here")}
                                                        defaultValue={userInfo ? getPhoneNumberFromString(userInfo.shippingAddress.phoneNumber, getCountryCode(userInfo.shippingAddress.country)) : ""}
                                                        onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, phoneNumber: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
                                                    />
                                                </div>
                                            </div>
                                            {formValidationErrors.phone_number_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                <span>{t(formValidationErrors.phone_number_for_shipping_address)}</span>
                                            </p>}
                                        </section>
                                        <section className="email mb-4">
                                            <h6>{t("Email")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.email_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter Email Here")}
                                                defaultValue={userInfo ? userInfo.shippingAddress.email : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, email: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.email_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                <span>{t(formValidationErrors.email_for_shipping_address)}</span>
                                            </p>}
                                        </section>
                                    </form>}
                                    <h6 className="mb-3">{t("Request Notes")} ( {t("Optional")} )</h6>
                                    <textarea
                                        className="p-2"
                                        placeholder={t("Notes About Request, Example: Note About Request Delivery")}
                                        onChange={(e) => setRequestNotes(e.target.value.trim())}
                                    ></textarea>
                                </div>
                                <div className="col-xl-6">
                                    <section className="order-total border border-3 p-4 ps-md-5 pe-md-5 text-start" id="order-total">
                                        <h5 className="fw-bold mb-5 text-center">{t("Your Request")}</h5>
                                        <div className="row total pb-3 mb-5">
                                            <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                {t("Product")}
                                            </div>
                                            <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                {t("Sum")}
                                            </div>
                                        </div>
                                        {allProductsData.map((product, productIndex) => (
                                            <div className="row total pb-3 mb-5" key={productIndex}>
                                                <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                    {i18n.language !== "ar" ? <span>
                                                        ( {product.name} ) x {getProductQuantity(product._id)}
                                                    </span> : <span>
                                                        ( {product.name} ) {getProductQuantity(product._id)} x
                                                    </span>}
                                                </div>
                                                <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                    {(product.price * getProductQuantity(product._id) * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="row total-price-before-discount total pb-3 mb-5">
                                            <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                {t("Total Price Before Discount")}
                                            </div>
                                            <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                {(pricesDetailsSummary.totalPriceBeforeDiscount * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                            </div>
                                        </div>
                                        <div className="row total-price-discount total pb-3 mb-5">
                                            <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                {t("Total Discount")}
                                            </div>
                                            <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                {(pricesDetailsSummary.totalDiscount * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                            </div>
                                        </div>
                                        <div className="row total-price-after-discount total pb-3 mb-4">
                                            <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                {t("Total Price After Discount")}
                                            </div>
                                            <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                {(pricesDetailsSummary.totalPriceAfterDiscount * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                            </div>
                                        </div>
                                        {localAndInternationlProducts.local.length > 0 && <div className="row shipping-cost-for-local-products total pb-3 mb-4">
                                            <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                {t(localAndInternationlProducts.international.length > 0 ? "Shipping Cost For Local Products" : "Shipping Cost")}
                                            </div>
                                            <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                {(shippingCost.forLocalProducts).toFixed(2)} {t("KWD")}
                                            </div>
                                        </div>}
                                        {localAndInternationlProducts.international.length > 0 && <div className="row shipping-cost-for-international-products total pb-3 mb-4">
                                            <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                {t(localAndInternationlProducts.local.length > 0 ? "Shipping Cost For International Products" : "Shipping Cost")}
                                            </div>
                                            <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                {(shippingCost.forInternationalProducts * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                            </div>
                                        </div>}
                                        {/* Start Shipping Methods Section */}
                                        <section className="shipping-methods mb-4 border border-2 p-3 mb-4">
                                            <h5 className={`fw-bold mb-5 text-center bg-white text-dark p-3`}>{t("Shipping Methods")}</h5>
                                            {localAndInternationlProducts.local.length > 0 && <>
                                                {localAndInternationlProducts.international.length > 0 && <>
                                                    <h6 className="text-center mb-4">{t("For Local Products")} ( {t("That Are Available Within The Country And Shipped Within The Same Country")} )</h6>
                                                    <h6 className="text-center mb-3 fw-bold">{t("Product Names")} :</h6>
                                                    <ul className={`mb-5 border border-2 p-3`}>
                                                        {localAndInternationlProducts.local.map((product, productIndex) => <li key={productIndex}>{product} .</li>)}
                                                    </ul>
                                                </>}
                                                <div className={`row align-items-center mb-5`}>
                                                    <div className="col-md-6">
                                                        <input
                                                            type="radio"
                                                            checked={shippingMethod.forLocalProducts === "normal"}
                                                            id="local-normal-shipping-method-radio"
                                                            className={`radio-input ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                                            name="radioGroup1"
                                                            onChange={() => handleSelectShippingMethod({ ...shippingMethod, forLocalProducts: "normal" })}
                                                        />
                                                        <label htmlFor="local-normal-shipping-method-radio" onClick={() => handleSelectShippingMethod({ ...shippingMethod, forLocalProducts: "normal" })}>{t("Normal")}</label>
                                                    </div>
                                                    <div className="col-md-6 text-md-end">
                                                        <span className="p-3 border border-3">( 2 - 5 ) {t("Work Days")}</span>
                                                    </div>
                                                </div>
                                                <div className={`row align-items-center pt-4 mb-5`}>
                                                    <div className="col-md-6">
                                                        <input
                                                            type="radio"
                                                            checked={shippingMethod.forLocalProducts === "ubuyblues"}
                                                            id="ubuyblues-shipping-method-radio"
                                                            className={`radio-input ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                                            name="radioGroup1"
                                                            onChange={() => handleSelectShippingMethod({ ...shippingMethod, forLocalProducts: "ubuyblues" })}
                                                        />
                                                        <label htmlFor="ubuyblues-shipping-method-radio" onClick={() => handleSelectShippingMethod({ ...shippingMethod, forLocalProducts: "ubuyblues" })}>{t("Ubuyblues")}</label>
                                                    </div>
                                                    <div className="col-md-6 text-md-end">
                                                        <span className="p-3 border border-3">( {(3 * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)} )</span>
                                                    </div>
                                                </div>
                                            </>}
                                            {localAndInternationlProducts.international.length > 0 && <>
                                                {localAndInternationlProducts.local.length > 0 && <>
                                                    <h6 className="text-center mb-4 border-top pt-4">{t("For International Products")} ( {t("That Are Available Within One Country And Shipped To Another Country")} ) :</h6>
                                                    <h6 className="text-center mb-3 fw-bold">{t("Product Names")} :</h6>
                                                    <ul className={`mb-5 border border-2 p-3`}>
                                                        {localAndInternationlProducts.international.map((product, productIndex) => <li key={productIndex} className={`${productIndex !== localAndInternationlProducts.international.length - 1 ? "mb-3" : ""}`}>{product} .</li>)}
                                                    </ul>
                                                </>}
                                                <div className={`row align-items-center pt-4 mb-5`}>
                                                    <div className="col-md-6">
                                                        <input
                                                            type="radio"
                                                            checked={shippingMethod.forInternationalProducts === "normal"}
                                                            id="international-normal-shipping-method-radio"
                                                            className={`radio-input ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                                            name="radioGroup2"
                                                            onChange={() => handleSelectShippingMethod({ ...shippingMethod, forInternationalProducts: "normal" })}
                                                        />
                                                        <label htmlFor="normal-shipping-method-radio" onClick={() => handleSelectShippingMethod({ ...shippingMethod, forInternationalProducts: "normal" })}>{t("Normal")}</label>
                                                    </div>
                                                    <div className="col-md-6 text-md-end">
                                                        <span className="p-3 border border-3">( 10 - 15 ) {t("Work Days")}</span>
                                                    </div>
                                                </div>
                                                <div className={`row align-items-center pt-4 mb-5`}>
                                                    <div className="col-md-6">
                                                        <input
                                                            type="radio"
                                                            checked={shippingMethod.forInternationalProducts === "fast"}
                                                            id="international-fast-shipping-method-radio"
                                                            className={`radio-input ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                                            name="radioGroup2"
                                                            onChange={() => handleSelectShippingMethod({ ...shippingMethod, forInternationalProducts: "fast" })}
                                                        />
                                                        <label htmlFor="international-fast-shipping-method-radio" onClick={() => handleSelectShippingMethod({ ...shippingMethod, forInternationalProducts: "fast" })}>{t("Fast")}</label>
                                                    </div>
                                                    <div className="col-md-6 text-md-end">
                                                        <span className="p-3 border border-3">( 6 - 9 ) {t("Work Days")}</span>
                                                    </div>
                                                </div>
                                            </>}
                                        </section>
                                        {/* End Shipping Methods Section */}
                                        {/* Start Payement Methods Section */}
                                        <section className="payment-methods mb-4 border border-2 p-3 mb-4">
                                            <h5 className={`fw-bold mb-4 text-center bg-white text-dark p-3`}>{t("Payment Methods")}</h5>
                                            <div className={`row align-items-center pt-3 ${paymentMethod === "paypal" ? "mb-3" : ""}`}>
                                                <div className="col-md-6 text-start">
                                                    <input
                                                        type="radio"
                                                        checked={paymentMethod === "paypal"}
                                                        id="paypal-radio"
                                                        className={`radio-input ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                                        name="radioGroup"
                                                        onChange={() => setPaymentMethod("paypal")}
                                                    />
                                                    <label htmlFor="paypal-radio" onClick={() => setPaymentMethod("paypal")}>{t("PayPal")}</label>
                                                </div>
                                                <div className="col-md-6 text-md-end">
                                                    <FaCcPaypal className="icon paypal-icon" />
                                                </div>
                                            </div>
                                            {paymentMethod === "paypal" && isDisplayPaypalPaymentButtons && <PayPalScriptProvider
                                                options={{
                                                    clientId: "test",
                                                    currency: "USD",
                                                    intent: "capture",
                                                }}
                                            >
                                                <PayPalButtons
                                                    style={{ layout: "vertical" }}
                                                    createOrder={createPayPalOrder}
                                                    onApprove={approveOnPayPalOrder}
                                                />
                                            </PayPalScriptProvider>}
                                            <div className={`row align-items-center pt-3 ${paymentMethod === "tap" ? "mb-3" : ""}`}>
                                                <div className="col-md-6 text-start">
                                                    <input
                                                        type="radio"
                                                        checked={paymentMethod === "tap"}
                                                        id="tap-radio"
                                                        className={`radio-input ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                                        name="radioGroup"
                                                        onChange={() => setPaymentMethod("tap")}
                                                    />
                                                    <label htmlFor="tap-radio" onClick={() => setPaymentMethod("tap")}>{t("Tap")}</label>
                                                </div>
                                                <div className="col-md-6 text-md-end">
                                                    <FaTape className="icon tap-icon" />
                                                </div>
                                            </div>
                                            <div className={`row align-items-center pt-3 ${paymentMethod === "pilisio" ? "mb-3" : ""}`}>
                                                <div className="col-md-6 text-start">
                                                    <input
                                                        type="radio"
                                                        checked={paymentMethod === "pilisio"}
                                                        id="tap-radio"
                                                        className={`radio-input ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                                        name="radioGroup"
                                                        onChange={() => setPaymentMethod("pilisio")}
                                                    />
                                                    <label htmlFor="tap-radio" onClick={() => setPaymentMethod("pilisio")}>{t("Pilisio")}</label>
                                                </div>
                                                <div className="col-md-6 text-md-end">
                                                    <FaTape className="icon tap-icon" />
                                                </div>
                                            </div>
                                            {paymentMethod === "paypal" && !isDisplayPaypalPaymentButtons && <button
                                                className="checkout-link p-2 w-100 mx-auto d-block text-center fw-bold mt-3"
                                                onClick={handleSelectPaypalPayment}
                                            >
                                                {t("Confirm Request")}
                                            </button>}
                                            {paymentMethod === "tap" && !isWaitCreateNewOrder && !errorMsg && <button
                                                className="checkout-link p-2 w-100 mx-auto d-block text-center fw-bold mt-3"
                                                onClick={() => createPaymentOrder("tap")}
                                            >
                                                {t("Confirm Request")}
                                            </button>}
                                            {isWaitCreateNewOrder && <button
                                                className="checkout-link p-2 w-100 mx-auto d-block text-center fw-bold mt-3"
                                                disabled
                                            >
                                                {t("Please Waiting")}
                                            </button>}
                                            {errorMsg && <button
                                                className="checkout-link p-2 w-100 mx-auto d-block text-center fw-bold mt-3 bg-danger text-white"
                                                disabled
                                            >
                                                {t(errorMsg)}
                                            </button>}
                                        </section>
                                        {/* End Payement Methods Section */}
                                    </section>
                                </div>
                            </div> : <NotFoundError errorMsg={t("Sorry, Can't Find Any Products For This Store Your Cart !!")} />
                            : <NotFoundError errorMsg={t("Sorry, This Store Is Not Found !!")} />
                        }
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}

export async function getServerSideProps({ query }) {
    const allowedCountries = ["kuwait", "germany", "turkey"];
    if (query.country) {
        if (!allowedCountries.includes(query.country)) {
            if (query.storeId) {
                return {
                    redirect: {
                        permanent: false,
                        destination: `/checkout?storeId=${query.storeId}`,
                    },
                    props: {
                        countryAsProperty: "kuwait",
                        storeId: query.storeId,
                    },
                }
            }
            return {
                redirect: {
                    permanent: false,
                    destination: "/cart",
                },
                props: {
                    countryAsProperty: "kuwait",
                },
            }
        }
        if (Object.keys(query).filter((key) => key !== "country" && key !== "storedId").length > 2) {
            return {
                redirect: {
                    permanent: false,
                    destination: `/checkout?country=${query.country}&storeId=${query.storeId}`,
                },
                props: {
                    countryAsProperty: query.country,
                    storeId: query.storeId,
                },
            }
        }
        return {
            props: {
                countryAsProperty: query.country,
                storeId: query.storeId,
            },
        }
    }
    if (query.storeId) {
        return {
            props: {
                countryAsProperty: "kuwait",
                storeId: query.storeId,
            },
        }
    }
    return {
        redirect: {
            permanent: false,
            destination: "/cart",
        },
        props: {
            countryAsProperty: "kuwait",
        },
    }
}