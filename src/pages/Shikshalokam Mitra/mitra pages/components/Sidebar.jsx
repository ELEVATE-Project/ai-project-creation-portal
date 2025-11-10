import React, { useState } from "react";
import { FaRegPlusSquare } from "react-icons/fa";
import { CgPlayPauseR } from "react-icons/cg";
import { HiMenu, HiX } from "react-icons/hi";
import { ACTIVE_TABS } from "../../constants/mitra.constants";

function Action({ icon: Icon, text, onClick }) {
  return (
    <button className="flex items-center gap-3 bg-transparent p-0 border-0 cursor-pointer w-full text-left" onClick={onClick}>
      <Icon className="w-6 h-6 text-[#555555] flex-shrink-0" />
      <p className="font-medium text-base leading-[24px] text-[#555555] break-words">{text}</p>
    </button>
  );
}

export default function Sidebar({ setActiveTab }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Close sidebar on mobile after clicking an action
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-[#DDDDDD]"
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? (
          <HiX className="w-6 h-6 text-[#555555]" />
        ) : (
          <HiMenu className="w-6 h-6 text-[#555555]" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative top-0 left-0 h-full z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="w-[280px] md:w-[220px] lg:w-[250px] h-full flex flex-col gap-8 rounded-[20px] p-10 border border-[#DBDBDB] bg-[#F0F2F5] shadow-[0px_0px_8px_0px_#0000001A] pt-20 md:pt-10">
          <Action icon={FaRegPlusSquare} text="New MIP" onClick={() => handleTabClick(ACTIVE_TABS.WELCOME)} />
          <Action icon={CgPlayPauseR} text="FAQ" onClick={() => handleTabClick(ACTIVE_TABS.FAQ)} />
        </div>
      </div>
    </>
  );
}

