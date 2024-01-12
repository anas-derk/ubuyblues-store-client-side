import Head from "next/head";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LoaderPage from "@/components/LoaderPage";
import Link from "next/link";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import axios from "axios";

export default function CustomerOrders() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [userInfo, setUserInfo] = useState(true);

    const [allOrdersInsideThePage, setAllOrdersInsideThePage] = useState([]);

    const [isFilteringOrdersStatus, setIsFilteringOrdersStatus] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [pageNumber, setPageNumber] = useState(0);

    const router = useRouter();

    const pageSize = 5;

    useEffect(() => {
        const userId = localStorage.getItem("asfour-store-user-id");
        if (userId) {
            axios.get(`${process.env.BASE_API_URL}/users/user-info/${userId}`)
                .then(async (res) => {
                    const result = res.data;
                    if (result !== "Sorry, The User Is Not Exist !!, Please Enter Another User Id ..") {
                        setUserInfo(result);
                        const result2 = await getOrdersCount(`customerId=${result._id}`);
                        if (result2 > 0) {
                            const result3 = await getAllOrdersInsideThePage(1, pageSize, `customerId=${result._id}`);
                            setAllOrdersInsideThePage(result3);
                            setTotalPagesCount(Math.ceil(result / pageSize));
                        }
                        setIsLoadingPage(false);
                        setIsLoadingPage(false);
                    } else {
                        router.push("/auth");
                    }
                })
                .catch(() => {
                    setIsLoadingPage(false);
                    setIsErrorMsgOnLoadingThePage(true);
                });
        } else {
            router.push("/auth");
        }
    }, []);

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
        setAllOrdersInsideThePage(await getAllOrdersInsideThePage(newCurrentPage, pageSize));
        setCurrentPage(newCurrentPage);
        setIsFilteringOrdersStatus(false);
    }

    const getNextPage = async () => {
        setIsFilteringOrdersStatus(true);
        const newCurrentPage = currentPage + 1;
        setAllOrdersInsideThePage(await getAllOrdersInsideThePage(newCurrentPage, pageSize));
        setCurrentPage(newCurrentPage);
        setIsFilteringOrdersStatus(false);
    }

    const paginationBar = () => {
        const paginationButtons = [];
        for (let i = 1; i <= totalPagesCount; i++) {
            if (i < 11) {
                paginationButtons.push(
                    <button
                        key={i}
                        className={`pagination-button me-3 p-2 ps-3 pe-3 ${currentPage === i ? "selection" : ""} ${i === 1 ? "ms-3" : ""}`}
                        onClick={async () => {
                            setIsFilteringOrdersStatus(true);
                            setAllOrdersInsideThePage(await getAllOrdersInsideThePage(i, pageSize));
                            setCurrentPage(i);
                            setIsFilteringOrdersStatus(false);
                        }}
                    >
                        {i}
                    </button>
                );
            }
        }
        if (totalPagesCount > 10) {
            paginationButtons.push(
                <span className="me-3 fw-bold" key={`${Math.random()}-${Date.now()}`}>...</span>
            );
            paginationButtons.push(
                <button
                    key={totalPagesCount}
                    className={`pagination-button me-3 p-2 ps-3 pe-3 ${currentPage === totalPagesCount ? "selection" : ""}`}
                    onClick={async () => {
                        setIsFilteringOrdersStatus(true);
                        setAllOrdersInsideThePage(await getAllOrdersInsideThePage(pageNumber, pageSize));
                        setCurrentPage(pageNumber);
                        setIsFilteringOrdersStatus(false);
                    }}
                >
                    {totalPagesCount}
                </button>
            );
        }
        return (
            <section className="pagination d-flex justify-content-center align-items-center">
                {currentPage !== 1 && <BsArrowLeftSquare
                    className="previous-page-icon pagination-icon"
                    onClick={getPreviousPage}
                />}
                {paginationButtons}
                {currentPage !== totalPagesCount && <BsArrowRightSquare
                    className="next-page-icon pagination-icon me-3"
                    onClick={getNextPage}
                />}
                <span className="current-page-number-and-count-of-pages p-2 ps-3 pe-3 bg-secondary text-white me-3">The Page {currentPage} of {totalPagesCount} Pages</span>
                <form
                    className="navigate-to-specific-page-form w-25"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setIsFilteringOrdersStatus(true);
                        setAllOrdersInsideThePage(await getAllOrdersInsideThePage(pageNumber, pageSize));
                        setCurrentPage(pageNumber);
                        setIsFilteringOrdersStatus(false);
                    }}
                >
                    <input
                        type="number"
                        className="form-control p-1 ps-2 page-number-input"
                        placeholder="Enter Page Number"
                        min="1"
                        max={totalPagesCount}
                        onChange={(e) => setPageNumber(e.target.valueAsNumber)}
                    />
                </form>
            </section>
        );
    }

    return (
        <div className="customer-orders-managment customer-dashboard">
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
                                    {allOrdersInsideThePage.length > 0 && !isFilteringOrdersStatus ? <section className="orders-data-box p-3 data-box">
                                        <table className="orders-data-table customer-table mb-4 w-100">
                                            <thead>
                                                <tr>
                                                    <th>Order Number</th>
                                                    <th>Checkout Status</th>
                                                    <th>Status</th>
                                                    <th>Order Total Amount</th>
                                                    <th>Added Date</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allOrdersInsideThePage.map((order) => (
                                                    <tr key={order._id}>
                                                        <td>{order.orderNumber}</td>
                                                        <td>{order.checkout_status}</td>
                                                        <td className="fw-bold">
                                                            {order.status}
                                                        </td>
                                                        <td>
                                                            {order.order_amount}
                                                        </td>
                                                        <td>{getDateFormated(order.added_date)}</td>
                                                        <td>
                                                            <Link
                                                                href={{
                                                                    pathname: `/customer-dashboard/orders/${order._id}`,
                                                                    query: {
                                                                        activeParentLink: "orders-managment",
                                                                    }
                                                                }}
                                                                className="btn btn-success d-block mx-auto mb-4 global-button"
                                                            >Show Details</Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </section> : <h1 className="h5 text-white">
                                        <span className="me-2">No order has been made yet.</span>
                                        <Link href="/" className="btn btn-danger">Browse Products</Link>
                                    </h1>}
                                </div>
                                {totalPagesCount > 0 && !isFilteringOrdersStatus && paginationBar()}
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