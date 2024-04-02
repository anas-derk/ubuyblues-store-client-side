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

export default function StoresManagment() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [token, setToken] = useState("");

    const [allStoresInsideThePage, setAllStoresInsideThePage] = useState([]);

    const [isFilteringStoresStatus, setIsFilteringStoresStatus] = useState(false);

    const [selectedStoreIndex, setSelectedStoreIndex] = useState(-1);

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
                        result = await getStoresCount();
                        if (result.data > 0) {
                            setAllStoresInsideThePage((await getAllStoresInsideThePage(1, pageSize)).data);
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

    const getStoresCount = async (filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/stores/stores-count?${filters ? filters : ""}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllStoresInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/stores/all-stores-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getPreviousPage = async () => {
        setIsFilteringStoresStatus(true);
        const newCurrentPage = currentPage - 1;
        setAllStoresInsideThePage((await getAllStoresInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsFilteringStoresStatus(false);
    }

    const getNextPage = async () => {
        setIsFilteringStoresStatus(true);
        const newCurrentPage = currentPage + 1;
        setAllStoresInsideThePage((await getAllStoresInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsFilteringStoresStatus(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsFilteringStoresStatus(true);
        setAllStoresInsideThePage((await getAllStoresInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data);
        setCurrentPage(pageNumber);
        setIsFilteringStoresStatus(false);
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.storeId) filteringString += `_id=${filters.storeId}&`;
        if (filters.name) filteringString += `name=${filters.name}&`;
        if (filters.status) filteringString += `ownerEmail=${filters.status}&`;
        if (filters.ownerFirstName) filteringString += `ownerFirstName=${filters.ownerFirstName}&`;
        if (filters.ownerLastName) filteringString += `ownerLastName=${filters.ownerLastName}&`;
        if (filters.ownerEmail) filteringString += `ownerEmail=${filters.ownerEmail}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const filterStores = async (filters) => {
        try {
            setIsFilteringStoresStatus(true);
            setCurrentPage(1);
            let filteringString = getFilteringString(filters);
            const result = await getStoresCount(filteringString);
            if (result.data > 0) {
                setAllStoresInsideThePage((await getAllStoresInsideThePage(1, pageSize, filteringString)).data);
                setTotalPagesCount(Math.ceil(result.data / pageSize));
                setIsFilteringStoresStatus(false);
            } else {
                setAllStoresInsideThePage([]);
                setTotalPagesCount(0);
                setIsFilteringStoresStatus(false);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                await router.push("/admin-dashboard/login");
                return;
            }
            setIsFilteringStoresStatus(false);
            setIsErrorStatus(true);
            let errorTimeout = setTimeout(() => {
                setIsErrorStatus(false);
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const changeStoreData = (productIndex, fieldName, newValue) => {
        allStoresInsideThePage[productIndex][fieldName] = newValue;
    }

    const updateStoreData = async (orderIndex) => {
        try {
            setFormValidationErrors({});
            let errorsObject = validateFormFields([
                {
                    name: "totalAmount",
                    value: allStoresInsideThePage[orderIndex].order_amount,
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
            setSelectedStoreIndex(orderIndex);
            if (Object.keys(errorsObject).length == 0) {
                setIsUpdatingStatus(true);
                const res = await axios.post(`${process.env.BASE_API_URL}/orders/update-order/${allStoresInsideThePage[orderIndex]._id}`, {
                    order_amount: allStoresInsideThePage[orderIndex].order_amount,
                    status: allStoresInsideThePage[orderIndex].status,
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
                        setSelectedStoreIndex(-1);
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
                setSelectedStoreIndex(-1);
                clearTimeout(errorTimeout);
            }, 3000);
        }
    }

    const deleteStore = async (orderIndex) => {
        try {
            setIsDeletingStatus(true);
            setSelectedStoreIndex(orderIndex);
            const res = await axios.delete(`${process.env.BASE_API_URL}/orders/delete-order/${allStoresInsideThePage[orderIndex]._id}`, {
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
                    setSelectedStoreIndex(-1);
                    setIsFilteringStoresStatus(true);
                    setAllStoresInsideThePage((await getAllOrdersInsideThePage(1, pageSize)).data);
                    setCurrentPage(1);
                    setIsFilteringStoresStatus(false);
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
        <div className="stores-managment admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Stores Managment</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-3 pb-3">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">Hello To You In Stores Managment</h1>
                        <section className="filters mb-3 bg-white border-3 border-info p-3 text-start">
                            <h5 className="section-name fw-bold text-center">Filters: </h5>
                            <hr />
                            <div className="row mb-4">
                                <div className="col-md-4 d-flex align-items-center">
                                    <h6 className="me-2 mb-0 fw-bold text-center">Store Id</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Store Id"
                                        onChange={(e) => setFilters({ ...filters, storeId: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4 d-flex align-items-center">
                                    <h6 className="me-2 mb-0 fw-bold text-center">Store Name</h6>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Pleae Enter Store Name"
                                        onChange={(e) => setFilters({ ...filters, name: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4 d-flex align-items-center">
                                    <h6 className="me-2 mb-0 fw-bold text-center">Status</h6>
                                    <select
                                        className="select-store-status form-select"
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="" hidden>Pleae Enter Status</option>
                                        <option value="">All</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                </div>
                                <div className="col-md-4 d-flex align-items-center mt-5">
                                    <h6 className="me-2 mb-0 fw-bold text-center">Owner First Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Owner First Name"
                                        onChange={(e) => setFilters({ ...filters, ownerFirstName: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4 d-flex align-items-center mt-5">
                                    <h6 className="me-2 mb-0 fw-bold text-center">Owner Last Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Owner Last Name"
                                        onChange={(e) => setFilters({ ...filters, ownerLastName: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4 d-flex align-items-center mt-5">
                                    <h6 className="me-2 mb-0 fw-bold text-center">Owner Email</h6>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Pleae Enter Owner Email"
                                        onChange={(e) => setFilters({ ...filters, ownerEmail: e.target.value.trim() })}
                                    />
                                </div>
                            </div>
                            {!isFilteringStoresStatus && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                onClick={() => filterStores(filters)}
                            >
                                Filter
                            </button>}
                            {isFilteringStoresStatus && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                disabled
                            >
                                Filtering ...
                            </button>}
                        </section>
                        {allStoresInsideThePage.length > 0 && !isFilteringStoresStatus && <section className="orders-data-box p-3 data-box">
                            <table className="orders-data-table mb-4 managment-table bg-white w-100">
                                <thead>
                                    <tr>
                                        <th width="50">Store Number</th>
                                        <th width="50">Store Id</th>
                                        <th>Name</th>
                                        <th>Owner Full Name</th>
                                        <th>Owner Email</th>
                                        <th width="200">Products Type</th>
                                        <th width="50">Is Approved</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allStoresInsideThePage.map((store, storeIndex) => (
                                        <tr key={store._id}>
                                            <td>{storeIndex + 1}</td>
                                            <td>{store._id}</td>
                                            <td>
                                                <section className="store-name mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={store.name}
                                                        className={`form-control d-block mx-auto p-2 border-2 store-name-field ${formValidationErrors["name"] && storeIndex === selectedStoreIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter Store Name"
                                                        onChange={(e) => changeStoreData(storeIndex, "name", e.target.valueAsNumber ? e.target.valueAsNumber : "")}
                                                    />
                                                    {formValidationErrors["name"] && storeIndex === selectedStoreIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["name"]}</span>
                                                    </p>}
                                                </section>
                                            </td>
                                            <td>{store.ownerFirstName + " " + store.ownerLastName}</td>
                                            <td>
                                                <section className="store-owner-email mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={store.ownerEmail}
                                                        className={`form-control d-block mx-auto p-2 border-2 store-owner-email-field ${formValidationErrors["ownerEmail"] && storeIndex === selectedStoreIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter Owner Email"
                                                        onChange={(e) => changeStoreData(storeIndex, "ownerEmail", e.target.valueAsNumber ? e.target.valueAsNumber : "")}
                                                    />
                                                    {formValidationErrors["ownerEmail"] && storeIndex === selectedStoreIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["ownerEmail"]}</span>
                                                    </p>}
                                                </section>
                                            </td>
                                            <td>
                                                <section className="store-products-type mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={store.productsType}
                                                        className={`form-control d-block mx-auto p-2 border-2 store-products-type-field ${formValidationErrors["productsType"] && storeIndex === selectedStoreIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter Owner Email"
                                                        onChange={(e) => changeStoreData(storeIndex, "productsType", e.target.valueAsNumber ? e.target.valueAsNumber : "")}
                                                    />
                                                    {formValidationErrors["productsType"] && storeIndex === selectedStoreIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["productsType"]}</span>
                                                    </p>}
                                                </section>
                                            </td>
                                            <td>{store.isApproved ? "yes" : "no"}</td>
                                            <td>
                                                {!isUpdatingStatus && !isDeletingStatus && !isSuccessStatus && !isErrorStatus && !store.isDeleted && <button
                                                    className="btn btn-info d-block mx-auto mb-3 global-button"
                                                    onClick={() => updateStoreData(storeIndex)}
                                                >
                                                    Update
                                                </button>}
                                                {isUpdatingStatus && storeIndex === selectedStoreIndex && <button
                                                    className="btn btn-info d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Updating ...
                                                </button>}
                                                {isSuccessStatus && storeIndex === selectedStoreIndex && <button
                                                    className="btn btn-success d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Success
                                                </button>}
                                                {!isUpdatingStatus && !isDeletingStatus && !isSuccessStatus && !isErrorStatus && !store.isDeleted && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    onClick={() => deleteStore(storeIndex)}
                                                >
                                                    Delete
                                                </button>}
                                                {isDeletingStatus && !store.isDeleted && storeIndex === selectedStoreIndex && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Deleting ...
                                                </button>}
                                                {store.isDeleted && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Deleted Successful
                                                </button>}
                                                {isErrorStatus && storeIndex === selectedStoreIndex && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Sorry, Someting Went Wrong, Please Repeate The Process !!
                                                </button>}
                                                {!isUpdatingStatus && !isDeletingStatus && !isErrorStatus && !isSuccessStatus && <>
                                                    <Link
                                                        href={`/admin-dashboard/stores-managment/${store._id}`}
                                                        className="btn btn-success d-block mx-auto mb-4 global-button"
                                                    >Show Full Details</Link>
                                                </>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>}
                        {allStoresInsideThePage.length === 0 && !isFilteringStoresStatus && <p className="alert alert-danger">Sorry, Can't Find Any Orders !!</p>}
                        {isFilteringStoresStatus && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                            <span className="loader-table-data"></span>
                        </div>}
                        {totalPagesCount > 1 && !isFilteringStoresStatus &&
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