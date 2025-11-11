import React from "react";
import { getEncodedLocalStorage } from "../../../../../utils/storage_utils";
import Collapse from "../../../../../components/Collapse/Collapse";
import Tabs from "../../../../../components/Tabs/Tabs";
import Card from "../../../../../components/cards/Card";

const ObjectivesCard = ({
  objectiveList = [],
  visibleCount,
  selectedIndex,
  handleObjectiveClick,
  selectedObjective,
  isSelectObjectiveSection,
}) => {
  const getObjectiveCardClass = (objIndex, obj) => {
    // If no index is selected, check if this objective matches the stored one
    if (selectedIndex === null || selectedIndex === undefined) {
      const storedObjective = getEncodedLocalStorage("selected_objective");
      return storedObjective === obj
        ? "secondpage-obj-selected-button-div"
        : "secondpage-obj-bttn-div";
    }
    // Otherwise, check if this index matches the selected index
    return objIndex === selectedIndex
      ? "secondpage-obj-selected-button-div"
      : "secondpage-obj-bttn-div";
  };
  return (
    <div className="objective-list-div">
      {!!(!isSelectObjectiveSection && selectedObjective?.length > 0) ? (
        <div
          key="selected-objective"
          className="secondpage-obj-selected-button-div"
        >
          <div className="secondpage-obj-line"></div>
          <button className="secondpage-obj-bttn">{selectedObjective}</button>
        </div>
      ) : (
        <>
          {(Array.isArray(objectiveList) ? objectiveList : [])
            .slice(0, visibleCount)
            .map((obj, objIndex) => (
              <div
                key={objIndex}
                className={getObjectiveCardClass(objIndex, obj)}
                onClick={() => handleObjectiveClick(objIndex)}
              >
                <div className="secondpage-obj-line"></div>
                <button className="secondpage-obj-bttn">{obj}{" "}<sup>1</sup></button>
              </div>
            ))}
        </>
      )}
      <Collapse title="Source" defaultOpen={false}>
        <Tabs tabs={["Parent Sensitization 1", "Parent Sensitization 2", "Parent Sensitization 3"].map(obj => ({
          label: obj,
          content: <Card />
        }))} />
      </Collapse>
    </div>
  );
};

export default ObjectivesCard;
