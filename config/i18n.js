import i18next from "i18next";

import { initReactI18next } from "react-i18next";

i18next.use(initReactI18next).init({
    debug: true,
    resources: {
        en: {
            translation: {
                "welcome" : "welcome11"
            },
        },
        ar: {
            translation: {
                "welcome": "مرحباً"
            },
        },
    },
    lng: "en",
    fallbackLng: 'en',
});

export default i18next;