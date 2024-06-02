import Head from "next/head";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import LoaderPage from "@/components/LoaderPage";
import { getUserInfo } from "../../../public/global_functions/popular";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";

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
        <div className="about-us caption-page">
            <Head>
                <title>{t("Ubuyblues Store")} - {t("About Us")}</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content text-white p-4 page">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-5 border-bottom border-2 pb-3 w-fit mx-auto">{t("About Us")}</h1>
                        <div className="content">
                            <p className="mb-4">{t("We are Asfour International, a leading company in the wholesale and retail trade industry. We provide high-quality products to our customers. We are committed to meeting your needs and providing the best solutions to ensure your satisfaction")} .</p>
                            <p className="mb-4">{t("Our company stands out with a wide range of diverse products available at competitive prices. We strive to provide a broad selection of products to suit your various needs and budgets. We offer high-quality products in various fields such as crafts, electronics, fashion, food products, household tools, and more")} .</p>
                            <p className="mb-4">{t("We consider our customers as partners in our success, and we are committed to providing high-quality customer service. We pay attention to the smallest details and strive to offer a satisfying shopping experience for our customers")} .</p>
                            <p className="mb-4">{t("We are dedicated to achieving the highest levels of quality and satisfaction for our customers. We strive for innovation and continuous development to meet the changing market demands and to continually improve our operations")} .</p>
                            <p className="mb-0">{t("In summary, we are Asfour International, a leading wholesale and retail trade company, offering high-quality products at competitive prices and excellent customer service. We are committed to meeting your needs and achieving your satisfaction, striving for sustainable success in our business")} .</p>
                        </div>
                    </div>
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}