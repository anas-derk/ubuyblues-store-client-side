import Head from "next/head";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { getUserInfo } from "../../../public/global_functions/popular";
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

export default function ProductByCategory({ countryAsProperty, categoryIdAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [isGetUserInfo, setIsGetUserInfo] = useState(true);

    const [isGetProducts, setIsGetProducts] = useState(true);

    const [categoryInfo, setCategoryInfo] = useState({});

    const [favoriteProductsListForUserByProductsIdsAndUserId, setFavoriteProductsListForUserByProductsIdsAndUserId] = useState([]);

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [isExistProductsInDBInGeneral, setIsExistProductsInDBInGeneral] = useState(false);

    const [currentDate, setCurrentDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [isDisplayShareOptionsBox, setIsDisplayShareOptionsBox] = useState(false);

    const [sharingName, setSharingName] = useState("");

    const [sharingURL, setSharingURL] = useState("");

    const [appearedNavigateIcon, setAppearedNavigateIcon] = useState("down");

    const [filters, setFilters] = useState({
        categoryId: "",
    });

    const [sortDetails, setSortDetails] = useState({
        by: "",
        type: 1,
    });

    const [errorMsg, setErrorMsg] = useState("");

    const { t, i18n } = useTranslation();

    const pageSize = 3;

    useEffect(() => {
        setIsLoadingPage(true);
        getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(getCurrencyNameByCountry(countryAsProperty));
            if (!isGetUserInfo && !isGetProducts) {
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
                .then(async (result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                    }
                    setIsGetUserInfo(false);
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
    }, []);

    useEffect(() => {
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
    }, []);

    useEffect(() => {
        // =============================================================================
        getCategoryInfo(categoryIdAsProperty)
            .then(async (result) => {
                if (Object.keys(result.data).length > 0) {
                    setCategoryInfo(result.data);
                    result = await getProductsCount(getFiltersAsQuery({ categoryId: categoryIdAsProperty }));
                    if (result.data > 0) {
                        setTotalPagesCount(Math.ceil(result.data / pageSize));
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
                }
                setIsGetProducts(false);
            })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
        // =============================================================================
    }, []);

    useEffect(() => {
        if (!isGetUserInfo && !isGetProducts) {
            setFilters({ ...filters, categoryId: categoryIdAsProperty });
            setIsLoadingPage(false);
        }
    }, [isGetUserInfo, isGetProducts]);

    const getCategoryInfo = async (categoryId) => {
        return (await axios.get(`${process.env.BASE_API_URL}/categories/category-info/${categoryId}`)).data;
    }

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
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
        setIsGetProducts(true);
        const newCurrentPage = currentPage - 1;
        setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data.products);
        setCurrentPage(newCurrentPage);
        setIsGetProducts(false);
    }

    const getNextPage = async () => {
        setIsGetProducts(true);
        const newCurrentPage = currentPage + 1;
        setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data.products);
        setCurrentPage(newCurrentPage);
        setIsGetProducts(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsGetProducts(true);
        setAllProductsInsideThePage((await getAllProductsInsideThePage(pageNumber, pageSize, getFiltersAsQuery(filters), getSortDetailsAsQuery(sortDetails))).data.products);
        setCurrentPage(pageNumber);
        setIsGetProducts(false);
    }

    const searchOnProduct = async (e, filters, sortDetails) => {
        try {
            e.preventDefault();
            setIsGetProducts(true);
            setCurrentPage(1);
            let filtersAsQuery = getFiltersAsQuery(filters);
            const result = await getProductsCount(filtersAsQuery);
            if (result.data > 0) {
                setAllProductsInsideThePage((await getAllProductsInsideThePage(1, pageSize, filtersAsQuery, getSortDetailsAsQuery(sortDetails))).data.products);
                setTotalPagesCount(Math.ceil(result.data / pageSize));
                setIsGetProducts(false);
            } else {
                setAllProductsInsideThePage([]);
                setTotalPagesCount(0);
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
        <div className="home page d-flex flex-column justify-content-center align-items-center">
            <Head>
                <title>{t("Ubuyblues Store")} - {t("Products By Category")}</title>
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
                <div className="page-content">
                    <div className="container-fluid">
                        {/* Start Last Added Products By Category Id */}
                        {Object.keys(categoryInfo).length > 0 ? <section className="last-added-products mb-5 pb-3" id="latest-added-products">
                            <h2 className="section-name text-center mt-4 mb-5 text-white">{t("Last Added Products By Category Name")} : ( {categoryInfo.name} )</h2>
                            {isExistProductsInDBInGeneral && <div className="row filters-and-sorting-box mb-4">
                                <div className="col-xs-12 col-md-6">
                                    <form className="search-form">
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
                                    <form className="sort-form">
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
                            <div className="row products-box pt-4 pb-4">
                                {!isGetProducts && allProductsInsideThePage.length > 0 && allProductsInsideThePage.map((product) => (
                                    <div className="col-xs-12 col-lg-6 col-xl-4 mb-5" key={product._id}>
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
                                        section="products"
                                    />}
                            </div>
                        </section> : <NotFoundError errorMsg={t("Sorry, This Category Is Not Exist !!")} />}
                        {/* End Last Added Products By Category Id */}
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div >
    )
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