import { useTranslation } from "react-i18next";
import Link from "next/link";
import { PiShareFatLight } from "react-icons/pi";

export default function StoreCard({
    storeDetails,
    setIsDisplayShareOptionsBox,
    setSharingName,
    setSharingURL
}) {

    const { i18n, t } = useTranslation();

    const handleDisplayShareOptionsBox = (sharingURL) => {
        setIsDisplayShareOptionsBox(true);
        setSharingName("Store");
        setSharingURL(sharingURL);
    }

    return (
        <div className="store-card card-box">
            <div
                className="store-managment-box managment-box"
            >
                <img src={`${process.env.BASE_API_URL}/${storeDetails.imagePath}`} alt={`${storeDetails.name[i18n.language]} Store Image`} />
                <Link className="store-overlay card-overlay" href={`/?storeId=${storeDetails._id}`}></Link>
                <div className="store-managment-buttons managment-buttons p-2">
                    <PiShareFatLight
                        className="store-managment-icon managment-icon d-block"
                        onClick={() => handleDisplayShareOptionsBox(`${process.env.WEBSITE_URL}/?storeId=${storeDetails._id}`)}
                    />
                </div>
            </div>
            <div className="store-details details-box p-3 text-center">
                <h6 className="store-name fw-bold mb-4 ">{t("Store Name")} : {storeDetails.name[i18n.language]}</h6>
                <h6 className="products-type fw-bold mb-4">{t("Products Type")} : {storeDetails.productsType[i18n.language]}</h6>
                <h6 className="products-description fw-bold">{t("Products Description")} : {storeDetails.productsDescription[i18n.language]}</h6>
            </div>
        </div>
    );
}