import React, { useState, useEffect } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { IoArrowForward } from "react-icons/io5";
import { BotMessage } from "../chatMessage";
import { RxCrossCircled } from "react-icons/rx";
import Header from "../header/Header";
import { getNewLocalTime, ShowLoader } from "../MainPage";
import { getEncodedLocalStorage, setEncodedLocalStorage } from "../../../utils/storage_utils";

import "../stylesheet/chatStyle.css";
import { getObjectiveList } from "../../../api services/chat_flow_api";
import { getSecondPageMessages } from "../question script/bot_user_questions";


function SecondPage({ 
    isBotTalking, handleSpeakerOn, handleSpeakerOff, currentChatValue, setCurrentChatValue, setIsLoading, isLoading,
    handleGoBack, handleGoForward, setCurrentPageValue, setChatHistory, errorText, setErrorText
}) {

    const [objectiveList, setObjectiveList] = useState(()=>{
        const storedObjective = getEncodedLocalStorage('objective');
        console.log('storedObjective: ', storedObjective)
        if(storedObjective) {
            return  (typeof storedObjective === 'string') ? [storedObjective] : storedObjective
        }

        return [];
    });
    const [visibleCount, setVisibleCount] = useState(3);
    const [hasClickedOnAddmore, setHasClickedOnAddmore] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [inputText, setInputText] = useState('');
    const [isInReadOnlyMode, setIsInReadOnlyMode] = useState(()=>{
        const storedObjective = getEncodedLocalStorage('objective');
        if(storedObjective) {
            return  (typeof storedObjective === 'string') ? true : false
        }
    });
    const secondpage_messages = getSecondPageMessages();

    useEffect(()=>{
        async function fetchObjectiveList() {
            if (!objectiveList || objectiveList.length===0) {
                setIsLoading(true);
                const userProblemStatement = getEncodedLocalStorage('user_problem_statement')
                const fetched_objectiveList = await getObjectiveList(userProblemStatement);
                if (fetched_objectiveList) {
                    setObjectiveList(fetched_objectiveList);
                    setEncodedLocalStorage('objective', fetched_objectiveList);
                    setIsLoading(false);
                } else {
                    window.location.reload();
                }
            }
        }
        fetchObjectiveList();
    }, [objectiveList])

    const handleSuggestMore = ()=>{
        setVisibleCount(prevCount => {
            const newCount = prevCount + 3;
            setTimeout(() => {
                window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: "smooth",
                });
            }, 0);
            return newCount;
        });
    }

    const handleObjectiveClick = (index) => {
        console.log(index)
        setSelectedIndex(index);
        setInputText(objectiveList[index])
    };

    const handleNextClick = () => {
        if(isInReadOnlyMode) return;
        if (currentChatValue === 4 && inputText && inputText!==""){
            setIsLoading(true);
            setObjectiveList(inputText);
            setEncodedLocalStorage("objective", inputText);
            setChatHistory(prevValue => {

                let createdAt = getNewLocalTime();

                console.log("hasClickedOnAddmore: ", hasClickedOnAddmore)
                const botMessage = hasClickedOnAddmore? secondpage_messages[5]?.[0] 
                : {
                    role: secondpage_messages[4]?.[0]?.role,
                    message: secondpage_messages[4]?.[0]?.message + " " + secondpage_messages[4]?.[1]?.message,
                    messageId: secondpage_messages[4]?.[0]?.messageId
                }
                console.log("botMessage: ", botMessage)

                const userMessage = {role: 'user', message: inputText, created_at: createdAt}

                if (botMessage) {
                    botMessage.created_at = createdAt;  
                    if (botMessage.created_at === userMessage.created_at) {
                        userMessage.created_at = new Date(new Date(botMessage.created_at).getTime() + 1);
                    }
                }

                return [...prevValue, botMessage, userMessage];
            });
            setCurrentChatValue(5);
            setCurrentPageValue(2);
        }
    }

    function handleInputText(e) {
        setInputText(e?.target?.value);
    }

    function handleInputSend() {
        if (!inputText || inputText === '') {
            setErrorText('Please enter an objective!')
            setTimeout(()=>{
                setErrorText('')
            }, 3000)
        } else {
            console.log("Sending: ", inputText)
            handleNextClick()
        }
    }

    return (
        <>
            {isLoading&& <ShowLoader />}

            <Header shouldEnableGoBack={true} shouldEnableCross={true} 
                handleGoBack={() => handleGoBack(2)} handleGoForward={()=>handleGoForward(2)} 
                shouldEnableGoForward = {getEncodedLocalStorage('objective') ? true : false}
            />
            <div className="secondpage-div">
                {(!hasClickedOnAddmore)?
                    <div className="secondpage-bot-div" 
                        // ref={currentChatValue === 2 ? scrollRef : null}
                    >
                        <BotMessage 
                            firstparaClass={"firstpara-div"}
                            firstpageClass={"firstpage-para1"}
                            secondMessageClass={"secondpage-para2"}
                            botMessage={
                                secondpage_messages[4]?.[0]?.message
                            }
                            botSecondMessage={
                                secondpage_messages[4]?.[1]?.message
                            }
                            showFirst={true}
                            showSecond={true}
                            isBotTalking={isBotTalking}
                            audioId={2.1}
                            handleSpeakerOn={handleSpeakerOn}
                            handleSpeakerOff={handleSpeakerOff}
                        />
                        <div className="secondpage-obj-fixed">
                            <div className="secondpage-obj-div">
                                <p className="secondpage-obj-text">
                                    {isInReadOnlyMode ? "Objective": "Objectives"}
                                </p>
                                <div className="objective-list-div">
                                    {(Array.isArray(objectiveList) ? objectiveList : [])
                                        .slice(0, visibleCount).map((obj, objIndex) => (
                                            <div key={objIndex}
                                                className = {
                                                    objIndex === selectedIndex
                                                        ? 'secondpage-obj-selected-button-div'
                                                        : 'secondpage-obj-bttn-div'
                                                }
                                                onClick={() => handleObjectiveClick(objIndex)}
                                            >
                                                <div className="secondpage-obj-line"></div>
                                                <button className="secondpage-obj-bttn">
                                                    {obj}
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                            {(!isInReadOnlyMode)&&<div className="secondpage-div1">
                                <div className="secondpage-add-div">
                                    <button className="secondpage-add-bttn"
                                        onClick={()=>{
                                            setInputText('');
                                            setHasClickedOnAddmore(true);
                                        }}
                                    >
                                        <FiPlusCircle className="secondpage-plus-icon"/>
                                        Add Your Own
                                    </button>
                                </div>
                                {(visibleCount !== objectiveList?.length)&&
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
                        <div className="secondpage-next-div">
                            <button 
                                className={
                                    `${Number.isInteger(selectedIndex) ? "secondpage-next-bttn-selected" :
                                        "secondpage-next-bttn"}  ${isInReadOnlyMode&& "custom-disable-button"}`
                                    }
                                onClick={handleNextClick}
                            >
                                Next <IoArrowForward />
                            </button>
                        </div>
                    </div>
                :

                <div className="secondpage-own-obj-div">
                    <BotMessage 
                        firstparaClass={"firstpara-div"}
                        firstpageClass="secondpage-obj-para1 secondpage-para1"
                        botMessage={
                            secondpage_messages[5]?.[0]?.message
                        }
                        showFirst={true}
                        isBotTalking={isBotTalking}
                        audioId={2.2}
                        handleSpeakerOn={handleSpeakerOn}
                        handleSpeakerOff={handleSpeakerOff}
                    />
                    <div className="secondpage-textbox-container">
                        <input
                            type="text"
                            // placeholder="Enter objective"
                            className="secondpage-text-input"
                            value={inputText}
                            onChange={(e)=>handleInputText(e)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleInputSend(e)
                                }
                            }}
                        />
                        <RxCrossCircled 
                            className="secondpage-cross-icon" 
                            onClick={() => {
                                setInputText('')
                            }} 
                        />
                    </div>
                    {(errorText && errorText!=='') && 
                        <>
                            <div className="secondpage-error-div">
                                <p className="secondpage-error-text">{errorText}</p>
                            </div>
                        </>
                    }
                    <div className="secondpage-continue-div">
                        <button className="secondpage-continue-bttn"
                            onClick={()=>handleInputSend()}
                        >
                            Continue <IoArrowForward className="secondpage-right-arror" />
                        </button>
                    </div>
                </div>
            }
            </div>
        </>
    );
}

export default SecondPage;