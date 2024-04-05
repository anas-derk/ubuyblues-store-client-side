import { useState } from "react";
import { GrFormClose } from "react-icons/gr";
import axios from "axios";
import validations from "../../../public/global_functions/validations";

export default function ChangeStoreStatusBox({
    setIsDisplayChangeStoreStatusBox,
    setNewStoreStatus,
    storeId,
    newStoreStatus,
    token,
}) {

    const [changeStatusReason, setChangeStatusReason] = useState("");

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const handleClosePopupBox = () => {
        setIsDisplayChangeStoreStatusBox(false);
        setNewStoreStatus("");
    }

    const validateFormFields = (validateDetailsList) => {
        return validations.inputValuesValidation(validateDetailsList);
    }

    const changeStoreStatus = async (e, storeId, newStoreStatus) => {
        try {
            e.preventDefault();
            let errorsObject = {}, bodyData = {};
            if (newStoreStatus === "rejecting" || newStoreStatus === "blocking") {
                errorsObject = validateFormFields([
                    {
                        name: "changeStatusReason",
                        value: changeStatusReason,
                        rules: {
                            isRequired: {
                                msg: "Sorry, This Field Can't Be Empty !!",
                            },
                        },
                    },
                ]);
                setFormValidationErrors(errorsObject);
            }
            console.log(errorsObject)
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitStatus(true);
                const res = await axios.put(`${process.env.BASE_API_URL}/stores/update-store-status/${storeId}`, bodyData,
                    {
                        headers: {
                            Authorization: token,
                        }
                    }
                );
                const result = res.data;
                if (!result.error) {

                }
            }
        }
        catch (err) {
            console.log(err)
            if (err?.response?.data?.msg === "Unauthorized Error") {
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
        <div className="change-store-status-box popup-box">
            <div className="content-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                {!isWaitStatus && !errorMsg && !successMsg && <GrFormClose className="close-popup-box-icon" onClick={handleClosePopupBox} />}
                <h2 className="mb-5 pb-3 border-bottom border-white">Change Store Status</h2>
                <h4 className="mb-4">Are You Sure From: {newStoreStatus} Store: ( {storeId} ) ?</h4>
                <form className="change-store-status-form w-50" onSubmit={(e) => changeStoreStatus(e, storeId, newStoreStatus)}>
                    {(newStoreStatus === "rejecting" || newStoreStatus === "blocking") && <section className="change-store-status mb-4">
                        <input
                            type="text"
                            className={`form-control p-3 border-2 change-status-reason-field ${formValidationErrors["changeStatusReason"] ? "border-danger mb-3" : "mb-4"}`}
                            placeholder={`Please Enter ${newStoreStatus} Reason`}
                            onChange={(e) => setChangeStatusReason(e.target.value)}
                            value={changeStatusReason}
                        />
                        {formValidationErrors["changeStatusReason"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                            <span>{formValidationErrors["changeStatusReason"]}</span>
                        </p>}
                    </section>}
                    {
                        !isWaitStatus &&
                        !errorMsg &&
                        !successMsg &&
                        newStoreStatus === "approving" &&
                        <button
                            className="btn btn-success d-block mx-auto mb-4 global-button"
                            type="submit"
                        >
                            Approve
                        </button>
                    }
                    {
                        !isWaitStatus &&
                        !errorMsg &&
                        !successMsg &&
                        newStoreStatus === "rejecting" &&
                        <button
                            className="btn btn-success d-block mx-auto mb-4 global-button"
                            type="submit"
                        >
                            Reject
                        </button>
                    }
                    {
                        !isWaitStatus &&
                        !errorMsg &&
                        !successMsg &&
                        newStoreStatus === "blocking" &&
                        <button
                            className="btn btn-success d-block mx-auto mb-4 global-button"
                            type="submit"
                        >
                            Block
                        </button>
                    }
                    {isWaitStatus &&
                        <button
                            className="btn btn-info d-block mx-auto mb-3 global-button"
                            disabled
                        >
                            Please Waiting ...
                        </button>
                    }
                    {errorMsg &&
                        <button
                            className="btn btn-danger d-block mx-auto mb-3 global-button"
                            disabled
                        >
                            { errorMsg }
                        </button>
                    }
                    {successMsg &&
                        <button
                            className="btn btn-success d-block mx-auto mb-3 global-button"
                            disabled
                        >
                            { successMsg }
                        </button>
                    }
                    <button
                        className="btn btn-danger d-block mx-auto global-button"
                        disabled={isWaitStatus || errorMsg || successMsg}
                        onClick={handleClosePopupBox}
                    >
                        Close
                    </button>
                </form>
            </div>
        </div>
    );
}