import Head from "next/head";
import Header from "@/components/Header";
import Link from "next/link";
import { BsFillCartPlusFill, BsFillSuitHeartFill, BsSuitHeart, BsFillPersonFill, BsPersonVcard } from "react-icons/bs";
import { FaShoppingCart } from "react-icons/fa";
import { BiSolidCategory, BiSearchAlt } from "react-icons/bi";
import { MdKeyboardArrowRight } from "react-icons/md";
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
import logoWithWhiteCircle from "../../public/images/logoCircle.png";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import { BsArrowLeftSquare, BsArrowRightSquare } from "react-icons/bs";
import Slider from "react-slick";
import { PiShareFatLight } from "react-icons/pi";
import { WhatsappShareButton, WhatsappIcon, FacebookShareButton, FacebookIcon, FacebookMessengerShareButton, FacebookMessengerIcon, TelegramShareButton, TelegramIcon } from "react-share";
import { FaEnvelope, FaTimes, FaWhatsapp } from "react-icons/fa";

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

    const router = useRouter();

    const sliderRef = useRef();

    const pageSize = 8;

    useEffect(() => {
        window.onscroll = function () { handleScrollToUpAndDown(this) };
        const userId = localStorage.getItem("asfour-store-user-id");
        setUserId(userId);
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
                    setAppearedSections(appearedSectionsLength > 0 ? result2.map((appearedSection) => appearedSection.sectionName) : []);
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

    const getLastSevenProducts = () => {
        let lastSevenProducts = [];
        if (allProductsInsideThePage.length >= 7) {
            for (let i = 0; i < 2; i++) {
                lastSevenProducts.push(allProductsInsideThePage[i]);
            }
        } else {
            for (let i = 0; i < allProductsInsideThePage.length; i++) {
                lastSevenProducts.push(allProductsInsideThePage[i]);
            }
        }
        return lastSevenProducts;
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
                <span className="current-page-number-and-count-of-pages p-2 ps-3 pe-3 bg-secondary text-white me-3">The Page {currentPage} of {totalPagesCount} Pages</span>
                <form
                    className="navigate-to-specific-page-form w-25"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setIsGetProductsStatus(true);
                        setAllProductsInsideThePage(await getAllProductsInsideThePage(pageNumber, pageSize));
                        setCurrentPage(pageNumber);
                        setIsGetProductsStatus(false);
                    }}
                >
                    <input
                        type="number"
                        className="form-control p-1 ps-2 page-number-input"
                        placeholder="Enter Page Number"
                        min="1"
                        max={totalPagesCount}
                        onChange={(e) => setPageNumber(e.target.valueAsNumber)}
                    />
                </form>
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
                <div className="navigate-to-up-button">
                    {appearedNavigateIcon === "up" && <RiArrowUpDoubleFill className="arrow-up arrow-icon" onClick={() => navigateToUpOrDown("up")} />}
                    {appearedNavigateIcon === "down" && <RiArrowDownDoubleFill className="arrow-down arrow-icon" onClick={() => navigateToUpOrDown("down")} />}
                </div>
                {/* Start Overlay */}
                {productIndex > -1 && <div className="overlay">
                    <div className="content p-4 text-white">
                        <GrFormClose className="close-overlay-icon" onClick={() => setProductIndex(-1)} />
                        <header className="overlay-header mb-4">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <h6 className="product-name-and-category">
                                        <span className="me-2">Main</span>
                                        <IoIosArrowForward className="me-2" />
                                        <span className="me-2 product-category-name">{allProductsInsideThePage[productIndex].category}</span>
                                        <IoIosArrowForward className="me-2" />
                                        <span className="product-name">{allProductsInsideThePage[productIndex].name}</span>
                                    </h6>
                                </div>
                                <div className="col-md-6">
                                    <ul className="navigate-links-list d-flex p-3 justify-content-center">
                                        <li className="navigate-links-item">
                                            <Link href="/" className="navigate-link">
                                                <AiOutlineHome className="home-icon overlay-header-icon" />
                                            </Link>
                                        </li>
                                        {!userId && <li className="navigate-links-item">
                                            <Link href="/auth" className="navigate-link">
                                                <BsFillPersonFill className="auth-icon overlay-header-icon" />
                                            </Link>
                                        </li>}
                                        {userId && <>
                                            <li className="navigate-links-item">
                                                <Link href="#" className="navigate-link" onClick={userLogout}>
                                                    <MdOutlineLogout className="logout-icon overlay-header-icon" />
                                                </Link>
                                            </li>
                                            <li className="navigate-links-item">
                                                <Link href="/customer-dashboard" className="navigate-link">
                                                    <BsPersonVcard className="user-account-icon overlay-header-icon" />
                                                </Link>
                                            </li>
                                        </>}
                                    </ul>
                                </div>
                            </div>
                        </header>
                        <div className={`product-details-box ${windowInnerWidth < 991 ? "p-3" : ""}`}>
                            <div className="row mb-3">
                                <div className="col-lg-6">
                                    <div className="product-images-box mb-4">
                                        <div className="main-product-image-box mb-3">
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
                                                        src={`${process.env.BASE_API_URL}/${allProductsInsideThePage[productIndex].imagePath}`}
                                                        alt="product image !!"
                                                        className="w-100 h-100 product-image"
                                                    />
                                                </div>
                                                {allProductsInsideThePage[productIndex].galleryImagesPaths.map((path, pathIndex) => (
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
                                        <div className="row">
                                            <div className="col-sm-3 text-center">
                                                <div
                                                    className="product-image-box"
                                                    onClick={() => { setProductGalleryImageIndex(-1); goToSlide(0); }}
                                                >
                                                    <img
                                                        src={`${process.env.BASE_API_URL}/${allProductsInsideThePage[productIndex].imagePath}`}
                                                        className={`product-gallery-image ${productGalleryImageIndex === -1 ? "selection" : ""}`}
                                                    />
                                                </div>
                                            </div>
                                            {allProductsInsideThePage[productIndex].galleryImagesPaths.map((path, pathIndex) => (
                                                <div
                                                    className="col-sm-3 text-center"
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
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="product-price-and-quantity me-3 mb-4 border-bottom border-2">
                                        <h2 className="product-name fw-bold mb-4">{allProductsInsideThePage[productIndex].name}</h2>
                                        <h5 className={`product-price ${allProductsInsideThePage[productIndex].discount != 0 ? "text-decoration-line-through" : "mb-4"}`}>{allProductsInsideThePage[productIndex].price} $</h5>
                                        {allProductsInsideThePage[productIndex].discount != 0 && <h4 className="product-after-discount mb-4">{allProductsInsideThePage[productIndex].price - allProductsInsideThePage[productIndex].discount} $</h4>}
                                        <h5 className="product-quantity">1 Product Available In Store</h5>
                                    </div>
                                    <div className="add-to-wish-list-or-cart text-center me-3 border-bottom border-2 mb-3">
                                        {userInfo && isFavoriteProductForUser(favoriteProductsListForUser, allProductsInsideThePage[productIndex]._id) ? <BsFillSuitHeartFill
                                            className="product-managment-icon mb-3"
                                            onClick={() => deleteProductFromFavoriteUserProducts(productIndex, userId)}
                                        /> : <BsSuitHeart
                                            className="product-managment-icon mb-3"
                                            onClick={() => addProductToFavoriteUserProducts(productIndex, userId)}
                                        />}
                                        <div className={`add-to-cart row align-items-center mb-4 ${windowInnerWidth > 767 ? "me-3" : ""}`}>
                                            <div className="add-to-cart-managment-btns-box col-md-8">
                                                {!isWaitAddToCart && !errorInAddToCart && !isSuccessAddToCart && <button className="add-to-cart-btn p-2 d-block w-100" onClick={() => addToCart(product._id, product.name, product.price, product.description, product.category, product.discount, product.imagePath)}>Add To Cart</button>}
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
                                    <h5 className="product-category-name">
                                        <span className="fw-bold">Category: </span>
                                        <span>{allProductsInsideThePage[productIndex].category}</span>
                                    </h5>
                                </div>
                            </div>
                            <div className={`product-description-and-referrals row justify-content-center border-bottom border-2 border-white mb-4 ${windowInnerWidth > 767 ? "" : "pb-3"}`}>
                                <div className="col-lg-6 text-center">
                                    <h6 className={`p-2 ${appearedProductDetailsBoxName === "description" ? "selected" : ""}`} onClick={() => setAppearedProductDetailsBoxName("description")}>Description</h6>
                                </div>
                                <div className="col-lg-6 text-center">
                                    <h6 className={`p-2 ${appearedProductDetailsBoxName === "referrals" ? "selected" : ""}`} onClick={() => setAppearedProductDetailsBoxName("referrals")}>Referrals (0)</h6>
                                </div>
                            </div>
                            {appearedProductDetailsBoxName === "description" && <div className="product-description mb-4 border-bottom border-2 me-3">
                                <h6 className="mb-3 fw-bold">Description</h6>
                                <p className="description-content">{allProductsInsideThePage[productIndex].description}</p>
                            </div>}
                            {appearedProductDetailsBoxName === "referrals" && <div className="product-referrals mb-4 border-bottom border-2 me-3">
                                <div className="row">
                                    <div className="col-lg-6">
                                        <h6 className="mb-4 fw-bold">Referrals</h6>
                                        <h6 className="mb-4">There are no reviews yet !!</h6>
                                    </div>
                                    <div className="col-lg-6">
                                        <h6 className="mb-4">Be the first to review "{allProductsInsideThePage[productIndex].name}"</h6>
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
                            <Footer />
                        </div>
                    </div>
                </div>}
                {/* End Overlay */}
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
                <div className="page-content">
                    <section className="links-and-logo bg-white">
                        <div className="links-box d-flex">
                            <Link href="/">
                                <FaShoppingCart className="cart-icon link-icon" />
                            </Link>
                            <Link href="/customer-dashboard/wish-list">
                                <BsFillSuitHeartFill className="cart-icon link-icon" />
                            </Link>
                            <Link href="/cart">
                                <BsFillCartPlusFill className="cart-icon link-icon" />
                            </Link>
                        </div>
                        <div className="logo-box m-0 d-flex align-items-center justify-content-center"></div>
                    </section>
                    <div className="container-fluid">
                        <div className="products-display-managment">
                            <div className="row">
                                <div className="col-md-3">
                                    <aside className="side-bar bg-white p-3 fw-bold">Sale Products</aside>
                                </div>
                                <div className="col-md-9">
                                    <section className="navigate-link-for-display-products bg-white p-2 d-flex justify-content-center mb-5">
                                        <Link href="#categories" className="display-product-link me-5 text-center">
                                            <BiSolidCategory className="icon mb-2" />
                                            <h5 className="link-name">Category</h5>
                                        </Link>
                                        <Link href="#latest-added-products" className="display-product-link me-5 text-center">
                                            <BiSolidCategory className="icon mb-2" />
                                            <h5 className="link-name">Last Added</h5>
                                        </Link>
                                        <Link href="#best-seller" className="display-product-link me-5 text-center">
                                            <BiSolidCategory className="icon mb-2" />
                                            <h5 className="link-name">Best</h5>
                                        </Link>
                                    </section>
                                </div>
                            </div>
                        </div>
                        <section className="search mb-5 text-end">
                            <BiSearchAlt className="search-icon p-2" />
                        </section>
                        <section className="categories mb-5" id="categories">
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
                        <section className="last-added-products mb-5">
                            <h2 className="section-name text-center mb-4 text-white">Last Added Products</h2>
                            <div className="row products-box bg-white pt-4 pb-4">
                                {allProductsInsideThePage.length > 0 && allProductsInsideThePage.map((product, index) => (
                                    <div className="col-md-3" key={product._id}>
                                        <img src={`${process.env.BASE_API_URL}/${product.imagePath}`} alt="product image !!" />
                                        <div className="product-details p-3 text-center">
                                            <h4 className="product-name fw-bold">{product.name}</h4>
                                            <h5 className="product-category">{product.category}</h5>
                                            <h5 className={`product-price ${product.discount != 0 ? "text-decoration-line-through" : ""}`}>{product.price} $</h5>
                                            {product.discount != 0 && <h4 className="product-after-discount">{product.price - product.discount} $</h4>}
                                            <div className="product-managment-buttons-box">
                                                <PiShareFatLight
                                                    className="product-managment-icon me-2"
                                                    onClick={() => setIsDisplayShareOptionsBox(true)}
                                                />

                                                {userInfo && isFavoriteProductForUser(favoriteProductsListForUser, product._id) ? <BsFillSuitHeartFill
                                                    className="product-managment-icon me-2"
                                                    onClick={() => deleteProductFromFavoriteUserProducts(index, userId)}
                                                /> : <BsSuitHeart
                                                    className="product-managment-icon me-2"
                                                    onClick={() => addProductToFavoriteUserProducts(index, userId)}
                                                />}
                                                <AiOutlineEye className="me-2 eye-icon product-managment-icon" onClick={() => setProductIndex(index)} />
                                                {!isWaitAddToCart && !errorInAddToCart && !isSuccessAddToCart && product._id !== productAddingId && <button className="add-to-cart-btn p-2" onClick={() => addToCart(product._id, product.name, product.price, product.description, product.category, product.discount, product.imagePath)}>Add To Cart</button>}
                                                {isWaitAddToCart && product._id == productAddingId && <button className="wait-to-cart-btn p-2" disabled>Waiting In Add To Cart ...</button>}
                                                {errorInAddToCart && product._id == productAddingId && <button className="error-to-cart-btn p-2" disabled>Sorry, Something Went Wrong !!</button>}
                                                {isSuccessAddToCart && product._id == productAddingId && <Link href="/cart" className="success-to-cart-btn p-2 btn btn-success" disabled>Display Your Cart</Link>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {totalPagesCount > 0 && !isGetProductsStatus && paginationBar()}
                            </div>
                        </section>
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
                                    {allBrands.map((brand, brandIndex) => (
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
                        {/* Start Contact Icons Box */}
                        {appearedSections.includes("whatsapp button") && <div className="contact-icons-box" onClick={() => setIsDisplayContactIcons(value => !value)}>
                            <ul className="contact-icons-list">
                                {isDisplayContactIcons && <li className="contact-icon-item mb-3">
                                    <a href="https://wa.me/96566817628?text=welcome" target="_blank"><FaWhatsapp className="whatsapp-icon" /></a>
                                </li>}
                                {!isDisplayContactIcons && <li className="contact-icon-item"><FaEnvelope className="contact-icon" /></li>}
                                {isDisplayContactIcons && <li className="contact-icon-item"><FaTimes className="close-icon" /></li>}
                            </ul>
                        </div>}
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