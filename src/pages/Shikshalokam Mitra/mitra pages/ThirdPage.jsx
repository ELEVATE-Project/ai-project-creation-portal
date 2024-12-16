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
import { getActionList } from "../../../api services/chat_flow_api";
import { getThirdPageMessages } from "../question script/bot_user_questions";



function ThirdPage({
    isBotTalking, handleSpeakerOn, handleSpeakerOff, currentChatValue, setCurrentChatValue, setIsLoading, isLoading, 
    handleGoBack, setCurrentPageValue, handleGoForward, setChatHistory, errorText, setErrorText
}) {

    const [actionList, setActionList] = useState(() => {
        const storedActions = getEncodedLocalStorage('actionList');
        if (Array.isArray(storedActions)) {
            console.log('storedActionsL: ', storedActions)
            return storedActions
        }
        return [];
    });

    const [visibleCount, setVisibleCount] = useState(false);
    const [hasClickedOnAddmore, setHasClickedOnAddmore] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState(null);
    const [wantsToMoveForward, setWantsToMoveForward] = useState(false);
    const [isInReadOnlyMode, setIsInReadOnlyMode] = useState(()=>{
        const storedActionList = getEncodedLocalStorage('actionList');
        if (storedActionList) {
            if(storedActionList.length===1) {
                return true;
            }
        }
        return false;
    });

    const defaultActionList = [
        {id: "0", content: "Action 1"},
        {id: "1", content: "Action 2"}
    ]
    const thirdpage_messages = getThirdPageMessages()

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
            if (!actionList || actionList.length===0) {
                setIsLoading(true)
                const userProblemStatement = getEncodedLocalStorage('user_problem_statement')
                const objective = getEncodedLocalStorage('objective')
                const fetchedActionList = await getActionList(userProblemStatement, objective);
                if (fetchedActionList) {
                    setActionList(fetchedActionList);
                    setEncodedLocalStorage('actionList', fetchedActionList);
                    setIsLoading(false);
                } else {
                    window.location.reload();
                }
            }
        }
        fetchActionList();
    }, [actionList])

    useEffect(()=>{
        console.log("actionList: ", getEncodedLocalStorage("actionList"))
    }, [])

    useEffect(() => {
        if (swipeDirection) {
            const timeout = setTimeout(() => setSwipeDirection(null), 500);
            return () => clearTimeout(timeout);
        }
    }, [swipeDirection]);


    const getActionListArray = ()=> {
        let arrayValue = defaultActionList;
    
        if (!hasClickedOnAddmore && actionList[selectedIndex]?.actionSteps) {
            arrayValue = actionList[selectedIndex]?.actionSteps.map((step, index) => ({
                id: index.toString(),  
                content: step
            }));
        }

        return arrayValue
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

    const handleContinueClick = (action_to_store) => {
        console.log("action_to_store: ", action_to_store)

        if (isActionEmptyOrDefault(action_to_store)) {
            setErrorText("Please add at least one valid action before proceeding.")
            setTimeout(()=>{
                setErrorText('')
            }, 3000)
            return; 
        }

        if (currentChatValue === 5 && actionList){
            setIsLoading(true);
            setEncodedLocalStorage("actionList", [{
                duration: "", actionSteps: action_to_store.map((action)=>action.content)
            }]);
            setChatHistory(prevValue => {
                const createdAt = getNewLocalTime();

                const botMessage = hasClickedOnAddmore?  
                {
                    role: thirdpage_messages[7]?.[0]?.role,
                    message: thirdpage_messages[6]?.[0]?.message
                    + " " + thirdpage_messages[7]?.[0]?.message 
                    + " " + thirdpage_messages[7]?.[1]?.message,
                    messageId: thirdpage_messages[7]?.[0]?.messageId
                } : thirdpage_messages[6]?.[0]
                console.log("botMessage: ", botMessage)

                const userMessage = {role: 'user', message: JSON.stringify(action_to_store), created_at: createdAt}

                if (botMessage) {
                    botMessage.created_at = createdAt;  
                    if (botMessage.created_at === userMessage.created_at) {
                        userMessage.created_at = new Date(new Date(botMessage.created_at).getTime() + 1);
                    }
                }

                // Filter out already saved messages
                return [...prevValue, botMessage, userMessage];
            });
            setCurrentChatValue(6);
            setCurrentPageValue(3);
            setIsLoading(false);
        }
    }

    return (
        <>
            {isLoading&& <ShowLoader />}

            <Header shouldEnableGoBack={true} shouldEnableCross={true} handleGoBack={()=>handleGoBack(3)}
                handleGoForward={()=>handleGoForward(3)} 
                shouldEnableGoForward = {getEncodedLocalStorage('actionList') ? true : false}
            />
            <div className="secondpage-div">
                {(!hasClickedOnAddmore && !wantsToMoveForward && actionList && !isLoading)?
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
                                <p className="secondpage-obj-text">Action list</p>
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
                                <div className="thirdpage-obj-container">
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
                                </div>
                            </div>
                            {(!isInReadOnlyMode)&&<div className="thirdpage-div1">
                                <div className="secondpage-add-div">
                                    <button className="secondpage-add-bttn"
                                        onClick={()=>{
                                            setHasClickedOnAddmore(true)
                                        }}
                                    >
                                        <FiPlusCircle className="secondpage-plus-icon"/>
                                        Add Your Own
                                    </button>
                                </div>
                                {(!visibleCount)&&
                                    <div className="secondpage-add-div">
                                        <button className="secondpage-add-bttn"
                                            onClick={handleSuggestMore}
                                        >
                                            Suggest More
                                        </button>
                                    </div>
                                }
                            </div>}
                        </div>
                        <div className="thirdpage-next-div">
                            <button className={`thirdpage-select-bttn  ${isInReadOnlyMode&& "custom-disable-button"}`}
                                onClick={()=>{
                                    if (!isInReadOnlyMode){
                                        setWantsToMoveForward(true)
                                    }
                                }}
                            >
                                Select <IoArrowForward className="thirdpage-cont-arrow-icon"/>
                            </button>
                        </div>
                    </div>
                :
                    <>
                        {(actionList && actionList.length !== 0)&& 
                            <div className="secondpage-bot-div">
                                <FinalActionPage 
                                    actionListArray={getActionListArray()}
                                    isBotTalking={isBotTalking}
                                    handleSpeakerOn={handleSpeakerOn}
                                    handleSpeakerOff={handleSpeakerOff}
                                    handleContinueClick={handleContinueClick}
                                    errorText={errorText}
                                />
                            </div>
                        }
                    </>
                }
            </div>
        </>
    );
}

export default ThirdPage;

export function FinalActionPage({
    actionListArray, isBotTalking, handleSpeakerOn, handleSpeakerOff, handleContinueClick, errorText
}) {

    const [actionList, setActionList] = useState(actionListArray || []);
    const thirdpage_messages = getThirdPageMessages()

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;
        console.log("HEREEE")
        const items = Array.from(actionList);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setActionList(items);
    };

    const handleInputChange = (id, value) => {
        console.log("HEREEE INOUTT")
        setActionList((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, content: value } : item
            )
        );
    };

    const handleDelete = (id) => {
        console.log("Deleting action with ID:", id);
        setActionList((prev) => prev.filter((item) => item.id !== id));
    };

    const handleAddAction = () => {
        setActionList((prev) => [
            ...prev,
            { id: Date.now().toString(), content: "" }
        ]);
    };

    useEffect(()=>{
        console.log("action list: ", actionList)
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
                    <p className="secondpage-obj-text">Action list</p>
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
                                                        placeholder="Write action here..."
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
                            Add Action
                        </button>
                    </div>
                    <div className="thirdpage-continue-div">
                        <button className="thirdpage-select-bttn"
                            onClick={()=>{handleContinueClick(actionList)}}
                        >
                            Continue <IoArrowForward className="thirdpage-cont-arrow-icon"/>
                        </button>
                    </div>
                </div>
  
            </div>
        </div>
    );
}