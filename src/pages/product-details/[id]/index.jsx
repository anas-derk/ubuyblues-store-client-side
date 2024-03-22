import Head from "next/head";
import Header from "@/components/Header";
import Link from "next/link";
import { BsSuitHeart } from "react-icons/bs";
import Footer from "@/components/Footer";
import { Fragment, useEffect, useRef, useState } from "react";
import axios from "axios";
import { RiArrowUpDoubleFill, RiArrowDownDoubleFill } from "react-icons/ri";
import { useRouter } from "next/router";
import { HiMinus, HiPlus } from "react-icons/hi";
import { FaRegStar } from "react-icons/fa";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import Slider from "react-slick";
import validations from "../../../../public/global_functions/validations";
import prices from "../../../../public/global_functions/prices";
import { useTranslation } from "react-i18next";
import NotFoundError from "@/components/NotFoundError";

export default function ProductDetails({ countryAsProperty, productIdAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [token, setToken] = useState("");

    const [country, setCountry] = useState(countryAsProperty);

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [isGetUserInfo, setIsGetUserInfo] = useState(true);

    const [isGetProductInfo, setIsGetProductInfo] = useState(true);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [userInfo, setUserInfo] = useState({});

    const [productInfo, setProductInfo] = useState("");

    const [favoriteProductsListForUser, setFavoriteProductsListForUser] = useState([]);

    const [isWaitAddToCart, setIsWaitAddToCart] = useState(false);

    const [isSuccessAddToCart, setIsSuccessAddToCart] = useState(false);

    const [errorInAddToCart, setErrorInAddToCart] = useState("");

    const [isWaitAddProductToFavoriteUserProductsList, setIsWaitAddProductToFavoriteUserProductsList] = useState(false);

    const [isWaitDeleteProductToFavoriteUserProductsList, setIsWaitDeleteProductToFavoriteUserProductsList] = useState(false);

    const [isSuccessAddProductToFavoriteUserProductsList, setIsSuccessAddProductToFavoriteUserProductsList] = useState(false);

    const [errorInAddProductToFavoriteUserProductsList, setErrorAddProductToFavoriteUserProductsList] = useState("");

    const [appearedNavigateIcon, setAppearedNavigateIcon] = useState("down");

    const [productQuantity, setProductQuantity] = useState(1);

    const [productGalleryImageIndex, setProductGalleryImageIndex] = useState(-1);

    const [appearedProductDetailsBoxName, setAppearedProductDetailsBoxName] = useState("description");

    const [isDisplayShareOptionsBox, setIsDisplayShareOptionsBox] = useState(false);

    const { t } = useTranslation();

    const router = useRouter();

    const sliderRef = useRef();

    useEffect(() => {
        setIsLoadingPage(true);
        setCountry(countryAsProperty);
        prices.getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(prices.getCurrencyNameByCountry(countryAsProperty));
            if (!isGetUserInfo && !isGetProductInfo) {
                setIsLoadingPage(false);
            }
        })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
    }, [countryAsProperty]);

    useEffect(() => {
        window.onscroll = function () { handleScrollToUpAndDown(this) };
        setWindowInnerWidth(window.innerWidth);
        window.addEventListener("resize", function () {
            setWindowInnerWidth(this.innerWidth);
        });
        const userToken = localStorage.getItem("asfour-store-user-token");
        if (userToken) {
            setToken(userToken);
            validations.getUserInfo(userToken)
                .then((result) => {
                    if (!result.error) {
                        setUserInfo(result.data);
                        setFavoriteProductsListForUser(result.data.favorite_products_list);
                        setIsGetUserInfo(false);
                    }
                })
                .catch((err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem("asfour-store-user-token");
                    } else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else setIsGetUserInfo(false);
        getProductInfo(productIdAsProperty)
            .then((res) => {
                console.log(res.data);
                setProductInfo(res.data);
                setIsGetProductInfo(false);
            })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            })
    }, []);

    useEffect(() => {
        if (!isGetUserInfo && !isGetProductInfo) {
            setIsLoadingPage(false);
        }
    }, [isGetUserInfo, isGetProductInfo]);

    const getProductInfo = async (productId) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/products/product-info/${productId}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const handleScrollToUpAndDown = (window) => {
        if (window.scrollY > 500) {
            setAppearedNavigateIcon("up");
        } else {
            setAppearedNavigateIcon("down");
        }
    }

    const navigateToUpOrDown = (navigateOrientation) => {
        if (navigateOrientation === "up") {
            window.scrollTo({
                behavior: "smooth",
                top: 0,
                left: 0,
            });
        } else if (navigateOrientation === "down") {
            window.scrollTo({
                behavior: "smooth",
                top: document.querySelector("footer").offsetTop,
                left: 0,
            });
        }
    }

    const isFavoriteProductForUser = (favorite_products_list, productId) => {
        for (let i = 0; i < favorite_products_list.length; i++) {
            if (favorite_products_list[i]._id === productId) return true;
        }
        return false;
    }

    const addProductToFavoriteUserProducts = async (productId) => {
        try {
            setIsWaitAddProductToFavoriteUserProductsList(true);
            const res = await axios.post(`${process.env.BASE_API_URL}/users/add-favorite-product?productId=${productId}`, undefined, {
                headers: {
                    Authorization: token,
                }
            });
            const result = await res.data;
            if (!result.error) {
                let tempFavoriteProductsForUser = favoriteProductsListForUser;
                tempFavoriteProductsForUser.push(productInfo);
                setFavoriteProductsListForUser(tempFavoriteProductsForUser);
                setIsWaitAddProductToFavoriteUserProductsList(false);
                setIsSuccessAddProductToFavoriteUserProductsList(true);
                let successAddToCartTimeout = setTimeout(() => {
                    setIsSuccessAddProductToFavoriteUserProductsList(false);
                    clearTimeout(successAddToCartTimeout);
                }, 3000);
            }
        }
        catch (err) {
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
            const res = await axios.delete(`${process.env.BASE_API_URL}/users/favorite-product?productId=${productId}`);
            const result = await res.data;
            if (result.msg === "Ok !!, Deleting Favorite Product From This User Is Successfuly !!") {
                setFavoriteProductsListForUser(result.newFavoriteProductsList);
                setIsWaitDeleteProductToFavoriteUserProductsList(false);
                setIsSuccessDeleteProductToFavoriteUserProductsList(true);
                let successDeleteToCartTimeout = setTimeout(() => {
                    setIsSuccessDeleteProductToFavoriteUserProductsList(false);
                    clearTimeout(successDeleteToCartTimeout);
                }, 3000);
            }
        }
        catch (err) {
            setIsWaitDeleteProductToFavoriteUserProductsList(false);
        }
    }

    const addToCart = (id, name, price, description, category, discount, imagePath) => {
        setIsWaitAddToCart(true);
        let allProductsData = JSON.parse(localStorage.getItem("asfour-store-user-cart"));
        if (allProductsData) {
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
                clearTimeout(successAddToCartTimeout);
            }, 1500);
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
                clearTimeout(successAddToCartTimeout);
            }, 1500);
        }
    }

    const getRatingStars = () => {
        let starsIconsArray = [
            <FaRegStar className="me-2 star-icon" />,
            <FaRegStar className="me-2 star-icon" />,
            <FaRegStar className="me-2 star-icon" />,
            <FaRegStar className="me-2 star-icon" />,
            <FaRegStar />
        ];
        return (
            <div className="rating-box mb-4">
                <span className="me-3">Your rating *</span>
                {starsIconsArray.map((starIcon, starIndex) => <Fragment key={starIndex}>
                    {starIcon}
                </Fragment>)}
            </div>
        );
    }

    const goToSlide = (slideIndex) => {
        sliderRef.current.slickGoTo(slideIndex);
    }

    const getAppearedSlidesCount = (windowInnerWidth, count) => {
        if (windowInnerWidth < 420) return 2;
        if (windowInnerWidth > 420 && windowInnerWidth < 576 ) return 3;
        if (windowInnerWidth >= 576) return 4;
        return count;
    }

    return (
        <div className="product-details page">
            <Head>
                <title>Ubuyblues Store - Product Details</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="navigate-to-up-button">
                    {appearedNavigateIcon === "up" && <RiArrowUpDoubleFill className="arrow-up arrow-icon" onClick={() => navigateToUpOrDown("up")} />}
                    {appearedNavigateIcon === "down" && <RiArrowDownDoubleFill className="arrow-down arrow-icon" onClick={() => navigateToUpOrDown("down")} />}
                </div>
                <div className="page-content">
                    <div className="container-fluid">
                        {Object.keys(productInfo).length > 0 ?
                            <section className={`product-details-box ${windowInnerWidth < 991 ? "p-3" : ""}`}>
                                <h1 className="section-name text-center mb-4 text-white pb-3">{t("Product Details")}</h1>
                                <div className="row mb-3 justify-content-center align-items-center">
                                    <div className="col-lg-6">
                                        <div className="product-images-box mb-4">
                                            <div className="main-product-image-box mb-5 mx-auto">
                                                <Slider
                                                    dots={false}
                                                    infinite={true}
                                                    speed={500}
                                                    slidesToShow={1}
                                                    slidesToScroll={1}
                                                    ref={sliderRef}
                                                    afterChange={(slideIndex) => setProductGalleryImageIndex(slideIndex - 1)}
                                                >
                                                    <div>
                                                        <img
                                                            src={`${process.env.BASE_API_URL}/${productInfo.imagePath}`}
                                                            alt="product image !!"
                                                            className="w-100 h-100 product-image"
                                                        />
                                                    </div>
                                                    {productInfo.galleryImagesPaths.map((path, pathIndex) => (
                                                        <div key={pathIndex}>
                                                            <img
                                                                src={`${process.env.BASE_API_URL}/${path}`}
                                                                alt="product image !!"
                                                                className="w-100 h-100 product-image"
                                                            />
                                                        </div>
                                                    ))}
                                                </Slider>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="product-price-and-quantity me-3 mb-4 border-bottom border-2">
                                            <h2 className="product-name fw-bold mb-4">{productInfo.name}</h2>
                                            <h5 className="product-category-name mb-4">
                                                <span className="fw-bold">Category: </span>
                                                <span>{productInfo.category}</span>
                                            </h5>
                                            <h5 className={`product-price ${productInfo.discount != 0 ? "text-decoration-line-through" : "mb-4"}`}>{(productInfo.price * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h5>
                                            {productInfo.discount != 0 && <h4 className="product-after-discount mb-4">{((productInfo.price - productInfo.discount) * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h4>}
                                            <h5 className="product-quantity">1 Product Available In Store</h5>
                                        </div>
                                        <div className="add-to-wish-list-or-cart text-center me-3 border-bottom border-2 mb-3">
                                            {userInfo && isFavoriteProductForUser(favoriteProductsListForUser, productInfo._id) ? <BsFillSuitHeartFill
                                                className="product-managment-icon mb-3"
                                                onClick={() => deleteProductFromFavoriteUserProducts(productInfo._id)}
                                            /> : <BsSuitHeart
                                                className="product-managment-icon mb-3"
                                                onClick={() => addProductToFavoriteUserProducts(productInfo._id)}
                                            />}
                                            <div className={`add-to-cart row align-items-center mb-4 ${windowInnerWidth > 767 ? "me-3" : ""}`}>
                                                <div className="add-to-cart-managment-btns-box col-md-8">
                                                    {!isWaitAddToCart && !errorInAddToCart && !isSuccessAddToCart && <button className="add-to-cart-btn p-2 d-block w-100" onClick={() => addToCart(productInfo._id, productInfo.name, productInfo.price, productInfo.description, productInfo.category, productInfo.discount, productInfo.imagePath)}>Add To Cart</button>}
                                                    {isWaitAddToCart && <button className="wait-to-cart-btn p-2 d-block w-100" disabled>Waiting In Add To Cart ...</button>}
                                                    {errorInAddToCart && <button className="error-to-cart-btn p-2 d-block w-100" disabled>Sorry, Something Went Wrong !!</button>}
                                                    {isSuccessAddToCart && <Link href="/cart" className="success-to-cart-btn p-2 btn btn-success d-block w-100" disabled>Display Your Cart</Link>}
                                                </div>
                                                <div className="select-product-quantity-box p-3 col-md-4">
                                                    <HiMinus className="select-product-quantity-icon"
                                                        onClick={() => setProductQuantity((previousProductQuantity) => previousProductQuantity - 1)}
                                                    />
                                                    <span className="ms-3 me-3">{productQuantity}</span>
                                                    <HiPlus className="select-product-quantity-icon"
                                                        onClick={() => setProductQuantity((previousProductQuantity) => previousProductQuantity + 1)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="all-product-images">
                                            <Slider
                                                arrows={false}
                                                infinite={false}
                                                speed={500}
                                                slidesToShow={getAppearedSlidesCount(windowInnerWidth, productInfo.galleryImagesPaths.length + 1)}
                                                slidesToScroll={getAppearedSlidesCount(windowInnerWidth, productInfo.galleryImagesPaths.length + 1)}
                                            >
                                                <div
                                                    className="product-image-box"
                                                    onClick={() => { setProductGalleryImageIndex(-1); goToSlide(0); }}
                                                >
                                                    <img
                                                        src={`${process.env.BASE_API_URL}/${productInfo.imagePath}`}
                                                        className={`product-gallery-image ${productGalleryImageIndex === -1 ? "selection" : ""}`}
                                                    />
                                                </div>
                                                {productInfo.galleryImagesPaths.map((path, pathIndex) => (
                                                    <div
                                                        key={pathIndex}
                                                        onClick={() => { setProductGalleryImageIndex(pathIndex); goToSlide(pathIndex + 1); }}
                                                    >
                                                        <div className="gallery-image-box" onClick={() => setProductGalleryImageIndex(pathIndex)}>
                                                            <img
                                                                src={`${process.env.BASE_API_URL}/${path}`}
                                                                alt="product image !!"
                                                                className={`${productGalleryImageIndex === pathIndex ? "selection" : ""}`}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </Slider>
                                        </div>
                                    </div>
                                    <div className="col-lg-6"></div>
                                </div>
                                <div className={`product-description-and-referrals border-top border-2 mb-4 ${windowInnerWidth > 767 ? "" : "pb-3"}`}>
                                    <div className="row justify-content-center">
                                        <div className="col-lg-6 text-center">
                                            <h6 className={`p-2 ${appearedProductDetailsBoxName === "description" ? "selected" : ""}`} onClick={() => setAppearedProductDetailsBoxName("description")}>Description</h6>
                                        </div>
                                        <div className="col-lg-6 text-center">
                                            <h6 className={`p-2 ${appearedProductDetailsBoxName === "referrals" ? "selected" : ""}`} onClick={() => setAppearedProductDetailsBoxName("referrals")}>Referrals (0)</h6>
                                        </div>
                                    </div>
                                </div>
                                {appearedProductDetailsBoxName === "description" && <div className="product-description mb-4 border-bottom border-2">
                                    <h6 className="mb-3 fw-bold">Description</h6>
                                    <p className="description-content">{productInfo.description}</p>
                                </div>}
                                {appearedProductDetailsBoxName === "referrals" && <div className="product-referrals mb-4 border-bottom border-2">
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <h6 className="mb-4 fw-bold">Referrals</h6>
                                            <h6 className="mb-4">There are no reviews yet !!</h6>
                                        </div>
                                        <div className="col-lg-6">
                                            <h6 className="mb-4">Be the first to review "{productInfo.name}"</h6>
                                            <h6 className="mb-4 note">your e-mail address will not be published. Required fields are marked *</h6>
                                            {getRatingStars()}
                                            <form className="referral-form mb-4">
                                                <textarea
                                                    className="p-2 mb-4"
                                                    placeholder="Your Referral *"
                                                ></textarea>
                                                <div className="row mb-4 name-and-email-box">
                                                    <div className="col-md-6">
                                                        <input
                                                            type="text"
                                                            className="p-2"
                                                            placeholder="Name *"
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <input
                                                            type="text"
                                                            className="p-2"
                                                            placeholder="Email *"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="save-your-details-box mb-3 row">
                                                    <div className="col-md-1">
                                                        <input
                                                            type="checkbox"
                                                            className=""
                                                            id="save-your-details-checkbox"
                                                        />
                                                    </div>
                                                    <div className="col-md-11">
                                                        <label htmlFor="save-your-details-checkbox">Save my name, email, and website in this browser for the next time I comment.</label>
                                                    </div>
                                                </div>
                                                <button
                                                    className="send-referral-btn p-2 d-block w-100"
                                                    type="submit"
                                                    onClick={() => addToCart(product._id, product.name, product.price, product.description, product.category, product.discount, product.imagePath)}
                                                >
                                                    Send
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>}
                                <div className="related-products-box">
                                    <h5 className="mb-4 fw-bold">Related Products</h5>
                                </div>
                            </section> : <NotFoundError errorMsg={t("Sorry, This Product Is Not Exist !!")} />}
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div >
    );
}

export async function getServerSideProps({ query, params }) {
    if (!params.id) {
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
    const allowedCountries = ["kuwait", "germany", "turkey"];
    if (query.country) {
        if (!allowedCountries.includes(query.country)) {
            return {
                redirect: {
                    permanent: false,
                    destination: `/product-details/${params.id}`,
                },
                props: {
                    countryAsProperty: "kuwait",
                    productIdAsProperty: params.id,
                },
            }
        }
        if (Object.keys(query).filter((key) => key !== "country").length > 1) {
            return {
                redirect: {
                    permanent: false,
                    destination: `/product-details/${params.id}?country=${query.country}`,
                },
                props: {
                    countryAsProperty: query.country,
                    productIdAsProperty: params.id,
                },
            }
        }
        return {
            props: {
                countryAsProperty: query.country,
                productIdAsProperty: params.id,
            },
        }
    }
    return {
        props: {
            countryAsProperty: "kuwait",
            productIdAsProperty: params.id,
        },
    }
}