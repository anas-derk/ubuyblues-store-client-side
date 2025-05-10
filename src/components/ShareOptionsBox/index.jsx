import { GrFormClose } from "react-icons/gr";
import { WhatsappShareButton, WhatsappIcon, FacebookShareButton, FacebookIcon, FacebookMessengerShareButton, FacebookMessengerIcon, TelegramShareButton, TelegramIcon } from "react-share";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { getAnimationSettings, getInitialStateForElementBeforeAnimation, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import { motion } from "motion/react";

export default function ShareOptionsBox({ setIsDisplayShareOptionsBox, sharingName, sharingURL }) {

    const { i18n, t } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    return (
        <div className="share-options-box popup-box">
            <div className="share-icons-box content-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                <GrFormClose className="close-share-options-box-icon close-popup-box-icon" onClick={() => setIsDisplayShareOptionsBox(false)} />
                <motion.h5
                    className="mb-3 pb-3 border-bottom border-white"
                    initial={getInitialStateForElementBeforeAnimation()}
                    whileInView={getAnimationSettings}
                >{t(`Share Your Favorite ${sharingName} With Your Friends`)}</motion.h5>
                <motion.div className="row" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                    <div className="col-md-3">
                        <WhatsappShareButton url={sharingURL} title={t(`Sharing Your Favorite ${sharingName} On ${process.env.WEBSITE_NAME}`)}>
                            <WhatsappIcon size={35} round />
                        </WhatsappShareButton>
                    </div>
                    <div className="col-md-3">
                        <FacebookShareButton url={sharingURL} title={t(`Sharing Your Favorite ${sharingName} On ${process.env.WEBSITE_NAME}`)}>
                            <FacebookIcon size={35} round />
                        </FacebookShareButton>
                    </div>
                    <div className="col-md-3">
                        <TelegramShareButton url={sharingURL} title={t(`Sharing Your Favorite ${sharingName} On ${process.env.WEBSITE_NAME}`)}>
                            <TelegramIcon size={35} round />
                        </TelegramShareButton>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}