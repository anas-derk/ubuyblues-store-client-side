import Head from "next/head";
import Link from "next/link";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useEffect, useState } from "react";
import axios from "axios";
import { BsTrash, BsClock } from "react-icons/bs";
import { FaCheck } from 'react-icons/fa';
import { useRouter } from "next/router";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { useTranslation } from "react-i18next";
import PaginationBar from "@/components/PaginationBar";
import Footer from "@/components/Footer";
import { getCurrencyNameByCountry, getUSDPriceAgainstCurrency } from "../../../../public/global_functions/prices";
import { getUserInfo, handleSelectUserLanguage, getInitialStateForElementBeforeAnimation, getAnimationSettings } from "../../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";
import SectionLoader from "@/components/SectionLoader";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import ConfirmDeleteAllBox from "@/components/ConfirmDeleteAllBox";
import ErrorPopup from "@/components/ErrorPopup";

export default function CustomerFavoriteProductsList({ countryAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [allFavoriteProductsInsideThePage, setAllFavoriteProductsInsideThePage] = useState([]);

    const [isGetFavoriteProducts, setIsGetFavoriteProducts] = useState(true);

    const [selectedFavoriteProduct, setSelectedFavoriteProduct] = useState(-1);

    const [waitMsg, setWaitMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [isDisplayErrorPopup, setIsDisplayErrorPopup] = useState(false);

    const [isDisplayConfirmDeleteAllBox, setIsDisplayConfirmDeleteAllBox] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        customerId: "",
    });

    const pageSize = 2;

    const router = useRouter();

    const { t, i18n } = useTranslation();

    const productsCountInFavorite = useSelector(state => state.productsCountInFavorite);

    const dispatch = useDispatch();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        setIsLoadingPage(true);
        getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(getCurrencyNameByCountry(countryAsProperty));
            if (!isGetFavoriteProducts) {
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
                    if (!result.error) {
                        setFilters({ ...filters, customerId: result.data._id });
                        const result2 = (await getAllFavoriteProductsInsideThePage(1, pageSize, `customerId=${result.data._id}`)).data;
                        setAllFavoriteProductsInsideThePage(result2.favoriteProducts);
                        setTotalPagesCount(Math.ceil(result2.favoriteProductsCount / pageSize));
                        setWindowInnerWidth(window.innerWidth);
                        window.addEventListener("resize", () => {
                            setWindowInnerWidth(window.innerWidth);
                        });
                        setIsGetFavoriteProducts(false);
                    } else {
                        localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                        await router.replace("/auth");
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                        await router.replace("/auth");
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        } else {
            router.replace("/auth");
        }
    }, []);

    useEffect(() => {
        if (!isGetFavoriteProducts) {
            setIsLoadingPage(false);
        }
    }, [isGetFavoriteProducts]);

    const getAllFavoriteProductsInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/favorite-products/all-favorite-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&language=${i18n.language}&${filters ? filters : ""}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE),
                }
            })).data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getPreviousPage = async () => {
        try {
            setIsGetFavoriteProducts(true);
            const newCurrentPage = currentPage - 1;
            setAllFavoriteProductsInsideThePage((await getAllFavoriteProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data.favoriteProducts);
            setCurrentPage(newCurrentPage);
            setIsGetFavoriteProducts(false);
        }
        catch (err) {
            throw err;
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetFavoriteProducts(true);
            const newCurrentPage = currentPage + 1;
            setAllFavoriteProductsInsideThePage((await getAllFavoriteProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data.favoriteProducts);
            setCurrentPage(newCurrentPage);
            setIsGetFavoriteProducts(false);
        }
        catch (err) {
            throw err;
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetFavoriteProducts(true);
            setAllFavoriteProductsInsideThePage((await getAllFavoriteProductsInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data.favoriteProducts);
            setCurrentPage(pageNumber);
            setIsGetFavoriteProducts(false);
        }
        catch (err) {
            throw err;
        }
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.customerId) filteringString += `customerId=${filters.customerId}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const deleteProductFromFavoriteUserProducts = async (favoriteProductIndex) => {
        try {
            setWaitMsg("Please Wait");
            setSelectedFavoriteProduct(favoriteProductIndex);
            const result = await axios.delete(`${process.env.BASE_API_URL}/favorite-products/${allFavoriteProductsInsideThePage[favoriteProductIndex].productId}?language=${i18n.language}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE)
                }
            });
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Success Process");
                let successDeletingFavoriteProductMsgTimeOut = setTimeout(async () => {
                    dispatch({
                        type: "(Add / Delete) (To / From ) Favorite",
                        productsCountInFavorite: productsCountInFavorite - 1
                    });
                    setSuccessMsg("");
                    setAllFavoriteProductsInsideThePage(allFavoriteProductsInsideThePage.filter((favoriteProduct, index) => index !== favoriteProductIndex));
                    setSelectedFavoriteProduct(-1);
                    clearTimeout(successDeletingFavoriteProductMsgTimeOut);
                }, 1500);
            } else {
                setErrorMsg(result.msg);
                setIsDisplayErrorPopup(true);
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                await router.replace("/login");
            }
            else {
                setWaitMsg("");
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeat The Process !!");
                setIsDisplayErrorPopup(true);
            }
        }
    }

    const deleteAllFavoriteProducts = async () => {
        try {
            setWaitMsg("Please Wait");
            const result = (await axios.delete(`${process.env.BASE_API_URL}/favorite-products/all-favorite-products?language=${i18n.language}`,
                {
                    headers: {
                        Authorization: localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE),
                    }
                }
            )).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg(result.msg);
                let successDeletingFavoriteProductMsgTimeOut = setTimeout(async () => {
                    setSuccessMsg("");
                    setAllFavoriteProductsInsideThePage([]);
                    setTotalPagesCount(0);
                    setIsDisplayConfirmDeleteAllBox(false);
                    clearTimeout(successDeletingFavoriteProductMsgTimeOut);
                }, 3000);
            }
            else {
                setErrorMsg(result.msg);
                setIsDisplayErrorPopup(true);
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                await router.replace("/login");
            }
            else {
                setWaitMsg("");
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeat The Process !!");
                setIsDisplayErrorPopup(true);
            }
        }
    }

    return (
        <div className="customer-favorite-products-list customer-dashboard customer-products-list">
            <Head>
                <title>{t(process.env.STORE_NAME)} - {t("Customer Favorite Products")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content page pt-5">
                    {isDisplayConfirmDeleteAllBox && <ConfirmDeleteAllBox
                        dataNames={t("Favorite Products")}
                        setIsDisplayConfirmDeleteAllBox={setIsDisplayConfirmDeleteAllBox}
                        deleteAll={deleteAllFavoriteProducts}
                        waitMsg={waitMsg}
                        successMsg={successMsg}
                        errorMsg={errorMsg}
                    />}
                    {isDisplayErrorPopup && <ErrorPopup errorMsg={t(errorMsg)} setIsDisplayErrorPopup={setIsDisplayErrorPopup} />}
                    <div className="container-fluid align-items-center pb-4">
                        <div className="row align-items-center">
                            <div className="col-xl-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <div className="col-xl-9">
                                {allFavoriteProductsInsideThePage.length > 0 && !isGetFavoriteProducts && <section className="favorite-products-list-for-user data-box text-center">
                                    {!isDisplayConfirmDeleteAllBox && <button className="btn btn-danger mb-4" onClick={() => setIsDisplayConfirmDeleteAllBox(true)}>{t("Delete All Favorite Products")}</button>}
                                    {windowInnerWidth > 991 ? <table className="favorite-products-table-for-user data-table mb-4 w-100">
                                        <motion.thead initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <tr>
                                                <th>{t("Product")}</th>
                                                <th>{t("Unit Price")}</th>
                                                <th>{t("Stock Status")}</th>
                                                <th>{t("Action")}</th>
                                            </tr>
                                        </motion.thead>
                                        <tbody>
                                            {allFavoriteProductsInsideThePage.map((favoriteProduct, favoriteProductIndex) => (
                                                <motion.tr key={favoriteProduct._id} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                    <td>
                                                        <img
                                                            src={`${process.env.BASE_API_URL}/${favoriteProduct.imagePath}`}
                                                            alt="favorite product image"
                                                            className="favorite-product-image d-block mx-auto mb-3"
                                                            width="100"
                                                            height="100"
                                                        />
                                                        <h6>{favoriteProduct.name[i18n.language]}</h6>
                                                    </td>
                                                    <td>{(favoriteProduct.price * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</td>
                                                    <td>{t("Stock Status")}</td>
                                                    <td>
                                                        {selectedFavoriteProduct !== favoriteProductIndex && <BsTrash className="delete-product-from-favorite-user-list-icon managment-favorite-products-icon" onClick={() => deleteProductFromFavoriteUserProducts(favoriteProductIndex)} />}
                                                        {waitMsg && selectedFavoriteProduct === favoriteProductIndex && <BsClock className="wait-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                        {successMsg && selectedFavoriteProduct === favoriteProductIndex && <FaCheck className="success-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                        <Link
                                                            href={`/product-details/${favoriteProduct.productId}`}
                                                            className="btn btn-success d-block mx-auto mb-4 global-button mt-4 w-75"
                                                        >{t("Show Product Details")}</Link>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table> : <div className="favorite-products-for-user">
                                        {allFavoriteProductsInsideThePage.map((favoriteProduct, favoriteProductIndex) => (
                                            <div className="favorite-product data-box mb-5" key={favoriteProduct._id}>
                                                <motion.h4 className="mb-3 text-white" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Product")} # {favoriteProductIndex + 1}</motion.h4>
                                                <table className="favorite-products-table-for-user data-table w-100">
                                                    <tbody>
                                                        <motion.tr initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                            <th>{t("Product")}</th>
                                                            <td>
                                                                <img
                                                                    src={`${process.env.BASE_API_URL}/${favoriteProduct.imagePath}`}
                                                                    alt="favorite product image"
                                                                    className="favorite-product-image d-block mx-auto mb-3"
                                                                    width="100"
                                                                    height="100"
                                                                />
                                                                <h6>{favoriteProduct.name}</h6>
                                                            </td>
                                                        </motion.tr>
                                                        <motion.tr initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                            <th>{t("Unit Price")}</th>
                                                            <td>{(favoriteProduct.price * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</td>
                                                        </motion.tr>
                                                        <motion.tr initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                            <th>{t("Stock Status")}</th>
                                                            <td>{t("Stock Status")}</td>
                                                        </motion.tr>
                                                        <motion.tr initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                            <th>{t("Action")}</th>
                                                            <td>
                                                                {selectedFavoriteProduct !== favoriteProductIndex && <BsTrash className="delete-product-from-favorite-user-list-icon managment-favorite-products-icon" onClick={() => deleteProductFromFavoriteUserProducts(favoriteProductIndex)} />}
                                                                {waitMsg && selectedFavoriteProduct === favoriteProductIndex && <BsClock className="wait-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                                {successMsg && selectedFavoriteProduct === favoriteProductIndex && <FaCheck className="success-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                                <Link
                                                                    href={`/product-details/${favoriteProduct._id}`}
                                                                    className="btn btn-success d-block mx-auto mb-4 mt-4 w-75"
                                                                >{t("Show Details")}</Link>
                                                            </td>
                                                        </motion.tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>}
                                </section>}
                                {allFavoriteProductsInsideThePage.length === 0 && !isGetFavoriteProducts && <NotFoundError errorMsg={t("Sorry, Can't Find Any Favorite Products For You !!")} />}
                                {isGetFavoriteProducts && <SectionLoader />}
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
                        </div>
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}

export async function getServerSideProps({ query }) {
    const allowedCountries = ["kuwait", "germany", "turkey"];
    if (query.country) {
        if (!allowedCountries.includes(query.country)) {
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
        if (Object.keys(query).filter((key) => key !== "country").length > 1) {
            return {
                redirect: {
                    permanent: false,
                    destination: `/?country=${query.country}`,
                },
                props: {
                    countryAsProperty: query.country,
                },
            }
        }
        return {
            props: {
                countryAsProperty: query.country,
            },
        }
    }
    return {
        props: {
            countryAsProperty: "kuwait",
        },
    }
}