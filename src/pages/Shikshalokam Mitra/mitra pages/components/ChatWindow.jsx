import ChatMessage from "./chat-message/ChatMessage";

const LoadingChat = () => (
  <div>
    <img
      className="h-14"
      src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/loading%20animation.gif"
    />
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
  isDefineChallengeSection,
}) {
  const getShowLoadingChat = (indexNumber) => {
    return (
      isDefineChallengeSection &&
      !hasStartedListening &&
      chatHistory[chatHistory?.length - 1].source === "user" &&
      indexNumber === chatHistory?.length - 1 &&
      !isReadOnly
    );
  };
  return (
    <div className={`h-[${!isDefineChallengeSection ? "100%" : "90%"}]`}>
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
                  setNotMute(false);
                  handleOnSpeaking(`${chat?.msg}`, chat?.updated_at);
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
            {getShowLoadingChat(i) && <LoadingChat />}
          </li>
        ))}
      </ul>
      <div id="last-chat-boundary" className="div38" />
    </div>
  );
}

export default ChatWindow;
