import { GrFormClose } from "react-icons/gr";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import Link from "next/link";
import { getAnimationSettings, getInitialStateForElementBeforeAnimation, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import { motion } from "motion/react";

export default function ErrorPopup({ setIsDisplayErrorPopup, errorType, errorMsg }) {

    const { i18n, t } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.userlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    return (
        <div className="error-popup popup-box">
            <div className="error-box content-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                <GrFormClose className="close-error-popup-icon close-popup-box-icon" onClick={() => setIsDisplayErrorPopup(false)} />
                {(errorType === "user-not-logged-in-for-rating" || errorType === "user-not-logged-in-for-add-product-to-favourite-products-list") ? <>
                    <motion.h5 className="mb-5 pb-3 border-bottom border-white" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("Sorry, You Are Not Logged In !!")}</motion.h5>
                    <div className="row">
                        <motion.h6 className="mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={() => getAnimationSettings(0.3)}>{errorType === "user-not-logged-in-for-rating" ? t("In Order To Rate, Please Log In First") : t("In Order To Add The Product To Your Favorites List, Please Log In First")} .</motion.h6>
                        <motion.h6 className="mb-5" initial={getInitialStateForElementBeforeAnimation()} whileInView={() => getAnimationSettings(0.3)}>{t("You Can Log In By Clicking The Following Button")} .</motion.h6>
                        <motion.div initial={getInitialStateForElementBeforeAnimation()} whileInView={() => getAnimationSettings(0.3)}>
                            <Link href="/auth" className="btn btn-success login-btn">{t("Log In")}</Link>
                        </motion.div>
                    </div>
                </> : <div className="error-msg-box">
                    <motion.h5 className="mb-5 pb-3 border-bottom border-white" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{errorMsg}</motion.h5>
                </div>}
            </div>
        </div>
    );
}