// AddVendor.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
    }
  };

  useEffect(() => {
    fetchVendor();
  }, [id]);

  // 🔹 Handle change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await vendorService.update(id, formData);
      } else {
        await vendorService.create(formData);
      }
      navigate("/vendor");
    } catch (err) {
      console.error("Error saving vendor:", err);
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
