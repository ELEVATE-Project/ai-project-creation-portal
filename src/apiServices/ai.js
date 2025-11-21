import { apiClient } from "./base";

/**
 * AI4Bharat Automatic Speech Recognition (ASR)
 * @param {string} base64 - Base64 encoded audio or S3 URL
 * @param {string} [sourceLanguage="en"] - Source language code
 * @param {string} [storedRoute=bot_routes.normal] - Bot route configuration
 * @returns {Promise<string>} The transcript text
 */
export const ai4BharatASRApi = async (base64, sourceLanguage = "en", storedRoute = "/") => {
    try {
        const response = await apiClient.post("/api/asr/", {
            s3Url: base64,
            source_language: sourceLanguage,
            route: storedRoute,
        })

        return response.data.transcript
    } catch (error) {
        console.error("Error fetching AI4Bharat ASR:", error)
        return ""
    }
}
