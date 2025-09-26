// dashboardService.js
import axios from "axios";
import BASE_API from "../../api/api.js";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${BASE_API}/dashboard`;

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
