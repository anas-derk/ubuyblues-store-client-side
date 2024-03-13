import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import PaginationBar from "@/components/PaginationBar";
import validations from "../../../../public/global_functions/validations";
import { HiOutlineBellAlert } from "react-icons/hi2";

export default function UpdateAndDeleteBrands() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [token, setToken] = useState("");

    const [isWaitGetBrandsStatus, setIsWaitGetBrandsStatus] = useState(false);

    const [allBrandsInsideThePage, setAllBrandsInsideThePage] = useState([]);

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [updatedBrandIndex, setUpdatedBrandIndex] = useState(-1);

    const [isWaitChangeBrandImage, setIsWaitChangeBrandImage] = useState(false);

    const [errorMsg, setErrorMsg] = useState(false);

    const [errorChangeBrandImageMsg, setErrorChangeBrandImageMsg] = useState(false);

    const [successMsg, setSuccessMsg] = useState(false);

    const [successChangeBrandImageMsg, setSuccessChangeBrandImageMsg] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

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
                        result = await getBrandsCount();
                        if (result.data > 0) {
                            setAllBrandsInsideThePage((await getAllBrandsInsideThePage(1, pageSize)).data);
                            setTotalPagesCount(Math.ceil(result.data / pageSize));
                        }
                        setToken(adminToken);
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
    }, []);

    const validateFormFields = (validateDetailsList) => {
        return validations.inputValuesValidation(validateDetailsList);
    }

    const getBrandsCount = async () => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/brands/brands-count`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllBrandsInsideThePage = async (pageNumber, pageSize) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/brands/all-brands-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getPreviousPage = async () => {
        setIsWaitGetBrandsStatus(true);
        const newCurrentPage = currentPage - 1;
        setAllBrandsInsideThePage((await getAllBrandsInsideThePage(newCurrentPage, pageSize)).data);
        setCurrentPage(newCurrentPage);
        setIsWaitGetBrandsStatus(false);
    }

    const getNextPage = async () => {
        setIsWaitGetBrandsStatus(true);
        const newCurrentPage = currentPage + 1;
        setAllBrandsInsideThePage((await getAllBrandsInsideThePage(newCurrentPage, pageSize)).data);
        setCurrentPage(newCurrentPage);
        setIsWaitGetBrandsStatus(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsWaitGetBrandsStatus(true)
        setAllBrandsInsideThePage((await getAllBrandsInsideThePage(pageNumber, pageSize)).data);
        setCurrentPage(pageNumber);
        setIsWaitGetBrandsStatus(false);
    }

    const changeBrandData = (brandIndex, fieldName, newValue) => {
        let brandsDataTemp = allBrandsInsideThePage;
        brandsDataTemp[brandIndex][fieldName] = newValue;
        setAllBrandsInsideThePage(brandsDataTemp);
    }

    const updateBrandImage = async (brandIndex) => {
        try {
            setFormValidationErrors({});
            let errorsObject = validateFormFields([
                {
                    name: "image",
                    value: allBrandsInsideThePage[brandIndex].image,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isImage: {
                            msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Image File !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setUpdatedBrandIndex(brandIndex);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitChangeBrandImage(true);
                let formData = new FormData();
                formData.append("brandImage", allBrandsInsideThePage[brandIndex].image);
                const res = await axios.put(`${process.env.BASE_API_URL}/brands/update-brand-image/${allBrandsInsideThePage[brandIndex]._id}`, formData, {
                    headers: {
                        Authorization: token,
                    }
                });
                const result = res.data;
                if (!result.error) {
                    setIsWaitChangeBrandImage(false);
                    setSuccessChangeBrandImageMsg(result.msg);
                    let successTimeout = setTimeout(async () => {
                        setSuccessChangeBrandImageMsg("");
                        setAllBrandsInsideThePage((await getAllBrandsInsideThePage(1, pageSize)).data);
                        clearTimeout(successTimeout);
                    }, 1500);
                }
                setUpdatedBrandIndex(-1);
            }
        }
        catch (err) {
            if (err.response.data?.msg === "Unauthorized Error") {
                await router.push("/admin-dashboard/login");
                return;
            }
            setUpdatedBrandIndex(-1);
            setIsWaitChangeBrandImage(false);
            setErrorChangeBrandImageMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorChangeBrandImageMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const updateBrandInfo = async (brandIndex) => {
        try {
            setFormValidationErrors({});
            let errorsObject = validateFormFields([
                {
                    name: "title",
                    value: allBrandsInsideThePage[brandIndex].title,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setUpdatedBrandIndex(brandIndex);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitStatus(true);
                const res = await axios.put(`${process.env.BASE_API_URL}/brands/${allBrandsInsideThePage[brandIndex]._id}`, {
                    newBrandTitle: allBrandsInsideThePage[brandIndex].title,
                }, {
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
                        clearTimeout(successTimeout);
                    }, 1500);
                }
                setUpdatedBrandIndex(-1);
            }
        }
        catch (err) {
            if (err.response.data?.msg === "Unauthorized Error") {
                await router.push("/admin-dashboard/login");
                return;
            }
            setUpdatedBrandIndex(-1);
            setIsWaitStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const deleteBrand = async (brandId) => {
        try {
            setIsWaitStatus(true);
            const res = await axios.delete(`${process.env.BASE_API_URL}/brands/${brandId}`, {
                headers: {
                    Authorization: token,
                }
            });
            const result = await res.data;
            setIsWaitStatus(false);
            if (!result.error) {
                setSuccessMsg(result.msg);
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setIsWaitGetBrandsStatus(true);
                    setCurrentPage(1);
                    const result = await getBrandsCount();
                    if (result.data > 0) {
                        setAllBrandsInsideThePage((await getAllBrandsInsideThePage(1, pageSize)).data);
                        setTotalPagesCount(Math.ceil(result.data / pageSize));
                    } else {
                        setAllBrandsInsideThePage([]);
                        setTotalPagesCount(0);
                    }
                    setIsWaitGetBrandsStatus(false);
                    clearTimeout(successTimeout);
                }, 1500);
            }
        }
        catch (err) {
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
        <div className="update-and-delete-brands admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Update / Delete Brands</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminPanelHeader />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr Asfour In Your Update / Delete Brands Page
                    </h1>
                    {allBrandsInsideThePage.length > 0 && !isWaitGetBrandsStatus && <section className="brands-box w-100">
                        <table className="brands-table mb-4 managment-table bg-white w-100">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Image</th>
                                    <th>Processes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allBrandsInsideThePage.map((brand, index) => (
                                    <tr key={brand._id}>
                                        <td className="brand-title-cell">
                                            <section className="brand-title mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Enter New Brand Title"
                                                    defaultValue={brand.title}
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-title-field ${formValidationErrors["title"] && index === updatedBrandIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeBrandData(index, "title", e.target.value.trim())}
                                                ></input>
                                                {formValidationErrors["title"] && index === updatedBrandIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["title"]}</span>
                                                </p>}
                                            </section>
                                        </td>
                                        <td className="brand-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${brand.imagePath}`}
                                                alt={`${brand.title} Brand Image !!`}
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                            <section className="brand-image mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-image-field ${formValidationErrors["image"] && index === updatedBrandIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeBrandData(index, "image", e.target.files[0])}
                                                    accept=".png, .jpg, .webp"
                                                />
                                                {formValidationErrors["image"] && index === updatedBrandIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["image"]}</span>
                                                </p>}
                                            </section>
                                            {!isWaitChangeBrandImage && !errorChangeBrandImageMsg && !successChangeBrandImageMsg &&
                                                <button
                                                    className="btn btn-success d-block mb-3 w-50 mx-auto global-button"
                                                    onClick={() => updateBrandImage(index)}
                                                >Change</button>
                                            }
                                            {isWaitChangeBrandImage && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                            >Please Waiting</button>}
                                            {successChangeBrandImageMsg && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successChangeBrandImageMsg}</button>}
                                            {errorChangeBrandImageMsg && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorChangeBrandImageMsg}</button>}
                                        </td>
                                        <td className="update-cell">
                                            {!isWaitStatus && !errorMsg && !successMsg && <>
                                                <button
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                    onClick={() => updateBrandInfo(index)}
                                                >Update</button>
                                                <hr />
                                                <button
                                                    className="btn btn-danger global-button"
                                                    onClick={() => deleteBrand(brand._id)}
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
                    </section>}
                    {allBrandsInsideThePage.length === 0 && !isWaitGetBrandsStatus && <p className="alert alert-danger w-100">Sorry, Can't Find Any Brands !!</p>}
                    {isWaitGetBrandsStatus && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                        <span className="loader-table-data"></span>
                    </div>}
                    {totalPagesCount > 0 && !isWaitGetBrandsStatus &&
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