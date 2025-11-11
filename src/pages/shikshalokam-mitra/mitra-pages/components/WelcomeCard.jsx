import React from "react";

export default function WelcomeCard() {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 lg:gap-[20px] rounded-[20px] p-4 sm:p-6 lg:p-[30px] bg-white shadow-[0px_2px_4px_0px_#0000000D] mb-8 sm:mb-12 lg:mb-[70px]">
      <h1 className="font-medium text-[24px] leading-[36px] text-center text-[#333333]">
        Generate Micro Improvement Project
      </h1>
      <p className="font-normal text-base leading-[24px] text-center text-[#555555]">
        This guided conversation will help MItra AI understand your challenges,
        objective and stakeholders. Based on your responses, it will suggest
        tasks, surveys, and observations to build your complete solution — ready
        to download as a Word file.
      </p>
    </div>
  );
}
