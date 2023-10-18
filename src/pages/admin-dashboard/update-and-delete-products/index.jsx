import Head from "next/head";
import AdminDashboardSideBar from "@/components/AdminDashboardSideBar";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import Axios from "axios";

export default function UpdateAndDeleteProducts({ activeParentLink, activeChildLink }) {
    const [allProductsData, setAllProductsData] = useState({ name: "", price: "", description: "", image: null });
    const [allCategories, setAllCategories] = useState([]);
    const [isWaitStatus, setIsWaitStatus] = useState(false);
    const [errorMsg, setErrorMsg] = useState(false);
    const [successMsg, setSuccessMsg] = useState(false);
    useEffect(() => {
        Axios.get(`${process.env.BASE_API_URL}/products/all-products`)
            .then((res) => {
                setAllProductsData(res.data);
                Axios.get(`${process.env.BASE_API_URL}/categories/all-categories`)
                    .then((res) => {
                        setAllCategories(res.data);
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    }, []);
    const changeProductData = (productIndex, fieldName, newValue) => {
        let productsDataTemp = allProductsData;
        productsDataTemp[productIndex][fieldName] = newValue;
        console.log(productsDataTemp);
        setAllProductsData(productsDataTemp);
    }
    const updateProduct = async (productIndex) => {
        setIsWaitStatus(true);
        try {
            const res = await Axios.put(`${process.env.BASE_API_URL}/products/${allProductsData[productIndex]._id}`, {
                name: allProductsData[productIndex].name,
                price: allProductsData[productIndex].price,
                description: allProductsData[productIndex].description,
                discount: allProductsData[productIndex].discount,
                category: allProductsData[productIndex].category,
            });
            const result = await res.data;
            setIsWaitStatus(false);
            if (result === "Updating New Product Process It Successfuly ...") {
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
    const deleteProduct = async (productId) => {
        setIsWaitStatus(true);
        try {
            const res = await Axios.delete(`${process.env.BASE_API_URL}/products/${productId}`);
            const result = await res.data;
            setIsWaitStatus(false);
            if (result === "Deleting New Product Process It Successfuly ...") {
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
        <div className="update-and-delete-product admin-dashboard">
            <Head>
                <title>Asfour Store - Update / Delete Products</title>
            </Head>
            <AdminDashboardSideBar activeParentLink={activeParentLink} activeChildLink={activeChildLink} />
            <div className="page-content d-flex justify-content-center align-items-center flex-column p-4">
                <h1 className="fw-bold w-fit pb-2 mb-4">
                    <PiHandWavingThin className="me-2" />
                    Hi, Mr Asfour In Your Update / Delete Products Page
                </h1>
                {allProductsData.length > 0 ? <div className="products-box w-100">
                    <table className="products-table mb-4 managment-table bg-white w-100">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Discount</th>
                                <th>Image</th>
                                <th>Process</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allProductsData.map((product, index) => (
                                <tr key={product._id}>
                                    <td className="product-name-cell">
                                        <input
                                            type="text"
                                            placeholder="Enter New Product Name"
                                            defaultValue={product.name}
                                            className="p-2 form-control"
                                            onChange={(e) => changeProductData(index, "name", e.target.value.trim())}
                                        ></input>
                                    </td>
                                    <td className="product-price-cell">
                                        <input
                                            type="number"
                                            placeholder="Enter New Product Price"
                                            defaultValue={product.price}
                                            className="p-2 form-control"
                                            onChange={(e) => changeProductData(index, "price", e.target.valueAsNumber)}
                                        ></input>
                                    </td>
                                    <td className="product-description-cell">
                                        <textarea
                                            placeholder="Enter New Product Description"
                                            defaultValue={product.description}
                                            className="p-2 form-control"
                                            onChange={(e) => changeProductData(index, "description", e.target.value.trim())}
                                        ></textarea>
                                    </td>
                                    <td className="product-category-cell">
                                        <input
                                            type="text"
                                            disabled
                                            defaultValue={product.category}
                                            className="p-2 form-control mb-3"
                                        ></input>
                                        <hr />
                                        <select
                                            className="product-category-select form-select mb-4"
                                            required
                                            onChange={(e) => changeProductData(index, "category", e.target.value)}
                                        >
                                            <option defaultValue="" hidden>Please Select Your Category</option>
                                            {allCategories.map((category) => (
                                                <option value={category.name} key={category._id}>{category.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="product-price-discount-cell">
                                        <input
                                            type="number"
                                            placeholder="Enter New Discount Price"
                                            defaultValue={product.discount}
                                            className="p-2 form-control"
                                            onChange={(e) => changeProductData(index, "discount", e.target.valueAsNumber)}
                                        ></input>
                                    </td>
                                    <td className="product-image-cell">
                                        <img src={`${process.env.BASE_API_URL}/${product.imagePath}`} alt="Product Image !!" width="100" height="100" />
                                    </td>
                                    <td className="update-cell">
                                        {!isWaitStatus && !errorMsg && !successMsg && <>
                                            <button
                                                className="btn btn-success d-block mb-3 mx-auto"
                                                onClick={() => updateProduct(index)}
                                            >Update</button>
                                            <hr />
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => deleteProduct(product._id)}
                                            >Delete</button>
                                        </>}
                                        {isWaitStatus && <button
                                            className="btn btn-info d-block mb-3 mx-auto"
                                        >Please Waiting</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div> : <p className="alert alert-danger w-100 mx-auto">Sorry, Not Found Any Products !!</p>}
            </div>
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