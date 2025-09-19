import api from "./Api";
import { message } from "antd";

function extractMessage(response, defaultMsg) {
  const msg = response.data?.message || defaultMsg;
  console.log("Extracted success message:", msg);
  return msg;
}

function extractErrorMessage(error, defaultMsg) {
  let errMsg;
  if (error.response) {
    errMsg =
      error.response.data?.message ||
      error.response.data?.error ||
      (error.response.data?.errors && Array.isArray(error.response.data.errors)
        ? error.response.data.errors.join(", ")
        : error.response.data?.errors) ||
      defaultMsg ||
      "Something went wrong";
  } else if (error.request) {
    errMsg = "Network error: Unable to reach the server";
  } else {
    errMsg = error.message || "Unexpected error occurred";
  }
  console.log("Extracted error message:", errMsg, "Error details:", error);
  return errMsg;
}
export const companyService = {
  createCompany: async (companyData) => {
    try {
      const res = await api.post("company_ms/company/", companyData);

      if (res.status === 200 || res.status === 201) {
        const msg = extractMessage(res, "Company created successfully");
        message.success(msg);
        return { success: true, data: res.data, statusCode: res.status };
      }
      throw new Error("Unexpected response status");
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, "Failed to create company");
      switch (status) {
        case 400:

        case 422:
          errMsg = extractErrorMessage(error, "Invalid company data provided");
          break;
        case 404:
          errMsg = "Resource not found";
          break;
        case 409:
          errMsg = "Duplicate data entered. Please check your input";
          break;
        case 429:
          errMsg = "Too many requests. Please wait a few minutes";
          break;
        case 500:
          errMsg = "Server error. Please try again later";
          break;
        default:
          errMsg = extractErrorMessage(error, "Unexpected error occurred");
          break;
      }
      message.error(errMsg);
      return { success: false, error: errMsg, statusCode: status };
    }
  },

  getCompany: async (params = {}) => {
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) qp.append(k, v);
    });
    const url = qp.toString()
      ? `company_ms/company/?${qp.toString()}`
      : "company_ms/company/";
    try {
      const res = await api.get(url);
      const msg = extractMessage(res, "Fetched companies successfully");
      message.success(msg);
      return { success: true, data: res.data, statusCode: res.status };
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, "Failed to fetch companies");
      switch (status) {
        case 400:
        case 422:
          errMsg = extractErrorMessage(error, "Invalid request");
          break;
        case 429:
          errMsg = "Too many requests. Please wait a few minutes";
          break;
        case 500:
          errMsg = "Server error. Please try again later";
          break;
        default:
          errMsg = extractErrorMessage(error, "Unexpected error occurred");
          break;
      }
      message.error(errMsg);
      return { success: false, error: errMsg, statusCode: status };
    }
  },

  getCompanyById: async (id) => {
    try {
      const res = await api.get(`company_ms/company/${id}/`);
      const msg = extractMessage(res, "Fetched company details");
      message.success(msg);
      return { success: true, data: res.data, statusCode: res.status };
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(
        error,
        "Failed to fetch company details"
      );
      switch (status) {
        case 400:
        case 422:
          errMsg = extractErrorMessage(error, "Invalid request");
          break;
        case 404:
          errMsg = "Company not found";
          break;
        case 429:
          errMsg = "Too many requests. Please wait a few minutes";
          break;
        case 500:
          errMsg = "Server error. Please try again later";
          break;
        default:
          errMsg = extractErrorMessage(error, "Unexpected error occurred");

          break;
      }
      message.error(errMsg);
      return { success: false, error: errMsg, statusCode: status };
    }
  },

  updateCompany: async (id, newCompanyData) => {
    try {
      const res = await api.put(`company_ms/company/${id}/`, newCompanyData);
      if (res.status === 200 || res.status === 201) {
        const msg = extractMessage(res, "Company updated successfully");
        message.success(msg);
        return { success: true, data: res.data, statusCode: res.status };
      }
      throw new Error("Unexpected response status");
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, "Failed to update company");
      switch (status) {
        case 400:
        case 422:
          errMsg = extractErrorMessage(error, "Invalid company data provided");
          break;
        case 404:
          errMsg = "Company not found";
          break;
        case 409:
          errMsg = "Duplicate data entered. Please check your input";
          break;
        case 429:
          errMsg = "Too many requests. Please wait a few minutes";
          break;
        case 500:
          errMsg = "Server error. Please try again later";
          break;
        default:
          errMsg = extractErrorMessage(error, "Unexpected error occurred");
          break;
      }
      message.error(errMsg);
      return { success: false, error: errMsg, statusCode: status };
    }
  },

  deleteCompany: async (id) => {
    try {
      const res = await api.delete(`company_ms/company/${id}/`);

      if (res.status === 200 || res.status === 201) {
        const msg = extractMessage(res, "Company deleted successfully");
        message.success(msg);
        return { success: true, data: res.data, statusCode: res.status };
      }
      throw new Error("Unexpected response status");
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, "Failed to delete company");
      switch (status) {
        case 400:
        case 422:
          errMsg = extractErrorMessage(error, "Invalid request");
          break;
        case 404:
          errMsg = "Company not found";
          break;
        case 429:
          errMsg = "Too many requests. Please wait a few minutes";
          break;
        case 500:
          errMsg = "Server error. Please try again later";
          break;
        default:
          errMsg = extractErrorMessage(error, "Unexpected error occurred");
          break;
      }
      message.error(errMsg);
      return { success: false, error: errMsg, statusCode: status };
    }
  },
};

export const branchServices = {
  createBranch: async (branchData) => {
    try {
      const res = await api.post("company_ms/branch/", branchData);

      if (res.status === 200 || res.status === 201) {
        const msg = extractMessage(res, "Branch created successfully");
        message.success(msg);
        return { success: true, data: res.data, statusCode: res.status };
      }
      throw new Error("Unexpected response status");
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, "Failed to create branch");
      switch (status) {
        case 400:
        case 422:
          errMsg = extractErrorMessage(error, "Invalid branch data provided");
          break;
        case 404:
          errMsg = "Resource not found";
          break;
        case 409:
          errMsg = "Duplicate data entered. Please check your input";
          break;
        case 429:
          errMsg = "Too many requests. Please wait a few minutes";
          break;
        case 500:
          errMsg = "Server error. Please try again later";
          break;
        default:
          errMsg = extractErrorMessage(error, "Unexpected error occurred");
          break;
      }
      message.error(errMsg);
      return { success: false, error: errMsg, statusCode: status };
    }
  },
  getBranch: async (params = {}) => {
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) qp.append(k, v);
    });
    const url = qp.toString()
      ? `company_ms/branch/?${qp.toString()}`
      : "company_ms/branch/";
    try {
      const res = await api.get(url);
      const msg = extractMessage(res, "Fetched branches successfully");
      message.success(msg);

      return { success: true, data: res.data, statusCode: res.status };
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, "Failed to fetch branches");
      switch (status) {
        case 400:

        case 422:
          errMsg = extractErrorMessage(error, "Invalid request");
          break;
        case 429:
          errMsg = "Too many requests. Please wait a few minutes";
          break;
        case 500:
          errMsg = "Server error. Please try again later";
          break;
        default:
          errMsg = extractErrorMessage(error, "Unexpected error occurred");

          break;
      }
      message.error(errMsg);
      return { success: false, error: errMsg, statusCode: status };
    }
  },

  getBranchById: async (id) => {
    try {
      const res = await api.get(`company_ms/branch/${id}/`);

      const msg = extractMessage(res, "Fetched branch details");
      message.success(msg);

      return { success: true, data: res.data, statusCode: res.status };
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, "Failed to fetch branch details");
      switch (status) {
        case 400:
        case 422:
          errMsg = extractErrorMessage(error, "Invalid request");
          break;
        case 404:
          errMsg = "Branch not found";
          break;
        case 429:
          errMsg = "Too many requests. Please wait a few minutes";
          break;
        case 500:
          errMsg = "Server error. Please try again later";
          break;
        default:
          errMsg = extractErrorMessage(error, "Unexpected error occurred");

          break;
      }
      message.error(errMsg);
      return { success: false, error: errMsg, statusCode: status };
    }
  },

  updateBranch: async (id, newBranchData) => {
    try {
      const res = await api.put(`company_ms/branch/${id}/`, newBranchData);

      if (res.status === 200 || res.status === 201) {
        const msg = extractMessage(res, "Branch updated successfully");
        message.success(msg);
        return { success: true, data: res.data, statusCode: res.status };
      }
      throw new Error("Unexpected response status");
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, "Failed to update branch");
      switch (status) {
        case 400:

        case 422:
          errMsg = extractErrorMessage(error, "Invalid branch data provided");
          break;
        case 404:
          errMsg = "Branch not found";
          break;
        case 409:
          errMsg = "Duplicate data entered. Please check your input";
          break;
        case 429:
          errMsg = "Too many requests. Please wait a few minutes";
          break;
        case 500:
          errMsg = "Server error. Please try again later";
          break;
        default:
          errMsg = extractErrorMessage(error, "Unexpected error occurred");

          break;
      }
      message.error(errMsg);
      return { success: false, error: errMsg, statusCode: status };
    }
  },

  deleteBranch: async (id) => {
    try {
      const res = await api.delete(`company_ms/branch/${id}/`);

      if (res.status === 200 || res.status === 201) {
        const msg = extractMessage(res, "Branch deleted successfully");
        message.success(msg);
        return { success: true, data: res.data, statusCode: res.status };
      }
      throw new Error("Unexpected response status");
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, "Failed to delete branch");
      switch (status) {
        case 400:

        case 422:
          errMsg = extractErrorMessage(error, "Invalid request");
          break;
        case 404:
          errMsg = "Branch not found";
          break;
        case 429:
          errMsg = "Too many requests. Please wait a few minutes";
          break;
        case 500:
          errMsg = "Server error. Please try again later";
          break;
        default:
          errMsg = extractErrorMessage(error, "Unexpected error occurred");

          break;
      }
      message.error(errMsg);
      return { success: false, error: errMsg, statusCode: status };
    }
  },
};
