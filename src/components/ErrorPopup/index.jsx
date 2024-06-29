import { GrFormClose } from "react-icons/gr";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPopup({ setIsDisplayErrorPopup, errorType }) {

    const { i18n, t } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
    }, []);

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    return (
        <div className="error-popup popup-box">
            <div className="error-box content-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                <GrFormClose className="close-error-popup-icon close-popup-box-icon" onClick={() => setIsDisplayErrorPopup(false)} />
                {errorType === "user-not-logged-in" && <>
                    <h2 className="mb-5 pb-3 border-bottom border-white">{t(`Sorry, You Are Not Logged In !!`)}</h2>
                    <div className="row">
                        <h4 className="mb-4">{t("In order to rate, please log in first")} .</h4>
                        <h5 className="mb-5">{t("You can log in by clicking the following button")} .</h5>
                        <Link href="/auth" className="btn btn-success login-btn">{t("Log in")}</Link>
                    </div>
                </>}
            </div>
        </div>
    );
}