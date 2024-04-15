import { useTranslation } from "react-i18next";
import Link from "next/link";
import { PiShareFatLight } from "react-icons/pi";

export default function StoreCard({
    storeDetails,
    setIsDisplayShareOptionsBox,
}) {
    
    return (
        <div className="store-card card-box">
            <div
                className="store-managment-box managment-box"
            >
                <img src={`${process.env.BASE_API_URL}/${storeDetails.imagePath}`} alt={`${storeDetails.name} Store Image`} />
                <Link className="store-overlay overlay" href={`/${storeDetails._id}`}></Link>
                <div className="store-managment-buttons managment-buttons p-2">
                    <PiShareFatLight
                        className="store-managment-icon managment-icon d-block mb-2"
                        onClick={() => setIsDisplayShareOptionsBox(true)}
                    />
                </div>
            </div>
            <div className="store-details p-3 text-center">
                <h4 className="store-name fw-bold">{storeDetails.name}</h4>
            </div>
        </div>
    );
}