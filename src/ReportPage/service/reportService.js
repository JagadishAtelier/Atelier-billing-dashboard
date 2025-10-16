import axios from "axios";
import BASE_API from "../../api/api.js";

const API_BASE = `${BASE_API}/report`;
const ROLE_API = `${BASE_API}/user/role`;

// Helper: get token from localStorage
const getAuthToken = () => localStorage.getItem("token");

const reportService = {
  // ✅ Get User Report
  getRoles: async () => {
    const res = await axios.get(`${ROLE_API}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  async getUserReport(params = {}) {
    const res = await axios.get(`${API_BASE}/users`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      responseType: params.download_type ? "blob" : "json",
    });

    // Handle file download
    if (params.download_type) {
      const contentDisposition = res.headers["content-disposition"];
      const fileNameMatch = contentDisposition?.match(/filename="?(.+)"?/);
      const fileName = fileNameMatch ? fileNameMatch[1] : "user_report";
      return { fileName, blob: res.data };
    }

    return res.data;
  },

  // ✅ Get Billing Report
  async getBillingReport(params = {}) {
    const res = await axios.get(`${API_BASE}/billings`, {
      params,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      responseType: params.download_type ? "blob" : "json",
    });

    if (params.download_type) {
      const contentDisposition = res.headers["content-disposition"];
      const fileNameMatch = contentDisposition?.match(/filename="?(.+)"?/);
      const fileName = fileNameMatch ? fileNameMatch[1] : "billing_report";
      return { fileName, blob: res.data };
    }

    return res.data;
  },

  // ✅ Helper to download blob file
  downloadFile(blobData, fileName) {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default reportService;
