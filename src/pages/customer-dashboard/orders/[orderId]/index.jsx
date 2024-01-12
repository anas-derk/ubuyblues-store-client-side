import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import Header from "@/components/Header";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";

export default function OrderDetails() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [orderDetails, setOrderDetails] = useState({});

    const router = useRouter();

    const { orderId } = router.query;

    useEffect(() => {
        if (orderId) {
            const userId = localStorage.getItem("asfour-store-user-id");
            if (userId) {
                axios.get(`${process.env.BASE_API_URL}/users/user-info/${userId}`)
                    .then(async (res) => {
                        const result = res.data;
                        if (result !== "Sorry, The User Is Not Exist !!, Please Enter Another User Id ..") {
                            setOrderDetails(await getOrderDetails(orderId));
                            setIsLoadingPage(false);
                        } else {
                            router.push("/auth");
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    });
            } else {
                router.push("/auth");
            }
        }
    }, [orderId]);

    const getOrderDetails = async (orderId) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/orders/order-details/${orderId}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    return (
        <div className="order-details">
            <Head>
                <title>Ubuyblues Store - Order Details</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <section className="page-content d-flex justify-content-center align-items-center flex-column pt-4 pb-4">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xl-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <div className="col-xl-9">
                                {orderDetails.checkout_status === "checkout_successful" ? <div className="order-details-box p-3 data-box">
                                    <table className="order-data-table customer-table mb-5 w-100">
                                        <thead>
                                            <tr>
                                                <th>Reference / Product Id</th>
                                                <th>Quantity</th>
                                                <th>Name</th>
                                                <th>Unit Price</th>
                                                <th>Total</th>
                                                <th>Image</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderDetails.order_products.map((orderProduct) => (
                                                <tr key={orderProduct._id}>
                                                    <td>{orderProduct._id}</td>
                                                    <td>
                                                        {orderProduct.quantity}
                                                    </td>
                                                    <td>
                                                        {orderProduct.name}
                                                    </td>
                                                    <td>
                                                        {orderProduct.unit_price}
                                                    </td>
                                                    <td>
                                                        {orderProduct.total_amount}
                                                    </td>
                                                    <td>
                                                        <img
                                                            src={`${process.env.BASE_API_URL}/${orderProduct.image_path}`}
                                                            alt="product Image !!"
                                                            width="100"
                                                            height="100"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <section className="customer-info text-white">
                                        <div className="row">
                                            <div className="col-md-6 border border-1 border-white">
                                                <div className="billing-address-box text-start p-3">
                                                    <h6 className="fw-bold">Billing Address</h6>
                                                    <hr />
                                                    <p className="city fw-bold info">City: {orderDetails.billing_address.city}</p>
                                                    <p className="email fw-bold info">Email: {orderDetails.billing_address.email}</p>
                                                    <p className="name fw-bold info">Name: {orderDetails.billing_address.first_name}</p>
                                                    <p className="family-name fw-bold info">Family Name: {orderDetails.billing_address.last_name}</p>
                                                    <p className="phone fw-bold info">Phone: {orderDetails.billing_address.phone}</p>
                                                    <p className="postal-code fw-bold info">Postal Code: {orderDetails.billing_address.postal_code}</p>
                                                    <p className="street-address fw-bold info">Street Address: {orderDetails.billing_address.street_address}</p>
                                                    <p className="apartment-number fw-bold info">Apartment Number: {orderDetails.billing_address.apartment_number}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-6 border border-1 border-white">
                                                <div className="shipping-address-box text-start p-3">
                                                    <h6 className="fw-bold">Shipping Address</h6>
                                                    <hr />
                                                    <p className="city fw-bold info">City: {orderDetails.shipping_address.city}</p>
                                                    <p className="email fw-bold info">Email: {orderDetails.shipping_address.email}</p>
                                                    <p className="name fw-bold info">Name: {orderDetails.shipping_address.first_name}</p>
                                                    <p className="family-name fw-bold info">Family Name: {orderDetails.shipping_address.last_name}</p>
                                                    <p className="phone fw-bold info">Phone: {orderDetails.shipping_address.phone}</p>
                                                    <p className="postal-code fw-bold info">Postal Code: {orderDetails.shipping_address.postal_code}</p>
                                                    <p className="street-address fw-bold info">Street Address: {orderDetails.shipping_address.street_address}</p>
                                                    <p className="apartment-number fw-bold info">Apartment Number: {orderDetails.shipping_address.apartment_number}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div> : <p className="alert alert-danger order-not-found-error">Sorry, This Order Is Not Found !!</p>}
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