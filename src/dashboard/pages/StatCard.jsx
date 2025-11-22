import React from "react";
import { RightOutlined } from "@ant-design/icons";

const StatCard = ({ title, value, meta, gradient, icon }) => {
  return (
    <div
      className="rounded-xl overflow-hidden h-[140px] shadow-[0_10px_30px_rgba(2,6,23,0.06)]"
      style={{ background: gradient }}
    >
      <div className="p-5 flex justify-between items-center text-white">
        
        {/* LEFT SECTION */}
        <div className="flex flex-col gap-1">
          <p className="text-[13px]">{title}</p>
          <p className="text-2xl  leading-none">{value}</p>
          <p className="text-[10px]  opacity-90">{meta}</p>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex flex-col items-end gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-white">{icon}</span>
          </div>

          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center cursor-pointer">
            <RightOutlined className="text-white/90 text-sm" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatCard;
