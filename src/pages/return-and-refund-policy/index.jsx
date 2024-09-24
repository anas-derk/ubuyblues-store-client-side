import Head from "next/head";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { getUserInfo, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import Footer from "@/components/Footer";

export default function PolicesTermsAndConditions() {

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
        <div className="return-and-refund-policy caption-page page">
            <Head>
                <title>{t(process.env.storeName)} - {t("Return And Refund Policy")}</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content text-white ps-4 pe-4 pb-5 pt-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-5 border-bottom border-2 pb-3 w-fit mx-auto">{t("Return & Refund Policy")}</h1>
                        <div className="content">
                            <p className="mb-3">{t("You have 15 days from the date of delivery to request a return or replacement")} .</p>
                            <p className="mb-3">{t("If you have received damaged or incorrect products, please contact customer service for assistance as soon as possible")} .</p>
                            <ol>
                                <li className="mb-3">{t("Exchange one item for another is allowed")} .</li>
                                <li className="mb-3">{t("Returned products must be unused, and the original packaging must be retained, We do not accept returns of used or damaged items")} .</li>
                                <li className="mb-3">{t("Products with non-returnable tags and free gifts are not eligible for return or exchange")} .</li>
                            </ol>
                            <h6 className="fw-bold border-bottom border-2 pb-2 w-fit">{t("Note")} :</h6>
                            <ol>
                                <li className="mb-3">{t("We do not accept products that have been returned without a prior return request")} .</li>
                                <li className="mb-3">{t("Please ensure the accuracy of the return request and the products before shipping them. We will not be responsible for returns of items not purchased from our site")} .</li>
                                <li className="mb-3">{t("If the quantity of the products to be returned does not match the actual returned quantity, the courier may refuse to accept the products")} .</li>
                                <li className="mb-3">{t("Please do not send the return parcel to the address on the received package, as it is not our return address. This will affect the processing of the return")} .</li>
                                <li className="mb-3">{t("If a cancellation of an online payment order is requested before shipping, we will complete the refund process within 5 business days. A 5% deduction from the refunded amount will be applied to cover payment processing fees charged by the payment company")} .</li>
                                <li className="mb-3">{t("Orders paid online will be refunded within 5 business days due to stock depletion, damage, or deviation from the confirmed sample, without processing fees. The refund will be transferred via the original payment method")} .</li>
                                <li className="mb-3">{t("In case of illegal conflicts with regular payments, certain fees will be imposed according to the severity of the situation")} .</li>
                                <li className="mb-3">{t("Ubuyblues reserves the right to the final interpretation")} .</li>
                            </ol>
                            Email: <a href="mailto:info@ubuyblues.com" className="text-white border-bottom border-2 pb-2 mb-3 d-block w-fit">info@ubuyblues.com</a>
                            <p className="mb-3">{t("If you have a return or replacement request, please follow the steps below, and we will assist you with sincerity")}</p>
                            <ol>
                                <li className="mb-3">{t("If you wish to return your order, please send the return request to info@ubuyblues.com via email. Provide information about the returned items, reasons for the return, and photos of the original packaging")} .</li>
                                <li className="mb-3">{t("Our team will review your request within 5 business days")} .</li>
                            </ol>
                            <p className="mb-3">{t("After verification, our service team will inform you of the refund amount and the next steps. (Refund amount = Value of returned items - Return shipping fees)")} .</p>
                            <p className="mb-3">{t("Note: If the review is unsuccessful, the employee will inform you of the reasons via email. If you wish to submit the return request again, please provide evidence to us via email. Our team will process your request within 5 business days")} .</p>
                            <p className="mb-3">{t("By visiting or purchasing from our site, you are engaging in our service and agree to abide by the terms and conditions, including those terms, conditions, and additional policies referenced herein and/or available by hyperlink. These terms of service apply to all users of the site, including but not limited to users who are browsers, vendors, customers, merchants, and/or contributors of content")} .</p>
                            <p className="mb-3">{t("Please read these terms of service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these terms of service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services. If these terms of service are considered an offer, acceptance is expressly limited to these terms of service")} .</p>
                            <p className="mb-3">{t("You may not use our products for any illegal or unauthorized purpose, and you must not, in the use of the service, violate any laws in your jurisdiction (including, but not limited to, copyright laws)")} .</p>
                            <p className="mb-3">{t("Any new features or tools added to the current store shall also be subject to the terms of service. You can review the most current version of the terms of service at any time on this page. We reserve the right to update, change, or replace any part of these terms of service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes. Your continued use of or access to the website following the posting of any changes constitutes acceptance of those changes")} .</p>
                            <p className="mb-3">{t("By agreeing to these terms of service, you acknowledge that you are at least the age of majority in your country of residence")} .</p>
                            <p className="mb-3">{t("You may not use our products for any illegal or unauthorized purpose, and you must not, in the use of the service, violate any laws in your jurisdiction (including, but not limited to, copyright laws)")} .</p>
                            <p className="mb-3">{t("Violation of any of the terms will result in immediate termination of your services")} .</p>
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