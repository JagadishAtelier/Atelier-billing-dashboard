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

  // 🔹 NEW: Get today/yesterday/week/month statistics
  async getDashboardStats() {
    const res = await axios.get(`${API_BASE}/stats`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async getIncomingPOs() {
    const res = await axios.get(`${API_BASE}/incoming-pos`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async getTopProducts() {
    const res = await axios.get(`${API_BASE}/top-products`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // in dashboardService.js (frontend)
async getPOSummary() {
  const res = await axios.get(`${API_BASE}/po-summary`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });
  return res.data;
},

async getMonthlyCollections() {
  const res = await axios.get(`${API_BASE}/monthly-collections`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });
  return res.data;
},

// 🔹 Get low stock products
async getLowStock() {
  const res = await axios.get(`${API_BASE}/low-stock`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return res.data;
},


};

export default dashboardService;
