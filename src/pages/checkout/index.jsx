import Head from "next/head";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import LoaderPage from "@/components/LoaderPage";
import axios from "axios";
import { useRouter } from "next/router";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { countries, getCountryCode } from 'countries-list';
import { FaCcPaypal, FaTape } from "react-icons/fa";
import { parsePhoneNumber } from "libphonenumber-js";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import NotFoundError from "@/components/NotFoundError";
import { getStoreDetails, getProductQuantity, calcTotalPrices, isExistOfferOnProduct, getUserInfo, handleSelectUserLanguage, getAppearedSections, getInitialStateForElementBeforeAnimation, getAnimationSettings } from "../../../public/global_functions/popular";
import { getCurrencyNameByCountry, getUSDPriceAgainstCurrency } from "../../../public/global_functions/prices";
import { inputValuesValidation } from "../../../public/global_functions/validations";
import { SiBinance } from "react-icons/si";
import Link from "next/link";
import { motion } from "motion/react";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";

export default function Checkout({ countryAsProperty, storeId }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

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
        orderAmount: 0
    });

    const [userInfo, setUserInfo] = useState({});

    const [userToken, setUserToken] = useState();

    const [isAppearedBinancePaymentMethod, setIsAppearedBinancePaymentMethod] = useState(false);

    const [isGetUserInfo, setIsGetUserInfo] = useState(true);

    const [requestNotes, setRequestNotes] = useState("");

    const [isShippingToOtherAddress, setIsShippingToOtherAddress] = useState(false);

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [couponCode, setCouponCode] = useState("");

    const [paymentGateway, setPaymentGateway] = useState("tap");

    const [shippingMethod, setShippingMethod] = useState({ forLocalProducts: "ubuyblues", forInternationalProducts: "normal" });

    const [localAndInternationlProducts, setLocalAndInternationlProducts] = useState({ local: [], international: [] });

    const [shippingCost, setShippingCost] = useState({ forLocalProducts: 0, forInternationalProducts: 0 });

    const [totalAmount, setTotalAmount] = useState(0);

    const [isDisplayPaypalPaymentButtons, setIsDisplayPaypalPaymentButtons] = useState(false);

    const [isWaitApplyCoupon, setIsWaitApplyCoupon] = useState(false);

    const [isWaitApproveOnPayPalOrder, setIsWaitApproveOnPayPalOrder] = useState(false);

    const [isWaitCreateNewOrder, setIsWaitCreateNewOrder] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [isSavePaymentInfo, setIsSavePaymentInfo] = useState(false);

    const [isAgreeOnTermsAndConditions, setIsAgreeOnTermsAndConditions] = useState(false);

    const [orderResult, setOrderResult] = useState({});

    const countryList = Object.values(countries);

    const router = useRouter();

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
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
            .catch((err) => {
                setIsLoadingPage(false);
                setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
            });
    }, [countryAsProperty]);

    useEffect(() => {
        getStoreDetails(storeId)
            .then(async (result) => {
                if (!result.error) {
                    if (result.data?.status === "approving") {
                        setStoreDetails(result.data);
                        const tempAllProductsDataInsideTheCart = JSON.parse(localStorage.getItem(process.env.USER_CART_NAME_IN_LOCAL_STORAGE));
                        if (Array.isArray(tempAllProductsDataInsideTheCart)) {
                            if (tempAllProductsDataInsideTheCart.length > 0) {
                                result = await getProductsByIdsAndStoreId(storeId, tempAllProductsDataInsideTheCart.map((product) => product._id));
                                if (result.data.products.length > 0) {
                                    setCurrentDate(result.data.currentDate);
                                    const totalPrices = calcTotalPrices(result.data.currentDate, result.data.products);
                                    setPricesDetailsSummary(totalPrices);
                                    setAllProductsData(result.data.products);
                                    const userData = await getAndSetUserInfoData();
                                    setUserInfo(userData);
                                    const localAndInternationlProductsTemp = getLocalAndInternationalProducts(result.data.products, isShippingToOtherAddress ? userData.shippingAddress.country : userData.billingAddress.country);
                                    setLocalAndInternationlProducts(localAndInternationlProductsTemp);
                                    const tempShippingCost = getShippingCost(localAndInternationlProductsTemp.local.length, localAndInternationlProductsTemp.international.length, shippingMethod, totalPrices.totalPriceAfterDiscount);
                                    setShippingCost(tempShippingCost);
                                    setTotalAmount(totalPrices.totalPriceAfterDiscount + tempShippingCost.forLocalProducts + tempShippingCost.forInternationalProducts + 0);
                                    const appearedSectionsResult = await getAppearedSections();
                                    const appearedSectionsLength = appearedSectionsResult.data.length;
                                    if (appearedSectionsLength > 0) {
                                        for (let i = 0; i < appearedSectionsLength; i++) {
                                            if (appearedSectionsResult.data[i].sectionName === "binance payment method" && appearedSectionsResult.data[i].isAppeared) {
                                                setIsAppearedBinancePaymentMethod(true);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                setIsGetUserInfo(false);
                setIsGetStoreDetails(false);
            })
            .catch((err) => {
                if (err?.response?.status === 401) {
                    localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                    setIsGetUserInfo(false);
                }
                else {
                    setIsLoadingPage(false);
                    setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                }
            });
    }, [storeId]);

    useEffect(() => {
        if (!isGetUserInfo && !isGetStoreDetails) {
            setIsLoadingPage(false);
        }
    }, [isGetUserInfo, isGetStoreDetails]);

    const getAndSetUserInfoAsGuest = () => {
        const userAddresses = JSON.parse(localStorage.getItem(process.env.USER_ADDRESSES_FIELD_NAME_IN_LOCAL_STORAGE));
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
                    country: "KW",
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
                    country: "KW",
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
            const userToken = localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
            if (userToken) {
                const result = await getUserInfo();
                if (!result.error) {
                    setUserInfo(result.data);
                    setUserToken(userToken);
                    return result.data;
                } else {
                    localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
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
            if (product.countries.includes(shippingCountry)) {
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
                tempShippingCost.forLocalProducts = 3;
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

    const getProductsByIdsAndStoreId = async (storeId, productsIds) => {
        try {
            return (await axios.post(`${process.env.BASE_API_URL}/products/products-by-ids-and-store-id?storeId=${storeId}&language=${i18n.language}`, {
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
                    country: countryCode,
                    phoneNumber: "00" + countries[countryCode].phone + getPhoneNumberFromString(userInfo.billingAddress.phoneNumber, countryCode),
                }
            } : {
                shippingAddress: {
                    ...userInfo.shippingAddress,
                    country: countryCode,
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

    const applyCoupon = async () => {
        try {
            const errorsObject = inputValuesValidation([
                {
                    name: "couponCode",
                    value: couponCode,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitApplyCoupon(true);
                const result = (await axios.get(`${process.env.BASE_API_URL}/coupons/coupon-details?code=${couponCode}&language=${i18n.language}`)).data;
                setIsWaitApplyCoupon(false);
                if (!result.error) {
                    const totalAmountBeforeApplyCoupon = pricesDetailsSummary.totalPriceAfterDiscount + shippingCost.forLocalProducts + shippingCost.forInternationalProducts;
                    setTotalAmount(totalAmountBeforeApplyCoupon - (totalAmountBeforeApplyCoupon * result.data.discountPercentage) / 100);
                    setSuccessMsg("Apply Coupon Code Process Has Been Successfully !!");
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        clearTimeout(successTimeout);
                    }, 3000);
                } else {
                    setErrorMsg("Sorry This Code Is Not Exist !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 2000);
                }
            }
        }
        catch (err) {
            setIsWaitApplyCoupon(false);
            setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeat The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 2000);
        }
    }

    const getInputFieldForCheckBeforeCreateOrder = () => {
        return [
            {
                name: "first_name_for_billing_address",
                value: userInfo ? userInfo.billingAddress.firstName : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "last_name_for_billing_address",
                value: userInfo ? userInfo.billingAddress.lastName : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "country_for_billing_address",
                value: userInfo ? userInfo.billingAddress.country : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "street_address_for_billing_address",
                value: userInfo ? userInfo.billingAddress.streetAddress : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "city_for_billing_address",
                value: userInfo ? userInfo.billingAddress.city : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "postal_code_for_billing_address",
                value: userInfo ? userInfo.billingAddress.postalCode : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "phone_number_for_billing_address",
                value: userInfo.billingAddress.phoneNumber,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                    isValidMobilePhone: {
                        msg: "Sorry, Invalid Mobile Phone !!",
                        countryCode: userInfo.billingAddress.country,
                    },
                },
            },
            {
                name: "email_for_billing_address",
                value: userInfo ? userInfo.billingAddress.email : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
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
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "lastName_for_shipping_address",
                value: userInfo ? userInfo.shippingAddress.lastName : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "country_for_shipping_address",
                value: userInfo ? userInfo.shippingAddress.country : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "streetAddress_for_shipping_address",
                value: userInfo ? userInfo.shippingAddress.streetAddress : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "city_for_shipping_address",
                value: userInfo ? userInfo.shippingAddress.city : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "postalCode_for_shipping_address",
                value: userInfo ? userInfo.shippingAddress.postalCode : "",
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "phoneNumber_for_shipping_address",
                value: userInfo.shippingAddress.phoneNumber,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
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
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                    isEmail: {
                        msg: "Sorry, Invalid Email !!",
                    },
                },
            } : null,
            {
                name: "is_agree_on_terms_and_conditions",
                value: isAgreeOnTermsAndConditions,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            }
        ];
    }

    const createNewOrder = async (orderDetails) => {
        try {
            return (await axios.post(`${process.env.BASE_API_URL}/orders/create-new-order?country=${countryAsProperty}&creator=${userToken ? "user" : "guest"}&language=${i18n.language}`, orderDetails, userToken > 0 ? {
                headers: {
                    Authorization: localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE)
                }
            } : {})).data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const handleSelectPaypalPayment = async () => {
        try {
            const errorsObject = inputValuesValidation(getInputFieldForCheckBeforeCreateOrder());
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitCreateNewOrder(true);
                if (isSavePaymentInfo) {
                    localStorage.setItem(process.env.USER_ADDRESSES_FIELD_NAME_IN_LOCAL_STORAGE, JSON.stringify({
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
                    localStorage.removeItem(process.env.USER_ADDRESSES_FIELD_NAME_IN_LOCAL_STORAGE);
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
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                await router.replace("/auth");
            }
            else {
                setIsWaitCreateNewOrder(false);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeat The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const getOrderDetailsForCreating = () => {
        return {
            creator: userToken ? "user" : "guest",
            couponCode,
            paymentGateway,
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
            shippingMethod,
            requestNotes,
            language: i18n.language
        }
    }

    const createPayPalOrder = async (data, actions) => {
        try {
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
        catch (err) {
            console.log(err);
        }
    }

    const approveOnPayPalOrder = async () => {
        try {
            setIsWaitApproveOnPayPalOrder(true);
            const result = (await axios.put(`${process.env.BASE_API_URL}/orders/handle-checkout-complete/${orderResult.orderId}?language=${i18n.language}`)).data;
            const tempAllProductsDataInsideTheCart = JSON.parse(localStorage.getItem(process.env.USER_CART_NAME_IN_LOCAL_STORAGE));
            const orderProductsIds = allProductsData.map((product) => product._id);
            localStorage.setItem(process.env.USER_CART_NAME_IN_LOCAL_STORAGE, JSON.stringify(tempAllProductsDataInsideTheCart.filter((product) => !orderProductsIds.includes(product._id))));
            await router.push(`/confirmation/${result.data.orderId}?country=${countryAsProperty}`);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                await router.replace("/auth");
            }
            else {
                setIsWaitApproveOnPayPalOrder(false);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeat The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const createPaymentOrder = async (paymentGateway) => {
        try {
            const errorsObject = inputValuesValidation(getInputFieldForCheckBeforeCreateOrder());
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitCreateNewOrder(true);
                const result = (await axios.post(`${process.env.BASE_API_URL}/orders/create-payment-order?country=${countryAsProperty}&language=${i18n.language}`, getOrderDetailsForCreating(), userToken ? {
                    headers: {
                        Authorization: localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE)
                    }
                } : {})).data;
                if (!result.error) {
                    if (paymentGateway === "tap") {
                        await router.push(result.data.transaction.url);
                    } else {
                        await router.push(result.data.checkoutURL);
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
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                await router.replace("/auth");
            }
            else {
                setIsWaitCreateNewOrder(false);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeat The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const handleSelectShippingMethod = (newShippingMethod) => {
        setShippingMethod(newShippingMethod);
        setShippingCost(getShippingCost(localAndInternationlProducts.local.length, localAndInternationlProducts.international.length, newShippingMethod, pricesDetailsSummary.totalPriceAfterDiscount));
    }

    return (
        <div className="checkout page">
            <Head>
                <title>{t(process.env.STORE_NAME)} - {t("Checkout")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                {isWaitApproveOnPayPalOrder && <div className="overlay text-white d-flex flex-column align-items-center justify-content-center">
                    <span class="loader mb-4"></span>
                    <p>{t("Please Wait")} ...</p>
                </div>}
                <Header />
                <div className="page-content pt-5">
                    <div className="container-fluid text-white p-4">
                        <motion.h1 className="h4 mb-4 fw-bold text-center" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Welcome To You In Checkout Page")}</motion.h1>
                        {Object.keys(storeDetails).length > 0 ?
                            allProductsData.length > 0 ? <div className="row">
                                <div className="col-xl-6">
                                    <motion.h6 className="mb-4 fw-bold" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Billing Details")}</motion.h6>
                                    <form className="edit-customer-billing-address-form" onSubmit={(e) => e.preventDefault()}>
                                        <motion.section className="first-and-last-name mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
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
                                                    {formValidationErrors.firstName_for_billing_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.firstName_for_billing_address)} />}
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
                                                    {formValidationErrors.last_name_for_billing_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.last_name_for_billing_address)} />}
                                                </div>
                                            </div>
                                        </motion.section>
                                        <motion.section className="company-name mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("Company Name")} ({t("Optional")})</h6>
                                            <input
                                                type="text"
                                                className="p-2"
                                                placeholder={t("Please Enter Company Name Here")}
                                                defaultValue={userInfo ? userInfo.billingAddress.companyName : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, companyName: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                        </motion.section>
                                        <motion.section className="country mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("Country / Area")} <span className="text-danger">*</span></h6>
                                            <select
                                                className={`p-2 ${formValidationErrors.country_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                onChange={(e) => handleSelectCountry(e.target.value, "billing")}
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
                                            {formValidationErrors.country_for_billing_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.country_for_billing_address)} />}
                                        </motion.section>
                                        <motion.section className="street-address mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("Street Address / Neighborhood")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.street_address_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter Street Address / Neighborhood Here")}
                                                defaultValue={userInfo ? userInfo.billingAddress.streetAddress : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, streetAddress: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.street_address_for_billing_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.street_address_for_billing_address)} />}
                                        </motion.section>
                                        <motion.section className="apartment-number mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("Apartment Number, Ward, Unit, Etc")} . ( {t("Optional")} )</h6>
                                            <input
                                                type="number"
                                                className="p-2"
                                                placeholder={t("Please Enter Apartment Number, Ward, Unit, Etc Here")}
                                                defaultValue={userInfo ? userInfo.billingAddress.apartmentNumber : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, apartmentNumber: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                        </motion.section>
                                        <motion.section className="city-number mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("City")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.city_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter City Name Here")}
                                                defaultValue={userInfo ? userInfo.billingAddress.city : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, city: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.city_for_billing_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.city_for_billing_address)} />}
                                        </motion.section>
                                        <motion.section className="postal-code-number mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("Postal Code / Zip")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.postal_code_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter Postal Code / Zip Here")}
                                                defaultValue={userInfo ? userInfo.billingAddress.postalCode : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, postalCode: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.postal_code_for_billing_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.postal_code_for_billing_address)} />}
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
                                                        className={`p-2 ${formValidationErrors.phone_number_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                        placeholder={t("Please Enter Phone Number")}
                                                        defaultValue={userInfo ? getPhoneNumberFromString(userInfo.billingAddress.phoneNumber, userInfo.billingAddress.country) : ""}
                                                        onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, phoneNumber: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
                                                    />
                                                </div>
                                            </div>
                                            {formValidationErrors.phone_number_for_billing_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.phone_number_for_billing_address)} />}
                                        </motion.section>
                                        <motion.section className="email mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("Email")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.email_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter Email Here")}
                                                defaultValue={userInfo ? userInfo.billingAddress.email : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, billingAddress: { ...userInfo.billingAddress, email: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.email_for_billing_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.email_for_billing_address)} />}
                                        </motion.section>
                                    </form>
                                    {!userInfo._id && <motion.div className="form-check mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            defaultChecked={isSavePaymentInfo}
                                            id="save-payment-information"
                                            onChange={(e) => setIsSavePaymentInfo(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="save-payment-information" onClick={(e) => setIsSavePaymentInfo(e.target.checked)}>
                                            {t("Do You Want To Save Payment Information ?")}
                                        </label>
                                    </motion.div>}
                                    <motion.div className="form-check mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="shipping-to-different-address"
                                            onChange={(e) => handleIsShippingToOtherAddress(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="shipping-to-different-address" onClick={(e) => handleIsShippingToOtherAddress(e.target.checked)}>
                                            {t("Do You Want To Ship To A Different Address ?")}
                                        </label>
                                    </motion.div>
                                    {isShippingToOtherAddress && <form className="edit-customer-shipping-address-form" onSubmit={(e) => e.preventDefault()}>
                                        <motion.section className="first-and-last-name mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
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
                                                    {formValidationErrors.first_name_for_shipping_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.first_name_for_shipping_address)} />}
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
                                                    {formValidationErrors.last_name_for_shipping_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.last_name_for_shipping_address)} />}
                                                </div>
                                            </div>
                                        </motion.section>
                                        <motion.section className="company-name mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("Company Name")} ({t("Optional")})</h6>
                                            <input
                                                type="text"
                                                className="p-2"
                                                placeholder={t("Please Enter Company Name Here")}
                                                defaultValue={userInfo ? userInfo.shippingAddress.companyName : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, companyName: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                        </motion.section>
                                        <motion.section className="country mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("Country / Area")} <span className="text-danger">*</span></h6>
                                            <select
                                                className={`p-2 ${formValidationErrors.country_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                onChange={(e) => handleSelectCountry(e.target.value, "shipping")}
                                                style={{
                                                    backgroundColor: "var(--main-color-one)",
                                                }}
                                            >
                                                <option value={userInfo.shippingAddress.country} hidden>{countries[userInfo.shippingAddress.country].name}</option>
                                                {countryList.map((country) => (
                                                    <option key={country.name} value={country.name}>
                                                        {country.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {formValidationErrors.country_for_shipping_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.country_for_shipping_address)} />}
                                        </motion.section>
                                        <motion.section className="street-address mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("Street Address / Neighborhood")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.street_address_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter Street Address / Neighborhood Here")}
                                                defaultValue={userInfo ? userInfo.shippingAddress.streetAddress : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, streetAddress: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.street_address_for_shipping_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.street_address_for_shipping_address)} />}
                                        </motion.section>
                                        <motion.section className="apartment-number mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("Apartment Number, Ward, Unit, Etc")} . ( {t("Optional")} )</h6>
                                            <input
                                                type="number"
                                                className="p-2"
                                                placeholder={t("Please Enter Apartment Number, Ward, Unit, Etc Here")}
                                                defaultValue={userInfo ? userInfo.shippingAddress.apartmentNumber.toString() : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, apartmentNumber: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                        </motion.section>
                                        <motion.section className="city-number mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("City")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.city_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter City Name Here")}
                                                defaultValue={userInfo ? userInfo.shippingAddress.city : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, city: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.city_for_shipping_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.city_for_shipping_address)} />}
                                        </motion.section>
                                        <motion.section className="postal-code-number mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("Postal Code / Zip")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.postal_code_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder="Please Enter Postal Code / Zip Here"
                                                defaultValue={userInfo ? userInfo.shippingAddress.postalCode.toString() : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, postalCode: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.postal_code_for_shipping_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.postal_code_for_shipping_address)} />}
                                        </motion.section>
                                        <motion.section className="phone-number mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("Phone Number")} <span className="text-danger">*</span></h6>
                                            <div className="row">
                                                <div className="col-md-2">
                                                    <input
                                                        type="text"
                                                        className="p-2 text-center"
                                                        disabled
                                                        value={"00" + countries[userInfo.shippingAddress.country].phone}
                                                    />
                                                </div>
                                                <div className="col-md-10">
                                                    <input
                                                        type="text"
                                                        className={`p-2 ${formValidationErrors.phone_number_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                        placeholder={t("Please Enter Phone Number Here")}
                                                        defaultValue={userInfo ? getPhoneNumberFromString(userInfo.shippingAddress.phoneNumber, userInfo.shippingAddress.country) : ""}
                                                        onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, phoneNumber: e.target.value } }); setIsDisplayPaypalPaymentButtons(false); }}
                                                    />
                                                </div>
                                            </div>
                                            {formValidationErrors.phone_number_for_shipping_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.phone_number_for_shipping_address)} />}
                                        </motion.section>
                                        <motion.section className="email mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <h6>{t("Email")} <span className="text-danger">*</span></h6>
                                            <input
                                                type="text"
                                                className={`p-2 ${formValidationErrors.email_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                placeholder={t("Please Enter Email Here")}
                                                defaultValue={userInfo ? userInfo.shippingAddress.email : ""}
                                                onChange={(e) => { setUserInfo({ ...userInfo, shippingAddress: { ...userInfo.shippingAddress, email: e.target.value.trim() } }); setIsDisplayPaypalPaymentButtons(false); }}
                                            />
                                            {formValidationErrors.email_for_shipping_address && <FormFieldErrorBox errorMsg={t(formValidationErrors.email_for_shipping_address)} />}
                                        </motion.section>
                                    </form>}
                                    <motion.h6 className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Request Notes")} ( {t("Optional")} )</motion.h6>
                                    <motion.textarea
                                        className="p-2"
                                        placeholder={t("Notes About Request, Example: Note About Request Delivery")}
                                        onChange={(e) => setRequestNotes(e.target.value.trim())}
                                        initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                    ></motion.textarea>
                                </div>
                                <div className="col-xl-6">
                                    <section className="order-total border border-3 p-4 ps-md-5 pe-md-5 text-start" id="order-total">
                                        <motion.h5 className="fw-bold mb-5 text-center" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Your Request")}</motion.h5>
                                        <motion.div className="row total pb-3 mb-5" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                {t("Product")}
                                            </div>
                                            <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                {t("Sum")}
                                            </div>
                                        </motion.div>
                                        {allProductsData.map((product, productIndex) => (
                                            <motion.div className="row total pb-3 mb-5" key={productIndex} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                    {i18n.language !== "ar" ? <span>
                                                        ( {product.name[i18n.language]} ) x {getProductQuantity(product._id)}
                                                    </span> : <span>
                                                        ( {product.name[i18n.language]} ) {getProductQuantity(product._id)} x
                                                    </span>}
                                                </div>
                                                <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                    {(product.price * getProductQuantity(product._id) * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                                </div>
                                            </motion.div>
                                        ))}
                                        <motion.div className="row total-price-before-discount total pb-3 mb-5" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                {t("Total Price Before Discount")}
                                            </div>
                                            <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                {(pricesDetailsSummary.totalPriceBeforeDiscount * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                            </div>
                                        </motion.div>
                                        <motion.div className="row total-price-discount total pb-3 mb-5" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                {t("Total Discount")}
                                            </div>
                                            <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                {(pricesDetailsSummary.totalDiscount * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                            </div>
                                        </motion.div>
                                        <motion.div className="row total-price-after-discount total pb-3 mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                {t("Total Price After Discount")}
                                            </div>
                                            <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                {(pricesDetailsSummary.totalPriceAfterDiscount * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                            </div>
                                        </motion.div>
                                        {localAndInternationlProducts.local.length > 0 && <motion.div className="row shipping-cost-for-local-products total pb-3 mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                {t(localAndInternationlProducts.international.length > 0 ? "Shipping Cost For Local Products" : "Shipping Cost")}
                                            </div>
                                            <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                {(shippingCost.forLocalProducts * usdPriceAgainstCurrency).toFixed(2)} {t("KWD")}
                                            </div>
                                        </motion.div>}
                                        {localAndInternationlProducts.international.length > 0 && <motion.div className="row shipping-cost-for-international-products total pb-3 mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                {t(localAndInternationlProducts.local.length > 0 ? "Shipping Cost For International Products" : "Shipping Cost")}
                                            </div>
                                            <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                {(shippingCost.forInternationalProducts * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                            </div>
                                        </motion.div>}
                                        {localAndInternationlProducts.local.length > 0 && localAndInternationlProducts.international.length > 0 && <motion.div className="row shipping-cost-for-products total pb-3 mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                {t("Shipping Cost")}
                                            </div>
                                            <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                {((shippingCost.forLocalProducts + shippingCost.forInternationalProducts) * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                            </div>
                                        </motion.div>}
                                        <motion.div className="row total-price total pb-3 mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                {t("Total Amount")}
                                            </div>
                                            <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                {(totalAmount * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                            </div>
                                        </motion.div>
                                        {/* Start Coupon Section */}
                                        <section className="coupon mb-4 border border-2 p-3 mb-4">
                                            <motion.h6 className={`fw-bold mb-4 text-center bg-white text-dark p-3`} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Coupon")}</motion.h6>
                                            <motion.h6 className={`fw-bold mb-3 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Have a Coupon Code ?")}</motion.h6>
                                            <motion.input
                                                type="text"
                                                className={`p-2 mb-2 ${formValidationErrors.couponCode ? "border-3 border-danger" : ""}`}
                                                placeholder={t("Please Enter Coupon Code Here")}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                            />
                                            {formValidationErrors.couponCode && <FormFieldErrorBox errorMsg={t(formValidationErrors.couponCode)} />}
                                            {!isWaitApplyCoupon && !errorMsg && <motion.button
                                                className="checkout-link p-2 w-100 mx-auto d-block text-center fw-bold mt-3"
                                                onClick={applyCoupon}
                                                initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                            >
                                                {t("Apply")}
                                            </motion.button>}
                                            {isWaitApplyCoupon && <motion.button
                                                className="checkout-link p-2 w-100 mx-auto d-block text-center fw-bold mt-3"
                                                disabled
                                                initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                            >
                                                {t("Please Waiting")}
                                            </motion.button>}
                                            {errorMsg && <motion.button
                                                className="checkout-link p-2 w-100 mx-auto d-block text-center fw-bold mt-3 bg-danger text-white"
                                                disabled
                                                initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                            >
                                                {t(errorMsg)}
                                            </motion.button>}
                                        </section>
                                        {/* End Coupon Section */}
                                        {/* Start Shipping Methods Section */}
                                        <section className="shipping-methods mb-4 border border-2 p-3 mb-4">
                                            <motion.h6 className={`fw-bold mb-5 text-center bg-white text-dark p-3`} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Shipping Methods")}</motion.h6>
                                            {localAndInternationlProducts.local.length > 0 && <>
                                                {localAndInternationlProducts.international.length > 0 && <>
                                                    <motion.h6 className="text-center mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("For Local Products")} ( {t("That Are Available Within The Country And Shipped Within The Same Country")} )</motion.h6>
                                                    <motion.h6 className="text-center mb-3 fw-bold" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Product Names")} :</motion.h6>
                                                    <ul className={`mb-5 border border-2 p-3`}>
                                                        {localAndInternationlProducts.local.map((product, productIndex) => <motion.li key={productIndex} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{product} .</motion.li>)}
                                                    </ul>
                                                </>}
                                                <motion.div className={`row align-items-center mb-5`} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
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
                                                </motion.div>
                                                <motion.div className={`row align-items-center pt-4 mb-5`} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
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
                                                </motion.div>
                                            </>}
                                            {localAndInternationlProducts.international.length > 0 && <>
                                                {localAndInternationlProducts.local.length > 0 && <>
                                                    <motion.h6 className="text-center mb-4 border-top pt-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("For International Products")} ( {t("That Are Available Within One Country And Shipped To Another Country")} ) :</motion.h6>
                                                    <motion.h6 className="text-center mb-3 fw-bold" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Product Names")} :</motion.h6>
                                                    <ul className={`mb-5 border border-2 p-3`}>
                                                        {localAndInternationlProducts.international.map((product, productIndex) => <motion.li key={productIndex} className={`${productIndex !== localAndInternationlProducts.international.length - 1 ? "mb-3" : ""}`} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{product} .</motion.li>)}
                                                    </ul>
                                                </>}
                                                <motion.div className={`row align-items-center pt-4 mb-5`} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
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
                                                </motion.div>
                                                <motion.div className={`row align-items-center pt-4 mb-5`} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
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
                                                </motion.div>
                                            </>}
                                        </section>
                                        {/* End Shipping Methods Section */}
                                        {/* Start Payement Methods Section */}
                                        <section className="payment-methods mb-4 border border-2 p-3 mb-4">
                                            <motion.h6 className={`fw-bold mb-4 text-center bg-white text-dark p-3`} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Payment Methods")}</motion.h6>
                                            <motion.div className={`row align-items-center pt-3 ${paymentGateway === "paypal" ? "mb-3" : ""}`} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                <div className="col-md-6 text-start">
                                                    <input
                                                        type="radio"
                                                        checked={paymentGateway === "paypal"}
                                                        id="paypal-radio"
                                                        className={`radio-input ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                                        name="radioGroup"
                                                        onChange={() => setPaymentGateway("paypal")}
                                                    />
                                                    <label htmlFor="paypal-radio" onClick={() => setPaymentGateway("paypal")}>{t("PayPal")}</label>
                                                </div>
                                                <div className="col-md-6 text-md-end">
                                                    <FaCcPaypal className="payment-icon paypal-icon" />
                                                </div>
                                            </motion.div>
                                            {paymentGateway === "paypal" && isDisplayPaypalPaymentButtons && <PayPalScriptProvider
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
                                            <motion.div className={`row align-items-center pt-3 ${paymentGateway === "tap" ? "mb-3" : ""}`} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                <div className="col-md-6 text-start">
                                                    <input
                                                        type="radio"
                                                        checked={paymentGateway === "tap"}
                                                        id="tap-radio"
                                                        className={`radio-input ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                                        name="radioGroup"
                                                        onChange={() => setPaymentGateway("tap")}
                                                    />
                                                    <label htmlFor="tap-radio" onClick={() => setPaymentGateway("tap")}>{t("Tap")}</label>
                                                </div>
                                                <div className="col-md-6 text-md-end">
                                                    <FaTape className="payment-icon tap-icon" />
                                                </div>
                                            </motion.div>
                                            <motion.div className={`row align-items-center pt-3 ${paymentGateway === "tabby" ? "mb-3" : ""}`} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                <div className="col-md-6 text-start">
                                                    <input
                                                        type="radio"
                                                        checked={paymentGateway === "tabby"}
                                                        id="tap-radio"
                                                        className={`radio-input ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                                        name="radioGroup"
                                                        onChange={() => setPaymentGateway("tabby")}
                                                    />
                                                    <label htmlFor="tap-radio" onClick={() => setPaymentGateway("tabby")}>{t("Tabby")}</label>
                                                </div>
                                                <div className="col-md-6 text-md-end">
                                                    <FaTape className="payment-icon tap-icon" />
                                                </div>
                                            </motion.div>
                                            {isAppearedBinancePaymentMethod && <motion.div className={`row align-items-center pt-3 ${paymentGateway === "binance" ? "mb-3" : ""}`} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                <div className="col-md-6 text-start">
                                                    <input
                                                        type="radio"
                                                        checked={paymentGateway === "binance"}
                                                        id="binance-radio"
                                                        className={`radio-input ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                                        name="radioGroup"
                                                        onChange={() => setPaymentGateway("binance")}
                                                    />
                                                    <label htmlFor="binance-radio" onClick={() => setPaymentGateway("binance")}>{t("Binance")}</label>
                                                </div>
                                                <div className="col-md-6 text-md-end">
                                                    <SiBinance className="payment-icon binance-icon" />
                                                </div>
                                            </motion.div>}
                                        </section>
                                        {/* End Payement Methods Section */}
                                        <motion.div className={`form-check mb-4 border p-4 ${i18n.language !== "ar" ? "text-end" : "text-end"}`} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <input
                                                className="form-check-input mt-0"
                                                type="checkbox"
                                                id="approve-on-terms-and-conditions"
                                                onChange={(e) => setIsAgreeOnTermsAndConditions(e.target.checked)}
                                            />
                                            <label className="form-check-label p-0" htmlFor="approve-on-terms-and-conditions" onClick={(e) => setIsAgreeOnTermsAndConditions(e.target.checked)}>
                                                {t("Agree To")} <Link href="/polices-terms-and-conditions">{t("Terms And Conditions")}</Link>
                                            </label>
                                        </motion.div>
                                        {formValidationErrors.is_agree_on_terms_and_conditions && <FormFieldErrorBox errorMsg={t(formValidationErrors.is_agree_on_terms_and_conditions)} />}
                                        {paymentGateway === "paypal" && !isDisplayPaypalPaymentButtons && <motion.button
                                            className="checkout-link p-2 w-100 mx-auto d-block text-center fw-bold mt-3"
                                            onClick={handleSelectPaypalPayment}
                                            initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                        >
                                            {t("Confirm Request")}
                                        </motion.button>}
                                        {paymentGateway === "tap" && !isWaitCreateNewOrder && !errorMsg && <motion.button
                                            className="checkout-link p-2 w-100 mx-auto d-block text-center fw-bold mt-3"
                                            onClick={() => createPaymentOrder("tap")}
                                            initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                        >
                                            {t("Confirm Request")}
                                        </motion.button>}
                                        {paymentGateway === "tabby" && !isWaitCreateNewOrder && !errorMsg && <motion.button
                                            className="checkout-link p-2 w-100 mx-auto d-block text-center fw-bold mt-3"
                                            onClick={() => createPaymentOrder("tabby")}
                                            initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                        >
                                            {t("Confirm Request")}
                                        </motion.button>}
                                        {paymentGateway === "binance" && !isWaitCreateNewOrder && !errorMsg && <motion.button
                                            className="checkout-link p-2 w-100 mx-auto d-block text-center fw-bold mt-3"
                                            onClick={() => createPaymentOrder("binance")}
                                            initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                        >
                                            {t("Confirm Request")}
                                        </motion.button>}
                                        {isWaitCreateNewOrder && <motion.button
                                            className="checkout-link p-2 w-100 mx-auto d-block text-center fw-bold mt-3"
                                            disabled
                                            initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                        >
                                            {t("Please Waiting")}
                                        </motion.button>}
                                        {errorMsg && <motion.button
                                            className="checkout-link p-2 w-100 mx-auto d-block text-center fw-bold mt-3 bg-danger text-white"
                                            disabled
                                            initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                        >
                                            {t(errorMsg)}
                                        </motion.button>}
                                    </section>
                                </div>
                            </div> : <NotFoundError errorMsg={t("Sorry, Can't Find Any Products For This Store Your Cart !!")} />
                            : <NotFoundError errorMsg={t("Sorry, This Store Is Not Found !!")} />
                        }
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
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