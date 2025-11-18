import React from "react";
import ChatBox from "./ChatBox";

export default function InitialConversationCard({
  textInputRef,
  textMessage,
  handleOnInputText,
  setUseTextbox,
  handleSendMessage,
  inputDisabled,
  hasStartedRecording,
  startRecording,
  stopRecording,
  isFetchingData,
  seconds,
}) {
  return (
    <div className="flex flex-col gap-[20px] rounded-[20px] p-[30px] bg-transparent shadow-[0px_2px_4px_0px_#0000000D]">
      <p className="font-medium text-base leading-[24px] text-center text-[#333333]">
        Hello! I'm MItra, your SG-Commons AI assistant. I'm here to help you
        turn your challenge in the Public School and Education ecosystem into a
        focused, actionable plan. To get started, please define your challenge
        statement as clearly as you can.
      </p>
      <ChatBox
        textInputRef={textInputRef}
        textMessage={textMessage}
        handleOnInputText={handleOnInputText}
        setUseTextbox={setUseTextbox}
        handleSendMessage={handleSendMessage}
        disabled={inputDisabled}
        hasStartedRecording={hasStartedRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
        isFetchingData={isFetchingData}
        seconds={seconds}
      />
    </div>
  );
}
