import Head from "next/head";
import Header from "@/components/Header";
import Link from "next/link";
import { BsFillCartPlusFill, BsFillSuitHeartFill, BsSuitHeart, BsFillPersonFill, BsPersonVcard } from "react-icons/bs";
import { FaShoppingCart } from "react-icons/fa";
import { BiSolidCategory, BiSearchAlt } from "react-icons/bi";
import { MdKeyboardArrowRight, MdOutlineMail } from "react-icons/md";
import { AiOutlineEye, AiOutlineHome } from "react-icons/ai";
import Footer from "@/components/Footer";
import { Fragment, useEffect, useRef, useState } from "react";
import axios from "axios";
import { RiArrowUpDoubleFill, RiArrowDownDoubleFill } from "react-icons/ri";
import { GrFormClose } from "react-icons/gr";
import { IoIosArrowForward } from "react-icons/io";
import { MdOutlineLogout } from "react-icons/md";
import { useRouter } from "next/router";
import { HiMinus, HiPlus } from "react-icons/hi";
import { FaRegStar } from "react-icons/fa";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import { BsArrowLeftSquare, BsArrowRightSquare } from "react-icons/bs";
import Slider from "react-slick";
import { PiShareFatLight } from "react-icons/pi";
import { WhatsappShareButton, WhatsappIcon, FacebookShareButton, FacebookIcon, FacebookMessengerShareButton, FacebookMessengerIcon, TelegramShareButton, TelegramIcon } from "react-share";
import { FaTimes, FaWhatsapp } from "react-icons/fa";
import { MdOutlineContactPhone } from "react-icons/md";
import { IoEarth } from "react-icons/io5";
import { useTranslation } from "react-i18next";

export default function Home() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [userId, setUserId] = useState("");

    const [userInfo, setUserInfo] = useState("");

    const [favoriteProductsListForUser, setFavoriteProductsListForUser] = useState([]);

    const [isGetProductsStatus, setIsGetProductsStatus] = useState(false);

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [allCategories, setAllCategories] = useState([]);

    const [productAddingId, setProductAddingId] = useState("");

    const [isWaitAddToCart, setIsWaitAddToCart] = useState(false);

    const [isSuccessAddToCart, setIsSuccessAddToCart] = useState(false);

    const [errorInAddToCart, setErrorInAddToCart] = useState("");

    const [favoriteProductAddingId, setFavoriteProductAddingId] = useState("");

    const [isWaitAddProductToFavoriteUserProductsList, setIsWaitAddProductToFavoriteUserProductsList] = useState(false);

    const [isSuccessAddProductToFavoriteUserProductsList, setIsSuccessAddProductToFavoriteUserProductsList] = useState(false);

    const [errorInAddProductToFavoriteUserProductsList, setErrorAddProductToFavoriteUserProductsList] = useState("");

    const [appearedNavigateIcon, setAppearedNavigateIcon] = useState("down");

    const [productIndex, setProductIndex] = useState(-1);

    const [productQuantity, setProductQuantity] = useState(1);

    const [productGalleryImageIndex, setProductGalleryImageIndex] = useState(-1);

    const [appearedProductDetailsBoxName, setAppearedProductDetailsBoxName] = useState("description");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [pageNumber, setPageNumber] = useState(0);

    const [isDisplayShareOptionsBox, setIsDisplayShareOptionsBox] = useState(false);

    const [appearedSections, setAppearedSections] = useState([]);

    const [allBrands, setAllBrands] = useState([]);

    const [isDisplayContactIcons, setIsDisplayContactIcons] = useState(false);

    const [isDisplayLanguagesList, setIsDisplayLanguagesList] = useState(false);

    const router = useRouter();

    const { i18n, t } = useTranslation();

    const sliderRef = useRef();

    const pageSize = 8;

    useEffect(() => {
        window.onscroll = function () { handleScrollToUpAndDown(this) };
        const userId = localStorage.getItem("asfour-store-user-id");
        setUserId(userId);
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
        getProductsCount()
            .then(async (result) => {
                if (result > 0) {
                    setAllProductsInsideThePage(await getAllProductsInsideThePage(1, pageSize));
                    setTotalPagesCount(Math.ceil(result / pageSize));
                    let res1 = await axios.get(`${process.env.BASE_API_URL}/categories/all-categories`);
                    setAllCategories(await res1.data);
                    if (userId) {
                        res1 = await axios.get(`${process.env.BASE_API_URL}/users/user-info/${userId}`);
                        const result2 = await res1.data;
                        setUserInfo(result2);
                        setFavoriteProductsListForUser(result2.favorite_products_list);
                    }
                    res1 = await axios.get(`${process.env.BASE_API_URL}/appeared-sections/all-sections`);
                    let result2 = await res1.data;
                    const appearedSectionsLength = result2.length;
                    setAppearedSections(appearedSectionsLength > 0 ? result2.map((appearedSection) => appearedSection.isAppeared ? appearedSection.sectionName : "") : []);
                    if (appearedSectionsLength > 0) {
                        for (let i = 0; i < appearedSectionsLength; i++) {
                            if (result2[i].sectionName === "brands" && result2[i].isAppeared) {
                                res1 = await axios.get(`${process.env.BASE_API_URL}/brands/all-brands`);
                                setAllBrands(await res1.data);
                            }
                        }
                    }
                    setWindowInnerWidth(window.innerWidth);
                    window.addEventListener("resize", function () {
                        setWindowInnerWidth(this.innerWidth);
                    });
                    setIsLoadingPage(false);
                }
            })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
    }, []);

    const handleChangeLanguage = (language) => {
        handleSelectUserLanguage(language);
        localStorage.setItem("asfour-store-language", language);
    }

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    const userLogout = () => {
        localStorage.removeItem("asfour-store-user-id");
        router.push("/auth");
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

    const addProductToFavoriteUserProducts = async (productIndex, userId) => {
        try {
            setIsWaitAddProductToFavoriteUserProductsList(true);
            setFavoriteProductAddingId(allProductsInsideThePage[productIndex]._id);
            const res = await axios.post(`${process.env.BASE_API_URL}/users/add-favorite-product?userId=${userId}&productId=${allProductsInsideThePage[productIndex]._id}`);
            const result = await res.data;
            if (result === "Ok !!, Adding New Favorite Product To This User Is Successfuly !!") {
                let tempFavoriteProductsForUser = favoriteProductsListForUser;
                tempFavoriteProductsForUser.push(allProductsInsideThePage[productIndex]);
                setFavoriteProductsListForUser(tempFavoriteProductsForUser);
                setIsWaitAddProductToFavoriteUserProductsList(false);
                setFavoriteProductAddingId("");
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    const deleteProductFromFavoriteUserProducts = async (productIndex, userId) => {
        try {
            setIsWaitAddProductToFavoriteUserProductsList(true);
            setFavoriteProductAddingId(allProductsInsideThePage[productIndex]._id);
            const res = await axios.delete(`${process.env.BASE_API_URL}/users/favorite-product?userId=${userId}&productId=${allProductsInsideThePage[productIndex]._id}`);
            const result = await res.data;
            if (result === "Ok !!, Deleting Favorite Product From This User Is Successfuly !!") {
                setFavoriteProductsListForUser(favoriteProductsListForUser.filter((favorite_product) => favorite_product._id != allProductsInsideThePage[productIndex]._id));
                setIsWaitAddProductToFavoriteUserProductsList(false);
                setFavoriteProductAddingId("");
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    const addToCart = (id, name, price, description, category, discount, imagePath) => {
        setProductAddingId(id);
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
        setProductAddingId("");
    }

    const getRatingStars = () => {
        let starsIconsArray = [
            <FaRegStar className="me-2 star-icon" />,
            <FaRegStar className="me-2 star-icon" />,
            <FaRegStar className="me-2 star-icon" />,
            <FaRegStar className="me-2 star-icon" />,
            <FaRegStar className="me-2" />
        ];
        return (
            <div className="rating-box mb-4">
                <span className={`${i18n.language !== "ar" ? "me-2" : "ms-2"}`}>{t("Your rating")} *</span>
                {starsIconsArray.map((starIcon, starIndex) => <Fragment key={starIndex}>
                    {starIcon}
                </Fragment>)}
            </div>
        );
    }

    const isItStillDiscountForProduct = (startDiscountPeriod, endDiscountPeriod) => {
        const dateAndTimeNow = new Date(Date.now());
        const startDiscountDateAndTime = new Date(startDiscountPeriod);
        if (dateAndTimeNow > startDiscountDateAndTime) {
            const endDiscountDateAndTime = new Date(endDiscountPeriod);
            return endDiscountDateAndTime - dateAndTimeNow > 0;
        }
        return false;
        // if (dateAndTimeNow)
        // console.log(new Date(startDiscountDateAndTime.getTime() - endDiscountDateAndTime.getTime()));
    }

    const getProductsCount = async () => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/products/products-count`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllProductsInsideThePage = async (pageNumber, pageSize) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/products/all-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getPreviousPage = async () => {
        setIsGetProductsStatus(true);
        const newCurrentPage = currentPage - 1;
        setAllProductsInsideThePage(await getAllProductsInsideThePage(newCurrentPage, pageSize));
        setCurrentPage(newCurrentPage);
        setIsGetProductsStatus(false);
    }

    const getNextPage = async () => {
        setIsGetProductsStatus(true);
        const newCurrentPage = currentPage + 1;
        setAllProductsInsideThePage(await getAllProductsInsideThePage(newCurrentPage, pageSize));
        setCurrentPage(newCurrentPage);
        setIsGetProductsStatus(false);
    }

    const paginationBar = () => {
        const paginationButtons = [];
        for (let i = 1; i <= totalPagesCount; i++) {
            if (i < 11) {
                paginationButtons.push(
                    <button
                        key={i}
                        className={`pagination-button me-3 p-2 ps-3 pe-3 ${currentPage === i ? "selection" : ""} ${i === 1 ? "ms-3" : ""}`}
                        onClick={async () => {
                            setIsGetProductsStatus(true);
                            setAllProductsInsideThePage(await getAllProductsInsideThePage(i, pageSize));
                            setCurrentPage(i);
                            setIsGetProductsStatus(false);
                        }}
                    >
                        {i}
                    </button>
                );
            }
        }
        if (totalPagesCount > 10) {
            paginationButtons.push(
                <span className="me-3 fw-bold" key={`${Math.random()}-${Date.now()}`}>...</span>
            );
            paginationButtons.push(
                <button
                    key={totalPagesCount}
                    className={`pagination-button me-3 p-2 ps-3 pe-3 ${currentPage === totalPagesCount ? "selection" : ""}`}
                    onClick={async () => {
                        setIsGetProductsStatus(true);
                        setAllProductsInsideThePage(await getAllProductsInsideThePage(pageNumber, pageSize));
                        setCurrentPage(pageNumber);
                        setIsGetProductsStatus(false);
                    }}
                >
                    {totalPagesCount}
                </button>
            );
        }
        return (
            <section className="pagination d-flex justify-content-center align-items-center">
                {currentPage !== 1 && <BsArrowLeftSquare
                    className="previous-page-icon pagination-icon"
                    onClick={getPreviousPage}
                />}
                {paginationButtons}
                {currentPage !== totalPagesCount && <BsArrowRightSquare
                    className="next-page-icon pagination-icon me-3"
                    onClick={getNextPage}
                />}
                <span className="current-page-number-and-count-of-pages p-2 ps-3 pe-3 bg-secondary text-white me-3">{t("The Page")} {currentPage} {t("of")} {totalPagesCount} {t("Pages")}</span>
            </section>
        );
    }

    const goToSlide = (slideIndex) => {
        sliderRef.current.slickGoTo(slideIndex);
    }

    return (
        <div className="home">
            <Head>
                <title>Ubuyblues Store - Home</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                aaaa
                <div className="navigate-to-up-button">
                    {appearedNavigateIcon === "up" && <RiArrowUpDoubleFill className="arrow-up arrow-icon" onClick={() => navigateToUpOrDown("up")} />}
                    {appearedNavigateIcon === "down" && <RiArrowDownDoubleFill className="arrow-down arrow-icon" onClick={() => navigateToUpOrDown("down")} />}
                </div>
                {/* Start Share Options Box */}
                {isDisplayShareOptionsBox && <div className="share-options-box">
                    <div className="share-icons-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                        <GrFormClose className="close-share-options-box-icon" onClick={() => setIsDisplayShareOptionsBox(false)} />
                        <h2 className="mb-3 pb-3 border-bottom border-white">{t("Share Your Favorite Product With Your Friends")}</h2>
                        <div className="row">
                            <div className="col-md-3">
                                <WhatsappShareButton url={"https://ubuyblues.com"} title="تحقق من هذا المنتج">
                                    <WhatsappIcon size={45} round />
                                </WhatsappShareButton>
                            </div>
                            <div className="col-md-3">
                                <FacebookShareButton url={"https://ubuyblues.com"} title="تحقق من هذا المنتج">
                                    <FacebookIcon size={45} round />
                                </FacebookShareButton>
                            </div>
                            <div className="col-md-3">
                                <FacebookMessengerShareButton url={"https://ubuyblues.com"} title="تحقق من هذا المنتج">
                                    <FacebookMessengerIcon size={45} round />
                                </FacebookMessengerShareButton>
                            </div>
                            <div className="col-md-3">
                                <TelegramShareButton url={"https://ubuyblues.com"} title="تحقق من هذا المنتج">
                                    <TelegramIcon size={45} round />
                                </TelegramShareButton>
                            </div>
                        </div>
                    </div>
                </div>}
                {/* End Share Options Box */}
                <div className="page-content">
                    <div className="container-fluid">
                        {/* Start Share Options Box */}
                        {isDisplayShareOptionsBox && <div className="share-options-box">
                            <div className="share-icons-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                                <GrFormClose className="close-share-options-box-icon" onClick={() => setIsDisplayShareOptionsBox(false)} />
                                <h2 className="mb-3 pb-3 border-bottom border-white">Share Your Favorite Product With Your Friends</h2>
                                <div className="row">
                                    <div className="col-md-3">
                                        <WhatsappShareButton url={"https://ubuyblues.com"} title="تحقق من هذا المنتج">
                                            <WhatsappIcon size={45} round />
                                        </WhatsappShareButton>
                                    </div>
                                    <div className="col-md-3">
                                        <FacebookShareButton url={"https://ubuyblues.com"} title="تحقق من هذا المنتج">
                                            <FacebookIcon size={45} round />
                                        </FacebookShareButton>
                                    </div>
                                    <div className="col-md-3">
                                        <FacebookMessengerShareButton url={"https://ubuyblues.com"} title="تحقق من هذا المنتج">
                                            <FacebookMessengerIcon size={45} round />
                                        </FacebookMessengerShareButton>
                                    </div>
                                    <div className="col-md-3">
                                        <TelegramShareButton url={"https://ubuyblues.com"} title="تحقق من هذا المنتج">
                                            <TelegramIcon size={45} round />
                                        </TelegramShareButton>
                                    </div>
                                </div>
                            </div>
                        </div>}
                        {/* End Share Options Box */}
                        {/* Start Categories Section */}
                        <section className="categories mb-5 pb-5" id="categories">
                            <h2 className="section-name text-center mb-4 text-white">Categories</h2>
                            <div className="row">
                                {allCategories.map((category) => (
                                    <div className="col-md-3" key={category._id}>
                                        <div className="category-details p-3">
                                            <Link href={`/categories/${category._id}`} className="product-by-category-link text-dark">
                                                <h5 className="cateogory-name mb-3">{category.name}</h5>
                                                <MdKeyboardArrowRight className="forward-arrow-icon" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        {/* End Categories Section */}
                        {/* Start Last Added Products */}
                        <section className="last-added-products mb-5 pb-3" id="latest-added-products">
                            <h2 className="section-name text-center mb-4 text-white">Last Added Products</h2>
                            <div className="row products-box pt-4 pb-4">
                                {allProductsInsideThePage.length > 0 && allProductsInsideThePage.map((product, index) => (
                                    <div className="col-sm-6 col-md-4 col-xl-4" key={product._id}>
                                        <div
                                            className="product-managment-box"
                                            style={{
                                                backgroundImage: `url(${process.env.BASE_API_URL}/${product.imagePath})`
                                            }}
                                        >
                                            <a className="product-overlay" href={`/product-details/${product._id}`}></a>
                                            <div className="product-managment-buttons">

                                            </div>
                                        </div>
                                        <div className="product-details p-3 text-center">
                                            <h4 className="product-name fw-bold">{product.name}</h4>
                                            <h5 className="product-category">{product.category}</h5>
                                            <h5 className={`product-price ${product.discount != 0 ? "text-decoration-line-through" : ""}`}>{product.price} KWD</h5>
                                            {product.discount != 0 && <h4 className="product-price-after-discount m-0">{product.price - product.discount} KWD</h4>}
                                        </div>
                                    </div>
                                ))}
                                {/* {totalPagesCount > 0 && !isGetProductsStatus && paginationBar()} */}
                            </div>
                        </section>
                        {/* End Last Added Products */}
                        {appearedSections.includes("brands") && allBrands.length > 0 && <section className="brands mb-5">
                            <h2 className="section-name text-center mb-5 text-white">Brands</h2>
                            <div className="container-fluid">
                                <Slider
                                    dots={true}
                                    arrows={false}
                                    infinite={true}
                                    speed={500}
                                    slidesToShow={1}
                                    slidesToScroll={1}
                                >
                                    {allBrands.map((brand) => (
                                        <div className="brand-box mb-4" key={brand._id}>
                                            <div className="brand-image-box mb-4">
                                                <a
                                                    href="https://google.com"
                                                    target="_blank"
                                                >
                                                    <img
                                                        src={`${process.env.BASE_API_URL}/${brand.imagePath}`}
                                                        alt={`${brand.title} Brand Image`}
                                                    />
                                                </a>
                                            </div>
                                            <h2 className="text-white text-center">{brand.title}</h2>
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                        </section>}
                        <div className="contact-icons-box" onClick={() => setIsDisplayContactIcons(value => !value)}>
                            <ul className="contact-icons-list">
                                {isDisplayContactIcons && <li className="contact-icon-item mb-3">
                                    <a href="mailto:info@asfourintlco.com" target="_blank"><MdOutlineMail className="mail-icon" /></a>
                                </li>}
                                {isDisplayContactIcons && appearedSections.includes("whatsapp button") && <li className="contact-icon-item mb-3">
                                    <a href="https://wa.me/96560048235?text=welcome" target="_blank"><FaWhatsapp className="whatsapp-icon" /></a>
                                </li>}
                                {!isDisplayContactIcons && <li className="contact-icon-item"><MdOutlineContactPhone className="contact-icon" /></li>}
                                {isDisplayContactIcons && <li className="contact-icon-item"><FaTimes className="close-icon" /></li>}
                            </ul>
                        </div>
                        {/* End Contact Icons Box */}
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div >
    );
}