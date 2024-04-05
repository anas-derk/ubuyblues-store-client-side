import { useState } from "react";
import { GrFormClose } from "react-icons/gr";
import axios from "axios";

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

    const handleClosePopupBox = () => {
        setIsDisplayChangeStoreStatusBox(false);
        setNewStoreStatus("");
    }

    const changeStoreStatus = async (storeId, newStoreStatus) => {
        try {
            setIsWaitStatus(true);
            const res = await axios.put(`${process.env.BASE_API_URL}/stores/update-store-status/${storeId}`,
                newStoreStatus === "rejecting" || newStoreStatus === "blocking" ? {
                    changeStatusReason,
                } : {}, {
                    headers: {
                        Authorization: token,
                    }
                }
            );
            const result = res.data;
            if (!result.error) {

            }
        }
        catch (err) {

        }
    }

    return (
        <div className="change-store-status-box popup-box">
            <div className="content-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                {!isWaitStatus && !errorMsg && !successMsg && <GrFormClose className="close-popup-box-icon" onClick={handleClosePopupBox} />}
                <h2 className="mb-5 pb-3 border-bottom border-white">Change Store Status</h2>
                <h4 className="mb-4">Are You Sure From: {newStoreStatus} Store: ( {storeId} ) ?</h4>
                {
                    !isWaitStatus &&
                    !errorMsg &&
                    !successMsg &&
                    newStoreStatus === "approving" &&
                    <button
                        className="btn btn-success d-block mx-auto mb-4 global-button"
                        onClick={() => changeStoreStatus(storeId, newStoreStatus)}
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
                        onClick={() => changeStoreStatus(storeId, newStoreStatus)}
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
                        onClick={() => changeStoreStatus(storeId, newStoreStatus)}
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
                <button
                    className="btn btn-danger d-block mx-auto global-button"
                    disabled={isWaitStatus || errorMsg || successMsg}
                    onClick={handleClosePopupBox}
                >
                    Close
                </button>
            </div>
        </div>
    );
}