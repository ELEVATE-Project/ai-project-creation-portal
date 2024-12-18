import React, { useEffect, useState } from "react";
import { BotMessage } from "../chatMessage";

import "../stylesheet/chatStyle.css";
import Header from "../header/Header";
import { clearMitraLocalStorage, ShowLoader } from "../MainPage";
import { getEncodedLocalStorage, setEncodedLocalStorage } from "../../../utils/storage_utils";
import { createProject, getTitle, saveUserChatsInDB, updateChatSession } from "../../../api services/chat_flow_api";
import { getFifthhPageMessages } from "../question script/bot_user_questions";
import { useNavigate } from "react-router-dom";


function FifthPage({
    isBotTalking, handleSpeakerOn, handleSpeakerOff, currentChatValue, setCurrentChatValue, setIsLoading, isLoading, 
    handleGoBack
}) {

    const [inputText, setInputText] = useState(()=>{
        let title = getEncodedLocalStorage('project_title') || '';
        return title
    });

    const navigate = useNavigate()

    const fifthpage_messages = getFifthhPageMessages();
    
    useEffect(()=>{
        async function fetchTitle() {
            let title = getEncodedLocalStorage('project_title');
            if (!title) {
                const user_problem_statement = getEncodedLocalStorage('user_problem_statement');
                const user_objective = getEncodedLocalStorage('selected_objective');
                const user_action_list = getEncodedLocalStorage('selected_action');
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

    useEffect(() => {
        const textarea = document.getElementById('autoGrow');
    
        const adjustHeight = () => {
            if (textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`; 
            }
        };
    
        adjustHeight();
    
        textarea?.addEventListener('input', adjustHeight);
    
        return () => textarea?.removeEventListener('input', adjustHeight);
    }, [inputText]);
    

    async function handleCreateImprovement() {
        if (currentChatValue === 7 && inputText && inputText!==""){
            setIsLoading(true);
            setEncodedLocalStorage("project_title", inputText);
            const session = getEncodedLocalStorage("session");
            const profile_id = getEncodedLocalStorage("profile_id");
            const field_to_update = {
                "title": inputText,
                "session_status": "COMPLETED"
            }

            const botMessage = {
                message: fifthpage_messages[9]?.[0]?.message + " " + fifthpage_messages[9]?.[1]?.message,
                role: fifthpage_messages[9]?.[0]?.role,
            };
            saveUserChatsInDB(botMessage?.message, session, botMessage?.role)
            .then(() => {
                saveUserChatsInDB(inputText, session, 'user'); 
            })

            const response = await updateChatSession(session, field_to_update)
            if(response) {
                const user_problem_statement = getEncodedLocalStorage('user_problem_statement');
                const project_duration = getEncodedLocalStorage('selected_week');
                const user_objective = getEncodedLocalStorage('selected_objective');
                const user_action_list = getEncodedLocalStorage('selected_action')[0]?.actionSteps;
                const access_token = JSON.parse(localStorage.getItem(process.env.REACT_APP_ACCESS_TOKEN_KEY));
                console.log("env key name:", process.env.REACT_APP_ACCESS_TOKEN_KEY)
                const project_response = await createProject(
                    access_token, user_problem_statement, user_action_list, project_duration, 
                    inputText, profile_id, session, user_objective
                )

                if(project_response) {
                    clearMitraLocalStorage();
                    setIsLoading(false);
                    navigate(process.env.REACT_APP_ROUTE_EXIT);
                }
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
                    secondMessageClass={"secondpage-para2"}
                    botMessage={
                        fifthpage_messages[9]?.[0]?.message
                    }
                    botSecondMessage={
                        fifthpage_messages[9]?.[1]?.message
                    }
                    showFirst={true}
                    showSecond={true}
                    handleSpeakerOn={handleSpeakerOn}
                    isBotTalking={isBotTalking}
                    handleSpeakerOff={handleSpeakerOff}
                    audioId={5.1} 
                />
                    <div className="secondpage-textbox-container">
                        <textarea
                            id="autoGrow"
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
