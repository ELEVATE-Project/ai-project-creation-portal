import React from "react";
import BotImage from "./BotImage";
import Speaker from "./Speaker";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BotMessage = ({
  isShowImages = false,
  isShowBotSpeaker = false,
  isPlaying = false,
  handleOnSpeaking,
  handleOnStopSpeaking,
  disableStopButton = false,
  disableSpeakButton = false,
  primaryMessage = "",
  secondaryMessage = "",
  chatId,
  customClassNames = {},
}) => {
  const { wrapperStyles = "" } = customClassNames;
  return (
    <div className={`flex items-start relative py-7 ${wrapperStyles}`}>
      {!!(isShowImages || isShowBotSpeaker) && (
        <>
          <div className="div42">
            {isShowImages && <BotImage />}
            {isShowBotSpeaker && (
              <Speaker
                isPlaying={isPlaying}
                handleOnStopSpeaking={handleOnStopSpeaking}
                handleOnSpeaking={handleOnSpeaking}
                disableStopButton={disableStopButton}
                disableSpeakButton={disableSpeakButton}
              />
            )}
          </div>
        </>
      )}
      <div id={chatId}>
        {!!primaryMessage?.length && (
          <ReactMarkdown
            children={primaryMessage}
            remarkPlugins={[remarkGfm]}
            className="text-black font-medium text-base leading-6 tracking-normal align-middle"
          />
        )}
        {!!secondaryMessage?.length && (
          <ReactMarkdown
            children={secondaryMessage}
            remarkPlugins={[remarkGfm]}
            className="text-black font-normal text-sm leading-6 tracking-normal align-middle"
          />
        )}
        {/* {showThird && (
            <div className="firstpage-third-div">
              <button
                className="firstpage-confirm-button"
                onClick={() => {
                  setCurrentChatValue((prevValue) => {
                    return prevValue + 2;
                  });
                  setUserInput((prevInput) => [
                    ...prevInput,
                    `${getComfirmButtonTranslation(language)}!`,
                  ]);
                }}
                disabled={currentChatValue > 1}
              >
                {language && getComfirmButtonTranslation(language)}
              </button>
              <button
                className="firstpage-deny-button"
                onClick={() => {
                  setCurrentChatValue((prevValue) => {
                    return prevValue + 1;
                  });
                  setIsUsingMicrophone(false);
                  setUseTextbox(false);
                  setUserInput((prevInput) => [
                    ...prevInput,
                    getDenyButtonTranslation(language),
                  ]);
                }}
                disabled={currentChatValue > 1}
              >
                {language && getDenyButtonTranslation(language)}
              </button>
            </div>
          )}
          {showExplore && (
            <div className="firstpage-third-div">
              <button
                className="firstpage-confirm-button"
                onClick={() => {
                  clearMitraLocalStorage();
                  window.location.href = process.env.REACT_APP_ROUTE_EXPLORE;
                }}
              >
                {language && getExploreTranslation(language)}
              </button>
            </div>
          )} */}
      </div>
    </div>
  );
};

function HtmlMessage({ content, className }) {
  return (
    <p className={className} dangerouslySetInnerHTML={{ __html: content }}></p>
  );
}

export default BotMessage;
