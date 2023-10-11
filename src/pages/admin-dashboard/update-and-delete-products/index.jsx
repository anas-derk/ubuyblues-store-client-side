import Head from "next/head";
import AdminDashboardSideBar from "@/components/AdminDashboardSideBar";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import Axios from "axios";

export default function AddNewProduct({ activeParentLink, activeChildLink }) {
    const [allProductsData, setAllProductsData] = useState({ name: "", price: "", description: "", image: null });
    const [isWaitStatus, setIsWaitStatus] = useState(false);
    const [errorMsg, setErrorMsg] = useState(false);
    const [successMsg, setSuccessMsg] = useState(false);
    useEffect(() => {
        Axios.get(`${process.env.BASE_API_URL}/products/all-products`)
        .then((res) => {
            setAllProductsData(res.data);
        })
        .catch(err => console.log(err));
    }, []);
    return (
        <div className="update-and-delete-product admin-dashboard">
            <Head>
                <title>Asfour Store - Update / Delete Products</title>
            </Head>
            <AdminDashboardSideBar activeParentLink={activeParentLink} activeChildLink={activeChildLink} />
            <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
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
                                            onChange={(e) => changeProductName(index, e.target.value.trim())}
                                        ></input>
                                    </td>
                                    <td className="product-price-cell">
                                        <input
                                            type="number"
                                            placeholder="Enter New Product Price"
                                            defaultValue={product.price}
                                            className="p-2 form-control"
                                            onChange={(e) => changeProductPrice(index, e.target.value.trim())}
                                        ></input>
                                    </td>
                                    <td className="product-description-cell">
                                        <textarea
                                            placeholder="Enter New Product Description"
                                            defaultValue={product.description}
                                            className="p-2 form-control"
                                            onChange={(e) => changeProductPrice(index, e.target.value.trim())}
                                        ></textarea>
                                    </td>
                                    <td className="product-image-cell">
                                        <img src={`${process.env.BASE_API_URL}/${product.imagePath}`} alt="Product Image !!" width="100" height="100" />
                                    </td>
                                    <td className="update-cell">
                                        {!isWaitStatus && <>
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