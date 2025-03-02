import { useTranslation } from "react-i18next";

export default function BrandCard({
    brandDetails,
}) {

    const { i18n } = useTranslation();

    return (
        <div className="brand-card card-box">
            <div
                className="brand-managment-box managment-box"
            >
                <img src={`${process.env.BASE_API_URL}/${brandDetails.imagePath}`} alt={`${brandDetails.title} Brand Image`} />
                <div className="brand-overlay card-overlay"></div>
            </div>
            <div className="brand-details details-box p-3 text-center d-flex justify-content-center align-items-center">
                <h6 className="brand-name fw-bold">{brandDetails.title[i18n.language]}</h6>
            </div>
        </div>
    );
}