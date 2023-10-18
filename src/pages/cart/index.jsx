import Head from "next/head";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { HiMinus, HiPlus } from "react-icons/hi";
import { BsTrash } from "react-icons/bs";

export default function Cart() {
    const [allProductsData, setAllProductsData] = useState([]);
    const [errMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isWaitStatus, setIsWaitStatus] = useState(false);
    useEffect(() => {
        let allProductsData = JSON.parse(localStorage.getItem("asfour-store-user-cart"));
        if (Array.isArray(allProductsData)) {
            if (allProductsData.length > 0) {
                setAllProductsData(allProductsData);
                // let totalPriceBeforeDiscount = calcTotalOrderPriceBeforeDiscount(allProductsData);
                // let totalDiscount = calcTotalOrderDiscount(allProductsData);
                // let totalPriceAfterDiscount = calcTotalOrderPriceAfterDiscount(totalPriceBeforeDiscount, totalDiscount);
                // setPricesDetailsSummary({
                //     ...pricesDetailsSummary,
                //     totalPriceBeforeDiscount,
                //     totalDiscount,
                //     totalPriceAfterDiscount,
                // });
                // setAllProductsData(allProductsData);
                // getOrderDetails(orderId)
                //     .then(async (order) => {
                //         const result = await orderAllProducts(orderId, order.orderNumber);
                //         setKlarnaOrderId(result.order_id);
                //         await updateOrder(orderId, result.order_id);
                //         renderKlarnaCheckoutHtmlSnippetFromKlarnaCheckoutAPI(result.html_snippet);
                //     });
            }
        }
    }, []);
    return (
        <div className="cart d-flex flex-column justify-content-center">
            <Head>
                <title>Asfour Store - User Cart</title>
            </Head>
            <Header />
            <div className="page-content text-white p-4 text-center">
                <div className="container-fluid">
                    {(errMsg || successMsg) && <p className={`result-update-cart-msg text-white text-start mb-5 p-3 alert ${errMsg ? "alert-danger bg-danger" : ""} ${successMsg ? "alert-success bg-success" : ""}`}>{errMsg || successMsg}</p>}
                    <div className="row">
                        <div className="col-md-8">
                            {allProductsData.length > 0 ? <section className="products w-100">
                                <table className="user-products-table mb-4 w-100 text-start">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Subtotal</th>
                                            <th>Process</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allProductsData.map((product) => (
                                            <tr key={product._id}>
                                                <td className="product-cell">
                                                    <div className="row">
                                                        <div className="col-md-3">
                                                            <img src={`${process.env.BASE_API_URL}/${product.imagePath}`} width="100" height="100" />
                                                        </div>
                                                        <div className="col-md-9">
                                                            <h5 className="product-name mb-3">{product.name}</h5>
                                                            <h6 className="product-price">{product.price} $</h6>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="update-product-quantity-cell">
                                                    <div className="update-product-quantity p-3">
                                                        <HiMinus className="update-product-icon" />
                                                        <span className="ms-3 me-3">{product.quantity}</span>
                                                        <HiPlus className="update-product-icon" />
                                                    </div>
                                                </td>
                                                <td>
                                                    { product.price * product.quantity } $
                                                </td>
                                                <td>
                                                    <BsTrash />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section> : <p className="alert alert-danger w-100 mx-auto">Sorry, Not Found Any Products !!</p>}
                        </div>
                        <div className="col-md-4">

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}