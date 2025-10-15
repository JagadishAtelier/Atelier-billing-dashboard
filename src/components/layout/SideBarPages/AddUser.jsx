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
      setRoles(res.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  // Fetch user if editing
  const fetchUser = async () => {
    if (!id) return;
    try {
      const res = await userService.getById(id);
      const user = res.data;
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "", // blank for edit
        phone: user.phone || "",
        role_id: user.role?.id || "",
      });
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchUser();
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
      if (id) {
        await userService.update(id, formData); // Edit
      } else {
        await userService.create(formData); // Add
      }
      navigate("/users");
    } catch (err) {
      console.error("Error saving user:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="relative flex items-center gap-2 cursor-pointer">
        <p className="text-2xl font-semibold my-0">{id ? "Edit User" : "Add User"}</p>
      </div>

      <form className="mt-10" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2 w-full">
          <p className="text-base">Name *</p>
          <input
            type="text"
            name="username"
            placeholder="Enter Name"
            value={formData.username}
            onChange={handleChange}
            className="w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white"
            required
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <p className="text-base">Email Id *</p>
          <input
            type="email"
            name="email"
            placeholder="Enter Email Id"
            value={formData.email}
            onChange={handleChange}
            className="w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white"
            required
          />
        </div>

        {!id && (
          <div className="flex flex-col gap-2 w-full">
            <p className="text-base">Password *</p>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white"
              required
            />
          </div>
        )}

        <div className="flex flex-col gap-2 w-full mt-2">
          <p className="text-base">Phone Number *</p>
          <input
            type="text"
            name="phone"
            placeholder="Enter Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white"
            required
          />
        </div>

        <div className="flex flex-col gap-2 w-full mt-2">
          <p className="text-base">Role *</p>
          <select
            name="role_id"
            value={formData.role_id}
            onChange={handleChange}
            className="w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white"
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

        <div className="flex justify-end mt-10">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1C2244] text-white py-3 px-24 font-semibold flex items-center justify-center gap-2 rounded-md"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddUser;
