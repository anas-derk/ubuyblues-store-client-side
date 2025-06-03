import Head from "next/head";
import Header from "@/components/Header";
import LoaderPage from "@/components/LoaderPage";
import { useState, useEffect } from "react";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { FaRegSmileWink } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import { getStoreDetails, getUserInfo, getOrderDetails, handleSelectUserLanguage } from "../../../../public/global_functions/popular";
import { getCurrencyNameByCountry, getBaseCurrencyPriceAgainstCurrency } from "../../../../public/global_functions/prices";
import NotFoundError from "@/components/NotFoundError";

export default function Confirmation({ orderIdAsProperty, countryAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [convertedPrice, setConvertedPrice] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [isGetUserInfo, setIsGetUserInfo] = useState(true);

    const [isGetOrderDetails, setIsGetOrderDetails] = useState(true);

    const [orderDetails, setOrderDetails] = useState({});

    const [storeDetails, setStoreDetails] = useState({});

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        setIsLoadingPage(true);
        const selectedCountry = localStorage.getItem(process.env.SELECTED_COUNTRY_BY_USER) ?? countryAsProperty;
        getBaseCurrencyPriceAgainstCurrency(selectedCountry).then((price) => {
            setConvertedPrice(price);
            setCurrencyNameByCountry(getCurrencyNameByCountry(selectedCountry));
            if (!isGetUserInfo && !isGetOrderDetails) {
                setIsLoadingPage(false);
            }
        })
            .catch((err) => {
                setIsLoadingPage(false);
                setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
            });
    }, [countryAsProperty]);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
        if (userToken) {
            getUserInfo()
                .then((result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                    }
                    setIsGetUserInfo(false);
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
        } else {
            setIsLoadingPage(false);
        }
    }, []);

    useEffect(() => {
        getOrderDetails(orderIdAsProperty)
            .then(async (res) => {
                let result = res.data;
                if (!res.error) {
                    setOrderDetails(result);
                    result = await getStoreDetails(result.storeId);
                    setStoreDetails(result.data);
                    setIsGetOrderDetails(false);
                }
            })
            .catch((err) => {
                setIsLoadingPage(false);
                setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
            });
    }, [orderIdAsProperty]);

    useEffect(() => {
        if (!isGetOrderDetails) {
            setIsLoadingPage(false);
        }
    }, [isGetOrderDetails]);

    return (
        <div className="confirmation">
            <Head>
                <title>{t(process.env.STORE_NAME)} - {t("Payment Confirmation")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content page pt-5">
                    <div className="container-fluid align-items-center pb-4 text-white">
                        <h1 className="welcome-msg text-center mb-5 h4">{t("Welcome To You In Payment Confirmation Page")}</h1>
                        {Object.keys(orderDetails).length > 0 ? <section className="order-total  custom-frame p-4 ps-md-5 pe-md-5 text-center" id="order-total">
                            <h5 className="fw-bold mb-4 text-center">{t("Your Request")}</h5>
                            <div className="order-id-and-number custom-frame p-4 mb-5">
                                <h5 className="mb-4 text-center">{t("Order Id")} : {orderDetails._id}</h5>
                                <h5 className="mb-4 text-center">{t("Order Number")} : {orderDetails.orderNumber}</h5>
                                <h5 className="mb-4 text-center">{t("Store Id")} : {storeDetails._id}</h5>
                                <h5 className="mb-4 text-center">{t("Store Name")} : {storeDetails.name[i18n.language]}</h5>
                                <h5 className="mb-0 text-center">{t("Owner Full Name")} : {storeDetails.ownerFirstName} {storeDetails.ownerLastName}</h5>
                            </div>
                            <h5 className="mb-5 text-center  custom-frame p-4">{t("Order Details")}</h5>
                            <div className="row total pb-3 mb-5">
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Product Name And Quantity")}
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Unit Price Before Discount")}
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Unit Discount")}
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Sum")}
                                </div>
                            </div>
                            {orderDetails.products.map((product, productIndex) => (
                                <div className="row total pb-3 mb-5" key={productIndex}>
                                    <div className="col-md-3 fw-bold p-0">
                                        {i18n.language !== "ar" ? <span>
                                            ( {product.name[i18n.language]} ) x {product.quantity}
                                        </span> : <span>
                                            ( {product.name[i18n.language]} ) {product.quantity} x
                                        </span>}
                                    </div>
                                    <div className="col-md-3 fw-bold p-0">
                                        {(product.unitPrice * convertedPrice).toFixed(2)} {t(currencyNameByCountry)}
                                    </div>
                                    <div className="col-md-3 fw-bold p-0">
                                        {(product.unitDiscount * convertedPrice).toFixed(2)} {t(currencyNameByCountry)}
                                    </div>
                                    <div className="col-md-3 fw-bold p-0">
                                        {((product.unitPrice - product.unitDiscount) * product.quantity * convertedPrice).toFixed(2)} {t(currencyNameByCountry)}
                                    </div>
                                </div>
                            ))}
                            <div className="row total-price-before-discount total pb-3 mb-5">
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Total Price Before Discount")}
                                </div>
                                <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                    {(orderDetails.totalPriceBeforeDiscount * convertedPrice).toFixed(2)} {t(currencyNameByCountry)}
                                </div>
                            </div>
                            <div className="row total-price-discount total pb-3 mb-5">
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Total Discount")}
                                </div>
                                <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                    {(orderDetails.totalDiscount * convertedPrice).toFixed(2)} {t(currencyNameByCountry)}
                                </div>
                            </div>
                            <div className="row shipping-cost-for-local-products total pb-3 mb-5">
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Shipping Cost For Local Products")}
                                </div>
                                <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                    {(orderDetails.shippingCost.forLocalProducts * convertedPrice).toFixed(2)} {t(currencyNameByCountry)}
                                </div>
                            </div>
                            <div className="row shipping-cost-for-international-products total pb-3 mb-5">
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Shipping Cost For International Products")}
                                </div>
                                <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                    {(orderDetails.shippingCost.forInternationalProducts * convertedPrice).toFixed(2)} {t(currencyNameByCountry)}
                                </div>
                            </div>
                            <div className="row total-shipping-cost total pb-3 mb-5">
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Total Shipping Cost")}
                                </div>
                                <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                    {((orderDetails.shippingCost.forLocalProducts + orderDetails.shippingCost.forInternationalProducts) * convertedPrice).toFixed(2)} {t(currencyNameByCountry)}
                                </div>
                            </div>
                            <div className="row total-price-after-discount total pb-3 mb-5">
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Total Price After Discount")}
                                </div>
                                <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                    {(orderDetails.totalPriceAfterDiscount * convertedPrice).toFixed(2)} {t(currencyNameByCountry)}
                                </div>
                            </div>
                            <div className="row total-amount total pb-3 mb-5">
                                <div className="col-md-3 fw-bold p-0">
                                    {t("Total Amount")}
                                </div>
                                <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                    {(orderDetails.orderAmount * convertedPrice).toFixed(2)} {t(currencyNameByCountry)}
                                </div>
                            </div>
                            <div className="thanks-icon-box mb-4">
                                <FaRegSmileWink className="thanks-icon" style={{ fontSize: "70px" }} />
                            </div>
                            <h4 className="mb-4">
                                {t("Thanks For Purchase From Store") + " : " + storeDetails.name[i18n.language]}
                            </h4>
                            <img
                                src={`${process.env.BASE_API_URL}/${storeDetails.imagePath}`}
                                alt={`${storeDetails.name} Logo`}
                                className="store-image"
                            />
                        </section> : <NotFoundError errorMsg={t("Sorry, This Order Is Not Found !!")} />}
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}

export async function getServerSideProps({ query, params }) {
    if (!params.id) {
        return {
            redirect: {
                permanent: false,
                destination: "/",
            },
            props: {
                countryAsProperty: process.env.BASE_COUNTRY,
            },
        }
    }
    const allowedCountries = ["kuwait", "germany", "turkey"];
    if (query.country) {
        if (!allowedCountries.includes(query.country)) {
            return {
                redirect: {
                    permanent: false,
                    destination: `/confirmation/${params.id}`,
                },
                props: {
                    countryAsProperty: process.env.BASE_COUNTRY,
                    orderIdAsProperty: params.id,
                },
            }
        }
        if (Object.keys(query).filter((key) => key !== "country").length > 1) {
            return {
                redirect: {
                    permanent: false,
                    destination: `/confirmation/${params.id}?country=${query.country}`,
                },
                props: {
                    countryAsProperty: query.country,
                    orderIdAsProperty: params.id,
                },
            }
        }
        return {
            props: {
                countryAsProperty: query.country,
                orderIdAsProperty: params.id,
            },
        }
    }
    return {
        props: {
            countryAsProperty: process.env.BASE_COUNTRY,
            orderIdAsProperty: params.id,
        },
    }
}