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
      className={`cursor-pointer flex items-center gap-[10px] w-full sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[600px] max-w-full sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[600px] h-[46px] rounded-[50px] border border-[#DDDDDD] py-3 px-4 mx-auto ${
        shouldShowWhiteBg ? "bg-white" : "bg-[#F0F2F5]"
      } ${formStyles}`}
    >
      <input
        ref={textInputRef}
        type="text"
        id="chat-box-textarea"
        className={`w-full sm:w-[320px] md:w-[400px] lg:w-[490px] xl:w-[490px] max-w-full sm:max-w-[320px] md:max-w-[400px] lg:max-w-[490px] xl:max-w-[490px] rounded-lg h-[24px] resize-none outline-none focus:outline-none border-0 bg-transparent placeholder:font-normal placeholder:text-base placeholder:text-[#AAAAAA] font-normal text-base leading-[100%] text-[#101010] ${inputStyles}`}
        placeholder={placeholder}
        autoFocus={autoFocus}
        value={textMessage}
        onChange={handleOnInputText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            try {
              e.preventDefault();
              console.log("pankaj enter key pressed", e.target.form);
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
      <button className={voiceButtonStyles}>
        <FaMicrophone className="w-[24px] h-[24px]" />
      </button>
      <button type="submit" className={sendButtonStyles}>
        <MdSend className="w-[24px] h-[24px]" />
      </button>
    </form>
  );
}

export default ChatBox;
