import Head from "next/head";
import Header from "@/components/Header";
import LoaderPage from "@/components/LoaderPage";
import { useState, useEffect } from "react";
import axios from "axios";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";

export default function Confirmation({ orderId }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [orderDetails, setOrderDetails] = useState({});

    const [pricesDetailsSummary, setPricesDetailsSummary] = useState({
        totalPriceBeforeDiscount: 0,
        totalDiscount: 0,
    });

    useEffect(() => {
        axios.get(`${process.env.BASE_API_URL}/orders/order-details/${orderId}`)
            .then((res) => {
                const result = res.data;
                setOrderDetails(result);
                setPricesDetailsSummary({
                    totalPriceBeforeDiscount: calcTotalOrderPriceBeforeDiscount(result.order_products),
                    totalDiscount: calcTotalOrderDiscount(result.order_products),
                });
                setIsLoadingPage(false);
            })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
    }, []);

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
        <div className="confirmation">
            <Head>
                <title>Ubuyblues Store - Confirmation</title>
            </Head>
            {!isLoadingPage && <>
                <Header />
                <div className="page-content text-white p-4">
                    <h1 className="welcome-msg text-center mb-5">Welcome To You In Payment Confirmation Page</h1>
                    <section className="order-total border border-3 p-4 ps-md-5 pe-md-5 text-center" id="order-total">
                        <h5 className="fw-bold mb-5 text-center">Your Request</h5>
                        <div className="row total pb-3 mb-5">
                            <div className="col-md-3 fw-bold p-0">
                                Product Name And Quantity
                            </div>
                            <div className="col-md-3 fw-bold p-0">
                                Unit Price Before Discount
                            </div>
                            <div className="col-md-3 fw-bold p-0">
                                Unit Discount
                            </div>
                            <div className="col-md-3 fw-bold p-0">
                                Sum
                            </div>
                        </div>
                        {orderDetails.order_products.map((product, productIndex) => (
                            <div className="row total pb-3 mb-5" key={productIndex}>
                                <div className="col-md-3 fw-bold p-0">
                                    ( {product.name} ) x {product.quantity}
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {product.unit_price} $
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {product.discount} $
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {(product.unit_price - product.discount) * product.quantity} $
                                </div>
                            </div>
                        ))}
                        <div className="row total-price-before-discount total pb-3 mb-5">
                            <div className="col-md-3 fw-bold p-0">
                                Total Price Before Discount
                            </div>
                            <div className="col-md-9 fw-bold p-0 text-md-end">
                                {pricesDetailsSummary.totalPriceBeforeDiscount} $
                            </div>
                        </div>
                        <div className="row total-price-discount total pb-3 mb-5">
                            <div className="col-md-3 fw-bold p-0">
                                Total Discount
                            </div>
                            <div className="col-md-9 fw-bold p-0 text-md-end">
                                {pricesDetailsSummary.totalDiscount} $
                            </div>
                        </div>
                        <div className="row total-price-after-discount total pb-3 mb-4">
                            <div className="col-md-3 fw-bold p-0">
                                Total Price After Discount
                            </div>
                            <div className="col-md-9 fw-bold p-0 text-md-end">
                                {orderDetails.order_amount} $
                            </div>
                        </div>
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