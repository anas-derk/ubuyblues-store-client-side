import { useState } from "react";
import { GrFormClose } from "react-icons/gr";

export default function ChangeStoreStatusBox({
    setIsDisplayChangeStoreStatusBox,
    setNewStoreStatus,
    storeId,
    newStoreStatus
}) {

    const [waitMsg, setWaitMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");
    
    const handleClosePopupBox = () => {
        setIsDisplayChangeStoreStatusBox(false);
        setNewStoreStatus("");
    }

    const changeStoreStatus = (storeId) => {
        try{

        }
        catch(err){
            
        }
    }
    
    return (
        <div className="change-store-status-box popup-box">
            <div className="content-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                <GrFormClose className="close-popup-box-icon" onClick={handleClosePopupBox} />
                <h2 className="mb-5 pb-3 border-bottom border-white">Change Store Status</h2>
                <h4 className="mb-3">Are You Sure From: { newStoreStatus } Store: ( { storeId } ) ?</h4>
                {/* {newStoreStatus === "approving" && <div>} */}
            </div>
        </div>
    );
}