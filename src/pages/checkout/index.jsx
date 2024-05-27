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
import { getStoreDetails, getProductQuantity, calcTotalPrices, isExistOfferOnProduct } from "../../../public/global_functions/popular";
import { getCurrencyNameByCountry, getUSDPriceAgainstCurrency } from "../../../public/global_functions/prices";
import { getUserInfo, inputValuesValidation } from "../../../public/global_functions/validations";

export default function Checkout({ countryAsProperty, storeId }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [isGetUserInfo, setIsGetUserInfo] = useState(true);

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [storeDetails, setStoreDetails] = useState({});

    const [allProductsData, setAllProductsData] = useState([]);

    const [currentDate, setCurrentDate] = useState("");

    const [pricesDetailsSummary, setPricesDetailsSummary] = useState({
        totalPriceBeforeDiscount: 0,
        totalDiscount: 0,
        totalPriceAfterDiscount: 0,
    });

    const [userInfo, setUserInfo] = useState("");

    const [requestNotes, setRequestNotes] = useState("");

    const [isShippingToOtherAddress, setIsShippingToOtherAddress] = useState(false);

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [paymentMethod, setPaymentMethod] = useState("tap");

    const [isDisplayPaypalPaymentButtons, setIsDisplayPaypalPaymentButtons] = useState(false);

    const [isWaitApproveOnPayPalOrder, setIsWaitApproveOnPayPalOrder] = useState(false);

    const [isWaitCreateNewOrder, setIsWaitCreateNewOrder] = useState(false);

    const [isSavePaymentInfo, setIsSavePaymentInfo] = useState(false);

    const countryList = Object.values(countries);

    const router = useRouter();

    const { t, i18n } = useTranslation();

    useEffect(() => {
        setIsLoadingPage(true);
        getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(getCurrencyNameByCountry(countryAsProperty));
            if (!isGetUserInfo) {
                setIsLoadingPage(false);
            }
        })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
    }, [countryAsProperty]);

    useEffect(() => {
        const userLanguage = localStorage.getItem("asfour-store-language");
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
        getStoreDetails(storeId)
            .then(async (result) => {
                if (!result.error) {
                    if (result.data?.status === "approving") {
                        setStoreDetails(result.data);
                        if (userToken) {
                            result = await getUserInfo();
                            if (!result.error) {
                                setUserInfo(result.data);
                            } else {
                                localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                                await router.push("/auth");
                            }
                        } else {
                            const userAddresses = JSON.parse(localStorage.getItem("asfour-store-user-addresses"));
                            if (userAddresses) {
                                setUserInfo({ billing_address: userAddresses.billing_address, shipping_address: userAddresses.shipping_address });
                                setIsSavePaymentInfo(true);
                            } else {
                                setUserInfo({
                                    billing_address: {
                                        first_name: "",
                                        last_name: "",
                                        company_name: "",
                                        country: "Kuwait",
                                        street_address: "",
                                        apartment_number: 1,
                                        city: "",
                                        postal_code: 1,
                                        phone_number: "0096560048235",
                                        email: "",
                                    },
                                    shipping_address: {
                                        first_name: "",
                                        last_name: "",
                                        company_name: "",
                                        country: "Kuwait",
                                        street_address: "",
                                        apartment_number: 1,
                                        city: "",
                                        postal_code: 1,
                                        phone_number: "0096560048235",
                                        email: "",
                                    },
                                });
                            }
                        }
                        const tempAllProductsDataInsideTheCart = JSON.parse(localStorage.getItem("asfour-store-customer-cart"));
                        if (Array.isArray(tempAllProductsDataInsideTheCart)) {
                            if (tempAllProductsDataInsideTheCart.length > 0) {
                                result = await getProductsByIdsAnsStoreId(storeId, tempAllProductsDataInsideTheCart.map((product) => product._id));
                                if (result.data.products.length > 0) {
                                    setCurrentDate(result.data.currentDate);
                                    setPricesDetailsSummary(calcTotalPrices(result.data.currentDate, result.data.products));
                                    setAllProductsData(result.data.products);
                                }
                            }
                        }
                    }
                }
                setIsGetUserInfo(false);
            })
            .catch(async (err) => {
                if (err?.response?.data?.msg === "Unauthorized Error") {
                    localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                    await router.push("/auth");
                } else {
                    setIsLoadingPage(false);
                    setIsErrorMsgOnLoadingThePage(true);
                }
            });
    }, [storeId]);

    useEffect(() => {
        if (!isGetUserInfo) {
            setIsLoadingPage(false);
        }
    }, [isGetUserInfo]);

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    const getProductsByIdsAnsStoreId = async (storeId, productsIds) => {
        try {
            const res = await axios.post(`${process.env.BASE_API_URL}/products/products-by-ids-and-store-id?storeId=${storeId}`, {
                productsIds,
            });
            return res.data;
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

    const createNewOrder = async (orderDetails) => {
        try {
            const res = await axios.post(`${process.env.BASE_API_URL}/orders/create-new-order`, orderDetails);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const handleSelectPaypalPayment = () => {
        const errorsObject = inputValuesValidation([
            {
                name: "first_name_for_billing_address",
                value: userInfo ? userInfo.billing_address.first_name : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, First Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "last_name_for_billing_address",
                value: userInfo ? userInfo.billing_address.last_name : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "country_for_billing_address",
                value: userInfo ? userInfo.billing_address.country : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "street_address_for_billing_address",
                value: userInfo ? userInfo.billing_address.street_address : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "city_for_billing_address",
                value: userInfo ? userInfo.billing_address.city : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "postal_code_for_billing_address",
                value: userInfo ? userInfo.billing_address.postal_code : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "phone_number_for_billing_address",
                value: userInfo.billing_address.phone_number,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                    isValidMobilePhone: {
                        msg: "Sorry, Invalid Mobile Phone !!",
                        countryCode: getCountryCode(userInfo.billing_address.country),
                    },
                },
            },
            {
                name: "email_for_billing_address",
                value: userInfo ? userInfo.billing_address.email : "",
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
                name: "first_name_for_shipping_address",
                value: userInfo ? userInfo.shipping_address.first_name : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, First Name Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "last_name_for_shipping_address",
                value: userInfo ? userInfo.shipping_address.last_name : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "country_for_shipping_address",
                value: userInfo ? userInfo.shipping_address.country : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "street_address_for_shipping_address",
                value: userInfo ? userInfo.shipping_address.street_address : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "city_for_shipping_address",
                value: userInfo ? userInfo.shipping_address.city : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "postal_code_for_shipping_address",
                value: userInfo ? userInfo.shipping_address.postal_code : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "phone_number_for_shipping_address",
                value: userInfo.shipping_address.phone_number,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                    isValidMobilePhone: {
                        msg: "Sorry, Invalid Mobile Phone !!",
                        countryCode: getCountryCode(userInfo.shipping_address.country),
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "email_for_shipping_address",
                value: userInfo ? userInfo.shipping_address.email : "",
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
            if (isSavePaymentInfo) {
                localStorage.setItem("asfour-store-user-addresses", JSON.stringify({
                    billing_address: {
                        first_name: userInfo ? userInfo.billing_address.first_name : "",
                        last_name: userInfo ? userInfo.billing_address.last_name : "",
                        company_name: userInfo ? userInfo.billing_address.company_name : "",
                        country: userInfo.billing_address.country,
                        street_address: userInfo ? userInfo.billing_address.street_address : "",
                        apartment_number: userInfo.billing_address.apartment_number,
                        city: userInfo ? userInfo.billing_address.city : "",
                        postal_code: userInfo.billing_address.postal_code,
                        phone_number: userInfo.billing_address.phone_number,
                        email: userInfo ? userInfo.billing_address.email : "",
                    },
                    shipping_address: {
                        first_name: userInfo && isShippingToOtherAddress ? userInfo.shipping_address.first_name : userInfo.billing_address.first_name,
                        last_name: userInfo && isShippingToOtherAddress ? userInfo.shipping_address.last_name : userInfo.billing_address.last_name,
                        company_name: userInfo && isShippingToOtherAddress ? userInfo.shipping_address.company_name : userInfo.billing_address.company_name,
                        country: userInfo && isShippingToOtherAddress ? userInfo.shipping_address.country : userInfo.billing_address.country,
                        street_address: userInfo && isShippingToOtherAddress ? userInfo.shipping_address.street_address : userInfo.billing_address.street_address,
                        apartment_number: userInfo && isShippingToOtherAddress ? userInfo.shipping_address.apartment_number : userInfo.billing_address.apartment_number,
                        city: userInfo && isShippingToOtherAddress ? userInfo.shipping_address.city : userInfo.billing_address.city,
                        postal_code: userInfo && isShippingToOtherAddress ? userInfo.shipping_address.postal_code : userInfo.billing_address.postal_code,
                        phone_number: userInfo && isShippingToOtherAddress ? userInfo.shipping_address.phone_number : userInfo.billing_address.phone_number,
                        email: userInfo && isShippingToOtherAddress ? userInfo.shipping_address.email : userInfo.billing_address.email,
                    },
                }));
            } else {
                localStorage.removeItem("asfour-store-user-addresses");
            }
            setIsDisplayPaypalPaymentButtons(true);
        }
    }

    const createPayPalOrder = async (data, actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: pricesDetailsSummary.totalPriceAfterDiscount,
                    }
                }
            ]
        });
    }

    const approveOnPayPalOrder = async () => {
        try {
            setIsWaitApproveOnPayPalOrder(true);
            const result = await createNewOrder({
                storeId,
                customerId: userInfo ? userInfo._id : "",
                order_amount: pricesDetailsSummary.totalPriceAfterDiscount,
                checkout_status: "checkout_successful",
                billing_address: {
                    first_name: userInfo.billing_address.first_name,
                    last_name: userInfo.billing_address.last_name,
                    company_name: userInfo.billing_address.company_name,
                    country: userInfo.billing_address.country,
                    street_address: userInfo.billing_address.street_address,
                    apartment_number: userInfo.billing_address.apartment_number,
                    city: userInfo.billing_address.city,
                    postal_code: userInfo.billing_address.postal_code,
                    phone: userInfo.billing_address.phone_number,
                    email: userInfo.billing_address.email,
                },
                shipping_address: {
                    first_name: isShippingToOtherAddress ? userInfo.shipping_address.first_name : userInfo.billing_address.first_name,
                    last_name: isShippingToOtherAddress ? userInfo.shipping_address.last_name : userInfo.billing_address.last_name,
                    company_name: isShippingToOtherAddress ? userInfo.shipping_address.company_name : userInfo.billing_address.company_name,
                    country: isShippingToOtherAddress ? userInfo.shipping_address.country : userInfo.billing_address.country,
                    street_address: isShippingToOtherAddress ? userInfo.shipping_address.street_address : userInfo.billing_address.street_address,
                    apartment_number: isShippingToOtherAddress ? userInfo.shipping_address.apartment_number : userInfo.billing_address.apartment_number,
                    city: isShippingToOtherAddress ? userInfo.shipping_address.city : userInfo.billing_address.city,
                    postal_code: isShippingToOtherAddress ? userInfo.shipping_address.postal_code : userInfo.billing_address.postal_code,
                    phone: isShippingToOtherAddress ? userInfo.shipping_address.phone_number : userInfo.billing_address.phone_number,
                    email: isShippingToOtherAddress ? userInfo.shipping_address.email : userInfo.billing_address.email,
                },
                order_products: allProductsData.map((product) => ({
                    productId: product._id,
                    name: product.name,
                    unit_price: product.price,
                    discount: isExistOfferOnProduct(currentDate, product.startDiscountPeriod, product.endDiscountPeriod) ? product.discountInOfferPeriod : product.discount,
                    total_amount: product.price * getProductQuantity(product._id),
                    quantity: getProductQuantity(product._id),
                    image_path: product.imagePath,
                })),
                requestNotes,
            });
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
        try{
            setIsWaitCreateNewOrder(true);
            const res = await axios.post(`${process.env.BASE_API_URL}/orders/create-payment-order-by-${paymentName}?country=${countryAsProperty}`, {
                storeId,
                customerId: userInfo ? userInfo._id : "",
                order_amount: pricesDetailsSummary.totalPriceAfterDiscount,
                billing_address: {
                    first_name: userInfo.billing_address.first_name,
                    last_name: userInfo.billing_address.last_name,
                    company_name: userInfo.billing_address.company_name,
                    country: userInfo.billing_address.country,
                    street_address: userInfo.billing_address.street_address,
                    apartment_number: userInfo.billing_address.apartment_number,
                    city: userInfo.billing_address.city,
                    postal_code: userInfo.billing_address.postal_code,
                    phone: userInfo.billing_address.phone_number,
                    email: userInfo.billing_address.email,
                },
                shipping_address: {
                    first_name: isShippingToOtherAddress ? userInfo.shipping_address.first_name : userInfo.billing_address.first_name,
                    last_name: isShippingToOtherAddress ? userInfo.shipping_address.last_name : userInfo.billing_address.last_name,
                    company_name: isShippingToOtherAddress ? userInfo.shipping_address.company_name : userInfo.billing_address.company_name,
                    country: isShippingToOtherAddress ? userInfo.shipping_address.country : userInfo.billing_address.country,
                    street_address: isShippingToOtherAddress ? userInfo.shipping_address.street_address : userInfo.billing_address.street_address,
                    apartment_number: isShippingToOtherAddress ? userInfo.shipping_address.apartment_number : userInfo.billing_address.apartment_number,
                    city: isShippingToOtherAddress ? userInfo.shipping_address.city : userInfo.billing_address.city,
                    postal_code: isShippingToOtherAddress ? userInfo.shipping_address.postal_code : userInfo.billing_address.postal_code,
                    phone: isShippingToOtherAddress ? userInfo.shipping_address.phone_number : userInfo.billing_address.phone_number,
                    email: isShippingToOtherAddress ? userInfo.shipping_address.email : userInfo.billing_address.email,
                },
                order_products: allProductsData.map((product) => ({
                    productId: product._id,
                    name: product.name,
                    unit_price: product.price,
                    discount: isExistOfferOnProduct(currentDate, product.startDiscountPeriod, product.endDiscountPeriod) ? product.discountInOfferPeriod : product.discount,
                    total_amount: product.price * getProductQuantity(product._id),
                    quantity: getProductQuantity(product._id),
                    image_path: product.imagePath,
                })),
                requestNotes
            });
            const result = res.data;
            if (!result.error) {
                if (paymentName === "tap") {
                    await router.push(result.data.transaction.url);
                } else if (paymentMethod === "pilisio") {
                    await router.push(result.data.data.invoice_url);
                }
            }
        }
        catch(err) {
            setIsWaitCreateNewOrder(false);
        }
    }

    return (
        <div className="checkout">
            <Head>
                <title>{t("Ubuyblues Store")} - {t("Checkout")}</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                {isWaitApproveOnPayPalOrder && <div className="overlay text-white d-flex flex-column align-items-center justify-content-center">
                    <span class="loader mb-4"></span>
                    <p>{t("Please Wait")} ...</p>
                </div>}
                <Header />
                <div className="page-content page">
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
                                                        className={`p-2 ${formValidationErrors.first_name_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                        placeholder={t("Please Enter First Name Here")}
                                                        defaultValue={userInfo ? userInfo.billing_address.first_name : ""}
                                                        onChange={(e) => { setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, first_name: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false) }}
                                                    />
                                                    {formValidationErrors.first_name_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{t(formValidationErrors.first_name_for_billing_address)}</span>
                                                    </p>}
                                                </div>
                                                <div className="col-md-6">
                                                    <h6>{t("Last Name")} <span className="text-danger">*</span></h6>
                                                    <input
                                                        type="text"
                                                        className={`p-2 ${formValidationErrors.last_name_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                        placeholder={t("Please Enter Last Name Here")}
                                                        defaultValue={userInfo ? userInfo.billing_address.last_name : ""}
                                                        onChange={(e) => { setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, last_name: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false) }}
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
                                                defaultValue={userInfo ? userInfo.billing_address.company_name : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, company_name: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                        </section>
                                        <section className="country mb-4">
                                            <h6>{t("Country / Area")} <span className="text-danger">*</span></h6>
                                            <select
                                                className={`p-2 ${formValidationErrors.country_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                onChange={(e) => {
                                                    const countryCode = getCountryCode(e.target.value);
                                                    setUserInfo({
                                                        ...userInfo,
                                                        billing_address: {
                                                            ...userInfo.billing_address,
                                                            country: e.target.value,
                                                            phone_number: "00" + countries[countryCode].phone + getPhoneNumberFromString(userInfo.billing_address.phone_number, countryCode),
                                                        },
                                                    });
                                                    setIsDisplayPaypalPaymentButtons(false);
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
                                                defaultValue={userInfo ? userInfo.billing_address.street_address : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, street_address: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
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
                                                defaultValue={userInfo ? userInfo.billing_address.apartment_number : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, apartment_number: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                        </section>
                                        <section className="city-number mb-4">
                                            <h6>{t("City")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.city_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter City Name Here")}
                                                defaultValue={userInfo ? userInfo.billing_address.city : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, city: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.city_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                <span>{t(formValidationErrors.city_for_billing_address)}</span>
                                            </p>}
                                        </section>
                                        <section className="postal-code-number mb-4">
                                            <h6>{t("Postal Code / Zip")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="number"
                                                className={`p-2 ${formValidationErrors.postal_code_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter Postal Code / Zip Here")}
                                                defaultValue={userInfo ? userInfo.billing_address.postal_code : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, postal_code: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
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
                                                        value={"00" + countries[getCountryCode(userInfo.billing_address.country)].phone}
                                                    />
                                                </div>
                                                <div className="col-md-10">
                                                    <input
                                                        type="text"
                                                        className={`p-2 ${formValidationErrors.phone_number_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                        placeholder={t("Please Enter Phone Number")}
                                                        defaultValue={userInfo ? getPhoneNumberFromString(userInfo.billing_address.phone_number, getCountryCode(userInfo.billing_address.country)) : ""}
                                                        onChange={(e) => { setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, phone_number: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
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
                                                defaultValue={userInfo ? userInfo.billing_address.email : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, email: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
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
                                            onChange={(e) => { setIsShippingToOtherAddress(e.target.checked); setIsDisplayPaypalPaymentButtons(false); }}
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
                                                        defaultValue={userInfo ? userInfo.shipping_address.first_name : ""}
                                                        onChange={(e) => { setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, first_name: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
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
                                                        defaultValue={userInfo ? userInfo.shipping_address.last_name : ""}
                                                        onChange={(e) => { setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, last_name: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
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
                                                defaultValue={userInfo ? userInfo.shipping_address.company_name : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, company_name: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                        </section>
                                        <section className="country mb-4">
                                            <h6>{t("Country / Area")} <span className="text-danger">*</span></h6>
                                            <select
                                                className={`p-2 ${formValidationErrors.country_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                onChange={(e) => {
                                                    const countryCode = getCountryCode(e.target.value);
                                                    setUserInfo({
                                                        ...userInfo,
                                                        shipping_address: {
                                                            ...userInfo.shipping_address,
                                                            country: e.target.value,
                                                            phone_number: "00" + countries[countryCode].phone + getPhoneNumberFromString(userInfo.shipping_address.phone_number, countryCode),
                                                        },
                                                    });
                                                    setIsDisplayPaypalPaymentButtons(false);
                                                }}
                                                style={{
                                                    backgroundColor: "var(--main-color-one)",
                                                }}
                                            >
                                                <option value={countries[getCountryCode(userInfo.shipping_address.country)].name} hidden>{userInfo.shipping_address.country}</option>
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
                                                defaultValue={userInfo ? userInfo.shipping_address.street_address : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, street_address: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
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
                                                defaultValue={userInfo ? userInfo.shipping_address.apartment_number.toString() : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, apartment_number: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                        </section>
                                        <section className="city-number mb-4">
                                            <h6>{t("City")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.city_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter City Name Here")}
                                                defaultValue={userInfo ? userInfo.shipping_address.city : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, city: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.city_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                <span>{t(formValidationErrors.city_for_shipping_address)}</span>
                                            </p>}
                                        </section>
                                        <section className="postal-code-number mb-4">
                                            <h6>{t("Postal Code / Zip")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="number"
                                                className={`p-2 ${formValidationErrors.postal_code_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder="Please Enter Postal Code / Zip Here"
                                                defaultValue={userInfo ? userInfo.shipping_address.postal_code.toString() : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, postal_code: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
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
                                                        value={"00" + countries[getCountryCode(userInfo.shipping_address.country)].phone}
                                                    />
                                                </div>
                                                <div className="col-md-10">
                                                    <input
                                                        type="text"
                                                        className={`p-2 ${formValidationErrors.phone_number_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                        placeholder={t("Please Enter Phone Number Here")}
                                                        defaultValue={userInfo ? getPhoneNumberFromString(userInfo.shipping_address.phone_number, getCountryCode(userInfo.shipping_address.country)) : ""}
                                                        onChange={(e) => { setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, phone_number: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
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
                                                defaultValue={userInfo ? userInfo.shipping_address.email : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, email: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
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
                                        {/* Start Payement Methods Section */}
                                        <section className="payment-methods mb-4 border border-2 p-3">
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
                                                className="checkout-link p-2 w-50 mx-auto d-block text-center fw-bold mt-3"
                                                onClick={handleSelectPaypalPayment}
                                            >
                                                {t("Confirm Request")}
                                            </button>}
                                            {paymentMethod === "tap" && !isWaitCreateNewOrder && <button
                                                className="checkout-link p-2 w-50 mx-auto d-block text-center fw-bold mt-3"
                                                onClick={() => createPaymentOrder("tap")}
                                            >
                                                {t("Confirm Request")}
                                            </button>}
                                            {isWaitCreateNewOrder && <button
                                                className="checkout-link p-2 w-50 mx-auto d-block text-center fw-bold mt-3"
                                                disabled
                                            >
                                                {t("Please Waiting ...")}
                                            </button>}
                                            {paymentMethod === "pilisio" && !isWaitCreateNewOrder && <button
                                                className="checkout-link p-2 w-50 mx-auto d-block text-center fw-bold mt-3"
                                                onClick={() => createPaymentOrder("pilisio")}
                                            >
                                                {t("Confirm Request")}
                                            </button>}
                                            {isWaitCreateNewOrder && <button
                                                className="checkout-link p-2 w-50 mx-auto d-block text-center fw-bold mt-3"
                                                disabled
                                            >
                                                {t("Please Waiting ...")}
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