
import api from './Api';
import { message } from 'antd';
function extractMessage(response, defaultMsg) {
  const msg = response.data?.message || defaultMsg;
  console.log('Extracted success message:', msg);
  return msg;
}

function extractErrorMessage(error, defaultMsg) {
  let errMsg;
  if (error.response) {
    errMsg =
      error.response.data?.message ||
      error.response.data?.error ||
      (Array.isArray(error.response.data?.errors)
        ? error.response.data.errors.join(', ')
        : error.response.data?.errors) ||
      defaultMsg ||
      'Something went wrong';
  } else if (error.request) {
    errMsg = 'Network error: Unable to reach the server';
  } else {
    errMsg = error.message || 'Unexpected error occurred';
  }
  console.error('Extracted error message:', errMsg, 'Error details:', error);
  return errMsg;
}

export const departmentService = {
  // Fetch all departments without UI messages


  async getAllDepartments(params = {}) {
    const defaultParams = {
      page: 1,
      limit: 10,
      search: "",
      sort_by: "created_at",
      sort_order: "desc",


      status: "active",


      from_date: null,
      to_date: null,
      is_pdf: false,
      is_excel: false
    };

    const queryParams = { ...defaultParams, ...params };
    const response = await api.get('/company_ms/department', { params: queryParams });
    return response.data;
  },

  // Get department by ID
  getDepartmentById: async (id) => {
    const response = await api.get(`/company_ms/department/${id}`);
    return response.data;
  },


  createDepartment: async (data) => {
    const payload = {
      name: data.name,
      description: data.description,


      // head_of_department: data.head_of_department,
      phone: data.phone,
      email: data.email,
      status: data.status,
      // created_by: data.created_by || 1,
    };

    try {
      const res = await api.post('/company_ms/department', payload);
      const msg = extractMessage(res, 'Department created successfully');
      message.success(msg);
      return { success: true, data: res.data, statusCode: res.status };
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, 'Failed to create department');
      switch (status) {
        case 400:
        case 422:
          errMsg = extractErrorMessage(error, 'Invalid department data provided');
          break;
        case 409:
          errMsg = 'Duplicate department. Please check your input';
          break;
        case 429:
          errMsg = 'Too many requests. Please wait a few minutes';
          break;
        case 500:
          errMsg = 'Server error. Please try again later';
          break;
        default:
          errMsg = extractErrorMessage(error);
      }
      message.error(errMsg);
      return { success: false, error: errMsg, statusCode: status };
    }
  },



  updateDepartment: async (id, data) => {
    const payload = {
      name: data.name,
      description: data.description,


      // head_of_department: data.head_of_department ,
      phone: data.phone,
      email: data.email,
      status: data.status,
      updated_by: data.updated_by || 1,
    };

    try {
      const res = await api.put(`/company_ms/department/${id}`, payload);
      const msg = extractMessage(res, 'Department updated successfully');
      message.success(msg);
      return { success: true, data: res.data, statusCode: res.status };
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, 'Failed to update department');
      switch (status) {
        case 400:
        case 422:
          errMsg = extractErrorMessage(error, 'Invalid department data provided');
          break;
        case 404:
          errMsg = 'Department not found';
          break;
        case 409:
          errMsg = 'Duplicate department data. Please check your input';
          break;
        case 429:
          errMsg = 'Too many requests. Please wait a few minutes';
          break;
        case 500:
          errMsg = 'Server error. Please try again later';
          break;
        default:
          errMsg = extractErrorMessage(error);
      }
      message.error(errMsg);
      return { success: false, error: errMsg, statusCode: status };
    }
  },

  deleteDepartment: async (id) => {
    try {
      const res = await api.delete(`/company_ms/department/${id}`);
      const msg = extractMessage(res, 'Department deleted successfully');
      message.success(msg);
      return { success: true, data: res.data, statusCode: res.status };
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, 'Failed to delete department');
      switch (status) {
        case 400:
        case 422:
          errMsg = extractErrorMessage(error, 'Invalid request');
          break;
        case 404:
          errMsg = 'Department not found';
          break;
        case 429:
          errMsg = 'Too many requests. Please wait a few minutes';
          break;
        case 500:
          errMsg = 'Server error. Please try again later';
          break;
        default:
          errMsg = extractErrorMessage(error);
      }
      message.error(errMsg);
      return { success: false, error: errMsg, statusCode: status };
    }
  },


};

