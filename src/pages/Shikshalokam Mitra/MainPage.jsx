import React, { useEffect, useRef, useState } from "react";
import SecondPage from "./mitra pages/SecondPage";
import ThirdPage from "./mitra pages/ThirdPage";
import FourthPage from "./mitra pages/FourthPage";
import FifthPage from "./mitra pages/FifthPage";
import { handleAI4BharatTTSRequest } from "../../api services/ai4bharat_services";
import { getEncodedLocalStorage, setEncodedLocalStorage } from "../../utils/storage_utils";
import FirstPageVoiceBasedChat from "./mitra pages/FirstPageChat";


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
        console.log(currentPage)
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
                <FirstPageVoiceBasedChat 
                    setIsLoading={setIsLoading}
                    setCurrentPageValue={setCurrentPageValue}
                    setCurrentChatValue={setCurrentChatValue}
                    isReadOnly={isReadOnly}
                    userDetail={userDetail}
                    handleGoForward={handleGoForward}
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


export function ShowLoader({showFirstLoader=true, loadingText=""}) {
    
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
                    {(loadingText && loadingText!=='')&& 
                        <p className="loading-icon-text">{loadingText}</p>
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
    localStorage.removeItem("currentChatValue");
    localStorage.removeItem("currentPage");
    localStorage.removeItem("isReadOnly");
    localStorage.removeItem("objective");
    localStorage.removeItem("project_title");
    localStorage.removeItem("selected_week");
    localStorage.removeItem("session");
    localStorage.removeItem("user_problem_statement");
    localStorage.removeItem("paraphrased_problem");
    localStorage.removeItem("user_text");
    localStorage.removeItem("selected_action");
    localStorage.removeItem("savedMessages");
    localStorage.removeItem("selected_objective");
    localStorage.removeItem("savedMessages");
    localStorage.removeItem("profile_id");
    localStorage.removeItem("chunks");
    localStorage.removeItem("errorText");
    localStorage.removeItem('hasClickedObjAddMore');
    localStorage.removeItem('botName');
    localStorage.removeItem('chat-history');
    localStorage.removeItem('company');
    localStorage.removeItem('first_name');
    localStorage.removeItem('intro_message');
    localStorage.removeItem('isChatVisible');
    localStorage.removeItem('isNewChatOpen');
    localStorage.removeItem('profileid');
    localStorage.removeItem('route');
    localStorage.removeItem('state');
    localStorage.removeItem('intro_end_context');
    localStorage.removeItem('end_context');
    localStorage.removeItem('system_error');
}                
