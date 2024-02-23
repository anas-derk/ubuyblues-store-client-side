import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import PaginationBar from "@/components/PaginationBar";

export default function UpdateAndDeleteStores() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [isWaitGetBrandsStatus, setIsWaitGetBrandsStatus] = useState(false);

    const [allBrandsInsideThePage, setAllBrandsInsideThePage] = useState([]);

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState(false);

    const [successMsg, setSuccessMsg] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const router = useRouter();

    const pageSize = 1;

    useEffect(() => {
        const adminId = localStorage.getItem("asfour-store-admin-user-id");
        if (!adminId) {
            router.push("/admin-dashboard/login");
        } else {
            getBrandsCount()
                .then(async (result) => {
                    if (result > 0) {
                        const result1 = await getAllBrandsInsideThePage(1, pageSize);
                        setAllBrandsInsideThePage(result1);
                        setTotalPagesCount(Math.ceil(result / pageSize));
                    }
                    setIsLoadingPage(false);
                }).catch(() => {
                    setIsLoadingPage(false);
                    setIsErrorMsgOnLoadingThePage(true);
                });
        }
    }, []);

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
        setAllBrandsInsideThePage(await getAllBrandsInsideThePage(newCurrentPage, pageSize));
        setCurrentPage(newCurrentPage);
        setIsWaitGetBrandsStatus(false);
    }

    const getNextPage = async () => {
        setIsWaitGetBrandsStatus(true);
        const newCurrentPage = currentPage + 1;
        setAllBrandsInsideThePage(await getAllBrandsInsideThePage(newCurrentPage, pageSize));
        setCurrentPage(newCurrentPage);
        setIsWaitGetBrandsStatus(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsWaitGetBrandsStatus(true)
        setAllBrandsInsideThePage(await getAllBrandsInsideThePage(pageNumber, pageSize));
        setCurrentPage(pageNumber);
        setIsWaitGetBrandsStatus(false);
    }

    const changeBrandData = (brandIndex, fieldName, newValue) => {
        let brandsDataTemp = allBrands;
        brandsDataTemp[brandIndex][fieldName] = newValue;
        setAllBrands(brandsDataTemp);
    }

    const updateBrandImage = async (brandIndex) => {
        try {
            let formData = new FormData();
            formData.append("brandImage", allBrandsInsideThePage[brandIndex].image);
            await axios.put(`${process.env.BASE_API_URL}/brands/update-brand-image/${allBrandsInsideThePage[brandIndex]._id}`, formData);
        }
        catch (err) {
            console.log(err);
        }
    }

    const updateBrandInfo = async (brandIndex) => {
        setIsWaitStatus(true);
        try {
            const res = await axios.put(`${process.env.BASE_API_URL}/brands/${allBrandsInsideThePage[brandIndex]._id}`, {
                newBrandTitle: allBrandsInsideThePage[brandIndex].title,
            });
            const result = await res.data;
            setIsWaitStatus(false);
            if (result === "Updating Brand Info Process Has Been Successfuly ...") {
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

    const deleteBrand = async (brandId) => {
        setIsWaitStatus(true);
        try {
            const res = await axios.delete(`${process.env.BASE_API_URL}/brands/${brandId}`);
            const result = await res.data;
            setIsWaitStatus(false);
            if (!result.isError) {
                setSuccessMsg(result.msg);
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    setAllBrands(result.newBrandsList);
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
                    {allBrandsInsideThePage.length > 0 && !isWaitGetBrandsStatus && <section className="categories-box w-100">
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
                                            <input
                                                type="text"
                                                placeholder="Enter New Brand Title"
                                                defaultValue={brand.title}
                                                className="p-2 form-control"
                                                onChange={(e) => changeBrandData(index, "title", e.target.value.trim())}
                                            ></input>
                                        </td>
                                        <td className="brand-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${brand.imagePath}`}
                                                alt={`${brand.title} Brand Image !!`}
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                            <input
                                                type="file"
                                                className="form-control d-block mx-auto mb-3"
                                                onChange={(e) => changeBrandData(index, "image", e.target.files[0])}
                                            />
                                            <button
                                                className="btn btn-success d-block mx-auto w-50 global-button"
                                                onClick={() => updateBrandImage(index)}
                                            >
                                                Change
                                            </button>
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
                    {allBrandsInsideThePage.length === 0 && !isWaitGetBrandsStatus && <p className="alert alert-danger">Sorry, Can't Find Any Categories !!</p>}
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