import { GrFormClose } from "react-icons/gr";

export default function ChangeStoreStatusBox({ setIsDisplayChangeStoreStatusBox }) {
    return (
        <div className="change-store-status-box popup-box">
            <div className="content-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                <GrFormClose className="close-popup-box-icon" onClick={() => setIsDisplayChangeStoreStatusBox(false)} />
                <h2 className="mb-3 pb-3 border-bottom border-white">Change Store Status</h2>
            </div>
        </div>
    );
}