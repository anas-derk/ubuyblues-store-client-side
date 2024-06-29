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
                {(errorType === "user-not-logged-in-for-rating" || errorType === "user-not-logged-in-for-add-product-to-favourite-products-list") && <>
                    <h2 className="mb-5 pb-3 border-bottom border-white">{t("Sorry, You Are Not Logged In !!")}</h2>
                    <div className="row">
                        <h4 className="mb-4">{errorType === "user-not-logged-in-for-rating" ? t("In Order To Rate, Please Log In First") : t("In Order To Add The Product To Your Favorites List, Please Log In First")} .</h4>
                        <h5 className="mb-5">{t("You Can Log In By Clicking The Following Button")} .</h5>
                        <Link href="/auth" className="btn btn-success login-btn">{t("Log In")}</Link>
                    </div>
                </>}
            </div>
        </div>
    );
}