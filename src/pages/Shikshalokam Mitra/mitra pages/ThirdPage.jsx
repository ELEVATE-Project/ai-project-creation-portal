import React, { useState, useEffect } from "react";
import { FiPlusCircle, FiTrash2 } from "react-icons/fi";
import { IoArrowForward } from "react-icons/io5";
import { RiArrowLeftSFill, RiArrowRightSFill } from "react-icons/ri";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { BotMessage } from "../chatMessage";
import Header from "../header/Header";

import "../stylesheet/chatStyle.css";
import { getNewLocalTime, ShowLoader } from "../MainPage";
import { getEncodedLocalStorage, setEncodedLocalStorage } from "../../../utils/storage_utils";
import { getActionList, saveUserChatsInDB, validateActionList } from "../../../api services/chat_flow_api";
import { getThirdPageMessages } from "../question script/bot_user_questions";
import { getActionDefaultTranslation, getActionErrorTranslation, getActionListTextTranslation, getActionPlaceholderTranslation, getAddActionButtonTranslation, getAddOwnButtonTranslation, getSelectButtonTranslation } from "../question script/thirdpage_tanslation";
import { getContinueButtonTranslation, getNextButtonTranslation, getOrTextTranslation, getSuggestMoreButtonTranslation } from "../question script/secondpage_tanslation";



function ThirdPage({
    isBotTalking, handleSpeakerOn, handleSpeakerOff, currentChatValue, setCurrentChatValue, setIsLoading, isLoading, 
    handleGoBack, setCurrentPageValue, handleGoForward, setChatHistory, errorText, setErrorText
}) {

    const [actionList, setActionList] = useState(() => {
        const storedActions = getEncodedLocalStorage('actionList');
        if (Array.isArray(storedActions)) {
            
            return storedActions
        }
        return [];
    });

    const [visibleCount, setVisibleCount] = useState(false);
    const [hasClickedOnAddmore, setHasClickedOnAddmore] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState(null);
    const [wantsToMoveForward, setWantsToMoveForward] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [isInReadOnlyMode, setIsInReadOnlyMode] = useState(()=>{
        const storedActionList = getEncodedLocalStorage('selected_action');
        if (storedActionList) {
            if(storedActionList.length===1) {
                return true;
            }
        }
        return false;
    });

    const preferredLanguage = JSON.parse(localStorage.getItem('preferred_language') || '{}');
    const language = preferredLanguage.value || 'en';

    const defaultActionList = getActionDefaultTranslation(language)
    const thirdpage_messages = getThirdPageMessages(language, hasClickedOnAddmore)

    const handleRightArrowClick = () => {
        setSelectedIndex(prevIndex => {
            if (prevIndex < actionList.length - 1) {
                setSwipeDirection('right');
                return prevIndex + 1;
            }
            return prevIndex; 
        });
    };
      
    const handleLeftArrowClick = () => {
        setSelectedIndex(prevIndex => {
            if (prevIndex > 0) {
                setSwipeDirection('left');
                return prevIndex - 1;
            }
            return prevIndex;
        })
    };
      
    
    const handleSuggestMore = ()=>{
        setVisibleCount(true);
    }

    useEffect(()=>{
        async function fetchActionList() {
            try{
                if (!actionList || actionList?.length===0) {
                    setIsLoading(true)
                    const userProblemStatement = getEncodedLocalStorage('user_problem_statement')
                    const objective = getEncodedLocalStorage('selected_objective')
                    const fetchedActionList = await getActionList(userProblemStatement, objective, language);
                    if (fetchedActionList) {
                        setActionList(fetchedActionList);
                        setEncodedLocalStorage('actionList', fetchedActionList);
                        setIsLoading(false);
                    } else {
                        window.location.reload();
                    }
                }
            }  catch (error) {
                setFetchError(getEncodedLocalStorage('system_error') || 'Please try again later!')
                setIsLoading(false)
                console.error(error)
            }
        }
        fetchActionList();
    }, [actionList])

    useEffect(() => {
        if (swipeDirection) {
            const timeout = setTimeout(() => setSwipeDirection(null), 500);
            return () => clearTimeout(timeout);
        }
    }, [swipeDirection]);

    useEffect(()=>{
        if(isInReadOnlyMode) {
            setIsLoading(true);
            setCurrentChatValue(5);
            // localStorage.removeItem('selected_action');
            setIsLoading(false);
        }
    }, [isInReadOnlyMode])


    const getActionListArray = ()=> {
        
        if (isInReadOnlyMode) {
            let stored_action  = getEncodedLocalStorage('selected_action')[0]?.actionSteps?.map((action, index) => ({
                id: index.toString(),  
                content: action
            }));

            return stored_action;
        } else {
            let arrayValue = defaultActionList;
    
            if (!hasClickedOnAddmore && actionList[selectedIndex]?.actionSteps) {
                arrayValue = actionList[selectedIndex]?.actionSteps.map((step, index) => ({
                    id: index.toString(),  
                    content: step
                }));
            }
    
            return arrayValue
        }
    }

    const isActionEmptyOrDefault = (action_to_store) => {
        if (!action_to_store || action_to_store.length === 0) {
            return true; 
        }
    
        return action_to_store.some(action => {
            return !action.content.trim() || defaultActionList.some(
                defaultAction => defaultAction.content === action.content.trim()
            );
        });
    };

    const handleContinueClick = async (action_to_store) => {
        
        try{
            if (isActionEmptyOrDefault(action_to_store)) {
                // setErrorText(getActionErrorTranslation(language))
                // setTimeout(()=>{
                //     setErrorText('')
                // }, 3000)
                return; 
            }
            const actionListToStore = [{
                duration: "", actionSteps: action_to_store.map((action)=>action.content)
            }]
            const userProblemStatement = getEncodedLocalStorage('user_problem_statement')
            const objective = getEncodedLocalStorage('selected_objective')
            setIsLoading(true);
            const validate_response = await validateActionList(
                action_to_store.map((action)=>action.content), objective, userProblemStatement, language
            )
            setIsLoading(false);
    
            if (validate_response?.result === false) {
                setErrorText(validate_response?.error_message)
                setTimeout(()=>{
                    setErrorText('')
                }, 6000)
                return
            }
    
            if (currentChatValue === 5 && actionList){
                setIsLoading(true);
                setEncodedLocalStorage("selected_action", actionListToStore);
                // console.log(JSON.stringify(getEncodedLocalStorage('actionList')))
                // console.log(thirdpage_messages[7]?.[0]?.message)
                const currentSession = getEncodedLocalStorage('session');
                const botMessage =
                {
                    role: thirdpage_messages[7]?.[0]?.role,
                    message: thirdpage_messages[6]?.[0]?.message
                    + "\n" + thirdpage_messages[7]?.[0]?.message 
                    + "\n" + thirdpage_messages[7]?.[1]?.message
                    + "\n" + JSON.stringify(getEncodedLocalStorage('actionList')),
                    messageId: thirdpage_messages[7]?.[0]?.messageId
                }
                
    
                saveUserChatsInDB(botMessage?.message, currentSession, botMessage?.role)
                .then(() => {
                    saveUserChatsInDB(JSON.stringify(action_to_store), currentSession, 'user'); 
                })
                .then(() => {
                    setCurrentChatValue(6);
                    setCurrentPageValue(3);
                    setIsLoading(false);
                })
            }
        } catch (error) {
            const errorMessage = getEncodedLocalStorage('system_error') || 'Please try again later!';
            console.log('Error:', errorMessage);
            setErrorText(errorMessage);
            setIsLoading(false)
            setTimeout(()=>{
                setErrorText('')
            }, 10000)
            console.error(error)
        }
    }

    return (
        <>
            {isLoading&& <ShowLoader />}

            <Header shouldEnableGoBack={true} shouldEnableCross={true} 
                handleGoBack={()=>handleGoBack(3)} shouldEnableGoForward={false}
            />
            <div className="secondpage-div">
                {(!hasClickedOnAddmore && !wantsToMoveForward && actionList && !isLoading && !isInReadOnlyMode)?
                    <div className="secondpage-bot-div" 
                        // ref={currentChatValue === 2 ? scrollRef : null}
                    >
                        <BotMessage 
                            firstparaClass={"firstpara-div"}
                            firstpageClass={"firstpage-para1"}
                            botMessage={
                                thirdpage_messages[6]?.[0]?.message
                            }
                            showFirst={true}
                            handleSpeakerOn={handleSpeakerOn}
                            isBotTalking={isBotTalking}
                            handleSpeakerOff={handleSpeakerOff}
                            audioId={3.1}    
                        />
                        <div className="thirdpage-obj-fixed">
                            <div className="secondpage-obj-div">
                                <p className="secondpage-obj-text">
                                    {getActionListTextTranslation(language)}
                                </p>
                                {(visibleCount)&&
                                    <div className="thirdpage-arrow-div">
                                        <RiArrowLeftSFill
                                            className={`${(selectedIndex===0) ? 'thirdpage-arrow-icon-last' : 'thirdpage-arrow-icon'}`}
                                            onClick={handleLeftArrowClick}
                                        />
                                        <span className="actionlist-number">
                                            {selectedIndex + 1}/{actionList.length}
                                        </span>
                                        <RiArrowRightSFill
                                            className={`${(selectedIndex===actionList?.length-1) ? 'thirdpage-arrow-icon-last' : 'thirdpage-arrow-icon'}`}
                                            onClick={handleRightArrowClick}
                                        />
                                    </div>
                                }
                                {(!fetchError || fetchError === '')&& <div className="thirdpage-obj-container">
                                    {selectedIndex !== null && (
                                        <div
                                            key={selectedIndex}
                                            className={`thirdpage-obj-selected-button-div ${
                                                swipeDirection === "left"
                                                    ? "swipe-left"
                                                    : swipeDirection === "right"
                                                    ? "swipe-right"
                                                    : ""
                                            }`}
                                        >
                                            <div className="secondpage-obj-line"></div>
                                            <button className={`thirdpage-obj-bttn ${swipeDirection ? `swipe-in-${swipeDirection}` : ""}`}>
                                                {(actionList[selectedIndex]?.duration !== '')&&
                                                    <p className="thirdpage-duration">
                                                        <span className="thirdpage-week">{actionList[selectedIndex]?.duration}</span>
                                                        {" "}weeks recommend
                                                    </p>
                                                }
                                                <ol>
                                                    {(actionList[selectedIndex]?.actionSteps || []).map((subAction, subActionIndex) => (
                                                        <li key={`${selectedIndex}.${subActionIndex}`}>
                                                            <span className="thirdpage-list-text">{subAction}</span>
                                                        </li>
                                                    ))}
                                                </ol>
                                            </button>
                                        </div>
                                    )}
                                </div>}
                                {(fetchError && fetchError!=='') && 
                                    <>
                                        <div className="secondpage-error-div">
                                            <p className="secondpage-error-text">{fetchError}</p>
                                        </div>
                                    </>
                                }
                            </div>
                            {<div className="thirdpage-div1">
                                {(!visibleCount && actionList?.length>1)&&
                                    <>
                                        <div className="secondpage-add-div">
                                            <button className="secondpage-add-bttn"
                                                onClick={handleSuggestMore}
                                            >
                                                {getSuggestMoreButtonTranslation(language)}
                                            </button>
                                        </div>
                                    </>
                                }
                                <div className="secondpage-add-div">
                                    <p className="secondpage-or-text">
                                        {getOrTextTranslation(language)}
                                    </p>
                                </div>
                                <div className="secondpage-add-div">
                                    <button className="secondpage-add-bttn"
                                        onClick={()=>{
                                            setHasClickedOnAddmore(true)
                                        }}
                                    >
                                        <FiPlusCircle className="secondpage-plus-icon"/>
                                        {getAddOwnButtonTranslation(language)}
                                    </button>
                                </div>
                            </div>}
                        </div>
                        <div className="thirdpage-next-div">
                            <button className={`thirdpage-select-bttn`}
                                onClick={()=>{
                                    setWantsToMoveForward(true)
                                }}
                            >
                                {getSelectButtonTranslation(language)} 
                                <IoArrowForward className="thirdpage-cont-arrow-icon"/>
                            </button>
                        </div>
                    </div>
                :
                    <>
                        {(!isInReadOnlyMode)&& 
                            <div className="secondpage-bot-div">
                                <FinalActionPage 
                                    actionListArray={getActionListArray()}
                                    isBotTalking={isBotTalking}
                                    handleSpeakerOn={handleSpeakerOn}
                                    handleSpeakerOff={handleSpeakerOff}
                                    handleContinueClick={handleContinueClick}
                                    errorText={errorText}
                                    hasClickedOnAddmore={hasClickedOnAddmore}
                                />
                            </div>
                        }
                        {(isInReadOnlyMode) && 
                            <FinalActionPage 
                                actionListArray={getActionListArray()}
                                isBotTalking={isBotTalking}
                                handleSpeakerOn={handleSpeakerOn}
                                handleSpeakerOff={handleSpeakerOff}
                                handleContinueClick={handleContinueClick}
                                errorText={errorText}
                                hasClickedOnAddmore={hasClickedOnAddmore}
                            />
                        }
                    </>
                }
            </div>
        </>
    );
}

export default ThirdPage;

export function FinalActionPage({
    actionListArray, isBotTalking, handleSpeakerOn, handleSpeakerOff, handleContinueClick, errorText, hasClickedOnAddmore
}) {

    const [actionList, setActionList] = useState(actionListArray || []);
    const preferredLanguage = JSON.parse(localStorage.getItem('preferred_language') || '{}');
    const language = preferredLanguage.value || 'en';

    const thirdpage_messages = getThirdPageMessages(language, hasClickedOnAddmore)

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;
        
        const items = Array.from(actionList);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setActionList(items);
    };

    const handleInputChange = (id, value) => {
        
        setActionList((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, content: value } : item
            )
        );
    };

    const handleDelete = (id) => {
        if(actionList && actionList.length <= 1) return;
        setActionList((prev) => prev.filter((item) => item.id !== id));
    };

    const handleAddAction = () => {
        setActionList((prev) => [
            ...prev,
            { id: Date.now().toString(), content: "" }
        ]);
    };

    useEffect(()=>{
        
    }, [actionList])

    return (
        <div className="final-action-page">
            <BotMessage 
                firstparaClass={"firstpara-div"}
                firstpageClass={"firstpage-para1"}
                secondMessageClass={"secondpage-para2"}
                botMessage={

                    thirdpage_messages[7]?.[0]?.message
                }
                botSecondMessage={
                    thirdpage_messages[7]?.[1]?.message
                }
                showFirst={true}
                showSecond={true}
                handleSpeakerOn={handleSpeakerOn}
                isBotTalking={isBotTalking}
                handleSpeakerOff={handleSpeakerOff}
                audioId={3.2}  
            />
            <div className="secondpage-obj-fixed">
                <div className="secondpage-obj-div">
                    <p className="secondpage-obj-text">
                        {getActionListTextTranslation(language)}
                    </p>
                    <div className="thirdpage-error-div">
                        <p className="secondpage-valid-text">{getActionErrorTranslation(language)}</p>
                    </div>
                    {(errorText && errorText!=='') && 
                        <>
                            <div className="thirdpage-error-div">
                                <p className="secondpage-error-text">{errorText}</p>
                            </div>
                        </>
                    }
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="actionList">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {actionList.map((action, index) => (
                                        <Draggable
                                            key={action.id}
                                            draggableId={action.id}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="action-box"
                                                >
                                                    <div className="drag-handle">
                                                        <span>⋮⋮</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder={getActionPlaceholderTranslation(language)}
                                                        value={action?.content}
                                                        className="final-action-input"
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                action.id,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    <FiTrash2
                                                        className="delete-icon"
                                                        onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(action.id);
                                                            }
                                                        }
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <div className="secondpage-add-div1">
                        <button className="secondpage-add-bttn"
                            onClick={()=>{
                                handleAddAction()
                            }}
                        >
                            <FiPlusCircle className="secondpage-plus-icon"/>
                            {getAddActionButtonTranslation(language)}
                        </button>
                    </div>
                    <div className="thirdpage-continue-div">
                        <button className="thirdpage-select-bttn"
                            onClick={()=>{handleContinueClick(actionList)}}
                        >
                            {(hasClickedOnAddmore)?
                                getContinueButtonTranslation(language)
                                :
                                getNextButtonTranslation(language)
                            } 
                            <IoArrowForward className="thirdpage-cont-arrow-icon"/>
                        </button>
                    </div>
                </div>
  
            </div>
        </div>
    );
}