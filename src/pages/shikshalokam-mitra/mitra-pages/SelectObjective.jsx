import React, { useState, useEffect } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { IoArrowForward } from "react-icons/io5";
// import { BotMessage } from "../chatMessage";
import BotMessage from "./components/chat-message/BotMessage";
import { RxCrossCircled } from "react-icons/rx";
import Header from "../header/Header";
import { getNewLocalTime, ShowLoader } from "../MainPage";
import {
  getEncodedSessionStorage,
  setEncodedSessionStorage,
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
import { transformSource } from "../../../utils/mitra-chat";

const DUMMY_OBJECTIVES = [
  {
    "text": "Implement a daily cleaning schedule to ensure classrooms remain consistently clean.",
    "source": {
      "source_id": "201",
      "chunk": "CL1",
      "description": "Cleanliness improvement initiative",
      "title": "Daily Cleaning Plan",
      "url": "https://example.org/clean1",
      "organization": "A"
    }
  },
  {
    "text": "Introduce student cleanliness responsibility groups to maintain tidiness throughout the day.",
    "source": {
      "source_id": "202",
      "chunk": "CL2",
      "description": "Student-led maintenance plan",
      "title": "Cleanliness Squad",
      "url": "https://example.org/clean2",
      "organization": "B"
    }
  },
  {
    "text": "Ensure availability of adequate cleaning supplies in every classroom.",
    "source": {
      "source_id": "203",
      "chunk": "CL3",
      "description": "Supplies and hygiene support",
      "title": "Classroom Supplies Initiative",
      "url": "https://example.org/clean3",
      "organization": "C"
    }
  },
  {
    "text": "Increase janitorial staff frequency during peak classroom usage hours.",
    "source": {
      "source_id": "204",
      "chunk": "CL4",
      "description": "Staff deployment improvement",
      "title": "Janitorial Frequency Upgrade",
      "url": "https://example.org/clean4",
      "organization": "A"
    }
  },
  {
    "text": "Place waste bins in accessible classroom locations to reduce littering.",
    "source": {
      "source_id": "205",
      "chunk": "CL5",
      "description": "Waste management plan",
      "title": "Bin Placement Optimization",
      "url": "https://example.org/clean5",
      "organization": "D"
    }
  },
  {
    "text": "Run weekly cleanliness awareness campaigns for students and teachers.",
    "source": {
      "source_id": "206",
      "chunk": "CL6",
      "description": "Awareness campaign",
      "title": "Cleanliness Awareness Week",
      "url": "https://example.org/clean6",
      "organization": "B"
    }
  },
  {
    "text": "Introduce an inspection and monitoring system to track classroom cleanliness.",
    "source": {
      "source_id": "207",
      "chunk": "CL7",
      "description": "Monitoring initiative",
      "title": "Cleanliness Monitoring",
      "url": "https://example.org/clean7",
      "organization": "C"
    }
  },
  {
    "text": "Encourage teachers to integrate cleanliness rules into classroom routines.",
    "source": {
      "source_id": "208",
      "chunk": "CL8",
      "description": "Teacher participation system",
      "title": "Routine Clean Rules",
      "url": "https://example.org/clean8",
      "organization": "A"
    }
  },
  {
    "text": "Implement a reward system for classrooms that maintain high cleanliness standards.",
    "source": {
      "source_id": "209",
      "chunk": "CL9",
      "description": "Incentive program",
      "title": "Clean Classroom Awards",
      "url": "https://example.org/clean9",
      "organization": "E"
    }
  },
  {
    "text": "Improve ventilation systems to reduce dust accumulation in classrooms.",
    "source": {
      "source_id": "210",
      "chunk": "CL10",
      "description": "Hygiene and air quality improvement",
      "title": "Ventilation Upgrade",
      "url": "https://example.org/clean10",
      "organization": "B"
    }
  },
  {
    "text": "Ensure broken desks, windows, and fixtures are repaired to prevent dirt buildup.",
    "source": {
      "source_id": "211",
      "chunk": "CL11",
      "description": "Maintenance initiative",
      "title": "Repair and Clean Plan",
      "url": "https://example.org/clean11",
      "organization": "D"
    }
  },
  {
    "text": "Create classroom cleaning rotation charts involving teachers and students.",
    "source": {
      "source_id": "212",
      "chunk": "CL12",
      "description": "Participation-based system",
      "title": "Rotation Clean Plan",
      "url": "https://example.org/clean12",
      "organization": "C"
    }
  },
  {
    "text": "Install signage promoting cleanliness habits within classrooms.",
    "source": {
      "source_id": "213",
      "chunk": "CL13",
      "description": "Environmental messaging initiative",
      "title": "Clean Habits Posters",
      "url": "https://example.org/clean13",
      "organization": "A"
    }
  },
  {
    "text": "Schedule monthly deep-cleaning sessions for all classrooms.",
    "source": {
      "source_id": "214",
      "chunk": "CL14",
      "description": "Deep cleaning program",
      "title": "Monthly Deep Clean",
      "url": "https://example.org/clean14",
      "organization": "E"
    }
  },
  {
    "text": "Train janitorial staff on improved cleaning techniques and procedures.",
    "source": {
      "source_id": "215",
      "chunk": "CL15",
      "description": "Staff training initiative",
      "title": "Janitorial Training",
      "url": "https://example.org/clean15",
      "organization": "B"
    }
  },
  {
    "text": "Develop a digital reporting tool for students and teachers to report cleanliness issues.",
    "source": {
      "source_id": "216",
      "chunk": "CL16",
      "description": "Digital system development",
      "title": "Cleanliness Reporting App",
      "url": "https://example.org/clean16",
      "organization": "C"
    }
  },
  {
    "text": "Introduce color-coded storage areas to reduce clutter buildup.",
    "source": {
      "source_id": "217",
      "chunk": "CL17",
      "description": "Organization improvement",
      "title": "Color-Coded Storage",
      "url": "https://example.org/clean17",
      "organization": "D"
    }
  },
  {
    "text": "Add doormats at classroom entrances to minimize dirt tracked inside.",
    "source": {
      "source_id": "218",
      "chunk": "CL18",
      "description": "Dirt reduction measure",
      "title": "Entrance Mat Program",
      "url": "https://example.org/clean18",
      "organization": "A"
    }
  },
  {
    "text": "Implement waste segregation bins to improve cleanliness and hygiene.",
    "source": {
      "source_id": "219",
      "chunk": "CL19",
      "description": "Segregation initiative",
      "title": "Segregated Waste System",
      "url": "https://example.org/clean19",
      "organization": "E"
    }
  },
  {
    "text": "Set up regular audits to measure improvements in classroom cleanliness.",
    "source": {
      "source_id": "220",
      "chunk": "CL20",
      "description": "Audit and evaluation program",
      "title": "Cleanliness Audit",
      "url": "https://example.org/clean20",
      "organization": "C"
    }
  }
]


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
    const storedObjective = getEncodedSessionStorage("objective");

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
    const storedObjective = getEncodedSessionStorage("selected_objective");
    if (storedObjective) {
      return typeof storedObjective === "string" ? true : false;
    }
  });
  const [objectiveSource, setObjectiveSource] = useState({});
  useEffect(() => {
    const storedObjectiveSource = getEncodedSessionStorage("objective_source");
    if (storedObjectiveSource) {
      setObjectiveSource(JSON.parse(storedObjectiveSource));
    }
  }, []);
  const [visibleCount, setVisibleCount] = useState(() => {
    const defaultValueToShow = 3;
    if (!isInReadOnlyMode) {
      return defaultValueToShow;
    } else {
      const objectiveList = getEncodedSessionStorage("objective") || [];
      const selectedObjective = getEncodedSessionStorage("selected_objective");

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
    getEncodedSessionStorage("preferred_language") || "{}"
  );
  const language = preferredLanguage.value || "en";

  const secondpage_messages = getSecondPageMessages(language);

  useEffect(() => {
    async function fetchObjectiveList() {
      try {
        if (!objectiveList || objectiveList?.length === 0) {
          setIsLoading(true);
          const userProblemStatement = getEncodedSessionStorage(
            "user_problem_statement"
          );
          const profile_id = getEncodedSessionStorage("profileid");
          // const fetched_objectiveList = {
          //   objective_list: DUMMY_OBJECTIVES,
          //   chunks: [],
          // };
          const fetched_objectiveList = await getObjectiveList(
            userProblemStatement,
            language,
            profile_id
          );
          if (fetched_objectiveList) {
            setObjectiveList(fetched_objectiveList?.objective_list);
            setEncodedSessionStorage(
              "objective",
              fetched_objectiveList?.objective_list
            );

            const transformedSource = transformSource(
              fetched_objectiveList?.objective_list
            );

            setEncodedSessionStorage(
              "objective_source",
              JSON.stringify(transformedSource)
            );
            setObjectiveSource(transformedSource);
            // localStorage.setItem(
            //   "chunks",
            //   JSON.stringify(fetched_objectiveList?.chunks)
            // );
            setEncodedSessionStorage(
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
          getEncodedSessionStorage("system_error") || "Please try again later!"
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
      setInputText(getEncodedSessionStorage("selected_objective") || "");
      setHasClickedOnAddmore(getEncodedSessionStorage("hasClickedObjAddMore"));
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
      setEncodedSessionStorage("selected_objective", inputText);
      const currentSession = getEncodedSessionStorage("session");
      const botMessage = hasClickedOnAddmore
        ? secondpage_messages[5]?.[0]
        : {
            role: secondpage_messages[4]?.[0]?.role,
            message:
              secondpage_messages[4]?.[0]?.message +
              " " +
              secondpage_messages[4]?.[1]?.message +
              " " +
              JSON.stringify(getEncodedSessionStorage("objective")),
            messageId: secondpage_messages[4]?.[0]?.messageId,
          };

      const chunks = JSON.parse(getEncodedSessionStorage("chunks"));

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
        const profile_id = getEncodedSessionStorage("profileid");
        const validate_response = await validateObjective(
          inputText,
          language,
          profile_id
        );
        setIsLoading(false);
        if (validate_response?.result) {
          setEncodedSessionStorage("hasClickedObjAddMore", true);
          handleNextClick();
        } else {
          setErrorText(validate_response?.error_message);
        }
      }
    } catch (error) {
      const errorMessage =
        getEncodedSessionStorage("system_error") || "Please try again later!";

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
      setEncodedSessionStorage("hasClickedObjAddMore", false);
    } else {
      handleGoBack(index);
    }
  }

  const selectedObjective = getEncodedSessionStorage("selected_objective");

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
                    objectiveSource={objectiveSource}
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
