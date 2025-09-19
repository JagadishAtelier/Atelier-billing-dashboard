// stock/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import StockList from "./pages/StockList";

export const stockMenuItems = [
  {
    key: "/stocks/list",
    label: "Stock List",
    icon: null, // Icon handled in Sidebar
  },
//   {
//     key: "/stocks/bulk-upload",
//     label: "Bulk Upload",
//     icon: null,
//   },
];

const StockRoutes = () => {
  return (
    <Routes>
  <Route path="list" element={<StockList />} />
  {/* <Route path="bulk" element={<StockBulkUpload />} /> */}
</Routes>
  );
};

export default StockRoutes;
