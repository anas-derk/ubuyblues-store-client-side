import { useTranslation } from "react-i18next";
import { HiOutlineBellAlert } from "react-icons/hi2";

export default function FormFieldErrorBox({ errorMsg }) {

    const { i18n } = useTranslation();

    return (
        <p className="bg-danger p-2 form-field-error-box mb-3 text-white">
            <span className={i18n.language !== "ar" ? "me-2" : "ms-2"}><HiOutlineBellAlert className="alert-icon" /></span>
            <span>{errorMsg}</span>
        </p>
    );
}