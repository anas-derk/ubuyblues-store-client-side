import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import PaginationBar from "@/components/PaginationBar";
import { getAdminInfo, inputValuesValidation } from "../../../../public/global_functions/validations";
import { HiOutlineBellAlert } from "react-icons/hi2";
import ChangeStoreStatusBox from "@/components/ChangeStoreStatusBox";

export default function UpdateAndDeleteAdmins() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [adminInfo, setAdminInfo] = useState({});

    const [allAdminsInsideThePage, setAllAdminsInsideThePage] = useState([]);

    const [isFilteringAdminsStatus, setIsFilteringStoresStatus] = useState(false);

    const [selectedAdminIndex, setSelectedAdminIndex] = useState(-1);

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [isDeletingStatus, setIsDeletingStatus] = useState(false);

    const [isSuccessStatus, setIsSuccessStatus] = useState(false);

    const [isErrorStatus, setIsErrorStatus] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        storeId: "",
        name: "",
        status: "",
        ownerFirstName: "",
        ownerLastName: "",
        email: "",
    });

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isDisplayChangeStoreStatusBox, setIsDisplayChangeStoreStatusBox] = useState(false);

    const [storeAction, setStoreAction] = useState("");

    const [selectedStoreId, setSelectedStoreId] = useState("");

    const router = useRouter();

    const pageSize = 3;

    useEffect(() => {
        const adminToken = localStorage.getItem(process.env.adminTokenNameInLocalStorage);
        if (adminToken) {
            getAdminInfo()
                .then(async (result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.push("/admin-dashboard/login");
                    } else {
                        const adminDetails = result.data;
                        if (adminDetails.isWebsiteOwner) {
                            setAdminInfo(adminDetails);
                            result = await getAdminsCount();
                            if (result.data > 0) {
                                setAllAdminsInsideThePage((await getAllAdminsInsideThePage(1, pageSize)).data);
                                setTotalPagesCount(Math.ceil(result.data / pageSize));
                            }
                            setIsLoadingPage(false);
                        } else {
                            await router.replace("/admin-dashboard");
                        }
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.push("/admin-dashboard/login");
                    }
                    else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else router.push("/admin-dashboard/login");
    }, []);

    const getAdminsCount = async (filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/stores/stores-count?${filters ? filters : ""}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllAdminsInsideThePage = async (pageNumber, pageSize, filters) => {
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
        setAllAdminsInsideThePage((await getAllAdminsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsFilteringStoresStatus(false);
    }

    const getNextPage = async () => {
        setIsFilteringStoresStatus(true);
        const newCurrentPage = currentPage + 1;
        setAllAdminsInsideThePage((await getAllAdminsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsFilteringStoresStatus(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsFilteringStoresStatus(true);
        setAllAdminsInsideThePage((await getAllAdminsInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data);
        setCurrentPage(pageNumber);
        setIsFilteringStoresStatus(false);
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.storeId) filteringString += `_id=${filters.storeId}&`;
        if (filters.name) filteringString += `name=${filters.name}&`;
        if (filters.status) filteringString += `status=${filters.status}&`;
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
            const filteringString = getFilteringString(filters);
            const result = await getAdminsCount(filteringString);
            if (result.data > 0) {
                setAllAdminsInsideThePage((await getAllAdminsInsideThePage(1, pageSize, filteringString)).data);
                setTotalPagesCount(Math.ceil(result.data / pageSize));
                setIsFilteringStoresStatus(false);
            } else {
                setAllAdminsInsideThePage([]);
                setTotalPagesCount(0);
                setIsFilteringStoresStatus(false);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem("asfour-store-admin-user-token");
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

    const handleDisplayChangeStoreStatusBox = (storeId, storeAction) => {
        setStoreAction(storeAction);
        setSelectedStoreId(storeId);
        setIsDisplayChangeStoreStatusBox(true);
    }

    const changeAdminData = (adminIndex, fieldName, newValue) => {
        allAdminsInsideThePage[adminIndex][fieldName] = newValue;
    }

    const updateAdminData = async (adminIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "name",
                    value: allAdminsInsideThePage[adminIndex].name,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "ownerEmail",
                    value: allAdminsInsideThePage[adminIndex].ownerEmail,
                    rules: {
                        isEmail: {
                            msg: "Sorry, Invalid Email !!",
                        },
                    },
                },
                {
                    name: "productsType",
                    value: allAdminsInsideThePage[adminIndex].productsType,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedAdminIndex(adminIndex);
            if (Object.keys(errorsObject).length == 0) {
                setIsUpdatingStatus(true);
                const res = await axios.put(`${process.env.BASE_API_URL}/stores/update-store-info/${allAdminsInsideThePage[adminIndex]._id}`, {
                    name: allAdminsInsideThePage[adminIndex].name,
                    ownerEmail: allAdminsInsideThePage[adminIndex].ownerEmail,
                    productsType: allAdminsInsideThePage[adminIndex].productsType,
                }, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                });
                const result = res.data;
                if (!result.error) {
                    setIsUpdatingStatus(false);
                    setIsSuccessStatus(true);
                    let successTimeout = setTimeout(() => {
                        setIsSuccessStatus(false);
                        setSelectedAdminIndex(-1);
                        clearTimeout(successTimeout);
                    }, 3000);
                }
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.push("/admin-dashboard/login");
                return;
            }
            setIsUpdatingStatus(false);
            setIsErrorStatus(true);
            let errorTimeout = setTimeout(() => {
                setIsErrorStatus(false);
                setSelectedAdminIndex(-1);
                clearTimeout(errorTimeout);
            }, 3000);
        }
    }

    const deleteAdmin = async (adminIndex) => {
        try {
            setIsDeletingStatus(true);
            setSelectedAdminIndex(adminIndex);
            const res = await axios.delete(`${process.env.BASE_API_URL}/stores/delete-store/${allAdminsInsideThePage[adminIndex]._id}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            });
            let result = res.data;
            setIsDeletingStatus(false);
            if (!result.error) {
                setIsSuccessStatus(true);
                let successTimeout = setTimeout(async () => {
                    setIsSuccessStatus(false);
                    setSelectedAdminIndex(-1);
                    setIsFilteringStoresStatus(true);
                    result = await getAdminsCount();
                    if (result.data > 0) {
                        setAllAdminsInsideThePage((await getAllAdminsInsideThePage(1, pageSize)).data);
                        setTotalPagesCount(Math.ceil(result.data / pageSize));
                    }
                    setCurrentPage(1);
                    setIsFilteringStoresStatus(false);
                    clearTimeout(successTimeout);
                }, 3000);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.push("/admin-dashboard/login");
                return;
            }
            setIsDeletingStatus(false);
            setIsErrorStatus(true);
            let errorTimeout = setTimeout(() => {
                setIsErrorStatus(false);
                setSelectedAdminIndex(-1);
                clearTimeout(errorTimeout);
            }, 3000);
        }
    }

    const handleChangeAdminStatus = async (newStatus) => {
        try {
            switch (newStatus) {
                case "approving": {
                    setIsFilteringStoresStatus(true);
                    const filteringString = getFilteringString(filters);
                    setAllAdminsInsideThePage((await getAllAdminsInsideThePage(1, pageSize, filteringString)).data);
                    setCurrentPage(currentPage);
                    setIsFilteringStoresStatus(false);
                    return;
                }
                case "rejecting": {
                    setIsFilteringStoresStatus(true);
                    const filteringString = getFilteringString(filters);
                    const result = await getAdminsCount(filteringString);
                    if (result.data > 0) {
                        setAllAdminsInsideThePage((await getAllAdminsInsideThePage(1, pageSize)).data);
                        setTotalPagesCount(Math.ceil(result.data / pageSize));
                    }
                    setCurrentPage(1);
                    setIsFilteringStoresStatus(false);
                    return;
                }
                case "blocking": {
                    setIsFilteringStoresStatus(true);
                    const filteringString = getFilteringString(filters);
                    setAllAdminsInsideThePage((await getAllAdminsInsideThePage(1, pageSize, filteringString)).data);
                    setCurrentPage(currentPage);
                    setIsFilteringStoresStatus(false);
                    return;
                }
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
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Share Options Box */}
                {isDisplayChangeStoreStatusBox && <ChangeStoreStatusBox
                    setIsDisplayChangeStoreStatusBox={setIsDisplayChangeStoreStatusBox}
                    setStoreAction={setStoreAction}
                    storeId={selectedStoreId}
                    storeAction={storeAction}
                    handleChangeAdminStatus={handleChangeAdminStatus}
                />}
                {/* End Share Options Box */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-5 pb-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Stores Managment</h1>
                        <section className="filters mb-3 bg-white border-3 border-info p-3 text-start">
                            <h5 className="section-name fw-bold text-center">Filters: </h5>
                            <hr />
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <h6 className="me-2 fw-bold text-center">First Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter First Name"
                                        onChange={(e) => setFilters({ ...filters, firstName: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <h6 className="me-2 fw-bold text-center">Last Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Last Name"
                                        onChange={(e) => setFilters({ ...filters, lastName: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <h6 className="me-2 fw-bold text-center">Email</h6>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Pleae Enter Email"
                                        onChange={(e) => setFilters({ ...filters, ownerEmail: e.target.value.trim() })}
                                    />
                                </div>
                            </div>
                            {!isFilteringAdminsStatus && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                onClick={() => filterStores(filters)}
                            >
                                Filter
                            </button>}
                            {isFilteringAdminsStatus && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                disabled
                            >
                                Filtering ...
                            </button>}
                        </section>
                        {allAdminsInsideThePage.length > 0 && !isFilteringAdminsStatus && <section className="admins-data-box p-3 data-box admin-dashbboard-data-box">
                            <table className="admins-data-table mb-4 managment-table bg-white admin-dashbboard-data-table">
                                <thead>
                                    <tr>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Email</th>
                                        <th>Password</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allAdminsInsideThePage.map((admin, adminIndex) => (
                                        <tr key={admin._id}>
                                            <td>
                                                <section className="first-name mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={admin.firstName}
                                                        className={`form-control d-block mx-auto p-2 border-2 first-name-field ${formValidationErrors["firstName"] && adminIndex === selectedAdminIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter New First Name"
                                                        onChange={(e) => changeAdminData(adminIndex, "firstName", e.target.value)}
                                                    />
                                                    {formValidationErrors["firstName"] && adminIndex === selectedAdminIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["firstName"]}</span>
                                                    </p>}
                                                </section>
                                            </td>
                                            <td>
                                                <section className="last-name mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={admin.lastName}
                                                        className={`form-control d-block mx-auto p-2 border-2 last-name-field ${formValidationErrors["lastName"] && adminIndex === selectedAdminIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter New Last Name"
                                                        onChange={(e) => changeAdminData(adminIndex, "lastName", e.target.value)}
                                                    />
                                                    {formValidationErrors["lastName"] && adminIndex === selectedAdminIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["lastName"]}</span>
                                                    </p>}
                                                </section>
                                            </td>
                                            <td>
                                                <section className="email mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={admin.email}
                                                        className={`form-control d-block mx-auto p-2 border-2 email-field ${formValidationErrors["email"] && adminIndex === selectedAdminIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter New Email"
                                                        onChange={(e) => changeAdminData(adminIndex, "email", e.target.value)}
                                                    />
                                                    {formValidationErrors["email"] && adminIndex === selectedAdminIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["email"]}</span>
                                                    </p>}
                                                </section>
                                            </td>
                                            <td>
                                                <section className="password mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={admin.password}
                                                        className={`form-control d-block mx-auto p-2 border-2 email-field ${formValidationErrors["password"] && adminIndex === selectedAdminIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter New Password"
                                                        onChange={(e) => changeAdminData(adminIndex, "password", e.target.value)}
                                                    />
                                                    {formValidationErrors["password"] && adminIndex === selectedAdminIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["password"]}</span>
                                                    </p>}
                                                </section>
                                            </td>
                                            <td>
                                                {
                                                    !isUpdatingStatus &&
                                                    !isDeletingStatus &&
                                                    !isSuccessStatus &&
                                                    !isErrorStatus &&
                                                    <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        onClick={() => updateAdminData(adminIndex)}
                                                    >
                                                        Update
                                                    </button>
                                                }
                                                {isUpdatingStatus && adminIndex === selectedAdminIndex && <button
                                                    className="btn btn-info d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Updating ...
                                                </button>}
                                                {isSuccessStatus && adminIndex === selectedAdminIndex && <button
                                                    className="btn btn-success d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Success
                                                </button>}
                                                {
                                                    !isUpdatingStatus &&
                                                    !isDeletingStatus &&
                                                    !isSuccessStatus &&
                                                    !isErrorStatus &&
                                                    <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        onClick={() => deleteAdmin(adminIndex)}
                                                    >
                                                        Delete
                                                    </button>
                                                }
                                                {isDeletingStatus && adminIndex === selectedAdminIndex && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Deleting ...
                                                </button>}
                                                {isSuccessStatus && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Deleting Successful
                                                </button>}
                                                {isErrorStatus && adminIndex === selectedAdminIndex && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Sorry, Someting Went Wrong, Please Repeate The Process !!
                                                </button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>}
                        {allAdminsInsideThePage.length === 0 && !isFilteringAdminsStatus && <p className="alert alert-danger">Sorry, Can't Find Any Stores !!</p>}
                        {isFilteringAdminsStatus && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                            <span className="loader-table-data"></span>
                        </div>}
                        {totalPagesCount > 1 && !isFilteringAdminsStatus &&
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