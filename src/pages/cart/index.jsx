import Head from "next/head";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { HiMinus, HiPlus } from "react-icons/hi";
import { BsTrash } from "react-icons/bs";
import Link from "next/link";
import LoaderPage from "@/components/LoaderPage";
import { useTranslation } from "react-i18next";
import NotFoundError from "@/components/NotFoundError";
import Footer from "@/components/Footer";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import axios from "axios";
import { getProductQuantity, calcTotalPrices, isExistOfferOnProduct } from "../../../public/global_functions/popular";
import { getCurrencyNameByCountry, getUSDPriceAgainstCurrency } from "../../../public/global_functions/prices";

export default function Cart({ countryAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [isGetGroupedProductsByStoreId, setIsGetGroupedProductsByStoreId] = useState(true);

    const [allProductsData, setAllProductsData] = useState([]);

    const [currentDate, setCurrentDate] = useState("");

    const [pricesDetailsSummary, setPricesDetailsSummary] = useState([{
        totalPriceBeforeDiscount: 0,
        totalDiscount: 0,
        totalPriceAfterDiscount: 0,
    }]);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const { t, i18n } = useTranslation();

    useEffect(() => {
        setIsLoadingPage(true);
        getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(getCurrencyNameByCountry(countryAsProperty));
            if (!isGetGroupedProductsByStoreId) {
                setIsLoadingPage(false);
            }
        })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
    }, [countryAsProperty]);

    useEffect(() => {
        let tempAllProductsDataInsideTheCart = JSON.parse(localStorage.getItem("asfour-store-customer-cart"));
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
        if (Array.isArray(tempAllProductsDataInsideTheCart)) {
            if (tempAllProductsDataInsideTheCart.length > 0) {
                getProductsByIds(tempAllProductsDataInsideTheCart.map((product) => product._id))
                    .then((result) => {
                        if (result.data.productByIds.length > 0) {
                            setCurrentDate(result.data.currentDate)
                            let tempPricesDetailsSummary = [];
                            result.data.productByIds.forEach((data) => {
                                tempPricesDetailsSummary.push(calcTotalPrices(result.data.currentDate, data.products));
                            });
                            setPricesDetailsSummary(tempPricesDetailsSummary);
                            setAllProductsData(result.data.productByIds);
                        }
                        setWindowInnerWidth(window.innerWidth);
                        window.addEventListener("resize", () => {
                            setWindowInnerWidth(window.innerWidth);
                        });
                        window.addEventListener("scroll", function () {
                            if (this.innerWidth < 991) {
                                let cartTotalBtnBox = document.querySelector(".products .cart-total-btn-box");
                                if (this.scrollY < 613) {
                                    cartTotalBtnBox.style.display = "block";
                                } else cartTotalBtnBox.style.display = "none";
                            }
                        });
                        setIsGetGroupedProductsByStoreId(false);
                    })
                    .catch((err) => {
                        console.log(err)
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    });
            } else {
                setIsGetGroupedProductsByStoreId(false);
            }
        }
        else {
            setIsGetGroupedProductsByStoreId(false);
        }
    }, []);

    useEffect(() => {
        if (!isGetGroupedProductsByStoreId) {
            setIsLoadingPage(false);
        }
    }, [isGetGroupedProductsByStoreId]);

    const getProductsByIds = async (productsIds) => {
        try {
            const res = await axios.post(`${process.env.BASE_API_URL}/products/products-by-ids`, {
                productsIds,
            });
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

    const updateProductQuantity = async (productId, operation) => {
        switch (operation) {
            case "increase-product-quantity": {
                const tempAllProductsDataInsideTheCart = JSON.parse(localStorage.getItem("asfour-store-customer-cart"));
                tempAllProductsDataInsideTheCart.forEach((product) => {
                    if (product._id === productId && product.quantity < 50) product.quantity++;
                });
                updateCartInLocalStorage(tempAllProductsDataInsideTheCart);
                const result = await getProductsByIds(tempAllProductsDataInsideTheCart.map((product) => product._id));
                let tempPricesDetailsSummary = [];
                result.data.productByIds.forEach((data) => {
                    tempPricesDetailsSummary.push(calcTotalPrices(currentDate, data.products));
                });
                setPricesDetailsSummary(tempPricesDetailsSummary);
                setAllProductsData(result.data.productByIds);
                break;
            }
            case "decrease-product-quantity": {
                const tempAllProductsDataInsideTheCart = JSON.parse(localStorage.getItem("asfour-store-customer-cart"));
                tempAllProductsDataInsideTheCart.forEach((product) => {
                    if (product._id === productId && product.quantity > 1) product.quantity--;
                });
                updateCartInLocalStorage(tempAllProductsDataInsideTheCart);
                const result = await getProductsByIds(tempAllProductsDataInsideTheCart.map((product) => product._id));
                let tempPricesDetailsSummary = [];
                result.data.productByIds.forEach((data) => {
                    tempPricesDetailsSummary.push(calcTotalPrices(currentDate, data.products));
                });
                setPricesDetailsSummary(tempPricesDetailsSummary);
                setAllProductsData(result.data.productByIds);
                break;
            }
            default: {
                console.log("Error, Wrong Operation !!");
            }
        }
    }

    const deleteProduct = async (productId) => {
        const newProductsData = JSON.parse(localStorage.getItem("asfour-store-customer-cart")).filter((product) => product._id !== productId);
        updateCartInLocalStorage(newProductsData);
        const result = await getProductsByIds(newProductsData.map((product) => product._id));
        let tempPricesDetailsSummary = [];
        result.data.productByIds.forEach((data) => {
            tempPricesDetailsSummary.push(calcTotalPrices(currentDate, data.products));
        });
        setPricesDetailsSummary(tempPricesDetailsSummary);
        setAllProductsData(result.data.productByIds);
    }

    const updateCartInLocalStorage = (newProductsData) => {
        localStorage.setItem("asfour-store-customer-cart", JSON.stringify(newProductsData));
    }

    return (
        <div className="cart d-flex flex-column justify-content-center page">
            <Head>
                <title>Ubuyblues Store - User Cart</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content">
                    <div className="container-fluid text-white text-center mb-4">
                        {allProductsData.length > 0 ? <section className="products-by-store">
                            {allProductsData.map((store, storeIndex) => (
                                <div className="store mb-5 pb-5" key={store.storeId}>
                                    <h2 className="mb-5">{t("Store-Associated Products")} : {store.storeId}</h2>
                                    <div className="row align-items-center">
                                        <div className="col-xl-8">
                                            {windowInnerWidth > 991 && <section className="products w-100">
                                                <table className="user-products-table mb-4 w-100">
                                                    <thead>
                                                        <tr>
                                                            <th>{t("Product")}</th>
                                                            <th>{t("Quantity")}</th>
                                                            <th>{t("Subtotal")}</th>
                                                            <th>{t("Action")}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {store.products.map((product) => (
                                                            <tr key={product._id}>
                                                                <td className="product-cell">
                                                                    <div className="row">
                                                                        <div className="col-lg-4">
                                                                            <img src={`${process.env.BASE_API_URL}/${product.imagePath}`} width="100" height="100" />
                                                                        </div>
                                                                        <div className="col-lg-8">
                                                                            <h5 className="product-name mb-3">{product.name}</h5>
                                                                            <h6 className={`product-price ${product.discount !== 0 || product.discountInOfferPeriod !== 0 ? "text-decoration-line-through" : ""}`}>{(product.price * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h6>
                                                                            {
                                                                                product.discount > 0 &&
                                                                                !isExistOfferOnProduct(currentDate, product.startDiscountPeriod, product.endDiscountPeriod) &&
                                                                                <h6 className="product-price-after-discount m-0">{((product.price - product.discount) * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h6>
                                                                            }
                                                                            {
                                                                                product.discountInOfferPeriod > 0 &&
                                                                                isExistOfferOnProduct(currentDate, product.startDiscountPeriod, product.endDiscountPeriod) &&
                                                                                <h6 className="product-price-after-discount m-0">{((product.price - product.discountInOfferPeriod) * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h6>
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="update-product-quantity-cell">
                                                                    <div className="update-product-quantity p-3">
                                                                        <HiMinus className="update-product-icon"
                                                                            onClick={() => updateProductQuantity(product._id, "decrease-product-quantity")}
                                                                        />
                                                                        <span className="ms-3 me-3">{getProductQuantity(product._id)}</span>
                                                                        <HiPlus className="update-product-icon"
                                                                            onClick={() => updateProductQuantity(product._id, "increase-product-quantity")}
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td className="subtotal-cell">
                                                                    {(product.price * usdPriceAgainstCurrency * getProductQuantity(product._id)).toFixed(2)} {t(currencyNameByCountry)}
                                                                </td>
                                                                <td className="delete-product-cell">
                                                                    <BsTrash className="trash-icon" onClick={() => deleteProduct(product._id)} />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </section>}
                                            {windowInnerWidth <= 991 && <section className="products w-100">
                                                <a href="#order-total" className="cart-total-btn-box">
                                                    {t("Go To Cart Totals")}
                                                </a>
                                                {store.products.map((product, index) => (
                                                    <div className="product mb-4" key={product._id}>
                                                        <h4 className="mb-3">{t("Product")} # {index + 1}</h4>
                                                        <table className="user-products-table-for-mobiles-and-tablets table-for-mobiles-and-tablets w-100">
                                                            <tbody>
                                                                <tr>
                                                                    <th>{t("Product")}</th>
                                                                    <td className="product-cell">
                                                                        <img src={`${process.env.BASE_API_URL}/${product.imagePath}`} width="100" height="100" className="mb-3" />
                                                                        <h5 className="product-name mb-3">{product.name}</h5>
                                                                        <h6 className={`product-price ${product.discount != 0 ? "text-decoration-line-through" : ""}`}>{(product.price * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h6>
                                                                        {product.discount != 0 && <h6 className="product-after-discount">{((product.price - product.discount) * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h6>}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <th>{t("Quantity")}</th>
                                                                    <td className="update-product-quantity-cell">
                                                                        <div className="update-product-quantity p-3 w-100">
                                                                            <HiMinus className="update-product-icon"
                                                                                onClick={() => updateProductQuantity(product._id, "decrease-product-quantity")}
                                                                            />
                                                                            <span className="ms-3 me-3">{getProductQuantity(product._id)}</span>
                                                                            <HiPlus className="update-product-icon"
                                                                                onClick={() => updateProductQuantity(product._id, "increase-product-quantity")}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <th>{t("Subtotal")}</th>
                                                                    <td className="subtotal-cell">
                                                                        {(product.price * usdPriceAgainstCurrency * getProductQuantity(product._id)).toFixed(2)} {t(currencyNameByCountry)}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <th>{t("Action")}</th>
                                                                    <td className="delete-product-cell">
                                                                        <BsTrash className="trash-icon" onClick={() => deleteProduct(product._id)} />
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ))}
                                            </section>}
                                        </div>
                                        <div className="col-xl-4">
                                            <section className="order-total border border-3 p-4 ps-5 pe-5 text-start" id="order-total">
                                                <h5 className="fw-bold mb-5 text-center">{t("Cart Totals")}</h5>
                                                <div className="row total-price-before-discount total pb-3 mb-5">
                                                    <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                        {t("Total Price Before Discount")}
                                                    </div>
                                                    <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                        {(pricesDetailsSummary[storeIndex].totalPriceBeforeDiscount * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                                    </div>
                                                </div>
                                                <div className="row total-price-discount total pb-3 mb-5">
                                                    <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                        {t("Total Discount")}
                                                    </div>
                                                    <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                        {(pricesDetailsSummary[storeIndex].totalDiscount * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                                    </div>
                                                </div>
                                                <div className="row total-price-after-discount total pb-3 mb-5">
                                                    <div className={`col-md-8 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-start" : "text-md-end"}`}>
                                                        {t("Total Price After Discount")}
                                                    </div>
                                                    <div className={`col-md-4 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                                        {(pricesDetailsSummary[storeIndex].totalPriceAfterDiscount * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                                    </div>
                                                </div>
                                                <Link href={`/checkout?storeId=${store.storeId}`} className="checkout-link p-2 w-100 d-block text-center fw-bold">{t("Go To Checkout")}</Link>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section> : <NotFoundError errorMsg={t("Sorry, Can't Find Any Products For You In Cart !!")} />}
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
            return {
                redirect: {
                    permanent: false,
                    destination: "/",
                },
                props: {
                    countryAsProperty: "kuwait",
                },
            }
        }
        if (Object.keys(query).filter((key) => key !== "country").length > 1) {
            return {
                redirect: {
                    permanent: false,
                    destination: `/?country=${query.country}`,
                },
                props: {
                    countryAsProperty: query.country,
                },
            }
        }
        return {
            props: {
                countryAsProperty: query.country,
            },
        }
    }
    return {
        props: {
            countryAsProperty: "kuwait",
        },
    }
}