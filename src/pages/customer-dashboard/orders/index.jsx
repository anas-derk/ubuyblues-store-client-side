import Head from "next/head";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LoaderPage from "@/components/LoaderPage";
import Link from "next/link";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import axios from "axios";
import { useTranslation } from "react-i18next";
import PaginationBar from "@/components/PaginationBar";
import validations from "../../../../public/global_functions/validations";

export default function CustomerOrders() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [userInfo, setUserInfo] = useState(true);

    const [allOrdersInsideThePage, setAllOrdersInsideThePage] = useState([]);

    const [isFilteringOrdersStatus, setIsFilteringOrdersStatus] = useState(false);

    const [errMsg, setErrorMsg] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        orderNumber: -1,
        customerId: "",
        status: "",
    });

    const router = useRouter();

    const { t, i18n } = useTranslation();

    const pageSize = 5;

    useEffect(() => {
        const userLanguage = localStorage.getItem("asfour-store-language");
        const userToken = localStorage.getItem("asfour-store-user-token");
        if (userToken) {
            validations.getUserInfo(userToken)
                .then(async (result) => {
                    if (!result.error) {
                        setUserInfo(result);
                        setFilters({ ...filters, customerId: result.data._id });
                        const result2 = await getOrdersCount(`customerId=${result.data._id}`);
                        if (result2.data > 0) {
                            setAllOrdersInsideThePage((await getAllOrdersInsideThePage(1, pageSize, `customerId=${result.data._id}`)).data);
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

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    const getOrdersCount = async (filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/orders/orders-count?${filters ? filters : ""}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllOrdersInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/orders/all-orders-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getDateFormated = (orderedDate) => {
        let orderedDateInDateFormat = new Date(orderedDate);
        const year = orderedDateInDateFormat.getFullYear();
        const month = orderedDateInDateFormat.getMonth() + 1;
        const day = orderedDateInDateFormat.getDate();
        orderedDateInDateFormat = `${year} / ${month} / ${day}`;
        return orderedDateInDateFormat;
    }

    const getPreviousPage = async () => {
        setIsFilteringOrdersStatus(true);
        const newCurrentPage = currentPage - 1;
        setAllOrdersInsideThePage((await getAllOrdersInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsFilteringOrdersStatus(false);
    }

    const getNextPage = async () => {
        setIsFilteringOrdersStatus(true);
        const newCurrentPage = currentPage + 1;
        setAllOrdersInsideThePage((await getAllOrdersInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsFilteringOrdersStatus(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsFilteringOrdersStatus(true);
        setAllOrdersInsideThePage((await getAllOrdersInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data);
        setCurrentPage(pageNumber);
        setIsFilteringOrdersStatus(false);
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.customerId) filteringString += `customerId=${filters.customerId}&`;
        if (filters.orderNumber !== -1 && filters.orderNumber) filteringString += `orderNumber=${filters.orderNumber}&`;
        if (filters.status) filteringString += `status=${filters.status}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const filterOrders = async () => {
        try {
            setIsFilteringOrdersStatus(true);
            const filteringString = getFilteringString(filters);
            const result = await getOrdersCount(filteringString);
            if (result.data > 0) {
                setAllOrdersInsideThePage((await getAllOrdersInsideThePage(1, pageSize, filteringString)).data);
                setTotalPagesCount(Math.ceil(result.data / pageSize));
                setIsFilteringOrdersStatus(false);
            } else {
                setAllOrdersInsideThePage([]);
                setTotalPagesCount(0);
                setIsFilteringOrdersStatus(false);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                await router.push("/auth");
                return;
            }
            setIsFilteringOrdersStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Try Again The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg(false);
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="customer-orders-managment customer-dashboard page pb-4">
            <Head>
                <title>Ubuyblues Store - Customer Orders</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content d-flex align-items-center">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xl-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <div className="col-xl-9">
                                <div className="customer-orders">
                                    <section className="filters mb-3 border-3 border-white p-3 text-start text-white">
                                        <h5 className="section-name fw-bold text-center">{t("Filters")} : </h5>
                                        <hr />
                                        <div className="row mb-4">
                                            <div className="col-xl-6 d-flex align-items-center">
                                                <input
                                                    type="number"
                                                    className="p-2"
                                                    placeholder={t("Pleae Enter Order Number")}
                                                    min="1"
                                                    max={allOrdersInsideThePage.length}
                                                    onChange={(e) => setFilters({ ...filters, orderNumber: e.target.valueAsNumber ? e.target.valueAsNumber : -1 })}
                                                />
                                            </div>
                                            <div className="col-xl-6 d-flex align-items-center">
                                                <select
                                                    className="select-order-status p-2"
                                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                                >
                                                    <option value="" hidden>{t("Pleae Enter Status")}</option>
                                                    <option value="">{t("All")}</option>
                                                    <option value="pending">{t("Pending")}</option>
                                                    <option value="shipping">{t("Shipping")}</option>
                                                    <option value="completed">{t("Completed")}</option>
                                                </select>
                                            </div>
                                        </div>
                                        {!isFilteringOrdersStatus && <button
                                            className="btn btn-success d-block w-25 mx-auto mt-2"
                                            onClick={() => filterOrders()}
                                        >
                                            {t("Filter")}
                                        </button>}
                                        {isFilteringOrdersStatus && <button
                                            className="btn btn-success d-block w-25 mx-auto mt-2"
                                            disabled
                                        >
                                            {t("Filtering")} ...
                                        </button>}
                                    </section>
                                    {allOrdersInsideThePage.length > 0 && !isFilteringOrdersStatus && !errMsg && <section className="orders-data-box p-3 data-box">
                                        {windowInnerWidth > 991 ? <table className="orders-data-table customer-table data-table mb-4 w-100">
                                            <thead>
                                                <tr>
                                                    <th>{t("Order Number")}</th>
                                                    <th>{t("Checkout Status")}</th>
                                                    <th>{t("Status")}</th>
                                                    <th>{t("Order Total Amount")}</th>
                                                    <th>{t("Added Date")}</th>
                                                    <th>{t("Action")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allOrdersInsideThePage.map((order) => (
                                                    <tr key={order._id}>
                                                        <td>{order.orderNumber}</td>
                                                        <td>{t(order.checkout_status)}</td>
                                                        <td className="fw-bold">
                                                            {t(order.status)}
                                                        </td>
                                                        <td>
                                                            {order.order_amount}
                                                        </td>
                                                        <td>{getDateFormated(order.added_date)}</td>
                                                        <td>
                                                            <Link
                                                                href={`/customer-dashboard/orders/${order._id}`}
                                                                className="btn btn-success d-block mx-auto mb-4 global-button"
                                                            >{t("Show Details")}</Link>
                                                            <Link
                                                                href={`/confirmation?orderId=${order._id}`}
                                                                className="btn btn-success d-block mx-auto global-button"
                                                            >{t("Show Billing")}</Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table> : <div className="orders-for-user text-center">
                                            {allOrdersInsideThePage.map((order, orderIndex) => (
                                                <div className="order-data data-box mb-5" key={order._id}>
                                                    <h4 className="mb-3 text-white">{t("Order Details")} # {orderIndex + 1}</h4>
                                                    <table className="order-data-table-for-user data-table w-100">
                                                        <tbody>
                                                            <tr>
                                                                <th>{t("Order Number")}</th>
                                                                <td>
                                                                    {order.orderNumber}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>{t("Checkout Status")}</th>
                                                                <td>
                                                                    {t(order.checkout_status)}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>{t("Status")}</th>
                                                                <td>
                                                                    {t(order.status)}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>{t("Order Total Amount")}</th>
                                                                <td>
                                                                    {order.order_amount}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>{t("Added Date")}</th>
                                                                <td>
                                                                    {getDateFormated(order.added_date)}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>{t("Action")}</th>
                                                                <td>
                                                                    <Link
                                                                        href={`/customer-dashboard/orders/${order._id}`}
                                                                        className="btn btn-success d-block mx-auto mb-4 global-button"
                                                                    >{t("Show Details")}</Link>
                                                                    <Link
                                                                        href={`/confirmation?orderId=${order._id}`}
                                                                        className="btn btn-success d-block mx-auto global-button"
                                                                    >{t("Show Billing")}</Link>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ))}
                                        </div>}
                                    </section>}
                                    {allOrdersInsideThePage.length === 0 && !isFilteringOrdersStatus && !errMsg && <p className="alert alert-danger">{t("Sorry, Can't Find Any Orders")} !!</p>}
                                    {errMsg && <p className="alert alert-danger">{t(errMsg)}</p>}
                                    {isFilteringOrdersStatus && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                                        <span className="loader-table-data"></span>
                                    </div>}
                                </div>
                                {totalPagesCount > 0 && !isFilteringOrdersStatus &&
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