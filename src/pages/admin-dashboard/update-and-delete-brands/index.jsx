import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";

export default function UpdateAndDeleteStores({ activeParentLink, activeChildLink }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [allBrands, setAllBrands] = useState([]);

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState(false);

    const [successMsg, setSuccessMsg] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.BASE_API_URL}/brands/all-brands`)
            .then((res) => {
                setAllBrands(res.data);
                setIsLoadingPage(false);
            })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
    }, []);

    const changeBrandTitle = (brandIndex, newValue) => {
        let brandsInfoTemp = allBrands;
        brandsInfoTemp[brandIndex].name = newValue;
        setAllBrands(brandsInfoTemp);
    }

    const updateBrandInfo = async (brandIndex) => {
        setIsWaitStatus(true);
        try {
            const res = await axios.put(`${process.env.BASE_API_URL}/brands/${allBrands[brandIndex]._id}`, {
                newBrandTitle: allBrands[brandIndex].name,
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
            if (result === "Deleting Brand Process Has Been Successfuly ...") {
                setSuccessMsg(result);
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
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
                    {allBrands.length > 0 ? <div className="categories-box w-100">
                        <table className="brands-table mb-4 managment-table bg-white w-100">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Process</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allBrands.map((brand, index) => (
                                    <tr key={brand._id}>
                                        <td className="brand-title-cell">
                                            <input
                                                type="text"
                                                placeholder="Enter New Brand Title"
                                                defaultValue={brand.title}
                                                className="p-2 form-control"
                                                onChange={(e) => changeBrandTitle(index, e.target.value.trim())}
                                            ></input>
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div> : <p className="alert alert-danger w-100 mx-auto">Sorry, Not Found Any Brands !!</p>}
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}