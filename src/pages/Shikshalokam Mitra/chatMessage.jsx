import React, { useRef, useState, useEffect } from "react";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { RiMic2Fill } from "react-icons/ri";
import { RxSpeakerOff } from "react-icons/rx";
import { getComfirmButtonTranslation, getDenyButtonTranslation } from "./question script/firstpage_translation";

export function BotMessage({
    botMessage,
    botSecondMessage,
    firstparaClass,
    firstpageClass,
    secondParaClass,
    isUsingMicrophone,
    useTextbox,
    currentChatValue,
    showFirst=false,
    showSecond=false,
    showThird=false,
    setCurrentChatValue,
    setIsUsingMicrophone,
    setUseTextbox,
    setUserInput,
    secondMessageClass,
    handleSpeakerOn,
    isBotTalking,
    audioId,
    handleSpeakerOff,
}) {

    const [isSpeakerOn, setIsSpeakerOn] = useState(false);

    const preferredLanguage = JSON.parse(localStorage.getItem('preferred_language') || '{}');
    const language = preferredLanguage.value || 'en';

    useEffect(()=>{
        console.log("Is Bot Talking? Ans: ", isBotTalking)
        if (!isBotTalking) {
            setIsSpeakerOn(false)
        }
    }, [isBotTalking])

    useEffect(()=>{
        if (isSpeakerOn) {
            let messageToSend = "";
            if (botMessage){
                messageToSend+=botMessage+=" ";
            } if (botSecondMessage){
                messageToSend+=botSecondMessage+=" ";
            }
            handleSpeakerOn(messageToSend, audioId)
        }
    }, [isSpeakerOn])

    return (
        <>
            <div className={firstparaClass}>
                <div className="icon-column">
                    {/* <div className="bot-image"></div> */}
                    <img className="bot-image" src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/bot_profile_image.gif" />
                    <div className="boticon-button-div">
                        {isSpeakerOn ? (
                            <HiOutlineSpeakerWave
                            className="speaker-icon"
                            onClick={() => {
                                setIsSpeakerOn(false)
                                handleSpeakerOff(audioId)
                            }}
                            />
                        ) : (
                            <RxSpeakerOff
                            className="speaker-icon"
                            onClick={() => {
                                setIsSpeakerOn(true)
                            }}
                            />
                        )}
                    </div>
                </div>
                <div className="text-column">
                    {showFirst && <HtmlMessage content={botMessage} className={firstpageClass} />}
                    {showSecond && <HtmlMessage content={botSecondMessage} className={secondMessageClass} />}
                    {(showThird)&&
                        <div className="firstpage-third-div">
                            <button 
                                className="firstpage-confirm-button"
                                onClick={()=>{
                                    setCurrentChatValue((prevValue) => {
                                        return prevValue + 2;
                                    });
                                    setUserInput((prevInput)=> [...prevInput, `${getComfirmButtonTranslation(language)}!`]);

                                }}
                                disabled={currentChatValue>1}
                            >
                                {language&& getComfirmButtonTranslation(language)}
                            </button>
                            <button 
                                className="firstpage-deny-button"
                                onClick={()=>{
                                    setCurrentChatValue((prevValue) => {
                                        return prevValue + 1;
                                    });
                                    setIsUsingMicrophone(false)
                                    setUseTextbox(false)
                                    setUserInput((prevInput)=> [...prevInput, getDenyButtonTranslation(language)]);
                                }}
                                disabled={currentChatValue>1}
                            >
                                {language&& getDenyButtonTranslation(language)}

                            </button>
                        </div>
                    }
                </div>
            </div>
        </>

    );
}

export function UserMessage({
    userMessage
}) {
    return (
        <>
            <div className="firstuser-div">
                <div className="user-image"></div>
                <p className="firstuser-para1">
                    {userMessage}
                </p>
            </div>
        </>
    )
}

export function HtmlMessage({ content, className }) {
    return (
        <p
            className={className}
            dangerouslySetInnerHTML={{ __html: content }}
        ></p>
    );
}