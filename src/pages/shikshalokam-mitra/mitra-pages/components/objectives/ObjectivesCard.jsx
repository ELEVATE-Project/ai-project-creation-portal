import React, { useMemo } from "react";
import { getEncodedSessionStorage } from "../../../../../utils/storage_utils";
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
  objectiveSource = {},
}) => {
  const showSourceTabs = useMemo(() => {
    return Object.keys(objectiveSource || []).length > 0;
  }, [objectiveSource]);
  const tabTitles = useMemo(() => {
    return Object.keys(objectiveSource || []);
  }, [objectiveSource]);

  const TabBody = (sourceData) => {
    if (!Array.isArray(sourceData) || sourceData.length === 0) {
      return <div>No sources available</div>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-4 mt-[10px] lg:mt-0">
        {sourceData.map((item, index) => {
          const source = item?.source || {};
          return (
            <Card
              key={`${item?.text}-${index}`}
              label={`Reference ${index + 1}`}
              title={item?.text || ""}
              description={source?.description || ""}
              sourceUrl={source?.url || ""}
              show={source?.chunk}
            />
          );
        })}
      </div>
    );
  };

  const tabs = useMemo(() => {
    if (!objectiveSource || Object.keys(objectiveSource).length === 0 || !tabTitles || tabTitles?.length === 0) {
      return [];
    }
    return tabTitles?.map((organizationKey) => ({
      label: organizationKey,
      content: TabBody(objectiveSource[organizationKey] || []),
    }));
  }, [tabTitles, objectiveSource]);

  const getObjectiveCardClass = (objIndex, obj) => {
    // If no index is selected, check if this objective matches the stored one
    if (selectedIndex === null || selectedIndex === undefined) {
      const storedObjective = getEncodedSessionStorage("selected_objective");
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
                <button className="secondpage-obj-bttn">
                  {obj?.text || ""} <sup>{objIndex + 1}</sup>
                </button>
              </div>
            ))}
        </>
      )}
      {showSourceTabs && (
        <Collapse title="Source" defaultOpen={false}>
          <Tabs tabs={tabs} />
        </Collapse>
      )}
    </div>
  );
};

export default ObjectivesCard;
