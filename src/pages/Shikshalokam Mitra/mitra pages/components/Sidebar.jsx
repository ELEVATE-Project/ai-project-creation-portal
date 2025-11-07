import React from "react";
import { FaRegPlusSquare } from "react-icons/fa";
import { CgPlayPauseR } from "react-icons/cg";
import {ACTIVE_TABS} from "../../constants/mitra.constants";

function Action({ icon: Icon, text, onClick }) {
  return (
    <button className="flex items-center gap-3 bg-transparent p-0 border-0 cursor-pointer" onClick={onClick}>
      <Icon className="w-6 h-6 text-[#555555]" />
      <p className="font-medium text-base leading-[24px] text-[#555555]">{text}</p>
    </button>
  );
}

export default function Sidebar({ setActiveTab }) {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  return (
    <div className="w-[20%] h-full flex flex-col gap-8 rounded-[20px] p-5 border border-[#DBDBDB] bg-[#F0F2F5] shadow-[0px_0px_8px_0px_#0000001A]">
      <Action  icon={FaRegPlusSquare} text="New MIP" onClick={() => handleTabClick(ACTIVE_TABS.WELCOME)} />
      <Action icon={CgPlayPauseR} text="FAQ" onClick={() => handleTabClick(ACTIVE_TABS.FAQ)} />
    </div>
  );
}

