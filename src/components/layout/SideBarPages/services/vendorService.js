// vendorService.js
import axios from "axios";
import BASE_API from "../../../../api/api.js";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${BASE_API}/vendor/vendor`;

// 🔐 Get token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const vendorService = {
  // 🔹 Get all vendors (supports filters, pagination, etc.)
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Get vendor by ID
  async getById(id) {
    const res = await axios.get(`${API_BASE}/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Create a new vendor
  async create(data) {
    const res = await axios.post(`${API_BASE}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Update vendor by ID
  async update(id, data) {
    const res = await axios.put(`${API_BASE}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Delete vendor by ID
  async remove(id) {
    const res = await axios.delete(`${API_BASE}/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },
};

export default vendorService;
