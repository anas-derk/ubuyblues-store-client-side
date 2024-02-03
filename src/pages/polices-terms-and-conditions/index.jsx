import Head from "next/head";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import LoaderPage from "@/components/LoaderPage";

export default function PolicesTermsAndConditions() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
        setIsLoadingPage(false);
    }, []);

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    return (
        <div className="privacy-policy-and-conditions">
            <Head>
                <title>Ubuyblues Store - Polices Terms And Conditions</title>
            </Head>
            {!isLoadingPage ? <>
                <Header />
                <div className="page-content text-white p-4">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-5 border-bottom border-2 pb-3 w-fit mx-auto">{t("Polices-Terms & Conditions")}</h1>
                        <div className="content">
                            <h2 className="fw-bold mb-4 h3">{t("Introduction")}</h2>
                            <p className="mb-5">{t("This privacy notice specifies how the international company Asfour or its owner or operator of this website collects and processes your personal data for the promotion, execution, and provision of Asfour services. By visiting this website, providing your personal data, or accessing and purchasing Asfour services, you explicitly agree to comply with the terms and conditions of this privacy notice. If you do not agree, please refrain from using or accessing this website or any of Asfour services")} .</p>
                            <h2 className="fw-bold mb-4 h3">{t("Definitions")}</h2>
                            <p className="mb-4">{t("The term 'subsidiary company' refers to any individual or entity, another individual or entity that, directly or indirectly, through one or more intermediaries, controls or is controlled by or is under common control with this individual or entity")} .</p>
                            <p className="mb-4">{t("This refers to the products and services offered by International Asfour online on any website and/or services and call centers, including, but not limited to, the services provided by International Asfour")} .</p>
                            <p className="mb-4">{t("This refers to a group of companies consisting of International Asfour and all its subsidiaries and affiliates collaborating with it")} .</p>
                            <p className="mb-4">{t("'The applicable laws' refer to any privacy law, personal data protection law, regulation, treaty, rule, ordinance, license, restriction, judicial or administrative order, law or public law, or any other declaration having legal effect in the State of Kuwait")}</p>
                            <p className="mb-4">{t("'The data subject' or 'You' refers to a specific or identifiable living individual to whom the personal data is related and who uses this website or the services of International Asfour")} .</p>
                            <p className="mb-4">{t("'Personal data' refers to any information related to the data subject who can be identified, directly or indirectly, particularly by reference to an identifier such as a name, identification number, location data, online identifier, or one or more factors specific to the physical, physiological, genetic, mental, economic, cultural, or social identity of the data subject.")}</p>
                            <p className="mb-4">{t("'Privacy notice' means this set of terms and conditions that govern the processing of personal data")}</p>
                            <p className="mb-4">{t("'The website' refers to the electronic website, whose main page is identified by an address, and any application for mobile devices or desktop computer application developed by International Asfour or on its behalf")} .</p>
                            <p className="mb-4">{t("'It' refers to the International Asfour company for wholesale and retail trade")}</p>
                            <p className="mb-4">{t("'It' refers to the products and services offered by International Asfour online on this website, or the services and call centers that are referenced in this privacy notic")} .</p>
                            <h2 className="fw-bold mb-4 h3">{t("What personal data do we collect ?")}</h2>
                            <p className="mb-4">{t("We collect your personal data to provide and continually improve the services of International Asfour. We gather various types of personal data")} .</p>
                            <h2 className="fw-bold mb-4 h3">{t("The personal data provided by the data subject")}</h2>
                            <p className="mb-4">{t("To provide a seamless customer experience, we receive and store your personal data related to the services of International Asfour, including, but not limited to")} .</p>
                            <p className="mb-4">{t("The name, address, and phone numbers")} .</p>
                            <p className="mb-4">{t("Payment information")} .</p>
                            <p className="mb-4">{t("age")} .</p>
                            <p className="mb-4">{t("personal description, and photographic image in your profile")} .</p>
                            <p className="mb-4">{t("Identity-related information and documents, including civil ID numbers, national ID, and driver's license")} .</p>
                            <h2 className="fw-bold mb-4 h3">{t("We automatically collect and store certain types of personal data about your use of International Asfour services. We use 'cookies' and other unique identifiers, obtaining specific types of personal data when your web browser or device accesses International Asfour services. We may collect automatic personal data from, including but not limited to")} .</h2>
                            <p className="mb-4">{t("The Internet Protocol (IP) address used to connect your computer to the internet")} .</p>
                            <p className="mb-4">{t("Login information, email address, and password")} .</p>
                            <p className="mb-4">{t("The location of your device or computer")} .</p>
                            <p className="mb-4">{t("Device metrics such as when the device is in use, application usage, connection data, any errors or failure conditions, version, and timezone settings")} .</p>
                            <p className="mb-4">{t("Date of purchase")} .</p>
                            <p className="mb-4">{t("Information from other sources")} .</p>
                            <h2 className="fw-bold mb-4 h3">{t("We may receive personal data about you from third-party sources, including International Asfour and affiliates, such as delivery and address information updated by our transportation companies, which we use to correct our records and facilitate the next purchase delivery. However, we are not responsible for the privacy practices of third-party sites that we do not own, operate, or control. We may collect personal data from other sources, including but not limited to")} .</h2>
                            <p className="mb-4">{t("Delivery information and updated address from third parties")} .</p>
                            <p className="mb-4">{t("Search results and links, including paid listings")} .</p>
                            <p className="mb-4">{t("Third-party applications or websites that allow us to collect, share, and/or use your personal data")} .</p>
                            <p className="mb-4">{t("Third-party sources providing marketing or demographic information about you to enhance our ability to tailor our content and provide International Asfour services that we believe may interest you")} .</p>
                            <h2 className="fw-bold mb-4 h3">{t("The purposes for which we use your personal data")} .</h2>
                            <p className="mb-4">{t("International Asfour uses your personal data to operate, provide, develop, and improve the services of the International Asfour website and application, including but not limited to")} :</p>
                            <h5 className="fw-bold mb-4">{t("Purchasing, delivery, and promotion")}</h5>
                            <p className="mb-4">{t("International Asfour uses your personal data to receive and process orders, provide products and services, process payments, and communicate with you regarding orders, products, services, and promotional offers from International Asfour")}</p>
                            <h5 className="fw-bold mb-4">{t("Providing error detection and correction features and improving the services of International Asfour")}</h5>
                            <p className="mb-4">{t("International Asfour uses your personal data to provide operational functions, analyze performance, troubleshoot errors, and enhance the usability and effectiveness of International Asfour services")}</p>
                            <h5 className="fw-bold mb-4">{t("Recommendations and customization")}</h5>
                            <p className="mb-4">{t("International Asfour uses your personal data to recommend products and services that may interest you, identify your preferences, and personalize your experience with International Asfour")}</p>
                            <h5 className="fw-bold mb-4">{t("Compliance with legal obligations")}</h5>
                            <p className="mb-4">{t("In some cases, International Asfour collects your personal data and uses it to comply with applicable laws")}</p>
                            <h5 className="fw-bold mb-4">{t("Advertisements")}</h5>
                            <p className="mb-4">{t("International Asfour uses your personal data to display interest-based advertisements for features, products, and services that may be of interest to you. International Asfour does not use personally identifiable information to display interest-based ads")}</p>
                            <h5 className="fw-bold mb-4">{t("Preventing fraud and credit risks")}</h5>
                            <p className="mb-4">{t("International Asfour uses your personal data to prevent, detect, and investigate fraud and misuse in order to protect the security of International Asfour and its customers. International Asfour may also use scoring methods to assess and manage risks")}</p>
                            <h2 className="fw-bold mb-4 h3">{t("Disclosure and sharing of your personal data")}</h2>
                            <p className="mb-4">{t("We may share your personal data within International Asfour to provide you access to the services of the website and the application. International Asfour may market website and application services to you as a result of such sharing unless you explicitly unsubscribe")} .</p>
                            <h2 className="fw-bold mb-4 h3">{t("Data subject rights")}</h2>
                            <p className="mb-4">{t("When we process your personal data, you have several rights regarding how the personal data is processed, and you can exercise these rights at any time. We have provided an overview of those rights below along with what it entails for you. You can exercise your rights by submitting a data subject rights request form available on this website")} .</p>
                            <h5 className="fw-bold mb-4">{t("Right to access information")}</h5>
                            <p className="mb-4">{t("You have the right to obtain clear, transparent, and easily understandable information about how we use your personal data")}</p>
                            <h5 className="fw-bold mb-4">{t("Right of access")}</h5>
                            <p className="mb-4">{t("You have the right to obtain a copy of the personal data we hold about you and to verify that we process it legally in accordance with applicable laws")}</p>
                            <h5 className="fw-bold mb-4">{t("Right to rectification")}</h5>
                            <p className="fw-bold mb-4">{t("You have the right to correct any incomplete or inaccurate personal data we hold about you. We may need to verify the accuracy of any new personal data you provide us")}</p>
                            <h5 className="fw-bold mb-4">{t("Right to erasure")}</h5>
                            <p className="mb-4">{t("You have the right to request the deletion or removal of personal data when there is no compelling reason for us to continue processing it. However, we may not always be able to comply with a deletion request for specific legal reasons, which will be notified to you, if applicable, at the time of your request")}</p>
                            <h5 className="fw-bold mb-4">{t("Right to object")}</h5>
                            <p className="mb-4">{t("In case of non-compliance with this privacy notice or applicable laws for the website and application, you have the right to object to certain types of processing, including processing for direct marketing purposes (e.g., receiving emails from us to notify you or contact you with various potential opportunities)")}</p>
                            <h5 className="fw-bold mb-4">{t("Right to restrict data processing")}</h5>
                            <p className="mb-4">{t("You have the right to restrict the processing of your personal data in the following scenarios :")}</p>
                            <p className="mb-4">{t("If you want us to verify the accuracy of personal data")} .</p>
                            <p className="mb-4">{t("When our use of the data is unlawful, but you do not want us to erase it")} .</p>
                            <p className="mb-4">{t("Your objection to our processing of your personal data, but we need to verify whether we have legitimate grounds to continue using it")}</p>
                            <h5 className="fw-bold mb-4">{t("Right to Data Portability")}</h5>
                            <p className="mb-4">{t("We will provide you, or a third party of your choice, with your personal data in a structured, commonly used, and machine-readable format. This means it can be transferred, copied, or electronically transmitted under certain circumstances")}</p>
                            <h5 className="fw-bold mb-4">{t("The right to withdraw consent")}</h5>
                            <p className="mb-4">{t("Your consent to the privacy policy below is the legal basis for Asfour International to process your personal data. However, you have the right to withdraw your consent at any time. It is important to note that withdrawing consent does not affect the legality of processing your personal data prior to the successful withdrawal. You can withdraw your consent for the processing of your personal data at any time by contacting us at")} <a href="mailto:info@asfourintlco.com">info@asfourintlco.com</a></p>
                            <h2 className="fw-bold mb-4 h3">{t("The rights related to automated decision-making and profiling")} .</h2>
                            <p className="mb-4">{t("You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects or similarly significant effects on you")} :</p>
                            <p className="mb-4">{t("Express your opinion")} .</p>
                            <p className="mb-4">{t("Obtain an explanation of the decision reached after an assessment")} .</p>
                            <p className="mb-4">{t("The right to lodge a complaint with the relevant data protection authority")} .`</p>
                            <p className="mb-4">{t("You have the right to file a complaint with the appropriate data protection authority if you believe that the processing of your personal data violates any of your rights or the provisions of applicable laws")} .</p>
                            <h2 className="fw-bold mb-4 h3">{t("Excessive or unreasonable request fees")} .</h2>
                            <p className="mb-4">{t("You will not be required to pay fees to access your personal data or exercise any of the other rights. However, we may impose a reasonable fee if we believe your access request is unfounded or excessive. Instead, we may refuse to comply with the request in such circumstances")} .</p>
                            <h2 className="fw-bold mb-4 h3">{t("Response times for data subject requests")} .</h2>
                            <p className="mb-4">{t("We aim to respond to all lawful requests within 30 days. Sometimes, it may take longer if your request is particularly complex or if you have made several requests. In such cases, we will notify you and keep you updated on the progress")} .</p>
                            <h2 className="fw-bold mb-4 h3">{t("What we may need from you")} .</h2>
                            <p className="mb-4">{t("We may need to request specific information from you to help us confirm your identity and ensure your right to access personal data (or exercise any of your other rights). This is a security measure to ensure that personal data is not disclosed to anyone who does not have the right to access it. We may also contact you to request further information regarding your request to expedite our response. If you wish to exercise any of the rights outlined above, please contact us at")} <a href="mailto:info@asfourintlco.com">info@asfourintlco.com</a>.</p>
                            <h2 className="fw-bold mb-4 h3">{t("Personal data of children")} .</h2>
                            <p className="mb-4">{t("We do not knowingly request or collect personal data from children. If you share any personal data for a child, you acknowledge and warrant that you have the authority to do so and permit Asfour International to use the personal data in accordance with the privacy notice")} .</p>
                            <h2 className="fw-bold mb-4 h3">{t("The period for retaining your personal data")} .</h2>
                            <p className="mb-4">{t("Your personal data is retained in accordance with applicable laws for a period not exceeding what is required for the purpose for which it was collected or as required by applicable laws")} .</p>
                            <p className="mb-4">{t("Asfour International retains your personal data wherever it has a legitimate interest, for the performance of a contract, where there is a vital interest to the data subject or another natural person, or for the execution of a task carried out in the public interest or in the exercise of official authority. The data may also be retained to fulfill legal or accounting requirements, or other regulatory reporting requirements, or with your consent. Afterwards, Asfour International either deletes or anonymizes the data, making it untraceable to you. However, Asfour International may continue to retain your personal data if it believes it is necessary to prevent fraud or future misuse, to enable Asfour International to exercise its legal rights, and/or to defend against legal claims, or if required by applicable laws or for other legitimate purposes. Asfour International may continue to retain your personal data in an anonymized form for analytical and research purposes")} .</p>
                        </div>
                    </div>
                </div>
            </> : <LoaderPage />}
        </div>
    );
}