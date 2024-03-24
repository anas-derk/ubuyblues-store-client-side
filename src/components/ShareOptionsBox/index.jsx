import { GrFormClose } from "react-icons/gr";
import { WhatsappShareButton, WhatsappIcon, FacebookShareButton, FacebookIcon, FacebookMessengerShareButton, FacebookMessengerIcon, TelegramShareButton, TelegramIcon } from "react-share";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function ShareOptionsBox({ setIsDisplayShareOptionsBox }) {

    const { i18n, t } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
    }, []);

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    return (
        <div className="share-options-box">
            <div className="share-icons-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                <GrFormClose className="close-share-options-box-icon" onClick={() => setIsDisplayShareOptionsBox(false)} />
                <h2 className="mb-3 pb-3 border-bottom border-white">{t("Share Your Favorite Product With Your Friends")}</h2>
                <div className="row">
                    <div className="col-md-3">
                        <WhatsappShareButton url={"https://ubuyblues.com"} title="تحقق من هذا المنتج">
                            <WhatsappIcon size={45} round />
                        </WhatsappShareButton>
                    </div>
                    <div className="col-md-3">
                        <FacebookShareButton url={"https://ubuyblues.com"} title="تحقق من هذا المنتج">
                            <FacebookIcon size={45} round />
                        </FacebookShareButton>
                    </div>
                    <div className="col-md-3">
                        <FacebookMessengerShareButton url={"https://ubuyblues.com"} title="تحقق من هذا المنتج">
                            <FacebookMessengerIcon size={45} round />
                        </FacebookMessengerShareButton>
                    </div>
                    <div className="col-md-3">
                        <TelegramShareButton url={"https://ubuyblues.com"} title="تحقق من هذا المنتج">
                            <TelegramIcon size={45} round />
                        </TelegramShareButton>
                    </div>
                </div>
            </div>
        </div>
    );
}