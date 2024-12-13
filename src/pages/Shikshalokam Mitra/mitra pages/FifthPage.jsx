import React, { useEffect, useState } from "react";
import { BotMessage } from "../chatMessage";

import "../stylesheet/chatStyle.css";
import Header from "../header/Header";
import { clearMitraLocalStorage, ShowLoader } from "../MainPage";
import { getEncodedLocalStorage, setEncodedLocalStorage } from "../../../utils/storage_utils";
import { getTitle, updateChatSession } from "../../../api services/chat_flow_api";


function FifthPage({
    isBotTalking, handleSpeakerOn, handleSpeakerOff, currentChatValue, setCurrentChatValue, setIsLoading, isLoading, 
    handleGoBack
}) {

    const [inputText, setInputText] = useState(()=>{
        let title = getEncodedLocalStorage('project_title') || '';
        return title
    });

    
    useEffect(()=>{
        async function fetchTitle() {
            let title = getEncodedLocalStorage('project_title');
            if (!title) {
                const user_problem_statement = getEncodedLocalStorage('user_problem_statement');
                const user_objective = getEncodedLocalStorage('objective');
                const user_action_list = getEncodedLocalStorage('actionList');
                title = await getTitle(user_problem_statement, user_objective, user_action_list);
                if (title) {
                    setInputText(title)
                    setEncodedLocalStorage('project_title', title);
                } else {
                    window.location.reload();
                }
            }
            setIsLoading(false);
        }
        fetchTitle();
    }, [])


    function handleInputText(e) {
        setInputText(e?.target?.value);
    }

    async function handleCreateImprovement() {
        if (currentChatValue === 7 && inputText && inputText!==""){
            setIsLoading(true);
            setEncodedLocalStorage("project_title", inputText);
            const session = getEncodedLocalStorage("session");
            const field_to_update = {
                "title": inputText,
                "session_status": "COMPLETED"
            }
            const response = await updateChatSession(session, field_to_update)
            if(response) {
                clearMitraLocalStorage()
                setIsLoading(false);
                window.location.reload();
            }
        }
    }

    return (
        <>
            {isLoading&& <ShowLoader />}

            <Header shouldEnableGoBack={true} shouldEnableCross={true} handleGoBack={()=>handleGoBack(5)}
            />
            <div className="fourthpage-div">
                <BotMessage 
                    firstparaClass={"firstpara-div"}
                    firstpageClass={"firstpage-para1 fifthpage-bot-msg"}
                    botMessage="This is the title of the MI I am thinking. What do you think?"
                    showFirst={true}
                    handleSpeakerOn={handleSpeakerOn}
                    isBotTalking={isBotTalking}
                    handleSpeakerOff={handleSpeakerOff}
                    audioId={5.1} 
                />
                    <div className="secondpage-textbox-container">
                        <input
                            type="text"
                            placeholder="[AI-generated Title for the story]"
                            className="secondpage-text-input"
                            value={inputText}
                            onChange={(e)=>handleInputText(e)}
                        />
                    </div>

                <div className="fourthpage-next-div">
                    <button className="fifthpage-select-bttn"
                        onClick={handleCreateImprovement}
                    >
                        Create Micro-Improvement Plan
                    </button>
                </div>
            </div>
        </>
    );
}

export default FifthPage;
