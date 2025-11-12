import React, { useState, useMemo } from "react";
import { FaMicrophone, FaRegStopCircle } from "react-icons/fa";
// import { MdSend } from "react-icons/lu";

import { MdSend } from "react-icons/md";
import { FaCircle } from "react-icons/fa6";
import { IoMicOutline } from "react-icons/io5";


const formatTime = (secs) => {
  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

function ChatBox({
  textInputRef,
  textMessage,
  handleOnInputText,
  setUseTextbox,
  placeholder = "Describe your challenge here...",
  autoFocus = false,
  handleSendMessage,
  styles = {},
  disabled = false,
  hasStartedRecording = false,
  startRecording,
  stopRecording,
  isFetchingData = false,
  seconds,
}) {
  const [isFocused, setIsFocused] = useState(false);

  const {
    formStyles = "",
    inputStyles = "",
    voiceButtonStyles = "",
    sendButtonStyles = "",
  } = styles;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const disableVoiceButton =
    (textMessage && textMessage?.trim()?.length > 0) || isFetchingData;
  const disableSendButton =
    !textMessage || textMessage?.trim()?.length === 0 || disabled;

  const shouldShowWhiteBg =
    isFocused || (textMessage && textMessage.length > 0);

  const inputPlaceholderText = useMemo(() => {
    if (isFetchingData) return "Processing... Please wait";
    if (hasStartedRecording) return "Listening... Speak now";
    return placeholder;
  }, [hasStartedRecording, isFetchingData, placeholder]);

  return (
    <form
      onSubmit={handleSendMessage}
      autoComplete="off"
      className={`cursor-pointer flex items-center gap-[10px] h-[46px] rounded-[50px] border border-[#DDDDDD] py-3 px-4 mx-auto w-full md:w-[80%] lg:w-[70%] ${
        shouldShowWhiteBg ? "bg-white" : "bg-[#F0F2F5]"
      } ${formStyles}`}
    >
      <input
        ref={textInputRef}
        type="text"
        id="chat-box-textarea"
        className={`rounded-lg h-[24px] resize-none outline-none focus:outline-none border-0 bg-transparent placeholder:font-normal placeholder:text-base placeholder:text-[#AAAAAA] font-normal text-base leading-[100%] text-[#101010] w-[90%] ${inputStyles}`}
        placeholder={inputPlaceholderText}
        autoFocus={autoFocus}
        value={textMessage}
        onChange={handleOnInputText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            try {
              e.preventDefault();
              e.target.form.requestSubmit();
              setTimeout(() => {
                e.target.value = "";
              }, 0);
            } catch (error) {
              console.error("Error handling text:", error);
            } finally {
              setUseTextbox(false);
            }
          }
        }}
      />
      {hasStartedRecording && (
        <div className="flex items-center space-x-1 text-red-600 text-sm font-medium pointer-events-none">
          <FaCircle className="text-red-500 animate-pulse w-[10px] h-[10px] text-xs" />
          <span>{formatTime(seconds)}</span>
        </div>
      )}
      <button
        disabled={disableVoiceButton}
        className={`${
          hasStartedRecording ? "text-red-500" : "text-black"
        } disabled:text-[#64748b] disabled:cursor-not-allowed cursor-pointer ${voiceButtonStyles}`}
        onClick={hasStartedRecording ? stopRecording : startRecording}
      >
        {hasStartedRecording ? (
          <FaRegStopCircle className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] lg:w-[24px] lg:h-[24px]" />
        ) : (
          <IoMicOutline className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] lg:w-[28px] lg:h-[28px]" />
        )}
      </button>
      <button
        disabled={disableSendButton}
        type="submit"
        className={`disabled:cursor-not-allowed disabled:text-[#64748b] cursor-pointer ${sendButtonStyles}`}
      >
        <MdSend className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] lg:w-[26px] lg:h-[26px]" />
      </button>
    </form>
  );
}

export default ChatBox;
