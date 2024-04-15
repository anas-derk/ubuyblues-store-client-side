import { useTranslation } from "react-i18next";
import Link from "next/link";
import { PiShareFatLight } from "react-icons/pi";

export default function StoreCard({
    store,
    setIsDisplayShareOptionsBox,
}) {

    const { t, i18n } = useTranslation();

    return (
        <div className="store-card">
            <div
                className="store-managment-box"
            >
                <img src={`${process.env.BASE_API_URL}/${store.imagePath}`} alt="Store Image" />
                <Link className="store-overlay" href={`/${store._id}`}></Link>
                <div className="store-managment-buttons p-2">
                    <PiShareFatLight
                        className="store-managment-icon d-block mb-2"
                        onClick={() => setIsDisplayShareOptionsBox(true)}
                    />
                </div>
            </div>
            <div className="store-details p-3 text-center">
                <h4 className="store-name fw-bold">{store.name}</h4>
            </div>
        </div>
    );
}