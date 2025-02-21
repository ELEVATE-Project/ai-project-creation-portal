import React, { useEffect, useState } from "react";
import { IoArrowForward } from "react-icons/io5";
import { BotMessage } from "../chatMessage";
import Slider from "../../../components/Slider/slider";
import Header from "../header/Header";
import { getNewLocalTime, ShowLoader } from "../MainPage";

import "../stylesheet/chatStyle.css";
import { getEncodedLocalStorage, setEncodedLocalStorage } from "../../../utils/storage_utils";
import { getFourthPageMessages } from "../question script/bot_user_questions";
import { saveUserChatsInDB } from "../../../api services/chat_flow_api";
import { getNextButtonTranslation } from "../question script/secondpage_tanslation";



function FourthPage({
    isBotTalking, handleSpeakerOn, handleSpeakerOff, currentChatValue, setCurrentChatValue, setIsLoading, isLoading, 
    handleGoBack, handleGoForward, setCurrentPageValue, setChatHistory
}) {

    const [selectedWeek, setSelectedWeek] = useState(getEncodedLocalStorage('selected_week') || 1);
    const [isInReadOnlyMode, setIsInReadOnlyMode] = useState(
        getEncodedLocalStorage('selected_week') ? true : false
    );

    const preferredLanguage = JSON.parse(localStorage.getItem('preferred_language') || '{}');
    const language = preferredLanguage.value || 'en';

    const fourthpage_messages = getFourthPageMessages(language);

    useEffect(()=>{
        if(isInReadOnlyMode) {
            setIsLoading(true);
            setCurrentChatValue(6);
            localStorage.removeItem('selected_week');
            localStorage.removeItem('project_title');
            setIsLoading(false);
        }
    }, [isInReadOnlyMode])

    const handleSliderChange = (value) => {
        
    };

    const handleContinueClick = async () => {
        
        if (currentChatValue === 6 && selectedWeek){
            setIsLoading(true);
            setEncodedLocalStorage("selected_week", selectedWeek);
            const botMessage = fourthpage_messages[8]?.[0]?.message + 
            " " + fourthpage_messages[8]?.[1]?.message;
            const currentSession = getEncodedLocalStorage('session');
            

            saveUserChatsInDB(botMessage, currentSession, 'bot')
            .then(() => {
                saveUserChatsInDB(JSON.stringify(selectedWeek), currentSession, 'user'); 
            })
            .then(() => {
                setCurrentChatValue(7);
                setCurrentPageValue(4);
            })
        }
    }

    return (
        <>
            {isLoading&& <ShowLoader />}

            <Header shouldEnableGoBack={true} shouldEnableCross={true} 
                handleGoBack={()=>handleGoBack(4)} shouldEnableGoForward={false}
            />
            <div className="fourthpage-div">
                <BotMessage 
                    firstparaClass={"firstpara-div"}
                    firstpageClass={"firstpage-para1"}
                    botMessage={
                        fourthpage_messages[8]?.[0]?.message + 
                        "<br/>" + 
                        fourthpage_messages[8]?.[1]?.message
                    }
                    showFirst={true}
                    handleSpeakerOn={handleSpeakerOn}
                    isBotTalking={isBotTalking}
                    handleSpeakerOff={handleSpeakerOff}
                    audioId={4.1}
                />
                <Slider min={1} max={6} onValueChange={handleSliderChange} value={selectedWeek} setValue={setSelectedWeek} />
                <div className="fourthpage-next-div">
                    <button className={`thirdpage-select-bttn`}
                        onClick={handleContinueClick}
                    >
                        {getNextButtonTranslation(language)}
                        
                        <IoArrowForward className="thirdpage-cont-arrow-icon" />
                    </button>
                </div>
            </div>
\        </>
    );
}

export default FourthPage;
