import Link from "next/link";
import ubuybluesLogo from "../../../public/images/UbuyBlues_Logo_merged_Purple.jpg";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { FaLongArrowAltRight, FaLongArrowAltLeft, FaCcPaypal, FaInstagram, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
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
                        <h5 className="fw-bold mb-4 border-bottom border-dark border-2 pb-2 title">{t("Contact Us").toUpperCase()}</h5>
                        <ul className="links-list">
                            <li className="link-item fw-bold mb-3">
                                <IoLogoFacebook className={`${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <Link href="https://www.facebook.com/AsfourInternational?mibextid=ZbWKwL" target="_blank" className="text-dark link-btn">{t("Facebook").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                <FaInstagram className={`${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <Link href="https://www.instagram.com/asfourintl?igsh=MTluaXV1aG9yb2QwdQ==" target="_blank" className="text-dark link-btn">{t("Instagram").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                <FaXTwitter className={`${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <Link href="https://x.com/AsfourIntl?t=TyZqHPOL5gf009kl4Iz69g&s=09" target="_blank" className="text-dark link-btn">{t("x").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                <FaTiktok className={`${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <Link href="https://www.tiktok.com/@asfourintl?_t=8kpQN2SnUBe&_r=1" target="_blank" className="text-dark link-btn">{t("Tiktok").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                <MdEmail className={`${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <Link href="mailto:info@asfourintlco.com" className="text-dark link-btn">{t("Email").toUpperCase()}</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-3">
                        <h5 className="fw-bold mb-4 border-bottom border-dark border-2 pb-2 title">{t("Payment Methods").toUpperCase()}</h5>
                        <ul className="payment-methods-list">
                            <li className="payment-method-item fw-bold mb-3">
                                <FaCcPaypal className={`icon paypal-icon ${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <span>{t("PayPal")}</span>
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