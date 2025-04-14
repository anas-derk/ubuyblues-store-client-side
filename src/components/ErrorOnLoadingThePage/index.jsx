import { PiSmileySad } from "react-icons/pi";
import Header from "../Header";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { handleSelectUserLanguage } from "../../../public/global_functions/popular";
import { motion } from "motion/react";

export default function ErrorOnLoadingThePage({ errorMsg }) {

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    return (
        <div className="error-on-loading-component">
            <Header />
            <div className="error-msg-on-loading-the-page text-center text-white d-flex flex-column justify-content-center align-items-center">
                <motion.div
                    initial={{
                        opacity: 0
                    }}
                    animate={{
                        opacity: 1,
                        transition: {
                            delay: 0.5,
                            duration: 0.3
                        }
                    }}
                >
                    <PiSmileySad className="error-icon mb-5" />
                </motion.div>
                <motion.p
                    className="error-msg-on-loading-box"
                    initial={{
                        opacity: 0
                    }}
                    animate={{
                        opacity: 1,
                        transition: {
                            delay: 0.8,
                            duration: 0.3
                        }
                    }}
                >{t(errorMsg)}</motion.p>
            </div>
        </div>
    );
}