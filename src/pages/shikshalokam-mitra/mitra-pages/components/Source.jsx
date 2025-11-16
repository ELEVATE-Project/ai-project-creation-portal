import React, { useMemo } from "react";
import Card from "../../../../components/cards/Card";
import Collapse from "../../../../components/Collapse/Collapse";
import Tabs from "../../../../components/Tabs/Tabs";

const Source = ({ source = {}, customClassNames = {} }) => {
  const showSourceTabs = useMemo(() => {
    return Object.keys(source || []).length > 0;
  }, [source]);

  const tabTitles = useMemo(() => {
    return Object.keys(source || []);
  }, [source]);

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
    if (
      !source ||
      Object.keys(source).length === 0 ||
      !tabTitles ||
      tabTitles?.length === 0
    ) {
      return [];
    }
    return tabTitles?.map((organizationKey) => ({
      label: organizationKey,
      content: TabBody(source[organizationKey] || []),
    }));
  }, [tabTitles, source]);

  if (!showSourceTabs) return null;

  return (
    <Collapse title="Source" defaultOpen={false} customClassNames={customClassNames}>
      <Tabs tabs={tabs} />
    </Collapse>
  );
};

export default Source;
