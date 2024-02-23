import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import PaginationBar from "@/components/PaginationBar";

export default function UpdateAndDeleteCategories() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [isWaitGetCategoriesStatus, setIsWaitGetCategoriesStatus] = useState(false);

    const [allCategoriesInsideThePage, setAllCategoriesInsideThePage] = useState([]);

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState(false);

    const [successMsg, setSuccessMsg] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const router = useRouter();

    const pageSize = 1;

    useEffect(() => {
        const adminId = localStorage.getItem("asfour-store-admin-user-id");
        if (!adminId) {
            router.push("/admin-dashboard/login");
        } else {
            getCategoriesCount()
                .then(async (result) => {
                    if (result > 0) {
                        const result1 = await getAllCategoriesInsideThePage(1, pageSize);
                        setAllCategoriesInsideThePage(result1);
                        setTotalPagesCount(Math.ceil(result / pageSize));
                    }
                    setIsLoadingPage(false);
                }).catch(() => {
                    setIsLoadingPage(false);
                    setIsErrorMsgOnLoadingThePage(true);
                });
        }
    }, []);

    const getCategoriesCount = async () => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/categories/categories-count`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllCategoriesInsideThePage = async (pageNumber, pageSize) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/categories/all-categories-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getPreviousPage = async () => {
        setIsWaitGetCategoriesStatus(true);
        const newCurrentPage = currentPage - 1;
        setAllCategoriesInsideThePage(await getAllCategoriesInsideThePage(newCurrentPage, pageSize));
        setCurrentPage(newCurrentPage);
        setIsWaitGetCategoriesStatus(false);
    }

    const getNextPage = async () => {
        setIsWaitGetCategoriesStatus(true);
        const newCurrentPage = currentPage + 1;
        setAllCategoriesInsideThePage(await getAllCategoriesInsideThePage(newCurrentPage, pageSize));
        setCurrentPage(newCurrentPage);
        setIsWaitGetCategoriesStatus(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsWaitGetCategoriesStatus(true);
        setAllCategoriesInsideThePage(await getAllCategoriesInsideThePage(pageNumber, pageSize));
        setCurrentPage(pageNumber);
        setIsWaitGetCategoriesStatus(false);
    }

    const changeCategoryName = (categoryIndex, newValue) => {
        let categoriesTemp = allCategories;
        categoriesTemp[categoryIndex].name = newValue;
        setAllCategories(categoriesTemp);
    }

    const updateCategory = async (categoryIndex) => {
        setIsWaitStatus(true);
        try {
            const res = await axios.put(`${process.env.BASE_API_URL}/categories/${allCategoriesInsideThePage[categoryIndex]._id}`, {
                newCategoryName: allCategoriesInsideThePage[categoryIndex].name,
            });
            const result = await res.data;
            setIsWaitStatus(false);
            if (result === "Updating Category Process It Successfuly ...") {
                setSuccessMsg(result);
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    clearTimeout(successTimeout);
                }, 1500);
            }
        }
        catch (err) {
            console.log(err);
            setIsWaitStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const deleteCategory = async (categoryId) => {
        setIsWaitStatus(true);
        try {
            const res = await axios.delete(`${process.env.BASE_API_URL}/categories/${categoryId}`);
            const result = await res.data;
            setIsWaitStatus(false);
            if (!result.isError) {
                setSuccessMsg(result.msg);
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    setAllCategories(result.newCategoiesList);
                    clearTimeout(successTimeout);
                }, 1500);
            }
        }
        catch (err) {
            setIsWaitStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="update-and-delete-category admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Update / Delete Categories</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminPanelHeader />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr Asfour In Your Update / Delete Categories Page
                    </h1>
                    {allCategoriesInsideThePage.length > 0 && !isWaitGetCategoriesStatus && <section className="categories-box w-100">
                        <table className="products-table mb-4 managment-table bg-white w-100">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Process</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allCategoriesInsideThePage.map((category, index) => (
                                    <tr key={category._id}>
                                        <td className="product-name-cell">
                                            <input
                                                type="text"
                                                placeholder="Enter New Category Name"
                                                defaultValue={category.name}
                                                className="p-2 form-control"
                                                onChange={(e) => changeCategoryName(index, e.target.value.trim())}
                                            ></input>
                                        </td>
                                        <td className="update-cell">
                                            {!isWaitStatus && !errorMsg && !successMsg && <>
                                                <button
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                    onClick={() => updateCategory(index)}
                                                >Update</button>
                                                <hr />
                                                <button
                                                    className="btn btn-danger global-button"
                                                    onClick={() => deleteCategory(category._id)}
                                                >Delete</button>
                                            </>}
                                            {isWaitStatus && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                            >Please Waiting</button>}
                                            {successMsg && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>}
                    {allCategoriesInsideThePage.length === 0 && !isWaitGetCategoriesStatus && <p className="alert alert-danger">Sorry, Can't Find Any Categories !!</p>}
                    {isWaitGetCategoriesStatus && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                        <span className="loader-table-data"></span>
                    </div>}
                    {totalPagesCount > 0 && !isWaitGetCategoriesStatus &&
                        <PaginationBar
                            totalPagesCount={totalPagesCount}
                            currentPage={currentPage}
                            getPreviousPage={getPreviousPage}
                            getNextPage={getNextPage}
                            getSpecificPage={getSpecificPage}
                        />
                    }
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}