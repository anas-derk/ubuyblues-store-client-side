import { useTranslation } from "react-i18next";
import Link from "next/link";
import { PiShareFatLight } from "react-icons/pi";

export default function StoreCard({
    storeDetails,
    setIsDisplayShareOptionsBox,
}) {
    
    const { t } = useTranslation();

    return (
        <div className="store-card card-box">
            <div
                className="store-managment-box managment-box"
            >
                <img src={`${process.env.BASE_API_URL}/${storeDetails.imagePath}`} alt={`${storeDetails.name} Store Image`} />
                <Link className="store-overlay card-overlay" href={`/?storeId=${storeDetails._id}`}></Link>
                <div className="store-managment-buttons managment-buttons p-2">
                    <PiShareFatLight
                        className="store-managment-icon managment-icon d-block"
                        onClick={() => setIsDisplayShareOptionsBox(true)}
                    />
                </div>
            </div>
            <div className="store-details details-box p-3 text-center">
                <h6 className="store-name fw-bold mb-4">{t("Store Name")}: {storeDetails.name}</h6>
                <h6 className="store-name fw-bold mb-4">{t("Products Type")}: {storeDetails.productsType}</h6>
                <h6 className="store-name fw-bold">{t("Products Description")}: {storeDetails.productsDescription}</h6>
            </div>
        </div>
    );
}