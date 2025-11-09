import React from "react";

const ActionItemsSwiper = ({
  selectedIndex,
  actionList,
  swipeDirection,
}) => {
  return (
    <div
      key={selectedIndex}
      className={`thirdpage-obj-selected-button-div ${
        swipeDirection === "left"
          ? "swipe-left"
          : swipeDirection === "right"
          ? "swipe-right"
          : ""
      }`}
    >
      <div className="secondpage-obj-line"></div>
      <button
        className={`thirdpage-obj-bttn ${
          swipeDirection ? `swipe-in-${swipeDirection}` : ""
        }`}
      >
        {actionList[selectedIndex]?.duration !== "" && (
          <p className="thirdpage-duration">
            <span className="thirdpage-week">
              {actionList[selectedIndex]?.duration}
            </span>{" "}
            weeks recommend
          </p>
        )}
        <ol>
          {(actionList[selectedIndex]?.actionSteps || []).map(
            (subAction, subActionIndex) => (
              <li key={`${selectedIndex}.${subActionIndex}`}>
                <span className="thirdpage-list-text">{subAction}</span>
              </li>
            )
          )}
        </ol>
      </button>
    </div>
  );
};

export default ActionItemsSwiper;
