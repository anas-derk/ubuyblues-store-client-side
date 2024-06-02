import Head from "next/head";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { getUserInfo } from "../../../public/global_functions/popular";
import Footer from "@/components/Footer";

export default function PolicesTermsAndConditions() {

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
        <div className="privacy-policy-and-conditions caption-page">
            <Head>
                <title>{t("Ubuyblues Store")} - {t("Polices Terms And Conditions")}</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content page text-white p-4 pb-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-5 border-bottom border-2 pb-3 w-fit mx-auto">{t("Polices-Terms & Conditions")}</h1>
                        <div className="content">
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Introduction")}</h2>
                            <p className="mb-5">{t("This privacy notice specifies how the international company Asfour or its owner or operator of this website collects and processes your personal data for the promotion, execution, and provision of Asfour services. By visiting this website, providing your personal data, or accessing and purchasing Asfour services, you explicitly agree to comply with the terms and conditions of this privacy notice. If you do not agree, please refrain from using or accessing this website or any of Asfour services")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Definitions")}</h2>
                            <ul>
                                <li className="mb-4">{t("The term 'subsidiary company' refers to any individual or entity, another individual or entity that, directly or indirectly, through one or more intermediaries, controls or is controlled by or is under common control with this individual or entity")}</li>
                                <li className="mb-4">{t("This refers to the products and services offered by International Asfour online on any website and/or services and call centers, including, but not limited to, the services provided by International Asfour")} .</li>
                                <li className="mb-4">{t("This refers to a group of companies consisting of International Asfour and all its subsidiaries and affiliates collaborating with it")} .</li>
                                <li className="mb-4">{t("'The applicable laws' refer to any privacy law, personal data protection law, regulation, treaty, rule, ordinance, license, restriction, judicial or administrative order, law or public law, or any other declaration having legal effect in the State of Kuwait")}</li>
                                <li className="mb-4">{t("'The data subject' or 'You' refers to a specific or identifiable living individual to whom the personal data is related and who uses this website or the services of International Asfour")} .</li>
                                <li className="mb-4">{t("'Personal data' refers to any information related to the data subject who can be identified, directly or indirectly, particularly by reference to an identifier such as a name, identification number, location data, online identifier, or one or more factors specific to the physical, physiological, genetic, mental, economic, cultural, or social identity of the data subject")}</li>
                                <li className="mb-4">{t("'Privacy notice' means this set of terms and conditions that govern the processing of personal data")}</li>
                                <li className="mb-4">{t("'The website' refers to the electronic website, whose main page is identified by an address, and any application for mobile devices or desktop computer application developed by International Asfour or on its behalf")} .</li>
                                <li className="mb-4">{t("'It' refers to the International Asfour company for wholesale and retail trade")}</li>
                                <li className="mb-4">{t("'It' refers to the products and services offered by International Asfour online on this website, or the services and call centers that are referenced in this privacy notice")} .</li>
                            </ul>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("What personal data do we collect ?")}</h2>
                            <p className="mb-4">{t("We collect your personal data to provide and continually improve the services of International Asfour. We gather various types of personal data")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("The personal data provided by the data subject")}</h2>
                            <ul>
                                <li className="mb-4">{t("To provide a seamless customer experience, we receive and store your personal data related to the services of International Asfour, including, but not limited to")} .</li>
                                <li className="mb-4">{t("The name, address, and phone numbers")} .</li>
                                <li className="mb-4">{t("Payment information")} .</li>
                                <li className="mb-4">{t("age")} .</li>
                                <li className="mb-4">{t("personal description, and photographic image in your profile")} .</li>
                                <li className="mb-4">{t("Identity-related information and documents, including civil ID numbers, national ID, and driver's license")} .</li>
                            </ul>
                            <p className="fw-bold mb-4 h5 border-bottom border-2 w-fit pb-2">{t("We automatically collect and store certain types of personal data about your use of International Asfour services. We use 'cookies' and other unique identifiers, obtaining specific types of personal data when your web browser or device accesses International Asfour services. We may collect automatic personal data from, including but not limited to")}</p>
                            <ul>
                                <li className="mb-4">{t("The Internet Protocol (IP) address used to connect your computer to the internet")} .</li>
                                <li className="mb-4">{t("Login information, email address, and password")} .</li>
                                <li className="mb-4">{t("The location of your device or computer")} .</li>
                                <li className="mb-4">{t("Device metrics such as when the device is in use, application usage, connection data, any errors or failure conditions, version, and timezone settings")} .</li>
                                <li className="mb-4">{t("Date of purchase")} .</li>
                                <li className="mb-4">{t("Information from other sources")} .</li>
                            </ul>
                            <p className="fw-bold mb-4 h5 border-bottom border-2 w-fit pb-2">{t("We may receive personal data about you from third-party sources, including International Asfour and affiliates, such as delivery and address information updated by our transportation companies, which we use to correct our records and facilitate the next purchase delivery. However, we are not responsible for the privacy practices of third-party sites that we do not own, operate, or control. We may collect personal data from other sources, including but not limited to")}</p>
                            <ul>
                                <li className="mb-4">{t("Delivery information and updated address from third parties")} .</li>
                                <li className="mb-4">{t("Search results and links, including paid listings")} .</li>
                                <li className="mb-4">{t("Third-party applications or websites that allow us to collect, share, and/or use your personal data")} .</li>
                                <li className="mb-4">{t("Third-party sources providing marketing or demographic information about you to enhance our ability to tailor our content and provide International Asfour services that we believe may interest you")} .</li>
                            </ul>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("The purposes for which we use your personal data")}</h2>
                            <p className="mb-4">{t("International Asfour uses your personal data to operate, provide, develop, and improve the services of the International Asfour website and application, including but not limited to")} :</p>
                            <h6 className="fw-bold mb-4">{t("Purchasing, delivery, and promotion")}</h6>
                            <p className="mb-4">{t("International Asfour uses your personal data to receive and process orders, provide products and services, process payments, and communicate with you regarding orders, products, services, and promotional offers from International Asfour")} .</p>
                            <h6 className="fw-bold mb-4">{t("Providing error detection and correction features and improving the services of International Asfour")}</h6>
                            <p className="mb-4">{t("International Asfour uses your personal data to provide operational functions, analyze performance, troubleshoot errors, and enhance the usability and effectiveness of International Asfour services")} .</p>
                            <h6 className="fw-bold mb-4">{t("Recommendations and customization")}</h6>
                            <p className="mb-4">{t("International Asfour uses your personal data to recommend products and services that may interest you, identify your preferences, and personalize your experience with International Asfour")} .</p>
                            <h6 className="fw-bold mb-4">{t("Compliance with legal obligations")}</h6>
                            <p className="mb-4">{t("In some cases, International Asfour collects your personal data and uses it to comply with applicable laws")} .</p>
                            <h6 className="fw-bold mb-4">{t("Advertisements")}</h6>
                            <p className="mb-4">{t("International Asfour uses your personal data to display interest-based advertisements for features, products, and services that may be of interest to you. International Asfour does not use personally identifiable information to display interest-based ads")} .</p>
                            <h5 className="fw-bold mb-4">{t("Preventing fraud and credit risks")}</h5>
                            <p className="mb-4">{t("International Asfour uses your personal data to prevent, detect, and investigate fraud and misuse in order to protect the security of International Asfour and its customers. International Asfour may also use scoring methods to assess and manage risks")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Disclosure and sharing of your personal data")}</h2>
                            <p className="mb-4">{t("We may share your personal data within International Asfour to provide you access to the services of the website and the application. International Asfour may market website and application services to you as a result of such sharing unless you explicitly unsubscribe")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Data subject rights")}</h2>
                            <p className="mb-4">{t("When we process your personal data, you have several rights regarding how the personal data is processed, and you can exercise these rights at any time. We have provided an overview of those rights below along with what it entails for you. You can exercise your rights by submitting a data subject rights request form available on this website")} .</p>
                            <h5 className="fw-bold mb-4">{t("Right to access information")}</h5>
                            <p className="mb-4">{t("You have the right to obtain clear, transparent, and easily understandable information about how we use your personal data")} .</p>
                            <h6 className="fw-bold mb-4">{t("Right of access")}</h6>
                            <p className="mb-4">{t("You have the right to obtain a copy of the personal data we hold about you and to verify that we process it legally in accordance with applicable laws")} .</p>
                            <h6 className="fw-bold mb-4">{t("Right to rectification")}</h6>
                            <p className="mb-4">{t("You have the right to correct any incomplete or inaccurate personal data we hold about you. We may need to verify the accuracy of any new personal data you provide us")} .</p>
                            <h6 className="fw-bold mb-4">{t("Right to erasure")}</h6>
                            <p className="mb-4">{t("You have the right to request the deletion or removal of personal data when there is no compelling reason for us to continue processing it. However, we may not always be able to comply with a deletion request for specific legal reasons, which will be notified to you, if applicable, at the time of your request")} .</p>
                            <h6 className="fw-bold mb-4">{t("Right to object")}</h6>
                            <p className="mb-4">{t("In case of non-compliance with this privacy notice or applicable laws for the website and application, you have the right to object to certain types of processing, including processing for direct marketing purposes (e.g., receiving emails from us to notify you or contact you with various potential opportunities)")} .</p>
                            <h6 className="fw-bold mb-4">{t("Right to restrict data processing")}</h6>
                            <p className="mb-4">{t("You have the right to restrict the processing of your personal data in the following scenarios :")}</p>
                            <p className="mb-4">{t("If you want us to verify the accuracy of personal data")} .</p>
                            <p className="mb-4">{t("When our use of the data is unlawful, but you do not want us to erase it")} .</p>
                            <p className="mb-4">{t("Your objection to our processing of your personal data, but we need to verify whether we have legitimate grounds to continue using it")}</p>
                            <h6 className="fw-bold mb-4">{t("Right to Data Portability")}</h6>
                            <p className="mb-4">{t("We will provide you, or a third party of your choice, with your personal data in a structured, commonly used, and machine-readable format. This means it can be transferred, copied, or electronically transmitted under certain circumstances")}</p>
                            <h6 className="fw-bold mb-4">{t("The right to withdraw consent")}</h6>
                            <p className="mb-4">{t("Your consent to the privacy policy below is the legal basis for Asfour International to process your personal data. However, you have the right to withdraw your consent at any time. It is important to note that withdrawing consent does not affect the legality of processing your personal data prior to the successful withdrawal. You can withdraw your consent for the processing of your personal data at any time by contacting us at")} <a href="mailto:info@asfourintlco.com">info@asfourintlco.com</a></p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("The rights related to automated decision-making and profiling")} .</h2>
                            <p className="mb-4">{t("You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects or similarly significant effects on you")} :</p>
                            <ul>
                                <li className="mb-4">{t("Express your opinion")} .</li>
                                <li className="mb-4">{t("Obtain an explanation of the decision reached after an assessment")} .</li>
                                <li className="mb-4">{t("The right to lodge a complaint with the relevant data protection authority")} .`</li>
                                <li className="mb-4">{t("You have the right to file a complaint with the appropriate data protection authority if you believe that the processing of your personal data violates any of your rights or the provisions of applicable laws")} .</li>
                            </ul>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Excessive or unreasonable request fees")}</h2>
                            <p className="mb-4">{t("You will not be required to pay fees to access your personal data or exercise any of the other rights. However, we may impose a reasonable fee if we believe your access request is unfounded or excessive. Instead, we may refuse to comply with the request in such circumstances")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Response times for data subject requests")}</h2>
                            <p className="mb-4">{t("We aim to respond to all lawful requests within 30 days. Sometimes, it may take longer if your request is particularly complex or if you have made several requests. In such cases, we will notify you and keep you updated on the progress")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("What we may need from you")}</h2>
                            <p className="mb-4">{t("We may need to request specific information from you to help us confirm your identity and ensure your right to access personal data (or exercise any of your other rights). This is a security measure to ensure that personal data is not disclosed to anyone who does not have the right to access it. We may also contact you to request further information regarding your request to expedite our response. If you wish to exercise any of the rights outlined above, please contact us at")} <a href="mailto:info@asfourintlco.com">info@asfourintlco.com</a>.</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Personal data of children")}</h2>
                            <p className="mb-4">{t("We do not knowingly request or collect personal data from children. If you share any personal data for a child, you acknowledge and warrant that you have the authority to do so and permit Asfour International to use the personal data in accordance with the privacy notice")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("The period for retaining your personal data")}</h2>
                            <ul>
                                <li className="mb-4">{t("Your personal data is retained in accordance with applicable laws for a period not exceeding what is required for the purpose for which it was collected or as required by applicable laws")} .</li>
                                <li className="mb-4">{t("Asfour International retains your personal data wherever it has a legitimate interest, for the performance of a contract, where there is a vital interest to the data subject or another natural person, or for the execution of a task carried out in the public interest or in the exercise of official authority. The data may also be retained to fulfill legal or accounting requirements, or other regulatory reporting requirements, or with your consent. Afterwards, Asfour International either deletes or anonymizes the data, making it untraceable to you. However, Asfour International may continue to retain your personal data if it believes it is necessary to prevent fraud or future misuse, to enable Asfour International to exercise its legal rights, and/or to defend against legal claims, or if required by applicable laws or for other legitimate purposes. Asfour International may continue to retain your personal data in an anonymized form for analytical and research purposes")} .</li>
                            </ul>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("How we protect your personal data ?")}</h2>
                            <p className="mb-4">{t("In an effort to protect your personal data from unauthorized access, disclosure, loss, alteration, or misuse, we employ security practices and measures, based on our discretion, in accordance with applicable laws or international standards")} .</p>
                            <p className="mb-4">{t("Such as ISO/IEC 27001:2013. We design our systems with consideration for security and privacy. We adhere to standard security measures and continuously update our systems to protect your personal data from any breaches or virus exposure. We use various methods to safeguard personal data as outlined below")} :</p>
                            <ul>
                                <li className="mb-4">{t("Physical measures include locked file cabinets, restricted access to offices, and alarm systems")}</li>
                                <li className="mb-4">{t("Technological tools such as password encryption and encryption using best practices in this field in general")}</li>
                                <li className="mb-4">{t("Regulatory controls, confidentiality agreements, restricted access on a need-to-know basis, employee training, and security clearances")}</li>
                                <li className="mb-4">{t("Online security is enhanced through the integration of measures such as encryption tools and authentication to protect your personal data from unauthorized use. Firewalls are used to protect our servers and network from unauthorized user access and tampering with files and other personal data we store. Additionally, we conduct regular malware scans to prevent data breaches")}</li>
                                <li className="mb-4">{t("Your personal data is contained behind secured networks and can only be accessed by a limited number of individuals who have special access rights to these systems and are required to keep the personal data confidential. In addition, all sensitive personal data and credit card information you provide is encrypted via Secure Socket Layer (SSL) technology")}</li>
                            </ul>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Changing the Purpose")}</h2>
                            <p className="mb-4">{t("We will use your personal data for the purposes outlined in this privacy policy only, unless we find a justifiable reason to use it for another reason, and that reason is compatible with the original purpose")} .</p>
                            <p className="mb-4">{t("If we need to use your personal data for an unrelated purpose, we will inform you and explain the legal basis that allows us to do so. If you would like an explanation of how the processing for the new purpose is compatible with the original purpose, please contact the Data Protection Officer using the contact details provided in this privacy notice")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Aggregated or Pre-classified Data")}</h2>
                            <p className="mb-4">{t("Asfour International may also collect and/or generate anonymized and aggregated information from your use of Asfour International services. Anonymous or aggregated information is not considered personal data, as we are unable to identify you using any available means from that anonymized or aggregated information. The anonymous and aggregated information is used for various tasks, including assisting us in identifying and addressing any errors, improving the performance of Asfour International services, and may be used in various ways such as internal analysis, analytics, and research. Asfour International may share this information with third parties for purposes related to them or their interests in an anonymized or aggregated form designed to prevent anyone from identifying you")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Consent, Compensation, and Liability")}</h2>
                            <p className="mb-4">{t("In accordance with the Privacy Notice, you hereby grant Asfour International the right to process your personal data, internally or with third parties, for the purposes outlined in this notice. You acknowledge that you provided your personal data voluntarily and that this personal data is true, accurate, complete, and up-to-date")} .</p>
                            <p className="mb-4">{t("You agree to defend Asfour International and its contributors, officials, directors, employees, and indemnify and protect them from any and all claims, liabilities, damages, losses, or expenses (including, but not limited to, settlement amounts, reasonable legal fees, and personal expenses) arising out of or related to any form of your access to or use of this website")} .</p>
                            <p className="mb-4">{t("Asfour International and its directors and employees shall not be liable in any form for any direct, indirect, incidental, consequential, or punitive damages (including, but not limited to, loss of profits, business interruption, and loss of programs on your information system) arising out of or related to")} :</p>
                            <ol>
                                <li className="mb-4">{t("The use or access to, or inability to use, the information or branching links available on this website or Asfour International's services or any vendor services")} .</li>
                                <li className="mb-4">{t("Your provision of any information, including your personal data")}</li>
                                <li className="mb-4">{t("Any failure, delay, error, interruptions, or inaccuracies directly or indirectly resulting from any cause, including but not limited to unauthorized access or misuse of personal data by any third party, network service failures, or the operation of this website or any solution operating this website")} .</li>
                                <li className="mb-4">{t("Actions or negligence of Asfour International or any of its affiliated external service providers, agents, or employees")} .</li>
                            </ol>
                            <p className="mb-4">{t("Asfour International disclaims and excludes to the fullest extent permitted by applicable laws all warranties and representations, whether express, implied, or statutory, regarding this website or the result of your use of this website or Asfour International's services, or regarding the accuracy, currency, or completeness of the information provided by Asfour International, including, for example, implied warranties of fitness for a particular purpose and non-infringement of patent, trademark, or any other intellectual property right. All contents of this website, including, for example, all content and information and links therein, are provided 'as is' with no warranty that they will be uninterrupted or error-free. This disclaimer applies to all causes of action, whether based on contract, warranty, tort, or any other legal theories")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Customer Behavior Policy")}</h2>
                            <p className="mb-4">{t("At Asfour International, customer satisfaction is our top priority, and we strive to resolve all customer issues in a professional and friendly manner. However, we will not tolerate any unacceptable or unreasonable behavior towards our customer service team members")} .</p>
                            <p className="mb-4">{t("Unacceptable behavior towards Asfour International's customer service employees may include, for example")} :</p>
                            <ul>
                                <li>{t("Submitting repetitive or consistently malicious complaints, despite the matter being fully addressed; similarly, ongoing repetition of complaints despite reasonable and fair solutions provided according to our policies")} .</li>
                                <li>{t("Demanding or expecting employees to violate the company's applicable policy guidelines")} .</li>
                                <li>{t("A large number of complaints compared to the total purchase value over time")} .</li>
                            </ul>
                            <p className="mb-4">{t("For such behavior, complainants may be notified formally with the following")} :</p>
                            <ul>
                                <li>{t("Their language is considered offensive, abusive, threatening, and entirely unacceptable")} .</li>
                                <li>{t("They must refrain from using such language, abuse, and threats")} .</li>
                                <li>{t("There will be no further exchange of correspondence on this matter if they continue this behavior")} .</li>
                            </ul>
                            <p className="mb-4">{t("Asfour International reserves the right to refuse customer requests in the future without further notice")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Complaint Escalation Process")}</h2>
                            <p className="mb-4">{t("This process strictly applies to customer service issues. For separate legal issues such as copyright rights")} .</p>
                            <p className="mb-4">{t("Contact Us > Submit a Ticket > Select Warranty and Return > Submit Formal Complaint")} .</p>
                            <p className="mb-4">{t("We will respond to all complaints within 24 hours, excluding weekends and official holidays")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Intellectual property rights")}</h2>
                            <p className="mb-4">{t("This website and all its contents, including but not limited to all texts, graphics, HTML code, all product names, trade names, service names, domain names, and trademark fonts or logos in any form or text, are materials protected by copyright and may not be printed, copied, published, reproduced, or used (including images of faces) or distributed in whole or in part without the prior written consent of Asfour International")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Changes to the Privacy Notice")}</h2>
                            <p className="mb-4">{t("The last modification: (February 15, 2024)")} .</p>
                            <h2 className="fw-bold mb-4 h4 border-bottom border-2 w-fit pb-2">{t("Contact us")}</h2>
                            <p className="mb-4">{t("If you have any comments or inquiries regarding our terms or privacy policy, you can contact us by sending an email or calling customer service at the following address")} .</p>
                            <a href="mailto:info@asfourintlco.com" className="text-white border-bottom pb-2">info@asfourintlco.com</a>
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