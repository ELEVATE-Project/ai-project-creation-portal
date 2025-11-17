import React, { useEffect, useState } from "react";
import { IoArrowForward } from "react-icons/io5";
import BotMessage from "./components/chat-message/BotMessage";
import Slider from "../../../components/Slider/slider";

import "../stylesheet/chatStyle.css";
import {
  getEncodedSessionStorage,
  setEncodedSessionStorage,
} from "../../../utils/storage_utils";
import { getFourthPageMessages } from "../question script/bot_user_questions";
import { saveUserChatsInDB } from "../../../apiServices/chat_flow_api";
import { getNextButtonTranslation } from "../question script/secondpage_tanslation";
import UserMessage from "./components/chat-message/UserMessage";
import LoadingChat from "./components/LoadingChat";
import { LOADER_KEYS } from "../../../constants/common";

function WeeksSelection({
  isBotTalking,
  handleSpeakerOn,
  handleSpeakerOff,
  setIsLoading,
  isLoading,
  handleGoBack,
  handleGoForward,
  setCurrentPageValue,
  setChatHistory,
  isWeeksSelectionSection = false,
  handleScrollIntoView,
  handleLoaderState,
  getLoaderState,
}) {
  const [selectedWeek, setSelectedWeek] = useState(
    getEncodedSessionStorage("selected_week") || 1
  );
  const [isInReadOnlyMode, setIsInReadOnlyMode] = useState(
    getEncodedSessionStorage("selected_week") ? true : false
  );

  const preferredLanguage = JSON.parse(
    getEncodedSessionStorage("preferred_language") || "{}"
  );
  const language = preferredLanguage.value || "en";

  const fourthpage_messages = getFourthPageMessages(language);

  useEffect(() => {
    if (isWeeksSelectionSection) handleScrollIntoView();
  }, []);

  useEffect(() => {
    if (isInReadOnlyMode) {
      // setIsLoading(true);
      localStorage.removeItem("selected_week");
      localStorage.removeItem("project_title");
      // setIsLoading(false);
    }
  }, [isInReadOnlyMode]);

  const handleSliderChange = (value) => {};

  const handleContinueClick = async () => {
    if (selectedWeek) {
      // setIsLoading(true);
      setEncodedSessionStorage("selected_week", selectedWeek);
      const botMessage =
        fourthpage_messages[8]?.[0]?.message +
        " " +
        fourthpage_messages[8]?.[1]?.message;
      const currentSession = getEncodedSessionStorage("session");

      saveUserChatsInDB(botMessage, currentSession, "bot")
        .then(() => {
          saveUserChatsInDB(
            JSON.stringify(selectedWeek),
            currentSession,
            "user"
          );
        })
        .then(() => {
          setCurrentPageValue(4);
        });
    }
  };

  if (getLoaderState(LOADER_KEYS.LOAD_WEEKS_SELECTION)) {
    return <LoadingChat />;
  }

  return (
    <>
      <div>
        <BotMessage
          primaryMessage={fourthpage_messages[8]?.[0]?.message}
          secondaryMessage={fourthpage_messages[8]?.[1]?.message}
        />
        <Slider
          min={1}
          max={6}
          onValueChange={handleSliderChange}
          value={selectedWeek}
          setValue={setSelectedWeek}
          isDisabled={!isWeeksSelectionSection}
        />
        {isWeeksSelectionSection ? (
          <div className="fourthpage-next-div">
            <button
              className={`thirdpage-select-bttn`}
              onClick={handleContinueClick}
            >
              {getNextButtonTranslation(language)}

              <IoArrowForward className="thirdpage-cont-arrow-icon" />
            </button>
          </div>
        ) : (
          <UserMessage message="Next" />
        )}
      </div>
    </>
  );
}

export default WeeksSelection;
