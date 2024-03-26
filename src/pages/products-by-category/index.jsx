import Head from "next/head";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import validations from "../../../public/global_functions/validations";
import prices from "../../../public/global_functions/prices";
import { getProductsCount, getAllProductsInsideThePage } from "../../../public/global_functions/popular";
import ShareOptionsBox from "@/components/ShareOptionsBox";
import { RiArrowDownDoubleFill, RiArrowUpDoubleFill } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import PaginationBar from "@/components/PaginationBar";

export default function ProductByCategory({ countryAsProperty, categoryNameAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [token, setToken] = useState("");

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [isGetUserInfo, setIsGetUserInfo] = useState(true);

    const [isGetProducts, setIsGetProducts] = useState(true);

    const [favoriteProductsListForUser, setFavoriteProductsListForUser] = useState([]);

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [isDisplayShareOptionsBox, setIsDisplayShareOptionsBox] = useState(false);

    const [appearedNavigateIcon, setAppearedNavigateIcon] = useState("down");

    const [filters, setFilters] = useState({
        category: "",
    });

    const { t, i18n } = useTranslation();

    const pageSize = 3;

    useEffect(() => {
        setIsLoadingPage(true);
        prices.getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(prices.getCurrencyNameByCountry(countryAsProperty));
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
        const userToken = localStorage.getItem("asfour-store-user-token");
        if (userToken) {
            setToken(userToken);
            validations.getUserInfo(userToken)
            .then((result) => {
                if (!result.error) {
                        setFilters({ ...filters, category: categoryNameAsProperty });
                        setFavoriteProductsListForUser(result.data.favorite_products_list);
                    }
                    setIsGetUserInfo(false);
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
    }, []);

    useEffect(() => {
        window.onscroll = function () { handleScrollToUpAndDown(this) };
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
        // =============================================================================
        getProductsCount()
            .then(async (result) => {
                if (result.data > 0) {
                    setAllProductsInsideThePage((await getAllProductsInsideThePage(1, pageSize)).data);
                    setTotalPagesCount(Math.ceil(result.data / pageSize));
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
            setIsLoadingPage(false);
        }
    }, [isGetUserInfo, isGetProducts]);

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

    const getPreviousPage = async () => {
        setIsGetProducts(true);
        const newCurrentPage = currentPage - 1;
        setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsGetProducts(false);
    }

    const getNextPage = async () => {
        setIsGetProducts(true);
        const newCurrentPage = currentPage + 1;
        setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsGetProducts(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsGetProducts(true);
        setAllProductsInsideThePage((await getAllProductsInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data);
        setCurrentPage(pageNumber);
        setIsGetProducts(false);
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.customerId) filteringString += `customerId=${filters.customerId}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    return (
        <div className="home page">
            <Head>
                <title>Ubuyblues Store - Products By Category</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="navigate-to-up-button">
                    {appearedNavigateIcon === "up" && <RiArrowUpDoubleFill className="arrow-up arrow-icon" onClick={() => navigateToUpOrDown("up")} />}
                    {appearedNavigateIcon === "down" && <RiArrowDownDoubleFill className="arrow-down arrow-icon" onClick={() => navigateToUpOrDown("down")} />}
                </div>
                {/* Start Share Options Box */}
                {isDisplayShareOptionsBox && <ShareOptionsBox setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox} />}
                {/* End Share Options Box */}
                <div className="page-content">
                    <div className="container-fluid">
                        {/* Start Last Added Products By Category Name */}
                        <section className="last-added-products mb-5 pb-3" id="latest-added-products">
                            <h2 className="section-name text-center mb-4 text-white">{t("Last Added Products By Category Name")} : { categoryNameAsProperty }</h2>
                            <div className="row products-box pt-4 pb-4">
                                {allProductsInsideThePage.length > 0 && allProductsInsideThePage.map((product) => (
                                    <div className="col-xs-12 col-lg-6 col-xl-4" key={product._id}>
                                        <ProductCard
                                            product={product}
                                            setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                                            usdPriceAgainstCurrency={usdPriceAgainstCurrency}
                                            currencyNameByCountry={currencyNameByCountry}
                                            token={token}
                                            isFavoriteProductForUserAsProperty={isFavoriteProductForUser(favoriteProductsListForUser, product._id)}
                                        />
                                    </div>
                                ))}
                                {totalPagesCount > 1 && !isGetProducts &&
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
                        </section>
                        {/* End Last Added Products By Category Name */}
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
    if (query.category) {
        const allowedCountries = ["kuwait", "germany", "turkey"];
        if (query.country) {
            if (!allowedCountries.includes(query.country)) {
                return {
                    redirect: {
                        permanent: false,
                        destination: `/product-by-category?category=${query.category}`,
                    },
                    props: {
                        countryAsProperty: "kuwait",
                        categoryNameAsProperty: query.category,
                    },
                }
            }
            if (Object.keys(query).filter((key) => key !== "country" && key !== "category").length > 2) {
                return {
                    redirect: {
                        permanent: false,
                        destination: `/?country=${query.country}&category=${query.category}`,
                    },
                    props: {
                        countryAsProperty: query.country,
                        categoryNameAsProperty: query.category,
                    },
                }
            }
            return {
                props: {
                    countryAsProperty: query.country,
                    categoryNameAsProperty: query.categoryNameAsProperty,
                },
            }
        }
        return {
            props: {
                countryAsProperty: "kuwait",
                categoryNameAsProperty: query.category,
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