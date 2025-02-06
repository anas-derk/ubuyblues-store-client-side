import Head from "next/head";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { getAllCategoriesInsideThePage, getAnimationSettings, getCategoriesCount, getInitialStateForElementBeforeAnimation, getUserInfo, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import { getCurrencyNameByCountry, getUSDPriceAgainstCurrency } from "../../../public/global_functions/prices";
import { getProductsCount, getAllProductsInsideThePage, getFavoriteProductsByProductsIdsAndUserId, isExistProductInsideTheCart, isFavoriteProductForUser, isExistOfferOnProduct } from "../../../public/global_functions/popular";
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

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

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

    const [currentPageForProducts, setCurrentPageForProducts] = useState(1);

    const [currentPageForSubCategories, setCurrentPageForSubCategories] = useState(1);

    const [totalPagesCountForProducts, setTotalPagesCountForProducts] = useState(0);

    const [totalPagesCountForSubCategories, setTotalPagesCountForSubCategories] = useState(0);

    const [isDisplayShareOptionsBox, setIsDisplayShareOptionsBox] = useState(false);

    const [sharingName, setSharingName] = useState("");

    const [sharingURL, setSharingURL] = useState("");

    const [filters, setFilters] = useState({
        categoryId: "",
    });

    const [sortDetails, setSortDetails] = useState({
        by: "",
        type: 1,
    });

    const [errorMsg, setErrorMsg] = useState("");

    const { t, i18n } = useTranslation();

    const pageSize = 9;

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.userlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        setIsLoadingPage(true);
        getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(getCurrencyNameByCountry(countryAsProperty));
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
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        if (userToken) {
            getUserInfo()
                .then(async (result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                    }
                    setIsGetUserInfo(false);
                })
                .catch((err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
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
        setCurrentPageForProducts(1);
        setCurrentPageForSubCategories(1);
        setAllProductsInsideThePage([]);
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
                    const filtersAsString = getFiltersAsQuery({ categoryId: categoryIdAsProperty });
                    result = await getProductsCount(filtersAsString);
                    if (result.data > 0) {
                        setTotalPagesCountForProducts(Math.ceil(result.data / pageSize));
                        result = (await getAllProductsInsideThePage(1, pageSize, getFiltersAsQuery({ categoryId: categoryIdAsProperty }))).data;
                        setAllProductsInsideThePage(result.products);
                        setCurrentDate(result.currentDate);
                        if (result.products.length > 0) {
                            setIsExistProductsInDBInGeneral(true);
                        }
                        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
                        if (userToken) {
                            setFavoriteProductsListForUserByProductsIdsAndUserId((await getFavoriteProductsByProductsIdsAndUserId(result.products.map((product) => product._id))).data);
                        }
                    }
                    setIsGetProducts(false);
                    result = await getCategoriesCount(`parent=${categoryIdAsProperty}`);
                    if (result.data > 0) {
                        setAllSubCategoriesInsideThePage((await getAllCategoriesInsideThePage(1, 1000, `parent=${categoryIdAsProperty}`)).data);
                        setTotalPagesCountForSubCategories(Math.ceil(result.data / 1000));
                    }
                    setIsGetSubCategories(false);
                }
            })
            .catch((err) => {
                if (err?.response?.status === 401) {
                    localStorage.removeItem(process.env.userTokenNameInLocalStorage);
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
            setFilters({ ...filters, categoryId: categoryIdAsProperty });
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

    const getPreviousPage = async () => {
        try {
            setIsGetProducts(true);
            const newCurrentPage = currentPage - 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data.products);
            setCurrentPageForProducts(newCurrentPage);
            setIsGetProducts(false);
        }
        catch (err) {
            throw err;
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetProducts(true);
            const newCurrentPage = currentPage + 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data.products);
            setCurrentPageForProducts(newCurrentPage);
            setIsGetProducts(false);
        }
        catch (err) {
            throw err;
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetProducts(true);
            setAllProductsInsideThePage((await getAllProductsInsideThePage(pageNumber, pageSize, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data.products);
            setCurrentPageForProducts(pageNumber);
            setIsGetProducts(false);
        }
        catch (err) {
            throw err;
        }
    }

    const searchOnProduct = async (e, filters, sortDetails) => {
        try {
            e.preventDefault();
            setIsGetProducts(true);
            setCurrentPageForProducts(1);
            let filtersAsQuery = getFiltersAsQuery(filters);
            const result = await getProductsCount(filtersAsQuery);
            if (result.data > 0) {
                setAllProductsInsideThePage((await getAllProductsInsideThePage(1, pageSize, filtersAsQuery, getSortDetailsAsQuery(sortDetails))).data.products);
                setTotalPagesCountForProducts(Math.ceil(result.data / pageSize));
                setIsGetProducts(false);
            } else {
                setAllProductsInsideThePage([]);
                setTotalPagesCountForProducts(0);
                setIsGetProducts(false);
            }
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
                <title>{t(process.env.storeName)} - {t("Products By Category")}</title>
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
                            <motion.h1 className="section-name text-center mt-4 mb-5 text-white h3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Last Added Products")} : {categoryInfo.name}</motion.h1>
                            <div className="row">
                                {isGetSubCategories && <div className="col-xl-3">
                                    {isGetSubCategories && <SectionLoader />}
                                </div>}
                                {!isGetSubCategories && allSubCategoriesInsideThePage.length > 0 && <div className="col-xl-3">
                                    <SubCategoriesForParentSidBar subCategories={allSubCategoriesInsideThePage} />
                                </div>}
                                <div className={`${!isGetSubCategories && allSubCategoriesInsideThePage.length === 0 ? "col-xl-12" : "col-xl-9"}`}>
                                    {isExistProductsInDBInGeneral && <div className="row filters-and-sorting-box mb-4">
                                        <div className="col-xs-12 col-md-6">
                                            <form className="search-form">
                                                <div className="product-name-field-box">
                                                    <input
                                                        type="text"
                                                        placeholder={t("Please Enter The name Of The Product You Want To Search For")}
                                                        className="form-control"
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
                                    {!isGetProducts && allProductsInsideThePage.length === 0 && <NotFoundError errorMsg={t(!isExistProductsInDBInGeneral ? "Sorry, Not Found Any Products Now !!" : "Sorry, Not Found Any Products Related In This Name !!")} />}
                                    <div className="row products-box pt-4 pb-4">
                                        {!isGetProducts && allProductsInsideThePage.length > 0 && allProductsInsideThePage.map((product) => (
                                            <motion.div className="col-xs-12 col-lg-6 col-xl-4 mb-5" key={product._id} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
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
                                            </motion.div>
                                        ))}
                                        {totalPagesCountForProducts > 1 &&
                                            <PaginationBar
                                                totalPagesCount={totalPagesCountForProducts}
                                                currentPage={currentPageForProducts}
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
                        countryAsProperty: "kuwait",
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
                countryAsProperty: "kuwait",
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
            countryAsProperty: "kuwait",
        },
    }
}