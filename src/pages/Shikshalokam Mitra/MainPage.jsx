import React, { useEffect, useRef, useState } from "react";
import FirstPage from "./mitra pages/FirstPage";
import SecondPage from "./mitra pages/SecondPage";
import ThirdPage from "./mitra pages/ThirdPage";
import FourthPage from "./mitra pages/FourthPage";
import FifthPage from "./mitra pages/FifthPage";
import { handleAI4BharatTTSRequest, ai4BharatASR } from "../../api services/ai4bharat_services";
import {convertBlobToBase64, convertToWav } from "../../utils/audio_utils"
import { getEncodedLocalStorage, setEncodedLocalStorage } from "../../utils/storage_utils";


function MainPage() {
    const [audioCache, setAudioCache] = useState({});
    const [isBotTalking, setIsBotTalking] = useState(false);
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
        name: "Rahul",
        image: "",
    })
    const [errorText, setErrorText] = useState('');

    const [currentPage, setCurrentPage] = useState(getEncodedLocalStorage("currentPage") || {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
    })

    const audioRef = useRef();

    useEffect(()=>{
        setUserDetail((values)=>({
            ...values,
            name: localStorage.getItem("name") || "Rahul",
            image: localStorage.getItem("image") || "",
        }))
    }, [])

    useEffect(()=>{
        console.log("ChatHistory: ", chatHistory)
        setEncodedLocalStorage("chatHistory", chatHistory);
    }, [chatHistory])

    useEffect(()=>{
        console.log("isReadOnly: ", isReadOnly)
        setEncodedLocalStorage("isReadOnly", isReadOnly);
    }, [isReadOnly])

    useEffect(()=>{
        console.log("UserInput: ", userInput)
        setEncodedLocalStorage("user_text", userInput);
    }, [userInput])

    useEffect(()=>{
        console.log("currentChatValue: ", currentChatValue)
        setEncodedLocalStorage("currentChatValue", currentChatValue);
    }, [currentChatValue])

    useEffect(()=>{
        console.log("currentPage: ", currentPage)
        setEncodedLocalStorage("currentPage", currentPage);
    }, [currentPage])

    function handleSpeakerOn(messageToUse, audioId) {
        if (!messageToUse || !audioId) return;
        setIsBotTalking(true);
        handleAI4BharatTTSRequest(messageToUse, audioId, 'en', audioCache, setAudioCache, audioRef, setIsBotTalking)
    }

    function handleGoBack(key) {
        console.log("Key: ", key)
        if (key <= 1) return;
        setIsReadOnly(true);
        setCurrentPage((prevValue) => ({
            ...prevValue,
            [key]: false,
            [key - 1]: true,
        }));
    }

    function handleGoForward(key) {
        console.log("Key: ", key)
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
            console.log("Audio stopped");
        }
    }

    useEffect(()=>{
        console.log("isLoading Mainpage: ", isLoading)
        console.log("currentChatValue Mainpage: ", currentChatValue)
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
              console.log("Recording started...");
      
              recorder.ondataavailable = (event) => {
                // Collect audio data chunks in the local array
                localAudioChunks.push(event.data);
                console.log("Audio chunk received:", event.data);
              };
      
              recorder.onstop = async () => {
                console.log("Recording stopped.");
                if (localAudioChunks.length > 0) {
                  // Combine all audio chunks into a single Blob
                  const audioBlob = new Blob(localAudioChunks, { type: 'audio/webm;codecs=opus' });
                  console.log("Audio blob created:", audioBlob);
      
                  // Check if the audio blob contains any significant sound
                  const wavBlob = await convertToWav(audioBlob);
                  if (!wavBlob) {
                    console.log("No significant audio detected. Skipping API call.");
                    return; // Skip if no meaningful audio
                  }
                  setIsFetchingData(true);
                  // Convert to Base64 and send to the ASR API
                  const base64Audio = await convertBlobToBase64(wavBlob);
                  const transcriptResult = await ai4BharatASR(base64Audio);
                  // Update transcript if valid audio
                  setUserInput((prevInput)=> [...prevInput, transcriptResult]);
                  setIsFetchingData(false);
                  setIsUsingMicrophone(false);
                  if (Number.isInteger(currentChatValue)) {
                        setCurrentChatValue((prevValue) => {
                            return prevValue + 1;
                        });
                    }
                } else {
                  console.warn("No audio chunks were recorded.");
                  setIsFetchingData(false);
                }
              };
            })
            .catch((err) => {
              console.error('Error accessing microphone:', err);
              setIsFetchingData(false);
            });
        } else {
          console.warn("getUserMedia not supported on your browser!");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setHasStartedRecording(false);
            console.log("Stopping recording...");
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
        getCurrentPageView()
    );
}

export default MainPage;


export function ShowLoader({isLoading}) {
    console.log("LOADER PAGFE: ", isLoading)
    return (
        <>
                <div className="login-load-spinner">
                <div className="login-div67">
                    <img className="first-loader" src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/loading%20animation.gif" />
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
}