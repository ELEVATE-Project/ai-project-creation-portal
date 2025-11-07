import React from "react";

export default function ConversationWrapperCard({ children }) {
  return (
    <div className="relative flex flex-col w-[100%] h-full rounded-[20px] p-[30px] border border-[#DBDBDB] bg-[#F0F2F5] shadow-[0px_0px_8px_0px_#0000001A]">
      {children}
    </div>
  );
}

