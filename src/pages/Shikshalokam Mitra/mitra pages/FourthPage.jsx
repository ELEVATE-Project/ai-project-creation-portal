import React, { useState } from "react";
import { IoArrowForward } from "react-icons/io5";
import { BotMessage } from "../chatMessage";
import Slider from "../../../components/Slider/slider";
import Header from "../header/Header";
import { getNewLocalTime, ShowLoader } from "../MainPage";

import "../stylesheet/chatStyle.css";
import { getEncodedLocalStorage, setEncodedLocalStorage } from "../../../utils/storage_utils";
import { getFourthPageMessages } from "../question script/bot_user_questions";
import { saveUserChatsInDB } from "../../../api services/chat_flow_api";



function FourthPage({
    isBotTalking, handleSpeakerOn, handleSpeakerOff, currentChatValue, setCurrentChatValue, setIsLoading, isLoading, 
    handleGoBack, handleGoForward, setCurrentPageValue, setChatHistory, chatHistory
}) {

    const [selectedWeek, setSelectedWeek] = useState(getEncodedLocalStorage('selected_week') || 1);
    const [isInReadOnlyMode, setIsInReadOnlyMode] = useState(
        getEncodedLocalStorage('selected_week') ? true : false
    );

    const fourthpage_messages = getFourthPageMessages();

    const handleSliderChange = (value) => {
        console.log('Selected week:', value);
    };

    const handleContinueClick = async () => {
        if (isInReadOnlyMode) return;
        console.log('Project selected week:', selectedWeek);
        if (currentChatValue === 6 && selectedWeek){
            setIsLoading(true);
            setEncodedLocalStorage("selected_week", selectedWeek);
            setChatHistory(prevValue => {
                const createdAt = getNewLocalTime();
                const botMessage = fourthpage_messages[8]?.[0];
                const userMessage = {role: 'user', message: JSON.stringify(selectedWeek), created_at: createdAt};
            
                if (botMessage) {
                    botMessage.created_at = createdAt;
                    if (botMessage.created_at === userMessage.created_at) {
                        userMessage.created_at = new Date(new Date(botMessage.created_at).getTime() + 1);
                    }
                }
            
                const updatedChatHistory = [...prevValue, botMessage, userMessage];
            
                const session = getEncodedLocalStorage("session");
                if (session) {
                    saveUserChatsInDB(updatedChatHistory, session)
                        .then(response => {
                            if (response && response?.status) {
                                setCurrentChatValue(7);
                                setCurrentPageValue(4);
                            }
                        });
                }
            
                return updatedChatHistory;
            });
        }
    }

    return (
        <>
            {isLoading&& <ShowLoader />}

            <Header shouldEnableGoBack={true} shouldEnableCross={true} handleGoBack={()=>handleGoBack(4)}
                handleGoForward={()=>handleGoForward(4)} 
                shouldEnableGoForward = {isInReadOnlyMode}
            />
            <div className="fourthpage-div">
                <BotMessage 
                    firstparaClass={"firstpara-div"}
                    firstpageClass={"firstpage-para1"}
                    botMessage={
                        fourthpage_messages[8]?.[0]?.message
                    }
                    showFirst={true}
                    handleSpeakerOn={handleSpeakerOn}
                    isBotTalking={isBotTalking}
                    handleSpeakerOff={handleSpeakerOff}
                    audioId={4.1}
                />
                <Slider min={1} max={6} onValueChange={handleSliderChange} value={selectedWeek} setValue={setSelectedWeek} isDisabled={isInReadOnlyMode} />
                <div className="fourthpage-next-div">
                    <button className={`thirdpage-select-bttn ${isInReadOnlyMode&& "custom-disable-button"}`}
                        onClick={handleContinueClick}
                    >
                        Continue <IoArrowForward className="thirdpage-cont-arrow-icon" />
                    </button>
                </div>
            </div>
\        </>
    );
}

export default FourthPage;
