import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Popup from "../../../components/popup/Popup";

import "../stylesheet/chatStyle.css";
import { useNavigate } from "react-router-dom";
import { clearMitraLocalStorage } from "../MainPage";
import { getBodyText, getConfirmText, getDiscardText, getHeaderText } from "../question script/header_translation";


function Header({ shouldEnableGoBack = false, shouldEnableCross = false, shouldEnableGoForward = false , handleGoBack, handleGoForward }) {

    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const preferredLanguage = JSON.parse(localStorage.getItem('preferred_language') || '{}');
    const language = preferredLanguage.value || 'en';


    const handleClosing = () => {
        
        clearMitraLocalStorage();
        window.location.href=process.env.REACT_APP_ROUTE_LOGIN;
        // navigate(process.env.REACT_APP_ROUTE_LOGIN);

    };

    const tooglePopup = () => {
        
        setIsOpen(!isOpen);
    };

    return (
        <>
            {(shouldEnableCross || shouldEnableGoBack || shouldEnableGoForward) && (
                <div className="headerpage-div">
                    <div className="headerpage-arrow-div">
                        <button onClick={handleGoBack} disabled={!shouldEnableGoBack} 
                            className={`${shouldEnableGoBack ? "" : "text-gray-500"}`}
                        >
                            <FiArrowLeft className="headerpage-arrow-icon" />
                        </button>
                        <button onClick={handleGoForward} disabled={!shouldEnableGoForward}
                            className={`${shouldEnableGoForward ? "" : "text-gray-500"}`}
                        >
                            <FiArrowRight className="headerpage-arrow-icon" />
                        </button>
                    </div>
                    {shouldEnableCross && (
                        <button
                            onClick={tooglePopup}
                            className={!shouldEnableGoBack ? "headerpage-cross-only" : ""}
                        >
                            <RxCross2 className="headerpage-cross-icon" />
                        </button>
                    )}
                </div>
            )}
            <Popup 
                isOpen={isOpen} 
                headerText={getHeaderText(language)} 
                bodyText={getBodyText(language)}
                confirmButtonText={getConfirmText(language)}
                discardButtonText={getDiscardText(language)}
                handleDiscard={handleClosing}
                togglePopup={tooglePopup}
                handleConfirm={tooglePopup}
            />
        </>
    );
}


export default Header;
