import { GrFormClose } from "react-icons/gr";
import ReactPannellum from "react-pannellum";

export default function ThreeDImageViewer({ imagePath, name, setIsDisplayThreeDImageViewerPopup }) {
    const config = {
        autoRotate: 0
    }
    return (
        <div className="tree-d-image-viewer-popup popup-box">
            <div className="tree-d-image-viewer-box content-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                <GrFormClose className="close-error-popup-icon close-popup-box-icon" onClick={() => setIsDisplayThreeDImageViewerPopup(false)} />
                <div className="image-box mw-100">
                    <ReactPannellum
                        id="1"
                        sceneId={`${name} Three D Scene`}
                        imageSource={`${process.env.BASE_API_URL}/${imagePath}`}
                        config={config}
                    />
                </div>
            </div>
        </div>
    );
}