// orderService.js
import axios from "axios";
import BASE_API from "../../../../api/api.js";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${BASE_API}/order/order`;

// 🔐 Get token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const orderService = {
  // 🔹 Get all orders (supports filters, pagination, etc.)
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Get order by ID
  async getById(id) {
    const res = await axios.get(`${API_BASE}/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Create a new order
  async create(data) {
    const res = await axios.post(`${API_BASE}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Update order by ID
  async update(id, data) {
    const res = await axios.put(`${API_BASE}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // 🔹 Delete order by ID
  async remove(id) {
    const res = await axios.delete(`${API_BASE}/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },
};

export default orderService;
