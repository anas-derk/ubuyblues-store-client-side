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
import { getProductQuantity, calcTotalPrices, isExistOfferOnProduct, getUserInfo, getProductsByIds, handleSelectUserLanguage, getAnimationSettings, getInitialStateForElementBeforeAnimation } from "../../../public/global_functions/popular";
import { getCurrencyNameByCountry, getUSDPriceAgainstCurrency } from "../../../public/global_functions/prices";
import { useDispatch } from "react-redux";
import { motion } from "motion/react";

export default function Cart({ countryAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [isGetGroupedProductsByStoreId, setIsGetGroupedProductsByStoreId] = useState(true);

    const [isGetUserInfo, setIsGetUserInfo] = useState(true);

    const [allProductsData, setAllProductsData] = useState([]);

    const [currentDate, setCurrentDate] = useState("");

    const [pricesDetailsSummary, setPricesDetailsSummary] = useState([{
        totalPriceBeforeDiscount: 0,
        totalDiscount: 0,
        totalPriceAfterDiscount: 0,
    }]);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const { t, i18n } = useTranslation();

    const dispatch = useDispatch();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        setIsLoadingPage(true);
        getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(getCurrencyNameByCountry(countryAsProperty));
            if (!isGetGroupedProductsByStoreId) {
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
            setIsGetUserInfo(false);
        }
    }, []);

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        let tempAllProductsDataInsideTheCart = JSON.parse(localStorage.getItem(process.env.USER_CART_NAME_IN_LOCAL_STORAGE));
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
                        setIsGetGroupedProductsByStoreId(false);
                    })
                    .catch((err) => {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
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
        if (!isGetGroupedProductsByStoreId && !isGetUserInfo) {
            setIsLoadingPage(false);
        }
    }, [isGetGroupedProductsByStoreId, isGetUserInfo]);

    const updateProductQuantity = async (productId, operation) => {
        try {
            switch (operation) {
                case "increase-product-quantity": {
                    const tempAllProductsDataInsideTheCart = JSON.parse(localStorage.getItem(process.env.USER_CART_NAME_IN_LOCAL_STORAGE));
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
                    const tempAllProductsDataInsideTheCart = JSON.parse(localStorage.getItem(process.env.USER_CART_NAME_IN_LOCAL_STORAGE));
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
        catch (err) {
            console.log(err);
        }
    }

    const deleteProduct = async (productId) => {
        try {
            const newProductsData = JSON.parse(localStorage.getItem(process.env.USER_CART_NAME_IN_LOCAL_STORAGE)).filter((product) => product._id !== productId);
            updateCartInLocalStorage(newProductsData);
            if (newProductsData.length > 0) {
                const result = await getProductsByIds(newProductsData.map((product) => product._id));
                let tempPricesDetailsSummary = [], tempProductsCountInCart = 0;
                result.data.productByIds.forEach((data) => {
                    tempPricesDetailsSummary.push(calcTotalPrices(currentDate, data.products));
                    tempProductsCountInCart += data.products.length;
                });
                setPricesDetailsSummary(tempPricesDetailsSummary);
                setAllProductsData(result.data.productByIds);
                dispatch({
                    type: "(Add / Delete) (To / From ) Cart",
                    productsCountInCart: tempProductsCountInCart
                });
            } else {
                setPricesDetailsSummary([{
                    totalPriceBeforeDiscount: 0,
                    totalDiscount: 0,
                    totalPriceAfterDiscount: 0,
                }]);
                setAllProductsData([]);
                dispatch({
                    type: "(Add / Delete) (To / From ) Cart",
                    productsCountInCart: 0
                });
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    const updateCartInLocalStorage = (newProductsData) => {
        localStorage.setItem(process.env.USER_CART_NAME_IN_LOCAL_STORAGE, JSON.stringify(newProductsData));
    }

    return (
        <div className="cart page">
            <Head>
                <title>{t(process.env.STORE_NAME)} - {t("Cart")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content pt-5">
                    <div className="container-fluid text-white text-center mb-4">
                        {allProductsData.length > 0 ? <section className="products-by-store">
                            {allProductsData.map((store, storeIndex) => (
                                <div className="store mb-5 pb-5" key={store.storeId}>
                                    <h4 className="mb-5">{t("Store-Associated Products")} : {store.storeId}</h4>
                                    <div className="row align-items-center">
                                        <div className="col-xl-8">
                                            {windowInnerWidth > 991 && <section className="products w-100">
                                                <table className="user-products-table mb-4 w-100">
                                                    <motion.thead initial={getInitialStateForElementBeforeAnimation()} whileInView={() => getAnimationSettings(0.3)}>
                                                        <tr>
                                                            <th>{t("Product")}</th>
                                                            <th>{t("Quantity")}</th>
                                                            <th>{t("Subtotal")}</th>
                                                            <th>{t("Action")}</th>
                                                        </tr>
                                                    </motion.thead>
                                                    <tbody>
                                                        {store.products.map((product, productIndex) => (
                                                            <motion.tr key={product._id} initial={getInitialStateForElementBeforeAnimation()} whileInView={() => getAnimationSettings(0.3 * productIndex)}>
                                                                <td className="product-cell">
                                                                    <div className="row">
                                                                        <div className="col-lg-4">
                                                                            <img src={`${process.env.BASE_API_URL}/${product.imagePath}`} width="100" height="100" />
                                                                        </div>
                                                                        <div className="col-lg-8">
                                                                            <h6 className="product-name mb-3">{product.name[i18n.language]}</h6>
                                                                            <h6 className={`product-price ${product.discount !== 0 || product.discountInOfferPeriod !== 0 ? "text-decoration-line-through" : ""}`}>{(product.price * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h6>
                                                                            {
                                                                                product.discount > 0 &&
                                                                                !isExistOfferOnProduct(currentDate, product.startDiscountPeriod, product.endDiscountPeriod) &&
                                                                                <h6 className="product-price-before-discount m-0">{((product.price - product.discount) * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h6>
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
                                                            </motion.tr>
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
                                                        <h5 className="mb-3">{t("Product")} # {index + 1}</h5>
                                                        <table className="user-products-table-for-mobiles-and-tablets table-for-mobiles-and-tablets w-100">
                                                            <tbody>
                                                                <motion.tr initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                                    <th>{t("Product")}</th>
                                                                    <td className="product-cell">
                                                                        <img src={`${process.env.BASE_API_URL}/${product.imagePath}`} width="100" height="100" className="mb-3" />
                                                                        <h6 className="product-name mb-3">{product.name}</h6>
                                                                        <h6 className={`product-price ${(product.discount !== 0 || product.discountInOfferPeriod) ? "text-decoration-line-through" : ""}`}>{(product.price * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h6>
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
                                                                    </td>
                                                                </motion.tr>
                                                                <motion.tr initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
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
                                                                </motion.tr>
                                                                <motion.tr initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                                    <th>{t("Subtotal")}</th>
                                                                    <td className="subtotal-cell">
                                                                        {(product.price * usdPriceAgainstCurrency * getProductQuantity(product._id)).toFixed(2)} {t(currencyNameByCountry)}
                                                                    </td>
                                                                </motion.tr>
                                                                <motion.tr initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                                    <th>{t("Action")}</th>
                                                                    <td className="delete-product-cell">
                                                                        <BsTrash className="trash-icon" onClick={() => deleteProduct(product._id)} />
                                                                    </td>
                                                                </motion.tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ))}
                                            </section>}
                                        </div>
                                        <motion.div className="col-xl-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={() => getAnimationSettings(0.3 * storeIndex)}>
                                            <section className="order-total border border-3 text-start" id="order-total">
                                                <h6 className="fw-bold mb-5 text-center">{t("Cart Totals")}</h6>
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
                                        </motion.div>
                                    </div>
                                </div>
                            ))}
                        </section> : <NotFoundError errorMsg={t("Sorry, Can't Find Any Products For You In Cart !!")} />}
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