import React, { useEffect, useState } from "react";
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
  const arrowIconColor = arrowColor;

  // Detect tablet view (Tailwind md)
  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  });

  useEffect(() => {
    const onResize = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 🔹 Format number with k/M support and currency handling
  const formatValue = (input) => {
    if (!isTablet) return input;

    // Extract currency symbol (₹, $, etc.)
    const currencyMatch = String(input).match(/^[^\d.-]+/);
    const currency = currencyMatch ? currencyMatch[0] : "";

    // Extract numeric value
    const numeric = parseFloat(String(input).replace(/[^\d.-]/g, ""));
    if (isNaN(numeric) || numeric < 1000) return input;

    let formatted;
    if (numeric >= 1_000_000) {
      formatted = (numeric / 1_000_000).toFixed(1) + "M";
    } else {
      formatted = (numeric / 1000).toFixed(1) + "k";
    }

    // Remove .0 (4.0k → 4k)
    formatted = formatted.replace(".0", "");

    return `${currency}${formatted}`;
  };

  const displayValue = formatValue(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-1 cursor-pointer hover:shadow-md"
    >
      {/* Arrow */}
      {linkTo && (
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
      )}

      <div className="flex justify-between items-center text-gray-500">
        <div className="flex gap-3 items-start">
          <div
            className="w-14 h-14 mt-2 flex justify-center items-center rounded-lg"
            style={{ background: color }}
          >
            {icon ? icon : <Users size={24} style={{ color }} />}
          </div>

          <div>
            <h2 className="text-lg md:text-xl lg:text-3xl pt-4 font-bold text-gray-800">
              {displayValue}
            </h2>
          </div>
        </div>

        {typeof percentage !== "undefined" && (
          <div
            className={`text-sm font-medium flex items-center gap-1 ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <span>{percentage}%</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-gray-500">
        <span className="text-sm md:text-[14px]">{meta}</span>
      </div>
    </motion.div>
  );
}
