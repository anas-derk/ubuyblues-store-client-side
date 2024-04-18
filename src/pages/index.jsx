import Head from "next/head";
import Header from "@/components/Header";
import Link from "next/link";
import { MdKeyboardArrowRight, MdOutlineMail } from "react-icons/md";
import Footer from "@/components/Footer";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { RiArrowUpDoubleFill, RiArrowDownDoubleFill } from "react-icons/ri";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import Slider from "react-slick";
import { FaTimes, FaWhatsapp } from "react-icons/fa";
import { MdOutlineContactPhone } from "react-icons/md";
import { useTranslation } from "react-i18next";
import validations from "../../public/global_functions/validations";
import PaginationBar from "@/components/PaginationBar";
import prices from "../../public/global_functions/prices";
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
} from "../../public/global_functions/popular";
import { FaSearch } from "react-icons/fa";
import NotFoundError from "@/components/NotFoundError";
import StoreCard from "@/components/StoreCard";

export default function Home({ countryAsProperty, storeId }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [isGetCategories, setIsGetCategories] = useState(true);

    const [isGetProducts, setIsGetProducts] = useState(true);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [storeDetails, setStoreDetails] = useState({});

    const [isGetStores, setIsGetStores] = useState(true);

    const [favoriteProductsListForUser, setFavoriteProductsListForUser] = useState([]);

    const [allCategoriesInsideThePage, setAllCategoriesInsideThePage] = useState([]);

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [allStoresInsideThePage, setAllStoresInsideThePage] = useState([]);

    const [appearedNavigateIcon, setAppearedNavigateIcon] = useState("down");

    const [currentPage, setCurrentPage] = useState({
        forCategories: 1,
        forProducts: 1,
        forStores: 1,
    });

    const [totalPagesCount, setTotalPagesCount] = useState({
        forProducts: 0,
        forCategories: 0,
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

    const pageSize = 8;

    useEffect(() => {
        setIsLoadingPage(true);
        prices.getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(prices.getCurrencyNameByCountry(countryAsProperty));
            if (!isGetCategories && !isGetProducts) {
                setIsLoadingPage(false);
            }
        })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
    }, [countryAsProperty]);

    useEffect(() => {
        const userToken = localStorage.getItem("asfour-store-user-token");
        if (userToken) {
            validations.getUserInfo(userToken)
                .then((result) => {
                    if (!result.error) {
                        setFavoriteProductsListForUser(result.data.favorite_products_list);
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
        }
    }, []);

    useEffect(() => {
        setIsLoadingPage(true);
        setAllCategoriesInsideThePage([]);
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
            forProducts: 1,
            forStores: 1
        });
        setIsGetCategories(true);
        setIsGetProducts(true);
        setIsGetStores(true);
        const tempFilters = { ...filters, storeId };
        setFilters(tempFilters);
        const filtersAsString = getFiltersAsQuery(tempFilters);
        window.onscroll = function () { handleScrollToUpAndDown(this) };
        setWindowInnerWidth(window.innerWidth);
        window.addEventListener("resize", function () {
            setWindowInnerWidth(this.innerWidth);
        });
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
        // ==========================================================================================
        getAppearedSections()
            .then(async (result) => {
                const appearedSectionsLength = result.data.length;
                setAppearedSections(appearedSectionsLength > 0 ? result.data.map((appearedSection) => appearedSection.isAppeared ? appearedSection.sectionName : "") : []);
                if (appearedSectionsLength > 0) {
                    for (let i = 0; i < appearedSectionsLength; i++) {
                        if (result.data[i].sectionName === "brands" && result.data[i].isAppeared) {
                            console.log(await getAllBrandsByStoreId(filtersAsString))
                            setAllBrands((await getAllBrandsByStoreId(filtersAsString)).data);
                        }
                        if (result.data[i].sectionName === "stores" && result.data[i].isAppeared) {
                            const storesCount = await getStoresCount(filtersAsString);
                            if (storesCount.data > 0) {
                                setAllStoresInsideThePage((await getAllStoresInsideThePage(1, pageSize, filtersAsString)).data);
                                totalPagesCount.forStores = Math.ceil(storesCount.data / pageSize);
                            }
                            setIsGetStores(false);
                        }
                    }
                }
            })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
        // =============================================================================
        getStoreDetails(storeId)
            .then(async (result) => {
                if (!result.error && result.data?.status === "approving") {
                    setStoreDetails(result.data);
                    result = await getCategoriesCount(filtersAsString);
                    if (result.data > 0) {
                        setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(1, pageSize, filtersAsString)).data);
                        totalPagesCount.forCategories = Math.ceil(result.data / pageSize);
                    }
                    setIsGetCategories(false);
                    // =============================================================================
                    result = await getProductsCount(filtersAsString);
                    if (result.data > 0) {
                        setAllProductsInsideThePage((await getAllProductsInsideThePage(1, pageSize, filtersAsString)).data);
                        totalPagesCount.forProducts = Math.ceil(result.data / pageSize);
                    }
                    setIsGetProducts(false);
                    // =============================================================================
                } else {
                    setIsGetCategories(false);
                    setIsGetProducts(false);
                }
            })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
    }, [storeId]);

    useEffect(() => {
        if (!isGetCategories && !isGetProducts && !isGetStores) {
            setIsLoadingPage(false);
        }
    }, [isGetCategories, isGetProducts, isGetStores]);

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
        return favorite_products_list.findIndex((favorite_product) => favorite_product._id === productId) > -1 ? true : false;
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
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSize)).data);
            setCurrentPage({ ...currentPage, forCategories: newCurrentPage });
            setIsGetCategories(false);
        }
        if (section === "products") {
            setIsGetProducts(true);
            const newCurrentPage = currentPage.forProducts - 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data);
            setCurrentPage({ ...currentPage, forProducts: newCurrentPage });
            setIsGetProducts(false);
        }
    }

    const getNextPage = async (section) => {
        if (section === "categories") {
            setIsGetCategories(true);
            const newCurrentPage = currentPage.forCategories + 1;
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSize)).data);
            setCurrentPage({ ...currentPage, forCategories: newCurrentPage });
            setIsGetCategories(false);
        }
        if (section === "products") {
            setIsGetProducts(true);
            const newCurrentPage = currentPage.forProducts + 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data);
            setCurrentPage({ ...currentPage, forProducts: newCurrentPage });
            setIsGetProducts(false);
        }
    }

    const getSpecificPage = async (pageNumber, section) => {
        if (section === "categories") {
            setIsGetCategories(true);
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(pageNumber, pageSize)).data);
            setCurrentPage({ ...currentPage, forCategories: pageNumber });
            setIsGetCategories(false);
        }
        if (section === "products") {
            setIsGetProducts(true);
            setAllProductsInsideThePage((await getAllProductsInsideThePage(pageNumber, pageSize, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data);
            setCurrentPage({ ...currentPage, forProducts: pageNumber });
            setIsGetProducts(false);
        }
    }

    const searchOnProduct = async (e, filters, sortDetails) => {
        try {
            e.preventDefault();
            setIsGetProducts(true);
            setCurrentPage({ ...currentPage, forProducts: 1 });
            let filtersAsQuery = getFiltersAsQuery(filters);
            const result = await getProductsCount(filtersAsQuery);
            if (result.data > 0) {
                setAllProductsInsideThePage((await getAllProductsInsideThePage(1, pageSize, filtersAsQuery, getSortDetailsAsQuery(sortDetails))).data);
                totalPagesCount.forProducts = Math.ceil(result.data / pageSize);
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
                {isDisplayShareOptionsBox && <ShareOptionsBox
                    setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                    sharingName={sharingName}
                    sharingURL={sharingURL}
                />}
                {/* End Share Options Box */}
                <div className="page-content">
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
                            {allCategoriesInsideThePage.length > 0 ? <section className="categories mb-5 pb-5" id="categories">
                                <h2 className="section-name text-center mb-4 text-white">{t("Categories")}</h2>
                                {isGetCategories && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                                    <span className="loader-table-data"></span>
                                </div>}
                                <div className="row mb-5">
                                    {allCategoriesInsideThePage.map((category) => (
                                        <div className="col-md-3" key={category._id}>
                                            <div className="category-details p-3">
                                                <Link href={`/products-by-category?category=${category.name}`} className="product-by-category-link text-dark">
                                                    <h5 className="cateogory-name mb-3">{category.name}</h5>
                                                    <MdKeyboardArrowRight className="forward-arrow-icon" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {totalPagesCount.forCategories > 1 && !isGetCategories &&
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
                            </section> : <NotFoundError errorMsg={t("Sorry, Can't Find Any Categories For This Store !!")} />}
                            {/* End Categories Section */}
                            {/* Start Last Added Products */}
                            <section className="last-added-products mb-5 pb-3" id="latest-added-products">
                                <h2 className="section-name text-center mb-4 text-white">{t("Last Added Products")}</h2>
                                <div className="row filters-and-sorting-box mb-4">
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
                                </div>
                                <div className="row products-box section-data-box pt-4 pb-4">
                                    {allProductsInsideThePage.length > 0 ? allProductsInsideThePage.map((product) => (
                                        <div className="col-xs-12 col-lg-6 col-xl-4" key={product._id}>
                                            <ProductCard
                                                productDetails={product}
                                                setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                                                usdPriceAgainstCurrency={usdPriceAgainstCurrency}
                                                currencyNameByCountry={currencyNameByCountry}
                                                isFavoriteProductForUserAsProperty={isFavoriteProductForUser(favoriteProductsListForUser, product._id)}
                                                isExistProductInsideTheCartAsProperty={isExistProductInsideTheCart(product._id)}
                                                setSharingName={setSharingName}
                                                setSharingURL={setSharingURL}
                                            />
                                        </div>
                                    )) : <NotFoundError errorMsg={t("Sorry, Not Found Any Products Related In This Name !!")} />}
                                    {totalPagesCount.forProducts > 1 && !isGetProducts &&
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
                            {/* End Brands Section */}
                            {/* Start Stores Section */}
                            {appearedSections.includes("stores") && <section className="stores mb-5">
                                <h2 className="section-name text-center mb-4 text-white">{t("Stores")}</h2>
                                <div className="row stores-box section-data-box pt-4 pb-4">
                                    {allStoresInsideThePage.length > 0 ? allStoresInsideThePage.map((store) => (
                                        <div className="col-xs-12 col-lg-6 col-xl-4" key={store._id}>
                                            <StoreCard
                                                storeDetails={store}
                                                setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                                                setSharingName={setSharingName}
                                                setSharingURL={setSharingURL}
                                            />
                                        </div>
                                    )) : <NotFoundError errorMsg={t("Sorry, There Is Not Found Stores Now !!")} />}
                                </div>
                            </section>}
                            {/* End Stores Section */}
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