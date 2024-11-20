import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsClock, BsFillSuitHeartFill, BsSuitHeart } from "react-icons/bs";
import { PiShareFatLight } from "react-icons/pi";
import { FaCheck, FaCartPlus, FaStar, FaRegStar } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import Link from "next/link";
import axios from "axios";
import { getRemainingTime } from "../../../public/global_functions/popular";
import { IoIosFlash } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";

export default function ProductCard({
    productDetails,
    setIsDisplayShareOptionsBox,
    isFavoriteProductForUserAsProperty,
    isExistProductInsideTheCartAsProperty,
    usdPriceAgainstCurrency,
    currencyNameByCountry,
    setSharingName,
    setSharingURL,
    currentDateAsString,
    isFlashProductAsProperty = false,
    isDisplayCountdown = false,
    setIsDisplayErrorPopup,
    setErrorType
}) {

    const [isFlashProduct, setIsFlashProduct] = useState(isFlashProductAsProperty);

    const [isDisplayProduct, setIsDisplayProduct] = useState(!isDisplayCountdown);

    const [isFavoriteProductForUser, setIsFavoriteProductForUser] = useState(isFavoriteProductForUserAsProperty);

    const [isExistProductInsideTheCart, setIsExistProductInsideTheCart] = useState(isExistProductInsideTheCartAsProperty);

    const [isWaitAddProductToFavoriteUserProductsList, setIsWaitAddProductToFavoriteUserProductsList] = useState(false);

    const [isWaitDeleteProductToFavoriteUserProductsList, setIsWaitDeleteProductToFavoriteUserProductsList] = useState(false);

    const [isSuccessAddProductToFavoriteUserProductsList, setIsSuccessAddProductToFavoriteUserProductsList] = useState(false);

    const [isSuccessDeleteProductToFavoriteUserProductsList, setIsSuccessDeleteProductToFavoriteUserProductsList] = useState(false);

    const [isWaitAddToCart, setIsWaitAddToCart] = useState(false);

    const [isSuccessAddToCart, setIsSuccessAddToCart] = useState(false);

    const [errorInAddToCart, setErrorInAddToCart] = useState("");

    const [isWaitDeleteFromCart, setIsWaitDeleteFromCart] = useState(false);

    const [isSuccessDeleteFromCart, setIsSuccessDeleteFromCart] = useState(false);

    const [errorInDeleteFromCart, setErrorInDeleteFromCart] = useState("");

    const [remainingTimeForDiscountOffer, setRemainingTimeForDiscountOffer] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const { t, i18n } = useTranslation();

    const dispatch = useDispatch();

    const state = useSelector(state => state);

    useEffect(() => {
        if (isFlashProduct) {
            const endDate = new Date(productDetails.endDiscountPeriod);
            let startDateInMilliSeconds = (new Date(currentDateAsString)).getTime();
            const endDateInMilliSeconds = endDate.getTime();
            let timeDiff = endDateInMilliSeconds - startDateInMilliSeconds;
            let timeOutInternval = setInterval(() => {
                if (timeDiff > 0) {
                    setRemainingTimeForDiscountOffer(getRemainingTime(timeDiff));
                    startDateInMilliSeconds += 1000;
                    timeDiff = endDateInMilliSeconds - startDateInMilliSeconds;
                } else {
                    setIsFlashProduct(false);
                    clearInterval(timeOutInternval);
                }
            }, 1000);
        }
    }, []);

    const addProductToFavoriteUserProducts = async (productId) => {
        try {
            const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
            if (userToken) {
                setIsWaitAddProductToFavoriteUserProductsList(true);
                const result = (await axios.post(`${process.env.BASE_API_URL}/favorite-products/add-new-favorite-product/${productId}?language=${i18n.language}`, undefined, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.userTokenNameInLocalStorage),
                    }
                })).data;
                setIsWaitAddProductToFavoriteUserProductsList(false);
                if (!result.error) {
                    setIsSuccessAddProductToFavoriteUserProductsList(true);
                    let successAddToCartTimeout = setTimeout(() => {
                        setIsSuccessAddProductToFavoriteUserProductsList(false);
                        dispatch({
                            type: "(Add / Delete) (To / From ) Favorite",
                            productsCountInFavorite: state.productsCountInFavorite + 1
                        });
                        setIsFavoriteProductForUser(true);
                        clearTimeout(successAddToCartTimeout);
                    }, 3000);
                }
            } else {
                setIsDisplayErrorPopup(true);
                setErrorType("user-not-logged-in-for-add-product-to-favourite-products-list");
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                setIsDisplayErrorPopup(true);
                setErrorType("user-not-logged-in-for-add-product-to-favourite-products-list");
                return;
            }
            setIsWaitAddProductToFavoriteUserProductsList(false);
        }
    }

    const deleteProductFromFavoriteUserProducts = async (productId) => {
        try {
            setIsWaitDeleteProductToFavoriteUserProductsList(true);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/favorite-products/${productId}?language=${i18n.language}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.userTokenNameInLocalStorage),
                }
            })).data;
            if (!result.error) {
                setIsWaitDeleteProductToFavoriteUserProductsList(false);
                setIsSuccessDeleteProductToFavoriteUserProductsList(true);
                let successDeleteToCartTimeout = setTimeout(() => {
                    setIsSuccessDeleteProductToFavoriteUserProductsList(false);
                    dispatch({
                        type: "(Add / Delete) (To / From ) Favorite",
                        productsCountInFavorite: state.productsCountInFavorite - 1
                    });
                    setIsFavoriteProductForUser(false);
                    clearTimeout(successDeleteToCartTimeout);
                }, 3000);
            }
        }
        catch (err) {
            setIsWaitDeleteProductToFavoriteUserProductsList(false);
        }
    }

    const addToCart = (productId) => {
        try {
            setIsWaitAddToCart(true);
            const userCart = JSON.parse(localStorage.getItem(process.env.userCartNameInLocalStorage));
            if (Array.isArray(userCart)) {
                if (userCart.length > 0) {
                    const productIndex = userCart.findIndex((product) => product._id === productId);
                    if (productIndex === -1) {
                        userCart.push({
                            _id: productId,
                            quantity: 1,
                        });
                        localStorage.setItem(process.env.userCartNameInLocalStorage, JSON.stringify(userCart));
                        setIsWaitAddToCart(false);
                        setIsSuccessAddToCart(true);
                        dispatch({
                            type: "(Add / Delete) (To / From ) Cart",
                            productsCountInCart: userCart.length
                        });
                        let successAddToCartTimeout = setTimeout(() => {
                            setIsSuccessAddToCart(false);
                            setIsExistProductInsideTheCart(true);
                            clearTimeout(successAddToCartTimeout);
                        }, 3000);
                    } else {
                        setIsWaitAddToCart(false);
                        setErrorInAddToCart("Sorry, This Product Is Already Exist In Your Cart !!");
                        let errorInAddToCartTimeout = setTimeout(() => {
                            setErrorInAddToCart("");
                            clearTimeout(errorInAddToCartTimeout);
                        }, 3000);
                    }
                }
                else {
                    let allProductsData = [];
                    allProductsData.push({
                        _id: productId,
                        quantity: 1,
                    });
                    localStorage.setItem(process.env.userCartNameInLocalStorage, JSON.stringify(allProductsData));
                    setIsWaitAddToCart(false);
                    setIsSuccessAddToCart(true);
                    dispatch({
                        type: "(Add / Delete) (To / From ) Cart",
                        productsCountInCart: allProductsData.length
                    });
                    let successAddToCartTimeout = setTimeout(() => {
                        setIsSuccessAddToCart(false);
                        setIsExistProductInsideTheCart(true);
                        clearTimeout(successAddToCartTimeout);
                    }, 3000);
                }
            } else {
                let allProductsData = [];
                allProductsData.push({
                    _id: productId,
                    quantity: 1,
                });
                localStorage.setItem(process.env.userCartNameInLocalStorage, JSON.stringify(allProductsData));
                setIsWaitAddToCart(false);
                setIsSuccessAddToCart(true);
                dispatch({
                    type: "(Add / Delete) (To / From ) Cart",
                    productsCountInCart: allProductsData.length
                });
                let successAddToCartTimeout = setTimeout(() => {
                    setIsSuccessAddToCart(false);
                    setIsExistProductInsideTheCart(true);
                    clearTimeout(successAddToCartTimeout);
                }, 3000);
            }
        }
        catch (err) {
            setIsWaitAddToCart(false);
            setErrorInAddToCart("Sorry, Someting Went Wrong, Please Try Again The Process !!");
            let errorInAddToCartTimeout = setTimeout(() => {
                setErrorInAddToCart(false);
                clearTimeout(errorInAddToCartTimeout);
            }, 3000);
        }
    }

    const deleteFromCart = (productId) => {
        setIsWaitDeleteFromCart(true);
        const userCart = JSON.parse(localStorage.getItem(process.env.userCartNameInLocalStorage));
        if (Array.isArray(userCart)) {
            if (userCart.length > 0) {
                const newUserCart = userCart.filter((product) => product._id !== productId);
                if (newUserCart.length < userCart.length) {
                    localStorage.setItem(process.env.userCartNameInLocalStorage, JSON.stringify(newUserCart));
                    setIsWaitDeleteFromCart(false);
                    setIsSuccessDeleteFromCart(true);
                    dispatch({
                        type: "(Add / Delete) (To / From ) Cart",
                        productsCountInCart: newUserCart.length
                    });
                    let successDeleteFromCartTimeout = setTimeout(() => {
                        setIsSuccessDeleteFromCart(false);
                        setIsExistProductInsideTheCart(false);
                        clearTimeout(successDeleteFromCartTimeout);
                    }, 3000);
                } else {
                    setIsWaitDeleteFromCart(false);
                    setErrorInDeleteFromCart("Sorry, This Product Is Not Exist In Your Cart !!");
                    let errorInDeleteFromCartTimeout = setTimeout(() => {
                        setErrorInDeleteFromCart("");
                        clearTimeout(errorInDeleteFromCartTimeout);
                    }, 3000);
                }
            } else {
                setIsWaitDeleteFromCart(false);
                setErrorInDeleteFromCart("Sorry, This Product Is Not Exist In Your Cart !!");
                localStorage.setItem(process.env.userCartNameInLocalStorage, JSON.stringify([]));
                dispatch({
                    type: "(Add / Delete) (To / From ) Cart",
                    productsCountInCart: 0
                });
                let errorInDeleteFromCartTimeout = setTimeout(() => {
                    setErrorInDeleteFromCart("");
                    clearTimeout(errorInDeleteFromCartTimeout);
                }, 3000);
            }
        }
    }

    const handleDisplayShareOptionsBox = (sharingURL) => {
        setIsDisplayShareOptionsBox(true);
        setSharingName("Product");
        setSharingURL(sharingURL);
    }

    const handleShowProductDetails = () => {
        setIsDisplayProduct(true);
    }

    const getSuitableRatingByRatingsCount = (ratings) => {
        let sumRatings = 0, ratingsCount = 0;
        for (let i = 1; i <= 5; i++) {
            sumRatings += i * ratings[i];
            ratingsCount += ratings[i];
        }
        return ratingsCount > 0 ? Math.round(sumRatings / ratingsCount) : 0;
    }

    const getRatingResult = () => {
        const rating = getSuitableRatingByRatingsCount(productDetails.ratings);
        const ratingStarIcons = [];
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) {
                ratingStarIcons.push(
                    <FaStar className={`me-3 star-icon ${i18n.language === "ar" ? "ms-3" : ""}`} />
                );
            } else {
                ratingStarIcons.push(
                    <FaRegStar className={`me-3 star-icon ${i18n.language === "ar" ? "ms-3" : ""}`} />
                );
            }
        }
        return (
            <div className="rating-result-box mb-4">
                {ratingStarIcons}
            </div>
        );
    }

    return (
        <div className="product-card card-box">
            {!isDisplayProduct && <div className="flash-discount-description bg-white text-dark p-4 text-center">
                <IoIosFlash className="flash-icon mb-3" />
                <h6 className="fw-bold mb-4 p-2">
                    {
                        remainingTimeForDiscountOffer.days > 0 ||
                            remainingTimeForDiscountOffer.hours > 0 ||
                            remainingTimeForDiscountOffer.minutes > 0 ||
                            remainingTimeForDiscountOffer.seconds > 0 ? t("Time Is Running Out !!") : t("Expired !!")
                    }
                </h6>
                <h6 className="fw-bold mb-4 p-2">{productDetails.offerDescription}</h6>
                <div className="row mb-4">
                    <div className="col-3">
                        <div className="remaining-time w-100 text-dark fw-bold d-flex flex-column justify-content-center align-items-center pt-2 pb-2">
                            <span>{remainingTimeForDiscountOffer.days}</span>
                            <p className="mb-0 fw-bold">{t("Day")}</p>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="remaining-time w-100 text-dark fw-bold d-flex flex-column justify-content-center align-items-center pt-2 pb-2">
                            <span>{remainingTimeForDiscountOffer.hours}</span>
                            <p className="mb-0 fw-bold">{t("Hour")}</p>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="remaining-time w-100 text-dark fw-bold d-flex flex-column justify-content-center align-items-center pt-2 pb-2">
                            <span>{remainingTimeForDiscountOffer.minutes}</span>
                            <p className="mb-0 fw-bold">{t("Min")}</p>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="remaining-time w-100 text-dark fw-bold d-flex flex-column justify-content-center align-items-center pt-2 pb-2">
                            <span>{remainingTimeForDiscountOffer.seconds}</span>
                            <p className="mb-0 fw-bold">{t("Sec")}</p>
                        </div>
                    </div>
                </div>
                <button className="btn fw-bold w-100" onClick={handleShowProductDetails}>{t("Show Product Details")}</button>
            </div>}
            {isDisplayProduct && <>
                <div
                    className="product-managment-box managment-box"
                >
                    {
                        productDetails.discount > 0 &&
                        !isFlashProduct &&
                        <div className="sale-box text-white p-2 text-center bg-danger">{t("Discount")} ( {(productDetails.discount / productDetails.price * 100).toFixed(2)} % )</div>
                    }
                    {
                        productDetails.discountInOfferPeriod > 0 &&
                        isFlashProduct &&
                        <div className="sale-box text-white p-2 text-center bg-danger">{t("Discount")} ( {(productDetails.discountInOfferPeriod / productDetails.price * 100).toFixed(2)} % )</div>
                    }
                    <img src={`${process.env.BASE_API_URL}/${productDetails.imagePath}`} alt="Product Image" />
                    <Link className={`product-overlay card-overlay ${(isWaitAddProductToFavoriteUserProductsList || isSuccessAddProductToFavoriteUserProductsList) ? "displaying" : ""}`} href={`/product-details/${productDetails._id}`}></Link>
                    <div className="product-managment-buttons managment-buttons p-2">
                        <PiShareFatLight
                            className="product-managment-icon d-block mb-2"
                            onClick={() => handleDisplayShareOptionsBox(`https://ubuyblues.com/product-details/${productDetails._id}`)}
                        />
                        {
                            !isWaitAddProductToFavoriteUserProductsList &&
                            !isWaitDeleteProductToFavoriteUserProductsList &&
                            !isSuccessAddProductToFavoriteUserProductsList &&
                            !isSuccessDeleteProductToFavoriteUserProductsList &&
                            <>
                                {isFavoriteProductForUser ? <BsFillSuitHeartFill
                                    className="product-managment-icon managment-icon"
                                    onClick={() => deleteProductFromFavoriteUserProducts(productDetails._id)}
                                /> :
                                    <BsSuitHeart
                                        className="product-managment-icon managment-icon"
                                        onClick={() => addProductToFavoriteUserProducts(productDetails._id)}
                                    />}
                            </>}
                        {(isWaitAddProductToFavoriteUserProductsList || isWaitDeleteProductToFavoriteUserProductsList) && <BsClock className="product-managment-icon managment-icon" />}
                        {(isSuccessAddProductToFavoriteUserProductsList || isSuccessDeleteProductToFavoriteUserProductsList) && <FaCheck className="product-managment-icon managment-icon" />}
                    </div>
                    <div className={`add-to-cart-button-box ${(isWaitAddToCart || isSuccessAddToCart) ? "displaying" : ""}`}>
                        {!isWaitAddToCart && !isWaitDeleteFromCart && !isSuccessAddToCart && !isSuccessDeleteFromCart && !isExistProductInsideTheCart && !errorInAddToCart && !errorInDeleteFromCart && <button className="add-to-cart-btn cart-btn p-2" onClick={() => addToCart(productDetails._id, productDetails.name, productDetails.price, productDetails.description, productDetails.category, productDetails.discount, productDetails.imagePath)}>{t("Add To Cart")} <FaCartPlus /> </button>}
                        {isWaitAddToCart && <button className="wait-to-cart-btn cart-btn p-2">{t("Waiting In Add To Cart")} ...</button>}
                        {errorInAddToCart && <button className="error-to-cart-btn cart-btn p-2 bg-danger text-white">{errorInAddToCart}</button>}
                        {isSuccessAddToCart && <Link href="/cart" className="success-in-add-to-cart-btn cart-btn p-2 btn btn-success text-white">
                            <FaCheck className={`${i18n.language !== "ar" ? "me-2" : "ms-3"}`} />
                            <span>{t("Click To Go To Cart Page")}</span>
                        </Link>}
                        {!isWaitAddToCart && !isWaitDeleteFromCart && !isSuccessAddToCart && !isSuccessDeleteFromCart && isExistProductInsideTheCart && !errorInAddToCart && !errorInDeleteFromCart && <button className="delete-from-cart-btn cart-btn p-2 bg-danger text-white" onClick={() => deleteFromCart(productDetails._id)}>{t("Delete From Cart")} <MdDeleteForever /></button>}
                        {isWaitDeleteFromCart && <button className="wait-to-cart-btn cart-btn p-2 bg-danger text-white">{t("Waiting To Delete From Cart")} ...</button>}
                        {errorInDeleteFromCart && <button className="error-to-cart-btn cart-btn p-2 bg-danger text-white" disabled>{errorInDeleteFromCart}</button>}
                        {isSuccessDeleteFromCart && <Link href="/cart" className="success-in-delete-from-cart-btn cart-btn p-2 btn btn-success text-white">
                            <FaCheck className={`${i18n.language !== "ar" ? "me-2" : "ms-3"}`} />
                            <span>{t("Click To Go To Cart Page")}</span>
                        </Link>}
                    </div>
                </div>
                <div className="product-details details-box p-3 text-center">
                    {getRatingResult()}
                    <h4 className="product-name mb-3 fw-bold">{productDetails.name}</h4>
                    <ul className="product-categories-list">
                        {productDetails.categories.length > 0 ? productDetails.categories.map((category, categoryIndex) => (
                            <li className="mb-3 d-inline-block fw-bold" key={category._id}>{category.name + (categoryIndex !== productDetails.categories.length - 1 ? "  - " : "")}</li>
                        )) : <li className="mb-3 d-inline-block fw-bold bg-danger p-2 text-white border-2">{t("Ucategorized")}</li>}
                    </ul>
                    <h5 className={`product-price ${(productDetails.discount !== 0 || productDetails.discountInOfferPeriod !== 0) ? "text-decoration-line-through" : ""}`}>{(productDetails.price * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h5>
                    {
                        productDetails.discount > 0 &&
                        !isFlashProduct &&
                        <h4 className="product-price-after-discount m-0">{((productDetails.price - productDetails.discount) * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h4>
                    }
                    {
                        productDetails.discountInOfferPeriod > 0 &&
                        isFlashProduct &&
                        <h4 className="product-price-after-discount m-0">{((productDetails.price - productDetails.discountInOfferPeriod) * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h4>
                    }
                </div>
            </>}
        </div>
    );
}