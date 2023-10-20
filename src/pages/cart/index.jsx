import Head from "next/head";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { HiMinus, HiPlus } from "react-icons/hi";
import { BsTrash } from "react-icons/bs";
import Link from "next/link";

export default function Cart() {
    const [allProductsData, setAllProductsData] = useState([]);
    const [pricesDetailsSummary, setPricesDetailsSummary] = useState({
        totalPriceBeforeDiscount: 0,
        totalDiscount: 0,
        totalPriceAfterDiscount: 0,
    });
    const [errMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isWaitStatus, setIsWaitStatus] = useState(false);
    useEffect(() => {
        let allProductsData = JSON.parse(localStorage.getItem("asfour-store-user-cart"));
        if (Array.isArray(allProductsData)) {
            if (allProductsData.length > 0) {
                const totalPriceBeforeDiscount = calcTotalOrderPriceBeforeDiscount(allProductsData);
                const totalDiscount = calcTotalOrderDiscount(allProductsData);
                const totalPriceAfterDiscount = calcTotalOrderPriceAfterDiscount(totalPriceBeforeDiscount, totalDiscount);
                setPricesDetailsSummary({
                    totalPriceBeforeDiscount,
                    totalDiscount,
                    totalPriceAfterDiscount,
                });
                setAllProductsData(allProductsData);
            }
        }
    }, []);
    const calcTotalOrderPriceBeforeDiscount = (allProductsData) => {
        let tempTotalPriceBeforeDiscount = 0;
        allProductsData.forEach((product) => {
            tempTotalPriceBeforeDiscount += product.price * product.quantity;
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
    const calcTotalOrderPriceAfterDiscount = (totalPriceBeforeDiscount, totalDiscount) => {
        return totalPriceBeforeDiscount - totalDiscount;
    }
    const updateProductQuantity = (allProductsData, productId, operation) => {
        switch (operation) {
            case "increase-product-quantity": {
                allProductsData.forEach((product) => {
                    if (product.id === productId && product.quantity < 50) product.quantity++;
                });
                updateCartInLocalStorage(allProductsData);
                calcTotalPrices(allProductsData);
                setAllProductsData(allProductsData);
                break;
            }
            case "decrease-product-quantity": {
                allProductsData.forEach((product) => {
                    if (product.id === productId && product.quantity > 1) product.quantity--;
                });
                updateCartInLocalStorage(allProductsData);
                calcTotalPrices(allProductsData);
                setAllProductsData(allProductsData);
                break;
            }
            default: {
                console.log("Error, Wrong Operation !!");
            }
        }
    }
    const calcTotalPrices = (allProductsData) => {
        const totalPriceBeforeDiscount = calcTotalOrderPriceBeforeDiscount(allProductsData);
        const totalDiscount = calcTotalOrderDiscount(allProductsData);
        const totalPriceAfterDiscount = calcTotalOrderPriceAfterDiscount(totalPriceBeforeDiscount, totalDiscount);
        setPricesDetailsSummary({
            totalPriceBeforeDiscount,
            totalDiscount,
            totalPriceAfterDiscount,
        });
    }
    const deleteProduct = (productId) => {
        const newProductsData = allProductsData.filter((product) => product.id != productId);
        updateCartInLocalStorage(newProductsData);
        calcTotalPrices(newProductsData);
        setAllProductsData(newProductsData);
    }
    const updateCartInLocalStorage = (newProductsData) => {
        localStorage.setItem("asfour-store-user-cart", JSON.stringify(newProductsData));
    }
    return (
        <div className="cart d-flex flex-column justify-content-center">
            <Head>
                <title>Asfour Store - User Cart</title>
            </Head>
            <Header />
            <div className="page-content text-white p-4 text-center">
                <div className="container-fluid">
                    {(errMsg || successMsg) && <p className={`result-update-cart-msg text-white text-start mb-5 p-3 alert ${errMsg ? "alert-danger bg-danger" : ""} ${successMsg ? "alert-success bg-success" : ""}`}>{errMsg || successMsg}</p>}
                    {allProductsData.length > 0 ? <div className="row align-items-center">
                        <div className="col-md-8">
                            <section className="products w-100">
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
                                            <tr key={product.id}>
                                                <td className="product-cell">
                                                    <div className="row">
                                                        <div className="col-md-3">
                                                            <img src={`${process.env.BASE_API_URL}/${product.imagePath}`} width="100" height="100" />
                                                        </div>
                                                        <div className="col-md-9">
                                                            <h5 className="product-name mb-3">{product.name}</h5>
                                                            <h6 className={`product-price ${product.discount != 0 ? "text-decoration-line-through" : ""}`}>{product.price} $</h6>
                                                            {product.discount != 0 && <h6 className="product-after-discount">{product.price - product.discount} $</h6>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="update-product-quantity-cell">
                                                    <div className="update-product-quantity p-3">
                                                        <HiMinus className="update-product-icon"
                                                            onClick={() => updateProductQuantity(allProductsData, product.id, "decrease-product-quantity")}
                                                        />
                                                        <span className="ms-3 me-3">{product.quantity}</span>
                                                        <HiPlus className="update-product-icon"
                                                            onClick={() => updateProductQuantity(allProductsData, product.id, "increase-product-quantity")}
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    {product.price * product.quantity} $
                                                </td>
                                                <td className="delete-product-cell">
                                                    <BsTrash className="trash-icon" onClick={() => deleteProduct(product.id)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        </div>
                        <div className="col-md-4">
                            <section className="order-total border border-3 p-4 ps-5 pe-5 text-start">
                                <h5 className="fw-bold mb-5 text-center">Cart Totals</h5>
                                <div className="row total-price-before-discount total pb-3 mb-5">
                                    <div className="col-md-9 fw-bold text-start p-0">
                                        Total Price Before Discount
                                    </div>
                                    <div className="col-md-3 fw-bold text-end p-0">
                                        {pricesDetailsSummary.totalPriceBeforeDiscount} $
                                    </div>
                                </div>
                                <div className="row total-price-discount total pb-3 mb-5">
                                    <div className="col-md-9 fw-bold text-start p-0">
                                        Total Discount
                                    </div>
                                    <div className="col-md-3 fw-bold text-end p-0">
                                        {pricesDetailsSummary.totalDiscount} $
                                    </div>
                                </div>
                                <div className="row total-price-after-discount total pb-3 mb-5">
                                    <div className="col-md-9 fw-bold text-start p-0">
                                        Total Price After Discount
                                    </div>
                                    <div className="col-md-3 fw-bold text-end p-0">
                                        {pricesDetailsSummary.totalPriceAfterDiscount} $
                                    </div>
                                </div>
                                <Link href="/checkout" className="checkout-link p-3 w-100 d-block text-center fw-bold">Go To Checkout</Link>
                            </section>
                        </div>
                    </div> : <p className="alert alert-danger w-100 mx-auto">Sorry, Not Found Any Products !!</p>}
                </div>
            </div>
        </div>
    );
}