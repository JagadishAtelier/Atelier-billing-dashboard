import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://192.168.43.85:10000/api/v1/billing/product";

// Function to get token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const subcategoryService = {
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/subcategory`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async getByCategory(categoryId) {
    const res = await axios.get(`${API_BASE}/subcategory?category_id=${categoryId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async getById(id) {
    const res = await axios.get(`${API_BASE}/subcategory/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async create(data) {
    const res = await axios.post(`${API_BASE}/subcategory`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async update(id, data) {
    const res = await axios.put(`${API_BASE}/subcategory/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  async remove(id) {
    const res = await axios.delete(`${API_BASE}/subcategory/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },
};

export default subcategoryService;
