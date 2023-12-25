import Head from "next/head";
import AdminDashboardSideBar from "@/components/AdminDashboardSideBar";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";

export default function UpdateAndDeleteCategories({ activeParentLink, activeChildLink }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [allCategories, setAllCategories] = useState([]);

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState(false);

    const [successMsg, setSuccessMsg] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.BASE_API_URL}/categories/all-categories`)
            .then((res) => {
                setAllCategories(res.data);
                setIsLoadingPage(false);
            })
            .catch(err => console.log(err));
    }, []);

    const changeCategoryName = (categoryIndex, newValue) => {
        let categoriesTemp = allCategories;
        categoriesTemp[categoryIndex].name = newValue;
        setAllCategories(categoriesTemp);
    }

    const updateCategory = async (categoryIndex) => {
        setIsWaitStatus(true);
        try {
            const res = await axios.put(`${process.env.BASE_API_URL}/categories/${allCategories[categoryIndex]._id}`, {
                newCategoryName: allCategories[categoryIndex].name,
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
            console.log(err.response.data);
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
            if (result === "Deleting Categories Process It Successfuly ...") {
                setSuccessMsg(result);
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    clearTimeout(successTimeout);
                }, 1500);
            }
        }
        catch (err) {
            console.log(err.response.data);
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
                <title>Asfour Store - Update / Delete Categories</title>
            </Head>
            {!isLoadingPage ? <>
                <AdminDashboardSideBar activeParentLink={activeParentLink} activeChildLink={activeChildLink} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr Asfour In Your Update / Delete Categories Page
                    </h1>
                    {allCategories.length > 0 ? <div className="categories-box w-100">
                        <table className="products-table mb-4 managment-table bg-white w-100">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Process</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allCategories.map((category, index) => (
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div> : <p className="alert alert-danger w-100 mx-auto">Sorry, Not Found Any Categories !!</p>}
                </div>
            </> : <LoaderPage />}
        </div>
    );
}

export const getServerSideProps = async ({ query }) => {
    return {
        props: {
            activeParentLink: query.activeParentLink,
            activeChildLink: query.activeChildLink,
        }
    }
}