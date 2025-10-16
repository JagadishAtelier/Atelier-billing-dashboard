import axios from "axios";
import BASE_API from "../../api/api.js";

const API_BASE = `${BASE_API}/return/return`;

// Helper: get token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const returnService = {
  // ✅ Get all return records (with filters/pagination)
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Get a single return record by ID
  async getById(id) {
    const res = await axios.get(`${API_BASE}/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Create a new return entry
  async create(data) {
    const res = await axios.post(`${API_BASE}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Update a return record by ID
  async update(id, data) {
    const res = await axios.put(`${API_BASE}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Delete a return record by ID
  async remove(id) {
    const res = await axios.delete(`${API_BASE}/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },
};

export default returnService;
