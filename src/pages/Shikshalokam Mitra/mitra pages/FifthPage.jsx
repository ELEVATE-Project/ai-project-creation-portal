import React, { useEffect, useState } from "react";
import { BotMessage } from "../chatMessage";

import "../stylesheet/chatStyle.css";
import Header from "../header/Header";
import { clearMitraLocalStorage, ShowLoader } from "../MainPage";
import { getEncodedLocalStorage, setEncodedLocalStorage } from "../../../utils/storage_utils";
import { createProject, getTitle, saveUserChatsInDB, updateChatSession } from "../../../api services/chat_flow_api";
import { getFifthPageMessages } from "../question script/bot_user_questions";
import { useNavigate } from "react-router-dom";
import { getCreateMicroButtonTranslation } from "../question script/thirdpage_tanslation";
import { getEmptyTitleErrorTranslation, getTitleErrorTranslation, getTitlePlaceholderTranslation } from "../question script/fifthpage_translation";


function FifthPage({
    isBotTalking, handleSpeakerOn, handleSpeakerOff, currentChatValue, setCurrentChatValue, setIsLoading, isLoading, 
    handleGoBack
}) {

    const [inputText, setInputText] = useState(()=>{
        let title = getEncodedLocalStorage('project_title') || '';
        return title
    });

    const titleCharacterLimit = 100;

    const [isLocalLoading, setIsLocalLoading] = useState(false);

    const preferredLanguage = JSON.parse(localStorage.getItem('preferred_language') || '{}');
    const language = preferredLanguage.value || 'en';
    const [fetchError, setFetchError] = useState('');

    const fifthpage_messages = getFifthPageMessages(language);
    const [localErrorText, setLocalErrorText] = useState('');
    const navigate = useNavigate()

    useEffect(()=>{
        async function fetchTitle() {
            try{
                let title = getEncodedLocalStorage('project_title');
                if (!title) {
                    const user_problem_statement = getEncodedLocalStorage('user_problem_statement');
                    const user_objective = getEncodedLocalStorage('selected_objective');
                    const user_action_list = getEncodedLocalStorage('selected_action');
                    title = await getTitle(user_problem_statement, user_objective, user_action_list, language);
                    if (title) {
                        setInputText(title)
                        setEncodedLocalStorage('project_title', title);
                    } else {
                        window.location.reload();
                    }
                }
                setIsLoading(false);
            }  catch (error) {
                setFetchError(getEncodedLocalStorage('system_error') || 'Please try again later!')
                setIsLoading(false)
                console.error(error)
            }
        }
        fetchTitle();
    }, [])


    function handleInputText(e) {
        const newText = e?.target?.value;

        if (newText.length > titleCharacterLimit) {
            setLocalErrorText(getTitleErrorTranslation(language));
        } else if (newText === '') {
            setLocalErrorText(getEmptyTitleErrorTranslation(language));
        } else {
            setLocalErrorText('');
        }
        setInputText(newText);
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
        if (currentChatValue === 7 && inputText && inputText!=="" && localErrorText === '') {
            setIsLocalLoading(true);
            setEncodedLocalStorage("project_title", inputText);
            const session = getEncodedLocalStorage("session");
            const profile_id = localStorage.getItem("profileid");
            const field_to_update = {
                "title": inputText,
                "session_status": "COMPLETED"
            }

            const botMessage = {
                message: fifthpage_messages[9]?.[0]?.message + " " + fifthpage_messages[9]?.[1]?.message,
                role: fifthpage_messages[9]?.[0]?.role,
            };
            await saveUserChatsInDB(botMessage?.message, session, botMessage?.role)
            await saveUserChatsInDB(inputText, session, 'user'); 

            try{

                const response = await updateChatSession(session, field_to_update)
                if(response) {
                    const user_problem_statement = getEncodedLocalStorage('user_problem_statement');
                    const project_duration = getEncodedLocalStorage('selected_week');
                    const user_objective = getEncodedLocalStorage('selected_objective');
                    const user_action_list = getEncodedLocalStorage('selected_action')[0]?.actionSteps;
                    const access_token = localStorage.getItem(process.env.REACT_APP_ACCESS_TOKEN_KEY);
                    const chunks = JSON.parse(localStorage.getItem('chunks'))
                    
                    const project_response = await createProject(
                        access_token, user_problem_statement, user_action_list, project_duration, 
                        inputText, profile_id, session, user_objective, chunks
                    )

                    if(project_response) {
                        clearMitraLocalStorage();
                        setIsLocalLoading(false);

                        
                        const projectId = project_response?.projectId;
                        
                        window.location.replace(`${process.env.REACT_APP_ROUTE_EXIT}${projectId}`);
                        // navigate(process.env.REACT_APP_ROUTE_EXIT);
                    }
                }
            }  catch (error) {
                console.error('Error: ', error);
                setIsLocalLoading(false);
                window.location.href=process.env.REACT_APP_ROUTE_LOGIN;
                // navigate(process.env.REACT_APP_ROUTE_EXIT);
            }
        }
    }

    return (
        <>
            {isLoading&& <ShowLoader />}
            {isLocalLoading&& <ShowLoader showFirstLoader={false} loadingText="Create Micro-Improvement Plan" />}

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
                    {(!fetchError || fetchError === '')&& <div className="secondpage-textbox-container">
                        <textarea
                            id="autoGrow"
                            type="text"
                            placeholder={getTitlePlaceholderTranslation(language)}
                            className="secondpage-text-input"
                            value={inputText}
                            onChange={(e)=>handleInputText(e)}
                        />
                    </div>}
                    {(fetchError && fetchError!=='') && 
                        <>
                            <div className="secondpage-error-div">
                                <p className="secondpage-error-text">{fetchError}</p>
                            </div>
                        </>
                    }
                    {(localErrorText && localErrorText !== '') &&
                        <>
                            <div className="fifthpage-error-div">
                                <p className="secondpage-error-text">{localErrorText}</p>
                            </div>
                        </>
                    }

                <div className="fourthpage-next-div">
                    <button 
                        className={
                            `${(fetchError && fetchError!=='') ? "fifthpage-disable-button" : (!localErrorText || localErrorText === '') ? 
                                "fifthpage-select-bttn" :
                                "fifthpage-disable-button"
                            } `
                        }
                        onClick={handleCreateImprovement}
                    >
                        {getCreateMicroButtonTranslation(language)}
                    </button>
                </div>
            </div>
        </>
    );
}

export default FifthPage;
