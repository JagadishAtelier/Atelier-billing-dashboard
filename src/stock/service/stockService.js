// services/stockService.js
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://billing-backend-9hrh.onrender.com/api/v1/billing/stock";

// Function to get token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const stockService = {
  // ✅ Get all stock records with optional filters
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/stock`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Get stock by ID
  async getById(id) {
    const res = await axios.get(`${API_BASE}/stock/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Add single stock
  async create(data) {
    const res = await axios.post(`${API_BASE}/stock`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Bulk add stock
  async createBulk(dataArray) {
    const res = await axios.post(`${API_BASE}/stockbulk`, dataArray, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Update stock by ID
  async update(id, data) {
    const res = await axios.put(`${API_BASE}/stock/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Delete stock by ID
  async remove(id) {
    const res = await axios.delete(`${API_BASE}/stock/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },
};

export default stockService;
