import { useEffect } from "react";
import loaderImage from "../../../public/images/loaderImage.svg";

export default function LoaderPage() {

    useEffect(() => {
        const tempLightMode = localStorage.getItem(process.env.USER_THEME_MODE_FIELD_NAME_IN_LOCAL_STORAGE);
        if (tempLightMode && (tempLightMode === "dark" || tempLightMode === "sunny")) {
            let rootElement = document.documentElement;
            rootElement.style.setProperty("--main-color-one", tempLightMode === "sunny" ? process.env.MAIN_COLOR_ONE : "#000");
        }
    }, []);

    return (
        <div className="loading-box d-flex justify-content-center align-items-center">
            <img src={loaderImage.src} alt="Loader Image" />
        </div>
    );
}