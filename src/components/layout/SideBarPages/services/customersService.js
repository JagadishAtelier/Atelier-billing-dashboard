// services/customersService.js
import axios from "axios";
import BASE_API from "../../../../api/api.js"; // adjust path to your project layout

// Base for CRM endpoints (routes define /customer on the crm router)
const API_BASE = `${BASE_API}/crm`;

// 🔐 get auth token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const customersService = {
  // ✅ Get all customers (supports filters + pagination via params)
  // Example params: { page: 1, limit: 20, search: 'john', is_active: true }
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/customer`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Get customer by ID
  async getById(id) {
    const res = await axios.get(`${API_BASE}/customer/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Get customer by phone
  async getByPhone(phone) {
    const res = await axios.get(`${API_BASE}/customer/phone/${encodeURIComponent(phone)}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Get customer by email
  async getByEmail(email) {
    const res = await axios.get(`${API_BASE}/customer/email/${encodeURIComponent(email)}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Create a new customer
  async create(data) {
    const res = await axios.post(`${API_BASE}/customer`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Update an existing customer
  async update(id, data) {
    const res = await axios.put(`${API_BASE}/customer/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Soft delete a customer
  async remove(id) {
    const res = await axios.delete(`${API_BASE}/customer/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },
};

export default customersService;
