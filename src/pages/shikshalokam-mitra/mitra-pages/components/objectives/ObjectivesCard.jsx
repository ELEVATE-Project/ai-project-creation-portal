import React, { useMemo } from "react";
import { getEncodedLocalStorage } from "../../../../../utils/storage_utils";
import Collapse from "../../../../../components/Collapse/Collapse";
import Tabs from "../../../../../components/Tabs/Tabs";
import Card from "../../../../../components/cards/Card";
const SOURCE_TABS_DATA = [
  {
    title: "Parent Sensitization 1",
    id: 1,
    data: [
      {
        label: "Reference 1",
        title: "Parent Sensitization 1",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        sourceUrl: "https://www.google.com",
      },
      {
        label: "Reference 2",
        title: "Parent Sensitization 2",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        sourceUrl: "https://www.google.com",
      },
      {
        label: "Reference 3",
        title: "Parent Sensitization 3",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        sourceUrl: "https://www.google.com",
      },
      {
        label: "Reference 4",
        title: "Parent Sensitization 4",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        sourceUrl: "https://www.google.com",
      },
      {
        label: "Reference 5",
        title: "Parent Sensitization 5",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        sourceUrl: "https://www.google.com",
      },
    ],
  },
  {
    title: "Parent Sensitization 2",
    id: 2,
    data: [
      {
        label: "Reference 1",
        title: "Parent Sensitization 1",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        sourceUrl: "https://www.google.com",
      },
    ],
  },
  {
    title: "Parent Sensitization 3",
    id: 3,
    data: [
      {
        label: "Reference 1",
        title: "Parent Sensitization 1",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        sourceUrl: "https://www.google.com",
      },
    ],
  },
];
const ObjectivesCard = ({
  objectiveList = [],
  visibleCount,
  selectedIndex,
  handleObjectiveClick,
  selectedObjective,
  isSelectObjectiveSection,
  showSourceTabs = false,
}) => {
  const tabTitles = useMemo(() => {
    return SOURCE_TABS_DATA?.length > 0
      ? SOURCE_TABS_DATA?.map((item) => item.title)
      : [];
  }, []);

  const TabBody = (data) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-4 mt-[10px] lg:mt-0">
        {data?.[0]?.data?.map((item) => (
          <Card
            key={item.title}
            label={item.label}
            title={item.title}
            description={item.description}
            sourceUrl={item.sourceUrl}
          />
        ))}
      </div>
    );
  };

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
                <button className="secondpage-obj-bttn">
                  {obj} <sup>1</sup>
                </button>
              </div>
            ))}
        </>
      )}
      {showSourceTabs && (
        <Collapse title="Source" defaultOpen={false}>
          <Tabs
            tabs={tabTitles.map((obj) => ({
              label: obj,
              content: TabBody(SOURCE_TABS_DATA),
            }))}
          />
        </Collapse>
      )}
    </div>
  );
};

export default ObjectivesCard;
