
import { Suspense, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/Mainlayout";
// import hrms from "./components/assets/candidate.png";
import dashboard from "./components/assets/dashboard.png";
import CustomerBillCopy from "./billing/pages/CustomerBillCopy";
import CustomerBillForm from "./billing/pages/CustomerBillingForm";
//import Hotel from "../public/factory.png";
import Login from "./login/Login";
import ProtectedRoute from "./context/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Loading from "./utils/Loading";
import Settings from "./components/pages/Settings";
import UserPage from "./components/layout/SideBarPages/UserPage";
import AddUser from "./components/layout/SideBarPages/AddUser";
import VendorPage from "./components/layout/SideBarPages/VendorPage";
import AddVendor from "./components/layout/SideBarPages/AddVendor";
import OrderPage from "./components/layout/SideBarPages/OrderPage";
import AddOrder from "./components/layout/SideBarPages/AddOrder";
import ViewOrderDetails from "./components/layout/SideBarPages/ViewOrderDetails";
import ViewInwardData from "./inward/pages/ViewInwardData";
import ReturnPage from "./ReturnPage/ReturnPage";
import AddReturn from "./ReturnPage/AddReturn"
import ReportPage from "./ReportPage/ReportPage";
import ViewReturn from "./ReturnPage/ViewReturn";
import BranchPage from "./components/layout/SideBarPages/BranchPage";
import AddBranch from "./components/layout/SideBarPages/AddBranch";
import AIAnalytics from "./components/layout/SideBarPages/AIAnalytics";
import CRMModule from "./components/layout/SideBarPages/CRMModule";
import ShippingList from "./components/layout/SideBarPages/ShippingList";
import AddShipping from "./components/layout/SideBarPages/AddShipping";
import PackingList from "./components/layout/SideBarPages/PackingList";
import CrmTask from "./components/layout/SideBarPages/CrmTask";
import { Toaster } from "sonner";
import { RouteIcon } from "lucide-react";

// import master from "./components/assets/cloud.png";
const routeModules = import.meta.glob("./*/AppRoutes.jsx", { eager: true });

const moduleIcons = {
  Hotel: <img src="/factory.png" alt="company" className="w-7 h-9" />,

  // HMS: <img src={HMS} alt="HMS" className="w-7 h-9" />,
  dashboard: <img src={dashboard} alt="iot" className="w-6 h-6" />,
  

  // hrms: <img src={hrms} alt="iot" className="w-6 h-6 " />,

  // master: <img src={master} alt="master" className="w-7 h-9" />,
};
const App = () => {
  const modules = Object.entries(routeModules).map(([path, mod]) => {
    const match = path.match(/\.\/(.*?)\/AppRoutes\.jsx$/);
    const name = match?.[1];

    return {
      name,
      path: `/${name}/*`,
      element: mod.default,
      menuItems: mod[`${name}MenuItems`] || [],
    };
  });

  const menuItems = useMemo(() => {
    return modules.map(({ name, menuItems }) => ({
      key: name,
      icon: moduleIcons[name] || null,
      label: name.toUpperCase(),
      children: menuItems,
    }));
  }, [modules]);

  const getDefaultRedirect = () => {
    const filteredModules = modules.filter((mod) => mod.name !== "dashboard");
    return filteredModules.length > 0
      ? `/${filteredModules[0].name}/pages/dashboard`
      : "/404";
  };

  return (
    <BrowserRouter>
  <AuthProvider>
  <Toaster position="top-right" richColors closeButton />
  

    <Loading duration={3000} />
    <Suspense fallback={<div className="p-4"><Loading /></div>}>
      <Routes>
        {/* Public/Login routes */}
        <Route path="/" element={<Login />} />


        {/* Routes WITHOUT sidebar/header */}
        <Route
          path="/billing/customer-copy"
          element={
            <ProtectedRoute>
              <CustomerBillCopy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/customer-add"
          element={
            <ProtectedRoute>
              <CustomerBillForm />
            </ProtectedRoute>
          }
        />
        

        {/* Routes WITH sidebar/header */}
        <Route element={<MainLayout menuItems={menuItems} />}>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to={getDefaultRedirect()} replace />} />

          {modules.map(({ name, path, element: Element }) => (
            <Route
              key={name}
              path={path}
              element={
                <ProtectedRoute>
                  <Element />
                </ProtectedRoute>
              }
            />
          ))}
<Route
  path="/user"
  element={
    <ProtectedRoute>
      <UserPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/user/add"
  element={
    <ProtectedRoute>
      <AddUser />
    </ProtectedRoute>
  }
/>
<Route
  path="/user/edit/:id"
  element={
    <ProtectedRoute>
      <AddUser />
    </ProtectedRoute>
  }
/>
<Route
  path="/vendor"
  element={
    <ProtectedRoute>
      <VendorPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/vendor/add"
  element={
    <ProtectedRoute>
      <AddVendor />
    </ProtectedRoute>
  }
/>
<Route
  path="/vendor/edit/:id"
  element={
    <ProtectedRoute>
      <AddVendor />
    </ProtectedRoute>
  }
/>
<Route
path="/branch"
element={
    <ProtectedRoute>
      <BranchPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/branch/add"
  element={
    <ProtectedRoute>
      <AddBranch />
    </ProtectedRoute>
  }
/>
<Route
  path="/branch/edit/:id"
  element={
    <ProtectedRoute>
      <AddBranch />
    </ProtectedRoute>
  }
/>
<Route
  path="/order"
  element={
    <ProtectedRoute>
      <OrderPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/order/add"
  element={
    <ProtectedRoute>
      <AddOrder />
    </ProtectedRoute>
  }
/>
<Route
  path="/order/edit/:id"
  element={
    <ProtectedRoute>
      <AddOrder />
    </ProtectedRoute>
  }
/>
<Route
  path="/order/view/:id"
  element={
    <ProtectedRoute>
      <ViewOrderDetails />
    </ProtectedRoute>
  }
/>
<Route
  path="/view-inward-data"
  element={
    <ProtectedRoute>
      <ViewInwardData />
    </ProtectedRoute>
  }
/>
<Route
  path="/return"
  element={
    <ProtectedRoute>
      <ReturnPage />
    </ProtectedRoute>
  }
/>
<Route
path="/return/add"
element={
    <ProtectedRoute>
      <AddReturn />
    </ProtectedRoute>
  }
/>
<Route
path="/return/edit/:id"
element={
<ProtectedRoute>
      <AddReturn />
    </ProtectedRoute>
  }
/>
<Route
path="return/view/:id"
element={
<ProtectedRoute>
      <ViewReturn />
    </ProtectedRoute>
  }
/>

<Route
  path="/shipping"
  element={
    <ProtectedRoute>
      <ShippingList />
    </ProtectedRoute>
  }
/>

<Route
  path="/shipping/add"
  element={
    <ProtectedRoute>
      <AddShipping />
    </ProtectedRoute>
  }
/>
<Route
  path="/shipping/edit/:id"
  element={
    <ProtectedRoute>
      <AddShipping />
    </ProtectedRoute>
  }
/>

<Route
  path="/packing"
  element={
    <ProtectedRoute>
      <PackingList />
    </ProtectedRoute>
  }
/>

<Route
  path="/report"
  element={
    <ProtectedRoute>
      <ReportPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/ai-analytics"
  element={
    <ProtectedRoute>
      <AIAnalytics />
    </ProtectedRoute>
  }
/>
<Route
  path="/crm-module"
  element={
    <ProtectedRoute>  
      <CRMModule />
    </ProtectedRoute>
  }
/>
<Route
  path="/crm-tasks"
  element={
    <ProtectedRoute>  
      <CrmTask />
    </ProtectedRoute>
  }
/>

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={<div className="p-4 text-red-500">404 - Page Not Found</div>}
          />
        </Route>
      </Routes>
    </Suspense>
  </AuthProvider>
</BrowserRouter>


  );
};

export default App;

