import React, { useEffect, useRef, useState } from "react";
import { handleAI4BharatTTSRequest } from "../../apiServices/ai4bharat_services";
import {
  getEncodedSessionStorage,
  setEncodedSessionStorage,
} from "../../utils/storage_utils";
import DefineChallenge from "./mitra-pages/DefineChallenge";
import Sidebar from "./mitra-pages/components/Sidebar";
import ConversationWrapperCard from "./mitra-pages/components/ConversationWrapperCard";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import ActionItems from "./mitra-pages/ActionItems";
import WeeksSelection from "./mitra-pages/WeeksSelection";
import TitleGeneration from "./mitra-pages/TitleGeneration";
import SelectObjective from "./mitra-pages/SelectObjective";
import { ACTIVE_TABS } from "./constants/mitra.constants";

function MainPage() {
  const [activeTab, setActiveTab] = useState(ACTIVE_TABS.CONVERSATION);
  const [audioCache, setAudioCache] = useState({});
  const [isBotTalking, setIsBotTalking] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(
    getEncodedSessionStorage("isReadOnly") || false
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const [userInput, setUserInput] = useState(
    getEncodedSessionStorage("user_text") || []
  );

  const [chatHistory, setChatHistory] = useState(
    getEncodedSessionStorage("chatHistory") || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [userDetail, setUserDetail] = useState({
    name: sessionStorage.getItem("name"),
    image: sessionStorage.getItem("image"),
    email: sessionStorage.getItem("email"),
  });
  const [errorText, setErrorText] = useState(
    getEncodedSessionStorage("errorText") || ""
  );

  const [currentPage, setCurrentPage] = useState(
    getEncodedSessionStorage("currentPage") || {
      1: true,
      2: false,
      3: false,
      4: false,
      5: false,
    }
  );

  const audioRef = useRef();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setUserDetail({
      name: sessionStorage.getItem("name"),
      image: sessionStorage.getItem("image"),
      email: sessionStorage.getItem("email"),
    });
  }, []);

  useEffect(() => {
    setEncodedSessionStorage("isReadOnly", isReadOnly);
  }, [isReadOnly]);

  useEffect(() => {
    setEncodedSessionStorage("user_text", userInput);
  }, [userInput]);

  useEffect(() => {
    setEncodedSessionStorage("currentPage", currentPage);
  }, [currentPage]);

  function handleSpeakerOn(messageToUse, audioId) {
    if (!messageToUse || !audioId) return;
    setIsBotTalking(true);
    const preferredLanguage = JSON.parse(
      getEncodedSessionStorage("preferred_language") || "{}"
    );
    const language = preferredLanguage.value || "en";

    handleAI4BharatTTSRequest(
      messageToUse,
      audioId,
      language,
      audioCache,
      setAudioCache,
      audioRef,
      setIsBotTalking
    );
  }

  function handleGoBack(key) {
    if (key <= 1) return;
    setIsReadOnly(true);
    setCurrentPage((prevValue) => ({
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      [key - 1]: true,
    }));
  }

  function handleGoForward(key) {
    if (key >= 5) return;
    setIsReadOnly(true);
    setCurrentPage((prevValue) => ({
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      [key + 1]: true,
    }));
  }

  function setCurrentPageValue(key) {
    if (key >= 5) return;
    setCurrentPage((prevValue) => ({
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      [key + 1]: true,
    }));
  }

  function handleSpeakerOff(audioId) {
    if (!audioId) return;
    setIsBotTalking(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }

  const handleScrollIntoView = () => {
    try {
      setTimeout(() => {
        if (scrollContainerRef?.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 0);
    } catch (error) {
      console.error({ error });
    }
  };

  function getCurrentPageView() {
    const components = [];

    // Determine which pages should be shown based on currentPage
    const isDefineChallengeSection = currentPage["1"];
    const isSelectObjectiveSection = currentPage["2"];
    const isSelectActionItems = currentPage["3"];
    const isWeeksSelectionSection = currentPage["4"];
    const isTitleGenerationSection = currentPage["5"];
    // Show DefineChallenge if on page 1 or any later page
    if (
      isDefineChallengeSection ||
      isSelectObjectiveSection ||
      isSelectActionItems ||
      isWeeksSelectionSection ||
      isTitleGenerationSection
    ) {
      components.push(
        <DefineChallenge
          key="first"
          setIsLoading={setIsLoading}
          setCurrentPageValue={setCurrentPageValue}
          isReadOnly={isReadOnly}
          userDetail={userDetail}
          handleGoForward={handleGoForward}
          isDefineChallengeSection={isDefineChallengeSection}
          handleScrollIntoView={handleScrollIntoView}
          scrollRef={scrollContainerRef}
        />
      );
    }

    // Show SelectObjective if on page 2 or any later page
    if (
      isSelectObjectiveSection ||
      isSelectActionItems ||
      isWeeksSelectionSection ||
      isTitleGenerationSection
    ) {
      components.push(
        <SelectObjective
          key="second"
          isBotTalking={isBotTalking}
          handleSpeakerOn={handleSpeakerOn}
          handleSpeakerOff={handleSpeakerOff}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleGoBack={handleGoBack}
          handleGoForward={handleGoForward}
          setCurrentPageValue={setCurrentPageValue}
          setChatHistory={setChatHistory}
          errorText={errorText}
          setErrorText={setErrorText}
          isReadOnly={isReadOnly}
          isSelectObjectiveSection={isSelectObjectiveSection}
          scrollContainerRef={scrollContainerRef}
          handleScrollIntoView={handleScrollIntoView}
        />
      );
    }

    // Show ActionItems if on page 3 or any later page
    if (
      isSelectActionItems ||
      isWeeksSelectionSection ||
      isTitleGenerationSection
    ) {
      components.push(
        <ActionItems
          key="third"
          isBotTalking={isBotTalking}
          handleSpeakerOn={handleSpeakerOn}
          handleSpeakerOff={handleSpeakerOff}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleGoBack={handleGoBack}
          handleGoForward={handleGoForward}
          setCurrentPageValue={setCurrentPageValue}
          setChatHistory={setChatHistory}
          errorText={errorText}
          setErrorText={setErrorText}
          isSelectActionItems={isSelectActionItems}
          handleScrollIntoView={handleScrollIntoView}
        />
      );
    }

    // Show WeeksSelection if on page 4 or any later page
    if (isWeeksSelectionSection || isTitleGenerationSection) {
      components.push(
        <WeeksSelection
          key="fourth"
          isBotTalking={isBotTalking}
          handleSpeakerOn={handleSpeakerOn}
          handleSpeakerOff={handleSpeakerOff}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setCurrentPageValue={setCurrentPageValue}
          handleGoBack={handleGoBack}
          handleGoForward={handleGoForward}
          setChatHistory={setChatHistory}
          chatHistory={chatHistory}
          isWeeksSelectionSection={isWeeksSelectionSection}
          handleScrollIntoView={handleScrollIntoView}
        />
      );
    }

    // Show TitleGeneration if on page 5
    if (isTitleGenerationSection) {
      components.push(
        <TitleGeneration
          key="fifth"
          isBotTalking={isBotTalking}
          handleSpeakerOn={handleSpeakerOn}
          handleSpeakerOff={handleSpeakerOff}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleGoBack={handleGoBack}
          handleScrollIntoView={handleScrollIntoView}
          isTitleGenerationSection={isTitleGenerationSection}
        />
      );
    }

    return components;
  }

  console.log("currentPage", currentPage);

  return (
    <>
      <Header
        isHeroSection={false}
        isBackButton={true}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <main
        className={`w-full sm:[50%] h-[calc(100vh-200px)] md:h-[80vh] flex flex-col md:flex-row relative gap-10 sm:p-0 md:py-24 md:px-8 lg:px-32 xl:px-52 2xl:px-64 ${
          isMobile ? "bg-white" : "bg-[#F0F2F5]"
        }`}
      >
        <Sidebar
          setActiveTab={() => {}}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isMobile={isMobile}
          clearMitraLocalStorage={clearMitraLocalStorage}
        />
        {activeTab === ACTIVE_TABS.CONVERSATION && (
          <ConversationWrapperCard
            scrollRef={currentPage["1"] ? null : scrollContainerRef}
          >
            {getCurrentPageView()}
          </ConversationWrapperCard>
        )}
      </main>
      <Footer />
    </>
  );
}

export default MainPage;

export function ShowLoader({ showFirstLoader = true, loadingText = "" }) {
  return (
    <>
      <div className="login-load-spinner">
        <div className="login-div67">
          {showFirstLoader ? (
            <img
              className="first-loader"
              src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/loading%20animation.gif"
            />
          ) : (
            <img
              className="first-loader"
              src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/second_loader.gif"
            />
          )}
          {loadingText && loadingText !== "" && (
            <p className="loading-icon-text">{loadingText}</p>
          )}
        </div>
      </div>
    </>
  );
}

export function getNewLocalTime() {
  const now = new Date();

  const formattedDate = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });

  const [date, time] = formattedDate.split(", ");
  const [day, month, year] = date.split("/");
  const formattedDateTime = `${year}-${month}-${day} ${time}`;

  return formattedDateTime;
}

export function clearMitraLocalStorage(avoidLogout = false) {
  sessionStorage.removeItem("actionList");
  sessionStorage.removeItem("currentPage");
  sessionStorage.removeItem("isReadOnly");
  sessionStorage.removeItem("objective");
  sessionStorage.removeItem("project_title");
  sessionStorage.removeItem("selected_week");
  sessionStorage.removeItem("session");
  sessionStorage.removeItem("user_problem_statement");
  sessionStorage.removeItem("paraphrased_problem");
  sessionStorage.removeItem("user_text");
  sessionStorage.removeItem("selected_action");
  sessionStorage.removeItem("savedMessages");
  sessionStorage.removeItem("selected_objective");
  sessionStorage.removeItem("savedMessages");
  sessionStorage.removeItem("profile_id");
  sessionStorage.removeItem("chunks");
  sessionStorage.removeItem("errorText");
  sessionStorage.removeItem("hasClickedObjAddMore");
  sessionStorage.removeItem("botName");
  sessionStorage.removeItem("chat-history");
  sessionStorage.removeItem("company");
  sessionStorage.removeItem("first_name");
  sessionStorage.removeItem("intro_message");
  sessionStorage.removeItem("isChatVisible");
  sessionStorage.removeItem("isNewChatOpen");
  sessionStorage.removeItem("profileid");
  sessionStorage.removeItem("route");
  sessionStorage.removeItem("state");
  sessionStorage.removeItem("intro_end_context");
  sessionStorage.removeItem("end_context");
  sessionStorage.removeItem("system_error");
  sessionStorage.removeItem("objective_source");
  sessionStorage.removeItem("action_item_source");
  sessionStorage.removeItem("media");
}
