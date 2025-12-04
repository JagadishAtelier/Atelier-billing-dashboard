// AddVendor.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import vendorService from "./services/vendorService";

function AddVendor() {
  const navigate = useNavigate();
  const { id } = useParams(); // for edit mode
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    gst_number: "",
  });

  // 🔹 Fetch vendor details if editing
  const fetchVendor = async () => {
    if (!id) return;
    try {
      const res = await vendorService.getById(id);
      const vendor = res?.data || res;
      setFormData({
        name: vendor.name || "",
        contact_person: vendor.contact_person || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        address: vendor.address || "",
        gst_number: vendor.gst_number || "",
      });
    } catch (err) {
      console.error("Error fetching vendor:", err);
      message.error("Failed to fetch vendor details");
    }
  };

  useEffect(() => {
    fetchVendor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 🔹 Handle change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // lightweight email validator
  const isValidEmail = (value) => {
    if (!value) return true; // only validate when provided
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  // 🔹 Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1) Trim all string fields
      const trimmed = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
      );

      // 2) Basic required validation using trimmed values
      if (!trimmed.name) {
        message.error("Name is required");
        setLoading(false);
        return;
      }
      if (!trimmed.contact_person) {
        message.error("Contact person is required");
        setLoading(false);
        return;
      }
      if (!trimmed.phone) {
        message.error("Phone number is required");
        setLoading(false);
        return;
      }
      if (!trimmed.address) {
        message.error("Address is required");
        setLoading(false);
        return;
      }
      if (!trimmed.gst_number) {
        message.error("GST number is required");
        setLoading(false);
        return;
      }

      // 3) Email validation only if provided
      if (trimmed.email && !isValidEmail(trimmed.email)) {
        message.error("Please enter a valid email address or leave it blank");
        setLoading(false);
        return;
      }

      // 4) Build payload: remove email key if it's an empty string so backend doesn't get ""
      const payload = { ...trimmed };
      if (payload.email === "") {
        delete payload.email;
      }

      // Debug: show the exact payload we'll send
      console.debug("Vendor payload ->", payload);

      // 5) Send to backend (use the payload object directly)
      if (id) {
        await vendorService.update(id, payload);
        message.success("Vendor updated successfully");
      } else {
        await vendorService.create(payload);
        message.success("Vendor created successfully");
      }

      navigate("/vendor");
    } catch (err) {
      // Better error logging for backend validation issues
      console.error("Error saving vendor:", err);
      const serverErrors = err?.response?.data;
      if (serverErrors) {
        console.error("Server response data:", serverErrors);
        // if server returns an array of validation errors, display first message
        if (Array.isArray(serverErrors.error) && serverErrors.error.length > 0) {
          const first = serverErrors.error[0];
          message.error(first.message || "Validation error from server");
        } else if (serverErrors.message) {
          message.error(serverErrors.message);
        } else {
          message.error("Failed to save vendor");
        }
      } else {
        message.error("Failed to save vendor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-md shadow-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">
        {id ? "Edit Vendor" : "Add Vendor"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Contact Person */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Contact Person *</label>
            <input
              type="text"
              name="contact_person"
              placeholder="Enter Contact Person"
              value={formData.contact_person}
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
            <small className="text-gray-500">Optional — leave blank if not available</small>
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

        {/* Address & GST */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Address *</label>
            <input
              type="text"
              name="address"
              placeholder="Enter Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 py-2 px-3 rounded-md text-sm outline-none"
              required
            />
          </div>

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

export default AddVendor;
