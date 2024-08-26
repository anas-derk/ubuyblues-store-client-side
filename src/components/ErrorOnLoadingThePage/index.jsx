import { PiSmileySad } from "react-icons/pi";
import Header from "../Header";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function ErrorOnLoadingThePage() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
        setIsLoadingPage(false);
    }, []);

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    return (
        <div className="error-on-loading-component">
            {!isLoadingPage && <>
                <Header />
                <div className="error-msg-on-loading-the-page text-center text-white d-flex flex-column justify-content-center align-items-center">
                    <PiSmileySad className="error-icon mb-5" />
                    <p className="error-msg-on-loading-box">{t("Sorry, Something Went Wrong, Please Try Again !")}</p>
                </div>
            </>}
        </div>
    );
}