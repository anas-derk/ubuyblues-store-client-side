import Head from "next/head";
import Header from "@/components/Header";
import Link from "next/link";
import { MdKeyboardArrowRight, MdOutlineMail } from "react-icons/md";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import { RiArrowUpDoubleFill, RiArrowDownDoubleFill } from "react-icons/ri";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import Slider from "react-slick";
import { FaTimes, FaWhatsapp } from "react-icons/fa";
import { MdOutlineContactPhone } from "react-icons/md";
import { useTranslation } from "react-i18next";
import PaginationBar from "@/components/PaginationBar";
import { getCurrencyNameByCountry, getUSDPriceAgainstCurrency } from "../../public/global_functions/prices";
import ShareOptionsBox from "@/components/ShareOptionsBox";
import ProductCard from "@/components/ProductCard";
import {
    getProductsCount,
    getAllProductsInsideThePage,
    isExistProductInsideTheCart,
    getStoreDetails,
    getCategoriesCount,
    getAllCategoriesInsideThePage,
    getStoresCount,
    getAllStoresInsideThePage,
    getFlashProductsCount,
    getAllFlashProductsInsideThePage,
    isExistOfferOnProduct,
    getFavoriteProductsByProductsIdsAndUserId,
    isFavoriteProductForUser,
    getUserInfo
} from "../../public/global_functions/popular";
import { FaSearch } from "react-icons/fa";
import NotFoundError from "@/components/NotFoundError";
import StoreCard from "@/components/StoreCard";
import SectionLoader from "@/components/SectionLoader";

export default function Home({ countryAsProperty, storeId }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [isGetStoreDetails, setIsGetStoreDetails] = useState(true);

    const [isGetCategories, setIsGetCategories] = useState(true);

    const [isGetProducts, setIsGetProducts] = useState(true);

    const [isGetFlashProducts, setIsGetFlashProducts] = useState(true);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [storeDetails, setStoreDetails] = useState({});

    const [isGetBrands, setIsGetBrands] = useState(true);

    const [isGetStores, setIsGetStores] = useState(true);

    const [favoriteProductsListForUserByProductsIdsAndUserId, setFavoriteProductsListForUserByProductsIdsAndUserId] = useState([]);

    const [allCategoriesInsideThePage, setAllCategoriesInsideThePage] = useState([]);

    const [allFlashProductsInsideThePage, setAllFlashProductsInsideThePage] = useState([]);
    
    const [isExistFlashProductsInDBInGeneral, setIsExistFlashProductsInDBInGeneral] = useState(false);

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [isExistProductsInDBInGeneral, setIsExistProductsInDBInGeneral] = useState(false);

    const [currentDate, setCurrentDate] = useState("");

    const [allStoresInsideThePage, setAllStoresInsideThePage] = useState([]);

    const [appearedNavigateIcon, setAppearedNavigateIcon] = useState("down");

    const [currentPage, setCurrentPage] = useState({
        forCategories: 1,
        forFlashProducts: 1,
        forProducts: 1,
        forStores: 1,
    });

    const [totalPagesCount, setTotalPagesCount] = useState({
        forCategories: 0,
        forFlashProducts: 0,
        forProducts: 0,
        forStores: 0,
    });

    const [filters, setFilters] = useState({
        name: "",
        storeId: "",
        status: "approving"
    });

    const [sortDetails, setSortDetails] = useState({
        by: "",
        type: 1,
    });

    const [isDisplayShareOptionsBox, setIsDisplayShareOptionsBox] = useState(false);

    const [sharingName, setSharingName] = useState("");

    const [sharingURL, setSharingURL] = useState("");

    const [appearedSections, setAppearedSections] = useState([]);

    const [allBrands, setAllBrands] = useState([]);

    const [isDisplayContactIcons, setIsDisplayContactIcons] = useState(false);

    const { i18n, t } = useTranslation();

    const pageSizes = {
        forCategories: 16,
        forFlashProducts: 9,
        forProducts: 9,
        forStores: 9,
    };

    useEffect(() => {
        setIsLoadingPage(true);
        getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(getCurrencyNameByCountry(countryAsProperty));
            if (!isGetStoreDetails) {
                setIsLoadingPage(false);
            }
        })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
    }, [countryAsProperty]);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        if (userToken) {
            getUserInfo()
                .then((result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                    }
                })
                .catch((err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                    } else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        }
    }, []);

    useEffect(() => {
        window.onscroll = function () { handleScrollToUpAndDown(this) };
        setWindowInnerWidth(window.innerWidth);
        window.addEventListener("resize", function () {
            setWindowInnerWidth(this.innerWidth);
        });
    }, []);

    useEffect(() => {
        setIsLoadingPage(true);
        handleResetAllHomeData();
        handleIsGetAllHomeData();
        const tempFilters = { ...filters, storeId };
        setFilters(tempFilters);
        const filtersAsString = getFiltersAsQuery(tempFilters);
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
        // ==========================================================================================
        getStoreDetails(storeId)
            .then(async (storeDetailsResult) => {
                setIsGetStoreDetails(false);
                if (!storeDetailsResult.error && storeDetailsResult.data?.status === "approving") {
                    setStoreDetails(storeDetailsResult.data);
                    // =============================================================================
                    await handleGetAndSetCategories(filtersAsString);
                    setIsGetCategories(false);
                    // =============================================================================
                    const flashProductsData = await handleGetAndSetFlashProducts(filtersAsString);
                    if (flashProductsData.length > 0) {
                        setIsExistFlashProductsInDBInGeneral(true);
                    }
                    setIsGetFlashProducts(false);
                    // =============================================================================
                    const productsData = await handleGetAndSetProducts(filtersAsString);
                    if (productsData.length > 0) {
                        setIsExistProductsInDBInGeneral(true);
                    }
                    // =============================================================================
                    await handleGetAndSetFavoriteProductsByProductsIdsAndUserId(
                        handleCreateProductsIdsToGetFavoriteProductsForUser(
                            flashProductsData.map((flashProduct) => flashProduct._id),
                            productsData.map((product) => product._id)
                        )
                    );
                    setIsGetProducts(false);
                    // =============================================================================
                    const appearedSectionsResult = await getAppearedSections();
                    const appearedSectionsLength = appearedSectionsResult.data.length;
                    setAppearedSections(appearedSectionsLength > 0 ? appearedSectionsResult.data.map((appearedSection) => appearedSection.isAppeared ? appearedSection.sectionName : "") : []);
                    if (appearedSectionsLength > 0) {
                        for (let i = 0; i < appearedSectionsLength; i++) {
                            if (appearedSectionsResult.data[i].sectionName === "brands" && appearedSectionsResult.data[i].isAppeared) {
                                setAllBrands((await getAllBrandsByStoreId(filtersAsString)).data);
                                setIsGetBrands(false);
                            }
                            if (appearedSectionsResult.data[i].sectionName === "stores" && appearedSectionsResult.data[i].isAppeared) {
                                await handleGetAndSetStores(filtersAsString);
                                setIsGetStores(false);
                            }
                        }
                    }
                }
            })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
        // =============================================================================
    }, [storeId]);

    useEffect(() => {
        if (!isGetStoreDetails) {
            setIsLoadingPage(false);
        }
    }, [isGetStoreDetails]);

    const handleResetAllHomeData = () => {
        setAllCategoriesInsideThePage([]);
        setAllFlashProductsInsideThePage([]);
        setAllProductsInsideThePage([]);
        setAllBrands([]);
        setAllStoresInsideThePage([]);
        setTotalPagesCount({
            forCategories: 0,
            forProducts: 0,
            forStores: 0,
        });
        setCurrentPage({
            forCategories: 1,
            forFlashProducts: 1,
            forProducts: 1,
            forStores: 1
        });
    }

    const handleIsGetAllHomeData = () => {
        setIsGetStoreDetails(true);
        setIsGetCategories(true);
        setIsGetProducts(true);
        setIsGetFlashProducts(true);
        setIsGetBrands(true);
        setIsGetStores(true);
    }

    const handleGetAndSetCategories = async (filtersAsString) => {
        const result = await getCategoriesCount(filtersAsString);
        if (result.data > 0) {
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(1, pageSizes.forCategories, filtersAsString)).data);
            totalPagesCount.forCategories = Math.ceil(result.data / pageSizes.forCategories);
        }
    }

    const handleGetAndSetFlashProducts = async (filtersAsString) => {
        const result = await getFlashProductsCount(filtersAsString);
        if (result.data > 0) {
            const result1 = (await getAllFlashProductsInsideThePage(1, pageSizes.forFlashProducts, filtersAsString)).data;
            setAllFlashProductsInsideThePage(result1.products);
            setCurrentDate(result1.currentDate);
            totalPagesCount.forFlashProducts = Math.ceil(result.data / pageSizes.forFlashProducts);
            return result1.products;
        }
        return [];
    }

    const handleGetAndSetProducts = async (filtersAsString) => {
        const result = await getProductsCount(filtersAsString);
        if (result.data > 0) {
            const result1 = (await getAllProductsInsideThePage(1, pageSizes.forProducts, filtersAsString)).data;
            setAllProductsInsideThePage(result1.products);
            totalPagesCount.forProducts = Math.ceil(result.data / pageSizes.forProducts);
            return result1.products;
        }
        return [];
    }

    const handleCreateProductsIdsToGetFavoriteProductsForUser = (flashProductsIds, productsIds) => {
        return Array.from(new Set(flashProductsIds.concat(productsIds)));
    }

    const handleGetAndSetFavoriteProductsByProductsIdsAndUserId = async (productsIds) => {
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        if (userToken) {
            setFavoriteProductsListForUserByProductsIdsAndUserId((await getFavoriteProductsByProductsIdsAndUserId(productsIds)).data);
        }
    }

    const handleGetAndSetStores = async (filtersAsString) => {
        const storesCount = await getStoresCount(filtersAsString);
        if (storesCount.data > 0) {
            setAllStoresInsideThePage((await getAllStoresInsideThePage(1, pageSizes.forStores, filtersAsString)).data);
            setTotalPagesCount({
                ...totalPagesCount,
                forStores: Math.ceil(storesCount.data / pageSizes.forStores)
            });
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

    const getAllBrandsByStoreId = async (filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/brands/all-brands-by-store-id?${filters ? filters : ""}`);
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

    const navigateToUpOrDown = () => {
        if (appearedNavigateIcon === "up") {
            window.scrollTo({
                behavior: "smooth",
                top: 0,
                left: 0,
            });
        } else {
            window.scrollTo({
                behavior: "smooth",
                top: document.querySelector("footer").offsetTop,
                left: 0,
            });
        }
    }

    const getAppearedSlidesCount = (windowInnerWidth, count) => {
        if (windowInnerWidth < 767) return 1;
        if (windowInnerWidth >= 767 && windowInnerWidth < 1199 && count >= 2) return 2;
        if (windowInnerWidth >= 1199 && count >= 3) return 3;
        return count;
    }

    const getFiltersAsQuery = (filters) => {
        let filtersAsQuery = "";
        if (filters.name) filtersAsQuery += `name=${filters.name}&`;
        if (filters.storeId) filtersAsQuery += `storeId=${filters.storeId}&`;
        if (filters.status) filtersAsQuery += `status=${filters.status}&`;
        if (filtersAsQuery) filtersAsQuery = filtersAsQuery.substring(0, filtersAsQuery.length - 1);
        return filtersAsQuery;
    }

    const getSortDetailsAsQuery = (sortDetails) => {
        let sortDetailsAsQuery = "";
        if (sortDetails.by && sortDetails.type) sortDetailsAsQuery += `sortBy=${sortDetails.by}&sortType=${sortDetails.type}`;
        return sortDetailsAsQuery;
    }

    const getPreviousPage = async (section) => {
        if (section === "categories") {
            setIsGetCategories(true);
            const newCurrentPage = currentPage.forCategories - 1;
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSizes.forCategories)).data);
            setCurrentPage({ ...currentPage, forCategories: newCurrentPage });
            setIsGetCategories(false);
        }
        else if (section === "products") {
            setIsGetProducts(true);
            const newCurrentPage = currentPage.forProducts - 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSizes.forProducts, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data.products);
            setCurrentPage({ ...currentPage, forProducts: newCurrentPage });
            setIsGetProducts(false);
        }
        else {
            setIsGetStores(true);
            const newCurrentPage = currentPage.forStores - 1;
            setAllStoresInsideThePage((await getAllStoresInsideThePage(newCurrentPage, pageSizes.forStores, getFiltersAsQuery(filters))).data);
            setCurrentPage({ ...currentPage, forStores: newCurrentPage });
            setIsGetStores(false);
        }
    }

    const getNextPage = async (section) => {
        if (section === "categories") {
            setIsGetCategories(true);
            const newCurrentPage = currentPage.forCategories + 1;
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSizes.forCategories)).data);
            setCurrentPage({ ...currentPage, forCategories: newCurrentPage });
            setIsGetCategories(false);
        }
        else if (section === "products") {
            setIsGetProducts(true);
            const newCurrentPage = currentPage.forProducts + 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSizes.forProducts, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data.products);
            setCurrentPage({ ...currentPage, forProducts: newCurrentPage });
            setIsGetProducts(false);
        }
        else {
            setIsGetStores(true);
            const newCurrentPage = currentPage.forStores + 1;
            setAllStoresInsideThePage((await getAllStoresInsideThePage(newCurrentPage, pageSizes.forStores, getFiltersAsQuery(filters))).data);
            setCurrentPage({ ...currentPage, forStores: newCurrentPage });
            setIsGetStores(false);
        }
    }

    const getSpecificPage = async (pageNumber, section) => {
        if (section === "categories") {
            setIsGetCategories(true);
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(pageNumber, pageSizes.forCategories)).data);
            setCurrentPage({ ...currentPage, forCategories: pageNumber });
            setIsGetCategories(false);
        }
        else if (section === "products") {
            setIsGetProducts(true);
            setAllProductsInsideThePage((await getAllProductsInsideThePage(pageNumber, pageSizes.forProducts, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data.products);
            setCurrentPage({ ...currentPage, forProducts: pageNumber });
            setIsGetProducts(false);
        }
        else {
            setIsGetStores(true);
            setAllStoresInsideThePage((await getAllStoresInsideThePage(pageNumber, pageSizes.forStores, getFiltersAsQuery(filters))).data);
            setCurrentPage({ ...currentPage, forStores: pageNumber });
            setIsGetStores(false);
        }
    }

    const searchOnProduct = async (e, filters, sortDetails) => {
        try {
            e.preventDefault();
            setIsGetProducts(true);
            let filtersAsQuery = getFiltersAsQuery(filters);
            const result = await getProductsCount(filtersAsQuery);
            if (result.data > 0) {
                setAllProductsInsideThePage((await getAllProductsInsideThePage(1, pageSizes.forProducts, filtersAsQuery, getSortDetailsAsQuery(sortDetails))).data.products);
                totalPagesCount.forProducts = Math.ceil(result.data / pageSizes.forProducts);
                setCurrentPage({ ...currentPage, forProducts: 1 });
                setIsGetProducts(false);
            } else {
                setAllProductsInsideThePage([]);
                totalPagesCount.forProducts = 0;
                setIsGetProducts(false);
            }
        }
        catch (err) {
            setIsGetProducts(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="home">
            <Head>
                <title>{t("Ubuyblues Store")} - {t("Home")}</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div
                    className="navigate-to-up-button"
                    onClick={navigateToUpOrDown}
                >
                    {appearedNavigateIcon === "up" ? <RiArrowUpDoubleFill className="arrow-up arrow-icon" /> : <RiArrowDownDoubleFill className="arrow-down arrow-icon" />}
                </div>
                {/* Start Share Options Box */}
                {isDisplayShareOptionsBox && <ShareOptionsBox
                    setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                    sharingName={sharingName}
                    sharingURL={sharingURL}
                />}
                {/* End Share Options Box */}
                <div className="page-content page">
                    <div className="container-fluid">
                        {Object.keys(storeDetails).length > 0 ? <>
                            {/* Start Store Details Section */}
                            <section className="store-details text-white text-center mb-5">
                                <img
                                    src={`${process.env.BASE_API_URL}/${storeDetails.imagePath}`}
                                    alt={`${storeDetails.name} Store Image`}
                                    width="200"
                                    height="200"
                                    className="d-block mx-auto mb-5 store-image"
                                />
                                <h1 className="mb-5 border-bottom border-4 pb-3 welcome-msg mb-5 mw-100 mx-auto">{t("Welcome To You In Store")} {storeDetails.name}</h1>
                                <h2 className="products-description mb-4">{storeDetails.productsDescription}</h2>
                            </section>
                            {/* End Store Details Section */}
                            {/* Start Categories Section */}
                            <section className="categories mb-5 pb-5" id="categories">
                                <h2 className="section-name text-center mb-4 text-white">{t("Categories")}</h2>
                                {isGetCategories && <SectionLoader />}
                                {!isGetCategories && allCategoriesInsideThePage.length > 0 && <div className="row mb-5">
                                    {allCategoriesInsideThePage.map((category) => (
                                        <div className="col-md-3" key={category._id}>
                                            <div className="category-details p-3">
                                                <Link href={`/products-by-category?categoryId=${category._id}`} className="product-by-category-link text-dark">
                                                    <h5 className="cateogory-name mb-3">{category.name}</h5>
                                                    <MdKeyboardArrowRight className="forward-arrow-icon" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>}
                                {!isGetCategories && allCategoriesInsideThePage.length === 0 && <NotFoundError errorMsg={t("Sorry, Can't Find Any Categories For This Store !!")} />}
                                {totalPagesCount.forCategories > 1 &&
                                    <PaginationBar
                                        totalPagesCount={totalPagesCount.forCategories}
                                        currentPage={currentPage.forCategories}
                                        getPreviousPage={getPreviousPage}
                                        getNextPage={getNextPage}
                                        getSpecificPage={getSpecificPage}
                                        paginationButtonTextColor={"#FFF"}
                                        paginationButtonBackgroundColor={"transparent"}
                                        activePaginationButtonColor={"#000"}
                                        activePaginationButtonBackgroundColor={"#FFF"}
                                        isDisplayCurrentPageNumberAndCountOfPages={false}
                                        isDisplayNavigateToSpecificPageForm={false}
                                        section="categories"
                                    />
                                }
                            </section>
                            {/* End Categories Section */}
                            {/* Start Last Added Flash Products */}
                            <section className="last-added-flash-products mb-5 pb-3" id="latest-added-products">
                                <h2 className="section-name text-center mb-4 text-white">{t("Flash Products")}</h2>
                                {isExistFlashProductsInDBInGeneral && <div className="row filters-and-sorting-box mb-4">
                                    <div className="col-xs-12 col-md-6">
                                        <form className="search-form" onSubmit={(e) => searchOnProduct(e, filters, sortDetails)}>
                                            <div className="product-name-field-box">
                                                <input
                                                    type="text"
                                                    placeholder={t("Please Enter The name Of The Product You Want To Search For")}
                                                    className={`form-control p-3 border-2`}
                                                    onChange={(e) => {
                                                        const tempFilters = { ...filters, name: e.target.value.trim() };
                                                        setFilters(tempFilters);
                                                        searchOnProduct(e, tempFilters, sortDetails);
                                                    }}
                                                />
                                                <div className={`icon-box ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                                    <FaSearch className="icon" onClick={(e) => searchOnProduct(e, filters, sortDetails)} />
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="col-xs-12 col-md-6">
                                        <form className="sort-form" onSubmit={(e) => searchOnProduct(e, filters)}>
                                            <div className="select-sort-type-box">
                                                <select
                                                    className="select-sort-type form-select p-3"
                                                    onChange={(e) => {
                                                        const sortDetailsArray = e.target.value.split(",");
                                                        const tempSortDetails = { by: sortDetailsArray[0], type: sortDetailsArray[1] };
                                                        setSortDetails(tempSortDetails);
                                                        searchOnProduct(e, filters, tempSortDetails);
                                                    }}
                                                >
                                                    <option value="" hidden>{t("Sort By")}</option>
                                                    <option value="postOfDate,1">{t("From Latest To Oldest")}</option>
                                                    <option value="postOfDate,-1">{t("From Oldest To Latest")}</option>
                                                    <option value="price,-1">{t("From Highest Price To Lowest")}</option>
                                                    <option value="price,1">{t("From Lowest Price To Highest")}</option>
                                                </select>
                                            </div>
                                        </form>
                                    </div>
                                </div>}
                                {isGetFlashProducts && <SectionLoader />}
                                <div className="row products-box section-data-box pt-4 pb-4">
                                    {!isGetFlashProducts && allFlashProductsInsideThePage.length > 0 && allFlashProductsInsideThePage.map((product) => (
                                        <div className="col-xs-12 col-lg-6 col-xl-4" key={product._id}>
                                            <ProductCard
                                                productDetails={product}
                                                setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                                                usdPriceAgainstCurrency={usdPriceAgainstCurrency}
                                                currencyNameByCountry={currencyNameByCountry}
                                                isFavoriteProductForUserAsProperty={isFavoriteProductForUser(favoriteProductsListForUserByProductsIdsAndUserId, product._id)}
                                                isExistProductInsideTheCartAsProperty={isExistProductInsideTheCart(product._id)}
                                                setSharingName={setSharingName}
                                                setSharingURL={setSharingURL}
                                                currentDateAsString={currentDate}
                                                isFlashProductAsProperty={true}
                                                isDisplayCountdown={true}
                                            />
                                        </div>
                                    ))}
                                    {!isGetFlashProducts && allFlashProductsInsideThePage.length === 0 && <NotFoundError errorMsg={t("Sorry, Not Found Any Products Related In This Name !!")} />}
                                    {totalPagesCount.forFlashProducts > 1 &&
                                        <PaginationBar
                                            totalPagesCount={totalPagesCount.forFlashProducts}
                                            currentPage={currentPage.forFlashProducts}
                                            getPreviousPage={getPreviousPage}
                                            getNextPage={getNextPage}
                                            getSpecificPage={getSpecificPage}
                                            paginationButtonTextColor={"#FFF"}
                                            paginationButtonBackgroundColor={"transparent"}
                                            activePaginationButtonColor={"#000"}
                                            activePaginationButtonBackgroundColor={"#FFF"}
                                            section="flash-products"
                                        />}
                                </div>
                            </section>
                            {/* End Last Added Flash Products */}
                            {/* Start Last Added Products */}
                            <section className="last-added-products mb-5 pb-3" id="latest-added-products">
                                <h2 className="section-name text-center mb-4 text-white">{t("Last Added Products")}</h2>
                                {isExistProductsInDBInGeneral && <div className="row filters-and-sorting-box mb-4">
                                    <div className="col-xs-12 col-md-6">
                                        <form className="search-form" onSubmit={(e) => searchOnProduct(e, filters, sortDetails)}>
                                            <div className="product-name-field-box">
                                                <input
                                                    type="text"
                                                    placeholder={t("Please Enter The name Of The Product You Want To Search For")}
                                                    className={`form-control p-3 border-2`}
                                                    onChange={(e) => {
                                                        const tempFilters = { ...filters, name: e.target.value.trim() };
                                                        setFilters(tempFilters);
                                                        searchOnProduct(e, tempFilters, sortDetails);
                                                    }}
                                                />
                                                <div className={`icon-box ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                                    <FaSearch className='icon' onClick={(e) => searchOnProduct(e, filters, sortDetails)} />
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="col-xs-12 col-md-6">
                                        <form className="sort-form" onSubmit={(e) => searchOnProduct(e, filters)}>
                                            <div className="select-sort-type-box">
                                                <select
                                                    className="select-sort-type form-select p-3"
                                                    onChange={(e) => {
                                                        const sortDetailsArray = e.target.value.split(",");
                                                        const tempSortDetails = { by: sortDetailsArray[0], type: sortDetailsArray[1] };
                                                        setSortDetails(tempSortDetails);
                                                        searchOnProduct(e, filters, tempSortDetails);
                                                    }}
                                                >
                                                    <option value="" hidden>{t("Sort By")}</option>
                                                    <option value="postOfDate,1">{t("From Latest To Oldest")}</option>
                                                    <option value="postOfDate,-1">{t("From Oldest To Latest")}</option>
                                                    <option value="price,-1">{t("From Highest Price To Lowest")}</option>
                                                    <option value="price,1">{t("From Lowest Price To Highest")}</option>
                                                </select>
                                            </div>
                                        </form>
                                    </div>
                                </div>}
                                {isGetProducts && <SectionLoader />}
                                {!isGetProducts && allProductsInsideThePage.length === 0 && <NotFoundError errorMsg={t("Sorry, Not Found Any Products Related In This Name !!")} />}
                                <div className="row products-box section-data-box pt-4 pb-4">
                                    {!isGetProducts && allProductsInsideThePage.length > 0 && allProductsInsideThePage.map((product) => (
                                        <div className="col-xs-12 col-lg-6 col-xl-4" key={product._id}>
                                            <ProductCard
                                                productDetails={product}
                                                setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                                                usdPriceAgainstCurrency={usdPriceAgainstCurrency}
                                                currencyNameByCountry={currencyNameByCountry}
                                                isFavoriteProductForUserAsProperty={isFavoriteProductForUser(favoriteProductsListForUserByProductsIdsAndUserId, product._id)}
                                                isExistProductInsideTheCartAsProperty={isExistProductInsideTheCart(product._id)}
                                                setSharingName={setSharingName}
                                                setSharingURL={setSharingURL}
                                                currentDateAsString={currentDate}
                                                isFlashProductAsProperty={isExistOfferOnProduct(currentDate, product.startDiscountPeriod, product.endDiscountPeriod)}
                                            />
                                        </div>
                                    ))}
                                    {totalPagesCount.forProducts > 1 &&
                                        <PaginationBar
                                            totalPagesCount={totalPagesCount.forProducts}
                                            currentPage={currentPage.forProducts}
                                            getPreviousPage={getPreviousPage}
                                            getNextPage={getNextPage}
                                            getSpecificPage={getSpecificPage}
                                            paginationButtonTextColor={"#FFF"}
                                            paginationButtonBackgroundColor={"transparent"}
                                            activePaginationButtonColor={"#000"}
                                            activePaginationButtonBackgroundColor={"#FFF"}
                                            section="products"
                                        />}
                                </div>
                            </section>
                            {/* End Last Added Products */}
                            {/* Start Brands Section */}
                            {appearedSections.includes("brands") && allBrands.length > 0 && <section className="brands mb-5">
                                <h2 className="section-name text-center mb-5 text-white">{t("Brands")}</h2>
                                {isGetBrands && <SectionLoader />}
                                {!isGetBrands && allBrands.length > 0 && <div className="container-fluid">
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
                                </div>}
                                {!isGetBrands && allBrands.length === 0 && <NotFoundError errorMsg={t("Sorry, Not Found Any Brands !!")} />}
                            </section>}
                            {/* End Brands Section */}
                            {/* Start Stores Section */}
                            {appearedSections.includes("stores") && <section className="stores mb-5">
                                <h2 className="section-name text-center mb-4 text-white">{t("Stores")}</h2>
                                <div className="row stores-box section-data-box pt-4 pb-4">
                                    {isGetStores && <SectionLoader />}
                                    {!isGetStores && allStoresInsideThePage.length > 0 && allStoresInsideThePage.map((store) => (
                                        <div className="col-xs-12 col-lg-6 col-xl-4" key={store._id}>
                                            <StoreCard
                                                storeDetails={store}
                                                setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                                                setSharingName={setSharingName}
                                                setSharingURL={setSharingURL}
                                            />
                                        </div>
                                    ))}
                                    {!isGetStores && allStoresInsideThePage.length === 0 && <NotFoundError errorMsg={t("Sorry, There Is Not Found Stores Now !!")} />}
                                </div>
                                {totalPagesCount.forStores > 1 && !isGetStores &&
                                    <PaginationBar
                                        totalPagesCount={totalPagesCount.forStores}
                                        currentPage={currentPage.forStores}
                                        getPreviousPage={getPreviousPage}
                                        getNextPage={getNextPage}
                                        getSpecificPage={getSpecificPage}
                                        paginationButtonTextColor={"#FFF"}
                                        paginationButtonBackgroundColor={"transparent"}
                                        activePaginationButtonColor={"#000"}
                                        activePaginationButtonBackgroundColor={"#FFF"}
                                        section="stores"
                                    />}
                            </section>}
                            {/* End Stores Section */}
                        </> : <NotFoundError errorMsg={t("Sorry, This Store Is Not Found !!")} />}
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

export async function getServerSideProps({ query }) {
    const allowedCountries = ["kuwait", "germany", "turkey"];
    if (query.country) {
        if (!allowedCountries.includes(query.country)) {
            if (query.storeId) {
                return {
                    redirect: {
                        permanent: false,
                        destination: `/?storeId=${query.storeId}`,
                    },
                    props: {
                        countryAsProperty: "kuwait",
                        storeId: query.storeId,
                    },
                }
            }
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
        if (Object.keys(query).filter((key) => key !== "country" && key !== "storedId").length > 2) {
            return {
                redirect: {
                    permanent: false,
                    destination: `/?country=${query.country}&storeId=${query.storeId}`,
                },
                props: {
                    countryAsProperty: query.country,
                    storeId: query.storeId,
                },
            }
        }
        return {
            props: {
                countryAsProperty: query.country,
                storeId: query.storeId,
            },
        }
    }
    if (query.storeId) {
        return {
            props: {
                countryAsProperty: "kuwait",
                storeId: query.storeId,
            },
        }
    }
    return {
        props: {
            countryAsProperty: "kuwait",
        },
    }
}