import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import HttpApi from "i18next-http-backend"
import { LANGUAGE_ENUMS } from "./constants/enum";
import {
    getEncodedSessionStorage,
    getEncodedLocalStorage,
} from "./utils/storage_utils";

// const preferredLanguage = JSON.parse(localStorage.getItem('preferred_language'))?.value;

const chatLanguageLocal = JSON.parse(getEncodedSessionStorage("preferred_language")) || {}
const languageToUse = chatLanguageLocal.value || LANGUAGE_ENUMS.ENGLISH

i18n
    .use(HttpApi)
    .use(initReactI18next)
    .init({
        lng: languageToUse,
        debug: true,
        interpolation: {
            escapeValue: false,
        },
        backend: {
            loadPath: `${process.env.REACT_APP_ROOT_PATH ? `/${process.env.REACT_APP_ROOT_PATH.replace(/^\/|\/$/g, "")}` : ''}/locales/{{lng}}/{{ns}}.json`,
        },
        fallbackLng: LANGUAGE_ENUMS.ENGLISH,
    })

export const setLanguage = languageProp => {
    const route = JSON.parse(getEncodedSessionStorage("route")) || JSON.parse(getEncodedLocalStorage("route"))
    const languageToUse = languageProp || route || "en"
    console.log("Language set to: ", languageToUse)
    i18n.changeLanguage(languageToUse)
}

export default i18n
