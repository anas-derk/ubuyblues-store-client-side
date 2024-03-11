import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import validations from "../../../../public/global_functions/validations";
import { useRouter } from "next/router";

export default function AddNewProduct() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [token, setToken] = useState("");

    const [allCategories, setAllCategories] = useState([]);

    const [productData, setProductData] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        discount: 0,
        image: null,
        galleryImages: [],
    });

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const productImageFileElementRef = useRef();

    const productGalleryImagesFilesElementRef = useRef();

    const router = useRouter();

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
                        setToken(adminToken);
                        const res = await axios.get(`${process.env.BASE_API_URL}/categories/all-categories`);
                        const result = await res.data;
                        if (!result.error) {
                            setAllCategories(result.data);
                        }
                        setIsLoadingPage(false);
                    }
                })
                .catch(async (err) => {
                    if (err.response.data?.msg === "Unauthorized Error") {
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

    const validateFormFields = () => {
        return validations.inputValuesValidation([
            {
                name: "name",
                value: productData.name,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "price",
                value: productData.price,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "description",
                value: productData.description,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "category",
                value: productData.category,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "discount",
                value: productData.discount,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "image",
                value: productData.image,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                    isImage: {
                        msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Image File !!",
                    },
                },
            },
            {
                name: "galleryImages",
                value: productData.galleryImages,
                rules: {
                    isRequired: {
                        msg: "Sorry, This Field Can't Be Empty !!",
                    },
                    isImages: {
                        msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Image File !!",
                    },
                },
            },
        ]);
    }

    const addNewProduct = async (e, productData) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            let errorsObject = validateFormFields();
            setFormValidationErrors(errorsObject);
            console.log(errorsObject.galleryImages)
            if (Object.keys(errorsObject).length == 0) {
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
                setIsWaitStatus(true);
                const res = await axios.post(`${process.env.BASE_API_URL}/products/add-new-product`, formData, {
                    headers: {
                        Authorization: token,
                    }
                });
                const result = await res.data;
                setIsWaitStatus(false);
                if (!result.error) {
                    setSuccessMsg(result.msg);
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
        }
        catch (err) {
            console.log(err);
            if (err.response.data?.msg === "Unauthorized Error") {
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
                            className={`form-control p-2 border-2 product-name-field ${formValidationErrors["name"] ? "border-danger mb-2" : "mb-4"}`}
                            placeholder="Please Enter Product Name"
                            onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                            value={productData.name}
                        />
                        {formValidationErrors["name"] && <p className="error-msg text-danger">{formValidationErrors["name"]}</p>}
                        <input
                            type="number"
                            className={`form-control p-2 border-2 product-price-field ${formValidationErrors["price"] ? "border-danger mb-2" : "mb-4"}`}
                            placeholder="Please Enter Product Price"
                            onChange={(e) => setProductData({ ...productData, price: e.target.valueAsNumber })}
                            value={productData.price}
                        />
                        {formValidationErrors["price"] && <p className="error-msg text-danger">{formValidationErrors["price"]}</p>}
                        <input
                            type="text"
                            className={`form-control p-2 border-2 product-description-field ${formValidationErrors["description"] ? "border-danger mb-2" : "mb-4"}`}
                            placeholder="Please Enter Product Description"
                            onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                            value={productData.description}
                        />
                        {formValidationErrors["description"] && <p className="error-msg text-danger">{formValidationErrors["description"]}</p>}
                        <select
                            className={`category-select form-select p-2 border-2 category-field ${formValidationErrors["category"] ? "border-danger mb-2" : "mb-4"}`}
                            onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                            required
                        >
                            <option defaultValue="" hidden>Please Select Your Category</option>
                            {allCategories.map((category) => (
                                <option value={category.name} key={category._id}>{category.name}</option>
                            ))}
                        </select>
                        {formValidationErrors["category"] && <p className="error-msg text-danger">{formValidationErrors["category"]}</p>}
                        <input
                            type="number"
                            className={`form-control p-2 border-2 product-price-discount-field ${formValidationErrors["discount"] ? "border-danger mb-2" : "mb-4"}`}
                            placeholder="Please Enter Discount"
                            onChange={(e) => setProductData({ ...productData, discount: e.target.valueAsNumber })}
                            value={productData.discount}
                        />
                        {formValidationErrors["discount"] && <p className="error-msg text-danger">{formValidationErrors["discount"]}</p>}
                        <h6 className="mb-3 fw-bold">Please Select Product Image</h6>
                        <input
                            type="file"
                            className={`form-control p-2 border-2 product-image-field ${formValidationErrors["image"] ? "border-danger mb-2" : "mb-4"}`}
                            placeholder="Please Enter Product Image"
                            onChange={(e) => setProductData({ ...productData, image: e.target.files[0] })}
                            ref={productImageFileElementRef}
                            value={productImageFileElementRef.current?.value}
                        />
                        {formValidationErrors["image"] && <p className="error-msg text-danger">{formValidationErrors["image"]}</p>}
                        <h6 className="mb-3 fw-bold">Please Select Product Gallery Images</h6>
                        <input
                            type="file"
                            className={`form-control p-2 border-2 product-galley-images-field ${formValidationErrors["galleryImages"] ? "border-danger mb-2" : "mb-4"}`}
                            placeholder="Please Enter Product Images Gallery"
                            multiple
                            onChange={(e) => setProductData({ ...productData, galleryImages: e.target.files })}
                            value={productGalleryImagesFilesElementRef.current?.value}
                            ref={productGalleryImagesFilesElementRef}
                        />
                        {formValidationErrors["galleryImages"] && <p className="error-msg text-danger">{formValidationErrors["galleryImages"]}</p>}
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