import loaderImage from "../../../public/images/loaderImage.svg";

export default function LoaderPage() {
    return (
        <div className="loading-box d-flex justify-content-center align-items-center">
            <img src={loaderImage.src} alt="Loader Image" />
        </div>
    );
}