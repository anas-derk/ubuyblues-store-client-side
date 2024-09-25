import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { FaLongArrowAltRight, FaLongArrowAltLeft, FaCcPaypal, FaInstagram, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { LiaCcVisa } from "react-icons/lia";
import { FaCcMastercard } from "react-icons/fa";
import KnetLogo from "../../../public/images/knet-logo.png";
import { IoLogoFacebook } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import axios from "axios";
import { handleSelectUserLanguage } from "../../../public/global_functions/popular";

export default function Footer() {

    const [email, setEmail] = useState("");

    const [waitMsg, setWaitMsg] = useState("");

    const [errMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const { i18n, t } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.userlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    const handleSubscription = async (e, email) => {
        try {
            e.preventDefault();
            setWaitMsg("Please Wait ...");
            const res = await axios.post(`${process.env.BASE_API_URL}/subscriptions/add-new-subscription`, {
                email,
            });
            const result = res.data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Success Subscription !!");
                let errorTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    clearTimeout(errorTimeout);
                }, 5000);
            } else {
                setErrorMsg(result.msg);
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 5000);
            }
        }
        catch (err) {
            setWaitMsg(false);
            setErrorMsg("Sorry, Someting Went Wrong !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 5000);
        }
    }

    return (
        <footer className="pt-4 pb-4">
            <div className="container">
                <div className="row align-items-center mb-4">
                    <div className="col-xl-3">
                        <h5 className="fw-bold mb-4 border-bottom border-dark border-2 pb-2 title">{t("Our links").toUpperCase()}</h5>
                        <ul className="links-list">
                            <li className="link-item fw-bold mb-3">
                                {i18n.language !== "ar" ? <FaLongArrowAltRight className="me-2" /> : <FaLongArrowAltLeft className="ms-2" />}
                                <Link href="/" className="text-dark link-btn">{t("Main").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                {i18n.language !== "ar" ? <FaLongArrowAltRight className="me-2" /> : <FaLongArrowAltLeft className="ms-2" />}
                                <Link href="/auth" className="text-dark link-btn">{t("login").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                {i18n.language !== "ar" ? <FaLongArrowAltRight className="me-2" /> : <FaLongArrowAltLeft className="ms-2" />}
                                <Link href="/about-us" className="text-dark link-btn">{t("About Us").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                {i18n.language !== "ar" ? <FaLongArrowAltRight className="me-2" /> : <FaLongArrowAltLeft className="ms-2" />}
                                <Link href="/polices-terms-and-conditions" className="text-dark link-btn">{t("Polices-Terms & Conditions").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                {i18n.language !== "ar" ? <FaLongArrowAltRight className="me-2" /> : <FaLongArrowAltLeft className="ms-2" />}
                                <Link href="/return-and-refund-policy" className="text-dark link-btn">{t("Return & Refund Policy").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold">
                                {i18n.language !== "ar" ? <FaLongArrowAltRight className="me-2" /> : <FaLongArrowAltLeft className="ms-2" />}
                                <Link href="/return-and-delivery-sheet" className="text-dark link-btn">{t("Return And Delivery Sheet").toUpperCase()}</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="col-xl-3">
                        <h5 className="fw-bold mb-4 border-bottom border-dark border-2 pb-2 title">{t("Contact Us").toUpperCase()}</h5>
                        <ul className="links-list">
                            <li className="link-item fw-bold mb-3">
                                <IoLogoFacebook className={`${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <Link href="https://www.facebook.com/AsfourInternational?mibextid=ZbWKwL" target="_blank" className="text-dark link-btn">{t("Facebook").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                <FaInstagram className={`${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <Link href="https://www.instagram.com/ubuyblues" target="_blank" className="text-dark link-btn">{t("Instagram").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                <FaXTwitter className={`${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <Link href="https://x.com/ubuyblues" target="_blank" className="text-dark link-btn">{t("x").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                <FaTiktok className={`${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <Link href="https://www.tiktok.com/@ubuyblues" target="_blank" className="text-dark link-btn">{t("Tiktok").toUpperCase()}</Link>
                            </li>
                            <li className="link-item fw-bold mb-3">
                                <MdEmail className={`${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <Link href="mailto:info@ubuyblues.com" className="text-dark link-btn">{t("Email").toUpperCase()}</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="col-xl-3">
                        <h5 className="fw-bold mb-4 border-bottom border-dark border-2 pb-2 title">{t("Payment Methods").toUpperCase()}</h5>
                        <ul className="payment-methods-list mb-5">
                            <li className="payment-method-item fw-bold mb-3">
                                <FaCcPaypal className={`icon paypal-icon ${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <span>{t("PayPal")}</span>
                            </li>
                            <li className="payment-method-item fw-bold mb-3">
                                <LiaCcVisa className={`icon visa-icon ${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <span>{t("Visa Card")}</span>
                            </li>
                            <li className="payment-method-item fw-bold mb-3">
                                <FaCcMastercard className={`icon visa-icon ${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <span>{t("Master Card")}</span>
                            </li>
                            <li className="payment-method-item fw-bold mb-3">
                                <img src={KnetLogo.src} alt="Knet Logo" className={`knet-icon ${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                <span>{t("Knet")}</span>
                            </li>
                        </ul>
                    </div>
                    <div className="col-xl-3">
                        <h5 className="fw-bold mb-3 border-bottom border-dark border-2 pb-2 title">{t("Subscription").toUpperCase()}</h5>
                        <p className="mb-3">{t("Enter your email address")}</p>
                        <p className="mb-3">{"(" + t("I want to receive all the latest updates via email") + " )"}</p>
                        <form className="subscription-form" onSubmit={(e) => handleSubscription(e, email)}>
                            <input
                                type="email"
                                className="form-control p-2 d-block w-75 mb-3"
                                placeholder={t("Please Enter Email Here")}
                                onChange={(e) => setEmail(e.target.value.trim())}
                                required
                            />
                            {!waitMsg && !successMsg && !errMsg && <button type="submit" className="btn btn-info">{t("Subscription")}</button>}
                            {waitMsg && <button type="button" disabled className="btn btn-info">{waitMsg}</button>}
                            {successMsg && <button type="button" disabled className="btn btn-success">{successMsg}</button>}
                            {errMsg && <button type="button" disabled className="btn btn-danger">{errMsg}</button>}
                        </form>
                    </div>
                </div>
                <p className="mb-0 text-center fw-bold">
                    {t("All Rights Reserved For")} <Link href="/" className="text-danger">Ubuyblues</Link>
                </p>
            </div>
        </footer>
    );
}