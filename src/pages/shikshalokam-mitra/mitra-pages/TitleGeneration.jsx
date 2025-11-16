import React, { useEffect, useState } from "react";
import BotMessage from "./components/chat-message/BotMessage";

import "../stylesheet/chatStyle.css";
import Header from "../header/Header";
import { clearMitraLocalStorage, ShowLoader } from "../MainPage";
import {
  getEncodedSessionStorage,
  setEncodedSessionStorage,
} from "../../../utils/storage_utils";
import {
  createProject,
  getTitle,
  saveUserChatsInDB,
  updateChatSession,
  validateTitle,
} from "../../../apiServices/chat_flow_api";
import { getFifthPageMessages } from "../question script/bot_user_questions";
import { useNavigate } from "react-router-dom";
import { getCreateMicroButtonTranslation } from "../question script/thirdpage_tanslation";
import {
  getCreateLoadingTranslation,
  getEmptyTitleErrorTranslation,
  getTitleErrorTranslation,
  getTitleNumberTranslation,
  getTitlePlaceholderTranslation,
} from "../question script/fifthpage_translation";
import ErrorText from "./components/ErrorText";
import LoadingChat from "./components/LoadingChat";
import UserMessage from "./components/chat-message/UserMessage";
import FileViewer from "../../../components/file-viewer";

function TitleGeneration({
  isBotTalking,
  handleSpeakerOn,
  handleSpeakerOff,
  currentChatValue,
  setCurrentChatValue,
  setIsLoading,
  isLoading,
  handleGoBack,
}) {
  const [inputText, setInputText] = useState(() => {
    let title = getEncodedSessionStorage("project_title") || "";
    return title;
  });

  const titleCharacterLimit = 100;

  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [shouldDisableButton, setShouldDisableButton] = useState(false);
  const [media, setMedia] = useState([]);
  const [isApiCalling, setIsApiCalling] = useState(false);

  const preferredLanguage = JSON.parse(
    getEncodedSessionStorage("preferred_language") || "{}"
  );
  const language = preferredLanguage.value || "en";
  const [fetchError, setFetchError] = useState("");

  const fifthpage_messages = getFifthPageMessages(language);
  const [localErrorText, setLocalErrorText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTitle() {
      try {
        let title = getEncodedSessionStorage("project_title");
        if (!title) {
          const user_problem_statement = getEncodedSessionStorage(
            "user_problem_statement"
          );
          const user_objective = getEncodedSessionStorage("selected_objective");
          const user_action_list = getEncodedSessionStorage("selected_action");
          const profile_id = getEncodedSessionStorage("profileid");
          title = await getTitle(
            user_problem_statement,
            user_objective,
            user_action_list,
            language,
            profile_id
          );
          if (title) {
            setInputText(title);
            setEncodedSessionStorage("project_title", title);
          } else {
            window.location.reload();
          }
        }
        setIsLoading(false);
      } catch (error) {
        setFetchError(
          getEncodedSessionStorage("system_error") || "Please try again later!"
        );
        setIsLoading(false);
        console.error(error);
      }
    }
    fetchTitle();
  }, []);

  function handleInputText(e) {
    const newText = e?.target?.value;
    const specialCharRegex = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~₹]/;
    if (specialCharRegex.test(newText)) {
      setShouldDisableButton(true);
      setLocalErrorText(getTitleNumberTranslation(language));
    } else if (newText.length > titleCharacterLimit) {
      setShouldDisableButton(true);
      setLocalErrorText(getTitleErrorTranslation(language));
    } else if (newText === "") {
      setShouldDisableButton(true);
      setLocalErrorText(getEmptyTitleErrorTranslation(language));
    } else {
      setShouldDisableButton(false);
    }

    setInputText(newText);
  }

  useEffect(() => {
    const textarea = document.getElementById("autoGrow");

    const adjustHeight = () => {
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    adjustHeight();

    textarea?.addEventListener("input", adjustHeight);

    return () => textarea?.removeEventListener("input", adjustHeight);
  }, [inputText]);

  async function handleCreateImprovement() {
    if (
      currentChatValue === 7 &&
      inputText &&
      inputText !== "" &&
      inputText.length <= titleCharacterLimit &&
      !shouldDisableButton
    ) {
      // setIsLoading(true);
      setIsApiCalling(true);
      const user_problem_statement = getEncodedSessionStorage(
        "user_problem_statement"
      );
      const user_objective = getEncodedSessionStorage("selected_objective");
      const user_action_list = getEncodedSessionStorage("selected_action");
      const profile_id = getEncodedSessionStorage("profileid");
      const validate_response = await validateTitle(
        inputText,
        user_problem_statement,
        user_objective,
        user_action_list,
        language,
        profile_id
      );
      setIsApiCalling(false);
      if (validate_response?.result) {
      } else {
        setLocalErrorText(validate_response?.error_message);
        return;
      }
      setIsLocalLoading(true);
      setEncodedSessionStorage("project_title", inputText);
      const session = getEncodedSessionStorage("session");
      const field_to_update = {
        title: inputText,
        session_status: "COMPLETED",
      };

      const botMessage = {
        message:
          fifthpage_messages[9]?.[0]?.message +
          " " +
          fifthpage_messages[9]?.[1]?.message,
        role: fifthpage_messages[9]?.[0]?.role,
      };
      await saveUserChatsInDB(botMessage?.message, session, botMessage?.role);
      await saveUserChatsInDB(inputText, session, "user");

      try {
        const response = await updateChatSession(session, field_to_update);
        if (response) {
          const user_problem_statement = getEncodedSessionStorage(
            "user_problem_statement"
          );
          const project_duration = getEncodedSessionStorage("selected_week");
          const user_objective = getEncodedSessionStorage("selected_objective");
          const user_action_list =
            getEncodedSessionStorage("selected_action")[0]?.actionSteps;
          const access_token = getEncodedSessionStorage(
            process.env.REACT_APP_ACCESS_TOKEN_KEY
          );
          const chunks = JSON.parse(getEncodedSessionStorage("chunks"));

          const project_response = await createProject(
            access_token,
            user_problem_statement,
            user_action_list,
            project_duration,
            inputText,
            profile_id,
            session,
            user_objective,
            chunks
          );

          const {
            media = [],
            mitra_result = {},
            status = "",
          } = project_response || {};

          if (media?.length > 0) setMedia(media);

          const { message = "", project_id: projectId = 0 } =
            mitra_result || {};

          if (status?.toLowerCase() === "ok") {
            clearMitraLocalStorage();
            setEncodedSessionStorage("media", media);
            window.location.replace(
              `/create-project${process.env.REACT_APP_ROUTE_IMPROVEMENT_PLAN}`
            );
          }
        }
      } catch (error) {
        console.error("Error: ", error);
        window.location.href = process.env.REACT_APP_ROUTE_LOGIN;
      }
    }
  }

  if (isLoading) {
    return <LoadingChat />;
  }

  return (
    <>
      {/* {isLoading && <ShowLoader />}
      {isLocalLoading && (
        <ShowLoader
          showFirstLoader={false}
          loadingText={getCreateLoadingTranslation(language)}
        />
      )} */}

      {/* <Header
        shouldEnableGoBack={true}
        shouldEnableCross={true}
        handleGoBack={() => handleGoBack(5)}
        shouldEnableGoForward={false}
      /> */}
      <div>
        <BotMessage
          primaryMessage={fifthpage_messages[9]?.[0]?.message}
          secondaryMessage={fifthpage_messages[9]?.[1]?.message}
        />
        {(!fetchError || fetchError === "") && (
          <div className="secondpage-textbox-container sm:w-full md:w-1/2 lg:w-1/2">
            <textarea
              id="autoGrow"
              type="text"
              placeholder={getTitlePlaceholderTranslation(language)}
              className="secondpage-text-input"
              value={inputText}
              onChange={(e) => handleInputText(e)}
              disabled={isApiCalling || media?.length > 0}
            />
          </div>
        )}
        {fetchError && fetchError !== "" && (
          <ErrorText errorText={fetchError} />
        )}
        {localErrorText && localErrorText !== "" && (
          <ErrorText errorText={localErrorText} />
        )}

        {!isApiCalling && media?.length === 0 && (
          <div className="fourthpage-next-div">
            <button
              className={`${
                shouldDisableButton
                  ? "fifthpage-disable-button"
                  : "fifthpage-select-bttn"
              } `}
              onClick={handleCreateImprovement}
            >
              {getCreateMicroButtonTranslation(language)}
            </button>
          </div>
        )}
        {isApiCalling && (
          <>
            <UserMessage message={getCreateMicroButtonTranslation(language)} />
            <LoadingChat />
          </>
        )}
        {media?.length > 0 && (
          <>
            <UserMessage message={getCreateMicroButtonTranslation(language)} />
            <FileViewer
              url={media[0]?.url}
              fileType={media[0]?.media_type}
              visibilityConfig={{
                isShareVisible: true,
                isDownloadVisible: true,
              }}
            />
          </>
        )}
      </div>
    </>
  );
}

export default TitleGeneration;
