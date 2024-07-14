import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import Header from "@/components/Header";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { useTranslation } from "react-i18next";
import { getUserInfo } from "../../../../../public/global_functions/popular";

export default function OrderDetails() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [orderDetails, setOrderDetails] = useState({});

    const router = useRouter();

    const { orderId } = router.query;

    const { t, i18n } = useTranslation();

    useEffect(() => {
        if (orderId) {
            const userLanguage = localStorage.getItem("asfour-store-language");
            handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
            const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
            if (userToken) {
                getUserInfo()
                    .then(async (res) => {
                        let result = res.data;
                        if (result.error) {
                            localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                            await router.replace("/auth");
                        } else {
                            result = await getOrderDetails(orderId);
                            if (!result.error) {
                                setOrderDetails(result.data);    
                            }
                            setWindowInnerWidth(window.innerWidth);
                            window.addEventListener("resize", () => {
                                setWindowInnerWidth(window.innerWidth);
                            });
                            setIsLoadingPage(false);
                        }
                    })
                    .catch(async (err) => {
                        if (err?.response?.data?.msg === "Unauthorized Error") {
                            localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                            await router.replace("/auth");
                        }
                        else {
                            setIsLoadingPage(false);
                            setIsErrorMsgOnLoadingThePage(true);
                        }
                    });
            } else router.replace("/auth");
        }
    }, [orderId]);

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    const getOrderDetails = async (orderId) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/orders/order-details/${orderId}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    return (
        <div className="order-details customer-dashboard">
            <Head>
                <title>{t("Ubuyblues Store")} - {t("Order Details")}</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <section className="page-content page d-flex justify-content-center align-items-center flex-column pt-4 pb-4">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xl-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <div className="col-xl-9">
                                {orderDetails?.checkoutStatus === "Checkout Successfull" ? <div className="order-details-box p-3 data-box">
                                    {windowInnerWidth > 991 ? <table className="order-data-table customer-table mb-5 w-100">
                                        <thead>
                                            <tr>
                                                <th>{t("Product Id")}</th>
                                                <th>{t("Quantity")}</th>
                                                <th>{t("Name")}</th>
                                                <th>{t("Unit Price")}</th>
                                                <th>{t("Total")}</th>
                                                <th>{t("Image")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderDetails.products.map((orderProduct) => (
                                                <tr key={orderProduct._id}>
                                                    <td>{orderProduct._id}</td>
                                                    <td>
                                                        {orderProduct.quantity}
                                                    </td>
                                                    <td>
                                                        {orderProduct.name}
                                                    </td>
                                                    <td>
                                                        {orderProduct.unitPrice}
                                                    </td>
                                                    <td>
                                                        {orderProduct.totalAmount}
                                                    </td>
                                                    <td>
                                                        <img
                                                            src={`${process.env.BASE_API_URL}/${orderProduct.imagePath}`}
                                                            alt="product Image !!"
                                                            width="100"
                                                            height="100"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table> : <div className="order-products-for-user text-center">
                                        {orderDetails.products.map((orderProduct, productIndex) => (
                                            <div className="order-product-box" key={orderProduct._id}>
                                                <h4 className="mb-3 text-white">{t("Product Details")} # {productIndex + 1}</h4>
                                                <table className="order-data-table customer-table mb-5 w-100">
                                                    <tbody>
                                                        <tr>
                                                            <th>{t("Product Id")}</th>
                                                            <td>{orderProduct._id}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{t("Quantity")}</th>
                                                            <td>{orderProduct.quantity}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{t("Name")}</th>
                                                            <td>{orderProduct.name}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{t("Unit Price")}</th>
                                                            <td>{orderProduct.unitPrice}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{t("Total")}</th>
                                                            <td>{orderProduct.totalAmount}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{t("Image")}</th>
                                                            <td>
                                                                <img
                                                                    src={`${process.env.BASE_API_URL}/${orderProduct.imagePath}`}
                                                                    alt="product Image !!"
                                                                    width="100"
                                                                    height="100"
                                                                />
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>}
                                    <section className="customer-info text-white">
                                        <div className="row">
                                            <div className="col-md-6 border border-1 border-white">
                                                <div className="billing-address-box p-3">
                                                    <h6 className="fw-bold">{t("Billing Address")}</h6>
                                                    <hr />
                                                    <p className="city fw-bold info">{t("City")}: {orderDetails.billingAddress.city}</p>
                                                    <p className="email fw-bold info">{t("Email")}: {orderDetails.billingAddress.email}</p>
                                                    <p className="name fw-bold info">{t("Name")}: {orderDetails.billingAddress.firstName}</p>
                                                    <p className="family-name fw-bold info">{t("Last Name")}: {orderDetails.billingAddress.lastName}</p>
                                                    <p className="phone fw-bold info">{t("Phone Number")}: {orderDetails.billingAddress.phone}</p>
                                                    <p className="postal-code fw-bold info">{t("Postal Code")}: {orderDetails.billingAddress.postalCode}</p>
                                                    <p className="street-address fw-bold info">{t("Street Address")}: {orderDetails.billingAddress.streetAddress}</p>
                                                    <p className="apartment-number fw-bold info">{t("Apartment Number")}: {orderDetails.billingAddress.apartmentNumber}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-6 border border-1 border-white">
                                                <div className="shipping-address-box p-3">
                                                    <h6 className="fw-bold">{t("Shipping Address")}</h6>
                                                    <hr />
                                                    <p className="city fw-bold info">{t("City")}: {orderDetails.shippingAddress.city}</p>
                                                    <p className="email fw-bold info">{t("Email")}: {orderDetails.shippingAddress.email}</p>
                                                    <p className="name fw-bold info">{t("Name")}: {orderDetails.shippingAddress.firstName}</p>
                                                    <p className="family-name fw-bold info">{t("Last Name")}: {orderDetails.shippingAddress.lastName}</p>
                                                    <p className="phone fw-bold info">{t("Phone Number")}: {orderDetails.shippingAddress.phone}</p>
                                                    <p className="postal-code fw-bold info">{t("Postal Code")}: {orderDetails.shippingAddress.postalCode}</p>
                                                    <p className="street-address fw-bold info">{t("Street Address")}: {orderDetails.shippingAddress.streetAddress}</p>
                                                    <p className="apartment-number fw-bold info">{t("Apartment Number")}: {orderDetails.shippingAddress.apartmentNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div> : <p className="alert alert-danger order-not-found-error">{t("Sorry, This Order Is Not Found !!")}</p>}
                            </div>
                        </div>
                    </div>
                </section>
                {/* End Content Section */}
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}