import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://192.168.43.85:10000/api/v1/billing/product";

// Function to get token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const productService = {
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/product`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async getById(id) {
    const res = await axios.get(`${API_BASE}/product/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async getByCode(code) {
    const res = await axios.get(`${API_BASE}/product/code/${code}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async create(data) {
    const res = await axios.post(`${API_BASE}/product`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async update(id, data) {
    const res = await axios.put(`${API_BASE}/product/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async remove(id) {
    const res = await axios.delete(`${API_BASE}/product/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },
};

export default productService;
