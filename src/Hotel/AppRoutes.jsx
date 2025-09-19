import { Routes, Route } from 'react-router-dom';
import Branch from "./pages/Branch";
import Hotel from "./pages/Hotel";
import DivisionPage from "./pages/DivisionMaster";
import Department from "./pages/Department";
import { BankOutlined, BranchesOutlined, ShareAltOutlined, ApartmentOutlined } from "@ant-design/icons";

export const HotelMenuItems = [
  {
    icon: <BankOutlined />,
    key: "/Hotel/pages/Hotel",
    label: "Hotel",
  },
  {
    icon: <BranchesOutlined />,
    key: "/company/pages/branch",
    label: "Branch",
  },
  {
    icon: <ApartmentOutlined />,
    key: "/company/pages/department",
    label: "Department",
  },
  {
    icon: <ShareAltOutlined />,
    key: "company/pages/division",
    label: "Division",
  },
];

const HotelRoutes = () => {
  return (
    <Routes>
      <Route path="pages/Hotel" element={<Hotel />} />
      <Route path="pages/branch" element={<Branch />} />
      <Route path="pages/department" element={<Department />} />
      <Route path="pages/division" element={<DivisionPage />} />
    </Routes>
  );
};

export default HotelRoutes;
