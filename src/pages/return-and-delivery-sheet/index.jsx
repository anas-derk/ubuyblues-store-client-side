import Head from "next/head";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { getUserInfo, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import Footer from "@/components/Footer";

export default function ReturnAndDeliverySheet() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

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

    return (
        <div className="return-and-delivery-sheet caption-page page">
            <Head>
                <title>{t(process.env.storeName)} - {t("Return And Delivery Sheet")}</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content text-white ps-4 pe-4 pb-5 pt-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-5 border-bottom border-2 pb-3 w-fit mx-auto">{t("Return And Delivery Sheet")}</h1>
                        <div className="content">
                            <p className="mb-3">{t("If your purchase does not meet your expectations, we are happy to offer you a free return service within 15 days of purchase")} .</p>
                            <p className="mb-3">{t("We will arrange for the collection of the products you wish to return from your address")} .</p>
                            <p className="mb-3">{t("All products are inspected before being handed over to the delivery representative, but if you receive a damaged product, or one with defects, or missing essential parts, please contact our customer service team via email at info@ubuyblues.com within 48 hours of receiving the products")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("All products can be returned except for the following")} :</h2>
                            <ol>
                                <li className="mb-3">{t("Underwear and lingerie")} .</li>
                                <li className="mb-3">{t("Perfumes that have been opened, tested, or used")} .</li>
                                <li className="mb-3">{t("Any product that has been exchanged or modified")} .</li>
                                <li className="mb-3">{t("Any used product")} .</li>
                                <li className="mb-3">{t("Any product not received in the original packaging")} .</li>
                                <li className="mb-3">{t("Any product without the original product tags or labels")} .</li>
                            </ol>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Follow the return instructions")} :</h2>
                            <ol>
                                <li className="mb-3">{t("Please ensure that the products comply with our return policy")} .</li>
                                <li className="mb-3">{t("Please contact our customer service team at info@ubuyblues.com and provide us with the order number of the product to be returned, your contact details, and your phone number to assist our customer service team in processing the return of the desired product")} .</li>
                                <li className="mb-3">{t("Our customer service and delivery team will contact you to arrange a convenient time for the collection of the product to be returned")} .</li>
                                <li className="mb-3">{t("Please follow the return process as specified by the customer service team")} .</li>
                                <li className="mb-3">{t("Once we receive the return shipment at our warehouse and successfully review the products, we will refund the amount to you within 7-10 business days")} .</li>
                            </ol>
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