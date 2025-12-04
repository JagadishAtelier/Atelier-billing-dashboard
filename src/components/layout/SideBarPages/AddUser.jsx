// AddUser.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import userService from "./services/userService";
import roleService from "./services/roleService";

function AddUser() {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    role_id: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch roles for dropdown
  const fetchRoles = async () => {
    try {
      const res = await roleService.getAll();
      const rolesData = Array.isArray(res) ? res : res.data || [];
      setRoles(rolesData);
      return rolesData; // return roles for sequential fetching
    } catch (err) {
      console.error("Error fetching roles:", err);
      return [];
    }
  };

  // Fetch user if editing
  const fetchUser = async (rolesData) => {
    if (!id) return;
    try {
      const res = await userService.getById(id);
      const user = res;

      // Set form data
      setFormData({
        username: user.username,
        email: user.email || "",// leave blank for edit
        phone: user.phone || "",
        role_id: user.role_id || (user.role?.id ?? ""),
      });
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const rolesData = await fetchRoles(); // load roles first
      await fetchUser(rolesData);           // then fetch user
    };
    loadData();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // ✅ Only include the fields your backend expects
    const dataToSend = {
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      role_id: formData.role_id,
    };

    // Only send password when creating
    if (!id && formData.password) {
      dataToSend.password = formData.password;
    }

    if (id) {
      await userService.update(id, dataToSend);
    } else {
      await userService.create(dataToSend);
    }

    navigate("/user");
  } catch (err) {
    console.error("Error saving user:", err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="p-8 bg-white rounded-md shadow-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">{id ? "Edit User" : "Add User"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Name *</label>
          <input
            type="text"
            name="username"
            placeholder="Enter Name"
            value={formData.username}
            onChange={handleChange}
            className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm outline-none"
            required
          />
        </div>

        {/* Email & Password */}
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm outline-none"
              required
            />
          </div>

          {!id && (
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-medium">Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm outline-none"
                required
              />
            </div>
          )}
        </div>

        {/* Phone & Role */}
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium">Phone Number *</label>
            <input
              type="text"
              name="phone"
              placeholder="Enter Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm outline-none"
              required
            />
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium">Role *</label>
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm outline-none"
              required
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: "#506ee4", fontWeight: "500", fontSize: "16px", height: "40px", border: "none", color: "#fff", borderRadius: "4px", padding: "6px 16px", cursor: "pointer" }}
            className="bg-[#0E1680] !text-white py-2 px-8 font-semibold rounded-md hover:opacity-90"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddUser;
