import { GrFormClose } from "react-icons/gr";
import { WhatsappShareButton, WhatsappIcon, FacebookShareButton, FacebookIcon, FacebookMessengerShareButton, FacebookMessengerIcon, TelegramShareButton, TelegramIcon } from "react-share";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { handleSelectUserLanguage } from "../../../public/global_functions/popular";

export default function ShareOptionsBox({ setIsDisplayShareOptionsBox, sharingName, sharingURL }) {

    const { i18n, t } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.userlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    return (
        <div className="share-options-box popup-box">
            <div className="share-icons-box content-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                <GrFormClose className="close-share-options-box-icon close-popup-box-icon" onClick={() => setIsDisplayShareOptionsBox(false)} />
                <h5 className="mb-3 pb-3 border-bottom border-white">{t(`Share Your Favorite ${sharingName} With Your Friends`)}</h5>
                <div className="row">
                    <div className="col-md-3">
                        <WhatsappShareButton url={sharingURL} title={t(`Sharing Your Favorite ${sharingName} On Ubuyblues`)}>
                            <WhatsappIcon size={35} round />
                        </WhatsappShareButton>
                    </div>
                    <div className="col-md-3">
                        <FacebookShareButton url={sharingURL} title={t(`Sharing Your Favorite ${sharingName} On Ubuyblues`)}>
                            <FacebookIcon size={35} round />
                        </FacebookShareButton>
                    </div>
                    <div className="col-md-3">
                        <FacebookMessengerShareButton url={sharingURL} title={t(`Sharing Your Favorite ${sharingName} On Ubuyblues`)}>
                            <FacebookMessengerIcon size={35} round />
                        </FacebookMessengerShareButton>
                    </div>
                    <div className="col-md-3">
                        <TelegramShareButton url={sharingURL} title={t(`Sharing Your Favorite ${sharingName} On Ubuyblues`)}>
                            <TelegramIcon size={35} round />
                        </TelegramShareButton>
                    </div>
                </div>
            </div>
        </div>
    );
}