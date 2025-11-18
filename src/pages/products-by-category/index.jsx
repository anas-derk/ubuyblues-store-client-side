import Head from "next/head";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { getAllCategoriesInsideThePage, getAnimationSettings, getInitialStateForElementBeforeAnimation, getUserInfo, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import { getCurrencyNameByCountry, getBaseCurrencyPriceAgainstCurrency } from "../../../public/global_functions/prices";
import { getAllProductsInsideThePage, getFavoriteProductsByProductsIdsAndUserId, isExistProductInsideTheCart, isFavoriteProductForUser, isExistOfferOnProduct } from "../../../public/global_functions/popular";
import ShareOptionsBox from "@/components/ShareOptionsBox";
import { useTranslation } from "react-i18next";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import PaginationBar from "@/components/PaginationBar";
import { FaSearch } from "react-icons/fa";
import NotFoundError from "@/components/NotFoundError";
import axios from "axios";
import NavigateToUpOrDown from "@/components/NavigateToUpOrDown";
import SectionLoader from "@/components/SectionLoader";
import SubCategoriesForParentSidBar from "@/components/SubCategoriesForParentSidBar";
import { motion } from "motion/react";

export default function ProductByCategory({ countryAsProperty, categoryIdAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [convertedPrice, setConvertedPrice] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [isGetUserInfo, setIsGetUserInfo] = useState(true);

    const [isGetProducts, setIsGetProducts] = useState(true);

    const [isGetCategoryInfo, setIsGetCategoryInfo] = useState(true);

    const [isGetSubCategories, setIsGetSubCategories] = useState(true);

    const [categoryInfo, setCategoryInfo] = useState({});

    const [favoriteProductsListForUserByProductsIdsAndUserId, setFavoriteProductsListForUserByProductsIdsAndUserId] = useState([]);

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [allSubCategoriesInsideThePage, setAllSubCategoriesInsideThePage] = useState([]);

    const [isExistProductsInDBInGeneral, setIsExistProductsInDBInGeneral] = useState(false);

    const [currentDate, setCurrentDate] = useState("");

    const [currentPage, setCurrentPage] = useState({
        forCategories: 1,
        forProducts: 1,
    });

    const [totalPagesCount, setTotalPagesCount] = useState({
        forCategories: 0,
        forProducts: 0,
    });

    const [isDisplayShareOptionsBox, setIsDisplayShareOptionsBox] = useState(false);

    const [sharingName, setSharingName] = useState("");

    const [sharingURL, setSharingURL] = useState("");

    const [filters, setFilters] = useState({
        forCategories: {
            name: "",
        },
        forProducts: {
            categoryId: "",
            name: "",
        },
    });

    const [sortDetails, setSortDetails] = useState({
        forCategories: {
            by: "postOfDate",
            type: -1,
        },
        forProducts: {
            by: "postOfDate",
            type: -1,
        },
    });

    const [errorMsg, setErrorMsg] = useState("");

    const { t, i18n } = useTranslation();

    const pageSizes = {
        forCategories: 1000,
        forProducts: 9,
    };

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        setIsLoadingPage(true);
        const selectedCountry = localStorage.getItem(process.env.SELECTED_COUNTRY_BY_USER) ?? countryAsProperty;
        getBaseCurrencyPriceAgainstCurrency(selectedCountry).then((price) => {
            setConvertedPrice(price);
            setCurrencyNameByCountry(getCurrencyNameByCountry(selectedCountry));
            if (!isGetUserInfo && !isGetProducts) {
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
                .then(async (result) => {
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
        } else setIsGetUserInfo(false);
    }, []);

    const handleResetAllCategoryData = () => {
        setCategoryInfo({});
        setCurrentPage({ forCategories: 1, forProducts: 1 });
        setAllProductsInsideThePage([]);
        setTotalPagesCount({ forCategories: 1, forProducts: 1 });
        setIsExistProductsInDBInGeneral(false);
        setAllSubCategoriesInsideThePage([]);
        setFavoriteProductsListForUserByProductsIdsAndUserId([]);
    }

    const handleIsGetAllCategoryData = () => {
        setIsGetCategoryInfo(true);
        setIsGetProducts(true);
        setIsGetSubCategories(true);
    }

    useEffect(() => {
        setIsLoadingPage(true);
        handleResetAllCategoryData();
        handleIsGetAllCategoryData();
        getCategoryInfo(categoryIdAsProperty)
            .then(async (result) => {
                setIsGetCategoryInfo(false);
                if (Object.keys(result.data).length > 0) {
                    setCategoryInfo(result.data);
                    const tempFilters = { ...filters, forProducts: { ...filters.forProducts, categoryId: categoryIdAsProperty } };
                    setFilters(tempFilters);
                    let totalPagesCountTemp = {
                        forCategories: 0,
                        forProducts: 0,
                    }
                    result = (await getAllProductsInsideThePage(1, pageSizes.forProducts, getFiltersAsQuery({ categoryId: categoryIdAsProperty }), getSortDetailsAsQuery(sortDetails.forProducts))).data;
                    totalPagesCountTemp.forProducts = Math.ceil(result.productsCount / pageSizes.forProducts);
                    if (result.productsCount > 0) {
                        setAllProductsInsideThePage(result.products);
                        setCurrentDate(result.currentDate);
                        if (result.products.length > 0) {
                            setIsExistProductsInDBInGeneral(true);
                        }
                        const userToken = localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                        if (userToken) {
                            setFavoriteProductsListForUserByProductsIdsAndUserId((await getFavoriteProductsByProductsIdsAndUserId(result.products.map((product) => product._id))).data);
                        }
                    }
                    setIsGetProducts(false);
                    result = (await getAllCategoriesInsideThePage(1, pageSizes.forCategories, `parent=${categoryIdAsProperty}`, getSortDetailsAsQuery(sortDetails.forCategories))).data;
                    totalPagesCountTemp.forCategories = Math.ceil(result.categoriesCount / pageSizes.forCategories);
                    setAllSubCategoriesInsideThePage(result.categories);
                    setTotalPagesCount(totalPagesCountTemp);
                    setIsGetSubCategories(false);
                }
            })
            .catch((err) => {
                if (err?.response?.status === 401) {
                    localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                    setIsGetProducts(false);
                }
                else {
                    setIsGetProducts(false);
                    setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                }
            });
    }, [categoryIdAsProperty]);

    useEffect(() => {
        if (!isGetUserInfo && !isGetCategoryInfo) {
            setFilters({ ...filters, forCategories: { categoryId: categoryIdAsProperty } });
            setIsLoadingPage(false);
        }
    }, [isGetUserInfo, isGetCategoryInfo]);

    const getCategoryInfo = async (categoryId) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/categories/category-info/${categoryId}?language=${i18n.language}`)).data;
        }
        catch (err) {
            throw err;
        }
    }

    const getFiltersAsQuery = (filters) => {
        let filtersAsQuery = "";
        if (filters.name) filtersAsQuery += `name=${filters.name}&`;
        if (filters.categoryId) filtersAsQuery += `categoryId=${filters.categoryId}&`;
        if (filtersAsQuery) filtersAsQuery = filtersAsQuery.substring(0, filtersAsQuery.length - 1);
        return filtersAsQuery;
    }

    const getSortDetailsAsQuery = (sortDetails) => {
        let sortDetailsAsQuery = "";
        if (sortDetails.by && sortDetails.type) sortDetailsAsQuery += `sortBy=${sortDetails.by}&sortType=${sortDetails.type}`;
        return sortDetailsAsQuery;
    }

    const getPreviousPage = async (section) => {
        try {
            if (section === "categories") {
                setIsGetSubCategories(true);
                const newCurrentPage = currentPage.forCategories - 1;
                setAllSubCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSizes.forCategories)).data.categories);
                setCurrentPage({ ...currentPage, forCategories: newCurrentPage });
                setIsGetSubCategories(false);
            }
            else {
                setIsGetProducts(true);
                const newCurrentPage = currentPage.forProducts - 1;
                setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSizes.forProducts, getFiltersAsQuery(filters.forProducts), getSortDetailsAsQuery(sortDetails.forProducts))).data.products);
                setCurrentPage({ ...currentPage, forProducts: newCurrentPage });
                setIsGetProducts(false);
            }
        }
        catch (err) {
            throw err;
        }
    }

    const getNextPage = async (section) => {
        try {
            if (section === "categories") {
                setIsGetSubCategories(true);
                const newCurrentPage = currentPage.forCategories + 1;
                setAllSubCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSizes.forCategories, getFiltersAsQuery(filters.forCategories), getSortDetailsAsQuery(sortDetails.forCategories))).data.categories);
                setCurrentPage({ ...currentPage, forCategories: newCurrentPage });
                setIsGetSubCategories(false);
            }
            else {
                setIsGetProducts(true);
                const newCurrentPage = currentPage.forProducts + 1;
                setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSizes.forProducts, getFiltersAsQuery(filters.forProducts), getSortDetailsAsQuery(sortDetails.forProducts))).data.products);
                setCurrentPage({ ...currentPage, forProducts: newCurrentPage });
                setIsGetProducts(false);
            }
        }
        catch (err) {
            throw err;
        }
    }

    const getSpecificPage = async (pageNumber, section) => {
        try {
            if (section === "categories") {
                setIsGetSubCategories(true);
                setAllSubCategoriesInsideThePage((await getAllCategoriesInsideThePage(pageNumber, pageSizes.forCategories, getFiltersAsQuery(filters.forCategories), getSortDetailsAsQuery(sortDetails.forCategories))).data.categories);
                setCurrentPage({ ...currentPage, forCategories: pageNumber });
                setIsGetSubCategories(false);
            }
            else {
                setIsGetProducts(true);
                setAllProductsInsideThePage((await getAllProductsInsideThePage(pageNumber, pageSizes.forProducts, getFiltersAsQuery(filters.forProducts), getSortDetailsAsQuery(sortDetails.forProducts))).data.products);
                setCurrentPage({ ...currentPage, forProducts: pageNumber });
                setIsGetProducts(false);
            }
        }
        catch (err) {
            throw err;
        }
    }

    const searchOnProduct = async (e, filters, sortDetails) => {
        try {
            e.preventDefault();
            setIsGetProducts(true);
            setCurrentPage({ ...currentPage, forProducts: 1 });
            const result = (await getAllProductsInsideThePage(1, pageSizes.forProducts, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data;
            setAllProductsInsideThePage(result.products);
            setTotalPagesCount({ forProducts: Math.ceil(result.productsCount / pageSizes.forProducts) });
            setIsGetProducts(false);
        }
        catch (err) {
            setIsGetProducts(false);
            setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeat The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="products-by-category page">
            <Head>
                <title>{t(process.env.STORE_NAME)} - {t("Products By Category")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <NavigateToUpOrDown />
                {/* Start Share Options Box */}
                {isDisplayShareOptionsBox && <ShareOptionsBox
                    setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                    sharingName={sharingName}
                    sharingURL={sharingURL}
                />}
                {/* End Share Options Box */}
                <div className="page-content pt-5">
                    <div className="container-fluid">
                        {/* Start Last Added Products By Category Id */}
                        {Object.keys(categoryInfo).length > 0 ? <section className="last-added-products mb-5 pb-3" id="latest-added-products">
                            <motion.h1 className="section-name text-center mt-4 mb-5 text-white h3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Last Added Products")} : {categoryInfo.name[i18n.language]}</motion.h1>
                            <div className="row">
                                {isGetSubCategories && <div className="col-xl-3">
                                    {isGetSubCategories && <SectionLoader />}
                                </div>}
                                {!isGetSubCategories && allSubCategoriesInsideThePage.length > 0 && <div className="col-xl-3 mb-5">
                                    <SubCategoriesForParentSidBar subCategories={allSubCategoriesInsideThePage} />
                                </div>}
                                <div className={`${!isGetSubCategories && allSubCategoriesInsideThePage.length === 0 ? "col-xl-12" : "col-xl-9"}`}>
                                    {isExistProductsInDBInGeneral && <div className="row filters-and-sorting-box mb-4">
                                        <div className="col-xs-12 col-md-6">
                                            <form className="search-form">
                                                <div className="product-name-field-box searched-field-box">
                                                    <input
                                                        type="text"
                                                        placeholder={t("Please Enter The name Of The Product You Want To Search For")}
                                                        className="form-control"
                                                        onChange={(e) => {
                                                            const tempFilters = {
                                                                ...filters, forProducts: { name: e.target.value.trim() }
                                                            }
                                                            setFilters(tempFilters);
                                                            searchOnProduct(e, tempFilters.forProducts, sortDetails.forProducts);
                                                        }}
                                                    />
                                                    <div className={`icon-box ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                                        <FaSearch className='icon' onClick={(e) => searchOnProduct(e, filters.forProducts, sortDetails.forProducts)} />
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="col-xs-12 col-md-6">
                                            <form className="sort-form">
                                                <div className="select-sort-type-box">
                                                    <select
                                                        className="select-sort-type form-select"
                                                        onChange={(e) => {
                                                            const sortDetailsArray = e.target.value.split(",");
                                                            const tempSortDetails = { by: sortDetailsArray[0], type: sortDetailsArray[1] };
                                                            setSortDetails(tempSortDetails);
                                                            searchOnProduct(e, filters, tempSortDetails);
                                                        }}
                                                    >
                                                        <option value="" hidden>{t("Sort By")}</option>
                                                        <option value="postOfDate,-1">{t("From Latest To Oldest")}</option>
                                                        <option value="postOfDate,1">{t("From Oldest To Latest")}</option>
                                                        <option value="price,-1">{t("From Highest Price To Lowest")}</option>
                                                        <option value="price,1">{t("From Lowest Price To Highest")}</option>
                                                    </select>
                                                </div>
                                            </form>
                                        </div>
                                    </div>}
                                    {isGetProducts && <SectionLoader />}
                                    {!isGetProducts && allProductsInsideThePage.length === 0 && <NotFoundError errorMsg={t(!isExistProductsInDBInGeneral ? "Sorry, Not Found Any Products Now !!" : "Sorry, Not Found Any Products Related In This Name !!")} />}
                                    <div className="row products-box pt-4 pb-4">
                                        {!isGetProducts && allProductsInsideThePage.length > 0 && allProductsInsideThePage.map((product) => (
                                            <motion.div className="col-xs-12 col-lg-6 col-xl-4 mb-5" key={product._id} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                <ProductCard
                                                    productDetails={product}
                                                    setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                                                    convertedPrice={convertedPrice}
                                                    currencyNameByCountry={currencyNameByCountry}
                                                    isFavoriteProductForUserAsProperty={isFavoriteProductForUser(favoriteProductsListForUserByProductsIdsAndUserId, product._id)}
                                                    isExistProductInsideTheCartAsProperty={isExistProductInsideTheCart(product._id)}
                                                    setSharingName={setSharingName}
                                                    setSharingURL={setSharingURL}
                                                    currentDateAsString={currentDate}
                                                    isFlashProductAsProperty={isExistOfferOnProduct(currentDate, product.startDiscountPeriod, product.endDiscountPeriod)}
                                                />
                                            </motion.div>
                                        ))}
                                        {!isGetProducts && totalPagesCount.forProducts > 1 &&
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
                                </div>
                            </div>
                        </section> : <NotFoundError errorMsg={t("Sorry, This Category Is Not Exist !!")} />}
                        {/* End Last Added Products By Category Id */}
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div >
    );
}

export async function getServerSideProps({ query }) {
    if (query.categoryId) {
        const allowedCountries = ["kuwait", "germany", "turkey"];
        if (query.country) {
            if (!allowedCountries.includes(query.country)) {
                return {
                    redirect: {
                        permanent: false,
                        destination: `/product-by-category?categoryId=${query.categoryId}`,
                    },
                    props: {
                        countryAsProperty: process.env.BASE_COUNTRY,
                        categoryIdAsProperty: query.categoryId,
                    },
                }
            }
            if (Object.keys(query).filter((key) => key !== "country" && key !== "categoryId").length > 2) {
                return {
                    redirect: {
                        permanent: false,
                        destination: `/?country=${query.country}&categoryId=${query.categoryId}`,
                    },
                    props: {
                        countryAsProperty: query.country,
                        categoryIdAsProperty: query.categoryId,
                    },
                }
            }
            return {
                props: {
                    countryAsProperty: query.country,
                    categoryIdAsProperty: query.categoryId,
                },
            }
        }
        return {
            props: {
                countryAsProperty: process.env.BASE_COUNTRY,
                categoryIdAsProperty: query.categoryId,
            },
        }
    }
    return {
        redirect: {
            permanent: false,
            destination: "/",
        },
        props: {
            countryAsProperty: process.env.BASE_COUNTRY,
        },
    }
}