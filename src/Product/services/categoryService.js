import axios from "axios";
import BASE_API from "../../api/api.js";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${BASE_API}/product`;

// Function to get token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const categoryService = {
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/category`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async getById(id) {
    const res = await axios.get(`${API_BASE}/category/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async create(data) {
    const res = await axios.post(`${API_BASE}/category`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async update(id, data) {
    const res = await axios.put(`${API_BASE}/category/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async remove(id) {
    const res = await axios.delete(`${API_BASE}/category/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },
};

export default categoryService;
