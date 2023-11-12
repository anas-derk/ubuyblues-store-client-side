import Head from "next/head";
import AdminDashboardSideBar from "@/components/AdminDashboardSideBar";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import Axios from "axios";
import { GrFormClose } from "react-icons/gr";

export default function UpdateAndDeleteProducts({ activeParentLink, activeChildLink }) {
    const [allProductsData, setAllProductsData] = useState({ name: "", price: "", description: "", category: "", discount: 0, image: null });
    const [allCategories, setAllCategories] = useState([]);
    const [isWaitStatus, setIsWaitStatus] = useState(false);
    const [errorMsg, setErrorMsg] = useState(false);
    const [successMsg, setSuccessMsg] = useState(false);
    const [productIndex, setProductIndex] = useState(-1);
    const [isDeleteProductGalleryImage, setIsDeleteProductGalleryImage] = useState(false);
    const [productGalleryImageIndex, setProductGalleryImageIndex] = useState(-1);
    const [newProductGalleryImageFile, setNewProductGalleryImageFile] = useState(null);
    const [isUpdatingProductGalleryImage, setIsUpdatingProductGalleryImage] = useState(false);
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
            if (result === "Deleting Product Process It Successfuly ...") {
                setSuccessMsg(result);
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    setAllProductsData(allProductsData.filter((product) => product._id !== productId));
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
    const deleteImageFromProductImagesGallery = async (productIndex, productGalleryImageIndex) => {
        try {
            setIsDeleteProductGalleryImage(true);
            setProductGalleryImageIndex(productGalleryImageIndex);
            const res = await Axios.delete(`${process.env.BASE_API_URL}/products/gallery-images/${allProductsData[productIndex]._id}?galleryImagePath=${allProductsData[productIndex].galleryImagesPaths[productGalleryImageIndex]}`);
            await res.data;
            setIsDeleteProductGalleryImage(false);
            setProductGalleryImageIndex(-1);
            const newProductGalleryImagePaths = allProductsData[productIndex].galleryImagesPaths.filter((path) => path !== allProductsData[productIndex].galleryImagesPaths[productGalleryImageIndex]);
            allProductsData[productIndex].galleryImagesPaths = newProductGalleryImagePaths;
        }
        catch (err) {
            setIsUpdatingProductGalleryImage(false);
            setProductGalleryImageIndex(-1);
            console.log(err);
        }
    }
    const changeProductGalleryImage = async (productGalleryImageIndex) => {
        try{
            let formData = new FormData();
            formData.append("productGalleryImage", newProductGalleryImageFile);
            setIsUpdatingProductGalleryImage(true);
            setProductGalleryImageIndex(productGalleryImageIndex);
            const res = await Axios.put(`${process.env.BASE_API_URL}/products/update-product-gallery-image/${allProductsData[productIndex]._id}?oldGalleryImagePath=${allProductsData[productIndex].galleryImagesPaths[productGalleryImageIndex]}`, formData);
            const newGalleryImagePath = await res.data;
            setIsUpdatingProductGalleryImage(false);
            setProductGalleryImageIndex(-1);
            allProductsData[productIndex].galleryImagesPaths[productGalleryImageIndex] = newGalleryImagePath;
        }
        catch(err) {
            console.log(err);
            setIsUpdatingProductGalleryImage(false);
            setProductGalleryImageIndex(-1);
        }
    }
    return (
        <div className="update-and-delete-product admin-dashboard">
            <Head>
                <title>Asfour Store - Update / Delete Products</title>
            </Head>
            <AdminDashboardSideBar activeParentLink={activeParentLink} activeChildLink={activeChildLink} />
            {productIndex > -1 && <div className="overlay">
                <div className="gallery-images-box d-flex flex-column align-items-center justify-content-center p-4">
                    <GrFormClose className="close-overlay-icon" onClick={() => setProductIndex(-1)} />
                    <h3 className="fw-bold border-bottom border-2 border-dark pb-2 mb-4">Product Gallery Images</h3>
                    <div className="gallery-images-table-box w-100 p-3">
                        <table className="gallery-images-table w-100">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Process</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allProductsData[productIndex].galleryImagesPaths.map((galleryImagePath, index) => (
                                    <tr key={index}>
                                        <td>
                                            <img
                                                src={`${process.env.BASE_API_URL}/${galleryImagePath}`}
                                                className="gallery-image d-block mx-auto"
                                            />
                                        </td>
                                        <td>
                                            {!isDeleteProductGalleryImage && index !== productGalleryImageIndex && <button className="btn btn-danger w-50" onClick={() => deleteImageFromProductImagesGallery(productIndex, index)}>Delete</button>}
                                            <hr />
                                            <input
                                                type="file"
                                                className="form-control w-50 d-block mx-auto mb-3"
                                                onChange={(e) => setNewProductGalleryImageFile(e.target.files[0])}
                                            />
                                            {!newProductGalleryImageFile && !isUpdatingProductGalleryImage && !isDeleteProductGalleryImage && <button
                                                className="btn btn-success d-block mx-auto w-50"
                                                disabled
                                            >
                                                Change
                                            </button>}
                                            {newProductGalleryImageFile && !isUpdatingProductGalleryImage && !isDeleteProductGalleryImage && <button
                                                className="btn btn-success d-block mx-auto w-50"
                                                onClick={() => changeProductGalleryImage(index)}
                                            >
                                                Change
                                            </button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>}
            {/* End Overlay */}
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
                                                onClick={() => setProductIndex(index)}
                                            >Show Gallery</button>
                                            <hr />
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