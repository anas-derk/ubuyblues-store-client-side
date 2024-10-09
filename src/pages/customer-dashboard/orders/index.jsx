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
import Footer from "@/components/Footer";
import { getCurrencyNameByCountry, getUSDPriceAgainstCurrency } from "../../../../public/global_functions/prices";
import { getDateFormated, getUserInfo, handleSelectUserLanguage } from "../../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";
import SectionLoader from "@/components/SectionLoader";

export default function CustomerOrders({ countryAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [allOrdersInsideThePage, setAllOrdersInsideThePage] = useState([]);

    const [isExistOrdersForThisUserInDBInGeneral, setIsExistOrdersForThisUserInDBInGeneral] = useState(false);

    const [isFilteringOrdersStatus, setIsFilteringOrdersStatus] = useState(true);

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

    const pageSize = 3;

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.userlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        setWindowInnerWidth(window.innerWidth);
        window.addEventListener("resize", () => {
            setWindowInnerWidth(window.innerWidth);
        });
    }, []);

    useEffect(() => {
        setIsLoadingPage(true);
        getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(getCurrencyNameByCountry(countryAsProperty));
            if (!isFilteringOrdersStatus) {
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
                        const result2 = await getOrdersCount("destination=user");
                        if (result2.data > 0) {
                            setAllOrdersInsideThePage((await getAllOrdersInsideThePage(1, pageSize, "destination=user")).data);
                            setTotalPagesCount(Math.ceil(result2.data / pageSize));
                            setIsExistOrdersForThisUserInDBInGeneral(true);
                        }
                        setIsFilteringOrdersStatus(false);
                    } else {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                        await router.replace("/auth");
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
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
        if (!isFilteringOrdersStatus) {
            setIsLoadingPage(false);
        }
    }, [isFilteringOrdersStatus]);

    const getOrdersCount = async (filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/orders/orders-count?language=${i18n.language}&${filters ? filters : ""}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.userTokenNameInLocalStorage)
                }
            })).data;
        }
        catch (err) {
            throw err;
        }
    }

    const getAllOrdersInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/orders/all-orders-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&language=${i18n.language}&${filters ? filters : ""}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.userTokenNameInLocalStorage)
                }
            })).data;
        }
        catch (err) {
            throw err;
        }
    }

    const getPreviousPage = async () => {
        try {
            setIsFilteringOrdersStatus(true);
            const newCurrentPage = currentPage - 1;
            setAllOrdersInsideThePage((await getAllOrdersInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
            setCurrentPage(newCurrentPage);
            setIsFilteringOrdersStatus(false);
        }
        catch (err) {
            throw err;
        }
    }

    const getNextPage = async () => {
        try {
            setIsFilteringOrdersStatus(true);
            const newCurrentPage = currentPage + 1;
            setAllOrdersInsideThePage((await getAllOrdersInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
            setCurrentPage(newCurrentPage);
            setIsFilteringOrdersStatus(false);
        }
        catch (err) {
            throw err;
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsFilteringOrdersStatus(true);
            setAllOrdersInsideThePage((await getAllOrdersInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data);
            setCurrentPage(pageNumber);
            setIsFilteringOrdersStatus(false);
        }
        catch (err) {
            throw err;
        }
    }

    const getFilteringString = (filters) => {
        let filteringString = "destination=user&";
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
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/auth");
            }
            else {
                setIsFilteringOrdersStatus(false);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="customer-orders-managment customer-dashboard">
            <Head>
                <title>{t(process.env.storeName)} - {t("Customer Orders")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content page pt-5">
                    <div className="container-fluid pb-4">
                        <div className="row align-items-center">
                            <div className="col-xl-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <div className="col-xl-9">
                                <div className="customer-orders">
                                    {isExistOrdersForThisUserInDBInGeneral && <section className="filters mb-3 border-3 border-white p-3 text-start text-white">
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
                                    </section>}
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
                                                        <td>{t(order.checkoutStatus)}</td>
                                                        <td className="fw-bold">
                                                            {t(order.status)}
                                                        </td>
                                                        <td>
                                                            {order.orderAmount * usdPriceAgainstCurrency} {t(currencyNameByCountry)}
                                                        </td>
                                                        <td>{getDateFormated(order.addedDate)}</td>
                                                        <td>
                                                            <Link
                                                                href={`/customer-dashboard/orders/${order._id}`}
                                                                className="btn btn-success d-block mx-auto mb-4 global-button"
                                                            >{t("Show Details")}</Link>
                                                            <Link
                                                                href={`/confirmation/${order._id}`}
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
                                                                    {t(order.checkoutStatus)}
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
                                                                    {order.orderAmount}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>{t("Added Date")}</th>
                                                                <td>
                                                                    {getDateFormated(order.addedDate)}
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
                                                                        href={`/confirmation/${order._id}`}
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
                                    {allOrdersInsideThePage.length === 0 && !isFilteringOrdersStatus && !errMsg && <NotFoundError errorMsg={t("Sorry, Can't Find Any Orders")} />}
                                    {errMsg && <p className="alert alert-danger">{t(errMsg)}</p>}
                                    {isFilteringOrdersStatus && <SectionLoader />}
                                </div>
                                {totalPagesCount > 1 && !isFilteringOrdersStatus &&
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