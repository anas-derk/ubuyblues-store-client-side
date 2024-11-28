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
import { getAnimationSettings, getInitialStateForElementBeforeAnimation, getUserInfo, handleSelectUserLanguage } from "../../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";
import SectionLoader from "@/components/SectionLoader";
import { motion } from "motion/react";

export default function CustomerWalletProductsList({ countryAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [allWalletProductsInsideThePage, setAllWalletProductsInsideThePage] = useState([]);

    const [isGetWalletProducts, setIsGetWalletProducts] = useState(true);

    const [selectedWalletProduct, setSelectedWalletProduct] = useState(-1);

    const [isDeletingWalletProduct, setIsDeletingWalletProduct] = useState(false);

    const [isSuccessDeletingWalletProductProduct, setIsSuccessDeletingWalletProduct] = useState(false);

    const [errorMsgOnDeletingWalletProduct, setErrorMsgOnDeletingWalletProduct] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        customerId: "",
    });

    const pageSize = 5;

    const router = useRouter();

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.userlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        setIsLoadingPage(true);
        getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(getCurrencyNameByCountry(countryAsProperty));
            if (!isGetWalletProducts) {
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
                    if (!result.error) {
                        setFilters({ ...filters, customerId: result.data._id });
                        const result2 = await getWalletProductsCount(`customerId=${result.data._id}`);
                        if (result2.data > 0) {
                            setAllWalletProductsInsideThePage((await getAllWalletProductsInsideThePage(1, pageSize)).data);
                            setTotalPagesCount(Math.ceil(result2.data / pageSize));
                        }
                        setIsGetWalletProducts(false);
                    } else {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                        await router.replace("/auth");
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
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
        if (!isGetWalletProducts) {
            setIsLoadingPage(false);
        }
    }, [isGetWalletProducts]);

    const getWalletProductsCount = async (filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/wallet/wallet-products-count?${filters ? filters : ""}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.userTokenNameInLocalStorage),
                }
            })).data;
        }
        catch (err) {
            throw err;
        }
    }

    const getAllWalletProductsInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/wallet/all-wallet-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&language=${i18n.language}&${filters ? filters : ""}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.userTokenNameInLocalStorage),
                }
            })).data;
        }
        catch (err) {
            throw err;
        }
    }

    const getPreviousPage = async () => {
        try {
            setIsGetWalletProducts(true);
            const newCurrentPage = currentPage - 1;
            setAllWalletProductsInsideThePage((await getAllWalletProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
            setCurrentPage(newCurrentPage);
            setIsGetWalletProducts(false);
        }
        catch (err) {
            throw err;
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetWalletProducts(true);
            const newCurrentPage = currentPage + 1;
            setAllWalletProductsInsideThePage((await getAllWalletProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
            setCurrentPage(newCurrentPage);
            setIsGetWalletProducts(false);
        }
        catch (err) {
            throw err;
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetWalletProducts(true);
            setAllWalletProductsInsideThePage((await getAllWalletProductsInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data);
            setCurrentPage(pageNumber);
            setIsGetWalletProducts(false);
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

    const deleteProductFromUserProductsWallet = async (walletProductIndex) => {
        try {
            setIsDeletingWalletProduct(true);
            await axios.delete(`${process.env.BASE_API_URL}/wallet/${allWalletProductsInsideThePage[walletProductIndex].productId}?language=${i18n.language}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.userTokenNameInLocalStorage),
                }
            });
            setIsDeletingWalletProduct(false);
            setIsSuccessDeletingWalletProduct(true);
            let successDeletingFavoriteProductMsgTimeOut = setTimeout(async () => {
                setIsSuccessDeletingWalletProduct(false);
                const result = await getWalletProductsCount();
                if (result.data > 0) {
                    setAllWalletProductsInsideThePage((await getAllWalletProductsInsideThePage(1, pageSize)).data);
                    setTotalPagesCount(Math.ceil(result.data / pageSize));
                } else {
                    setAllWalletProductsInsideThePage([]);
                    setTotalPagesCount(0);
                }
                clearTimeout(successDeletingFavoriteProductMsgTimeOut);
            }, 1500);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                await router.replace("/auth");
            }
            else {
                setIsDeletingWalletProduct(false);
                setErrorMsgOnDeletingWalletProduct(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeat The Process !!");
                let successDeletingFavoriteProductMsgTimeOut = setTimeout(() => {
                    setErrorMsgOnDeletingWalletProduct("");
                    setSelectedWalletProduct(-1);
                    clearTimeout(successDeletingFavoriteProductMsgTimeOut);
                }, 1500);
            }
        }
    }

    return (
        <div className="customer-wallet-products-list customer-dashboard customer-products-list">
            <Head>
                <title>{t(process.env.storeName)} - {t("Customer Wallet Products")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content page pt-5">
                    <div className="container-fluid  align-items-center pb-4">
                        <div className="row align-items-center">
                            <div className="col-xl-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <div className="col-xl-9">
                                {allWalletProductsInsideThePage.length > 0 && !isGetWalletProducts && <section className="wallet-products-list-for-user data-box text-center">
                                    {windowInnerWidth > 991 ? <table className="wallet-products-table-for-user data-table mb-4 w-100">
                                        <motion.thead initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <tr>
                                                <th>{t("Product")}</th>
                                                <th>{t("Unit Price")}</th>
                                                <th>{t("Stock Status")}</th>
                                                <th>{t("Action")}</th>
                                            </tr>
                                        </motion.thead>
                                        <tbody>
                                            {allWalletProductsInsideThePage.map((walletProduct, walletProductIndex) => (
                                                <motion.tr key={walletProduct.productId} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                    <td>
                                                        <img
                                                            src={`${process.env.BASE_API_URL}/${walletProduct.imagePath}`}
                                                            alt="wallet product image"
                                                            className="wallet-product-image d-block mx-auto mb-3"
                                                            width="100"
                                                            height="100"
                                                        />
                                                        <h6>{walletProduct.name}</h6>
                                                    </td>
                                                    <td>{(walletProduct.price * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</td>
                                                    <td>{t("Stock Status")}</td>
                                                    <td>
                                                        {!isDeletingWalletProduct && selectedWalletProduct !== walletProductIndex && <BsTrash className="delete-product-from-wallet-user-list-icon managment-wallet-products-icon" onClick={() => deleteProductFromUserProductsWallet(walletProductIndex)} />}
                                                        {isDeletingWalletProduct && selectedWalletProduct === walletProductIndex && <BsClock className="wait-delete-product-from-wallet-user-list-icon managment-wallet-products-icon" />}
                                                        {isSuccessDeletingWalletProductProduct && selectedWalletProduct === walletProductIndex && <FaCheck className="success-delete-product-from-wallet-user-list-icon managment-wallet-products-icon" />}
                                                        <Link
                                                            href={`/product-details/${walletProduct.productId}`}
                                                            className="btn btn-success d-block mx-auto mb-4 global-button mt-4 w-75"
                                                        >{t("Show Product Details")}</Link>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table> : <div className="wallet-products-for-user">
                                        {allWalletProductsInsideThePage.map((walletProduct, walletProductIndex) => (
                                            <div className="wallet-product data-box mb-5" key={walletProduct.productId}>
                                                <motion.h4 className="mb-3 text-white" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Product")} # {walletProductIndex + 1}</motion.h4>
                                                <table className="wallet-products-table-for-user data-table w-100">
                                                    <tbody>
                                                        <motion.tr initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                            <th>{t("Product")}</th>
                                                            <td>
                                                                <img
                                                                    src={`${process.env.BASE_API_URL}/${walletProduct.imagePath}`}
                                                                    alt="wallet product image"
                                                                    className="wallet-product-image d-block mx-auto mb-3"
                                                                    width="100"
                                                                    height="100"
                                                                />
                                                                <h6>{walletProduct.name}</h6>
                                                            </td>
                                                        </motion.tr>
                                                        <motion.tr initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                            <th>{t("Unit Price")}</th>
                                                            <td>{(walletProduct.price * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}</td>
                                                        </motion.tr>
                                                        <motion.tr initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                            <th>{t("Stock Status")}</th>
                                                            <td>{t("Stock Status")}</td>
                                                        </motion.tr>
                                                        <motion.tr initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                            <th>{t("Action")}</th>
                                                            <td>
                                                                {!isDeletingWalletProduct && !isSuccessDeletingWalletProductProduct && !errorMsgOnDeletingWalletProduct && <BsTrash className="delete-product-from-wallet-user-list-icon managment-wallet-products-icon" onClick={() => deleteProductFromUserProductsWallet(walletProductIndex)} />}
                                                                {isDeletingWalletProduct && <BsClock className="wait-delete-product-from-wallet-user-list-icon managment-wallet-products-icon" />}
                                                                {isSuccessDeletingWalletProductProduct && <FaCheck className="success-delete-product-from-wallet-user-list-icon managment-wallet-products-icon" />}
                                                                <Link
                                                                    href={`/product-details/${walletProduct.productId}`}
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
                                {allWalletProductsInsideThePage.length === 0 && !isGetWalletProducts && <NotFoundError errorMsg={t("Sorry, Can't Find Any Previous Products In Your History Wallet !!")} />}
                                {isGetWalletProducts && <SectionLoader />}
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