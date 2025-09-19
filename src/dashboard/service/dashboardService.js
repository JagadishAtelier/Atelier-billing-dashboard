// dashboardService.js
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://billing-backend-9hrh.onrender.com/api/v1/billing/dashboard";

// Function to get token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const dashboardService = {
  // 🔹 Get summary counts (total bills, total users, total products, total revenue)
  async getSummary() {
    const res = await axios.get(`${API_BASE}/summary`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Get recent 5 bills with items
  async getRecentBills() {
    const res = await axios.get(`${API_BASE}/recent-bills`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Get revenue grouped by date (last 7 days)
  async getRevenueByDate() {
    const res = await axios.get(`${API_BASE}/revenue`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },
};

export default dashboardService;
