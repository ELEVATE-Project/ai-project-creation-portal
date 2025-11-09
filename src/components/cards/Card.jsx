import React from "react";

const Card = ({ className = "" }) => {
  return (
    <div
      className={`flex flex-col border gap-3 pt-2 pr-[10px] pb-2 pl-[10px] rounded-[10px] bg-white max-w-[230px] ${className}`}
      style={{ borderWidth: "0.5px", borderColor: "#572E91" }}
    >
      <div className="font-bold text-[10px] leading-none">Reference</div>
      <div className="font-medium text-xs leading-none text-black">Parent Sensitization</div>
      <div className="font-normal text-[10px] leading-none text-[#374151]">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
      </div>
      <div className="flex justify-end gap-2">
        <button className="font-semibold text-[10px] leading-none text-[#1D4ED8]">
          Show
        </button>
        <button className="font-semibold text-[10px] leading-none text-[#1D4ED8]">
          Source URL
        </button>
      </div>
    </div>
  );
};

export default Card;

