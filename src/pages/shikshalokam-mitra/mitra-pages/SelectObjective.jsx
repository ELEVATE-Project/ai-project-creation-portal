import React, { useState, useEffect } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { IoArrowForward } from "react-icons/io5";
// import { BotMessage } from "../chatMessage";
import BotMessage from "./components/chat-message/BotMessage";
import { RxCrossCircled } from "react-icons/rx";
import Header from "../header/Header";
import { getNewLocalTime, ShowLoader } from "../MainPage";
import {
  getEncodedLocalStorage,
  setEncodedLocalStorage,
} from "../../../utils/storage_utils";
import ObjectivesCard from "./components/objectives/ObjectivesCard";
import SuggestOrAddCta from "./components/SuggestOrAddCta";
import "../stylesheet/chatStyle.css";
import {
  getObjectiveList,
  saveUserChatsInDB,
  validateObjective,
} from "../../../apiServices/chat_flow_api";
import { getSecondPageMessages } from "../question script/bot_user_questions";
import {
  getAddOwnButtonTranslation,
  getContinueButtonTranslation,
  getNextButtonTranslation,
  getObjectiveEmptyTranslation,
  getObjectivePlaceholderTranslation,
  getObjectiveTextTranslation,
  getOrTextTranslation,
  getSuggestMoreButtonTranslation,
} from "../question script/secondpage_tanslation";
import ErrorText from "./components/ErrorText";
import UserMessage from "./components/chat-message/UserMessage";
import LoadingChat from "./components/LoadingChat";

function SelectObjective({
  isSelectObjectiveSection,
  isBotTalking,
  handleSpeakerOn,
  handleSpeakerOff,
  currentChatValue,
  setCurrentChatValue,
  setIsLoading,
  isLoading,
  handleGoBack,
  handleGoForward,
  setCurrentPageValue,
  setChatHistory,
  errorText,
  setErrorText,
}) {
  const [objectiveList, setObjectiveList] = useState(() => {
    const storedObjective = getEncodedLocalStorage("objective");

    if (storedObjective) {
      return typeof storedObjective === "string"
        ? [storedObjective]
        : storedObjective;
    }

    return [];
  });

  const [hasClickedOnAddmore, setHasClickedOnAddmore] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [inputText, setInputText] = useState("");
  const [isInReadOnlyMode, setIsInReadOnlyMode] = useState(() => {
    const storedObjective = getEncodedLocalStorage("selected_objective");
    if (storedObjective) {
      return typeof storedObjective === "string" ? true : false;
    }
  });
  const [visibleCount, setVisibleCount] = useState(() => {
    const defaultValueToShow = 3;
    if (!isInReadOnlyMode) {
      return defaultValueToShow;
    } else {
      const objectiveList = getEncodedLocalStorage("objective") || [];
      const selectedObjective = getEncodedLocalStorage("selected_objective");

      const selectedIndex = Array.isArray(objectiveList)
        ? objectiveList.indexOf(selectedObjective)
        : -1;
      setSelectedIndex(selectedIndex);
      setInputText(objectiveList[selectedIndex]);
      return selectedIndex !== -1 && selectedIndex > defaultValueToShow - 1
        ? selectedIndex + 1
        : defaultValueToShow;
    }
  });
  const preferredLanguage = JSON.parse(
    localStorage.getItem("preferred_language") || "{}"
  );
  const language = preferredLanguage.value || "en";

  const secondpage_messages = getSecondPageMessages(language);

  useEffect(() => {
    async function fetchObjectiveList() {
      try {
        if (!objectiveList || objectiveList?.length === 0) {
          setIsLoading(true);
          const userProblemStatement = getEncodedLocalStorage(
            "user_problem_statement"
          );
          const profile_id = localStorage.getItem("profileid");
          const fetched_objectiveList = await getObjectiveList(
            userProblemStatement,
            language,
            profile_id
          );
          if (fetched_objectiveList) {
            setObjectiveList(fetched_objectiveList?.objective_list);
            setEncodedLocalStorage(
              "objective",
              fetched_objectiveList?.objective_list
            );
            localStorage.setItem(
              "chunks",
              JSON.stringify(fetched_objectiveList?.chunks)
            );
            setIsLoading(false);
          } else {
            window.location.reload();
          }
        }
      } catch (error) {
        setFetchError(
          getEncodedLocalStorage("system_error") || "Please try again later!"
        );
        setIsLoading(false);
        console.error(error);
      }
    }
    fetchObjectiveList();
  }, [objectiveList]);

  const handleSuggestMore = () => {
    setVisibleCount((prevCount) => {
      const newCount = prevCount + 3;
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }, 0);
      return newCount;
    });
  };

  useEffect(() => {
    if (isInReadOnlyMode) {
      setIsLoading(true);
      setCurrentChatValue(4);
      localStorage.removeItem("actionList");
      localStorage.removeItem("selected_action");
      setInputText(getEncodedLocalStorage("selected_objective") || "");
      setHasClickedOnAddmore(getEncodedLocalStorage("hasClickedObjAddMore"));
      setIsLoading(false);
    }
  }, [isInReadOnlyMode]);

  const handleObjectiveClick = (index) => {
    setSelectedIndex(index);
    setInputText(objectiveList[index]);
  };

  const handleNextClick = () => {
    if (currentChatValue === 4 && inputText && inputText !== "") {
      setErrorText("");
      setIsLoading(true);
      setObjectiveList(inputText);
      setEncodedLocalStorage("selected_objective", inputText);
      const currentSession = getEncodedLocalStorage("session");
      const botMessage = hasClickedOnAddmore
        ? secondpage_messages[5]?.[0]
        : {
            role: secondpage_messages[4]?.[0]?.role,
            message:
              secondpage_messages[4]?.[0]?.message +
              " " +
              secondpage_messages[4]?.[1]?.message +
              " " +
              JSON.stringify(getEncodedLocalStorage("objective")),
            messageId: secondpage_messages[4]?.[0]?.messageId,
          };

      const chunks = JSON.parse(localStorage.getItem("chunks"));
      saveUserChatsInDB(
        botMessage?.message,
        currentSession,
        botMessage?.role,
        chunks
      )
        .then(() => {
          saveUserChatsInDB(inputText, currentSession, "user");
        })
        .then(() => {
          setCurrentChatValue(5);
          setCurrentPageValue(2);
        })
        .catch((error) => {
          console.error("Error saving chats:", error);
        });
    }
  };

  function handleInputText(e) {
    setInputText(e?.target?.value);
  }

  async function handleInputSend() {
    try {
      if (!inputText || inputText === "") {
        setErrorText(getObjectiveEmptyTranslation(language));
        setTimeout(() => {
          setErrorText("");
        }, 3000);
      } else {
        setIsLoading(true);
        const profile_id = localStorage.getItem("profileid");
        const validate_response = await validateObjective(
          inputText,
          language,
          profile_id
        );
        setIsLoading(false);
        if (validate_response?.result) {
          setEncodedLocalStorage("hasClickedObjAddMore", true);
          handleNextClick();
        } else {
          setErrorText(validate_response?.error_message);
        }
      }
    } catch (error) {
      const errorMessage =
        getEncodedLocalStorage("system_error") || "Please try again later!";

      setErrorText(errorMessage);
      setTimeout(() => {
        setErrorText("");
      }, 10000);
      setIsLoading(false);
      console.error(error);
    }
  }

  function localHandleGoBack(index) {
    if (isInReadOnlyMode && hasClickedOnAddmore) {
      setHasClickedOnAddmore(false);
      setErrorText("");
      setEncodedLocalStorage("hasClickedObjAddMore", false);
    } else {
      handleGoBack(index);
    }
  }

  const selectedObjective = getEncodedLocalStorage("selected_objective");

  if (isLoading && isSelectObjectiveSection) {
    return <LoadingChat />;
  }

  return (
    <>
      {/* {isLoading && <ShowLoader />} */}

      {/* <Header
        shouldEnableGoBack={true}
        shouldEnableCross={true}
        shouldEnableGoForward={false}
        handleGoBack={() => localHandleGoBack(2)}
      /> */}

      <div>
        {!hasClickedOnAddmore ? (
          <div className="secondpage-bot-div">
            <BotMessage
              primaryMessage={secondpage_messages[4]?.[0]?.message}
              secondaryMessage={secondpage_messages[4]?.[1]?.message}
            />
            <div className="secondpage-obj-fixed">
              <div className="mt-3">
                <p className="secondpage-obj-text">
                  {getObjectiveTextTranslation(language)}
                </p>
                {!!(!fetchError || fetchError === "") && (
                  <ObjectivesCard
                    objectiveList={objectiveList}
                    visibleCount={visibleCount}
                    selectedIndex={selectedIndex}
                    handleObjectiveClick={handleObjectiveClick}
                    selectedObjective={selectedObjective}
                    isSelectObjectiveSection={isSelectObjectiveSection}
                  />
                )}
                {!!(fetchError && fetchError !== "") && (
                  <ErrorText errorText={fetchError} />
                )}
              </div>
              {isSelectObjectiveSection && (
                <SuggestOrAddCta
                  showSuggestMoreButton={visibleCount < objectiveList?.length}
                  handleSuggestMore={handleSuggestMore}
                  language={language}
                  handleAddOwnClick={() => {
                    setInputText("");
                    localStorage.removeItem("selected_objective");
                    setHasClickedOnAddmore(true);
                  }}
                  showAddOwnButton={false}
                />
              )}
            </div>
            {isSelectObjectiveSection && (
              <div className="secondpage-next-div">
                <button
                  className={`${
                    Number.isInteger(selectedIndex)
                      ? "secondpage-next-bttn-selected"
                      : "secondpage-next-bttn"
                  } `}
                  onClick={handleNextClick}
                  disabled={!Number.isInteger(selectedIndex)}
                >
                  {getNextButtonTranslation(language)} <IoArrowForward />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <BotMessage primaryMessage={secondpage_messages[5]?.[0]?.message} />
            {!!(!isSelectObjectiveSection && selectedObjective?.length > 0) ? (
              <div className="secondpage-obj-selected-button-div">
                <div className="secondpage-obj-line"></div>
                <button className="secondpage-obj-bttn">
                  {selectedObjective}
                </button>
              </div>
            ) : (
              <>
                <div className="secondpage-textbox-container">
                  <input
                    type="text"
                    placeholder={getObjectivePlaceholderTranslation(language)}
                    className="secondpage-text-input"
                    value={inputText}
                    onChange={(e) => handleInputText(e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleInputSend(e);
                      }
                    }}
                  />
                  <RxCrossCircled
                    className="secondpage-cross-icon"
                    onClick={() => {
                      setInputText("");
                    }}
                  />
                </div>
                {errorText && errorText !== "" && (
                  <>
                    <div className="secondpage-error-div">
                      <p className="secondpage-error-text">{errorText}</p>
                    </div>
                  </>
                )}
                <div className="secondpage-continue-div">
                  <button
                    className="secondpage-continue-bttn"
                    onClick={() => handleInputSend()}
                  >
                    {getContinueButtonTranslation(language)}{" "}
                    <IoArrowForward className="secondpage-right-arror" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {!isSelectObjectiveSection && <UserMessage message="Next" />}
      </div>
    </>
  );
}

export default SelectObjective;
