import { GrFormClose } from "react-icons/gr";

export default function ThreeDImageViewer({ imagePath, name, setIsDisplayThreeDImageViewerPopup }) {
    return (
        <div className="tree-d-image-viewer-popup popup-box">
            <div className="tree-d-image-viewer-box content-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                <GrFormClose className="close-error-popup-icon close-popup-box-icon" onClick={() => setIsDisplayThreeDImageViewerPopup(false)} />
                <div className="image-box">
                    <img src={`${process.env.BASE_API_URL}/${imagePath}`} alt={`${name} 3D Image`} />
                </div>
            </div>
        </div>
    );
}