// AddUser.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import userService from "./services/userService";
import roleService from "./services/roleService";
import branchService from "./services/branchService";

function AddUser() {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode

  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    role_id: "",
    branch_id: "",    // NEW
    branch_name: "",  // NEW: store branch name to send with payload
  });

  const [loading, setLoading] = useState(false);

  // ---------------------------------------
  // 🔍 Check role from localStorage
  // ---------------------------------------
  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role && role.toLowerCase() === "super admin") {
      setIsAdmin(true); // only super admin can see branch
    } else {
      setIsAdmin(false);
    }
  }, []);

  // ---------------------------------------
  // 🔹 Fetch roles
  // ---------------------------------------
  const fetchRoles = async () => {
    try {
      const res = await roleService.getAll();
      const rolesData = Array.isArray(res) ? res : res.data || [];
      setRoles(rolesData);
      return rolesData;
    } catch (err) {
      console.error("Error fetching roles:", err);
      return [];
    }
  };

  // ---------------------------------------
  // 🔹 Fetch branches (ONLY if Admin / Super Admin)
  // ---------------------------------------
  const fetchBranches = async () => {
    if (!isAdmin) return []; // only admin users can see branch dropdown

    try {
      const res = await branchService.getAll({ limit: 100 });
      const branchData = res?.data || res;
      setBranches(branchData);
      return branchData;
    } catch (err) {
      console.error("Error fetching branches:", err);
      return [];
    }
  };

  // ---------------------------------------
  // 🔹 Fetch user for editing
  // ---------------------------------------
  const fetchUser = async () => {
    if (!id) return;
    try {
      const res = await userService.getById(id);
      const user = res;

      setFormData((prev) => ({
        ...prev,
        username: user.username,
        email: user.email || "",
        phone: user.phone || "",
        role_id: user.role_id || user.role?.id || "",
        branch_id: user.branch_id || user.branch?.id || "", // NEW
        branch_name: user.branch?.name || "",               // NEW (if editing)
      }));
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  // ---------------------------------------
  // 🔹 Load everything in sequence
  // ---------------------------------------
  useEffect(() => {
    const loadData = async () => {
      await fetchRoles();
      await fetchBranches(); // Only loads if admin
      await fetchUser();
    };
    loadData();
  }, [id, isAdmin]);

  // ---------------------------------------
  // 🔹 Handle Input Change
  // ---------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    // If branch select changed, also set branch_name
    if (name === "branch_id") {
      const selectedBranch = branches.find((b) => String(b.id) === String(value));
      setFormData((prev) => ({
        ...prev,
        branch_id: value,
        branch_name: selectedBranch?.name || "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------------------------------
  // 🔹 Submit
  // ---------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        role_id: formData.role_id,
      };

      // Only admin (super admin) users send branch_id + branch_name
      if (isAdmin) {
        payload.branch_id = formData.branch_id;

        // ensure branch_name exists: prefer formData.branch_name, fallback to lookup
        payload.branch_name =
          formData.branch_name ||
          (branches.find((b) => String(b.id) === String(formData.branch_id))?.name || "");
      }

      // Add password only in create mode
      if (!id && formData.password) {
        payload.password = formData.password;
      }

      if (id) {
        await userService.update(id, payload);
      } else {
        await userService.create(payload);
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
      <h2 className="text-2xl font-semibold mb-4">
        {id ? "Edit User" : "Add User"}
      </h2>

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

        {/* Email + Password */}
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm"
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
                className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm"
                required
              />
            </div>
          )}
        </div>

        {/* Phone + Role */}
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium">Phone Number *</label>
            <input
              type="text"
              name="phone"
              placeholder="Enter Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm"
              required
            />
          </div>

          {/* Role Dropdown */}
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium">Role *</label>
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm"
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

        {/* Branch (ONLY FOR ADMIN / SUPER ADMIN USERS) */}
        {isAdmin && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Branch *</label>
            <select
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
              className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#506ee4",
              fontWeight: "500",
              fontSize: "16px",
              height: "40px",
              border: "none",
              color: "#fff",
              borderRadius: "4px",
              padding: "6px 16px",
              cursor: "pointer",
            }}
            className="bg-[#0E1680] text-white py-2 px-8 font-semibold rounded-md hover:opacity-90"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddUser;
