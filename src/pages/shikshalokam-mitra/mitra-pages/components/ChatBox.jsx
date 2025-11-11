import React, { useState } from "react";
import { FaMicrophone, FaRegStopCircle } from "react-icons/fa";
import { MdAccountCircle, MdEdit, MdSend } from "react-icons/md";

function ChatBox({
  textInputRef,
  textMessage,
  handleOnInputText,
  setUseTextbox,
  placeholder = "Describe your challenge here...",
  autoFocus = true,
  handleSendMessage,
  styles = {},
  disabled = false,
}) {
  const [isFocused, setIsFocused] = useState(false);

  const { formStyles = "", inputStyles = "", voiceButtonStyles = "", sendButtonStyles = "" } = styles;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const shouldShowWhiteBg =
    isFocused || (textMessage && textMessage.length > 0);

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
        placeholder={placeholder}
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
      <button disabled={disabled} className={voiceButtonStyles}>
        <FaMicrophone className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] lg:w-[24px] lg:h-[24px]" />
      </button>
      <button disabled={disabled} type="submit" className={sendButtonStyles}>
        <MdSend className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] lg:w-[24px] lg:h-[24px]" />
      </button>
    </form>
  );
}

export default ChatBox;
