// inwardService.js
import axios from "axios";
import BASE_API from "../../api/api.js";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${BASE_API}/inward`;

// Function to get token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const inwardService = {
  // 🔹 Get all inwards (with optional filters + pagination)
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/inward`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Get single inward by ID (with items)
  async getById(id) {
    const res = await axios.get(`${API_BASE}/inward/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Create new inward with items
  async create(data) {
    const res = await axios.post(`${API_BASE}/inward`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Update inward
  async update(id, data) {
    const res = await axios.put(`${API_BASE}/inward/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Delete inward
  async remove(id) {
    const res = await axios.delete(`${API_BASE}/inward/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },
};

export default inwardService;
