import ChatMessage from "./chat-message/ChatMessage";

const LoadingChat = () => (
  <div className="div57">
    <div className="div58">
      <div>Replying...</div>
    </div>
  </div>
);
function ChatWindow({
  isTalking,
  handleOnSpeaking,
  handleOnStopSpeaking,
  botNameToDisplay,
  isStreamingComplete,
  setNotMute,
  userDetail,
  chatHistory,
  isReadOnly,
  hasStartedListening,
  hasOverRideId,
}) {
  return (
    <div className="h-[90%] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
      <ul className="div34">
        {chatHistory?.map((chat, i) => (
          <li
            key={i}
            className={`div35 ${chat?.source === "user" ? "label1" : "label1"}`}
          >
            <div className={`div36 ${chat?.source === "user" && "div37"}`}>
              <ChatMessage
                botNameToDisplay={botNameToDisplay}
                userType={chat?.source}
                message={`${chat?.msg}`}
                name={"You"}
                recording={chat?.recording}
                hasAppendix={chat?.recording}
                appendixURL={chat?.appendixURL}
                isTalking={
                  chat.source === "bot" &&
                  !isStreamingComplete &&
                  i === chatHistory.length - 1
                }
                handleOnStopSpeaking={() => handleOnStopSpeaking()}
                handleOnSpeaking={() => {
                  handleOnSpeaking(chat?.msg, chat?.updated_at);
                }}
                isAnyPlaying={!!hasOverRideId || isTalking}
                isPlaying={hasOverRideId === chat?.updated_at}
                isStreamingComplete={isStreamingComplete}
                setNotMute={setNotMute}
                chatId={chat?.updated_at}
                validation={chat?.validation}
                userDetail={userDetail}
              />
            </div>
            {!hasStartedListening &&
            chatHistory[chatHistory?.length - 1].source === "user" &&
            i === chatHistory?.length - 1 &&
            !isReadOnly ? (
              <>
                <LoadingChat />
              </>
            ) : (
              ""
            )}
          </li>
        ))}
      </ul>
      <div id="last-chat-boundary" className="div38" />
    </div>
  );
}

export default ChatWindow;
