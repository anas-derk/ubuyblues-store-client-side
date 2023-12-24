import Head from "next/head";
import AdminDashboardSideBar from "@/components/AdminDashboardSideBar";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import { GrFormClose } from "react-icons/gr";
import LoaderPage from "@/components/LoaderPage";

export default function UpdateAndDeleteProducts({ activeParentLink, activeChildLink }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [allCategories, setAllCategories] = useState([]);

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState(false);

    const [successMsg, setSuccessMsg] = useState(false);

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

    const [pageNumber, setPageNumber] = useState(0);

    const pageSize = 5;

    useEffect(() => {
        getProductsCount()
            .then(async (result) => {
                if (result > 0) {
                    const result1 = await getAllProductsInsideThePage(1, pageSize);
                    setAllProductsInsideThePage(result1);
                    setTotalPagesCount(Math.ceil(result / pageSize));
                    const res = await axios.get(`${process.env.BASE_API_URL}/categories/all-categories`);
                    setAllCategories(await res.data);
                }
                setIsLoadingPage(false);
            });
    }, []);

    const getProductsCount = async () => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/products/products-count`);
            const result = await res.data;
            return result;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllProductsInsideThePage = async (pageNumber, pageSize) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/products/all-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const changeProductData = (productIndex, fieldName, newValue) => {
        let productsDataTemp = allProductsData;
        productsDataTemp[productIndex][fieldName] = newValue;
        setAllProductsData(productsDataTemp);
    }

    const updateProductImage = async (productIndex) => {
        try {
            let formData = new FormData();
            formData.append("productImage", allProductsData[productIndex].image);
            const res = await axios.put(`${process.env.BASE_API_URL}/products/update-product-image/${allProductsData[productIndex]._id}`, formData);
            const result = await res.data;
        }
        catch (err) {
            console.log(err);
        }
    }

    const updateProductData = async (productIndex) => {
        setIsWaitStatus(true);
        try {
            const res = await axios.put(`${process.env.BASE_API_URL}/products/${allProductsData[productIndex]._id}`, {
                name: allProductsData[productIndex].name,
                price: allProductsData[productIndex].price,
                description: allProductsData[productIndex].description,
                discount: allProductsData[productIndex].discount,
                category: allProductsData[productIndex].category,
                startDiscountPeriod: allProductsData[productIndex].startDiscountPeriod,
                endDiscountPeriod: allProductsData[productIndex].endDiscountPeriod,
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
            const res = await axios.delete(`${process.env.BASE_API_URL}/products/${productId}`);
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
            const res = await axios.post(`${process.env.BASE_API_URL}/products/adding-new-images-to-product-gallery/${allProductsData[productIndex]._id}`, formData);
            const newGalleryImagePaths = await res.data;
            allProductsData[productIndex].galleryImagesPaths = allProductsData[productIndex].galleryImagesPaths.concat(newGalleryImagePaths);
            setIsAddingNewImagesToProductGallery(false);
        }
        catch (err) {
            console.log(err);
            setIsAddingNewImagesToProductGallery(false);
        }
    }

    const paginationBar = () => {
        const paginationButtons = [];
        for (let i = 1; i <= totalPagesCount; i++) {
            if (i < 11) {
                paginationButtons.push(
                    <button
                        key={i}
                        className={`pagination-button me-3 p-2 ps-3 pe-3 ${currentPage === i ? "selection" : ""} ${i === 1 ? "ms-3" : ""}`}
                        onClick={async () => {
                            setIsFilteringOrdersStatus(true);
                            setAllOrdersInsideThePage(await getAllOrdersInsideThePage(i, pageSize));
                            setCurrentPage(i);
                            setIsFilteringOrdersStatus(false);
                        }}
                    >
                        {i}
                    </button>
                );
            }
        }
        if (totalPagesCount > 10) {
            paginationButtons.push(
                <span className="me-3 fw-bold" key={`${Math.random()}-${Date.now()}`}>...</span>
            );
            paginationButtons.push(
                <button
                    key={totalPagesCount}
                    className={`pagination-button me-3 p-2 ps-3 pe-3 ${currentPage === totalPagesCount ? "selection" : ""}`}
                    onClick={async () => {
                        setIsFilteringOrdersStatus(true);
                        setAllOrdersInsideThePage(await getAllOrdersInsideThePage(pageNumber, pageSize));
                        setCurrentPage(pageNumber);
                        setIsFilteringOrdersStatus(false);
                    }}
                >
                    {totalPagesCount}
                </button>
            );
        }
        return (
            <section className="pagination d-flex justify-content-center align-items-center">
                {currentPage !== 1 && <BsArrowLeftSquare
                    className="previous-page-icon pagination-icon"
                    onClick={getPreviousPage}
                />}
                {paginationButtons}
                {currentPage !== totalPagesCount && <BsArrowRightSquare
                    className="next-page-icon pagination-icon me-3"
                    onClick={getNextPage}
                />}
                <span className="current-page-number-and-count-of-pages p-2 ps-3 pe-3 bg-secondary text-white me-3">The Page {currentPage} of {totalPagesCount} Pages</span>
                <form
                    className="navigate-to-specific-page-form w-25"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setIsFilteringOrdersStatus(true);
                        setAllOrdersInsideThePage(await getAllOrdersInsideThePage(pageNumber, pageSize));
                        setCurrentPage(pageNumber);
                        setIsFilteringOrdersStatus(false);
                    }}
                >
                    <input
                        type="number"
                        className="form-control p-1 ps-2 page-number-input"
                        placeholder="Enter Page Number"
                        min="1"
                        max={totalPagesCount}
                        onChange={(e) => setPageNumber(e.target.valueAsNumber)}
                    />
                </form>
            </section>
        );
    }

    return (
        <div className="update-and-delete-product admin-dashboard">
            <Head>
                <title>Asfour Store - Update / Delete Products</title>
            </Head>
            {!isLoadingPage ? <>
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
                    {allProductsInsideThePage.length > 0 ? <div className="products-box w-100">
                        <table className="products-table mb-4 managment-table bg-white">
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
                                            <button
                                                className="btn btn-success d-block mx-auto w-50 global-button"
                                                onClick={() => updateProductImage(index)}
                                            >
                                                Change
                                            </button>
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {totalPagesCount > 0 && paginationBar()}
                    </div> : <p className="alert alert-danger w-100 mx-auto">Sorry, Not Found Any Products !!</p>}
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