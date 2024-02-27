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

export default function CustomerFavoriteProductsList() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [userId, setUserId] = useState("");

    const [allFavoriteProductsInsideThePage, setAllFavoriteProductsInsideThePage] = useState([]);

    const [isWaitGetFavoriteProductsStatus, setIsWaitGetFavoriteProductsStatus] = useState(false);

    const [isDeletingFavoriteProduct, setIsDeletingFavoriteProduct] = useState(false);

    const [isSuccessDeletingFavoriteProduct, setIsSuccessDeletingFavoriteProduct] = useState(false);

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
                        const result2 = await getFavoriteProductsCount(`customerId=${result._id}`);
                        if (result2 > 0) {
                            const result3 = await getAllFavoriteProductsInsideThePage(1, pageSize, `customerId=${result._id}`);
                            setAllFavoriteProductsInsideThePage(result3);
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

    const getFavoriteProductsCount = async (filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/users/favorite-products-count?${filters ? filters : ""}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllFavoriteProductsInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/users/all-favorite-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getPreviousPage = async () => {
        setIsWaitGetFavoriteProductsStatus(true);
        const newCurrentPage = currentPage - 1;
        setAllFavoriteProductsInsideThePage(await getAllFavoriteProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters)));
        setCurrentPage(newCurrentPage);
        setIsWaitGetFavoriteProductsStatus(false);
    }

    const getNextPage = async () => {
        setIsWaitGetFavoriteProductsStatus(true);
        const newCurrentPage = currentPage + 1;
        setAllFavoriteProductsInsideThePage(await getAllFavoriteProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters)));
        setCurrentPage(newCurrentPage);
        setIsWaitGetFavoriteProductsStatus(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsWaitGetFavoriteProductsStatus(true);
        setAllFavoriteProductsInsideThePage(await getAllFavoriteProductsInsideThePage(pageNumber, pageSize, getFilteringString(filters)));
        setCurrentPage(pageNumber);
        setIsWaitGetFavoriteProductsStatus(false);
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

    const deleteProductFromFavoriteUserProducts = async (userId, favoriteProductIndex) => {
        try {
            setIsDeletingFavoriteProduct(true);
            const res = await axios.delete(`${process.env.BASE_API_URL}/users/favorite-product?userId=${userId}&productId=${allFavoriteProductsInsideThePage[favoriteProductIndex]._id}`)
            const result = await res.data;
            setIsDeletingFavoriteProduct(false);
            setIsSuccessDeletingFavoriteProduct(true);
            let successDeletingFavoriteProductMsgTimeOut = setTimeout(() => {
                setAllFavoriteProductsInsideThePage(result.newFavoriteProductsList);
                setIsSuccessDeletingFavoriteProduct(false);
                clearTimeout(successDeletingFavoriteProductMsgTimeOut);
            }, 1500);
        }
        catch (err) {
            setIsDeletingFavoriteProduct(false);
            setErrorMsgOnDeletingFavoriteProduct("Sorry, Someting Went Wrong, Please Repeate The Proccess !!");
            let successDeletingFavoriteProductMsgTimeOut = setTimeout(() => {
                setErrorMsgOnDeletingFavoriteProduct("");
                clearTimeout(successDeletingFavoriteProductMsgTimeOut);
            }, 1500);
        }
    }

    return (
        <div className="customer-favorite-products-list customer-dashboard page">
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
                                {allFavoriteProductsInsideThePage.length > 0 && !isWaitGetFavoriteProductsStatus && <section className="favorite-products-list-for-user data-box text-center">
                                    {windowInnerWidth > 991 ? <table className="favorite-products-table-for-user data-table mb-4 w-100">
                                        <thead>
                                            <tr>
                                                <th>{t("Product")}</th>
                                                <th>{t("Unit Price")}</th>
                                                <th>{t("Stock Status")}</th>
                                                <th>{t("Action")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allFavoriteProductsInsideThePage.map((favoriteProduct, favoriteProductIndex) => (
                                                <tr key={favoriteProduct._id}>
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
                                                    <td>{favoriteProduct.price - favoriteProduct.discount} $</td>
                                                    <td>{t("Stock Status")}</td>
                                                    <td>
                                                        {!isDeletingFavoriteProduct && !isSuccessDeletingFavoriteProduct && !errorMsgOnDeletingFavoriteProduct && <BsTrash className="delete-product-from-favorite-user-list-icon managment-favorite-products-icon" onClick={() => deleteProductFromFavoriteUserProducts(userId, favoriteProductIndex)} />}
                                                        {isDeletingFavoriteProduct && <BsClock className="wait-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                        {isSuccessDeletingFavoriteProduct && <FaCheck className="success-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table> : <div className="favorite-products-for-user">
                                        {favoriteProductsListForUser.map((favoriteProduct, favoriteProductIndex) => (
                                            <div className="favorite-product data-box mb-5" key={favoriteProductsListForUser._id}>
                                                <h4 className="mb-3 text-white">{t("Product")} # {favoriteProductIndex + 1}</h4>
                                                <table className="favorite-products-table-for-user data-table w-100">
                                                    <tbody>
                                                        <tr>
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
                                                                {!isDeletingFavoriteProduct && !isSuccessDeletingFavoriteProduct && !errorMsgOnDeletingFavoriteProduct && <BsTrash className="delete-product-from-favorite-user-list-icon managment-favorite-products-icon" onClick={() => deleteProductFromFavoriteUserProducts(userId, favoriteProductIndex)} />}
                                                                {isDeletingFavoriteProduct && <BsClock className="wait-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                                {isSuccessDeletingFavoriteProduct && <FaCheck className="success-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>}
                                </section>}
                                {allFavoriteProductsInsideThePage.length === 0 && !isWaitGetFavoriteProductsStatus && <section className="not-found-any-favorite-products-for-user text-center">
                                    <PiSmileySad className="sorry-icon mb-5" />
                                    <h1 className="h4">{t("Sorry, Can't Find Any Favorite Products For You !!")}</h1>
                                </section>}
                                {isWaitGetFavoriteProductsStatus && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                                    <span className="loader-table-data"></span>
                                </div>}
                                {totalPagesCount > 0 && !isWaitGetFavoriteProductsStatus &&
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