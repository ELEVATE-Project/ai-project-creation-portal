import { useMemo } from "react";
import ChatMessage from "./chat-message/ChatMessage";
import LoadingChat from "./LoadingChat";

function ChatWindow({
  isTalking,
  handleOnSpeaking,
  handleOnStopSpeaking,
  botNameToDisplay,
  isStreamingComplete,
  setNotMute,
  userDetail,
  chatHistory,
  hasStartedListening,
  hasOverRideId,
  isDefineChallengeSection,
}) {
  const isReadOnly = !isDefineChallengeSection;
  const getShowLoadingChat = (indexNumber) => {
    return (
      isDefineChallengeSection &&
      !hasStartedListening &&
      chatHistory[chatHistory?.length - 1].source === "user" &&
      indexNumber === chatHistory?.length - 1 &&
      !isReadOnly
    );
  };

  const chatsToShow = useMemo(() => {
    const data = [];
    let shouldPush = true;
    chatHistory?.forEach((chat) => {
      if (shouldPush) {
        data.push(chat);
        if (chat?.shouldMoveForward === "yes" && chat?.source === "user") {
          shouldPush = false;
        }
      }
    });
    return data;
  }, [chatHistory]);

  return (
    <div className={`h-[${!isDefineChallengeSection ? "100%" : "90%"}]`}>
      <ul className="div34">
        {chatsToShow?.map((chat, i) => (
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
