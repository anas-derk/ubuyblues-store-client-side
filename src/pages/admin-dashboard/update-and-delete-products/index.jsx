import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import { GrFormClose } from "react-icons/gr";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import PaginationBar from "@/components/PaginationBar";

export default function UpdateAndDeleteProducts() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [isFilteringProductsStatus, setIsFilteringProductsStatus] = useState(false);

    const [allCategories, setAllCategories] = useState([]);

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [isWaitChangeProductImage, setIsWaitChangeProductImage] = useState(false);

    const [errorMsg, setErrorMsg] = useState(false);

    const [errorChangeProductImageMsg, setErrorChangeProductImageMsg] = useState(false);

    const [successMsg, setSuccessMsg] = useState(false);

    const [successChangeProductImageMsg, setSuccessChangeProductImageMsg] = useState(false);

    const [productIndex, setProductIndex] = useState(-1);

    const [isDeleteProductGalleryImage, setIsDeleteProductGalleryImage] = useState(false);

    const [productGalleryImageIndex, setProductGalleryImageIndex] = useState(-1);

    const [newProductGalleryImageFile, setNewProductGalleryImageFile] = useState(null);

    const [isUpdatingProductGalleryImage, setIsUpdatingProductGalleryImage] = useState(false);

    const [newProductGalleryImages, setNewProductGalleryImages] = useState([]);

    const [isAddingNewImagesToProductGallery, setIsAddingNewImagesToProductGallery] = useState(false);

    const [isShowPeriodFields, setIsShowPeriodFields] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        category: "",
    });

    const pageSize = 10;

    useEffect(() => {
        const adminToken = localStorage.getItem("asfour-store-admin-user-token");
        if (adminToken) {
            validations.getAdminInfo(adminToken)
                .then(async (res) => {
                    let result = res.data;
                    if (result.error) {
                        localStorage.removeItem("asfour-store-admin-user-token");
                        await router.push("/admin-dashboard/login");
                    } else {
                        res = await getProductsCount();
                        if (result > 0) {
                            const result1 = await getAllProductsInsideThePage(1, pageSize);
                            setAllProductsInsideThePage(result1);
                            setTotalPagesCount(Math.ceil(result / pageSize));
                            res = await axios.get(`${process.env.BASE_API_URL}/categories/all-categories`);
                            setAllCategories(await res.data);
                        }
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
    }, []);

    const getProductsCount = async (filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/products/products-count?${filters ? filters : ""}`);
            const result = await res.data;
            return result;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllProductsInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/products/all-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getPreviousPage = async () => {
        setIsFilteringProductsStatus(true);
        const newCurrentPage = currentPage - 1;
        setAllProductsInsideThePage(await getAllProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters)));
        setCurrentPage(newCurrentPage);
        setIsFilteringProductsStatus(false);
    }

    const getNextPage = async () => {
        setIsFilteringProductsStatus(true);
        const newCurrentPage = currentPage + 1;
        setAllProductsInsideThePage(await getAllProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters)));
        setCurrentPage(newCurrentPage);
        setIsFilteringProductsStatus(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsFilteringProductsStatus(true);
        setAllProductsInsideThePage(await getAllProductsInsideThePage(pageNumber, pageSize, getFilteringString(filters)));
        setCurrentPage(pageNumber);
        setIsFilteringProductsStatus(false);
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.category) filteringString += `category=${filters.category}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const filterProductsByCategory = async () => {
        try {
            setIsFilteringProductsStatus(true);
            setCurrentPage(1);
            let filteringString = getFilteringString(filters);
            const result = await getProductsCount(filteringString);
            if (result > 0) {
                const result1 = await getAllProductsInsideThePage(1, pageSize, filteringString);
                setAllProductsInsideThePage(result1);
                setTotalPagesCount(Math.ceil(result / pageSize));
                setIsFilteringProductsStatus(false);
            } else {
                setAllProductsInsideThePage([]);
                setTotalPagesCount(0);
                setIsFilteringProductsStatus(false);
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    const changeProductData = (productIndex, fieldName, newValue) => {
        let productsDataTemp = allProductsInsideThePage;
        productsDataTemp[productIndex][fieldName] = newValue;
        setAllProductsInsideThePage(productsDataTemp);
    }

    const updateProductImage = async (productIndex) => {
        try {
            setIsWaitChangeProductImage(true);
            let formData = new FormData();
            formData.append("productImage", allProductsInsideThePage[productIndex].image);
            await axios.put(`${process.env.BASE_API_URL}/products/update-product-image/${allProductsInsideThePage[productIndex]._id}`, formData);
            setIsWaitChangeProductImage(false);
            setSuccessChangeProductImageMsg("Updating Product Image Has Been Successfully !!");
            let successTimeout = setTimeout(() => {
                setSuccessChangeProductImageMsg("");
                clearTimeout(successTimeout);
            }, 1500);
        }
        catch (err) {
            console.log(err);
            setIsWaitChangeProductImage(false);
            setErrorChangeProductImageMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorChangeProductImageMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const updateProductData = async (productIndex) => {
        setIsWaitStatus(true);
        try {
            const res = await axios.put(`${process.env.BASE_API_URL}/products/${allProductsInsideThePage[productIndex]._id}`, {
                name: allProductsInsideThePage[productIndex].name,
                price: allProductsInsideThePage[productIndex].price,
                description: allProductsInsideThePage[productIndex].description,
                discount: allProductsInsideThePage[productIndex].discount,
                category: allProductsInsideThePage[productIndex].category,
                startDiscountPeriod: allProductsInsideThePage[productIndex].startDiscountPeriod,
                endDiscountPeriod: allProductsInsideThePage[productIndex].endDiscountPeriod,
            });
            const result = await res.data;
            setIsWaitStatus(false);
            if (result === "Updating Product Process Has Been Successfuly ...") {
                setSuccessMsg(result);
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
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

    const deleteProduct = async (productId) => {
        setIsWaitStatus(true);
        try {
            const res = await axios.delete(`${process.env.BASE_API_URL}/products/${productId}`);
            const result = await res.data;
            setIsWaitStatus(false);
            if (!result.isError) {
                setSuccessMsg(result.msg);
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setIsFilteringProductsStatus(true);
                    setCurrentPage(1);
                    const result = await getProductsCount();
                    if (result > 0) {
                        const result1 = await getAllProductsInsideThePage(1, pageSize);
                        setAllProductsInsideThePage(result1);
                        setTotalPagesCount(Math.ceil(result / pageSize));
                    } else {
                        setAllProductsInsideThePage([]);
                        setTotalPagesCount(0);
                    }
                    setIsFilteringProductsStatus(false);
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

    const deleteImageFromProductImagesGallery = async (productIndex, productGalleryImageIndex) => {
        try {
            setIsDeleteProductGalleryImage(true);
            setProductGalleryImageIndex(productGalleryImageIndex);
            const res = await axios.delete(`${process.env.BASE_API_URL}/products/gallery-images/${allProductsData[productIndex]._id}?galleryImagePath=${allProductsData[productIndex].galleryImagesPaths[productGalleryImageIndex]}`);
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
        try {
            let formData = new FormData();
            formData.append("productGalleryImage", newProductGalleryImageFile);
            setIsUpdatingProductGalleryImage(true);
            setProductGalleryImageIndex(productGalleryImageIndex);
            const res = await axios.put(`${process.env.BASE_API_URL}/products/update-product-gallery-image/${allProductsData[productIndex]._id}?oldGalleryImagePath=${allProductsData[productIndex].galleryImagesPaths[productGalleryImageIndex]}`, formData);
            const newGalleryImagePath = await res.data;
            setIsUpdatingProductGalleryImage(false);
            setProductGalleryImageIndex(-1);
            allProductsData[productIndex].galleryImagesPaths[productGalleryImageIndex] = newGalleryImagePath;
        }
        catch (err) {
            console.log(err);
            setIsUpdatingProductGalleryImage(false);
            setProductGalleryImageIndex(-1);
        }
    }

    const addingNewImagesToProductGallery = async () => {
        try {
            let formData = new FormData();
            for (let productGalleryImage of newProductGalleryImages) {
                formData.append("productGalleryImage", productGalleryImage);
            }
            setIsAddingNewImagesToProductGallery(true);
            const res = await axios.post(`${process.env.BASE_API_URL}/products/adding-new-images-to-product-gallery/${allProductsInsideThePage[productIndex]._id}`, formData);
            const newGalleryImagePaths = await res.data;
            allProductsInsideThePage[productIndex].galleryImagesPaths = allProductsInsideThePage[productIndex].galleryImagesPaths.concat(newGalleryImagePaths);
            setIsAddingNewImagesToProductGallery(false);
        }
        catch (err) {
            console.log(err);
            setIsAddingNewImagesToProductGallery(false);
        }
    }

    return (
        <div className="update-and-delete-product admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Update / Delete Products</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminPanelHeader />
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
                                    {allProductsInsideThePage[productIndex].galleryImagesPaths.map((galleryImagePath, index) => (
                                        <tr key={index}>
                                            <td>
                                                <img
                                                    src={`${process.env.BASE_API_URL}/${galleryImagePath}`}
                                                    className="gallery-image d-block mx-auto"
                                                />
                                            </td>
                                            <td>
                                                {!isDeleteProductGalleryImage && index !== productGalleryImageIndex && <button className="btn btn-danger w-50 global-button" onClick={() => deleteImageFromProductImagesGallery(productIndex, index)}>Delete</button>}
                                                <hr />
                                                <input
                                                    type="file"
                                                    className="form-control w-50 d-block mx-auto mb-3"
                                                    onChange={(e) => setNewProductGalleryImageFile(e.target.files[0])}
                                                />
                                                {!newProductGalleryImageFile && !isUpdatingProductGalleryImage && !isDeleteProductGalleryImage && <button
                                                    className="btn btn-success d-block mx-auto w-50 global-button"
                                                    disabled
                                                >
                                                    Change
                                                </button>}
                                                {newProductGalleryImageFile && !isUpdatingProductGalleryImage && !isDeleteProductGalleryImage && <button
                                                    className="btn btn-success d-block mx-auto w-50 global-button"
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
                        <div className="add-new-product-images-for-gallery w-100">
                            <h3 className="fw-bold border-bottom border-2 border-dark pb-2 mb-4 mx-auto">Add New Images For Product Gallery Images</h3>
                            <input
                                type="file"
                                className="form-control w-50 d-block mx-auto mb-3"
                                multiple
                                onChange={(e) => setNewProductGalleryImages(e.target.files)}
                            />
                            {newProductGalleryImages.length === 0 && !isAddingNewImagesToProductGallery && <button
                                className="btn btn-success d-block mx-auto w-50 global-button"
                                disabled
                            >
                                Add New Images
                            </button>}
                            {newProductGalleryImages.length > 0 && !isAddingNewImagesToProductGallery && <button
                                className="btn btn-success d-block mx-auto w-50 global-button"
                                onClick={() => addingNewImagesToProductGallery()}
                            >
                                Add New Images
                            </button>}
                        </div>
                    </div>
                </div>}
                {/* End Overlay */}
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr Asfour In Your Update / Delete Products Page
                    </h1>
                    <section className="filters mb-3 bg-white border-3 border-info p-3 text-start w-100">
                        <h5 className="section-name fw-bold text-center">Filters: </h5>
                        <hr />
                        <div className="row mb-4">
                            <div className="col-md-12 d-flex align-items-center">
                                <h6 className="me-2 mb-0 fw-bold text-center">Category</h6>
                                <select
                                    className="select-product-category form-select"
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                >
                                    <option value="" hidden>Pleae Select Category</option>
                                    <option value="">All</option>
                                    {allCategories.map((category) => (
                                        <option value={category.name} key={category._id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {!isFilteringProductsStatus && <button
                            className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                            onClick={() => filterProductsByCategory()}
                        >
                            Filter
                        </button>}
                        {isFilteringProductsStatus && <button
                            className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                            disabled
                        >
                            Filtering ...
                        </button>}
                    </section>
                    {allProductsInsideThePage.length > 0 && !isFilteringProductsStatus && <div className="products-box w-100">
                        <table className="products-table mb-4 managment-table bg-white">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Discount</th>
                                    <th>Image</th>
                                    <th>Processes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allProductsInsideThePage.map((product, index) => (
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
                                                className="p-2 form-control mb-4"
                                                onChange={(e) => changeProductData(index, "discount", e.target.valueAsNumber)}
                                            ></input>
                                            <div className="limited-period-box border border-2 p-3 border-dark">
                                                <div className={`form-check pb-2 ${isShowPeriodFields && "border-bottom border-dark mb-4"}`}>
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id="defaultCheck1"
                                                        onChange={(e) => e.target.checked ? setIsShowPeriodFields(true) : setIsShowPeriodFields(false)}
                                                    />
                                                    <label className="form-check-label fw-bold" htmlFor="defaultCheck1">
                                                        For Limited Period
                                                    </label>
                                                </div>
                                                {isShowPeriodFields && <div className="period-box">
                                                    <h6 className="fw-bold">Start Period</h6>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-control mb-4 border border-dark"
                                                        onChange={(e) => changeProductData(index, "startDiscountPeriod", e.target.value)}
                                                        defaultValue={product.startDiscountPeriod}
                                                    />
                                                    <h6 className="fw-bold">End Period</h6>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-control border border-dark"
                                                        onChange={(e) => changeProductData(index, "endDiscountPeriod", e.target.value)}
                                                        defaultValue={product.endDiscountPeriod}
                                                    />
                                                </div>}
                                            </div>
                                        </td>
                                        <td className="product-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${product.imagePath}`}
                                                alt="Product Image !!"
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                            <input
                                                type="file"
                                                className="form-control d-block mx-auto mb-3"
                                                onChange={(e) => changeProductData(index, "image", e.target.files[0])}
                                            />
                                            {!isWaitChangeProductImage && !errorChangeProductImageMsg && !successChangeProductImageMsg &&
                                                <button
                                                    className="btn btn-success d-block mb-3 w-50 mx-auto global-button"
                                                    onClick={() => updateProductImage(index)}
                                                >Change</button>
                                            }
                                            {isWaitChangeProductImage && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                            >Please Waiting</button>}
                                            {successChangeProductImageMsg && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successChangeProductImageMsg}</button>}
                                            {errorChangeProductImageMsg && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorChangeProductImageMsg}</button>}
                                        </td>
                                        <td className="update-cell">
                                            {!isWaitStatus && !errorMsg && !successMsg && <>
                                                <button
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                    onClick={() => setProductIndex(index)}
                                                >Show Gallery</button>
                                                <hr />
                                                <button
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                    onClick={() => updateProductData(index)}
                                                >Update</button>
                                                <hr />
                                                <button
                                                    className="btn btn-danger global-button"
                                                    onClick={() => deleteProduct(product._id)}
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
                    </div>}
                    {allProductsInsideThePage.length === 0 && !isFilteringProductsStatus && <p className="alert alert-danger">Sorry, Can't Find Any Products !!</p>}
                    {isFilteringProductsStatus && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                        <span className="loader-table-data"></span>
                    </div>}
                    {totalPagesCount > 0 && !isFilteringProductsStatus &&
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