import Head from "next/head";
import Header from "@/components/Header";
import Link from "next/link";
import { BsClock, BsFillSuitHeartFill, BsSuitHeart } from "react-icons/bs";
import Footer from "@/components/Footer";
import { Fragment, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { HiMinus, HiPlus } from "react-icons/hi";
import { FaRegStar } from "react-icons/fa";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import Slider from "react-slick";
import { useTranslation } from "react-i18next";
import NotFoundError from "@/components/NotFoundError";
import { HiOutlineBellAlert } from "react-icons/hi2";
import PaginationBar from "@/components/PaginationBar";
import { PiShareFatLight } from "react-icons/pi";
import ShareOptionsBox from "@/components/ShareOptionsBox";
import ProductCard from "@/components/ProductCard";
import { getCurrencyNameByCountry, getUSDPriceAgainstCurrency } from "../../../../public/global_functions/prices";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { isExistOfferOnProduct, isExistProductInsideTheCart, getFavoriteProductsByProductsIdsAndUserId, getUserInfo, isFavoriteProductForUser } from "../../../../public/global_functions/popular";
import NavigateToUpOrDown from "@/components/NavigateToUpOrDown";

export default function ProductDetails({ countryAsProperty, productIdAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [isGetUserInfo, setIsGetUserInfo] = useState(true);

    const [isGetProductInfo, setIsGetProductInfo] = useState(true);

    const [isGetProductReferals, setIsGetProductReferals] = useState(true);

    const [isGetSampleFromRelatedProductsInProduct, setIsGetSampleFromRelatedProductsInProduct] = useState(true);

    const [allProductReferalsCount, setAllProductReferalsCount] = useState(0);

    const [allProductReferalsInsideThePage, setAllProductReferalsInsideThePage] = useState([]);

    const [sampleFromRelatedProductsInProduct, setSampleFromRelatedProductsInProduct] = useState([]);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [userInfo, setUserInfo] = useState({});

    const [productInfo, setProductInfo] = useState("");

    const [currentDate, setCurrentDate] = useState("");

    const [isDisplayShareOptionsBox, setIsDisplayShareOptionsBox] = useState(false);

    const [favoriteProductsListForUser, setFavoriteProductsListForUser] = useState([]);

    const [isWaitAddToCart, setIsWaitAddToCart] = useState(false);

    const [isSuccessAddToCart, setIsSuccessAddToCart] = useState(false);

    const [errorInAddToCart, setErrorInAddToCart] = useState("");

    const [isWaitAddProductToFavoriteUserProductsList, setIsWaitAddProductToFavoriteUserProductsList] = useState(false);

    const [isWaitDeleteProductToFavoriteUserProductsList, setIsWaitDeleteProductToFavoriteUserProductsList] = useState(false);

    const [isSuccessAddProductToFavoriteUserProductsList, setIsSuccessAddProductToFavoriteUserProductsList] = useState(false);

    const [isSuccessDeleteProductToFavoriteUserProductsList, setIsSuccessDeleteProductToFavoriteUserProductsList] = useState(false);

    const [errorInAddProductToFavoriteUserProductsList, setErrorAddProductToFavoriteUserProductsList] = useState("");

    const [productQuantity, setProductQuantity] = useState(1);

    const [productGalleryImageIndex, setProductGalleryImageIndex] = useState(-1);

    const [appearedProductDetailsBoxName, setAppearedProductDetailsBoxName] = useState("description");

    const [referalDetails, setReferalDetails] = useState({
        name: "",
        email: "",
        content: "",
        productId: "",
    });

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [waitAddNewReferalMsg, setWaitAddNewReferalMsg] = useState("");

    const [successAddNewReferalMsg, setSuccessAddNewReferalMsg] = useState("");

    const [errorAddNewReferalMsg, setErrorAddNewReferalMsg] = useState("");

    const [isSaveReferalWriterInfo, setIsSaveReferalWriterInfo] = useState(false);

    const [sharingName, setSharingName] = useState("");

    const [sharingURL, setSharingURL] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        customerName: "",
    });

    const pageSize = 3;

    const { i18n, t } = useTranslation();

    const router = useRouter();

    const sliderRef = useRef();

    useEffect(() => {
        setIsLoadingPage(true);
        getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(getCurrencyNameByCountry(countryAsProperty));
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
        setWindowInnerWidth(window.innerWidth);
        window.addEventListener("resize", function () {
            setWindowInnerWidth(this.innerWidth);
        });
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        if (userToken) {
            getUserInfo()
                .then((result) => {
                    if (!result.error) {
                        setUserInfo(result.data);
                        setIsGetUserInfo(false);
                    }
                })
                .catch((err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                        setIsGetUserInfo(false);
                    } else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else setIsGetUserInfo(false);
        getProductInfo(productIdAsProperty)
            .then((res) => {
                let result = res.data;
                setIsGetProductInfo(false);
                if (Object.keys(result).length > 0) {
                    setProductInfo(result.productDetails);
                    setCurrentDate(result.currentDate);
                    getProductReferalsCount(productIdAsProperty)
                        .then(async (result) => {
                            setAllProductReferalsCount(result.data);
                            if (result.data > 0) {
                                setAllProductReferalsInsideThePage((await getAllProductReferalsInsideThePage(productIdAsProperty, 1, pageSize)).data);
                                setTotalPagesCount(Math.ceil(result.data / pageSize));
                            }
                            const referalWriterInfo = JSON.parse(localStorage.getItem("asfour-store-referal-writer-info"));
                            if (referalWriterInfo) {
                                setReferalDetails({ ...referalDetails, name: referalWriterInfo.name, email: referalWriterInfo.email, productId: productIdAsProperty });
                                setIsSaveReferalWriterInfo(true);
                            } else {
                                setReferalDetails({ ...referalDetails, productId: productIdAsProperty });
                            }
                            setIsGetProductReferals(false);
                        })
                        .catch(() => {
                            setIsLoadingPage(false);
                            setIsErrorMsgOnLoadingThePage(true);
                        });
                    getSampleFromRelatedProductsInProduct(productIdAsProperty)
                        .then(async (result) => {
                            const relatedProducts = result.data;
                            setSampleFromRelatedProductsInProduct(relatedProducts);
                            if (userToken) {
                                setFavoriteProductsListForUser((await getFavoriteProductsByProductsIdsAndUserId(userToken, [productIdAsProperty, ...relatedProducts.map((product) => product._id)])).data)
                            }
                            setIsGetSampleFromRelatedProductsInProduct(false);
                        })
                        .catch(() => {
                            setIsLoadingPage(false);
                            setIsErrorMsgOnLoadingThePage(true);
                        });
                } else {
                    setIsGetProductReferals(false);
                    setIsGetSampleFromRelatedProductsInProduct(false);
                }
            })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
    }, []);

    useEffect(() => {
        if (!isGetUserInfo && !isGetProductInfo && !isGetProductReferals && !isGetSampleFromRelatedProductsInProduct) {
            setIsLoadingPage(false);
        }
    }, [isGetUserInfo, isGetProductInfo, isGetProductReferals, isGetSampleFromRelatedProductsInProduct]);

    const getProductInfo = async (productId) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/products/product-info/${productId}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getSampleFromRelatedProductsInProduct = async (productId) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/products/sample-from-related-products-in-the-product/${productId}`)
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const addProductToFavoriteUserProducts = async (productId) => {
        try {
            setIsWaitAddProductToFavoriteUserProductsList(true);
            const res = await axios.post(`${process.env.BASE_API_URL}/favorite-products/add-new-favorite-product/${productId}`, undefined, {
                headers: {
                    Authorization: localStorage.getItem(process.env.userTokenNameInLocalStorage),
                }
            });
            const result = res.data;
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
            const res = await axios.delete(`${process.env.BASE_API_URL}/favorite-products/${productId}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.userTokenNameInLocalStorage),
                }
            });
            const result = res.data;
            if (!result.error) {
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

    const addToCart = (productId) => {
        try {
            setIsWaitAddToCart(true);
            const userCart = JSON.parse(localStorage.getItem("asfour-store-customer-cart"));
            if (Array.isArray(userCart)) {
                if (userCart.length > 0) {
                    const productIndex = userCart.findIndex((product) => product._id === productId);
                    if (productIndex === -1) {
                        userCart.push({
                            _id: productId,
                            quantity: 1,
                        });
                        localStorage.setItem("asfour-store-customer-cart", JSON.stringify(userCart));
                        setIsWaitAddToCart(false);
                        setIsSuccessAddToCart(true);
                        let successAddToCartTimeout = setTimeout(() => {
                            setIsSuccessAddToCart(false);
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
                    localStorage.setItem("asfour-store-customer-cart", JSON.stringify(allProductsData));
                    setIsWaitAddToCart(false);
                    setIsSuccessAddToCart(true);
                    let successAddToCartTimeout = setTimeout(() => {
                        setIsSuccessAddToCart(false);
                        clearTimeout(successAddToCartTimeout);
                    }, 3000);
                }
            } else {
                let allProductsData = [];
                allProductsData.push({
                    _id: productId,
                    quantity: 1,
                });
                localStorage.setItem("asfour-store-customer-cart", JSON.stringify(allProductsData));
                setIsWaitAddToCart(false);
                setIsSuccessAddToCart(true);
                let successAddToCartTimeout = setTimeout(() => {
                    setIsSuccessAddToCart(false);
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
                <span className="me-3">{t("Your rating")} *</span>
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
        if (windowInnerWidth > 420 && windowInnerWidth < 576) return 3;
        if (windowInnerWidth >= 576) return 4;
        return count;
    }

    const addNewReferal = async (e) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "name",
                    value: referalDetails.name,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "email",
                    value: referalDetails.email,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isEmail: {
                            msg: "Sorry, Invalid Email !!",
                        },
                    },
                },
                {
                    name: "content",
                    value: referalDetails.content,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                if (isSaveReferalWriterInfo) {
                    localStorage.setItem("asfour-store-referal-writer-info", JSON.stringify({
                        name: referalDetails.name,
                        email: referalDetails.email,
                    }));
                } else {
                    localStorage.removeItem("asfour-store-referal-writer-info");
                }
                setWaitAddNewReferalMsg("Please Wait ...");
                const res = await axios.post(`${process.env.BASE_API_URL}/referals/add-new-referal`, referalDetails);
                const result = res.data;
                setWaitAddNewReferalMsg("");
                if (!result.error) {
                    setSuccessAddNewReferalMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessAddNewReferalMsg("");
                        clearTimeout(successTimeout);
                    }, 2000);
                } else {
                    setErrorAddNewReferalMsg(result.msg);
                    let errorTimeout = setTimeout(() => {
                        setErrorAddNewReferalMsg("");
                        clearTimeout(errorTimeout);
                    }, 2000);
                }
            }
        }
        catch (err) {
            setWaitAddNewReferalMsg("");
            setErrorAddNewReferalMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorAddNewReferalMsg("");
                clearTimeout(errorTimeout);
            }, 2000);
        }
    }

    const getProductReferalsCount = async (productId, filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/referals/product-referals-count/${productId}?${filters ? filters : ""}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllProductReferalsInsideThePage = async (productId, pageNumber, pageSize, filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/referals/all-product-referals-inside-the-page/${productId}?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getPreviousPage = async () => {
        setIsGetProductReferals(true);
        const newCurrentPage = currentPage - 1;
        setAllProductReferalsInsideThePage((await getAllProductReferalsInsideThePage(productIdAsProperty, newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsGetProductReferals(false);
    }

    const getNextPage = async () => {
        setIsGetProductReferals(true);
        const newCurrentPage = currentPage + 1;
        setAllProductReferalsInsideThePage((await getAllProductReferalsInsideThePage(productIdAsProperty, newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsGetProductReferals(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsGetProductReferals(true);
        setAllProductReferalsInsideThePage((await getAllProductReferalsInsideThePage(productIdAsProperty, pageNumber, pageSize, getFilteringString(filters))).data);
        setCurrentPage(pageNumber);
        setIsGetProductReferals(false);
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.customerId) filteringString += `customerId=${filters.customerId}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    return (
        <div className="product-details">
            <Head>
                <title>{t("Ubuyblues Store")} - {t("Product Details")}</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <NavigateToUpOrDown />
                {/* Start Share Options Box */}
                {isDisplayShareOptionsBox && <ShareOptionsBox
                    setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                    sharingName={sharingName}
                    sharingURL={sharingURL}
                />}
                {/* End Share Options Box */}
                <div className="page-content page">
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
                                                <span className="fw-bold">{t("Category")}: </span>
                                                <span>{productInfo.category}</span>
                                            </h5>
                                            <h5 className={`product-price ${productInfo.discount != 0 ? "text-decoration-line-through" : "mb-4"}`}>{(productInfo.price * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h5>
                                            {
                                                productInfo.discount > 0 &&
                                                !isExistOfferOnProduct(currentDate, productInfo.startDiscountPeriod, productInfo.endDiscountPeriod) &&
                                                <h4 className="product-price-after-discount mb-3">{((productInfo.price - productInfo.discount) * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h4>
                                            }
                                            {
                                                productInfo.discountInOfferPeriod > 0 &&
                                                isExistOfferOnProduct(currentDate, productInfo.startDiscountPeriod, productInfo.endDiscountPeriod) &&
                                                <h4 className="product-price-after-discount mb-3">{((productInfo.price - productInfo.discountInOfferPeriod) * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</h4>
                                            }
                                            <h5 className="product-quantity">1 {t("Product Available In Store")}</h5>
                                        </div>
                                        <div className="add-to-wish-list-or-cart text-center me-3 border-bottom border-2 mb-3">
                                            <div className="product-managment-buttons mb-3">
                                                <PiShareFatLight
                                                    className={`product-managment-icon ${i18n.language !== "ar" ? "me-3" : "ms-3"}`}
                                                    onClick={() => setIsDisplayShareOptionsBox(true)}
                                                />
                                                {Object.keys(userInfo).length > 0 && isFavoriteProductForUser(favoriteProductsListForUser, productInfo._id) ? <BsFillSuitHeartFill
                                                    className="product-managment-icon"
                                                    onClick={() => deleteProductFromFavoriteUserProducts(productInfo._id)}
                                                /> : <BsSuitHeart
                                                    className="product-managment-icon"
                                                    onClick={() => addProductToFavoriteUserProducts(productInfo._id)}
                                                />}
                                                {(isWaitAddProductToFavoriteUserProductsList || isWaitDeleteProductToFavoriteUserProductsList) && <BsClock className="product-managment-icon" />}
                                                {(isSuccessAddProductToFavoriteUserProductsList || isSuccessDeleteProductToFavoriteUserProductsList) && <FaCheck className="product-managment-icon" />}
                                            </div>
                                            <div className={`add-to-cart row align-items-center mb-4 ${i18n.language !== "ar" && windowInnerWidth > 767 && "me-2"} ${i18n.language === "ar" && windowInnerWidth > 767 && "ms-2"}`}>
                                                <div className="add-to-cart-managment-btns-box col-md-8">
                                                    {!isWaitAddToCart && !errorInAddToCart && !isSuccessAddToCart && <button className="add-to-cart-btn p-2 d-block w-100" onClick={() => addToCart(productInfo._id)}>{t("Add To Cart")}</button>}
                                                    {isWaitAddToCart && <button className="wait-to-cart-btn p-2 d-block w-100" disabled>{t("Waiting In Add To Cart ...")}</button>}
                                                    {errorInAddToCart && <button className="error-to-cart-btn p-2 d-block w-100" disabled>{t(errorInAddToCart)}</button>}
                                                    {isSuccessAddToCart && <Link href="/cart" className="success-to-cart-btn p-2 btn btn-success d-block w-100" disabled>{t("Display Your Cart")}</Link>}
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
                                            <h6 className={`p-2 ${appearedProductDetailsBoxName === "description" ? "selected" : ""}`} onClick={() => setAppearedProductDetailsBoxName("description")}>{t("Description")}</h6>
                                        </div>
                                        <div className="col-lg-6 text-center">
                                            <h6 className={`p-2 ${appearedProductDetailsBoxName === "referrals" ? "selected" : ""}`} onClick={() => setAppearedProductDetailsBoxName("referrals")}>{t("Referrals")} ({allProductReferalsCount})</h6>
                                        </div>
                                    </div>
                                </div>
                                {appearedProductDetailsBoxName === "description" && <div className="product-description mb-4 border-bottom border-2">
                                    <h6 className="mb-3 fw-bold">{t("Description")}</h6>
                                    <p className="description-content">{productInfo.description}</p>
                                </div>}
                                {appearedProductDetailsBoxName === "referrals" && <div className="product-referrals mb-4 border-bottom border-2">
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <h6 className="mb-2 fw-bold">{t("Referrals")}</h6>
                                            {allProductReferalsInsideThePage.length === 0 && !isGetProductReferals && <h6 className="mb-4">{t("There are no reviews yet")} !!</h6>}
                                            {isGetProductReferals && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                                                <span className="loader-table-data"></span>
                                            </div>}
                                            {allProductReferalsInsideThePage.length > 0 && <div className="referals">
                                                {allProductReferalsInsideThePage.map((referal, referalIndex) => (
                                                    <div className="referal-box" key={referal._id}>
                                                        <div className="referal-details pt-3 pb-3">
                                                            <h6 className="referal-number">{t("Referral")} #{referalIndex + 1}</h6>
                                                            <h6 className="referal-writer-name">{t("Name")}: {referal.name}</h6>
                                                            <h6 className="referal-writer-email mb-0">{t("Email")}: {referal.email}</h6>
                                                            <p className="referal-content mb-0">{referal.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>}
                                            {totalPagesCount > 1 &&
                                                <PaginationBar
                                                    totalPagesCount={totalPagesCount}
                                                    currentPage={currentPage}
                                                    getPreviousPage={getPreviousPage}
                                                    getNextPage={getNextPage}
                                                    getSpecificPage={getSpecificPage}
                                                    paginationButtonTextColor={"#FFF"}
                                                    paginationButtonBackgroundColor={"transparent"}
                                                    activePaginationButtonColor={"#000"}
                                                    activePaginationButtonBackgroundColor={"#FFF"}
                                                    isDisplayCurrentPageNumberAndCountOfPages={false}
                                                    isDisplayNavigateToSpecificPageForm={false}
                                                />
                                            }
                                        </div>
                                        <div className="col-lg-6">
                                            <h6 className="mb-4">{t("Be the first to review")} .</h6>
                                            <h6 className="mb-4 note">{t("your e-mail address will not be published. Required fields are marked")} *</h6>
                                            {getRatingStars()}
                                            <form className="referral-form mb-4" onSubmit={addNewReferal}>
                                                <textarea
                                                    className={`p-2 mb-3 ${formValidationErrors.name ? "border-3 border-danger" : ""}`}
                                                    placeholder={t("Your Referal") + " *"}
                                                    defaultValue={referalDetails.content}
                                                    onChange={(e) => setReferalDetails({ ...referalDetails, content: e.target.value.trim() })}
                                                ></textarea>
                                                {formValidationErrors.content && <p className="bg-danger p-2 form-field-error-box mb-4">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{t(formValidationErrors.content)}</span>
                                                </p>}
                                                <div className="row mb-4 name-and-email-box">
                                                    <div className="col-md-6">
                                                        <input
                                                            type="text"
                                                            className={`p-2 ${formValidationErrors.name ? "border-3 border-danger mb-3" : ""}`}
                                                            placeholder={t("Name") + " *"}
                                                            defaultValue={referalDetails.name}
                                                            onChange={(e) => setReferalDetails({ ...referalDetails, name: e.target.value.trim() })}
                                                        />
                                                        {formValidationErrors.name && <p className="bg-danger p-2 form-field-error-box m-0">
                                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                            <span>{t(formValidationErrors.name)}</span>
                                                        </p>}
                                                    </div>
                                                    <div className="col-md-6">
                                                        <input
                                                            type="text"
                                                            className={`p-2 ${formValidationErrors.email ? "border-3 border-danger mb-3" : ""}`}
                                                            placeholder={t("Email") + " *"}
                                                            defaultValue={referalDetails.email}
                                                            onChange={(e) => setReferalDetails({ ...referalDetails, email: e.target.value.trim() })}
                                                        />
                                                        {formValidationErrors.email && <p className="bg-danger p-2 form-field-error-box m-0">
                                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                            <span>{t(formValidationErrors.email)}</span>
                                                        </p>}
                                                    </div>
                                                </div>
                                                <div className="save-your-details-box mb-3 row">
                                                    <div className="col-md-1">
                                                        <div className="form-check mb-3">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                defaultChecked={isSaveReferalWriterInfo}
                                                                id="save-your-details-checkbox"
                                                                onChange={(e) => setIsSaveReferalWriterInfo(e.target.checked)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-11">
                                                        <label htmlFor="save-your-details-checkbox">{t("Save my name, email, and referal in this browser for the next time I comment")} .</label>
                                                    </div>
                                                </div>
                                                {!waitAddNewReferalMsg && !successAddNewReferalMsg && !errorAddNewReferalMsg && <button
                                                    className="private-btn p-2 d-block w-100 fw-bold"
                                                    type="submit"
                                                >
                                                    {t("Send")}
                                                </button>}
                                                {waitAddNewReferalMsg && <button
                                                    className="private-btn private-wait-btn p-2 d-block w-100 fw-bold"
                                                    disabled
                                                >
                                                    {waitAddNewReferalMsg}
                                                </button>}
                                                {successAddNewReferalMsg && <button
                                                    className="private-btn private-success-btn p-2 d-block w-100 fw-bold"
                                                    disabled
                                                >
                                                    {successAddNewReferalMsg}
                                                </button>}
                                                {errorAddNewReferalMsg && <button
                                                    className="private-btn private-error-btn p-2 d-block w-100 fw-bold"
                                                    disabled
                                                >
                                                    {errorAddNewReferalMsg}
                                                </button>}
                                            </form>
                                        </div>
                                    </div>
                                </div>}
                                <section className="related-products-box">
                                    <h2 className="text-center mb-4">{t("Related Products")}</h2>
                                    {sampleFromRelatedProductsInProduct.length > 0 ? <div className="row products-box section-data-box pt-4 pb-4">
                                        {sampleFromRelatedProductsInProduct.map((product) => (
                                            product._id !== productIdAsProperty && <div className="col-xs-12 col-lg-6 col-xl-4 text-dark" key={product._id}>
                                                <ProductCard
                                                    productDetails={product}
                                                    setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                                                    usdPriceAgainstCurrency={usdPriceAgainstCurrency}
                                                    currencyNameByCountry={currencyNameByCountry}
                                                    isFavoriteProductForUserAsProperty={isFavoriteProductForUser(favoriteProductsListForUser, product._id)}
                                                    isExistProductInsideTheCartAsProperty={isExistProductInsideTheCart(product._id)}
                                                    setSharingName={setSharingName}
                                                    setSharingURL={setSharingURL}
                                                    currentDateAsString={currentDate}
                                                    isFlashProductAsProperty={isExistOfferOnProduct(currentDate, product.startDiscountPeriod, product.endDiscountPeriod)}
                                                />
                                            </div>
                                        ))}
                                    </div> : <NotFoundError errorMsg={t("Sorry, There Is No Related Products In This Product !!")} />}
                                </section>
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