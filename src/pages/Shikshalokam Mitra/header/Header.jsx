import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Popup from "../../../components/popup/Popup";

import "../stylesheet/chatStyle.css";
import { useNavigate } from "react-router-dom";
import { clearMitraLocalStorage } from "../MainPage";


function Header({ shouldEnableGoBack = false, shouldEnableCross = false, shouldEnableGoForward = false , handleGoBack, handleGoForward }) {

    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleClosing = () => {
        console.log("Closing");
        clearMitraLocalStorage();
        navigate(process.env.REACT_APP_ROUTE_EXIT);

    };

    const tooglePopup = () => {
        console.log("toogle");
        setIsOpen(!isOpen);
    };

    return (
        <>
            {(shouldEnableCross || shouldEnableGoBack) && (
                <div className="headerpage-div">
                    <div className="headerpage-arrow-div">
                        {shouldEnableGoBack && (
                            <button onClick={handleGoBack}>
                                <FiArrowLeft className="headerpage-arrow-icon" />
                            </button>
                        )}
                        {shouldEnableGoForward && (
                            <button onClick={handleGoForward}>
                                <FiArrowRight className="headerpage-arrow-icon" />
                            </button>
                        )}
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
                headerText="Discard Creation?" 
                bodyText="Your progress will not be saved if you exit now. Do you want to discard this journey?"
                confirmButtonText="Stay"
                discardButtonText="Discard"
                handleDiscard={handleClosing}
                togglePopup={tooglePopup}
                handleConfirm={tooglePopup}
            />
        </>
    );
}


export default Header;
