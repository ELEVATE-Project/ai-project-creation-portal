import React, { useState } from "react";

const Tabs = ({ tabs = [], defaultActiveTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  if (!tabs || tabs.length === 0) {
    return null;
  }

  const activeTabContent = tabs[activeTab]?.content || null;

  return (
    <div className="flex w-full h-full gap-4">
      {/* Left side - Tabs (20%) */}
      <div className="w-[20%]">
        <div className="flex flex-col gap-1">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`
                px-4 py-3 text-left font-['Urbanist'] font-medium text-xs leading-none
                ${
                  activeTab === index
                    ? "bg-[#F1E9FF] text-[#7C3AED] rounded-[6px]"
                    : "bg-white text-gray-700"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right side - Content (80%) */}
      <div className="w-[80%] bg-white p-6 overflow-auto">
        {activeTabContent}
      </div>
    </div>
  );
};

export default Tabs;

