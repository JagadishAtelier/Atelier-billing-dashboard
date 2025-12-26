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

  /**
   * ✅ Bulk upload leads
   *
   * Usage:
   *  - bulkUpload([{ name, phone, email }, ...], { skipDuplicates: true })
   *  - bulkUpload({ leads: [...] }, { skipDuplicates: true, sendAsObject: true })
   *  - bulkUpload(formData, { skipDuplicates: true })   // if you later implement file upload on backend
   *
   * If `leads` is an Array, by default it's sent as the raw array body (controller accepts array).
   * If you want to send { leads: [...] } object, pass `sendAsObject: true`.
   */
  async bulkUpload(leads, { skipDuplicates = true, sendAsObject = false } = {}) {
    const qs = typeof skipDuplicates !== "undefined" ? `?skipDuplicates=${skipDuplicates}` : "";
    const url = `${API_BASE}/leadbulk${qs}`;

    const headers = {
      Authorization: `Bearer ${getAuthToken()}`,
    };

    // If caller passed FormData (file upload), send multipart form-data.
    if (typeof FormData !== "undefined" && leads instanceof FormData) {
      const res = await axios.post(url, leads, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    }

    // Prepare body: either raw array, or { leads: [...] } if requested
    let body;
    if (Array.isArray(leads)) {
      body = sendAsObject ? { leads } : leads;
    } else if (leads && typeof leads === "object") {
      // if user already passed an object (maybe { leads: [...] })
      body = leads;
    } else {
      throw new Error("Invalid input for bulkUpload: expected Array or FormData or object");
    }

    const res = await axios.post(url, body, {
      headers,
    });
    return res.data;
  },

  /**
   * Convenience: create FormData from a File and call bulkUpload.
   * Useful when you implement CSV/XLSX upload on backend.
   *
   * fileInput: File object (from <input type="file">)
   * fieldName: backend field name for file; default 'file'
   */
  async bulkUploadFile(fileInput, { fieldName = "file", skipDuplicates = true } = {}) {
    if (!fileInput) throw new Error("fileInput is required");
    const fd = new FormData();
    fd.append(fieldName, fileInput);
    return this.bulkUpload(fd, { skipDuplicates });
  },

};

export default leadsService;
