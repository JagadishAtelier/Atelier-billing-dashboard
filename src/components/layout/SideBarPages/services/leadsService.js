import axios from "axios";
import BASE_API from "../../../../api/api.js";

const API_BASE = `${BASE_API}/crm`;

// Function to get token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const leadsService = {

  // ✅ Get all leads (supports filters + pagination)
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/lead`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Get lead by ID
  async getById(id) {
    const res = await axios.get(`${API_BASE}/lead/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Get lead by phone number
  async getByPhone(phone) {
    const res = await axios.get(`${API_BASE}/lead/phone/${phone}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Create a new lead
  async create(data) {
    const res = await axios.post(`${API_BASE}/lead`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Update an existing lead
  async update(id, data) {
    const res = await axios.put(`${API_BASE}/lead/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Soft delete a lead
  async remove(id) {
    const res = await axios.delete(`${API_BASE}/lead/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },
};

export default leadsService;
