// CRMModule.jsx
import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Users,
  TrendingUp,
  IndianRupee,
  Star,
  Filter,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Edit,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import leadsService from "./services/leadsService"; // adjust path if needed
import userService from "./services/userService"; // adjust path if needed
import customersService from "./services/customersService"; // adjust path if needed

export default function CRMModule() {
  // Data state
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersMap, setUsersMap] = useState({}); // id -> display name

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("leads");
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Editing state for leads
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Customer details modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Convert lead -> customer modal
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState(null);
  const [convertForm, setConvertForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    company: "",
    gst_number: "",
    notes: "",
  });

  // Form state for Add/Edit Lead
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    source: "Website",
    value: "",
    assignedTo: "", // user id
    notes: "",
  });

  // helper badge color for lead status
  const getStatusColor = (status) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "contacted":
        return "bg-yellow-100 text-yellow-700";
      case "qualified":
        return "bg-purple-100 text-purple-700";
      case "converted":
        return "bg-green-100 text-green-700";
      case "lost":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getSegmentColor = (segment) => {
    const s = String(segment || "").toLowerCase();
    switch (s) {
      case "vip":
        return "bg-purple-100 text-purple-700";
      case "high_value":
      case "high value":
        return "bg-green-100 text-green-700";
      case "regular":
        return "bg-blue-100 text-blue-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Fetch functions -------------------------------------------------------
  const fetchLeads = async (params = {}) => {
    setLoading(true);
    try {
      const data = await leadsService.getAll(params);
      const list = Array.isArray(data) ? data : data?.data || [];
      setLeads(list);
    } catch (err) {
      console.error("fetchLeads:", err);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (params = {}) => {
    setUsersLoading(true);
    try {
      const data = await userService.getAll(params);
      const list = Array.isArray(data) ? data : data?.data || [];
      setUsers(list);

      const map = {};
      list.forEach((u) => {
        const display = u.name || u.username || u.email || "Unknown";
        map[u.id] = display;
      });
      setUsersMap(map);

      // default assignedTo in form if empty
      if (!newLead.assignedTo && list.length > 0) {
        setNewLead((s) => ({ ...s, assignedTo: list[0].id }));
      }
    } catch (err) {
      console.error("fetchUsers:", err);
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCustomers = async (params = {}) => {
    setCustomersLoading(true);
    try {
      const data = await customersService.getAll(params);
      const list = Array.isArray(data) ? data : data?.data || [];
      setCustomers(list);
    } catch (err) {
      console.error("fetchCustomers:", err);
      toast.error("Failed to load customers");
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchUsers();
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CRUD helpers ----------------------------------------------------------
  const handleDeleteLead = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      await leadsService.remove(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast.success("Lead deleted");
    } catch (err) {
      console.error("handleDeleteLead:", err);
      toast.error("Failed to delete lead");
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setNewLead({
      name: "",
      email: "",
      phone: "",
      source: "Website",
      value: "",
      assignedTo: users[0]?.id || "",
      notes: "",
    });
    setIsAddLeadOpen(true);
  };

  // Edit lead: fetch by id and prefill
  const handleEditClick = async (id) => {
    try {
      setLoading(true);
      const data = await leadsService.getById(id);
      const leadObj = data?.data || data || null;
      if (!leadObj) {
        toast.error("Could not load lead");
        return;
      }

      setNewLead({
        name: leadObj.name || "",
        email: leadObj.email || "",
        phone: leadObj.phone || "",
        source: leadObj.source || "Website",
        value: leadObj.expected_value != null ? leadObj.expected_value : leadObj.value || "",
        assignedTo: leadObj.assigned_to || users[0]?.id || "",
        notes: leadObj.notes || "",
      });

      setIsEditing(true);
      setEditingId(id);
      setIsAddLeadOpen(true);
    } catch (err) {
      console.error("handleEditClick:", err);
      toast.error("Failed to load lead for edit");
    } finally {
      setLoading(false);
    }
  };

  // Create lead
  const handleAddLead = async () => {
    if (!newLead.name || !newLead.phone) {
      toast.error("Name & phone are required");
      return;
    }

    const payload = {
      name: newLead.name,
      phone: newLead.phone,
      email: newLead.email || undefined,
      source: newLead.source || "Website",
      assigned_to: newLead.assignedTo || undefined,
      expected_value: Number(newLead.value) || 0,
    };

    try {
      const created = await leadsService.create(payload);
      const leadObj = created?.data || created || null;

      if (leadObj && leadObj.id) {
        const assignedLabel = usersMap[leadObj.assigned_to] || usersMap[newLead.assignedTo] || "";
        setLeads((p) => [
          {
            id: leadObj.id,
            name: leadObj.name,
            email: leadObj.email || "",
            phone: leadObj.phone || "",
            source: leadObj.source || "Website",
            status: (leadObj.status || "New").toString(),
            expected_value: Number(newLead.value) || 0,
            value: Number(newLead.value) || 0,
            assigned_to: leadObj.assigned_to || newLead.assignedTo || null,
            assignedTo: assignedLabel,
            lastContact: new Date().toISOString().slice(0, 10),
            notes: newLead.notes,
            ...leadObj,
          },
          ...p,
        ]);
      } else {
        await fetchLeads();
      }

      setIsAddLeadOpen(false);
      toast.success("Lead added");
    } catch (err) {
      console.error("handleAddLead:", err);
      const message = err?.response?.data?.error || err?.message || "Failed to create lead";
      toast.error(message);
    }
  };

  // Update existing lead
  const handleUpdateLead = async () => {
    if (!editingId) {
      toast.error("No lead selected");
      return;
    }
    if (!newLead.name || !newLead.phone) {
      toast.error("Name & phone are required");
      return;
    }

    const payload = {
      name: newLead.name,
      phone: newLead.phone,
      email: newLead.email || undefined,
      source: newLead.source || "Website",
      assigned_to: newLead.assignedTo || undefined,
      expected_value: Number(newLead.value) || 0,
    };

    try {
      const updated = await leadsService.update(editingId, payload);
      const leadObj = updated?.data || updated || null;

      setLeads((prev) =>
        prev.map((l) => {
          if (l.id !== editingId) return l;
          const assignedLabel = usersMap[payload.assigned_to] || usersMap[newLead.assignedTo] || l.assignedTo || "";
          return {
            ...l,
            name: payload.name,
            email: payload.email || "",
            phone: payload.phone,
            source: payload.source,
            expected_value: payload.expected_value,
            value: payload.expected_value,
            assigned_to: payload.assigned_to || null,
            assignedTo: assignedLabel,
            ...(leadObj || {}),
          };
        })
      );

      setIsAddLeadOpen(false);
      setIsEditing(false);
      setEditingId(null);
      toast.success("Lead updated");
    } catch (err) {
      console.error("handleUpdateLead:", err);
      const message = err?.response?.data?.error || err?.message || "Failed to update lead";
      toast.error(message);
    }
  };

  // Convert lead -> open modal and prefill form
  const handleOpenConvert = (lead) => {
    setLeadToConvert(lead);
    setConvertForm({
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      address: "",
      company: "",
      gst_number: "",
      notes: lead.notes || "",
    });
    setIsConvertOpen(true);
  };

  // sanitize phone to a tel: friendly format (keeps leading + if present, otherwise digits)
  const sanitizePhone = (phone) => {
    if (!phone) return null;
    try {
      const str = String(phone).trim();
      // keep leading +, then digits only (strip spaces, dashes, parens, etc.)
      const keepPlus = str.startsWith("+");
      const digits = str.replace(/[^0-9]/g, "");
      if (!digits) return null;
      return keepPlus ? `+${digits}` : digits;
    } catch {
      return null;
    }
  };

  const handleCall = (phone) => {
    const cleaned = sanitizePhone(phone);
    if (!cleaned) {
      toast.error("No valid phone number");
      return;
    }

    // Use tel: link — will open dialer or call app on the client
    // Using window.location.href works reliably; window.open can be used too.
    window.location.href = `tel:${cleaned}`;
  };


  // Submit convert: create customer and update lead status
  const handleConvertSubmit = async () => {
    if (!convertForm.name || !convertForm.phone) {
      toast.error("Customer name and phone are required");
      return;
    }
    setConvertLoading(true);
    try {
      // Build payload conforming to createCustomerSchema
      const payload = {
        name: convertForm.name,
        phone: String(convertForm.phone),
        email: convertForm.email || undefined,
        address: convertForm.address || undefined,
        company: convertForm.company || undefined,
        gst_number: convertForm.gst_number || undefined,
      };

      const created = await customersService.create(payload);
      const createdCustomer = created?.data || created || null;

      // If creation succeeded, update UI customers list
      if (createdCustomer && (createdCustomer.id || createdCustomer.name)) {
        setCustomers((prev) => [createdCustomer, ...prev]);
        toast.success("Customer created");
      } else {
        // Fallback: refetch customers
        await fetchCustomers();
        toast.success("Customer created");
      }

      // Update lead status to "Converted"
      if (leadToConvert?.id) {
        try {
          await leadsService.update(leadToConvert.id, { status: "Converted" });
          setLeads((prev) => prev.map((l) => (l.id === leadToConvert.id ? { ...l, status: "Converted" } : l)));
        } catch (err) {
          console.error("Failed to update lead status after convert:", err);
          toast.warning("Customer added but failed to update lead status");
        }
      }

      // close modal
      setIsConvertOpen(false);
      setLeadToConvert(null);
    } catch (err) {
      console.error("handleConvertSubmit:", err);
      const message = err?.response?.data?.error || err?.message || "Failed to create customer";
      toast.error(message);
    } finally {
      setConvertLoading(false);
    }
  };

  // View customer details
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  // Client-side search filter (ok for small sets)
  const filteredLeads = leads.filter((l) =>
    [l.name, l.email, l.phone, l.source].join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // UI -------------------------------------------------------------------
  return (
    <div className="p-2 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customer Relationship Management</h1>
          <p className="text-gray-500 mt-1">Manage leads, track engagement, and boost loyalty</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleOpenAdd} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 !text-white hover:opacity-95">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>
      {/* Summary cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">

{/* Total Leads */}
<div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">

<div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#F3F5FF]">
    <img src="/icon/crm-leads.svg" alt="leads" className="w-14 h-14" />
  </div>
  <div>
    <h2 className="text-3xl font-bold">{leads.length}</h2>
    <p className="text-gray-700 font-semibold">TOTAL LEADS</p>
    <p className="text-gray-500 text-sm mt-2">
      {leads.filter(l => (l.status || "new").toLowerCase() === "new").length} New
    </p>
  </div>
</div>

{/* Active Customers */}
<div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">

  <div className="w-14 h-14 rounded-xl flex items-center justify-center">
    <img src="/icon/crm-customers.svg" alt="customers" className="w-14 h-14" />
  </div>
  <div>
    <h2 className="text-3xl font-bold">
      {customers.filter(c => c.is_active !== false).length}
    </h2>
    <p className="text-gray-700 font-semibold">ACTIVE CUSTOMERS</p>
    <p className="text-gray-500 text-sm mt-2">
      {customers.filter(c => c.segment === "high_value").length} High Value
    </p>
  </div>
</div>

{/* Customer LTV */}
<div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
  <div className="w-14 h-14 rounded-xl flex items-center justify-center">
    <img src="/icon/crm-ltv.svg" alt="ltv" className="w-14 h-14" />
  </div>
  <div>
    <h2 className="text-3xl font-bold">
      ₹{(
        (customers.reduce((s, c) => s + (c.totalSpent || 0), 0) /
          Math.max(customers.length, 1)) /
        1000
      ).toFixed(1)}K
    </h2>
    <p className="text-gray-700 font-semibold">CUSTOMER LTV</p>
    <p className="text-gray-500 text-sm mt-2">Avg per customer</p>
  </div>
</div>

{/* Conversion Rate */}
<div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
  <div className="w-14 h-14 rounded-xl flex items-center justify-center">
    <img src="/icon/crm-conversion.svg" alt="conversion" className="w-14 h-14" />
  </div>
  <div>
    <h2 className="text-3xl font-bold">24%</h2>
    <p className="text-gray-700 font-semibold">CONVERSION RATE</p>
    <p className="text-gray-500 text-sm mt-2">+5% this month</p>
  </div>
</div>

</div>


      {/* Tabs */}
      <div className="mt-4">
        <div className="flex items-center gap-8 bg-white border border-gray-300 px-6 py-2 rounded-full shadow-sm w-fit">
          {[{ key: "leads", label: "Leads Pipeline" }, { key: "customers", label: "Customer Insights" }, { key: "analytics", label: "Analytics" }].map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`text-sm font-medium transition ${activeTab === t.key ? "text-purple-600 font-semibold" : "text-gray-800"}`}>{t.label}</button>
          ))}
        </div>

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <div className="space-y-6 mt-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 w-full">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search leads..." className="bg-gray-100 w-full focus:outline-none text-sm text-gray-700" />
              </div>

              <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 cursor-pointer">
                <Filter className="w-4 h-4 text-gray-500 mr-2" />
                <select onChange={(e) => { const status = e.target.value; if (status === "all") fetchLeads(); else fetchLeads({ status }); }} className="bg-gray-100 text-sm text-gray-700 focus:outline-none">
                  <option value="all">Filter by status</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-6 bg-white rounded-xl shadow text-center">Loading leads...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLeads.map((lead, index) => {
                  const assignedLabel = usersMap[lead.assigned_to] || lead.assignedTo || "-";
                  const isNew = (lead.status || "New").toString().toLowerCase() === "new";
                  return (
                    <motion.div key={lead.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
                      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">{(lead.name || "U").charAt(0)}</span>
                              </div>
                              <div>
                                <h3 className="text-gray-900 font-medium">{lead.name}</h3>
                                <div>
                                  <span className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-sm ${getStatusColor(lead.status)}`}>{(lead.status || "New").toString()}</span>

                                </div>

                              </div>
                            </div>

                            <div className="flex gap-1">
                              <button onClick={() => handleEditClick(lead.id)} className="p-2 rounded-md hover:bg-gray-100"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteLead(lead.id)} className="p-2 rounded-md hover:bg-gray-100"><Trash2 className="w-4 h-4 text-red-600" /></button>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> <span>{lead.email}</span></div>
                            <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> <span>{lead.phone}</span></div>
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> <span>Last contact: {lead.lastContact || "-"}</span></div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div>
                              <p className="text-gray-500 text-sm">Expected Value</p>
                              <p className="text-gray-900">₹{(lead.expected_value || lead.value || 0).toLocaleString("en-IN")}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-500 text-sm">Assigned to</p>
                              <p className="text-gray-900 text-sm">{assignedLabel}</p>
                            </div>
                          </div>

                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={() => handleCall(lead.phone)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-center gap-2 bg-white hover:bg-gray-50 transition"
                            >
                              <Phone className="w-4 h-4" /> Call
                            </button>

                            {isNew && (
                              <div className=" text-right">
                                <button
                                  onClick={() => handleOpenConvert(lead)}
                                  className="px-6 py-2 rounded-md bg-green-600 !text-white text-sm hover:opacity-95"
                                >
                                  Convert
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Convert action (only when lead is New) */}

                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className="space-y-6 mt-6">
            {customersLoading ? (
              <div className="p-6 bg-white rounded-xl shadow text-center">Loading customers...</div>
            ) : customers.length === 0 ? (
              <div className="p-6 bg-white rounded-xl shadow text-center">No customers found</div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {customers.map((customer, index) => (
                  <motion.div key={customer.id || index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
                    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xl font-medium">{(customer.name || "U").charAt(0)}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-gray-900 font-medium">{customer.name}</h3>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getSegmentColor(customer.segment)}`}>{String(customer.segment || "").replace("_", " ")}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> <span>{customer.email}</span></div>
                                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> <span>{customer.phone}</span></div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-8">
                            <div className="text-center">
                              <p className="text-gray-500 text-sm">Total Purchases</p>
                              <p className="text-gray-900 text-xl mt-1">{customer.totalPurchases || 0}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-500 text-sm">Total Spent</p>
                              <p className="text-green-600 text-xl mt-1">₹{(customer.totalSpent || 0).toLocaleString("en-IN")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleViewCustomer(customer)} className="px-3 py-1 border rounded-md text-sm">View Details</button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-500 text-sm">Last Purchase</p>
                              <p className="text-gray-900">{customer.lastPurchase || "-"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-sm mb-2">Favorite Products</p>
                              <div className="flex gap-2">
                                {(customer.favoriteProducts || []).map((product) => (
                                  <span key={product} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">{product}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-medium mb-6">Customer Segmentation</h3>
                <div className="space-y-6">
                  {["VIP", "High Value", "Regular", "Inactive"].map((segment, index) => {
                    const count = customers.filter((c) => (String(c.segment || "").replace("_", " ").toLowerCase() === segment.toLowerCase())).length;
                    const percentage = (count / Math.max(customers.length, 1)) * 100 || 0;
                    return (
                      <div key={segment} className="pb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-800 text-[15px]">{segment}</span>
                          <span className="text-gray-900 text-[15px]">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className={`h-3 rounded-full ${index === 0 ? "bg-purple-500" : index === 1 ? "bg-green-500" : index === 2 ? "bg-blue-500" : "bg-gray-400"}`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-medium mb-4">Lead Source Performance</h3>
                <div className="space-y-6">
                  {["Website", "Referral", "Walk-in", "Social Media"].map((source) => {
                    const count = leads.filter((l) => l.source === source).length;
                    const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0;
                    return (
                      <div key={source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-gray-900">{source}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                        <span className="text-gray-600 ml-4">{count} leads</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Lead Modal */}
      {isAddLeadOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div className="fixed inset-0 bg-black/40" onClick={() => { setIsAddLeadOpen(false); setIsEditing(false); setEditingId(null); }} />
          <div className="relative bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-medium">{isEditing ? "Edit Lead" : "Add New Lead"}</h3>
              <button onClick={() => { setIsAddLeadOpen(false); setIsEditing(false); setEditingId(null); }} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Full Name</label>
                <input value={newLead.name} onChange={(e) => setNewLead((s) => ({ ...s, name: e.target.value }))} placeholder="Enter name" className="w-full px-3 py-2 bg-gray-100 rounded-md" />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Email</label>
                <input value={newLead.email} onChange={(e) => setNewLead((s) => ({ ...s, email: e.target.value }))} type="email" placeholder="email@example.com" className="w-full px-3 py-2 bg-gray-100 rounded-md" />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Phone</label>
                <input value={newLead.phone} onChange={(e) => setNewLead((s) => ({ ...s, phone: e.target.value }))} placeholder="+1 555-0000" className="w-full px-3 py-2 bg-gray-100 rounded-md" />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Source</label>
                <select value={newLead.source} onChange={(e) => setNewLead((s) => ({ ...s, source: e.target.value }))} className="w-full px-3 py-2 bg-gray-100 rounded-md">
                  <option>Website</option>
                  <option>Referral</option>
                  <option>Social Media</option>
                  <option>Advertisement</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Expected Value</label>
                <input value={newLead.value} onChange={(e) => setNewLead((s) => ({ ...s, value: e.target.value }))} type="number" placeholder="0" className="w-full px-3 py-2 bg-gray-100 rounded-md" />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Assign To</label>
                <select value={newLead.assignedTo} onChange={(e) => setNewLead((s) => ({ ...s, assignedTo: e.target.value }))} className="w-full px-3 py-2 bg-gray-100 rounded-md">
                  {usersLoading ? <option>Loading users...</option> : users.length > 0 ? users.map((u) => <option key={u.id} value={u.id}>{u.name || u.username || u.email}</option>) : <option>No users</option>}
                </select>
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-sm text-gray-700">Notes</label>
                <textarea value={newLead.notes} onChange={(e) => setNewLead((s) => ({ ...s, notes: e.target.value }))} placeholder="Add any notes..." className="w-full px-3 py-2 bg-gray-100 rounded-md h-24" />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t">
              <button onClick={() => { setIsAddLeadOpen(false); setIsEditing(false); setEditingId(null); }} className="px-4 py-2 rounded-md border">Cancel</button>
              {isEditing ? <button onClick={handleUpdateLead} className="px-4 py-2 rounded-md bg-purple-600 text-white">Update Lead</button> : <button onClick={handleAddLead} className="px-4 py-2 rounded-md bg-purple-600 text-white">Add Lead</button>}
            </div>
          </div>
        </div>
      )}

      {/* Convert Lead -> Customer Modal */}
      {isConvertOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div className="fixed inset-0 bg-black/40" onClick={() => { setIsConvertOpen(false); setLeadToConvert(null); }} />
          <div className="relative bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-medium">Convert Lead to Customer</h3>
              <button onClick={() => { setIsConvertOpen(false); setLeadToConvert(null); }} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Customer Name</label>
                <input value={convertForm.name} onChange={(e) => setConvertForm((s) => ({ ...s, name: e.target.value }))} placeholder="Customer name" className="w-full px-3 py-2 bg-gray-100 rounded-md" />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Phone</label>
                <input value={convertForm.phone} onChange={(e) => setConvertForm((s) => ({ ...s, phone: e.target.value }))} placeholder="Phone" className="w-full px-3 py-2 bg-gray-100 rounded-md" />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Email</label>
                <input value={convertForm.email} onChange={(e) => setConvertForm((s) => ({ ...s, email: e.target.value }))} type="email" placeholder="email@example.com" className="w-full px-3 py-2 bg-gray-100 rounded-md" />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Company</label>
                <input value={convertForm.company} onChange={(e) => setConvertForm((s) => ({ ...s, company: e.target.value }))} placeholder="Company (optional)" className="w-full px-3 py-2 bg-gray-100 rounded-md" />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Address</label>
                <input value={convertForm.address} onChange={(e) => setConvertForm((s) => ({ ...s, address: e.target.value }))} placeholder="Address (optional)" className="w-full px-3 py-2 bg-gray-100 rounded-md" />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">GST Number</label>
                <input value={convertForm.gst_number} onChange={(e) => setConvertForm((s) => ({ ...s, gst_number: e.target.value }))} placeholder="GST (optional)" className="w-full px-3 py-2 bg-gray-100 rounded-md" />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-sm text-gray-700">Notes</label>
                <textarea value={convertForm.notes} onChange={(e) => setConvertForm((s) => ({ ...s, notes: e.target.value }))} placeholder="Notes (optional)" className="w-full px-3 py-2 bg-gray-100 rounded-md h-24" />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t">
              <button onClick={() => { setIsConvertOpen(false); setLeadToConvert(null); }} className="px-4 py-2 rounded-md border">Cancel</button>
              <button onClick={handleConvertSubmit} disabled={convertLoading} className="px-4 py-2 rounded-md bg-green-600 text-white">
                {convertLoading ? "Converting..." : "Convert & Add Customer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer details modal */}
      {isCustomerModalOpen && selectedCustomer && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => { setIsCustomerModalOpen(false); setSelectedCustomer(null); }} />
          <div className="relative bg-white w-full max-w-xl mx-4 rounded-xl shadow-lg z-10 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                <p className="text-sm text-gray-600">{selectedCustomer.company || ""}</p>
              </div>
              <div>
                <button onClick={() => { setIsCustomerModalOpen(false); setSelectedCustomer(null); }} className="text-gray-500">Close</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div><strong>Phone</strong><div>{selectedCustomer.phone || "-"}</div></div>
              <div><strong>Email</strong><div>{selectedCustomer.email || "-"}</div></div>
              <div><strong>Address</strong><div>{selectedCustomer.address || "-"}</div></div>
              <div><strong>GST</strong><div>{selectedCustomer.gst_number || "-"}</div></div>
              <div className="col-span-2"><strong>Notes / Other</strong><div>{selectedCustomer.notes || "-"}</div></div>
            </div>

            <div className="mt-6 text-right">
              <button onClick={() => { setIsCustomerModalOpen(false); setSelectedCustomer(null); }} className="px-4 py-2 rounded-md bg-gray-100">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
