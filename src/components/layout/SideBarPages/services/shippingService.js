// shippingService.js
import axios from "axios";
import BASE_API from "../../../../api/api.js";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${BASE_API}/shipping`;

// Function to get token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const shippingService = {
  // 🔹 Get all shippings (with optional filters + pagination)
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/shipping`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Get single shipping by ID (with items)
  async getById(id) {
    const res = await axios.get(`${API_BASE}/shipping/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Create new shipping with items
  async create(data) {
    const res = await axios.post(`${API_BASE}/shipping`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Update shipping
  async update(id, data) {
    const res = await axios.put(`${API_BASE}/shipping/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Delete shipping
  async remove(id) {
    const res = await axios.delete(`${API_BASE}/shipping/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },
};

export default shippingService;
