import { GrFormClose } from "react-icons/gr";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { getAnimationSettings, getInitialStateForElementBeforeAnimation, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import { motion } from "motion/react";

export default function ConfirmDeleteAllBox({ setIsDisplayConfirmDeleteAllBox, dataNames, waitMsg, errorMsg, successMsg, deleteAll }) {

    const { i18n, t } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.userlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    return (
        <div className="confirm-delete-all-box popup-box">
            <div className="confirm-delete-box content-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                <GrFormClose className="close-confirm-delete-all-box-icon close-popup-box-icon" onClick={() => setIsDisplayConfirmDeleteAllBox(false)} />
                <motion.h5
                    className="mb-5 pb-3 border-bottom border-white"
                    initial={getInitialStateForElementBeforeAnimation()}
                    whileInView={getAnimationSettings}
                >{t("Are You Sure From Delete All {{dataNames}} ?", { dataNames })}</motion.h5>
                <motion.div className="row" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                    {
                        !waitMsg &&
                        !errorMsg &&
                        !successMsg &&
                        <button
                            className="btn btn-danger d-block mx-auto mb-4 global-button"
                            onClick={deleteAll}
                        >
                            {t("Confirm Delete All")}
                        </button>
                    }
                    {waitMsg &&
                        <button
                            className="btn btn-info d-block mx-auto mb-3 global-button"
                            disabled
                        >
                            {waitMsg}
                        </button>
                    }
                    {errorMsg &&
                        <button
                            className="btn btn-danger d-block mx-auto mb-3 global-button"
                            disabled
                        >
                            {errorMsg}
                        </button>
                    }
                    {successMsg &&
                        <button
                            className="btn btn-success d-block mx-auto mb-3 global-button"
                            disabled
                        >
                            {successMsg}
                        </button>
                    }
                </motion.div>
            </div>
        </div>
    );
}