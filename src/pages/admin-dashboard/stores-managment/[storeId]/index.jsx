import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import validations from "../../../../../public/global_functions/validations";
import { getDateFormated } from "../../../../../public/global_functions/popular";

export default function StoreDetails({ storeId }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [token, setToken] = useState("");

    const [userInfo, setUserInfo] = useState({});

    const [storeDetails, setStoreDetails] = useState({});

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [isWaitChangeStoreImage, setIsWaitChangeStoreImage] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [errorChangeStoreImageMsg, setErrorChangeStoreImageMsg] = useState(false);

    const [successMsg, setSuccessMsg] = useState("");

    const [successChangeStoreImageMsg, setSuccessChangeStoreImageMsg] = useState(false);

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

    useEffect(() => {
        const adminToken = localStorage.getItem("asfour-store-admin-user-token");
        if (adminToken) {
            validations.getAdminInfo(adminToken)
                .then(async (result) => {
                    if (result.error) {
                        localStorage.removeItem("asfour-store-admin-user-token");
                        await router.push("/admin-dashboard/login");
                    } else {
                        setUserInfo(result.data);
                        result = await getStoreDetails(storeId);
                        if (!result.error) {
                            setStoreDetails(result.data);
                            setToken(adminToken);
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

    const getStoreDetails = async (storeId) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/stores/store-details/${storeId}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    return (
        <div className="store-details admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Order Details</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-4 pb-4">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">Hi, Mr {userInfo.firstName + " " + userInfo.lastName} In Store Details Page</h1>
                        {storeDetails ? <div className="store-details-box p-3 data-box">
                            <table className="store-details-table table-for-mobiles-and-tablets bg-white w-100">
                                <tbody>
                                    <tr>
                                        <th>Id</th>
                                        <td className="store-id-cell">
                                            {storeDetails._id}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Name</th>
                                        <td className="update-store-name-cell">
                                            {storeDetails.name}
                                        </td>
                                    </tr>
                                    <tr className="store-image-cell">
                                        <th className="store-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${storeDetails.imagePath}`}
                                                alt={`${storeDetails.title} Store Image !!`}
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                        </th>
                                        <td className="update-store-image-cell">
                                            <section className="update-store-image mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-image-field ${formValidationErrors["image"] && index === updatingBrandIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeBrandData(index, "image", e.target.files[0])}
                                                    accept=".png, .jpg, .webp"
                                                />
                                                {formValidationErrors["image"] && index === updatingBrandIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["image"]}</span>
                                                </p>}
                                            </section>
                                            {!isWaitChangeStoreImage && !errorChangeStoreImageMsg && !successChangeStoreImageMsg &&
                                                <button
                                                    className="btn btn-success d-block mb-3 w-50 mx-auto global-button"
                                                    onClick={() => updateBrandImage(index)}
                                                >Change</button>
                                            }
                                            {isWaitChangeStoreImage && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                            >Please Waiting</button>}
                                            {successChangeStoreImageMsg && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successChangeStoreImageMsg}</button>}
                                            {errorChangeStoreImageMsg && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorChangeStoreImageMsg}</button>}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Owner First Name</th>
                                        <td className="update-owner-first-name-cell">
                                            {storeDetails.ownerFirstName}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Owner Last Name</th>
                                        <td className="update-owner-last-name-cell">
                                            {storeDetails.ownerLastName}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Owner Email</th>
                                        <td className="update-owner-email-cell">
                                            {storeDetails.ownerEmail}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Products Type</th>
                                        <td className="update-products-type-cell">
                                            {storeDetails.productsType}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Products Description</th>
                                        <td className="update-products-description-cell">
                                            {storeDetails.productsDescription}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td className="status-cell">
                                            {storeDetails.status}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Creating Order Date</th>
                                        <td className="creating-order-date-cell">
                                            {getDateFormated(storeDetails.creatingOrderDate)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Approve Order Date</th>
                                        <td className="approve-order-date-cell">
                                            {storeDetails.approveDate ? getDateFormated(storeDetails.approveDate) : "-----"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Blocking Date</th>
                                        <td className="blocking-store-date-cell">
                                            {storeDetails.blockingDate ? getDateFormated(storeDetails.blockingDate) : "-----"}
                                        </td>
                                    </tr>
                                    {storeDetails.blockingReason && <tr>
                                        <th>Blocking Reason</th>
                                        <td className="blocking-reason-cell">
                                            {storeDetails.blockingReason}
                                        </td>
                                    </tr>}
                                    <tr>
                                        <th>Cancel Blocking Date</th>
                                        <td className="cancel-blocking-store-date-cell">
                                            {storeDetails.dateOfCancelBlocking ? getDateFormated(storeDetails.dateOfCancelBlocking) : "-----"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div> : <p className="alert alert-danger order-not-found-error">Sorry, This Order Is Not Found !!</p>}
                    </div>
                </section>
                {/* End Content Section */}
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}

export async function getServerSideProps(context) {
    const storeId = context.query.storeId;
    if (!storeId) {
        return {
            redirect: {
                permanent: false,
                destination: "/admin-dashboard/stores-managment",
            },
        }
    } else {
        return {
            props: {
                storeId,
            },
        }
    }
}