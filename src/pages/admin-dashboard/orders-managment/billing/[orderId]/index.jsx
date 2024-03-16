import Head from "next/head";
import LoaderPage from "@/components/LoaderPage";
import { useState, useEffect } from "react";
import axios from "axios";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { FaRegSmileWink } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import validations from "../../../../../../public/global_functions/validations";
import { useRouter } from "next/router";

export default function ShowBilling({ orderId }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [token, setToken] = useState("");

    const [orderDetails, setOrderDetails] = useState({});

    const [pricesDetailsSummary, setPricesDetailsSummary] = useState({
        totalPriceBeforeDiscount: 0,
        totalDiscount: 0,
    });

    const router = useRouter();

    const { t, i18n } = useTranslation();

    useEffect(() => {
        if (orderId) {
            const userLanguage = localStorage.getItem("asfour-store-language");
            handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
            const adminToken = localStorage.getItem("asfour-store-admin-user-token");
            if (adminToken) {
                validations.getAdminInfo(adminToken)
                    .then(async (res) => {
                        let result = res.data;
                        if (result.error) {
                            localStorage.removeItem("asfour-store-admin-user-token");
                            await router.push("/admin-dashboard/login");
                        } else {
                            result = await getOrderDetails(orderId);
                            if (!result.error) {
                                setOrderDetails(result.data);
                                setPricesDetailsSummary({
                                    totalPriceBeforeDiscount: calcTotalOrderPriceBeforeDiscount(result.data.order_products),
                                    totalDiscount: calcTotalOrderDiscount(result.data.order_products),
                                });
                            }
                            setToken(adminToken);
                            setIsLoadingPage(false);
                        }
                    })
                    .catch(async (err) => {
                        if (err?.response?.data?.msg === "Unauthorized Error") {
                            localStorage.removeItem("asfour-store-admin-user-token");
                            await router.push("/admin-dashboard/login");
                        }
                        else {
                            setIsLoadingPage(false);
                            setIsErrorMsgOnLoadingThePage(true);
                        }
                    });
            } else router.push("/admin-dashboard/login");
        }
    }, []);

    const getOrderDetails = async () => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/orders/order-details/${orderId}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    const calcTotalOrderPriceBeforeDiscount = (allProductsData) => {
        let tempTotalPriceBeforeDiscount = 0;
        allProductsData.forEach((product) => {
            tempTotalPriceBeforeDiscount += product.unit_price * product.quantity;
        });
        return tempTotalPriceBeforeDiscount;
    }

    const calcTotalOrderDiscount = (allProductsData) => {
        let tempTotalDiscount = 0;
        allProductsData.forEach((product) => {
            tempTotalDiscount += product.discount * product.quantity;
        });
        return tempTotalDiscount;
    }

    return (
        <div className="billing admin-dashboard page">
            <Head>
                <title>Ubuyblues Store - Billing</title>
            </Head>
            {!isLoadingPage && <>
                <Header />
                <div className="page-content p-4 bg-white">
                    <h1 className="welcome-msg text-center mb-5">{t("Your Order Billing From Ubuyblues Store")}</h1>
                    <section className="order-total border border-3 border-dark p-4 ps-md-5 pe-md-5 text-center" id="order-total">
                        <h5 className="fw-bold mb-4 text-center">{t("Your Request")}</h5>
                        <div className="order-id-and-number border border-2 border-dark p-4 mb-5">
                            <h5 className="mb-4 text-center">{t("Order Id")}: {orderDetails._id}</h5>
                            <h5 className="mb-0 text-center">{t("Order Number")}: {orderDetails.orderNumber}</h5>
                        </div>
                        <h5 className="mb-5 text-center border border-2 border-dark p-4">{t("Order Details")}</h5>
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
                        {orderDetails.order_products.map((product, productIndex) => (
                            <div className="row total pb-3 mb-5" key={productIndex}>
                                <div className="col-md-3 fw-bold p-0">
                                    {i18n.language !== "ar" ? <span>
                                        ( {product.name} ) x {product.quantity}
                                    </span> : <span>
                                        ( {product.name} ) {product.quantity} x
                                    </span>}
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {product.unit_price} {t("KWD")}
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {product.discount} {t("KWD")}
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {(product.unit_price - product.discount) * product.quantity} {t("KWD")}
                                </div>
                            </div>
                        ))}
                        <div className="row total-price-before-discount total pb-3 mb-5">
                            <div className="col-md-3 fw-bold p-0">
                                {t("Total Price Before Discount")}
                            </div>
                            <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                {pricesDetailsSummary.totalPriceBeforeDiscount} {t("KWD")}
                            </div>
                        </div>
                        <div className="row total-price-discount total pb-3 mb-5">
                            <div className="col-md-3 fw-bold p-0">
                                {t("Total Discount")}
                            </div>
                            <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                {pricesDetailsSummary.totalDiscount} {t("KWD")}
                            </div>
                        </div>
                        <div className="row total-price-after-discount total pb-3 mb-5">
                            <div className="col-md-3 fw-bold p-0">
                                {t("Total Price After Discount")}
                            </div>
                            <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                {orderDetails.order_amount} {t("KWD")}
                            </div>
                        </div>
                        <div className="thanks-icon-box mb-4">
                            <FaRegSmileWink className="thanks-icon" style={{ fontSize: "70px" }} />
                        </div>
                        <h4 className="mb-4">
                            {t("Thanks For Purchase From Ubuyblues Store")}
                        </h4>
                    </section>
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}

export async function getServerSideProps(context) {
    const orderId = context.query.orderId;
    if (!orderId) {
        return {
            redirect: {
                permanent: false,
                destination: "/confirmation",
            },
            props: {
                orderId: "658b171ba676cdf6528d0ad5",
            },
        }
    } else {
        return {
            props: {
                orderId,
            },
        }
    }
}