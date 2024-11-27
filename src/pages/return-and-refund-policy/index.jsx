import Head from "next/head";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { getAnimationSettings, getInitialStateForElementBeforeAnimation, getUserInfo, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import Footer from "@/components/Footer";
import { motion } from "motion/react";

export default function PolicesTermsAndConditions() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.userlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        if (userToken) {
            getUserInfo()
                .then((result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                    }
                    setIsLoadingPage(false);
                })
                .catch((err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                        setIsLoadingPage(false);
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        } else {
            setIsLoadingPage(false);
        }
    }, []);

    return (
        <div className="return-and-refund-policy caption-page page">
            <Head>
                <title>{t(process.env.storeName)} - {t("Return And Refund Policy")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content text-white ps-4 pe-4 pb-5 pt-5">
                    <div className="container-fluid">
                        <motion.h1 className="welcome-msg mb-5 border-bottom border-2 pb-3 w-fit mx-auto" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Return & Refund Policy")}</motion.h1>
                        <div className="content">
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("You have 15 days from the date of delivery to request a return or replacement")} .</motion.p>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("If you have received damaged or incorrect products, please contact customer service for assistance as soon as possible")} .</motion.p>
                            <ol>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Exchange one item for another is allowed")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Returned products must be unused, and the original packaging must be retained, We do not accept returns of used or damaged items")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Products with non-returnable tags and free gifts are not eligible for return or exchange")} .</motion.li>
                            </ol>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("You have only one day from the delivery date to request a return and refund with the invoice for the following products and valuable goods")} :</motion.p>
                            <ol>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Jewelry and / pierced earrings")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Watches")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Evening wear, wedding attire, socks, and swimwear")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Glasses")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Leather")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Perfumes (including home fragrances), skincare products, hair care products, aerosol sprays, and cosmetics")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("In some cases, we cannot accept returns")} .</motion.li>
                            </ol>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("The following categories are non-refundable and non-exchangeable")} :</motion.p>
                            <ol>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Underwear and lingerie")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("The perfumes that have been opened, tested, and used")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Any product that has been exchanged or modified")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Any product that was used")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Any product that was not received in its original packaging")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Any product without the original tags or labels of the product")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Any products that have been resized, altered, or damaged after delivery")} .</motion.li>
                            </ol>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("In exceptional circumstances - such as the COVID-19 pandemic - special market regulations may be implemented by local authorities, which could affect our return and refund policy")} .</motion.p>
                            <motion.h6 className="fw-bold border-bottom border-2 pb-2 w-fit" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Note")} :</motion.h6>
                            <ol>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("We do not accept products that have been returned without a prior return request")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Please ensure the accuracy of the return request and the products before shipping them. We will not be responsible for returns of items not purchased from our site")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("If the quantity of the products to be returned does not match the actual returned quantity, the courier may refuse to accept the products")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Please do not send the return parcel to the address on the received package, as it is not our return address. This will affect the processing of the return")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("If a cancellation of an online payment order is requested before shipping, we will complete the refund process within 5 business days. A 5% deduction from the refunded amount will be applied to cover payment processing fees charged by the payment company")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Orders paid online will be refunded within 5 business days due to stock depletion, damage, or deviation from the confirmed sample, without processing fees. The refund will be transferred via the original payment method")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("In case of illegal conflicts with regular payments, certain fees will be imposed according to the severity of the situation")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Ubuyblues reserves the right to the final interpretation")} .</motion.li>
                            </ol>
                            Email: <motion.a href="mailto:info@ubuyblues.com" className="text-white border-bottom border-2 pb-2 mb-3 d-block w-fit" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>info@ubuyblues.com</motion.a>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("If you have a return or replacement request, please follow the steps below, and we will assist you with sincerity")}</motion.p>
                            <ol>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("If you wish to return your order, please send the return request to info@ubuyblues.com via email. Provide information about the returned items, reasons for the return, and photos of the original packaging")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Our team will review your request within 5 business days")} .</motion.li>
                            </ol>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("After verification, our service team will inform you of the refund amount and the next steps. (Refund amount = Value of returned items - Return shipping fees)")} .</motion.p>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Note: If the review is unsuccessful, the employee will inform you of the reasons via email. If you wish to submit the return request again, please provide evidence to us via email. Our team will process your request within 5 business days")} .</motion.p>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("By visiting or purchasing from our site, you are engaging in our service and agree to abide by the terms and conditions, including those terms, conditions, and additional policies referenced herein and/or available by hyperlink. These terms of service apply to all users of the site, including but not limited to users who are browsers, vendors, customers, merchants, and/or contributors of content")} .</motion.p>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Please read these terms of service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these terms of service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services. If these terms of service are considered an offer, acceptance is expressly limited to these terms of service")} .</motion.p>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("You may not use our products for any illegal or unauthorized purpose, and you must not, in the use of the service, violate any laws in your jurisdiction (including, but not limited to, copyright laws)")} .</motion.p>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Any new features or tools added to the current store shall also be subject to the terms of service. You can review the most current version of the terms of service at any time on this page. We reserve the right to update, change, or replace any part of these terms of service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes. Your continued use of or access to the website following the posting of any changes constitutes acceptance of those changes")} .</motion.p>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("By agreeing to these terms of service, you acknowledge that you are at least the age of majority in your country of residence")} .</motion.p>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("You may not use our products for any illegal or unauthorized purpose, and you must not, in the use of the service, violate any laws in your jurisdiction (including, but not limited to, copyright laws)")} .</motion.p>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Violation of any of the terms will result in immediate termination of your services")} .</motion.p>
                        </div>
                    </div>
                </div>
                <Footer />
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}