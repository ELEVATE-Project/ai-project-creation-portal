import React from "react";
import { RiArrowLeftSFill, RiArrowRightSFill } from "react-icons/ri";
import { getActionListTextTranslation } from "../../../question script/thirdpage_tanslation";
import SwipeTopCounter from "./SwipeTopCounter";
import ErrorText from "../ErrorText";
import ActionItemsSwiper from "./ActionItemsSwiper";

const ActionItemsList = ({
  language,
  visibleCount = false,
  selectedIndex,
  actionList,
  handleLeftArrowClick,
  handleRightArrowClick,
  fetchError,
  swipeDirection,
  isViewMode = false,
}) => {

  return (
    <div>
      <p className="secondpage-obj-text">
        {getActionListTextTranslation(language)}
      </p>
      {visibleCount && !isViewMode && (
        <SwipeTopCounter
          selectedIndex={selectedIndex}
          actionList={actionList}
          handleLeftArrowClick={handleLeftArrowClick}
          handleRightArrowClick={handleRightArrowClick}
        />
      )}
      {(!fetchError || fetchError === "") && (
        <div className="thirdpage-obj-container">
          {selectedIndex !== null && (
            <ActionItemsSwiper
              selectedIndex={selectedIndex}
              actionList={actionList}
              swipeDirection={swipeDirection}
            />
          )}
        </div>
      )}
      {!!(fetchError && fetchError !== "") && <ErrorText errorText={fetchError} />}
    </div>
  );
};

export default ActionItemsList;
