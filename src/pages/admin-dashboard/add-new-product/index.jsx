import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import validations from "../../../../public/global_functions/validations";

export default function AddNewProduct() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [allCategories, setAllCategories] = useState([]);

    const [productData, setProductData] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        discount: "",
        image: null,
        galleryImages: [],
    });

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const productImageFileElementRef = useRef();

    const productGalleryImagesFilesElementRef = useRef();

    useEffect(() => {
        const adminToken = localStorage.getItem("asfour-store-admin-user-token");
        if (adminToken) {
            validations.getAdminInfo(adminToken)
                .then(async (res) => {
                    const result = res.data;
                    if (result.error) {
                        localStorage.removeItem("asfour-store-admin-user-token");
                        await router.push("/admin-dashboard/login");
                    } else {
                        const res = await axios.get(`${process.env.BASE_API_URL}/categories/all-categories`);
                        setAllCategories(res.data);
                        setIsLoadingPage(false);
                    }
                })
                .catch(async (err) => {
                    if (err.response.data?.msg === "jwt expired") {
                        localStorage.removeItem("asfour-store-admin-user-token");
                        await router.push("/admin-dashboard/login");
                    }
                    else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else router.push("/admin-dashboard/login");
        axios.get(`${process.env.BASE_API_URL}/categories/all-categories`)
            .then((res) => {
                setAllCategories(res.data);
                setIsLoadingPage(false);
            })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
    }, []);

    const addNewProduct = async (e, productData) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append("name", productData.name);
        formData.append("price", productData.price);
        formData.append("description", productData.description);
        formData.append("category", productData.category);
        formData.append("discount", productData.discount);
        formData.append("productImage", productData.image);
        for (let galleryImage of productData.galleryImages) {
            formData.append("galleryImages", galleryImage);
        }
        try {
            setIsWaitStatus(true);
            const res = await axios.post(`${process.env.BASE_API_URL}/products/add-new-product`, formData);
            const result = await res.data;
            setIsWaitStatus(false);
            if (result === "Adding New Product Process It Successfuly ...") {
                setSuccessMsg(result);
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    setProductData({
                        name: "",
                        price: "",
                        description: "",
                        category: productData.category,
                        discount: "",
                        image: null,
                        galleryImages: [],
                    });
                    productImageFileElementRef.current.value = "";
                    productGalleryImagesFilesElementRef.current.value = "";
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
        <div className="add-new-product admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Add New Product</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminPanelHeader />
                <div className="page-content d-flex justify-content-center align-items-center flex-column">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr Asfour In Your Add New Product Page
                    </h1>
                    {allCategories.length > 0 ? <form className="add-new-product-form w-50" onSubmit={(e) => addNewProduct(e, productData)}>
                        <input
                            type="text"
                            className="form-control product-name-field p-2 mb-4"
                            placeholder="Please Enter Product Name"
                            required
                            onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                            value={productData.name}
                        />
                        <input
                            type="number"
                            className="form-control product-price-field p-2 mb-4"
                            placeholder="Please Enter Product Price"
                            required
                            onChange={(e) => setProductData({ ...productData, price: e.target.valueAsNumber })}
                            value={productData.price}
                        />
                        <input
                            type="text"
                            className="form-control product-description-field p-2 mb-4"
                            placeholder="Please Enter Product Description"
                            required
                            onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                            value={productData.description}
                        />
                        <select
                            className="category-select form-select mb-4"
                            required
                            onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                        >
                            <option defaultValue="" hidden>Please Select Your Category</option>
                            {allCategories.map((category) => (
                                <option value={category.name} key={category._id}>{category.name}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            className="form-control product-price-discount-field p-2 mb-4"
                            placeholder="Please Enter Discount"
                            required
                            onChange={(e) => setProductData({ ...productData, discount: e.target.valueAsNumber })}
                            value={productData.discount}
                        />
                        <h6 className="mb-3 fw-bold">Please Select Product Image</h6>
                        <input
                            type="file"
                            className="form-control product-image-field p-2 mb-4"
                            placeholder="Please Enter Product Image"
                            required
                            onChange={(e) => setProductData({ ...productData, image: e.target.files[0] })}
                            ref={productImageFileElementRef}
                            value={productImageFileElementRef.current?.value}
                        />
                        <h6 className="mb-3 fw-bold">Please Select Product Gallery Images</h6>
                        <input
                            type="file"
                            className="form-control product-images-gallery-field p-2 mb-4"
                            placeholder="Please Enter Product Images Gallery"
                            required
                            multiple
                            onChange={(e) => setProductData({ ...productData, galleryImages: e.target.files })}
                            value={productGalleryImagesFilesElementRef.current?.value}
                            ref={productGalleryImagesFilesElementRef}
                        />
                        {!isWaitStatus && !successMsg && !errorMsg && <button
                            type="submit"
                            className="btn btn-success w-50 d-block mx-auto p-2 global-button"
                        >
                            Add Now
                        </button>}
                        {isWaitStatus && <button
                            type="button"
                            className="btn btn-danger w-50 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            Waiting Add New Product ...
                        </button>}
                        {errorMsg && <button
                            type="button"
                            className="btn btn-danger w-50 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {errorMsg}
                        </button>}
                        {successMsg && <button
                            type="button"
                            className="btn btn-success w-75 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {successMsg}
                        </button>}
                    </form> : <p className="alert alert-danger w-75 mx-auto">Sorry, Not Found Any Products !!, Please Enter At Least One Category ...</p>}
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}