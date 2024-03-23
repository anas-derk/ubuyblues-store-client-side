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
import { PiSmileySad } from "react-icons/pi";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { useTranslation } from "react-i18next";
import PaginationBar from "@/components/PaginationBar";
import validations from "../../../../public/global_functions/validations";

export default function CustomerWalletProductsList() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [token, setToken] = useState(false);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [allWalletProductsInsideThePage, setAllWalletProductsInsideThePage] = useState([]);

    const [isWaitGetWalletProductsStatus, setIsWaitGetWalletProductsStatus] = useState(false);

    const [isDeletingWalletProduct, setIsDeletingWalletProduct] = useState(false);

    const [isSuccessDeletingWalletProductProduct, setIsSuccessDeletingWalletProduct] = useState(false);

    const [errorMsgOnDeletingFavoriteProduct, setErrorMsgOnDeletingFavoriteProduct] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        customerId: "",
    });

    const pageSize = 10;

    const router = useRouter();

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem("asfour-store-language");
        const userToken = localStorage.getItem("asfour-store-user-token");
        if (userToken) {
            validations.getUserInfo(userToken)
                .then(async (result) => {
                    if (!result.error) {
                        setToken(userToken);
                        setFilters({ ...filters, customerId: result.data._id });
                        const result2 = await getWalletProductsCount(`customerId=${result.data._id}`);
                        if (result2.data > 0) {
                            setAllWalletProductsInsideThePage((await getAllWalletProductsInsideThePage(1, pageSize, `customerId=${result.data._id}`)).data);
                            setTotalPagesCount(Math.ceil(result2.data / pageSize));
                        }
                        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
                        setWindowInnerWidth(window.innerWidth);
                        window.addEventListener("resize", () => {
                            setWindowInnerWidth(window.innerWidth);
                        });
                        setIsLoadingPage(false);
                    } else {
                        localStorage.removeItem("asfour-store-user-token");
                        await router.push("/auth");
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem("asfour-store-user-token");
                        await router.push("/auth");
                    } else {
                        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else {
            router.push("/auth");
        }
    }, []);

    const getWalletProductsCount = async (filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/users/wallet-products-count?${filters ? filters : ""}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllWalletProductsInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/users/all-wallet-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getPreviousPage = async () => {
        setIsWaitGetWalletProductsStatus(true);
        const newCurrentPage = currentPage - 1;
        setAllWalletProductsInsideThePage((await getAllWalletProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsWaitGetWalletProductsStatus(false);
    }

    const getNextPage = async () => {
        setIsWaitGetWalletProductsStatus(true);
        const newCurrentPage = currentPage + 1;
        setAllWalletProductsInsideThePage((await getAllWalletProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsWaitGetWalletProductsStatus(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsWaitGetWalletProductsStatus(true);
        setAllWalletProductsInsideThePage((await getAllWalletProductsInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data);
        setCurrentPage(pageNumber);
        setIsWaitGetWalletProductsStatus(false);
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.customerId) filteringString += `customerId=${filters.customerId}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    const deleteProductFromUserProductsWallet = async (walletProductIndex) => {
        try {
            setIsDeletingWalletProduct(true);
            const res = await axios.delete(`${process.env.BASE_API_URL}/users/wallet-product?productId=${allWalletProductsInsideThePage[walletProductIndex].productId}`, {
                headers: {
                    Authorization: token,
                }
            })
            const result = await res.data;
            setIsDeletingWalletProduct(false);
            setIsSuccessDeletingWalletProduct(true);
            let successDeletingFavoriteProductMsgTimeOut = setTimeout(() => {
                setAllWalletProductsInsideThePage(result.data.newProductsWallet);
                setIsSuccessDeletingWalletProduct(false);
                clearTimeout(successDeletingFavoriteProductMsgTimeOut);
            }, 1500);
        }
        catch (err) {
            console.log(err);
            if (err?.response?.data?.msg === "Unauthorized Error") {
                await router.push("/auth");
                return;
            }
            setIsDeletingWalletProduct(false);
            setErrorMsgOnDeletingFavoriteProduct("Sorry, Someting Went Wrong, Please Repeate The Proccess !!");
            let successDeletingFavoriteProductMsgTimeOut = setTimeout(() => {
                setErrorMsgOnDeletingFavoriteProduct("");
                clearTimeout(successDeletingFavoriteProductMsgTimeOut);
            }, 1500);
        }
    }

    return (
        <div className="customer-wallet-products-list customer-dashboard page">
            <Head>
                <title>Ubuyblues Store - Customer Favorite Products List</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content d-flex align-items-center">
                    <div className="container-fluid">
                        <div className="row align-items-center">
                            <div className="col-xl-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <div className="col-xl-9">
                                {allWalletProductsInsideThePage.length > 0 && !isWaitGetWalletProductsStatus && <section className="wallet-products-list-for-user data-box text-center">
                                    {windowInnerWidth > 991 ? <table className="wallet-products-table-for-user data-table mb-4 w-100">
                                        <thead>
                                            <tr>
                                                <th>{t("Product")}</th>
                                                <th>{t("Unit Price")}</th>
                                                <th>{t("Stock Status")}</th>
                                                <th>{t("Action")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allWalletProductsInsideThePage.map((walletProduct, walletProductIndex) => (
                                                <tr key={walletProduct.productId}>
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
                                                    <td>{walletProduct.price - walletProduct.discount} $</td>
                                                    <td>{t("Stock Status")}</td>
                                                    <td>
                                                        {!isDeletingWalletProduct && !isSuccessDeletingWalletProductProduct && !errorMsgOnDeletingFavoriteProduct && <BsTrash className="delete-product-from-wallet-user-list-icon managment-wallet-products-icon" onClick={() => deleteProductFromUserProductsWallet(walletProductIndex)} />}
                                                        {isDeletingWalletProduct && <BsClock className="wait-delete-product-from-wallet-user-list-icon managment-wallet-products-icon" />}
                                                        {isSuccessDeletingWalletProductProduct && <FaCheck className="success-delete-product-from-wallet-user-list-icon managment-wallet-products-icon" />}
                                                        <Link
                                                            href={`/product-details/${walletProduct._id}`}
                                                            className="btn btn-success d-block mx-auto mb-4 global-button mt-4 w-75"
                                                        >{t("Show Product Details")}</Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table> : <div className="wallet-products-for-user">
                                        {allWalletProductsInsideThePage.map((walletProduct, walletProductIndex) => (
                                            <div className="wallet-product data-box mb-5" key={walletProduct.productId}>
                                                <h4 className="mb-3 text-white">{t("Product")} # {walletProductIndex + 1}</h4>
                                                <table className="wallet-products-table-for-user data-table w-100">
                                                    <tbody>
                                                        <tr>
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
                                                        </tr>
                                                        <tr>
                                                            <th>{t("Unit Price")}</th>
                                                            <td>{walletProduct.price - walletProduct.discount} $</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{t("Stock Status")}</th>
                                                            <td>{t("Stock Status")}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{t("Action")}</th>
                                                            <td>
                                                                {!isDeletingWalletProduct && !isSuccessDeletingWalletProductProduct && !errorMsgOnDeletingFavoriteProduct && <BsTrash className="delete-product-from-wallet-user-list-icon managment-wallet-products-icon" onClick={() => deleteProductFromUserProductsWallet(walletProductIndex)} />}
                                                                {isDeletingWalletProduct && <BsClock className="wait-delete-product-from-wallet-user-list-icon managment-wallet-products-icon" />}
                                                                {isSuccessDeletingWalletProductProduct && <FaCheck className="success-delete-product-from-wallet-user-list-icon managment-wallet-products-icon" />}
                                                                <Link
                                                                    href={`/product-details/${walletProduct._id}`}
                                                                    className="btn btn-success d-block mx-auto mb-4 global-button mt-4 w-75"
                                                                >{t("Show Product Details")}</Link>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>}
                                </section>}
                                {allWalletProductsInsideThePage.length === 0 && !isWaitGetWalletProductsStatus && <section className="not-found-any-wallet-products-for-user text-center">
                                    <PiSmileySad className="sorry-icon mb-5" />
                                    <h1 className="h4">{t("Sorry, Can't Find Any Previous Products In Your History Wallet !!")}</h1>
                                </section>}
                                {isWaitGetWalletProductsStatus && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                                    <span className="loader-table-data"></span>
                                </div>}
                                {totalPagesCount > 0 && !isWaitGetWalletProductsStatus &&
                                    <PaginationBar
                                        totalPagesCount={totalPagesCount}
                                        currentPage={currentPage}
                                        getPreviousPage={getPreviousPage}
                                        getNextPage={getNextPage}
                                        getSpecificPage={getSpecificPage}
                                    />
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}