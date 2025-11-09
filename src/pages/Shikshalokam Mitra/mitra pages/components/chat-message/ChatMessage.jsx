import React from "react";
import DOMPurify from "dompurify";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { RxSpeakerOff } from "react-icons/rx";
import WaveSurferPlayer from "../../../../text-voice/voice-player";
import { default_wave_surfer_config } from "../../../../text-voice/useVoiceRecord";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { clearMitraLocalStorage } from "../../../MainPage";
import { getExploreTranslation } from "../../../question script/firstpage_translation";
import { CONVERSATION_USER_TYPES } from "../../../constants/mitra.constants";
import BotImage from "./BotImage";
import UserImage from "./UserImage";
import Speaker from "./Speaker";
import BotMessage from "./BotMessage";
import UserMessage from "./UserMessage";

const { USER, BOT } = CONVERSATION_USER_TYPES;

function ChatMessage({
  userType,
  message,
  recording,
  appendixURL,
  isTalking,
  handleOnSpeaking,
  handleOnStopSpeaking,
  isPlaying,
  isStreamingComplete,
  chatId,
  userDetail,
  validation,
  isShowImages = false,
  isShowBotSpeaker = false,
}) {
  let sanitizedContent = DOMPurify.sanitize(message);
  const languageToUse = JSON.parse(localStorage.getItem("route")) || "en";

  const isBotConversation = userType && userType === BOT;
  const isUserConversation = userType && userType === USER;

  return (
    <div>
      {isBotConversation && (
        <BotMessage
          isShowImages={isShowImages}
          isShowBotSpeaker={isShowBotSpeaker}
          isPlaying={isPlaying}
          handleOnSpeaking={handleOnSpeaking}
          handleOnStopSpeaking={handleOnStopSpeaking}
          disableStopButton={!isStreamingComplete}
          disableSpeakButton={!isStreamingComplete}
          primaryMessage={sanitizedContent}
          chatId={chatId}
        />
      )}
      {isUserConversation && (
        <UserMessage
          isShowImages={isShowImages}
          userDetail={userDetail}
          message={sanitizedContent}
          chatId={chatId}
        />
      )}
    </div>
  );
}

export default ChatMessage;

{
  /* {isTalking && <div className="div55">(Typing...)</div>}
            {!!appendixURL?.length && (
              <div>
                <h6 className="h6-1">Resource:</h6>
                {appendixURL?.map((url, index) => (
                  <div key={index} className="div56">
                    {url === "nan" ? (
                      "Not available"
                    ) : (
                      <a
                        key={index}
                        href={url}
                        rel="noreferrer"
                        target="_blank"
                        className="a-1"
                      >
                        {url}
                      </a>
                    )}
                    <br />
                  </div>
                ))}
              </div>
            )}
            {validation === "NO_PROBLEM_STATEMENT" && isBotConversation && (
              <>
                <div className="firstpage-third-div">
                  <button
                    className="firstpage-confirm-button"
                    onClick={() => {
                      clearMitraLocalStorage();
                      window.location.href =
                        process.env.REACT_APP_ROUTE_EXPLORE;
                    }}
                  >
                    {languageToUse && getExploreTranslation(languageToUse)}
                  </button>
                </div>
              </>
            )} */
}
