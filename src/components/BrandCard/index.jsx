export default function BrandCard({
    brandDetails,
}) {

    return (
        <div className="brand-card card-box">
            <div
                className="brand-managment-box managment-box"
            >
                <img src={`${process.env.BASE_API_URL}/${brandDetails.imagePath}`} alt={`${brandDetails.title["en"]} Brand Image`} />
                <div className="brand-overlay card-overlay"></div>
            </div>
            <div className="brand-details details-box p-3 text-center d-flex justify-content-center align-items-center">
                <h6 className="brand-name fw-bold">{brandDetails.title["en"]}</h6>
            </div>
        </div>
    );
}