import api from './Api';
import { message } from 'antd';

// Add error handling helper functions
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

export const divisionService = {
  // Get all divisions with optional filters
  getAllDivisions: async (params) => {
    const response = await api.get('/company_ms/division', { params });
    return response.data;
  },

  // Get division by ID
  getDivisionById: async (id) => {
    try {
      const response = await api.get(`/company_ms/division/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching division:', error);
      throw error;
    }
  }

  // getDivisionById: async (id) => {
  //   try {
  //     // Make sure this URL matches your backend API route
  //     const response = await api.get(`/company_ms/divisions/${id}`);
  //     if (response.data?.success) {
  //       return response.data;
  //     }
  //     throw new Error('Division not found');
  //   } catch (error) {
  //     console.error('Error fetching division:', error);
  //     throw error;
  //   }
  // }
  ,
//   // Create new division
//   createDivision: async (data) => {
//     const payload = {
//       name: data.name,
//       // head_of_division: data.head_of_division,
//       phone: data.phone,
//       email: data.email,
//       status: data.status,
//       created_by: 1,
//     };
//     const response = await api.post('/company_ms/division', payload);
//     return response.data;
//   },

//   // Update division
//   updateDivision: async (id, data) => {
//     const payload = {
//       name: data.name,
//       // head_of_division: data.head_of_division,
//       phone: data.phone,
//       email: data.email,
//       status: data.status,
//       updated_by: data.updated_by
//     };
//     const response = await api.put(`/company_ms/division/${id}`, payload);
//     return response.data;
//   },

//   // Delete division
//   deleteDivision: async (id) => {
//     const response = await api.delete(`/company_ms/division/${id}`);
//     return response.data;
//   }
// };


createDivision: async (data) => {
    const payload = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      status: data.status,
      created_by: 1,
    };

    try {
      const res = await api.post('/company_ms/division', payload);
      const msg = extractMessage(res, 'Division created successfully');
      message.success(msg);
      return { success: true, data: res.data, statusCode: res.status };
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, 'Failed to create division');
      switch (status) {
        case 400:
        case 422:
          errMsg = extractErrorMessage(error, 'Invalid division data provided');
          break;
        case 409:
          errMsg = 'Duplicate division. Please check your input';
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

  // Update division
  updateDivision: async (id, data) => {
    const payload = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      status: data.status,
      updated_by: data.updated_by || 1,
    };

    try {
      const res = await api.put(`/company_ms/division/${id}`, payload);
      const msg = extractMessage(res, 'Division updated successfully');
      message.success(msg);
      return { success: true, data: res.data, statusCode: res.status };
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, 'Failed to update division');
      switch (status) {
        case 400:
        case 422:
          errMsg = extractErrorMessage(error, 'Invalid division data provided');
          break;
        case 404:
          errMsg = 'Division not found';
          break;
        case 409:
          errMsg = 'Duplicate division data. Please check your input';
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

  // Delete division
  deleteDivision: async (id) => {
    try {
      const res = await api.delete(`/company_ms/division/${id}`);
      const msg = extractMessage(res, 'Division deleted successfully');
      message.success(msg);
      return { success: true, data: res.data, statusCode: res.status };
    } catch (error) {
      const status = error.response?.status;
      let errMsg = extractErrorMessage(error, 'Failed to delete division');
      switch (status) {
        case 400:
        case 422:
          errMsg = extractErrorMessage(error, 'Invalid request');
          break;
        case 404:
          errMsg = 'Division not found';
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