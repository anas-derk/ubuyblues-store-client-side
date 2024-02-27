import Head from "next/head";
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

export default function CustomerWalletProductsList() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [userId, setUserId] = useState("");

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
        const userId = localStorage.getItem("asfour-store-user-id");
        const userLanguage = localStorage.getItem("asfour-store-language");
        if (userId) {
            axios.get(`${process.env.BASE_API_URL}/users/user-info/${userId}`)
                .then(async (res) => {
                    const result = res.data;
                    if (result !== "Sorry, The User Is Not Exist !!, Please Enter Another User Id ..") {
                        setUserId(userId);
                        setFilters({ ...filters, customerId: result._id });
                        const result2 = await getWalletProductsCount(`customerId=${result._id}`);
                        if (result2 > 0) {
                            const result3 = await getAllWalletProductsInsideThePage(1, pageSize, `customerId=${result._id}`);
                            setAllWalletProductsInsideThePage(result3);
                            setTotalPagesCount(Math.ceil(result2 / pageSize));
                        }
                        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
                        setWindowInnerWidth(window.innerWidth);
                        window.addEventListener("resize", () => {
                            setWindowInnerWidth(window.innerWidth);
                        });
                        setIsLoadingPage(false);
                    } else router.push("/auth");
                })
                .catch(() => {
                    handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
                    setIsLoadingPage(false);
                    setIsErrorMsgOnLoadingThePage(true);
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
        setAllWalletProductsInsideThePage(await getAllWalletProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters)));
        setCurrentPage(newCurrentPage);
        setIsWaitGetWalletProductsStatus(false);
    }

    const getNextPage = async () => {
        setIsWaitGetWalletProductsStatus(true);
        const newCurrentPage = currentPage + 1;
        setAllWalletProductsInsideThePage(await getAllWalletProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters)));
        setCurrentPage(newCurrentPage);
        setIsWaitGetWalletProductsStatus(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsWaitGetWalletProductsStatus(true);
        setAllWalletProductsInsideThePage(await getAllWalletProductsInsideThePage(pageNumber, pageSize, getFilteringString(filters)));
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

    const deleteProductFromUserProductsWallet = async (userId, favoriteProductIndex) => {
        try {
            setIsDeletingWalletProduct(true);
            const res = await axios.delete(`${process.env.BASE_API_URL}/users/wallet-product?userId=${userId}&productId=${allWalletProductsInsideThePage[favoriteProductIndex]._id}`)
            const result = await res.data;
            setIsDeletingWalletProduct(false);
            setIsSuccessDeletingWalletProduct(true);
            let successDeletingFavoriteProductMsgTimeOut = setTimeout(() => {
                setAllWalletProductsInsideThePage(result.newFavoriteProductsList);
                setIsSuccessDeletingWalletProduct(false);
                clearTimeout(successDeletingFavoriteProductMsgTimeOut);
            }, 1500);
        }
        catch (err) {
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
                                            {allWalletProductsInsideThePage.map((favoriteProduct, favoriteProductIndex) => (
                                                <tr key={favoriteProduct._id}>
                                                    <td>
                                                        <img
                                                            src={`${process.env.BASE_API_URL}/${favoriteProduct.imagePath}`}
                                                            alt="wallet product image"
                                                            className="wallet-product-image d-block mx-auto mb-3"
                                                            width="100"
                                                            height="100"
                                                        />
                                                        <h6>{favoriteProduct.name}</h6>
                                                    </td>
                                                    <td>{favoriteProduct.price - favoriteProduct.discount} $</td>
                                                    <td>{t("Stock Status")}</td>
                                                    <td>
                                                        {!isDeletingWalletProduct && !isSuccessDeletingWalletProductProduct && !errorMsgOnDeletingFavoriteProduct && <BsTrash className="delete-product-from-wallet-user-list-icon managment-wallet-products-icon" onClick={() => deleteProductFromUserProductsWallet(userId, favoriteProductIndex)} />}
                                                        {isDeletingWalletProduct && <BsClock className="wait-delete-product-from-wallet-user-list-icon managment-wallet-products-icon" />}
                                                        {isSuccessDeletingWalletProductProduct && <FaCheck className="success-delete-product-from-wallet-user-list-icon managment-wallet-products-icon" />}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table> : <div className="wallet-products-for-user">
                                        {favoriteProductsListForUser.map((favoriteProduct, favoriteProductIndex) => (
                                            <div className="wallet-product data-box mb-5" key={favoriteProductsListForUser._id}>
                                                <h4 className="mb-3 text-white">{t("Product")} # {favoriteProductIndex + 1}</h4>
                                                <table className="wallet-products-table-for-user data-table w-100">
                                                    <tbody>
                                                        <tr>
                                                            <th>{t("Product")}</th>
                                                            <td>
                                                                <img
                                                                    src={`${process.env.BASE_API_URL}/${favoriteProduct.imagePath}`}
                                                                    alt="wallet product image"
                                                                    className="wallet-product-image d-block mx-auto mb-3"
                                                                    width="100"
                                                                    height="100"
                                                                />
                                                                <h6>{favoriteProduct.name}</h6>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>{t("Unit Price")}</th>
                                                            <td>{favoriteProduct.price - favoriteProduct.discount} $</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{t("Stock Status")}</th>
                                                            <td>{t("Stock Status")}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{t("Action")}</th>
                                                            <td>
                                                                {!isDeletingWalletProduct && !isSuccessDeletingWalletProductProduct && !errorMsgOnDeletingFavoriteProduct && <BsTrash className="delete-product-from-wallet-user-list-icon managment-wallet-products-icon" onClick={() => deleteProductFromUserProductsWallet(userId, favoriteProductIndex)} />}
                                                                {isDeletingWalletProduct && <BsClock className="wait-delete-product-from-wallet-user-list-icon managment-wallet-products-icon" />}
                                                                {isSuccessDeletingWalletProductProduct && <FaCheck className="success-delete-product-from-wallet-user-list-icon managment-wallet-products-icon" />}
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