/* eslint-disable react-hooks/exhaustive-deps */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MdAccountCircle,
  MdSend,
} from "react-icons/md";
import { useLocalStorage } from "react-use";
import useVoiceRecord, { default_wave_surfer_config } from "../../text-voice/useVoiceRecord";
import WaveSurferPlayer from "../../text-voice/voice-player";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
// import rehypeRaw from 'rehype-raw';
import { BiLoader } from "react-icons/bi";
import { HiMiniSpeakerWave, HiMiniSpeakerXMark, HiOutlineSpeakerWave } from "react-icons/hi2";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { clearMitraLocalStorage, ShowLoader } from "../MainPage";
import { getExploreTranslation, getInputPlaceholderTranslation, getKeyboardButtonTranslation, getPlaceHolder1, getPlaceHolder2, getPlaceHolder3, getVoiceButtonTranslation, getVoiceStopButtonTranslation } from "../question script/firstpage_translation";
import { getNewSessionID, saveUserChatsInDB } from "../../../api services/chat_flow_api";
import axiosInstance from "../../../utils/axios";
import "../stylesheet/shikshaChatStyle.css"
import { RxKeyboard, RxSpeakerOff } from "react-icons/rx";
import Header from "../header/Header";
import { getEncodedLocalStorage, setEncodedLocalStorage } from "../../../utils/storage_utils";
import { ai4BharatASR, getAI4BharatAudio } from "../../../api services/ai4bharat_services";
import {convertBlobToBase64, convertToWav} from "../../../utils/audio_utils";

const company_bot_list_url = `/api/companybot/`;

const wss_protocol = window.location.protocol === "https:" ? "wss://" : "ws://";


const FirstPageVoiceBasedChat = ({ setIsLoading, setCurrentChatValue, setCurrentPageValue, isReadOnly, userDetail }) => {

    const [profileToUse, setProfileToUse] = useState(localStorage.getItem('profileid') || null);
    const audioRef = useRef();
    const lastBotMessageIndex = useRef(-1);
    let access_token = localStorage.getItem('accToken');

    const [localChatHistory, setLocalChatHistory] = useLocalStorage("chat-history", []);
    const [chatHistory, setChatHistory] = useState(
        !!localChatHistory?.length ? localChatHistory : []
    );
    const [chatSocket, setChatSocket] = useState(null);
    const [textMessage, setTextMessage] = useState("");
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [reconText, setReconText] = useState("");
    const [isStreamingComplete, setIsStreamingComplete] = useState(true);
    const [audioCache, setAudioCache] = useState({});
    const [hasStartedListening, setHasStartedListening] = useState(false);
    const [botNameToDisplay, setBotNameToDisplay] = useState('Bot')
    const [hasStartedRecording, setHasStartedRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [sentences, setSentences] = useState([]);
    const [isNextAllowed, setIsNextAllowed] = useState(true);
    const [isMute, setNotMute] = useState(true);
    const [isTalking, setTalking] = useState(0);
    const [appendix, setAppendix] = useState([]);
    const [hasOverRideId, setHasOverRideId] = useState(null);
    const [shouldFetchIntro, setShouldFetchIntro] = useState(false);
    const [isChatVisible, setIsChatVisible] = useState(() => {
        const storedVisibility = getEncodedLocalStorage('isChatVisible');
        return storedVisibility !== null ? JSON.parse(storedVisibility) : false;
    });
    const [isLocalLoading, setIsLocalLoading] = useState(false);
    const [isIntroLoading, setIsIntroLoading] = useState(false);
    const [isFetchingOldIntro, setIsFetchingOldIntro] = useState(false);

    const introMessageRef = useRef(null);
    const [isRecognizing, setIsRecognizing] = useState(false);
    const [shouldSendMessage, ] = useState(true);
    const [userName, setUserName] = useState(getEncodedLocalStorage('first_name') || null);
    const [useTextbox, setUseTextbox] = useState(false);
    const [shouldMoveForward, setShouldMoveForward] = useState('no');

    const [languageToUse, setLanguageToUse] = useState("en");
    const textInputRef = useRef(null);

    const {
        recordings,
        HiddenRecorder,
    } = useVoiceRecord();

    const navigate = useNavigate();

    function compareById(a, b) {
        return a.id - b.id;
    }
    
    function quickSort(arr, compare) {
        if (arr?.length <= 1) {
            return arr;
        }
    
        const pivot = arr[0];
        const left = [];
        const right = [];
    
        for (let i = 1; i < arr?.length; i++) {
            if (compare(arr[i], pivot) < 0) {
                left.push(arr[i]);
            } else {
                right.push(arr[i]);
            }
        }
    
        return [...quickSort(left, compare), pivot, ...quickSort(right, compare)];
    }

    async function getCompanyChatApi(currentSession) {
        const resp = await axiosInstance({
          url: `/api/companychat/?session=${currentSession}`,
        });
        return resp
    }

    async function handleCompanyChatCall(currentSession) {  
        const storedChatHistory = getEncodedLocalStorage('chat-history');
        if (storedChatHistory?.length >= 1) {
            return;
        }

        setIsLocalLoading(true);
        setIsFetchingOldIntro(true);

        try {
            const resp = await getCompanyChatApi(currentSession);

            const newChatSessionDetail = [];
            
            let sortedResult = quickSort(resp?.data?.results, compareById);

            // Ensure intro message is added only once
            if (introMessageRef.current) {
                const temp_intro = introMessageRef.current;
                setSentences((prev) => [
                    ...prev,
                    {
                        message: temp_intro,
                        source: 'bot',
                        isNarrated: true,
                        id: 'intro_msg_id',
                    },
                ]);

                newChatSessionDetail.push({
                    msg: temp_intro,
                    source: 'bot',
                    updated_at: 'intro_msg_id',
                });

                introMessageRef.current = ""; // Clear intro message after use
            }

            // Process chat messages
            sortedResult.forEach((chats) => {
                let messageToUse = chats?.message;
                if (chats?.translated_message && chats?.translated_message !== ''){
                    messageToUse = chats?.translated_message;
                }
                const chatMessage = {
                    message: chats?.sender?.id === 1 ? messageToUse : chats?.message,
                    source: chats?.sender?.id === 1 ? 'bot' : 'user',
                    isNarrated: true,
                    id: chats?.id,
                };

                setSentences((prev) => [
                    ...prev,
                    chatMessage,
                ]);

                newChatSessionDetail.push({
                    msg: chats?.sender?.id === 1 ? messageToUse : chats?.message,
                    source: chats?.sender?.id === 1 ? 'bot' : 'user',
                    updated_at: chats?.id,
                });
            });

            // Update chat history
            const newChatHistoryItems = newChatSessionDetail.map((item) => ({
                msg: item.msg,
                source: item.source,
                updated_at: item.updated_at,
            }));
            
            // Avoid adding duplicates
            
            setChatHistory((prev) => {
                const existingMessages = new Set(prev.map(msg => msg.msg));
                const filteredItems = newChatHistoryItems.filter(item => !existingMessages.has(item.msg));
                return [
                    ...prev,
                    ...filteredItems,
                ];
            });

            lastBotMessageIndex.current += newChatSessionDetail.length;
            
        } catch (error) {
            console.error('Error fetching company chat data:', error);
        } finally {
            setIsLocalLoading(false);
            setIsFetchingOldIntro(false);
        }
    }

    useEffect(() => {
        async function createUserProfile() {
            try {
                setIsLocalLoading(true);
                const headers = {
                "Content-Type": "application/json",
                };
                let body = {
                access_token: access_token,
                };

                const response = await axiosInstance.post(`/api/create-profile/`, body, { headers });
                
                if (response && response?.status === 200) {
                    const data  = response?.data.profile_details;
                    localStorage.setItem('profileid', data?.id)
                    setProfileToUse(data?.id)
                    let sessionid = getEncodedLocalStorage('session')
                    if (!sessionid) {
                        let session = await getNewSessionID();
                        setEncodedLocalStorage('session', session);

                    }
                    const preferredLanguage = JSON.parse(localStorage.getItem('preferred_language') || '{}');
                    const language = preferredLanguage?.value || "en";
                    setEncodedLocalStorage('route', language || "en");
                    setLanguageToUse(language);
                    setEncodedLocalStorage('first_name', data?.first_name);
                    setEncodedLocalStorage('company', data?.company?.slug);
                    let currentSession = getEncodedLocalStorage('session');
                    console.log("currentSession: ", currentSession)
                    await handleCompanyChatCall(currentSession);
                    setUserName(JSON.stringify(data?.first_name))
                } else {
                    clearMitraLocalStorage()
                    navigate(-1)
                }
            } catch (error) {
                console.error(error?.response?.data || error);
                clearMitraLocalStorage()
                // navigate(-1)
            } finally {
                setIsLocalLoading(false);
            }
        }
        
        if (!profileToUse && access_token) {
            createUserProfile();
            setShouldFetchIntro(true);
            setIsStreamingComplete(true);
        }
    }, [access_token, profileToUse]);

    useEffect(() =>{
        if(isFetchingOldIntro){
        let temp_intro_message = getEncodedLocalStorage('intro_message');
        introMessageRef.current = temp_intro_message;
        }
    },[isFetchingOldIntro])


    useEffect(()=>{
        setShouldFetchIntro(true);
        setIsStreamingComplete(true);
    }, [])

    const MakeSocketConnection = useCallback((currentTextMessage, currentSocket) => {
        return new Promise((resolve, reject) => {
          try{
            console.log("start chatSocket: ", chatSocket)
            if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
              console.log("Reusing existing WebSocket connection");
              return resolve(chatSocket);
            } else if(currentSocket && currentSocket.readyState === WebSocket.OPEN) {
              console.log("Reusing existing WebSocket passed as connection");
              return resolve(currentSocket);
            }
            console.log("Creating new WebSocket connection...");
            let socket;
        
            let url = `${wss_protocol}${process.env.REACT_APP_WEBSOCKET_HOST}/ws/mitra/`;
        
            socket = new WebSocket(url);
            console.log("socket: ", socket)
    
            socket.onmessage = (e) => {
              console.log("Ws Connection Message");
              const data = JSON.parse(e.data);
              const message = data["text"];
            
              if (message.source === "bot") {
                setIsStreamingComplete(false);
                const validation = message?.extra_content?.validation;
                const should_move_forward = message?.extra_content?.should_move_forward;
                const userProblemStatement = message?.extra_content?.problem_statement;
                setEncodedLocalStorage('user_problem_statement', userProblemStatement);
                if (message?.msg !== '') {
                    setSentences((prevSentences) => {
                        const updatedSentences = [...prevSentences];
                    
                        if (
                            updatedSentences.length > 0 &&
                            updatedSentences[updatedSentences.length - 1]?.source === "bot"
                        ) {
                            if (message?.msg) {
                                updatedSentences[updatedSentences.length - 1].message += message?.msg;
                            }
                        } else {
                            updatedSentences.push({
                                message: message?.msg || "",
                                source: "bot",
                                isNarrated: false,
                                id: new Date().valueOf(),
                                validation: validation || "",
                                shouldMoveForward: should_move_forward,
                                problemStatement: userProblemStatement || ''
                            });
                            lastBotMessageIndex.current = updatedSentences.length - 1;
                        }
                        return updatedSentences;
                    });
                                
                    setChatHistory((prevChatHistory) => {
                        const updatedChatHistory = [...prevChatHistory];
                    
                        if (
                            updatedChatHistory.length > 0 &&
                            updatedChatHistory[updatedChatHistory.length - 1]?.source === "bot"
                        ) {
                            if (message?.msg) {
                            updatedChatHistory[updatedChatHistory.length - 1].msg += message?.msg;
                            }
                        } else {
                            
                            updatedChatHistory.push({
                                msg: message?.msg || "",
                                source: "bot",
                                updated_at: new Date().valueOf(),
                                validation: validation || "",
                                shouldMoveForward: should_move_forward,
                                problemStatement: userProblemStatement || ''
                            });
                        }
                        return updatedChatHistory;
                    });
                }
            
                setShouldMoveForward(should_move_forward);
                handleScrollToView();
              } else{
                setIsStreamingComplete(false)
              }
            
              if (message.finish_reason === "stop" && message.source === "bot") {
                handleScrollToView();
                setTalking(0);
                setIsStreamingComplete(true);
    
              }
            };
    
            socket.onopen = () => {
              console.log("Ws Connection open");
              console.log("socket: ", socket)
              setChatSocket(socket);
                let profileid = localStorage.getItem('profileid')
                let sessionid = getEncodedLocalStorage('session')
                let route = languageToUse
                if(profileid && sessionid){
                    socket.send(JSON.stringify({
                    type: 'authenticate',
                    sessionid: sessionid,
                    profileid: profileid,
                    access_token: access_token,
                    route: route,
                    }));
                }
              resolve(socket);
            };
    
            socket.onclose = (event) => {
              console.log("Socket connection closed", event);
            };
            
            socket.onerror = (error) => {
              console.error("WebSocket error:", error);
              socket.close();
              retryConnection(currentTextMessage);
              reject(error);
            };
    
            return () => {
              if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
                console.log("Socket connection closed")
                chatSocket.close();
              }
            };
          } catch (error) {
            console.error("Error establishing WebSocket connection:", error);
            reject(error);
          }
        });
    }, [chatSocket]);

    let reconnectAttempts = 0;
    const maxReconnectAttempts = process.env.REACT_APP_WEBSOCKET_RETRY_NUM || 3;
    
    function retryConnection(currentTextMessage="") {
        if (reconnectAttempts >= maxReconnectAttempts) {
        console.error("Max reconnection attempts reached. Stopping.");
        return;
        }
        reconnectAttempts++; 
        console.log(`Reconnection attempt #${reconnectAttempts}...`);

        console.log("Attempting WebSocket Reconnection...");
        setTimeout(() => {
        MakeSocketConnection(currentTextMessage)
        .then((newSocket) => {
            console.log("Reconnected to WebSocket", newSocket);
            reconnectAttempts = 0;
            console.log("currentTextMessage: ", currentTextMessage)
            if (currentTextMessage && currentTextMessage.trim() !== "") {
            console.log("Resubmitting the form...");
            // document.querySelector("form.div39").requestSubmit();
            handleSendMessage(null, newSocket)
            }
        })
        .catch((error) => {
            console.error("Reconnection Failed:", error);
        });
        }, 1000);
    }

    useEffect(()=>{
        if(chatHistory?.length!== 0){
            setEncodedLocalStorage('isChatVisible', true)
            setIsChatVisible(true);
        }
    }, [])


  const setReadData = useCallback(async () => {
    let storedRoute = '/mitra-create';
    let data = await getTranslatedIntroMessage(storedRoute);
    let message = data[0]?.alt_introductory_message;

    console.log("got translated: ", message);

    if (message && !!message?.trim() && (chatHistory[chatHistory?.length - 1]?.msg !== message)) {
        setEncodedLocalStorage('intro_end_context', message);
        saveUserChatsInDB(message, getEncodedLocalStorage('session'), 'bot');

        setSentences((prevSentences) => [
            ...prevSentences,
            {
                message,
                source: "bot",
                isNarrated: false,
                id: new Date().valueOf(),
                validation: "",
                shouldMoveForward: 'no',
                problemStatement: ''
            }
        ]);

        setChatHistory((prevChatHistory) => [
            ...prevChatHistory,
            {
                msg: message,
                source: "bot",
                updated_at: new Date().valueOf(),
                validation: "",
                shouldMoveForward: 'no',
                problemStatement: ''
            }
        ]);
    }
  }, [chatHistory, setChatHistory, setSentences]);
  

    useEffect(()=>{
        console.log('isReadOnly: ', isReadOnly)

        if (isReadOnly) {
            localStorage.removeItem('objective');
            localStorage.removeItem('selected_objective');
            setReadData();
        }
        
    }, [isReadOnly])
    

    useEffect(()=>{
        const botName = getEncodedLocalStorage('botName');
        setBotNameToDisplay(botName);

    }, [])

    async function getCompanyDetail(){
        
        const res = await axiosInstance({
        url: `/api/profileuser/${profileToUse}/`,
        })
        
        return res?.data?.company?.slug;
    }

    async function getTranslatedIntroMessage(storedRoute){
        let translate_api_url = `api/bot_vernacular/?language=${languageToUse}&company_bot__route=${storedRoute}`;
        try {
        const response = await axiosInstance.get(translate_api_url);
        return response?.data?.results;
        } catch (error) {
        console.error('Error fetching AI4Bharat audio:', error);
        throw error;
        }

    }

    useEffect(()=>{
        console.log("shouldMoveForward: ", shouldMoveForward)
        if(shouldMoveForward === 'yes') {
            console.log("Movingggg.")
            setIsLoading(true);
            setCurrentChatValue(4);
            setCurrentPageValue(1)
        }        
    }, [shouldMoveForward])

    useEffect(() => {
        const fetchBotInfo = async () => {
            setIsIntroLoading(true);
            let companyName = await getCompanyDetail();
            try {
                const response = await axiosInstance({
                    url: company_bot_list_url,
                    params: {
                        company__slug: companyName,
                    },
                });
                const bots = response?.data?.results;
        
                if (bots) {
                    let storedRoute = '/mitra-create';
                    let selectedBot = bots.find(bot => bot.route === storedRoute);
                    if (!selectedBot) {
                        selectedBot = bots[0] || { route: '/mitra-create' };
                    }
                    const botName = selectedBot?.name || 'Bot';
                    setEncodedLocalStorage('botName', botName)
                    setBotNameToDisplay(botName);
                }
            
                if (!shouldFetchIntro || chatHistory?.length) return;
                let storedRoute = '/mitra-create';
        
                if (languageToUse && bots && bots.length > 0) {
                    let latestBot;
                    for (const bot of bots) {
                        if (bot.route === storedRoute){
                            latestBot = bot
                        }
                        else if (!latestBot || new Date(bot.created_at) > new Date(latestBot.created_at)) {
                            latestBot = bot;
                        }
                    }
                    if (!latestBot) {
                        handleFirstMessage('');
                        return;
                    }
                    let firstName = getEncodedLocalStorage("first_name") || '';
                    
                    let data = await getTranslatedIntroMessage(storedRoute)
                    setEncodedLocalStorage('system_error', data[0]?.error_message)
                    let message = data[0]?.introductory_message
                    const botName = data[0]?.name || 'Bot';
                    localStorage.setItem('botName', botName);
                    setBotNameToDisplay(botName);

                    if (message && firstName) {
                        const words = message.split(' ');
                        words.splice(1, 0, firstName);
                        message = words.join(' ');
                    }
                    
                    if (message && !!message?.trim() && (chatHistory[chatHistory?.length - 1]?.msg !== message)) {
                        setEncodedLocalStorage('intro_message', message)
                        setSentences((prev) => [
                        ...prev,
                        {
                            message: message,
                            isNarrated: false,
                            id: new Date().valueOf(),
                        },
                        ]);
                    }
                }
        
            } catch (error) {
                console.error({ error });
            }
        };
        
        
        if (chatHistory?.length === 0 && shouldFetchIntro && profileToUse && languageToUse && userName) {
            fetchBotInfo().then(() => {
                setShouldFetchIntro(false);
                setIsIntroLoading(false);
            });
        }
        return () => {};
    }, [shouldFetchIntro, profileToUse, languageToUse, userName]);

    useEffect(() => {
        
        setLocalChatHistory(chatHistory);
        lastBotMessageIndex.current = chatHistory?.length - 1;
        handleScrollToView();
    }, [chatHistory]);

    useEffect(() => {
        if (
        !!recordings?.length &&
        chatHistory[chatHistory?.length - 1]?.source !== "bot"
        ) {
            
            setChatHistory((prev) => {
            prev[chatHistory?.length - 1] = {
            ...prev[chatHistory?.length - 1],
            recording: recordings[recordings?.length - 1],
            };
            return prev;
        });
        }
        return () => {};
    }, [recordings, chatHistory]);

    useEffect(() => {
        try {
        if (!!reconText) {
            setReconText("");
        }
        } catch (error) {
        console.error({ error });
        }
    }, [chatSocket, reconText, recordings]);

    useEffect(() => {
        if(audioRef?.current){
        if(isMute){
            audioRef.current.muted = true
        }else{
            audioRef.current.muted = false
        }
        }
    }, [isMute])

    useEffect(() => {
        setEncodedLocalStorage('isChatVisible', isChatVisible);
    }, [isChatVisible]);

    useEffect(() => {
        if (useTextbox && textInputRef.current) {
            textInputRef.current.focus();  
        }
    }, [useTextbox]);

    const handleScrollToView = () => {
        try {
            console.log('scrolling');
            const element = document?.querySelector("#last-chat-boundary");
            if (!element) {
                console.error('Element #last-chat-boundary not found');
                return;
            }
            element.scrollIntoView({
                behavior: "smooth",
            });
        } catch (error) {
            console.error({ error });
        }
    };

    const handleSendMessage = useCallback(
        async (event, currentSocket) => {
          console.log("Send event: ", event);
          if (event) {
            event.preventDefault();
            event.stopPropagation();
          }
          localStorage.removeItem('llmError');
      
          try {
            console.log("message: ", textMessage);
            const socket = await MakeSocketConnection(textMessage, currentSocket); // ✅ Ensures the latest socket is used
      
            console.log("Send socket: ", socket);
            setIsChatVisible(true);
            setNotMute(true);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
      
            if (!textMessage.trim()) return;
      
            handleMessagesForUser(textMessage);
            socket.send(
              JSON.stringify({
                text: textMessage,
                context: "",
              })
            );
      
            handleScrollToView();
            setTextMessage("");
          } catch (error) {
            console.error("WebSocket connection failed:", error);
          }
        },
        [textMessage, MakeSocketConnection]
      );

    const handleOnInputText = (e) => {
        e.preventDefault();
        setTextMessage(e.target.value);
        
        // If the input is cleared, reset the recognition flags
        if (e.target.value.trim() === "") {
            setIsRecognizing(false);
            setHasStartedListening(false);
        }
    };
  
    const handleMessagesForBot = useCallback(
        (sentence) => {
        if (isRecognizing || hasStartedListening || !shouldSendMessage) return;
        
        const lastMessage = chatHistory[chatHistory?.length - 1];
        if (lastMessage?.msg === sentence && lastMessage?.source === "bot") {
            
            return;
        }

        if (chatHistory[chatHistory?.length - 1]?.source === "bot") {
            
            setChatHistory((prevMessages) => {
            const lastMessage = prevMessages[prevMessages?.length - 1];
            lastMessage.msg += " " + sentence;
            return [...prevMessages];
            });
        } else {
            
            setChatHistory((prevMessages) => {
            return [
                ...prevMessages,
                createMessage({
                msg: sentence,
                source: "bot",
                }),
            ];
            });
        }
        },
        [chatHistory]
    );

    const handleMessagesForUser = useCallback((sentence) => {
        setChatHistory((prevMessages) => [
        ...prevMessages,
        createMessage({
            msg: sentence,
            source: "user",
        }),
        ]);
    }, []);

    const handleAI4BharatTTSRequest = async (text, id, sourceLanguage) => {
        try {
    
        let cachedAudioUrl = audioCache[id];
        let audio_result = "";
        let audio;
    
        // Mark sentence as narrated if override ID is not set
        if (!hasOverRideId) {
            handleMessagesForBot(text);
        }
    
        // If muted, mark all sentences as narrated and skip TTS
        if (isMute && !hasOverRideId) {
            setSentences((prev) => {
            let all_sentences = JSON.parse(JSON.stringify([...prev]));
            return all_sentences.map((x) => ({ ...x, isNarrated: true }));
            });
            setIsNextAllowed(true);
            setHasOverRideId(null);
            return;
        }
    
        // Fetch the audio result using AI4Bharat TTS service if not cached
        if (!cachedAudioUrl) {
            audio_result = await getAI4BharatAudio(text, sourceLanguage);
            if (audio_result?.length) {
            cachedAudioUrl = `data:audio/wav;base64,${audio_result}`;
            setAudioCache((prevCache) => ({
                ...prevCache,
                [id]: cachedAudioUrl,
            }));
            }
        }
    
        if (cachedAudioUrl) {
            audioRef.current = new Audio(cachedAudioUrl);
            audio = audioRef.current;
    
            // Disable next sentence narration while current audio is playing
            audio.onplay = () => {
            setIsNextAllowed(false);
            };
    
            // Enable next sentence narration after the current audio ends
            audio.onended = () => {
            setSentences((prev) => {
                let all_sentences = JSON.parse(JSON.stringify([...prev]));
                let index = prev.findIndex((x) => x.id === id);
                if (index > -1) all_sentences[index].isNarrated = true;
                return all_sentences;
            });
            setIsNextAllowed(true);
            setHasOverRideId(null);
            };
    
            try {
            await audio.play();
            } catch (error) {
            console.error('Error playing audio:', error);
            setSentences((prev) => {
                let all_sentences = JSON.parse(JSON.stringify([...prev]));
                let index = prev.findIndex((x) => x.id === id);
                if (index > -1) all_sentences[index].isNarrated = true;
                return all_sentences;
            });
            setIsNextAllowed(true);
            setHasOverRideId(null);
            }
        }
        } catch (error) {
        console.error('Error in handleAI4BharatTTSRequest:', error);
        }
    };

  const isTyping = !!textMessage.trim();

    useEffect(() => {
        let unnarratedMessages = sentences.filter((x) => !x?.isNarrated);
        let hasUnnarratedMessages = !!unnarratedMessages?.length;
        let sourceLanguage = languageToUse;

        if (isNextAllowed && hasUnnarratedMessages) {
        handleAI4BharatTTSRequest(
            unnarratedMessages[0].message,
            unnarratedMessages[0].id,
            sourceLanguage
        )
        }

        return () => {};
    }, [isNextAllowed, sentences, languageToUse]);

    useEffect(() => {
        if (
        !!appendix?.length &&
        chatHistory[chatHistory?.length - 1].source === "bot"
        ) {
            
            setChatHistory((prevMessages) => {
            const lastMessage = prevMessages[prevMessages?.length - 1];
            lastMessage.appendixURL = appendix;
            lastMessage.hasAppendix = true;
            return [...prevMessages];
        });
        setAppendix([]);
        }
        return () => {};
    }, [appendix, chatHistory]);

    const handleFirstMessage = ({ message, category }) => {
        try {
        if (category === "special") {
            // window.location.reload();
            return;
        }
        handleScrollToView();
        } catch (error) {
        console.error({ error });
        }
    };

    const handleOnSpeaking = async (text, id, staticMsg) => {
        try {
        try {
            if (!!audioRef.current) await audioRef.current.pause();
        } catch (error) {
            console.error({ error });
        }
        setHasOverRideId(id);
        setIsNextAllowed(true);
        const messageToPlay = staticMsg? staticMsg: chatHistory.find((message) => message.updated_at === id);
        setSentences((prev) => {
            return [
            {
                message: messageToPlay?.msg,
                isNarrated: false,
                id: id,
            },
            ];
        });
        } catch (error) {
        console.error({ error });
        }
    };

    const handleOnStopSpeaking = async () => {
        try {
        try {
            if(audioRef.current) await audioRef.current.pause();
        } catch (error) {
            console.error({ error });
        }
        setHasOverRideId(null);
        setSentences([]);
        setIsNextAllowed(true);
        } catch (error) {
        console.error({ error });
        }
    };

    const startRecording = () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setTextMessage('')
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
    
            // Clear previous audio chunks before starting new recording
            const localAudioChunks = [];
    
            recorder.start();
            setHasStartedRecording(true);
            
    
            recorder.ondataavailable = (event) => {
                // Collect audio data chunks in the local array
                localAudioChunks.push(event.data);
                
            };
    
            recorder.onstop = async () => {
                
                if (localAudioChunks.length > 0) {
                // Combine all audio chunks into a single Blob
                const audioBlob = new Blob(localAudioChunks, { type: 'audio/webm;codecs=opus' });
                
    
                // Check if the audio blob contains any significant sound
                const wavBlob = await convertToWav(audioBlob);
                if (!wavBlob) {
                    
                    return; // Skip if no meaningful audio
                }
                setIsFetchingData(true);
                // Convert to Base64 and send to the ASR API
                const base64Audio = await convertBlobToBase64(wavBlob);
                const transcriptResult = await ai4BharatASR(base64Audio, languageToUse);
                // Update transcript if valid audio
                setTextMessage(transcriptResult);
                setIsFetchingData(false);
                } else {
                console.warn("No audio chunks were recorded.");
                setIsFetchingData(false);
                }
            };
            })
            .catch((err) => {
            console.error('Error accessing microphone:', err);
            setIsFetchingData(false);
            });
        } else {
        console.warn("getUserMedia not supported on your browser!");
        }
    };
  
    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setHasStartedRecording(false);
        }
    };

  return (
    <>
      <></>
      {(isLocalLoading || isIntroLoading)&&
        <ShowLoader />
      }
      <div>
        <HiddenRecorder />
        <Header shouldEnableCross={true} />

        <div
            className={
                `div33 
                ${(chatHistory[chatHistory.length-1]?.validation==='NO_PROBLEM_STATEMENT')? 
                    'div9-a': 'div9'
                }`
            }
        >
            <ul className="div34">
              {chatHistory?.map((chat, i) => (
                <li
                key={i}
                className={`div35 ${
                  chat?.source === "user" ? "label1" : "label1"
                }`} 
            >
        
                <div className={`div36 ${chat?.source === "user"&& 'div37'}`}>
                  <ChatMessage
                    botNameToDisplay={botNameToDisplay}
                    userType={chat?.source}
                    message={`${chat?.msg}`}
                    name={"You"}
                    recording={chat?.recording}
                    hasAppendix={chat?.recording}
                    appendixURL={chat?.appendixURL}
                    isTalking={
                      (chat.source === "bot") && !isStreamingComplete && (i === chatHistory.length - 1)
                    }
                    handleOnStopSpeaking={() => handleOnStopSpeaking()}
                    handleOnSpeaking={() =>{
                      handleOnSpeaking(chat?.msg, chat?.updated_at)}
                    }
                    isAnyPlaying={!!hasOverRideId || isTalking}
                    isPlaying={hasOverRideId === chat?.updated_at}
                    isStreamingComplete={isStreamingComplete}
                    setNotMute={setNotMute}
                    chatId={chat?.updated_at}
                    validation={chat?.validation}
                    userDetail={userDetail}
                  />
                  </div>
                  {!hasStartedListening && chatHistory[chatHistory?.length - 1].source === "user" &&
                  i === chatHistory?.length - 1 ? (
                    <LoadingChat />
                  ) : (
                    ""
                  )}
                </li>
              ))}
            </ul>
            <div id="last-chat-boundary" className="div38" />
        </div>
        {(!isLocalLoading && chatHistory[chatHistory.length-1]?.validation!=='NO_PROBLEM_STATEMENT')&&       
          <form
            className="div39 form-1"
            onSubmit={handleSendMessage}
            autoComplete="off"
          >
            {(!hasStartedRecording && !useTextbox && !isFetchingData)&&<div className={"mic-container"}>
                <div className="thirdpara-div">
                    <button 
                        className="microphone-button-gif-div"
                        onClick={(e)=>{
                            e.preventDefault();
                            hasStartedRecording ? stopRecording() : startRecording()
                        }}
                        disabled={isFetchingData}
                    >
                        <img src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/mic.gif" className="mic-gif" />
                    </button>
                </div>
                <div className="fourthpara-div">
                    <button className="use-text-button"
                        onClick={()=>{
                            setUseTextbox(true);
                        }}
                    >
                        <RxKeyboard />
                        {getKeyboardButtonTranslation(languageToUse)}
                    </button>
                </div>
            </div>}
            {(hasStartedRecording && !isFetchingData) && (
                <div 
                    className={`audio-visualizer ${"mic-container"}`}
                >
                    <img src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/voice_loader.gif" className="voice-loader-bot" />
                    <div className="">
                        <button className="use-text-button"
                            onClick={(e)=>{
                                stopRecording()
                                setUseTextbox(true);
                            }}
                        >
                            <FaMicrophoneSlash />
                            {getVoiceStopButtonTranslation(languageToUse)}
                        </button>
                    </div>
                </div>
            )}
            {(useTextbox)&&
                <div id="textbox-id" className={"input-box textbox-container"}>
                    <div className="fourthpara-div-1">
                        <button className="use-text-button"
                            onClick={()=>{
                                setUseTextbox(false);
                            }}
                        >
                            <FaMicrophone />
                            {getVoiceButtonTranslation(languageToUse)}
                        </button>
                    </div>
                    <input
                        ref={textInputRef}
                        type="text"
                        placeholder={hasStartedRecording? 
                            getPlaceHolder1(languageToUse): 
                            isFetchingData? getPlaceHolder2(languageToUse): getInputPlaceholderTranslation(languageToUse)
                        }
                        autoFocus={true}
                        value={textMessage}
                        className="firstpage-text-input"
                        onChange={handleOnInputText}
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
                </div>
            }
          </form>
        }
      </div>
    </>
  );
};

export default FirstPageVoiceBasedChat;

function ChatMessage({
  userType,
  message,
  name,
  recording,
  appendixURL,
  isTalking,
  handleOnSpeaking,
  handleOnStopSpeaking,
  isPlaying,
  botNameToDisplay,
  isStreamingComplete,
  setNotMute,
  chat,
  staticMessage,
  chatId,
  userDetail,
  validation
}) {

    let sanitizedContent = DOMPurify.sanitize(message);
    const languageToUse = getEncodedLocalStorage("route") || "en";

  return (
    <div className="div41">
      {(userType === "bot")&& <div className="div42">
        <div
          className={`${
            userType === "bot" ? "div43" : "div44"
          } div45`}
        >
            <img className="bot-image" src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/bot_profile_image.gif" />

        </div>
        <div className="div46">
          {userType === "bot" ? (
            isPlaying ? (
              <button
                className={`button-10 button-3`}
                onClick={handleOnStopSpeaking}
                disabled={!isStreamingComplete}
              >
                <HiOutlineSpeakerWave />
              </button>
            ) : (
              <button
                className={`button-11 button-3`}
                onClick={() => {
                  setNotMute(false);
                  handleOnSpeaking(message, chat?.updated_at, staticMessage);
                }}
                disabled={!isStreamingComplete}
              >
                <RxSpeakerOff />
              </button>
            )
          ) : null}
        </div>
      </div>}
      <div className={`${userType==='user'? 'div47': 'div48'}`}>
        <div
          className={`div36 ${(userType==='user')&& 'div37'}`}
        >
          {(userType === "user")&& <div
          className={`div49`}
        >
            {Boolean(userDetail?.image && userDetail.image !== "null") ? (
                <img 
                    src={userDetail?.image}
                    className="user-image" 
                />
            ):(
                <img 
                    src="/create-project/images/defaultImage.png"
                    className="user-image" 
                />
            )}
        </div>}
        </div>
        {!!message && !!recording && (
          <div
            className={`div50`}
          >
            <WaveSurferPlayer
              url={recording?.result}
              {...default_wave_surfer_config}
            />
          </div>
        )}
        {!!recording ? (
          <div className="div51">
            Transcription: {message}
          </div>
        ) : (
          <div
          className={`div52 custom-voice-chat-chats ${(userType === "user")? 'div73': ''}`}
          id={chatId}
        >
            <ReactMarkdown  children={sanitizedContent} remarkPlugins={[remarkGfm]} 
                // rehypePlugins={[rehypeRaw]} 
            />
            {isTalking && (
              <div className="div55">
                (Typing...)
              </div>
            )}
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
            {(validation === 'NO_PROBLEM_STATEMENT' && userType==='bot') && (
                <>
                    <div className="firstpage-third-div">
                        <button 
                            className="firstpage-confirm-button"
                            onClick={()=>{
                                clearMitraLocalStorage();
                                window.location.href=process.env.REACT_APP_ROUTE_EXPLORE;
                            }}
                        >
                            {languageToUse&& getExploreTranslation(languageToUse)}
                        </button>
                    </div>
                </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const LoadingChat = () => (
  <div className="div57">
    <div className="div58">
      <div>Replying...</div>
    </div>
  </div>
);
/* eslint-disable react-hooks/exhaustive-deps */

export const createMessage = ({
    updated_at = Date.now(),
    source = "bot" || "user",
    msg = "",
    validation= ""
}) => ({
    updated_at,
    source,
    msg,
    validation,
});
  