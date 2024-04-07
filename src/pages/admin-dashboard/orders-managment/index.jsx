import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import PaginationBar from "@/components/PaginationBar";
import validations from "../../../../public/global_functions/validations";
import { HiOutlineBellAlert } from "react-icons/hi2";

export default function OrdersManagment() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [token, setToken] = useState("");

    const [userInfo, setUserInfo] = useState({});

    const [allOrdersInsideThePage, setAllOrdersInsideThePage] = useState([]);

    const [isFilteringOrdersStatus, setIsFilteringOrdersStatus] = useState(false);

    const [selectedOrderIndex, setSelectedOrderIndex] = useState(-1);

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [isDeletingStatus, setIsDeletingStatus] = useState(false);

    const [isSuccessStatus, setIsSuccessStatus] = useState(false);

    const [isErrorStatus, setIsErrorStatus] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        orderNumber: -1,
        orderId: "",
        status: "",
        customerName: "",
        email: "",
        isDeleted: false,
    });

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

    const pageSize = 3;

    useEffect(() => {
        const adminToken = localStorage.getItem("asfour-store-admin-user-token");
        if (adminToken) {
            validations.getAdminInfo(adminToken)
                .then(async (result) => {
                    if (result.error) {
                        localStorage.removeItem("asfour-store-admin-user-token");
                        await router.push("/admin-dashboard/login");
                    } else {
                        setUserInfo(result.data);
                        result = await getOrdersCount(getFilteringString(filters));
                        if (result.data > 0) {
                            setAllOrdersInsideThePage((await getAllOrdersInsideThePage(1, pageSize, getFilteringString(filters))).data);
                            setTotalPagesCount(Math.ceil(result.data / pageSize));
                        }
                        setToken(adminToken);
                        setIsLoadingPage(false);
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem("asfour-store-admin-user-token");
                        await router.push("/admin-dashboard/login");
                    }
                    else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else router.push("/admin-dashboard/login");
    }, []);

    const validateFormFields = (validateDetailsList) => {
        return validations.inputValuesValidation(validateDetailsList);
    }

    const getOrdersCount = async (filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/orders/orders-count?${filters ? filters : ""}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllOrdersInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/orders/all-orders-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`);
            return res.data;
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
        if (filters.orderNumber !== -1 && filters.orderNumber) filteringString += `orderNumber=${filters.orderNumber}&`;
        if (filters.orderId) filteringString += `_id=${filters.orderId}&`;
        if (filters.status) filteringString += `status=${filters.status}&`;
        if (filters.customerName) filteringString += `customerName=${filters.customerName}&`;
        if (filters.email) filteringString += `email=${filters.email}&`;
        if (filters.isDeleted) filteringString += `isDeleted=yes&`;
        else filteringString += `isDeleted=no&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const filterOrders = async (filters) => {
        try {
            setIsFilteringOrdersStatus(true);
            setCurrentPage(1);
            let filteringString = getFilteringString(filters);
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
                await router.push("/admin-dashboard/login");
                return;
            }
            setIsFilteringOrdersStatus(false);
            setIsErrorStatus(true);
            let errorTimeout = setTimeout(() => {
                setIsErrorStatus(false);
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const changeOrderData = (productIndex, fieldName, newValue) => {
        allOrdersInsideThePage[productIndex][fieldName] = newValue;
    }

    const updateOrderData = async (orderIndex) => {
        try {
            setFormValidationErrors({});
            let errorsObject = validateFormFields([
                {
                    name: "totalAmount",
                    value: allOrdersInsideThePage[orderIndex].order_amount,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        minNumber: {
                            value: 0,
                            msg: "Sorry, Min Number Is: 1 !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedOrderIndex(orderIndex);
            if (Object.keys(errorsObject).length == 0) {
                setIsUpdatingStatus(true);
                const res = await axios.post(`${process.env.BASE_API_URL}/orders/update-order/${allOrdersInsideThePage[orderIndex]._id}`, {
                    order_amount: allOrdersInsideThePage[orderIndex].order_amount,
                    status: allOrdersInsideThePage[orderIndex].status,
                }, {
                    headers: {
                        Authorization: token,
                    }
                });
                const result = await res.data;
                if (!result.error) {
                    setIsUpdatingStatus(false);
                    setIsSuccessStatus(true);
                    let successTimeout = setTimeout(() => {
                        setIsSuccessStatus(false);
                        setSelectedOrderIndex(-1);
                        clearTimeout(successTimeout);
                    }, 3000);
                }
            }
        }
        catch (err) {
            setIsUpdatingStatus(false);
            setIsErrorStatus(true);
            let errorTimeout = setTimeout(() => {
                setIsErrorStatus(false);
                setSelectedOrderIndex(-1);
                clearTimeout(errorTimeout);
            }, 3000);
        }
    }

    const deleteOrder = async (orderIndex) => {
        try {
            setIsDeletingStatus(true);
            setSelectedOrderIndex(orderIndex);
            const res = await axios.delete(`${process.env.BASE_API_URL}/orders/delete-order/${allOrdersInsideThePage[orderIndex]._id}`, {
                headers: {
                    Authorization: token,
                }
            });
            const result = res.data;
            setIsDeletingStatus(false);
            if (!result.error) {
                setIsSuccessStatus(true);
                let successTimeout = setTimeout(async () => {
                    setIsSuccessStatus(false);
                    setSelectedOrderIndex(-1);
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
                    clearTimeout(successTimeout);
                }, 3000);
            }
        }
        catch (err) {
            setIsDeletingStatus(false);
            setIsErrorStatus(true);
            let errorTimeout = setTimeout(() => {
                setIsErrorStatus(false);
                setSelectedOrderIndex(-1);
                clearTimeout(errorTimeout);
            }, 3000);
        }
    }

    return (
        <div className="orders-managment admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Orders Managment</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-5 pb-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">Hi, Mr {userInfo.firstName + " " + userInfo.lastName} In Orders Managment</h1>
                        <section className="filters mb-3 bg-white border-3 border-info p-3 text-start">
                            <h5 className="section-name fw-bold text-center">Filters: </h5>
                            <hr />
                            <div className="row mb-4">
                                <div className="col-md-4 d-flex align-items-center">
                                    <h6 className="me-2 mb-0 fw-bold text-center">Order Number</h6>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Pleae Enter Order Number"
                                        min="1"
                                        max={allOrdersInsideThePage.length}
                                        onChange={(e) => setFilters({ ...filters, orderNumber: e.target.valueAsNumber })}
                                    />
                                </div>
                                <div className="col-md-4 d-flex align-items-center">
                                    <h6 className="me-2 mb-0 fw-bold text-center">Order Id</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Order Id"
                                        onChange={(e) => setFilters({ ...filters, orderId: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4 d-flex align-items-center">
                                    <h6 className="me-2 mb-0 fw-bold text-center">Status</h6>
                                    <select
                                        className="select-order-status form-select"
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="" hidden>Pleae Enter Status</option>
                                        <option value="">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="shipping">Shipping</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div className="col-md-6 d-flex align-items-center mt-4">
                                    <h6 className="me-2 mb-0 fw-bold text-center">Customer Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Customer Name"
                                        onChange={(e) => setFilters({ ...filters, customerName: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-6 d-flex align-items-center mt-4">
                                    <h6 className="me-2 mb-0 fw-bold text-center">Customer Email</h6>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Pleae Enter Customer Email"
                                        onChange={(e) => setFilters({ ...filters, email: e.target.value.trim() })}
                                    />
                                </div>
                            </div>
                            {!isFilteringOrdersStatus && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                onClick={() => filterOrders(filters)}
                            >
                                Filter
                            </button>}
                            {isFilteringOrdersStatus && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                disabled
                            >
                                Filtering ...
                            </button>}
                        </section>
                        {allOrdersInsideThePage.length > 0 && !isFilteringOrdersStatus && <section className="orders-data-box p-3 data-box">
                            <table className="orders-data-table mb-4 managment-table bg-white w-100">
                                <thead>
                                    <tr>
                                        <th>Order Number</th>
                                        <th>Order Id</th>
                                        <th>Checkout Status</th>
                                        <th>Status</th>
                                        <th>Order Total Amount</th>
                                        <th>Added Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allOrdersInsideThePage.map((order, orderIndex) => (
                                        <tr key={order._id}>
                                            <td>{order.orderNumber}</td>
                                            <td>{order._id}</td>
                                            <td>{order.checkout_status}</td>
                                            <td>
                                                <h6 className="fw-bold">{order.status}</h6>
                                                <hr />
                                                <select
                                                    className="select-order-status form-select"
                                                    onChange={(e) => changeOrderData(orderIndex, "status", e.target.value)}
                                                >
                                                    <option value="" hidden>Pleae Enter Status</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="shipping">Shipping</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </td>
                                            <td>
                                                <section className="order-total-amount mb-4">
                                                    <input
                                                        type="number"
                                                        defaultValue={order.order_amount}
                                                        className={`form-control d-block mx-auto p-2 border-2 brand-title-field ${formValidationErrors["totalAmount"] && orderIndex === selectedOrderIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter Order Amount"
                                                        onChange={(e) => changeOrderData(orderIndex, "order_amount", e.target.valueAsNumber ? e.target.valueAsNumber : "")}
                                                    />
                                                    {formValidationErrors["totalAmount"] && orderIndex === selectedOrderIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["totalAmount"]}</span>
                                                    </p>}
                                                </section>
                                            </td>
                                            <td>{getDateFormated(order.added_date)}</td>
                                            <td>
                                                {!isUpdatingStatus && !isDeletingStatus && !isSuccessStatus && !isErrorStatus && !order.isDeleted && <button
                                                    className="btn btn-info d-block mx-auto mb-3 global-button"
                                                    onClick={() => updateOrderData(orderIndex)}
                                                >
                                                    Update
                                                </button>}
                                                {isUpdatingStatus && orderIndex === selectedOrderIndex && <button
                                                    className="btn btn-info d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Updating ...
                                                </button>}
                                                {isSuccessStatus && orderIndex === selectedOrderIndex && <button
                                                    className="btn btn-success d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Success
                                                </button>}
                                                {!isUpdatingStatus && !isDeletingStatus && !isSuccessStatus && !isErrorStatus && !order.isDeleted && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    onClick={() => deleteOrder(orderIndex)}
                                                >
                                                    Delete
                                                </button>}
                                                {order.isDeleted && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Deleted
                                                </button>}
                                                {isDeletingStatus && !order.isDeleted && orderIndex === selectedOrderIndex && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Deleting ...
                                                </button>}
                                                {isErrorStatus && orderIndex === selectedOrderIndex && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Sorry, Someting Went Wrong, Please Repeate The Process !!
                                                </button>}
                                                {!isUpdatingStatus && !isDeletingStatus && !isErrorStatus && !isSuccessStatus && <>
                                                    <Link
                                                        href={`/admin-dashboard/orders-managment/${order._id}`}
                                                        className="btn btn-success d-block mx-auto mb-4 global-button"
                                                    >Show Details</Link>
                                                    <Link
                                                        href={`/admin-dashboard/orders-managment/billing/${order._id}`}
                                                        className="btn btn-success d-block mx-auto mb-4 global-button"
                                                    >Show Billing</Link>
                                                </>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>}
                        {allOrdersInsideThePage.length === 0 && !isFilteringOrdersStatus && <p className="alert alert-danger">Sorry, Can't Find Any Orders !!</p>}
                        {isFilteringOrdersStatus && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                            <span className="loader-table-data"></span>
                        </div>}
                        {totalPagesCount > 1 && !isFilteringOrdersStatus &&
                            <PaginationBar
                                totalPagesCount={totalPagesCount}
                                currentPage={currentPage}
                                getPreviousPage={getPreviousPage}
                                getNextPage={getNextPage}
                                getSpecificPage={getSpecificPage}
                            />
                        }
                    </div>
                </section>
                {/* End Content Section */}
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}