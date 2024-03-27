import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { BsClock, BsFillSuitHeartFill, BsSuitHeart } from "react-icons/bs";
import { PiShareFatLight } from "react-icons/pi";
import { FaCheck, FaCartPlus } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import Link from "next/link";
import axios from "axios";

export default function ProductCard({
    product,
    setIsDisplayShareOptionsBox,
    isFavoriteProductForUserAsProperty,
    isExistProductInsideTheCartAsProperty,
    usdPriceAgainstCurrency,
    currencyNameByCountry,
    token,
}) {

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

    const { t, i18n } = useTranslation();

    const router = useRouter();

    const addProductToFavoriteUserProducts = async (productId) => {
        try {
            setIsWaitAddProductToFavoriteUserProductsList(true);
            const res = await axios.post(`${process.env.BASE_API_URL}/users/add-favorite-product?productId=${productId}`, undefined, {
                headers: {
                    Authorization: token,
                }
            });
            const result = await res.data;
            setIsWaitAddProductToFavoriteUserProductsList(false);
            if (!result.error) {
                setIsSuccessAddProductToFavoriteUserProductsList(true);
                let successAddToCartTimeout = setTimeout(() => {
                    setIsSuccessAddProductToFavoriteUserProductsList(false);
                    setIsFavoriteProductForUser(true);
                    clearTimeout(successAddToCartTimeout);
                }, 3000);
            }
        }
        catch (err) {
            console.log(err);
            if (err?.response?.data?.msg === "Unauthorized Error") {
                await router.push("/auth");
                return;
            }
            setIsWaitAddProductToFavoriteUserProductsList(false);
        }
    }

    const deleteProductFromFavoriteUserProducts = async (productId) => {
        try {
            setIsWaitDeleteProductToFavoriteUserProductsList(true);
            const res = await axios.delete(`${process.env.BASE_API_URL}/users/favorite-product?productId=${productId}`, {
                headers: {
                    Authorization: token,
                }
            });
            const result = await res.data;
            if (result.msg === "Ok !!, Deleting Favorite Product From This User Is Successfuly !!") {
                setIsWaitDeleteProductToFavoriteUserProductsList(false);
                setIsSuccessDeleteProductToFavoriteUserProductsList(true);
                let successDeleteToCartTimeout = setTimeout(() => {
                    setIsSuccessDeleteProductToFavoriteUserProductsList(false);
                    setIsFavoriteProductForUser(false);
                    clearTimeout(successDeleteToCartTimeout);
                }, 3000);
            }
        }
        catch (err) {
            setIsWaitDeleteProductToFavoriteUserProductsList(false);
        }
    }

    const addToCart = (id, name, price, description, category, discount, imagePath) => {
        try {
            setIsWaitAddToCart(true);
            const userCart = JSON.parse(localStorage.getItem("asfour-store-user-cart"));
            if (Array.isArray(userCart)) {
                if (userCart.length > 0) {
                    const productIndex = userCart.findIndex((product) => product.id === id);
                    if (productIndex === -1) {
                        userCart.push({
                            id,
                            name,
                            price,
                            description,
                            category,
                            discount,
                            imagePath,
                            quantity: 1,
                        });
                        localStorage.setItem("asfour-store-user-cart", JSON.stringify(userCart));
                        setIsWaitAddToCart(false);
                        setIsSuccessAddToCart(true);
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
                        id,
                        name,
                        price,
                        description,
                        category,
                        discount,
                        imagePath,
                        quantity: 1,
                    });
                    localStorage.setItem("asfour-store-user-cart", JSON.stringify(allProductsData));
                    setIsWaitAddToCart(false);
                    setIsSuccessAddToCart(true);
                    let successAddToCartTimeout = setTimeout(() => {
                        setIsSuccessAddToCart(false);
                        setIsExistProductInsideTheCart(true);
                        clearTimeout(successAddToCartTimeout);
                    }, 3000);
                }
            } else {
                let allProductsData = [];
                allProductsData.push({
                    id,
                    name,
                    price,
                    description,
                    category,
                    discount,
                    imagePath,
                    quantity: 1,
                });
                localStorage.setItem("asfour-store-user-cart", JSON.stringify(allProductsData));
                setIsWaitAddToCart(false);
                setIsSuccessAddToCart(true);
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
        const userCart = JSON.parse(localStorage.getItem("asfour-store-user-cart"));
        if (Array.isArray(userCart)) {
            if (userCart.length > 0) {
                const newUserCart = userCart.filter((product) => product.id !== productId);
                if (newUserCart.length < userCart.length) {
                    localStorage.setItem("asfour-store-user-cart", JSON.stringify(newUserCart));
                    setIsWaitDeleteFromCart(false);
                    setIsSuccessDeleteFromCart(true);
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
                localStorage.setItem("asfour-store-user-cart", JSON.stringify([]));
                let errorInDeleteFromCartTimeout = setTimeout(() => {
                    setErrorInDeleteFromCart("");
                    clearTimeout(errorInDeleteFromCartTimeout);
                }, 3000);
            }
        }
    }

    return (
        <div className="product-card">
            <div
                className="product-managment-box"
            >
                {product.discount != 0 && <div className="sale-box text-white p-2 text-center bg-danger">{t("Discount")} ( { ( product.discount / product.price * 100 ).toFixed(2) } % )</div>}
                <img src={`${process.env.BASE_API_URL}/${product.imagePath}`} alt="Product Image" />
                <Link className={`product-overlay ${(isWaitAddProductToFavoriteUserProductsList || isSuccessAddProductToFavoriteUserProductsList) ? "displaying" : ""}`} href={`/product-details/${product._id}`}></Link>
                <div className="product-managment-buttons p-2">
                    <PiShareFatLight
                        className="product-managment-icon d-block mb-2"
                        onClick={() => setIsDisplayShareOptionsBox(true)}
                    />
                    {
                        !isWaitAddProductToFavoriteUserProductsList &&
                        !isWaitDeleteProductToFavoriteUserProductsList &&
                        !isSuccessAddProductToFavoriteUserProductsList &&
                        !isSuccessDeleteProductToFavoriteUserProductsList &&
                        <>
                            {isFavoriteProductForUser ? <BsFillSuitHeartFill
                                className="product-managment-icon"
                                onClick={() => deleteProductFromFavoriteUserProducts(product._id)}
                            /> :
                                <BsSuitHeart
                                    className="product-managment-icon"
                                    onClick={() => addProductToFavoriteUserProducts(product._id)}
                                />}
                        </>}
                    {(isWaitAddProductToFavoriteUserProductsList || isWaitDeleteProductToFavoriteUserProductsList) && <BsClock className="product-managment-icon" />}
                    {(isSuccessAddProductToFavoriteUserProductsList || isSuccessDeleteProductToFavoriteUserProductsList) && <FaCheck className="product-managment-icon" />}
                </div>
                <div className={`add-to-cart-button-box ${(isWaitAddToCart || isSuccessAddToCart) ? "displaying" : ""}`}>
                    {!isWaitAddToCart && !isWaitDeleteFromCart && !isSuccessAddToCart && !isSuccessDeleteFromCart && !isExistProductInsideTheCart && !errorInAddToCart && !errorInDeleteFromCart && <button className="add-to-cart-btn cart-btn p-2" onClick={() => addToCart(product._id, product.name, product.price, product.description, product.category, product.discount, product.imagePath)}>{t("Add To Cart")} <FaCartPlus /> </button>}
                    {isWaitAddToCart && <button className="wait-to-cart-btn cart-btn p-2">{t("Waiting In Add To Cart")} ...</button>}
                    {errorInAddToCart && <button className="error-to-cart-btn cart-btn p-2 bg-danger text-white">{errorInAddToCart}</button>}
                    {isSuccessAddToCart && <Link href="/cart" className="success-in-add-to-cart-btn cart-btn p-2 btn btn-success text-white">
                        <FaCheck className={`${i18n.language !== "ar" ? "me-2" : "ms-3"}`} />
                        <span>{t("Click To Go To Cart Page")}</span>
                    </Link>}
                    {!isWaitAddToCart && !isWaitDeleteFromCart && !isSuccessAddToCart && !isSuccessDeleteFromCart && isExistProductInsideTheCart && !errorInAddToCart && !errorInDeleteFromCart && <button className="delete-from-cart-btn cart-btn p-2 bg-danger text-white" onClick={() => deleteFromCart(product._id)}>{t("Delete From Cart")} <MdDeleteForever /></button>}
                    {isWaitDeleteFromCart && <button className="wait-to-cart-btn cart-btn p-2 bg-danger text-white">{t("Waiting To Delete From Cart")} ...</button>}
                    {errorInDeleteFromCart && <button className="error-to-cart-btn cart-btn p-2 bg-danger text-white" disabled>{errorInDeleteFromCart}</button>}
                    {isSuccessDeleteFromCart && <Link href="/cart" className="success-in-delete-from-cart-btn cart-btn p-2 btn btn-success text-white">
                        <FaCheck className={`${i18n.language !== "ar" ? "me-2" : "ms-3"}`} />
                        <span>{t("Click To Go To Cart Page")}</span>
                    </Link>}
                </div>
            </div>
            <div className="product-details p-3 text-center">
                <h4 className="product-name fw-bold">{product.name}</h4>
                <h5 className="product-category">{product.category}</h5>
                <h5 className={`product-price ${product.discount != 0 ? "text-decoration-line-through" : ""}`}>{(product.price * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h5>
                {product.discount != 0 && <h4 className="product-price-after-discount m-0">{((product.price - product.discount) * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h4>}
            </div>
        </div>
    );
}