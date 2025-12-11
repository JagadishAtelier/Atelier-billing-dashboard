// AddBranch.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import branchService from "./services/branchService";

function AddBranch() {
  const navigate = useNavigate();
  const { id } = useParams(); // for edit mode
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    email: "",
    phone: "",
    gst_number: "",
  });

  // 🔹 Fetch branch details if editing
  const fetchBranch = async () => {
    if (!id) return;
    try {
      const res = await branchService.getById(id);
      const branch = res?.data || res;

      setFormData({
        name: branch.name || "",
        location: branch.location || "",
        email: branch.email || "",
        phone: branch.phone || "",
        gst_number: branch.gst_number || "",
      });
    } catch (err) {
      console.error("Error fetching branch:", err);
      message.error("Failed to fetch branch details");
    }
  };

  useEffect(() => {
    fetchBranch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 🔹 Handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Lightweight email validator
  const isValidEmail = (value) => {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  // 🔹 Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Trim all values
      const trimmed = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [
          k,
          typeof v === "string" ? v.trim() : v,
        ])
      );

      // 2️⃣ Basic validations
      if (!trimmed.name) {
        message.error("Branch name is required");
        setLoading(false);
        return;
      }
      if (!trimmed.location) {
        message.error("Location is required");
        setLoading(false);
        return;
      }
      if (!trimmed.phone) {
        message.error("Phone number is required");
        setLoading(false);
        return;
      }
      if (!trimmed.gst_number) {
        message.error("GST number is required");
        setLoading(false);
        return;
      }

      // 3️⃣ Email validation if provided
      if (trimmed.email && !isValidEmail(trimmed.email)) {
        message.error("Please enter a valid email address or leave it blank");
        setLoading(false);
        return;
      }

      // 4️⃣ Build payload — remove empty email
      const payload = { ...trimmed };
      if (payload.email === "") delete payload.email;

      // Debug log
      console.debug("Branch payload →", payload);

      // 5️⃣ Send to backend
      if (id) {
        await branchService.update(id, payload);
        message.success("Branch updated successfully");
      } else {
        await branchService.create(payload);
        message.success("Branch created successfully");
      }

      navigate("/branch");
    } catch (err) {
      console.error("Error saving branch:", err);
      const serverErrors = err?.response?.data;

      if (serverErrors) {
        if (Array.isArray(serverErrors.error) && serverErrors.error.length > 0) {
          const first = serverErrors.error[0];
          message.error(first.message || "Validation error from server");
        } else if (serverErrors.message) {
          message.error(serverErrors.message);
        } else {
          message.error("Failed to save branch");
        }
      } else {
        message.error("Failed to save branch");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-md shadow-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">
        {id ? "Edit Branch" : "Add Branch"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Location */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Branch Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter Branch Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Location *</label>
            <input
              type="text"
              name="location"
              placeholder="Enter Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm outline-none"
              required
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email (optional)"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm outline-none"
            />
            <small className="text-gray-500">
              Optional — leave blank if not available
            </small>
          </div>

          <div className="flex flex-col gap-1 flex-1">
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
        </div>

        {/* GST Number */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">GST Number *</label>
            <input
              type="text"
              name="gst_number"
              placeholder="Enter GST Number"
              value={formData.gst_number}
              onChange={handleChange}
              className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm outline-none"
              required
            />
          </div>
        </div>

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
            className="bg-[#0E1680] !text-white py-2 px-8 font-semibold rounded-md hover:opacity-90"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddBranch;
