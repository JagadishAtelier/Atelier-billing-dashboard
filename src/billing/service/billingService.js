// billingService.js
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://billing-backend-9hrh.onrender.com/api/v1/billing/billing";

// Function to get token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const billingService = {
  // 🔹 Get all billings (with optional filters + pagination)
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/billing`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Get single billing by ID (with items)
  async getById(id) {
    const res = await axios.get(`${API_BASE}/${id}/billing`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Create new billing with items
  async create(data) {
    const res = await axios.post(`${API_BASE}/billing`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Update billing
  async update(id, data) {
    const res = await axios.put(`${API_BASE}/billing/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Delete billing
  async remove(id) {
    const res = await axios.delete(`${API_BASE}/billing/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },
};

export default billingService;
