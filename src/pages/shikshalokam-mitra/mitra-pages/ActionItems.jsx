import React, { useState, useEffect } from "react";
import { FiPlusCircle, FiTrash2 } from "react-icons/fi";
import { IoArrowForward } from "react-icons/io5";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import BotMessage from "./components/chat-message/BotMessage";
import SuggestOrAddCta from "./components/SuggestOrAddCta";
import "../stylesheet/chatStyle.css";
import {
  getEncodedSessionStorage,
  setEncodedSessionStorage,
} from "../../../utils/storage_utils";
import {
  getActionList,
  saveUserChatsInDB,
  validateActionList,
} from "../../../apiServices/chat_flow_api";
import { getThirdPageMessages } from "../question script/bot_user_questions";
import {
  getActionDefaultTranslation,
  getActionErrorTranslation,
  getActionListTextTranslation,
  getActionPlaceholderTranslation,
  getAddActionButtonTranslation,
  getSelectButtonTranslation,
} from "../question script/thirdpage_tanslation";
import {
  getContinueButtonTranslation,
  getNextButtonTranslation,
} from "../question script/secondpage_tanslation";
import { PiDotsSixVerticalBold } from "react-icons/pi";
import { TbTrashOff } from "react-icons/tb";
import ActionItemsList from "./components/action-items/ActionItemsList";
import UserMessage from "./components/chat-message/UserMessage";
import LoadingChat from "./components/LoadingChat";
import { transformSource } from "../../../utils/mitra-chat";
import Source from "./components/Source";
import { LOADER_KEYS } from "../../../constants/common";

function ActionItems({
  isBotTalking,
  handleSpeakerOn,
  handleSpeakerOff,
  setIsLoading,
  isLoading,
  handleGoBack,
  setCurrentPageValue,
  handleGoForward,
  setChatHistory,
  errorText,
  setErrorText,
  isSelectActionItems,
  handleScrollIntoView,
  handleLoaderState,
  getLoaderState,
}) {
  const [actionList, setActionList] = useState([]);

  const [visibleCount, setVisibleCount] = useState(false);
  const [hasClickedOnAddmore, setHasClickedOnAddmore] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [wantsToMoveForward, setWantsToMoveForward] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [actionItemSource, setActionItemSource] = useState({});
  useEffect(() => {
    const storedActionItemSource =
      getEncodedSessionStorage("action_item_source");
    if (storedActionItemSource) {
      setActionItemSource(JSON.parse(storedActionItemSource));
    }
    if (isSelectActionItems) handleScrollIntoView();
  }, []);
  const [isInReadOnlyMode, setIsInReadOnlyMode] = useState(() => {
    const storedActionList = getEncodedSessionStorage("selected_action");
    if (storedActionList) {
      if (storedActionList.length === 1) {
        return true;
      }
    }
    return false;
  });

  const preferredLanguage = JSON.parse(
    getEncodedSessionStorage("preferred_language") || "{}"
  );
  const language = preferredLanguage.value || "en";

  const defaultActionList = getActionDefaultTranslation(language);
  const thirdpage_messages = getThirdPageMessages(
    language,
    hasClickedOnAddmore
  );

  const handleRightArrowClick = () => {
    setSelectedIndex((prevIndex) => {
      if (prevIndex < actionList.length - 1) {
        setSwipeDirection("right");
        return prevIndex + 1;
      }
      return prevIndex;
    });
  };

  const handleLeftArrowClick = () => {
    setSelectedIndex((prevIndex) => {
      if (prevIndex > 0) {
        setSwipeDirection("left");
        return prevIndex - 1;
      }
      return prevIndex;
    });
  };

  const handleSuggestMore = () => {
    setVisibleCount(true);
    handleScrollIntoView();
  };

  useEffect(() => {
    async function fetchActionList() {
      // setIsLoading(true);
      try {
        handleLoaderState(LOADER_KEYS.FETCH_ACTION_LIST, true);
        if (!actionList || actionList?.length === 0) {
          // setIsLoading(true);
          const userProblemStatement = getEncodedSessionStorage(
            "user_problem_statement"
          );
          const objective = getEncodedSessionStorage("selected_objective");
          const profile_id = getEncodedSessionStorage("profileid");
          const fetchedActionList = await getActionList(
            userProblemStatement,
            objective,
            language,
            profile_id
          );
          if (fetchedActionList && fetchedActionList?.action_list?.length > 0) {
            setActionList(fetchedActionList);
            setEncodedSessionStorage("actionList", fetchedActionList);
            const transformedSource = transformSource(fetchedActionList);
            setActionItemSource(transformedSource);
            setEncodedSessionStorage(
              "action_item_source",
              JSON.stringify(transformedSource)
            );
            if (isSelectActionItems) handleScrollIntoView();
          } else {
            setFetchError(
              getEncodedSessionStorage("system_error") || "Please try again later!"
            );
            // window.location.reload();
          }
        }
      } catch (error) {
        setFetchError(
          getEncodedSessionStorage("system_error") || "Please try again later!"
        );
        console.error(error);
      } finally {
        handleLoaderState(LOADER_KEYS.FETCH_ACTION_LIST, false);
      }
    }
    const storedActions = getEncodedSessionStorage("actionList");
    if (Array.isArray(storedActions)) {
      setActionList(storedActions);
    } else {
      fetchActionList();
    }
  }, []);

  useEffect(() => {
    if (swipeDirection) {
      const timeout = setTimeout(() => setSwipeDirection(null), 500);
      return () => clearTimeout(timeout);
    }
  }, [swipeDirection]);

  // useEffect(() => {
  //   if (isInReadOnlyMode) {
  //     setIsLoading(true);
  //     setIsLoading(false);
  //   }
  // }, [isInReadOnlyMode]);

  const getActionListArray = () => {
    if (!isSelectActionItems || isInReadOnlyMode) {
      let stored_action = getEncodedSessionStorage(
        "selected_action"
      )?.[0]?.actionSteps?.map((action, index) => ({
        id: index.toString(),
        content: action,
      }));

      return stored_action;
    } else {
      let arrayValue = defaultActionList;

      if (!hasClickedOnAddmore && actionList[selectedIndex]?.actionSteps) {
        arrayValue = actionList[selectedIndex]?.actionSteps.map(
          (step, index) => ({
            id: index.toString(),
            content: step,
          })
        );
      }

      return arrayValue;
    }
  };

  const isActionEmptyOrDefault = (action_to_store) => {
    if (!action_to_store || action_to_store.length === 0) {
      return true;
    }

    return action_to_store.some((action) => {
      return (
        !action.content.trim() ||
        defaultActionList.some(
          (defaultAction) => defaultAction.content === action.content.trim()
        )
      );
    });
  };

  const handleContinueClick = async (action_to_store) => {
    try {
      if (isActionEmptyOrDefault(action_to_store)) {
        return;
      }
      const actionListToStore = [
        {
          duration: "",
          actionSteps: action_to_store.map((action) => action.content),
        },
      ];
      const userProblemStatement = getEncodedSessionStorage(
        "user_problem_statement"
      );
      const objective = getEncodedSessionStorage("selected_objective");
      // setIsLoading(true);
      const profile_id = getEncodedSessionStorage("profileid");
      const validate_response = await validateActionList(
        action_to_store.map((action) => action.content),
        objective,
        userProblemStatement,
        language,
        profile_id
      );
      // setIsLoading(false);

      if (validate_response?.result === false) {
        setErrorText(validate_response?.error_message);
        return;
      }

      if (actionList) {
        // setIsLoading(true);
        handleLoaderState(LOADER_KEYS.LOAD_WEEKS_SELECTION, true);
        setEncodedSessionStorage("selected_action", actionListToStore);
        const currentSession = getEncodedSessionStorage("session");
        const botMessage = {
          role: thirdpage_messages[7]?.[0]?.role,
          message:
            thirdpage_messages[6]?.[0]?.message +
            "\n" +
            thirdpage_messages[7]?.[0]?.message +
            "\n" +
            thirdpage_messages[7]?.[1]?.message +
            "\n" +
            JSON.stringify(getEncodedSessionStorage("actionList")),
          messageId: thirdpage_messages[7]?.[0]?.messageId,
        };

        saveUserChatsInDB(botMessage?.message, currentSession, botMessage?.role)
          .then(() => {
            saveUserChatsInDB(
              JSON.stringify(action_to_store),
              currentSession,
              "user"
            );
          })
          .then(() => {
            setErrorText("");
            setCurrentPageValue(3);
            // setIsLoading(false);
          });
      }
    } catch (error) {
      const errorMessage =
        getEncodedSessionStorage("system_error") || "Please try again later!";
      setErrorText(errorMessage);
      // setIsLoading(false);
      setTimeout(() => {
        setErrorText("");
      }, 10000);
      handleLoaderState(LOADER_KEYS.LOAD_WEEKS_SELECTION, false);
      console.error(error);
    } finally {
      handleLoaderState(LOADER_KEYS.LOAD_WEEKS_SELECTION, false);
    }
  };

  if (getLoaderState(LOADER_KEYS.FETCH_ACTION_LIST)) {
    return <LoadingChat />;
  }

  return (
    <>
      <div>
        {(!hasClickedOnAddmore &&
          !wantsToMoveForward &&
          actionList &&
          !isLoading) ||
        !isSelectActionItems ? (
          <div>
            <BotMessage
              primaryMessage={thirdpage_messages[6]?.[0]?.message}
              secondaryMessage={thirdpage_messages[6]?.[1]?.message}
              customClassNames={{ wrapperStyles: "pb-3" }}
            />
            <ActionItemsList
              language={language}
              visibleCount={visibleCount}
              selectedIndex={selectedIndex}
              actionList={actionList}
              handleLeftArrowClick={handleLeftArrowClick}
              handleRightArrowClick={handleRightArrowClick}
              fetchError={fetchError}
              swipeDirection={swipeDirection}
              isViewMode={!isSelectActionItems}
              finalActionList={getActionListArray()}
            />
            <Source
              source={actionItemSource}
              customClassNames={{
                wrapperStyles: "md:!w-[60%] md:min-w-[570px]",
              }}
            />
            {isSelectActionItems && (
              <>
                <SuggestOrAddCta
                  handleSuggestMore={handleSuggestMore}
                  handleAddOwnClick={() => setHasClickedOnAddmore(true)}
                  language={language}
                  showSuggestMoreButton={
                    !visibleCount && actionList?.length > 1
                  }
                  showAddOwnButton={false}
                />
                <div className="thirdpage-next-div">
                  <button
                    className={`thirdpage-select-bttn mt-14`}
                    onClick={() => {
                      setWantsToMoveForward(true);
                    }}
                  >
                    {getSelectButtonTranslation(language)}
                    <IoArrowForward className="thirdpage-cont-arrow-icon" />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <FinalActionPage
              actionListArray={getActionListArray()}
              isBotTalking={isBotTalking}
              handleSpeakerOn={handleSpeakerOn}
              handleSpeakerOff={handleSpeakerOff}
              handleContinueClick={handleContinueClick}
              errorText={errorText}
              hasClickedOnAddmore={hasClickedOnAddmore}
              isSelectActionItems={isSelectActionItems}
            />
          </>
        )}
      </div>
      {!isSelectActionItems && <UserMessage message="Next" />}
    </>
  );
}

export default ActionItems;

export function FinalActionPage({
  actionListArray,
  isBotTalking,
  handleSpeakerOn,
  handleSpeakerOff,
  handleContinueClick,
  errorText,
  hasClickedOnAddmore,
  isSelectActionItems,
}) {
  const [actionList, setActionList] = useState(actionListArray || []);
  const preferredLanguage = JSON.parse(
    getEncodedSessionStorage("preferred_language") || "{}"
  );
  const language = preferredLanguage.value || "en";

  const thirdpage_messages = getThirdPageMessages(
    language,
    hasClickedOnAddmore
  );

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
      prev.map((item) => (item.id === id ? { ...item, content: value } : item))
    );
  };

  const handleDelete = (id) => {
    if (actionList && actionList.length <= 1) return;
    setActionList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddAction = () => {
    setActionList((prev) => [
      ...prev,
      { id: Date.now().toString(), content: "" },
    ]);
  };

  useEffect(() => {}, [actionList]);

  return (
    <div className="final-action-page">
      <BotMessage
        primaryMessage={thirdpage_messages[7]?.[0]?.message}
        secondaryMessage={thirdpage_messages[7]?.[1]?.message}
      />
      <div className="secondpage-obj-fixed">
        <div className="secondpage-obj-div">
          <p className="secondpage-obj-text">
            {getActionListTextTranslation(language)}
          </p>
          <div className="thirdpage-error-div">
            <p className="secondpage-valid-text">
              {getActionErrorTranslation(language)}
            </p>
          </div>
          {errorText && errorText !== "" && (
            <>
              <div className="thirdpage-error-div">
                <p className="secondpage-error-text">{errorText}</p>
              </div>
            </>
          )}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="actionList">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {actionList.map((action, index) => (
                    <Draggable
                      key={action.id}
                      draggableId={action.id}
                      index={index}
                      isDragDisabled={!isSelectActionItems}
                      disableInteractiveElementBlocking={!isSelectActionItems}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="action-box"
                        >
                          <div className="drag-handle">
                            <span>
                              <PiDotsSixVerticalBold className="drag-icon" />{" "}
                            </span>
                          </div>
                          <input
                            type="text"
                            placeholder={getActionPlaceholderTranslation(
                              language
                            )}
                            disabled={!isSelectActionItems}
                            value={action?.content}
                            className="final-action-input"
                            onChange={(e) =>
                              handleInputChange(action.id, e.target.value)
                            }
                          />
                          {actionList && actionList.length > 1 ? (
                            <FiTrash2
                              className="delete-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isSelectActionItems) {
                                  handleDelete(action.id);
                                }
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              disabled={!isSelectActionItems}
                            />
                          ) : (
                            <TbTrashOff className="delete-icon-disable" />
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {isSelectActionItems && (
            <>
              <div className="secondpage-add-div1">
                <button
                  className="secondpage-add-bttn"
                  onClick={() => {
                    handleAddAction();
                  }}
                >
                  <FiPlusCircle className="secondpage-plus-icon" />
                  {getAddActionButtonTranslation(language)}
                </button>
              </div>
              <div className="thirdpage-continue-div">
                <button
                  className="thirdpage-select-bttn"
                  onClick={() => {
                    handleContinueClick(actionList);
                  }}
                >
                  {hasClickedOnAddmore
                    ? getContinueButtonTranslation(language)
                    : getNextButtonTranslation(language)}
                  <IoArrowForward className="thirdpage-cont-arrow-icon" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
