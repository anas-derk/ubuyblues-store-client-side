import Head from "next/head";
import Header from "@/components/Header";
import Link from "next/link";
import { MdKeyboardArrowRight, MdOutlineMail } from "react-icons/md";
import Footer from "@/components/Footer";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { RiArrowUpDoubleFill, RiArrowDownDoubleFill } from "react-icons/ri";
import { GrFormClose } from "react-icons/gr";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import Slider from "react-slick";
import { PiShareFatLight } from "react-icons/pi";
import { WhatsappShareButton, WhatsappIcon, FacebookShareButton, FacebookIcon, FacebookMessengerShareButton, FacebookMessengerIcon, TelegramShareButton, TelegramIcon } from "react-share";
import { FaTimes, FaWhatsapp } from "react-icons/fa";
import { MdOutlineContactPhone } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { BsClock, BsFillSuitHeartFill, BsSuitHeart } from "react-icons/bs";
import { FaCheck } from 'react-icons/fa';
import validations from "../../public/global_functions/validations";
import PaginationBar from "@/components/PaginationBar";

export default function Home() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [token, setToken] = useState("");

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [userId, setUserId] = useState("");

    const [userInfo, setUserInfo] = useState("");

    const [favoriteProductsListForUser, setFavoriteProductsListForUser] = useState([]);

    const [isWaitGetCategoriesStatus, setIsWaitGetCategoriesStatus] = useState(false);

    const [isGetProductsStatus, setIsGetProductsStatus] = useState(false);

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [allCategoriesInsideThePage, setAllCategoriesInsideThePage] = useState([]);

    const [productAddingId, setProductAddingId] = useState("");

    const [isWaitAddToCart, setIsWaitAddToCart] = useState(false);

    const [isSuccessAddToCart, setIsSuccessAddToCart] = useState(false);

    const [errorInAddToCart, setErrorInAddToCart] = useState("");

    const [favoriteProductAddingId, setFavoriteProductAddingId] = useState("");

    const [isWaitAddProductToFavoriteUserProductsList, setIsWaitAddProductToFavoriteUserProductsList] = useState(false);

    const [isWaitDeleteProductToFavoriteUserProductsList, setIsWaitDeleteProductToFavoriteUserProductsList] = useState(false);

    const [isSuccessAddProductToFavoriteUserProductsList, setIsSuccessAddProductToFavoriteUserProductsList] = useState(false);

    const [isSuccessDeleteProductToFavoriteUserProductsList, setIsSuccessDeleteProductToFavoriteUserProductsList] = useState(false);

    const [appearedNavigateIcon, setAppearedNavigateIcon] = useState("down");

    const [currentPage, setCurrentPage] = useState({
        forCategories: 1,
        forProducts: 1,
    });

    const [totalPagesCount, setTotalPagesCount] = useState({
        forProducts: 0,
        forCategories: 0,
    });

    const [isDisplayShareOptionsBox, setIsDisplayShareOptionsBox] = useState(false);

    const [appearedSections, setAppearedSections] = useState([]);

    const [allBrands, setAllBrands] = useState([]);

    const [isDisplayContactIcons, setIsDisplayContactIcons] = useState(false);

    const { i18n, t } = useTranslation();

    const pageSize = 2;

    useEffect(() => {
        window.onscroll = function () { handleScrollToUpAndDown(this) };
        setWindowInnerWidth(window.innerWidth);
        window.addEventListener("resize", function () {
            setWindowInnerWidth(this.innerWidth);
        });
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
        const userToken = localStorage.getItem("asfour-store-user-token");
        if (userToken) {
            setToken(userToken);
            validations.getUserInfo(userToken)
                .then((result) => {
                    if (!result.error) {
                        setUserInfo(result.data);
                        setFavoriteProductsListForUser(result.data.favorite_products_list);
                    }
                })
                .catch((err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem("asfour-store-user-token");
                    }
                    setIsLoadingPage(false);
                    setIsErrorMsgOnLoadingThePage(true);
                });
        }
        // =============================================================================
        getCategoriesCount()
            .then(async (result) => {
                if (result.data > 0) {
                    setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(1, pageSize)).data);
                    setTotalPagesCount({ ...totalPagesCount, forCategories: Math.ceil(result.data / pageSize) });
                }
            })
            .catch((err) => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
        // =============================================================================
        getProductsCount()
            .then(async (result) => {
                if (result.data > 0) {
                    setAllProductsInsideThePage((await getAllProductsInsideThePage(1, pageSize)).data);
                    setTotalPagesCount({ ...totalPagesCount, forProducts: Math.ceil(result.data / pageSize) });
                }
            })
            .catch((err) => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
        // =============================================================================
        getAppearedSections()
            .then(async (result) => {
                const appearedSectionsLength = result.data.length;
                setAppearedSections(appearedSectionsLength > 0 ? result.data.map((appearedSection) => appearedSection.isAppeared ? appearedSection.sectionName : "") : []);
                if (appearedSectionsLength > 0) {
                    for (let i = 0; i < appearedSectionsLength; i++) {
                        if (result.data[i].sectionName === "brands" && result.data[i].isAppeared) {
                            setAllBrands((await getAllBrands()).data);
                        }
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
        // ==========================================================================================
        setIsLoadingPage(false);
    }, []);

    const getCategoriesCount = async () => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/categories/categories-count`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllCategoriesInsideThePage = async (pageNumber, pageSize) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/categories/all-categories-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAppearedSections = async () => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/appeared-sections/all-sections`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllBrands = async () => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/brands/all-brands`);
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
                setIsSuccessAddProductToFavoriteUserProductsList(true);
                let successAddToCartTimeout = setTimeout(() => {
                    setIsSuccessAddProductToFavoriteUserProductsList(false);
                    setFavoriteProductAddingId("");
                    clearTimeout(successAddToCartTimeout);
                }, 3000);
            }
        }
        catch (err) {
            setIsWaitAddProductToFavoriteUserProductsList(false);
            setFavoriteProductAddingId("");
        }
    }

    const deleteProductFromFavoriteUserProducts = async (productIndex, userId) => {
        try {
            setIsWaitDeleteProductToFavoriteUserProductsList(true);
            setFavoriteProductAddingId(allProductsInsideThePage[productIndex]._id);
            const res = await axios.delete(`${process.env.BASE_API_URL}/users/favorite-product?userId=${userId}&productId=${allProductsInsideThePage[productIndex]._id}`);
            const result = await res.data;
            if (result.msg === "Ok !!, Deleting Favorite Product From This User Is Successfuly !!") {
                setFavoriteProductsListForUser(result.newFavoriteProductsList);
                setIsWaitDeleteProductToFavoriteUserProductsList(false);
                setIsSuccessDeleteProductToFavoriteUserProductsList(true);
                let successDeleteToCartTimeout = setTimeout(() => {
                    setIsSuccessDeleteProductToFavoriteUserProductsList(false);
                    setFavoriteProductAddingId("");
                    clearTimeout(successDeleteToCartTimeout);
                }, 3000);
            }
        }
        catch (err) {
            setIsWaitDeleteProductToFavoriteUserProductsList(false);
            setFavoriteProductAddingId("");
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
                setProductAddingId("");
                clearTimeout(successAddToCartTimeout);
            }, 3000);
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
                setProductAddingId("");
                clearTimeout(successAddToCartTimeout);
            }, 3000);
        }
    }

    const getAppearedSlidesCount = (windowInnerWidth, count) => {
        if (windowInnerWidth < 767) return 1;
        if (windowInnerWidth >= 767 && windowInnerWidth < 1199 && count >= 2) return 2;
        if (windowInnerWidth >= 1199 && count >= 3) return 3;
        return count;
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

    const getPreviousPage = async (section) => {
        if (section === "categories") {
            setIsWaitGetCategoriesStatus(true);
            const newCurrentPage = currentPage.forCategories - 1;
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSize)).data);
            setCurrentPage({ ...currentPage, forCategories: newCurrentPage });
            setIsWaitGetCategoriesStatus(false);
        }
        if (section === "products") {
            setIsGetProductsStatus(true);
            const newCurrentPage = currentPage.forProducts - 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize)).data);
            setCurrentPage({ ...currentPage, forProducts: newCurrentPage });
            setIsGetProductsStatus(false);
        }
    }

    const getNextPage = async (section) => {
        if (section === "categories") {
            setIsWaitGetCategoriesStatus(true);
            const newCurrentPage = currentPage.forCategories + 1;
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSize)).data);
            setCurrentPage({ ...currentPage, forCategories: newCurrentPage });
            setIsWaitGetCategoriesStatus(false);
        }
        if (section === "products") {
            setIsGetProductsStatus(true);
            const newCurrentPage = currentPage.forProducts + 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize)).data);
            setCurrentPage({ ...currentPage, forProducts: newCurrentPage });
            setIsGetProductsStatus(false);
        }
    }

    const getSpecificPage = async (pageNumber, section) => {
        if (section === "categories") {
            setIsWaitGetCategoriesStatus(true);
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(pageNumber, pageSize)).data);
            setCurrentPage({ ...currentPage, forCategories: pageNumber });
            setIsWaitGetCategoriesStatus(false);
        }
        if (section === "products") {
            setIsGetProductsStatus(true);
            setAllProductsInsideThePage((await getAllProductsInsideThePage(pageNumber, pageSize)).data);
            setCurrentPage({ ...currentPage, forProducts: pageNumber });
            setIsGetProductsStatus(false);
        }
    }

    return (
        <div className="home page">
            <Head>
                <title>Ubuyblues Store - Home</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
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
                        {/* Start Categories Section */}
                        <section className="categories mb-5 pb-5" id="categories">
                            <h2 className="section-name text-center mb-4 text-white">{t("Categories")}</h2>
                            {allCategoriesInsideThePage.length === 0 && !isWaitGetCategoriesStatus && <p className="alert alert-danger w-100">Sorry, Can't Find Any Categories !!</p>}
                            {isWaitGetCategoriesStatus && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                                <span className="loader-table-data"></span>
                            </div>}
                            <div className="row">
                                {allCategoriesInsideThePage.map((category) => (
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
                            {totalPagesCount.forCategories > 0 && !isWaitGetCategoriesStatus &&
                                <PaginationBar
                                    totalPagesCount={totalPagesCount.forCategories}
                                    currentPage={currentPage.forCategories}
                                    getPreviousPage={getPreviousPage}
                                    getNextPage={getNextPage}
                                    getSpecificPage={getSpecificPage}
                                    section="categories"
                                />
                            }
                        </section>
                        {/* End Categories Section */}
                        {/* Start Last Added Products */}
                        <section className="last-added-products mb-5 pb-3" id="latest-added-products">
                            <h2 className="section-name text-center mb-4 text-white">{t("Last Added Products")}</h2>
                            <div className="row products-box pt-4 pb-4">
                                {allProductsInsideThePage.length > 0 && allProductsInsideThePage.map((product, index) => (
                                    <div className="col-sm-6 col-md-4 col-xl-4 product" key={product._id}>
                                        <div
                                            className="product-managment-box"
                                            style={{
                                                backgroundImage: `url(${process.env.BASE_API_URL}/${product.imagePath})`
                                            }}
                                        >
                                            <a className={`product-overlay ${product._id == productAddingId ? "displaying" : ""}`} href={`/product-details/${product._id}`}></a>
                                            <div className="product-managment-buttons p-2">
                                                <PiShareFatLight
                                                    className="product-managment-icon d-block mb-2"
                                                    onClick={() => setIsDisplayShareOptionsBox(true)}
                                                />
                                                {!isWaitAddProductToFavoriteUserProductsList && !isWaitDeleteProductToFavoriteUserProductsList && product._id !== favoriteProductAddingId && <>
                                                    {userInfo && isFavoriteProductForUser(favoriteProductsListForUser, product._id) ? <BsFillSuitHeartFill
                                                        className="product-managment-icon"
                                                        onClick={() => deleteProductFromFavoriteUserProducts(index, userId)}
                                                    /> :
                                                        <BsSuitHeart
                                                            className="product-managment-icon"
                                                            onClick={() => addProductToFavoriteUserProducts(index, userId)}
                                                        />}
                                                </>}
                                                {(isWaitAddProductToFavoriteUserProductsList || isWaitDeleteProductToFavoriteUserProductsList) && product._id === favoriteProductAddingId && <BsClock className="product-managment-icon" />}
                                                {(isSuccessAddProductToFavoriteUserProductsList || isSuccessDeleteProductToFavoriteUserProductsList) && product._id === favoriteProductAddingId && <FaCheck className="product-managment-icon" />}
                                            </div>
                                            <div className={`add-to-cart-button-box ${product._id == productAddingId ? "displaying" : ""}`}>
                                                {!isWaitAddToCart && product._id !== productAddingId && <button className="add-to-cart-btn cart-btn p-2" onClick={() => addToCart(product._id, product.name, product.price, product.description, product.category, product.discount, product.imagePath)}>{t("Add To Cart")}</button>}
                                                {isWaitAddToCart && product._id == productAddingId && <button className="wait-to-cart-btn cart-btn p-2" disabled>{t("Waiting In Add To Cart")} ...</button>}
                                                {errorInAddToCart && product._id == productAddingId && <button className="error-to-cart-btn cart-btn p-2" disabled>{t("Sorry, Something Went Wrong")} !!</button>}
                                                {isSuccessAddToCart && product._id == productAddingId && <Link href="/cart" className="success-to-cart-btn cart-btn p-2 btn btn-success text-dark">
                                                    <FaCheck className="me-2" />
                                                    <span>{t("Click To Go To Cart Page")}</span>
                                                </Link>}
                                            </div>
                                        </div>
                                        <div className="product-details p-3 text-center">
                                            <h4 className="product-name fw-bold">{product.name}</h4>
                                            <h5 className="product-category">{product.category}</h5>
                                            <h5 className={`product-price ${product.discount != 0 ? "text-decoration-line-through" : ""}`}>{product.price} {t("KWD")}</h5>
                                            {product.discount != 0 && <h4 className="product-price-after-discount m-0">{product.price - product.discount} {t("KWD")}</h4>}
                                        </div>
                                    </div>
                                ))}
                                {totalPagesCount.forProducts > 0 && !isGetProductsStatus &&
                                    <PaginationBar
                                        totalPagesCount={totalPagesCount.forProducts}
                                        currentPage={currentPage.forProducts}
                                        getPreviousPage={getPreviousPage}
                                        getNextPage={getNextPage}
                                        getSpecificPage={getSpecificPage}
                                        paginationButtonTextColor={"#000"}
                                        paginationButtonBackgroundColor={"#FFF"}
                                        section="products"
                                    />}
                            </div>
                        </section>
                        {/* End Last Added Products */}
                        {appearedSections.includes("brands") && allBrands.length > 0 && <section className="brands mb-5">
                            <h2 className="section-name text-center mb-5 text-white">{t("Brands")}</h2>
                            <div className="container-fluid">
                                <Slider
                                    dots={true}
                                    arrows={false}
                                    infinite={false}
                                    speed={500}
                                    slidesToShow={getAppearedSlidesCount(windowInnerWidth, allBrands.length)}
                                    slidesToScroll={getAppearedSlidesCount(windowInnerWidth, allBrands.length)}
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