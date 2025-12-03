import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, IndianRupee, Calendar, Bed } from "lucide-react";

export default function StatCard({
  title,
  value,
  percentage,
  meta,
  icon,
  color = "#506EE4",
}) {
  const isPositive = percentage >= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-1 cursor-pointer hover:shadow-md"
    >
      {/* Header Section */}
      <div className="flex gap-3 items-start">
        <div
          className="w-16 h-16 mt-2 flex justify-center items-center rounded-lg"
          style={{ background: `${color}15` }}
        >
          {icon ? (
            icon
          ) : (
            <Users size={24} style={{ color }} />
          )}
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{value}</h2>
        <h4 className="text-[16px] uppercase text-gray-500 font-medium ">{title}</h4>
        
      </div>
        
      </div>

      {/* Content */}
      

      

      {/* Divider */}
      <div className="border-t border-dashed border-gray-100 my-1"></div>

      {/* Extra summary (optional UI area) */}
      <div className="flex justify-between items-center text-gray-500">
        <span className="text-[14px]">{meta}</span>
        
      </div>
    </motion.div>
  );
}
