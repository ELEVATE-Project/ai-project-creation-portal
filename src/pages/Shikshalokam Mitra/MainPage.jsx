import React, { useEffect, useRef, useState } from "react";
import FirstPage from "./mitra pages/FirstPage";
import SecondPage from "./mitra pages/SecondPage";
import ThirdPage from "./mitra pages/ThirdPage";
import FourthPage from "./mitra pages/FourthPage";
import FifthPage from "./mitra pages/FifthPage";
import { handleAI4BharatTTSRequest, ai4BharatASR } from "../../api services/ai4bharat_services";
import {convertBlobToBase64, convertToWav } from "../../utils/audio_utils"
import { getEncodedLocalStorage, setEncodedLocalStorage } from "../../utils/storage_utils";
import { getParaphraseText } from "../../api services/chat_flow_api";


function MainPage() {
    const [audioCache, setAudioCache] = useState({});
    const [isBotTalking, setIsBotTalking] = useState(false);
    const [isProcessingAudio, setIsProcessingAudio] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(getEncodedLocalStorage("isReadOnly") || false);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [hasStartedRecording, setHasStartedRecording] = useState(false);
    const [userInput, setUserInput] = useState(getEncodedLocalStorage("user_text") || []);
    const [isUsingMicrophone, setIsUsingMicrophone] = useState(false);
    const [currentChatValue, setCurrentChatValue] = useState(getEncodedLocalStorage("currentChatValue") || 0);
    const [chatHistory, setChatHistory] = useState(getEncodedLocalStorage("chatHistory") || []);
    const [isLoading, setIsLoading] = useState(false);
    const [userDetail, setUserDetail] = useState({
        name: localStorage.getItem("name"),
        image: localStorage.getItem("image"),
        email: localStorage.getItem("email"),
      })
    const [errorText, setErrorText] = useState(getEncodedLocalStorage("errorText") || "");
    const [showTyping, setShowTyping] = useState(false);

    const [currentPage, setCurrentPage] = useState(getEncodedLocalStorage("currentPage") || {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
    })

    const audioRef = useRef();

    useEffect(()=>{
        setUserDetail({
            name: localStorage.getItem("name"),
            image: localStorage.getItem("image"),
            email: localStorage.getItem("email"),
        })
    }, [])

    useEffect(()=>{
        
        setEncodedLocalStorage("chatHistory", chatHistory);
    }, [chatHistory])

    useEffect(()=>{
        
        setEncodedLocalStorage("isReadOnly", isReadOnly);
    }, [isReadOnly])

    useEffect(()=>{
        
        setEncodedLocalStorage("user_text", userInput);
    }, [userInput])

    useEffect(()=>{
        
        setEncodedLocalStorage("currentChatValue", currentChatValue);
    }, [currentChatValue])

    useEffect(()=>{
        
        setEncodedLocalStorage("currentPage", currentPage);
    }, [currentPage])


    function handleSpeakerOn(messageToUse, audioId) {
        if (!messageToUse || !audioId) return;
        setIsBotTalking(true);
        const preferredLanguage = JSON.parse(localStorage.getItem('preferred_language') || '{}');
        const language = preferredLanguage.value || 'en';

        handleAI4BharatTTSRequest(messageToUse, audioId, language, audioCache, setAudioCache, audioRef, setIsBotTalking)
    }

    function handleGoBack(key) {
        
        if (key <= 1) return;
        setIsReadOnly(true);
        setCurrentPage((prevValue) => ({
            ...prevValue,
            [key]: false,
            [key - 1]: true,
        }));
    }

    function handleGoForward(key) {
        
        if (key >=5) return;
        setIsReadOnly(true);
        setCurrentPage((prevValue) => ({
            ...prevValue,
            [key]: false,
            [key + 1]: true,
        }));
    }

    function setCurrentPageValue(key){
        if (key >= 5) return
        setCurrentPage((prevValue) => ({
            ...prevValue,
            [key]: false,
            [key+1]: true,
        }));
    }

    function handleSpeakerOff(audioId) {
        if (!audioId) return;
        setIsBotTalking(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            
        }
    }

    useEffect(()=>{
        
        
    }, [isLoading, currentChatValue])

    const startRecording = () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
              const recorder = new MediaRecorder(stream);
              setMediaRecorder(recorder);
      
              // Clear previous audio chunks before starting new recording
              const localAudioChunks = [];
      
              recorder.start();
              setHasStartedRecording(true);
              
      
              recorder.ondataavailable = (event) => {
                // Collect audio data chunks in the local array
                localAudioChunks.push(event.data);
                
              };
      
              recorder.onstop = async () => {
                
                if (localAudioChunks.length > 0) {
                    // Combine all audio chunks into a single Blob
                    const audioBlob = new Blob(localAudioChunks, { type: 'audio/webm;codecs=opus' });
                    
        
                    // Check if the audio blob contains any significant sound
                    const wavBlob = await convertToWav(audioBlob);
                    if (!wavBlob) {
                        
                        setIsFetchingData(false);
                        setIsUsingMicrophone(false);
                        setIsProcessingAudio(false);
                        return; // Skip if no meaningful audio
                    }
                    setIsFetchingData(true);
                    // Convert to Base64 and send to the ASR API
                    const preferredLanguage = JSON.parse(localStorage.getItem('preferred_language') || '{}');
                    const language = preferredLanguage.value || 'en';

                    const base64Audio = await convertBlobToBase64(wavBlob);
                    const transcriptResult = await ai4BharatASR(base64Audio, language);
                    // Update transcript if valid audio
                    setShowTyping(true);
                    let validatedText;
                    if(isReadOnly) {
                        setShowTyping(true);            
                        validatedText = await getParaphraseText(transcriptResult, language);
                        if(validatedText && validatedText.toLowerCase() === 'no') {
                            setEncodedLocalStorage('user_problem_statement', validatedText);
                            setEncodedLocalStorage('errorText', validatedText);
                            setErrorText(validatedText)
                        } else {
                            setEncodedLocalStorage('user_problem_statement', transcriptResult);
                        }
                    } else {
                        setUserInput((prevInput)=> [...prevInput, transcriptResult]);
                        if(currentChatValue >= 2) {
                            setShowTyping(true);            
                            validatedText = await getParaphraseText(transcriptResult, language);
                            if(validatedText && validatedText.toLowerCase() === 'no') {
                                setEncodedLocalStorage('errorText', validatedText);
                                setErrorText(validatedText)
                            }
                        }
                    }
                    if(isReadOnly) {
                        if (Number.isInteger(currentChatValue) && validatedText.toLowerCase() !=='no') {
                            setCurrentChatValue((prevValue) => {
                                return prevValue + 1;
                            });
                        }
                    }else if (Number.isInteger(currentChatValue)) {
                        setCurrentChatValue((prevValue) => {
                            return prevValue + 1;
                        });
                    }

                    if(isReadOnly && validatedText !== 'no') {
                        setEncodedLocalStorage('user_problem_statement', transcriptResult);
                        setEncodedLocalStorage('currentPage', {
                            1: false,
                            2: false,
                            3: false,
                            4: false,
                            5: false,
                        })
                        setCurrentPage({
                            1: false,
                            2: false,
                            3: false,
                            4: false,
                            5: false,
                        })
                    }
                    setShowTyping(false);
                    setIsFetchingData(false);
                    setIsUsingMicrophone(false);
                    setIsProcessingAudio(false);
                } else {
                    console.warn("No audio chunks were recorded.");
                    setIsFetchingData(false);
                }
              };
            })
            .catch((err) => {
              console.error('Error accessing microphone:', err);
              setIsFetchingData(false);
              setIsUsingMicrophone(false);
              setIsProcessingAudio(false);
            });
        } else {
          console.warn("getUserMedia not supported on your browser!");
          setIsFetchingData(false);
          setIsUsingMicrophone(false);
          setIsProcessingAudio(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setHasStartedRecording(false);
            setIsUsingMicrophone(false);
            setIsProcessingAudio(true);
            
        }
    };

    function getCurrentPageView(){
        // if (currentChatValue < 4) {
        //     setIsReadOnly(false)
        //     // setCurrentPageValue(1)
        // } else if (currentChatValue>=4 && currentChatValue<5) {
        //     setIsReadOnly(false)
        //     // setCurrentPageValue(2)
        // } else if (currentChatValue>=5 && currentChatValue<6) {
        //     setIsReadOnly(false)
        //     // setCurrentPageValue(3)
        // } else if (currentChatValue>=6 && currentChatValue<7) {
        //     setIsReadOnly(false)
        //     // setCurrentPageValue(4)
        // } else if (currentChatValue===7) {
        //     setIsReadOnly(false)
        //     // setCurrentPageValue(5)
        // }
        if (currentChatValue<4 || currentPage['1']) {
            return (
                <FirstPage 
                    isBotTalking={isBotTalking}
                    handleSpeakerOn={handleSpeakerOn}
                    handleSpeakerOff={handleSpeakerOff}
                    userInput={userInput}
                    setUserInput={setUserInput}
                    currentChatValue={currentChatValue}
                    setCurrentChatValue={setCurrentChatValue}
                    isUsingMicrophone={isUsingMicrophone}
                    setIsUsingMicrophone={setIsUsingMicrophone}        
                    startRecording={startRecording}
                    stopRecording={stopRecording}  
                    setHasStartedRecording={setHasStartedRecording}
                    userDetail={userDetail}           
                    setChatHistory={setChatHistory}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    isReadOnly={isReadOnly}
                    handleGoForward={handleGoForward}
                    setCurrentPageValue={setCurrentPageValue}
                    isProcessingAudio={isProcessingAudio}
                    setIsProcessingAudio={setIsProcessingAudio}
                    setIsReadOnly={setIsReadOnly}
                    setCurrentPage={setCurrentPage}
                    errorMessage={errorText}
                    setErrorMessage={setErrorText}
                    showTyping={showTyping}
                    setShowTyping={setShowTyping}
                />
            )
        } else if (currentChatValue>=4 && currentChatValue<5 || currentPage['2']) {
            return (
                <SecondPage 
                    isBotTalking={isBotTalking}
                    handleSpeakerOn={handleSpeakerOn}
                    handleSpeakerOff={handleSpeakerOff}
                    currentChatValue={currentChatValue}
                    setCurrentChatValue={setCurrentChatValue}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    handleGoBack={handleGoBack}
                    handleGoForward={handleGoForward}
                    setCurrentPageValue={setCurrentPageValue}
                    setChatHistory={setChatHistory}
                    errorText={errorText}
                    setErrorText={setErrorText}
                    isReadOnly={isReadOnly}
                />
            )
        } else if (currentChatValue>=5 && currentChatValue<6 || currentPage['3']) {
            return (
                <ThirdPage 
                    isBotTalking={isBotTalking}
                    handleSpeakerOn={handleSpeakerOn}
                    handleSpeakerOff={handleSpeakerOff}
                    currentChatValue={currentChatValue}
                    setCurrentChatValue={setCurrentChatValue}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    handleGoBack={handleGoBack}
                    handleGoForward={handleGoForward}
                    setCurrentPageValue={setCurrentPageValue}
                    setChatHistory={setChatHistory}
                    errorText={errorText}
                    setErrorText={setErrorText}
                />
            )
        } else if (currentChatValue>=6 && currentChatValue<7 || currentPage['4']) {
            return (
                <FourthPage 
                    isBotTalking={isBotTalking}
                    handleSpeakerOn={handleSpeakerOn}
                    handleSpeakerOff={handleSpeakerOff}
                    currentChatValue={currentChatValue}
                    setCurrentChatValue={setCurrentChatValue}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setCurrentPageValue={setCurrentPageValue}
                    handleGoBack={handleGoBack}
                    handleGoForward={handleGoForward}
                    setChatHistory={setChatHistory}
                    chatHistory={chatHistory}
                />
            )
        } else if (currentChatValue===7 || currentPage['5']) {
            return (
                <FifthPage
                    isBotTalking={isBotTalking}
                    handleSpeakerOn={handleSpeakerOn}
                    handleSpeakerOff={handleSpeakerOff}
                    currentChatValue={currentChatValue}
                    setCurrentChatValue={setCurrentChatValue}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    handleGoBack={handleGoBack}
                />
            )
        }
    }

    return (
        <>
            {userDetail?.name && getCurrentPageView()}
        </>
    );
}

export default MainPage;


export function ShowLoader({showFirstLoader=true}) {
    
    return (
        <>
                <div className="login-load-spinner">
                <div className="login-div67">
                    {(showFirstLoader)?
                        <img 
                            className="first-loader" 
                            src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/loading%20animation.gif" 
                        />
                        : 
                        <img 
                            className="first-loader" 
                            src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/second_loader.gif" 
                        />
                    }
                </div>
                </div> 
        </>
    );
}

export function getNewLocalTime(){
    const now = new Date();

    const formattedDate = now.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: false,  
    });

    const [date, time] = formattedDate.split(", ");
    const [day, month, year] = date.split("/");
    const formattedDateTime = `${year}-${month}-${day} ${time}`;

    return formattedDateTime;

}

export function clearMitraLocalStorage() {
    localStorage.removeItem("actionList");
    localStorage.removeItem("chatHistory");
    localStorage.removeItem("currentChatValue");
    localStorage.removeItem("currentPage");
    localStorage.removeItem("isReadOnly");
    localStorage.removeItem("objective");
    localStorage.removeItem("project_title");
    localStorage.removeItem("selected_week");
    localStorage.removeItem("session");
    localStorage.removeItem("user_problem_statement");
    localStorage.removeItem("user_text");
    localStorage.removeItem("selected_action");
    localStorage.removeItem("savedMessages");
    localStorage.removeItem("selected_objective");
    localStorage.removeItem("savedMessages");
    localStorage.removeItem("profile_id");
    localStorage.removeItem("chunks");
    localStorage.removeItem("errorText");
}                
