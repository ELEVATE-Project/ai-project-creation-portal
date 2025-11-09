import React from "react";

export default function ConversationWrapperCard({ children }) {
  return (
    <div className="relative flex flex-col w-[100%] h-full rounded-[20px] p-[30px] border border-[#DBDBDB] bg-[#F0F2F5] shadow-[0px_0px_8px_0px_#0000001A] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
      {children}
    </div>
  );
}

