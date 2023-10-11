import Head from "next/head";
import AdminDashboardSideBar from "@/components/AdminDashboardSideBar";
import { PiHandWavingThin } from "react-icons/pi";
import { useState } from "react";
import Axios from "axios";

export default function AddNewProduct({ activeParentLink, activeChildLink }) {
    const [productData, setProductData] = useState({ name: "", price: "", description: "", image: null });
    const [isWaitStatus, setIsWaitStatus] = useState(false);
    const [errorMsg, setErrorMsg] = useState(false);
    const [successMsg, setSuccessMsg] = useState(false);
    const addNewProduct = async (e, productData) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append("name", productData.name);
        formData.append("price", productData.price);
        formData.append("description", productData.description);
        formData.append("image", productData.image);
        try {
            setIsWaitStatus(true);
            const res = await Axios.post(`${process.env.BASE_API_URL}/products/add-new-product`, formData);
            const result = await res.data;
            setIsWaitStatus(false);
            if (result === "Adding New Product Process It Successfuly ...") {
                setSuccessMsg(result);
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    clearTimeout(successTimeout);
                }, 1500);
            }
        }
        catch (err) {
            console.log(err.response.data);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }
    return (
        <div className="add-new-product admin-dashboard">
            <Head>
                <title>Asfour Store - Add New Product</title>
            </Head>
            <AdminDashboardSideBar activeParentLink={activeParentLink} activeChildLink={activeChildLink} />
            <div className="page-content d-flex justify-content-center align-items-center flex-column">
                <h1 className="fw-bold w-fit pb-2 mb-3">
                    <PiHandWavingThin className="me-2" />
                    Hi, Mr Asfour In Your Add New Product Page
                </h1>
                <form className="add-new-product-form w-50" onSubmit={(e) => addNewProduct(e, productData)}>
                    <input
                        type="text"
                        className="form-control product-name-field p-2 mb-4"
                        placeholder="Please Enter Product Name"
                        required
                        onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                    />
                    <input
                        type="number"
                        className="form-control product-price-field p-2 mb-4"
                        placeholder="Please Enter Product Price"
                        required
                        onChange={(e) => setProductData({ ...productData, price: e.target.valueAsNumber })}
                    />
                    <input
                        type="text"
                        className="form-control product-description-field p-2 mb-4"
                        placeholder="Please Enter Product Description"
                        required
                        onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    />
                    <input
                        type="file"
                        className="form-control product-image-field p-2 mb-4"
                        placeholder="Please Enter Product Image"
                        required
                        onChange={(e) => setProductData({ ...productData, image: e.target.files[0] })}
                    />
                    {!isWaitStatus && !successMsg && !errorMsg && <button
                        type="submit"
                        className="btn btn-success w-50 d-block mx-auto p-2"
                    >
                        Add Now
                    </button>}
                    {isWaitStatus && <button
                        type="button"
                        className="btn btn-danger w-50 d-block mx-auto p-2"
                        disabled
                    >
                        Waiting Add New Product ...
                    </button>}
                    {errorMsg && <button
                        type="button"
                        className="btn btn-danger w-50 d-block mx-auto p-2"
                        disabled
                    >
                        {errorMsg}
                    </button>}
                    {successMsg && <button
                        type="button"
                        className="btn btn-success w-75 d-block mx-auto p-2"
                        disabled
                    >
                        {successMsg}
                    </button>}
                </form>
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