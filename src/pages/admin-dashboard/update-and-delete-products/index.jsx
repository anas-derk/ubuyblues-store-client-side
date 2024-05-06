import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import { GrFormClose } from "react-icons/gr";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import PaginationBar from "@/components/PaginationBar";
import { getAdminInfo, inputValuesValidation } from "../../../../public/global_functions/validations";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { getProductsCount, getAllProductsInsideThePage, getTimeAndDateByLocalTime, getDateInUTCFormat } from "../../../../public/global_functions/popular";

export default function UpdateAndDeleteProducts() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [adminInfo, setAdminInfo] = useState({});

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [isFilteringProductsStatus, setIsFilteringProductsStatus] = useState(false);

    const [allCategories, setAllCategories] = useState([]);

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [updatingProductIndex, setUpdatingProductIndex] = useState(-1);

    const [updatingProductGalleryImageIndex, setUpdatingProductGalleryImageIndex] = useState(-1);

    const [isWaitChangeProductImage, setIsWaitChangeProductImage] = useState(false);

    const [isWaitChangeProductGalleryImage, setIsWaitChangeProductGalleryImage] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [errorChangeProductImageMsg, setErrorChangeProductImageMsg] = useState("");

    const [errorChangeProductGalleryImageMsg, setErrorChangeProductGalleryImageMsg] = useState("");

    const [errorDeleteProductGalleryImageMsg, setErrorDeleteProductGalleryImageMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [successChangeProductImageMsg, setSuccessChangeProductImageMsg] = useState("");

    const [successChangeProductGalleryImageMsg, setSuccessChangeProductGalleryImageMsg] = useState("");

    const [successDeleteProductGalleryImageMsg, setSuccessDeleteProductGalleryImageMsg] = useState("");

    const [productIndex, setProductIndex] = useState(-1);

    const [isDeleteProductGalleryImage, setIsDeleteProductGalleryImage] = useState(false);

    const [newProductGalleryImageFiles, setNewProductGalleryImageFiles] = useState([]);

    const [isAddingNewImagesToProductGallery, setIsAddingNewImagesToProductGallery] = useState(false);

    const [errorNewImagesToProductGallery, setErrorNewImagesToProductGallery] = useState(false);

    const [successNewImagesToProductGallery, setSuccessNewImagesToProductGallery] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        storeId: "",
        category: "",
    });

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

    const pageSize = 2;

    useEffect(() => {
        const adminToken = localStorage.getItem("asfour-store-admin-user-token");
        if (adminToken) {
            getAdminInfo()
                .then(async (result) => {
                    if (result.error) {
                        localStorage.removeItem("asfour-store-admin-user-token");
                        await router.push("/admin-dashboard/login");
                    } else {
                        const adminDetails = result.data;
                        if (adminDetails.isBlocked) {
                            localStorage.removeItem("asfour-store-admin-user-token");
                            await router.push("/admin-dashboard/login");
                        }
                        else {
                            setAdminInfo(adminDetails);
                            const tempFilters = { ...filters, storeId: adminDetails.storeId };
                            setFilters(tempFilters);
                            setAllCategories((await getAllCategories(getFilteringString(tempFilters))).data);
                            result = await getProductsCount(getFilteringString(tempFilters));
                            if (result.data > 0) {
                                let tempAllProductsInsideThePage = (await getAllProductsInsideThePage(1, pageSize, getFilteringString(tempFilters))).data;
                                setAllProductsInsideThePage(tempAllProductsInsideThePage);
                                setTotalPagesCount(Math.ceil(result.data / pageSize));
                            }
                            setIsLoadingPage(false);
                        }
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
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

    const validateFormFields = (validateDetailsList) => {
        return inputValuesValidation(validateDetailsList);
    }

    const getAllCategories = async (filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/categories/all-categories?${filters ? filters : ""}`)
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getPreviousPage = async () => {
        setIsFilteringProductsStatus(true);
        const newCurrentPage = currentPage - 1;
        setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsFilteringProductsStatus(false);
    }

    const getNextPage = async () => {
        setIsFilteringProductsStatus(true);
        const newCurrentPage = currentPage + 1;
        setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsFilteringProductsStatus(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsFilteringProductsStatus(true);
        setAllProductsInsideThePage((await getAllProductsInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data);
        setCurrentPage(pageNumber);
        setIsFilteringProductsStatus(false);
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.category) filteringString += `category=${filters.category}&`;
        if (filters.storeId) filteringString += `storeId=${filters.storeId}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const filterProductsByCategory = async () => {
        try {
            setIsFilteringProductsStatus(true);
            setCurrentPage(1);
            let filteringString = getFilteringString(filters);
            const result = await getProductsCount(filteringString);
            if (result.data > 0) {
                setAllProductsInsideThePage((await getAllProductsInsideThePage(1, pageSize, filteringString)).data);
                setTotalPagesCount(Math.ceil(result.data / pageSize));
                setIsFilteringProductsStatus(false);
            } else {
                setAllProductsInsideThePage([]);
                setTotalPagesCount(0);
                setIsFilteringProductsStatus(false);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem("asfour-store-admin-user-token");
                await router.push("/admin-dashboard/login");
                return;
            }
            setIsFilteringProductsStatus(false);
            setCurrentPage(-1);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const changeProductData = (productIndex, fieldName, newValue) => {
        let productsDataTemp = allProductsInsideThePage;
        productsDataTemp[productIndex][fieldName] = newValue;
        setAllProductsInsideThePage(productsDataTemp);
    }

    const updateProductImage = async (productIndex) => {
        try {
            setFormValidationErrors({});
            let errorsObject = validateFormFields([
                {
                    name: "image",
                    value: allProductsInsideThePage[productIndex].image,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isImage: {
                            msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Or Webp Image File !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setUpdatingProductIndex(productIndex);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitChangeProductImage(true);
                let formData = new FormData();
                formData.append("productImage", allProductsInsideThePage[productIndex].image);
                const res = await axios.put(`${process.env.BASE_API_URL}/products/update-product-image/${allProductsInsideThePage[productIndex]._id}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem("asfour-store-admin-user-token"),
                    }
                });
                const result = res.data;
                if (!result.error) {
                    setIsWaitChangeProductImage(false);
                    setSuccessChangeProductImageMsg(result.msg);
                    let successTimeout = setTimeout(async () => {
                        setSuccessChangeProductImageMsg("");
                        setCurrentPage(1);
                        setAllProductsInsideThePage((await getAllProductsInsideThePage(1, pageSize)).data);
                        setUpdatingProductIndex(-1);
                        clearTimeout(successTimeout);
                    }, 1500);
                }
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem("asfour-store-admin-user-token");
                await router.push("/admin-dashboard/login");
                return;
            }
            setUpdatingProductIndex(-1);
            setIsWaitChangeProductImage(false);
            setErrorChangeProductImageMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorChangeProductImageMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const updateProductData = async (productIndex) => {
        try {
            setFormValidationErrors({});
            let errorsObject = validateFormFields([
                {
                    name: "name",
                    value: allProductsInsideThePage[productIndex].name,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "price",
                    value: allProductsInsideThePage[productIndex].price,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "description",
                    value: allProductsInsideThePage[productIndex].description,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "discount",
                    value: allProductsInsideThePage[productIndex].discount,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "discount",
                    value: allProductsInsideThePage[productIndex].discount,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        minNumber: {
                            value: 0,
                            msg: "Sorry, Min Number Is: 0 !!",
                        },
                        maxNumber: {
                            value: allProductsInsideThePage[productIndex].price * 0.99,
                            msg: `Sorry, Max Number Is: ${allProductsInsideThePage[productIndex].price * 0.99} !!`,
                        },
                    },
                },
                {
                    name: "discountInOfferPeriod",
                    value: allProductsInsideThePage[productIndex].discountInOfferPeriod,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        minNumber: {
                            value: 0,
                            msg: "Sorry, Min Number Is: 0 !!",
                        },
                        maxNumber: {
                            value: allProductsInsideThePage[productIndex].price * 0.99,
                            msg: `Sorry, Max Number Is: ${allProductsInsideThePage[productIndex].price * 0.99} !!`,
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setUpdatingProductIndex(productIndex);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitStatus(true);
                const res = await axios.put(`${process.env.BASE_API_URL}/products/${allProductsInsideThePage[productIndex]._id}`, {
                    name: allProductsInsideThePage[productIndex].name,
                    price: allProductsInsideThePage[productIndex].price,
                    description: allProductsInsideThePage[productIndex].description,
                    discount: allProductsInsideThePage[productIndex].discount,
                    category: allProductsInsideThePage[productIndex].category,
                    startDiscountPeriod: allProductsInsideThePage[productIndex].startDiscountPeriod,
                    endDiscountPeriod: allProductsInsideThePage[productIndex].endDiscountPeriod,
                    discountInOfferPeriod: allProductsInsideThePage[productIndex].discountInOfferPeriod,
                    offerDescription: allProductsInsideThePage[productIndex].offerDescription,
                }, {
                    headers: {
                        Authorization: localStorage.getItem("asfour-store-admin-user-token"),
                    }
                });
                const result = await res.data;
                setIsWaitStatus(false);
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        clearTimeout(successTimeout);
                    }, 1500);
                }
                setUpdatingProductIndex(-1);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem("asfour-store-admin-user-token");
                await router.push("/admin-dashboard/login");
                return;
            }
            setUpdatingProductIndex(-1);
            setIsWaitStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const deleteProduct = async (productId) => {
        try {
            setIsWaitStatus(true);
            const res = await axios.delete(`${process.env.BASE_API_URL}/products/${productId}`, {
                headers: {
                    Authorization: localStorage.getItem("asfour-store-admin-user-token"),
                }
            });
            const result = await res.data;
            setIsWaitStatus(false);
            if (!result.error) {
                setSuccessMsg(result.msg);
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setIsFilteringProductsStatus(true);
                    setCurrentPage(1);
                    const result = await getProductsCount();
                    if (result.data > 0) {
                        setAllProductsInsideThePage((await getAllProductsInsideThePage(1, pageSize)).data);
                        setTotalPagesCount(Math.ceil(result.data / pageSize));
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
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem("asfour-store-admin-user-token");
                await router.push("/admin-dashboard/login");
                return;
            }
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
            const res = await axios.delete(`${process.env.BASE_API_URL}/products/gallery-images/${allProductsInsideThePage[productIndex]._id}?galleryImagePath=${allProductsInsideThePage[productIndex].galleryImagesPaths[productGalleryImageIndex]}`, {
                headers: {
                    Authorization: localStorage.getItem("asfour-store-admin-user-token"),
                }
            });
            const result = res.data;
            if (!result.error) {
                setIsDeleteProductGalleryImage(false);
                setSuccessDeleteProductGalleryImageMsg(result.msg);
                let successTimeout = setTimeout(async () => {
                    setSuccessDeleteProductGalleryImageMsg("");
                    const newProductGalleryImagePaths = allProductsInsideThePage[productIndex].galleryImagesPaths.filter((path) => path !== allProductsInsideThePage[productIndex].galleryImagesPaths[productGalleryImageIndex]);
                    allProductsInsideThePage[productIndex].galleryImagesPaths = newProductGalleryImagePaths;
                    clearTimeout(successTimeout);
                }, 1500);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem("asfour-store-admin-user-token");
                await router.push("/admin-dashboard/login");
                return;
            }
            setIsDeleteProductGalleryImage(false);
            setErrorDeleteProductGalleryImageMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorDeleteProductGalleryImageMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const changeProductGalleryImage = (productGalleryImageIndex, newValue) => {
        let productsGalleryImagesTemp = newProductGalleryImageFiles;
        productsGalleryImagesTemp[productGalleryImageIndex] = newValue;
        setNewProductGalleryImageFiles(productsGalleryImagesTemp);
    }

    const updateProductGalleryImage = async (productGalleryImageIndex) => {
        try {
            setFormValidationErrors({});
            let errorsObject = validateFormFields([
                {
                    name: "galleryImage",
                    value: newProductGalleryImageFiles[productGalleryImageIndex],
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isImage: {
                            msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Or Webp Image File !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setUpdatingProductGalleryImageIndex(productGalleryImageIndex);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitChangeProductGalleryImage(true);
                let formData = new FormData();
                formData.append("productGalleryImage", newProductGalleryImageFiles[productGalleryImageIndex]);
                const res = await axios.put(`${process.env.BASE_API_URL}/products/update-product-gallery-image/${allProductsInsideThePage[productIndex]._id}?oldGalleryImagePath=${allProductsInsideThePage[productIndex].galleryImagesPaths[productGalleryImageIndex]}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem("asfour-store-admin-user-token"),
                    }
                });
                const result = await res.data;
                if (!result.error) {
                    setIsWaitChangeProductGalleryImage(false);
                    setSuccessChangeProductGalleryImageMsg(result.msg);
                    let successTimeout = setTimeout(async () => {
                        setSuccessChangeProductGalleryImageMsg("");
                        setUpdatingProductGalleryImageIndex(-1);
                        clearTimeout(successTimeout);
                    }, 1500);
                }
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem("asfour-store-admin-user-token");
                await router.push("/admin-dashboard/login");
                return;
            }
            setIsWaitChangeProductGalleryImage(false);
            setUpdatingProductGalleryImageIndex(-1);
            setErrorChangeProductGalleryImageMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorChangeProductGalleryImageMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const addingNewImagesToProductGallery = async (newProductGalleryImageFiles) => {
        try {
            console.log(newProductGalleryImageFiles)
            setFormValidationErrors({});
            let errorsObject = validateFormFields([
                {
                    name: "newGalleryImages",
                    value: newProductGalleryImageFiles,
                    rules: {
                        isImages: {
                            msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Or Webp Image File !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsAddingNewImagesToProductGallery(true);
                let formData = new FormData();
                for (let productGalleryImageFile of newProductGalleryImageFiles) {
                    formData.append("productGalleryImage", productGalleryImageFile);
                }
                const res = await axios.post(`${process.env.BASE_API_URL}/products/adding-new-images-to-product-gallery/${allProductsInsideThePage[productIndex]._id}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem("asfour-store-admin-user-token"),
                    }
                });
                const result = await res.data;
                setIsAddingNewImagesToProductGallery(false);
                if (!result.error) {
                    setIsAddingNewImagesToProductGallery(false);
                    setSuccessNewImagesToProductGallery(result.msg);
                    let successTimeout = setTimeout(async () => {
                        setSuccessNewImagesToProductGallery("");
                        allProductsInsideThePage[productIndex].galleryImagesPaths = allProductsInsideThePage[productIndex].galleryImagesPaths.concat(result.data.newGalleryImagePaths);
                        clearTimeout(successTimeout);
                    }, 1500);
                }
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem("asfour-store-admin-user-token");
                await router.push("/admin-dashboard/login");
                return;
            }
            setIsAddingNewImagesToProductGallery(false);
            setErrorNewImagesToProductGallery("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorNewImagesToProductGallery("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="update-and-delete-product admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Update / Delete Products</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} />
                {productIndex > -1 && <div className="overlay">
                    <div className="gallery-images-box d-flex flex-column align-items-center justify-content-center p-4">
                        <GrFormClose className="close-overlay-icon" onClick={() => setProductIndex(-1)} />
                        <h3 className="fw-bold border-bottom border-2 border-dark pb-2 mb-4">Product Gallery Images</h3>
                        {allProductsInsideThePage[productIndex].galleryImagesPaths.length > 0 ? <div className="gallery-images-table-box w-100 p-3">
                            <table className="gallery-images-table managment-table w-100">
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
                                                {
                                                    !isWaitChangeProductGalleryImage &&
                                                    !errorChangeProductGalleryImageMsg &&
                                                    !successChangeProductGalleryImageMsg &&
                                                    !isDeleteProductGalleryImage &&
                                                    !errorDeleteProductGalleryImageMsg &&
                                                    !successDeleteProductGalleryImageMsg &&
                                                    <button className="btn btn-danger w-50 global-button" onClick={() => deleteImageFromProductImagesGallery(productIndex, index)}>Delete</button>
                                                }
                                                {isDeleteProductGalleryImage && <button
                                                    className="btn btn-info d-block mb-3 mx-auto global-button"
                                                >Please Waiting</button>}
                                                {successDeleteProductGalleryImageMsg && <button
                                                    className="btn btn-success d-block mx-auto global-button"
                                                    disabled
                                                >{successDeleteProductGalleryImageMsg}</button>}
                                                {errorDeleteProductGalleryImageMsg && <button
                                                    className="btn btn-danger d-block mx-auto global-button"
                                                    disabled
                                                >{errorDeleteProductGalleryImageMsg}</button>}
                                                <hr />
                                                <section className="product-gallery-image mb-4">
                                                    <input
                                                        type="file"
                                                        className={`form-control d-block mx-auto p-2 border-2 product-gallery-image-field ${formValidationErrors["galleryImage"] && index === updatingProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        onChange={(e) => changeProductGalleryImage(index, e.target.files[0])}
                                                        accept=".png, .jpg, .webp"
                                                    />
                                                    {formValidationErrors["galleryImage"] && index === updatingProductGalleryImageIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["galleryImage"]}</span>
                                                    </p>}
                                                </section>
                                                {
                                                    !isWaitChangeProductGalleryImage &&
                                                    !errorChangeProductGalleryImageMsg &&
                                                    !successChangeProductGalleryImageMsg &&
                                                    !isDeleteProductGalleryImage &&
                                                    !errorDeleteProductGalleryImageMsg &&
                                                    !successDeleteProductGalleryImageMsg &&
                                                    <button
                                                        className="btn btn-success d-block mx-auto w-50 global-button"
                                                        onClick={() => updateProductGalleryImage(index)}
                                                    >
                                                        Change
                                                    </button>
                                                }
                                                {isWaitChangeProductGalleryImage && <button
                                                    className="btn btn-info d-block mb-3 mx-auto global-button"
                                                >Please Waiting</button>}
                                                {successChangeProductGalleryImageMsg && <button
                                                    className="btn btn-success d-block mx-auto global-button"
                                                    disabled
                                                >{successChangeProductGalleryImageMsg}</button>}
                                                {errorChangeProductGalleryImageMsg && <button
                                                    className="btn btn-danger d-block mx-auto global-button"
                                                    disabled
                                                >{errorChangeProductGalleryImageMsg}</button>}
                                            </td>
                                        </tr>
                                    ))
                                    }
                                </tbody>
                            </table>
                        </div> : <p className="alert alert-danger w-100 border border-2 border-dark">Sorry, There Is No Gallery Images For This Product !!</p>}
                        {allProductsInsideThePage.length === 0 && !isFilteringProductsStatus && <p className="alert alert-danger w-100">Sorry, Can't Find Any Products !!</p>}
                        <div className="add-new-product-images-for-gallery w-100">
                            <h3 className="fw-bold border-bottom border-2 border-dark pb-2 mb-4 mx-auto">Add New Images For Product Gallery Images</h3>
                            <section className="product-gallery-images mb-4">
                                <input
                                    type="file"
                                    className={`form-control d-block mx-auto p-2 border-2 brand-image-field ${formValidationErrors["newGalleryImages"] ? "border-danger mb-3" : "mb-4"}`}
                                    multiple
                                    onChange={(e) => setNewProductGalleryImageFiles(e.target.files)}
                                    accept=".png, .jpg, .webp"
                                />
                                {formValidationErrors["newGalleryImages"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                    <span>{formValidationErrors["newGalleryImages"]}</span>
                                </p>}
                            </section>
                            {
                                newProductGalleryImageFiles.length === 0 &&
                                !isAddingNewImagesToProductGallery &&
                                !successNewImagesToProductGallery &&
                                !errorNewImagesToProductGallery &&
                                <button
                                    className="btn btn-success d-block mx-auto w-50 global-button"
                                    disabled
                                >
                                    Add New Images
                                </button>
                            }
                            {
                                newProductGalleryImageFiles.length > 0 &&
                                !isAddingNewImagesToProductGallery &&
                                !successNewImagesToProductGallery &&
                                !errorNewImagesToProductGallery &&
                                <button
                                    className="btn btn-success d-block mx-auto w-50 global-button"
                                    onClick={() => addingNewImagesToProductGallery(newProductGalleryImageFiles)}
                                >
                                    Add New Images
                                </button>
                            }
                            {isAddingNewImagesToProductGallery && <button
                                className="btn btn-info d-block mb-3 mx-auto global-button"
                            >Please Waiting</button>}
                            {successNewImagesToProductGallery && <button
                                className="btn btn-success d-block mx-auto global-button"
                                disabled
                            >{successNewImagesToProductGallery}</button>}
                            {errorNewImagesToProductGallery && <button
                                className="btn btn-danger d-block mx-auto global-button"
                                disabled
                            >{errorNewImagesToProductGallery}</button>}
                        </div>
                    </div>
                </div>}
                {/* End Overlay */}
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Update / Delete Products Page
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
                                            <section className="product-name mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Enter New Product Name"
                                                    defaultValue={product.name}
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-title-field ${formValidationErrors["name"] && index === updatingProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(index, "name", e.target.value.trim())}
                                                ></input>
                                                {formValidationErrors["name"] && index === updatingProductIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["name"]}</span>
                                                </p>}
                                            </section>
                                        </td>
                                        <td className="product-price-cell">
                                            <section className="product-price mb-4">
                                                <input
                                                    type="number"
                                                    placeholder="Enter New Product Price"
                                                    defaultValue={product.price}
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-title-field ${formValidationErrors["price"] && index === updatingProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(index, "price", e.target.valueAsNumber)}
                                                ></input>
                                                {formValidationErrors["price"] && index === updatingProductIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["price"]}</span>
                                                </p>}
                                            </section>
                                        </td>
                                        <td className="product-description-cell">
                                            <section className="product-description mb-4">
                                                <textarea
                                                    placeholder="Enter New Product Description"
                                                    defaultValue={product.description}
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-title-field ${formValidationErrors["description"] && index === updatingProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(index, "description", e.target.value.trim())}
                                                ></textarea>
                                                {formValidationErrors["description"] && index === updatingProductIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["description"]}</span>
                                                </p>}
                                            </section>
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
                                                onChange={(e) => changeProductData(index, "category", e.target.value)}
                                            >
                                                <option defaultValue="" hidden>Please Select Your Category</option>
                                                {allCategories.map((category) => (
                                                    <option value={category.name} key={category._id}>{category.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="product-price-discount-cell">
                                            <section className="product-price-discount mb-4">
                                                <input
                                                    type="number"
                                                    placeholder="Enter New Discount Price"
                                                    defaultValue={product.discount}
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-title-field ${formValidationErrors["discount"] && index === updatingProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(index, "discount", e.target.valueAsNumber)}
                                                ></input>
                                                {formValidationErrors["discount"] && index === updatingProductIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["discount"]}</span>
                                                </p>}
                                            </section>
                                            <div className="limited-period-box border border-2 p-3 border-dark">
                                                <div className="period-box">
                                                    <h6 className="fw-bold">Start Period</h6>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-control mb-4 border border-dark"
                                                        onChange={(e) => changeProductData(index, "startDiscountPeriod", e.target.value)}
                                                        defaultValue={product.startDiscountPeriod ? getTimeAndDateByLocalTime(product.startDiscountPeriod) : null}
                                                    />
                                                    <h6 className="fw-bold">End Period</h6>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-control mb-4 border border-dark"
                                                        onChange={(e) => changeProductData(index, "endDiscountPeriod", e.target.value)}
                                                        defaultValue={product.endDiscountPeriod ? getTimeAndDateByLocalTime(product.endDiscountPeriod) : null}
                                                    />
                                                    <section className="product-price-discount-in-offer-period mb-4">
                                                        <input
                                                            type="number"
                                                            placeholder="Enter New Discount Price"
                                                            defaultValue={product.discountInOfferPeriod}
                                                            className={`form-control d-block mx-auto p-2 border-2 product-price-discount-in-offer-period-field ${formValidationErrors["discount"] && index === updatingProductIndex ? "border-danger mb-3" : "mb-2"}`}
                                                            onChange={(e) => changeProductData(index, "discountInOfferPeriod", e.target.valueAsNumber)}
                                                        ></input>
                                                        {formValidationErrors["discountInOfferPeriod"] && index === updatingProductIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                            <span>{formValidationErrors["discountInOfferPeriod"]}</span>
                                                        </p>}
                                                    </section>
                                                    <section className="offer-description">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter New Offer Description"
                                                            defaultValue={product.offerDescription}
                                                            className={`form-control d-block mx-auto p-2 border-2 offer-description-field ${formValidationErrors["name"] && index === updatingProductIndex ? "border-danger mb-3" : "mb-2"}`}
                                                            onChange={(e) => changeProductData(index, "offerDescription", e.target.value.trim())}
                                                        ></input>
                                                        {formValidationErrors["offerDescription"] && index === updatingProductIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                            <span>{formValidationErrors["offerDescription"]}</span>
                                                        </p>}
                                                    </section>
                                                </div>
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
                                            <section className="product-image mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-image-field ${formValidationErrors["image"] && index === updatingProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(index, "image", e.target.files[0])}
                                                    accept=".png, .jpg, .webp"
                                                />
                                                {formValidationErrors["image"] && index === updatingProductIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["image"]}</span>
                                                </p>}
                                            </section>
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
                    {allProductsInsideThePage.length === 0 && !isFilteringProductsStatus && <p className="alert alert-danger w-100">Sorry, Can't Find Any Products !!</p>}
                    {isFilteringProductsStatus && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                        <span className="loader-table-data"></span>
                    </div>}
                    {totalPagesCount > 1 && !isFilteringProductsStatus &&
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