import { PiSmileySad } from "react-icons/pi";
import Header from "../Header";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { handleSelectUserLanguage } from "../../../public/global_functions/popular";

export default function ErrorOnLoadingThePage({ errorMsg }) {

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.userlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);
    
    return (
        <div className="error-on-loading-component">
            <Header />
            <div className="error-msg-on-loading-the-page text-center text-white d-flex flex-column justify-content-center align-items-center">
                <PiSmileySad className="error-icon mb-5" />
                <p className="error-msg-on-loading-box">{t(errorMsg)}</p>
            </div>
        </div>
    );
}