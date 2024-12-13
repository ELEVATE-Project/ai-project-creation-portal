
import axiosInstance from "../utils/axios";


export async function getAI4BharatAudio(text, sourceLanguage = 'en', gender = 'female') {
    try {
        const response = await axiosInstance.post('/api/ai4bharat/', {
            text: text,
            source_language: sourceLanguage,
            gender: gender,
        });
        
        return response.data.audio;
    } catch (error) {
        console.error('Error fetching AI4Bharat audio:', error);
        throw error;
    }
}

export const handleAI4BharatTTSRequest = async (text, id, sourceLanguage, audioCache, setAudioCache, audioRef, setIsBotTalking) => {
    console.log("USING: ", text)
    try {
        let cachedAudioUrl = audioCache[id];
        let audio_result = "";
        let audio;

        // Fetch the audio result using AI4Bharat TTS service if not cached
        if (!cachedAudioUrl) {
            audio_result = await getAI4BharatAudio(text, sourceLanguage);
            if (audio_result?.length) {
                cachedAudioUrl = `data:audio/wav;base64,${audio_result}`;
                setAudioCache((prevCache) => ({
                    ...prevCache,
                    [id]: cachedAudioUrl,
                }));
            }
        }

        if (cachedAudioUrl) {
            audioRef.current = new Audio(cachedAudioUrl);
            audio = audioRef.current;

            // Attach event listener to detect when audio finishes playing
            audio.onended = () => {
                console.log("Audio play complete");
                setIsBotTalking(false);
            };
        } else {
            audio_result = await getAI4BharatAudio(text, sourceLanguage);
            if (audio_result?.length) {
            cachedAudioUrl = `data:audio/wav;base64,${audio_result}`;
            setAudioCache((prevCache) => ({
                ...prevCache,
                [id]: cachedAudioUrl,
            }));
            }
            setIsBotTalking(false);
        }
        try {
            await audio.play();
        } catch (error) {
            console.error('Error playing audio:', error);
            setIsBotTalking(false);
        }
    } catch (error) {
        console.error('Error in handleAI4BharatTTSRequest:', error);
        setIsBotTalking(false);
    }
};

export async function ai4BharatASR(base64, isnt_english, gender = 'female'){
    console.log("CALLING Ai 4 bharat")
    let sourceLanguage = 'en';
    try {
      if (isnt_english) {
        sourceLanguage = 'hi';
      }
      const response = await axiosInstance.post('/api/ai4bharat/asr', {
        base_64: base64,
        source_language: sourceLanguage,
        gender: gender,
      });
      
      // Return the audio content
      return response.data.transcript;
    } catch (error) {
      console.error('Error fetching AI4Bharat audio:', error);
      throw error;
    } 
}

