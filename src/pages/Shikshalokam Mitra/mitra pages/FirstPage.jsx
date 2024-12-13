import React, { useState, useEffect, useRef } from "react";
import { RxKeyboard } from "react-icons/rx";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa6";
import { BotMessage, UserMessage } from "../chatMessage";
import Header from "../header/Header";
import "../stylesheet/chatStyle.css";
import { getFirstPageMessages } from "../question script/bot_user_questions";
import { getNewLocalTime, ShowLoader } from "../MainPage";
import { createChatSession, getNewSessionID, getObjectiveList, getParaphraseText } from "../../../api services/chat_flow_api";
import { getEncodedLocalStorage, setEncodedLocalStorage } from "../../../utils/storage_utils";


function FirstPage( { 
    isBotTalking, handleSpeakerOn, handleSpeakerOff, 
    userInput, setUserInput, currentChatValue, setCurrentChatValue, isUsingMicrophone, setIsUsingMicrophone, 
    startRecording, stopRecording, setHasStartedRecording, userDetail, setChatHistory, isLoading, setIsLoading,
    isReadOnly, handleGoForward, setCurrentPageValue
}) {

    const [useTextbox, setUseTextbox] = useState(false);
    const [userProblemStatement, setUserProblemStatement] = useState(getEncodedLocalStorage('user_problem_statement') || '');
    const [showTyping, setShowTyping] = useState(false);

    const textInputRef = useRef(null);
    const scrollRef = useRef(null);
    const firstpage_messages = getFirstPageMessages(userDetail, userInput, userProblemStatement);


    let isnt_english = false;

    useEffect(()=>{
        const language = JSON.parse(localStorage.getItem('languages'));
        isnt_english = !(language === 'en');
    }, [])

    useEffect(()=>{
        async function getUpdateSession() {
            if(!getEncodedLocalStorage('session')) {
                const session = await getNewSessionID();
                if(session){
                    setEncodedLocalStorage('session', session);
                    const response = await createChatSession(session);
                }
            }
        }
        getUpdateSession()
    }, [])


    useEffect(()=>{
        async function fetchParaphrasedText() {
            if (userInput && userInput[0] && currentChatValue === 1 && userProblemStatement === '') {
                setShowTyping(true);
                const paraphrased_text = await getParaphraseText(userInput[0]);
                if (paraphrased_text) {
                    setEncodedLocalStorage('user_problem_statement', paraphrased_text);
                    setUserProblemStatement(paraphrased_text);
                } else {
                    window.location.reload();
                }
                setShowTyping(false);
            } else if (currentChatValue === 3 && userInput && userInput[2] && /no/i.test(userInput[1])) {
                setUserProblemStatement(userInput[2]);
                setEncodedLocalStorage('user_problem_statement', userInput[2]);
            }
        }
        fetchParaphrasedText();
    }, [userInput, currentChatValue])


    useEffect(() => {
        if (useTextbox && textInputRef.current) {
            textInputRef.current.focus();  
        }
    }, [useTextbox]);

    function handleSendText(e) {
        setUserInput((prevInput)=>{
            const keyboardTypedValue = e.target.value;
            return [...prevInput, keyboardTypedValue]
        });

        if (Number.isInteger(currentChatValue)) {
            setCurrentChatValue((prevValue) => {
                return prevValue + 1;
            });
        }
        setTimeout(() => {
            e.target.value = "";
        }, 1);

    }

    
    useEffect(()=>{
        console.log("userProblemStatement", userProblemStatement)
    }, [userProblemStatement])


    useEffect(() => {
        console.log("CurrentChatValue: ", currentChatValue)
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }

        if (currentChatValue === 3 && !isReadOnly){
            if (userInput && userInput[1] && /yes/i.test(userInput[1])) {
                setEncodedLocalStorage('user_problem_statement', userInput[0]);
            }
            setIsLoading(true);
            setCurrentChatValue(4);
            setCurrentPageValue(1)
        }
        console.log("userInput[2]: ", userInput[2])
        if (firstpage_messages[currentChatValue] && currentChatValue < 4 && userProblemStatement) {
            const processedMessages = firstpage_messages[currentChatValue].reduce((acc, curr) => {
                const isDuplicate = 
                    acc.some(message => message.uniqueId === curr.messageId) ||
                    acc.some(message => message.originalMessageIds?.includes(curr.messageId));
        
                if (isDuplicate) {
                    return acc;
                }
                
                let createdAt = getNewLocalTime()

                while (acc.some(message => message.created_at === createdAt)) {
                    // Add 1ms to create a unique timestamp
                    createdAt = new Date(new Date(createdAt).getTime() + 1);
                }

                if (curr.role === "bot" && acc.length > 0 && acc[acc.length - 1].role === "bot") {
                    const lastMessage = acc[acc.length - 1];
                    lastMessage.message += ` ${curr.message}`;
                    lastMessage.originalMessageIds.push(curr.messageId);
                    lastMessage.uniqueId = lastMessage.originalMessageIds.join('_');
                } else {
                    acc.push({
                        ...curr,
                        uniqueId: curr.messageId,
                        originalMessageIds: [curr.messageId], 
                        created_at: createdAt
                    });
                }
        
                return acc;
            }, []);
        
            setChatHistory(prevValue => {
                const existingUniqueIds = new Set(prevValue.map(message => message.uniqueId));
        
                // Filter out already saved messages
                const filteredProcessedMessages = processedMessages.filter(
                    message => !existingUniqueIds.has(message.uniqueId)
                );
        
                return [...prevValue, ...filteredProcessedMessages];
            });
        }
        
             

    }, [currentChatValue, userProblemStatement]);

    function showMicAndKeyboard() {
        return(
            <>
                {(!isUsingMicrophone && !useTextbox) &&
                    <>
                        <div className="thirdpara-div">
                            <button 
                                className="microphone-button-gif-div"
                                onClick={()=>{
                                    setUseTextbox(false);
                                    setIsUsingMicrophone(true);
                                    setHasStartedRecording(true);
                                    startRecording()
                                }}
                            >
                                <img src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/mic.gif" className="mic-gif" />
                                {/* <RiMic2Fill className="microphone-button-icon" /> */}
                            </button>
                        </div>
                        <div className="fourthpara-div">
                            <button className="use-text-button"
                                onClick={()=>{
                                    setUseTextbox(true);
                                    setIsUsingMicrophone(false);
                                }}
                            >
                                <RxKeyboard />
                                Use text
                            </button>
                        </div>
                    </>
                }
                {(isUsingMicrophone) && (
                    <div 
                        className="audio-visualizer"
                        onClick={stopRecording}
                    >
                        <img src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/voice_loader.gif" className="voice-loader-bot" />
                        <div className="">
                            <button className="use-text-button"
                                onClick={stopRecording}
                            >
                                <FaMicrophoneSlash />
                                Stop
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }

    function showTextBox() {
        
        return (
            <>
                {(useTextbox && !isUsingMicrophone)&&
                    <div className="textbox-container">
                        <div className="fourthpara-div-1">
                            <button className="use-text-button"
                                onClick={()=>{
                                    setUseTextbox(false);
                                    setIsUsingMicrophone(false);
                                }}
                            >
                                <FaMicrophone />
                                Use voice
                            </button>
                        </div>
                        <input
                            ref={textInputRef}
                            type="text"
                            placeholder="Type your response here..."
                            className="firstpage-text-input"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSendText(e)
                                }
                            }}
                        />
                    </div>
                }
            </>
        );
    }
    
    return (
        <>
            {isLoading&& <ShowLoader />}

            <Header shouldEnableCross={true} shouldEnableGoForward = {isReadOnly ? true : false} handleGoForward={()=>handleGoForward(1)} />
            <div className="firstpage-div" 
                ref={currentChatValue === 0 ? scrollRef : null}
            >
                <BotMessage 
                    botMessage={
                        firstpage_messages[0]?.[0]?.message
                    }
                    firstparaClass={"firstpara-div"}
                    firstpageClass={"firstpage-para1"}
                    secondParaClass={"secondpara-div"}
                    secondMessageClass={"firstpage-para2"}
                    useTextbox={useTextbox} 
                    isUsingMicrophone={isUsingMicrophone} 
                    currentChatValue={currentChatValue}
                    showFirst={true}
                    showSecond={true}
                    botSecondMessage={
                        firstpage_messages[0]?.[1]?.message
                    }
                    handleSpeakerOn={handleSpeakerOn}
                    isBotTalking={isBotTalking}
                    audioId={1.1}
                    handleSpeakerOff={handleSpeakerOff}
                />
                {(currentChatValue == 0) &&
                    <>
                        {showMicAndKeyboard()}
                        {showTextBox()}
                    </>
                    
                }
                {(currentChatValue > 0)&&
                    <UserMessage userMessage={
                        (userInput && userInput[0]) ? userInput[0]: ""}
                    />
                }
                {(showTyping)&&
                    <div className="firstpage-reply-text"
                        onLoad={() => document.querySelector('.firstpage-reply-text')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <p className="secondpage-para1">typing...</p>
                    </div>
                }
                {(currentChatValue>0 && userProblemStatement)&&
                    <div className="firstpage-bot-div" 
                        ref={currentChatValue === 1 ? scrollRef : null}
                    >
                        <BotMessage 
                            botMessage={
                                firstpage_messages[1]?.[1]?.message
                            }
                            botSecondMessage={
                                firstpage_messages[1]?.[2]?.message
                            }
                            secondMessageClass={"firstpage-para2"}
                            firstparaClass={"firstpara-div"}
                            firstpageClass={"firstpage-para1"}
                            secondParaClass={"secondpara-div"}
                            useTextbox={useTextbox}
                            isUsingMicrophone={isUsingMicrophone} 
                            currentChatValue={currentChatValue}
                            showFirst={true}
                            showSecond={true}
                            showThird={true}
                            setCurrentChatValue={setCurrentChatValue}
                            setIsUsingMicrophone={setIsUsingMicrophone}
                            setUseTextbox={setUseTextbox}
                            setUserInput={setUserInput}
                            handleSpeakerOn={handleSpeakerOn}
                            isBotTalking={isBotTalking}
                            audioId={1.2}
                            handleSpeakerOff={handleSpeakerOff}
                        />
                    </div>
                }
                {(currentChatValue>=2)&&
                    <>
                        <UserMessage userMessage={(userInput && userInput[1]) ? userInput[1]: ""} />
                        {((userInput && userInput[1].toLowerCase() === 'no'))&& 
                            <div className="firstpage-bot-div" 
                                ref={currentChatValue === 2 ? scrollRef : null}
                            >
                                <BotMessage 
                                    firstparaClass={"firstpara-div"}
                                    secondParaClass={"secondpara-div"}
                                    secondMessageClass={"firstpage-para2"}
                                    botSecondMessage={
                                        firstpage_messages[2]?.[1]?.message
                                    }
                                    useTextbox={useTextbox} 
                                    isUsingMicrophone={isUsingMicrophone} 
                                    currentChatValue={currentChatValue}
                                    showSecond={true}
                                    handleSpeakerOn={handleSpeakerOn}
                                    handleSpeakerOff={handleSpeakerOff}
                                    isBotTalking={isBotTalking}
                                    audioId={1.3}
                                />
                            </div>
                        }
                        {(currentChatValue===2)&& showMicAndKeyboard()}
                        {(currentChatValue===2)&& showTextBox()}
                    </>
                }
                {(currentChatValue>=3 && (userInput && userInput[2]))&& 
                    <div
                        ref={currentChatValue === 3 ? scrollRef : null}
                    >
                        <UserMessage userMessage={userInput[2]} />
                    </div>
                }
            </div>
        </>
    );
}

export default FirstPage;
