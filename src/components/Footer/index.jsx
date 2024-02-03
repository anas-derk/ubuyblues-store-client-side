import Link from "next/link";
import ubuybluesLogo from "../../../public/images/UbuyBlues_Logo_merged_Purple.jpg";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { FaLongArrowAltRight, FaLongArrowAltLeft } from "react-icons/fa";
import { IoLogoFacebook } from "react-icons/io";
import { MdEmail } from "react-icons/md";

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
        <footer className="pt-4 pb-4">
            <div className="container-fluid">
                <div className="row align-items-center mb-4">
                    <div className="col-md-3 text-center">
                        <img src={ubuybluesLogo.src} alt="asfour logo for footer" className="asfour-logo-for-footer" />
                    </div>
                    <div className="col-md-3">
                        <h5 className="fw-bold mb-4 border-bottom border-dark border-2 pb-2 title">{t("Our links").toUpperCase()}</h5>
                        <ul className="links-list">
                            <li className="link-item fw-bold mb-3">
                                {i18n.language !== "ar" && <FaLongArrowAltRight className="me-2" />}
                                {i18n.language === "ar" && <FaLongArrowAltLeft className="ms-2" />}
                                <Link href="/" className="text-dark link-btn">{t("Main").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                {i18n.language !== "ar" && <FaLongArrowAltRight className="me-2" />}
                                {i18n.language === "ar" && <FaLongArrowAltLeft className="ms-2" />}
                                <Link href="/auth" className="text-dark link-btn">{t("login").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                {i18n.language !== "ar" && <FaLongArrowAltRight className="me-2" />}
                                {i18n.language === "ar" && <FaLongArrowAltLeft className="ms-2" />}
                                <Link href="/about-us" className="text-dark link-btn">{t("About Us").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                {i18n.language !== "ar" && <FaLongArrowAltRight className="me-2" />}
                                {i18n.language === "ar" && <FaLongArrowAltLeft className="ms-2" />}
                                <Link href="/contact-us" className="text-dark link-btn">{t("Contact Us").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                {i18n.language !== "ar" && <FaLongArrowAltRight className="me-2" />}
                                {i18n.language === "ar" && <FaLongArrowAltLeft className="ms-2" />}
                                <Link href="/polices-terms-and-conditions" className="text-dark link-btn">{t("Polices-Terms & Conditions").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold">
                                {i18n.language !== "ar" && <FaLongArrowAltRight className="me-2" />}
                                {i18n.language === "ar" && <FaLongArrowAltLeft className="ms-2" />}
                                <Link href="/return-and-refund-policy" className="text-dark link-btn">{t("Return & Refund Policy").toUpperCase()}</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-3">

                    </div>
                    <div className="col-md-3">
                    <h5 className="fw-bold mb-4 border-bottom border-dark border-2 pb-2 title">{t("Contact Us").toUpperCase()}</h5>
                        <ul className="links-list">
                            <li className="link-item fw-bold mb-3">
                                <IoLogoFacebook className={`${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <Link href="/" className="text-dark link-btn">{t("Facebook").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                <MdEmail className={`${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <Link href="/" className="text-dark link-btn">{t("Email").toUpperCase()}</Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <p className="mb-0 text-center fw-bold">
                    {t("All Rights Reserved For")} <Link href="/" className="text-danger">{t("Ubuyblues")}</Link>
                </p>
            </div>
        </footer>
    );
}