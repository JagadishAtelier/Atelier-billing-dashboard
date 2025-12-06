import React from "react";
import { motion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function StatCard({
  title,
  value,
  percentage,
  meta,
  icon,
  color = "#3b82f6",
  linkTo,
  arrowColor = "#000", 
}) {
  const isPositive = percentage >= 1;

  // compute a simple readable icon color (white for colored background)
  const arrowIconColor = arrowColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-1 cursor-pointer hover:shadow-md"
    >
      {/* Top-right round arrow (shows only when linkTo provided) */}
      {linkTo ? (
        <Link
          to={linkTo}
          aria-label={`Go to ${title || "detail"}`}
          className="absolute top-3 right-3 transform transition-transform duration-150 hover:scale-105"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: color,
              boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
            }}
          >
            <ArrowRight size={16} color={arrowIconColor} />
          </div>
        </Link>
      ) : null}

      <div className="flex justify-between items-center text-gray-500">
        <div className="flex gap-3 items-start">
          <div
            className="w-14 h-14 mt-2 flex justify-center items-center rounded-lg"
            style={{ background: `${color}` }}
          >
            {icon ? icon : <Users size={24} style={{ color }} />}
          </div>

          <div>
            {/* Responsive text sizes:
                - default (small phones): text-lg
                - tablet (md): text-xl (reduced compared to large desktop)
                - desktop/large (lg): text-3xl
            */}
            <h2 className="text-lg md:text-xl lg:text-3xl pt-4 font-bold text-gray-800">
              {value}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Optional percentage indicator (keeps existing behavior) */}
          {typeof percentage !== "undefined" && (
            <div
              className={`text-sm font-medium flex items-center gap-1 ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 10a1 1 0 011-1h3V6a1 1 0 112 0v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 01-1-1z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 transform rotate-45"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 10a1 1 0 011-1h3V6a1 1 0 112 0v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 01-1-1z" />
                </svg>
              )}
              <span>{percentage}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Extra summary (optional UI area) */}
      <div className="flex justify-between items-center text-gray-500">
        {/* Responsive meta text size: smaller on phones, slightly larger on tablet */}
        <span className="text-sm md:text-[14px]">{meta}</span>
      </div>
    </motion.div>
  );
}
