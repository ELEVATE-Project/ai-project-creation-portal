import React from "react";

const Card = ({ className = "", label, title, description, sourceUrl, show = "", showSourcePopup }) => {
  return (
    <div
      className={`flex flex-col border-[0.5px] border-solid border-[#572E91] gap-3 pt-2 pr-[10px] pb-2 pl-[10px] rounded-[10px] bg-white w-full my-[10px] mx-0 md:my-0 md:mx-0 shadow-[0px_4px_4px_0px_#0000001A] md:shadow-none ${className}`}
    >
      <div className="font-bold text-[12px] leading-none">{label}</div>
      <div className="font-medium text-[14px] leading-none text-black">{title}</div>
      <div className="font-normal text-[12px] leading-none text-[#374151]">
        {description}
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={showSourcePopup} className="font-semibold text-[12px] leading-none text-[#1D4ED8]">
          Show
        </button>
        <button onClick={() => {if (sourceUrl) window.open(sourceUrl, "_blank")}} className="font-semibold text-[12px] leading-none text-[#1D4ED8]">
          Source URL
        </button>
      </div>
    </div>
  );
};

export default Card;

