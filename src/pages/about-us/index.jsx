import Head from "next/head";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import LoaderPage from "@/components/LoaderPage";
import { getUserInfo } from "../../../public/global_functions/popular";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import Footer from "@/components/Footer";

export default function AboutUs() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
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
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                        setIsLoadingPage(false);
                    } else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else {
            setIsLoadingPage(false);
        }
    }, []);

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    return (
        <div className="about-us caption-page page">
            <Head>
                <title>{t("Ubuyblues Store")} - {t("About Us")}</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content text-white ps-4 pe-4 pb-5 pt-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-5 border-bottom border-2 pb-3 w-fit mx-auto">{t("About Us")}</h1>
                        <div className="content">
                            <p className="mb-4">{t("We offer high-quality products to our customers. We are committed to meeting your needs and providing the best solutions to ensure your satisfaction .")} .</p>
                            <p className="mb-4">{t("We feature a wide range of diverse products available at competitive prices. We strive to provide a variety of products to suit your different needs and budgets. We offer high-quality products in various fields such as handicrafts, home and office supplies, household products, and more .")} .</p>
                            <p className="mb-4">{t("We consider our customers as partners in our success, and we strive to provide high-quality customer service. We pay attention to the smallest details and aim to provide a satisfying shopping experience for our customers .")} .</p>
                            <p className="mb-4">{t("We are committed to dedicating ourselves to achieving the highest levels of quality and satisfaction for our customers. We strive for innovation and continuous development to meet the changing market demands and continually improve our operations .")} .</p>
                            <p className="mb-0">{t("We are committed to meeting your needs and achieving your satisfaction, and we are dedicated to achieving sustainable success in our field of work .")} .</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}