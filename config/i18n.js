import i18next from "i18next";

import { initReactI18next } from "react-i18next";

i18next.use(initReactI18next).init({
    resources: {
        en: {
            translation: {
                "login" : "login",
                "sign-up": "sign-up",
            },
        },
        ar: {
            translation: {
                "login": "تسجيل الدخول",
                "sign-up": "إنشاء حساب",
            },
        },
    },
    lng: "en",
    fallbackLng: 'en',
});

export default i18next;