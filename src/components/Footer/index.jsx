import Link from "next/link";
import ubuybluesLogo from "../../../public/images/UbuyBlues_Logo_merged_Purple.jpg";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function Footer() {

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
        <footer className="p-5 text-center">
            <div className="container-fluid">
                <div className="row align-items-center">
                    <div className="col-md-4">
                        <img src={ubuybluesLogo.src} alt="asfour logo for footer" className="asfour-logo-for-footer" />
                    </div>
                    <div className="col-md-4">
                        <Link href="/" className="text-dark d-block link-btn mb-2 fw-bold">{t("About Us")}</Link>
                        <Link href="/" className="text-dark d-block link-btn mb-2 fw-bold">{t("Contact Us")}</Link>
                        <Link href="/" className="text-dark d-block link-btn mb-2 fw-bold">{t("Polices-Terms & Conditions")}</Link>
                        <Link href="/" className="text-dark d-block link-btn mb-2 fw-bold">{t("Return & Refund Policy")}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}