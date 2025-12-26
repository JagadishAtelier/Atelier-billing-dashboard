// services/crmtasks.service.js
import axios from "axios";
import BASE_API from "../../../../api/api.js";

const API_BASE = `${BASE_API}/crm`;

// Get token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const crmtasksService = {

  // ✅ Get all CRM tasks (with filters & pagination)
  async getAll(params = {}) {
    const res = await axios.get(`${API_BASE}/task`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Get task by ID
  async getById(id) {
    const res = await axios.get(`${API_BASE}/task/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Create task
  async create(data) {
    const res = await axios.post(`${API_BASE}/task`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Update task
  async update(id, data) {
    const res = await axios.put(`${API_BASE}/task/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  // ✅ Delete task (soft delete)
  async remove(id) {
    const res = await axios.delete(`${API_BASE}/task/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return res.data;
  },

  /**
   * ✅ Bulk upload CRM tasks
   *
   * Supports:
   * - Array of objects
   * - FormData (Excel upload)
   */
  async bulkUpload(tasks, { skipDuplicates = true } = {}) {
    const qs = typeof skipDuplicates !== "undefined"
      ? `?skipDuplicates=${skipDuplicates}`
      : "";

    const url = `${API_BASE}/taskbulk${qs}`;

    const headers = {
      Authorization: `Bearer ${getAuthToken()}`,
    };

    // If FormData (Excel upload)
    if (typeof FormData !== "undefined" && tasks instanceof FormData) {
      const res = await axios.post(url, tasks, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    }

    // Otherwise normal JSON payload
    const res = await axios.post(url, tasks, { headers });
    return res.data;
  },
};

export default crmtasksService;
