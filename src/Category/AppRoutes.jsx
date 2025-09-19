import { Routes, Route } from "react-router-dom";
import CategoryList from "../Product/pages/CategoryList";
import CategoryAdd from "../Product/pages/CategoryAdd";

// Sidebar menu items for Category
export const categoryMenuItems = [
  {
    key: "/categories/list",
    label: "Category List",
    icon: null, // Icon handled in Sidebar
  },
  {
    key: "/categories/add",
    label: "Add Category",
    icon: null,
  },
];

const CategoryRoutes = () => {
  return (
    <Routes>
      <Route path="list" element={<CategoryList />} />
      <Route path="add" element={<CategoryAdd />} />
      <Route path="edit/:id" element={<CategoryAdd />} />
    </Routes>
  );
};

export default CategoryRoutes;
