import Head from "next/head";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { getAnimationSettings, getInitialStateForElementBeforeAnimation, getUserInfo, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import Footer from "@/components/Footer";
import { motion } from "motion/react";

export default function ReturnAndDeliverySheet() {

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
        <div className="return-and-delivery-sheet caption-page page">
            <Head>
                <title>{t(process.env.storeName)} - {t("Return And Delivery Sheet")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content text-white ps-4 pe-4 pb-5 pt-5">
                    <div className="container-fluid">
                        <motion.h1 className="welcome-msg mb-5 border-bottom border-2 pb-3 w-fit mx-auto" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Return And Delivery Sheet")}</motion.h1>
                        <div className="content">
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("If your purchase does not meet your expectations, we are happy to offer you a free return service within 15 days of purchase")} .</motion.p>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("We will arrange for the collection of the products you wish to return from your address")} .</motion.p>
                            <motion.p className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("All products are inspected before being handed over to the delivery representative, but if you receive a damaged product, or one with defects, or missing essential parts, please contact our customer service team via email at info@ubuyblues.com within 48 hours of receiving the products")} .</motion.p>
                            <motion.h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("All products can be returned except for the following")} :</motion.h2>
                            <ol>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Underwear and lingerie")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Perfumes that have been opened, tested, or used")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Any product that has been exchanged or modified")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Any used product")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Any product not received in the original packaging")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Any product without the original product tags or labels")} .</motion.li>
                            </ol>
                            <motion.h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Follow the return instructions")} :</motion.h2>
                            <ol>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Please ensure that the products comply with our return policy")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Please contact our customer service team at info@ubuyblues.com and provide us with the order number of the product to be returned, your contact details, and your phone number to assist our customer service team in processing the return of the desired product")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Our customer service and delivery team will contact you to arrange a convenient time for the collection of the product to be returned")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Please follow the return process as specified by the customer service team")} .</motion.li>
                                <motion.li className="mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Once we receive the return shipment at our warehouse and successfully review the products, we will refund the amount to you within 7-10 business days")} .</motion.li>
                            </ol>
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