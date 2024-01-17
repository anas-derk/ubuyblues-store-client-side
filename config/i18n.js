import i18next from "i18next";

import { initReactI18next } from "react-i18next";

i18next.use(initReactI18next).init({
    resources: {
        en: {
            translation: {
                "login" : "login"
            },
        },
        ar: {
            translation: {
                "login": "تسجيل الدخول"
            },
        },
    },
    lng: "en",
    fallbackLng: 'en',
});

export default i18next;