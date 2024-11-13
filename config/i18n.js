import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import arTranslation from "./ar.translation.json";
import trTranslation from "./tr.translation.json";
import deTranslation from "./de.translation.json";

i18next.use(initReactI18next).init({
    resources: {
        ar: { translation: arTranslation },
        tr: { translation: trTranslation },
        de: { translation: deTranslation },
    },
    lng: "en",
    fallbackLng: "en",
});

export default i18next;