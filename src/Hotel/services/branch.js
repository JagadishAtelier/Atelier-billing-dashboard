import api from "../services/Api";

// Create new branch
export const createBranch = async (data) => {
  const payload = {
    name: data.name,
    description: data.description|| "",
    head_of_branch: data.head_of_branch || null,
    phone: data.phone,
    email: data.email,
    status: data.status,
    created_by: 1,
  };

  const response = await api.post('/company_ms/branch', payload);
  return response.data;
};

