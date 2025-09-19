import { Routes, Route } from "react-router-dom";
import ProductList from "./pages/ProductList";
import ProductForm from "./pages/ProductForm";


export const productMenuItems = [
  {
    key: "/products/list",
    label: "Product List",
    icon: null, // Icon handled in Sidebar
  },
  {
    key: "/products/add",
    label: "Add Product",
    icon: null,
  },
];

const ProductRoutes = () => {
  return (
    <Routes>
      <Route path="list" element={<ProductList />} />
      <Route path="add" element={<ProductForm />} />
      <Route path="edit/:id" element={<ProductForm />} />
    </Routes>
  );
};

export default ProductRoutes;
