// CRMModule.jsx
import React, { useState } from "react";
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

const mockLeads = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1 555-0101",
    source: "Website",
    status: "new",
    value: 5000,
    assignedTo: "John Doe",
    lastContact: "2024-11-11",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    phone: "+1 555-0102",
    source: "Referral",
    status: "qualified",
    value: 8000,
    assignedTo: "Sarah Wilson",
    lastContact: "2024-11-10",
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol@example.com",
    phone: "+1 555-0103",
    source: "Walk-in",
    status: "contacted",
    value: 3500,
    assignedTo: "John Doe",
    lastContact: "2024-11-09",
  },
];

const mockCustomers = [
  {
    id: "1",
    name: "David Brown",
    email: "david@example.com",
    phone: "+1 555-1001",
    segment: "high_value",
    totalPurchases: 45,
    totalSpent: 125000,
    lastPurchase: "2024-11-11",
    loyalty: 95,
    favoriteProducts: ["iPhone 15 Pro", "MacBook Air"],
  },
  {
    id: "2",
    name: "Emma Wilson",
    email: "emma@example.com",
    phone: "+1 555-1002",
    segment: "regular",
    totalPurchases: 12,
    totalSpent: 8500,
    lastPurchase: "2024-11-08",
    loyalty: 65,
    favoriteProducts: ["Samsung Galaxy"],
  },
  {
    id: "3",
    name: "Frank Miller",
    email: "frank@example.com",
    phone: "+1 555-1003",
    segment: "inactive",
    totalPurchases: 3,
    totalSpent: 1200,
    lastPurchase: "2024-08-15",
    loyalty: 25,
    favoriteProducts: ["Headphones"],
  },
];

export default function CRMModule() {
  const [leads, setLeads] = useState(mockLeads);
  const [customers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("leads");

  // form state for Add Lead
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    source: "Website",
    value: "",
    assignedTo: "John Doe",
    notes: "",
  });

  const getStatusColor = (status) => {
    switch (status) {
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
    switch (segment) {
      case "vip":
        return "bg-purple-100 text-purple-700";
      case "high_value":
        return "bg-green-100 text-green-700";
      case "regular":
        return "bg-blue-100 text-blue-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleDeleteLead = (id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    toast.success("Lead deleted successfully");
  };

  const handleOpenAdd = () => {
    setNewLead({
      name: "",
      email: "",
      phone: "",
      source: "Website",
      value: "",
      assignedTo: "John Doe",
      notes: "",
    });
    setIsAddLeadOpen(true);
  };

  const handleAddLead = () => {
    const id = String(Date.now());
    const lead = {
      id,
      name: newLead.name || "Unnamed",
      email: newLead.email || "",
      phone: newLead.phone || "",
      source: newLead.source,
      status: "new",
      value: Number(newLead.value) || 0,
      assignedTo: newLead.assignedTo,
      lastContact: new Date().toISOString().slice(0, 10),
      notes: newLead.notes,
    };
    setLeads((p) => [lead, ...p]);
    setIsAddLeadOpen(false);
    toast.success("Lead added successfully");
  };

  const filteredLeads = leads.filter((l) =>
    [l.name, l.email, l.phone, l.source].join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-2 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customer Relationship Management</h1>
          <p className="text-gray-500 mt-1">Manage leads, track customer engagement, and boost loyalty</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 !text-white hover:opacity-95"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Leads</p>
              <p className="mt-2 text-3xl">{leads.length}</p>
              <p className="text-blue-100 text-sm mt-1">{leads.filter((l) => l.status === "new").length} New</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}   className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Customers</p>
              <p className="mt-2 text-3xl">{customers.filter((c) => c.segment !== "inactive").length}</p>
              <p className="text-green-100 text-sm mt-1">{customers.filter((c) => c.segment === "high_value").length} High Value</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Star className="w-8 h-8" />
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}   className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Customer LTV</p>
              <p className="mt-2 text-3xl">
              ${((customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length) / 1000).toFixed(1)}K
</p>
              <p className="text-purple-100 text-sm mt-1">Avg per customer</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <IndianRupee className="w-8 h-8" />
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}   className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Conversion Rate</p>
              <p className="mt-2 text-3xl">24%</p>
              <p className="text-orange-100 text-sm mt-1">+5% this month</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div>
      <div className="flex gap-6 items-center bg-white border border-gray-300 px-6 py-2 rounded-full w-fit shadow-sm">
  {[
    { key: "leads", label: "Leads Pipeline" },
    { key: "customers", label: "Customer Insights" },
    { key: "analytics", label: "Analytics" },
  ].map((t) => (
    <button
      key={t.key}
      onClick={() => setActiveTab(t.key)}
      className={`
        px-4 py-2 rounded-md text-sm font-medium transition
        ${activeTab === t.key
          ? "text-purple-600 font-semibold"
          : "text-gray-700"
        }
      `}
    >
      {t.label}
    </button>
  ))}
</div>
        {/* Leads Tab */}
         {activeTab === "leads" && (
          <div className="space-y-6 mt-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">

<div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 w-full">
  <Search className="w-4 h-4 text-gray-400 mr-2" />
  <input
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search leads..."
    className="bg-gray-100 w-full focus:outline-none text-sm text-gray-700"
  />
</div>
<div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 cursor-pointer">
  <Filter className="w-4 h-4 text-gray-500 mr-2" />
  <select
    className="bg-gray-100 text-sm text-gray-700 focus:outline-none"
  >
    <option value="all">Filter by status</option>
    <option value="new">New</option>
    <option value="contacted">Contacted</option>
    <option value="qualified">Qualified</option>
  </select>
</div>
</div>
       
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLeads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">{lead.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 className="text-gray-900 font-medium">{lead.name}</h3>
                            <span className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-sm ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <button className="p-2 rounded-md hover:bg-gray-100">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-2 rounded-md hover:bg-gray-100"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" /> <span>{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" /> <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> <span>Last contact: {lead.lastContact}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-gray-500 text-sm">Expected Value</p>
                          <p className="text-gray-900">₹{lead.value.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-sm">Assigned to</p>
                          <p className="text-gray-900 text-sm">{lead.assignedTo}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 px-3 py-2 border rounded-md flex items-center justify-center gap-2">
                          <Phone className="w-4 h-4" /> Call
                        </button>
                        <button className="flex-1 px-3 py-2 border rounded-md flex items-center justify-center gap-2">
                          <MessageSquare className="w-4 h-4" /> Note
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 gap-6">
              {customers.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xl font-medium">{customer.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-gray-900 font-medium">{customer.name}</h3>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getSegmentColor(customer.segment)}`}>
                                {customer.segment.replace("_", " ")}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" /> <span>{customer.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" /> <span>{customer.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-8">
                          <div className="text-center">
                            <p className="text-gray-500 text-sm">Total Purchases</p>
                            <p className="text-gray-900 text-xl mt-1">{customer.totalPurchases}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 text-sm">Total Spent</p>
                            <p className="text-green-600 text-xl mt-1">₹{customer.totalSpent.toLocaleString("en-IN")}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 text-sm">Loyalty</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-5 h-5 text-yellow-500" />
                              <span className="text-gray-900 text-xl">{customer.loyalty}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-500 text-sm">Last Purchase</p>
                            <p className="text-gray-900">{customer.lastPurchase}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-sm mb-2">Favorite Products</p>
                            <div className="flex gap-2">
                              {customer.favoriteProducts.map((product) => (
                                <span key={product} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                                  {product}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 border rounded-md text-sm flex items-center gap-2">
                              <Mail className="w-4 h-4" /> Email
                            </button>
                            <button className="px-4 py-2 bg-black !text-white rounded-lg shadow hover:bg-gray-900 transition flex items-center gap-2">View Details</button>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-medium mb-4">Customer Segmentation</h3>
                <div className="space-y-4">
                  {["VIP", "High Value", "Regular", "Inactive"].map((segment, index) => {
                    const count = customers.filter((c) => c.segment.replace("_", " ").toLowerCase() === segment.toLowerCase()).length;
                    const percentage = (count / customers.length) * 100 || 0;
                    return (
                      <div key={segment}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700">{segment}</span>
                          <span className="text-gray-900">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              index === 0 ? "bg-purple-500" : index === 1 ? "bg-green-500" : index === 2 ? "bg-blue-500" : "bg-gray-400"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-medium mb-4">Lead Source Performance</h3>
                <div className="space-y-4">
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

      {/* Add Lead Modal (Tailwind-only) */}
      {isAddLeadOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center pt-24"
        >
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsAddLeadOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-medium">Add New Lead</h3>
              <button onClick={() => setIsAddLeadOpen(false)} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Full Name</label>
                <input
                  value={newLead.name}
                  onChange={(e) => setNewLead((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Email</label>
                <input
                  value={newLead.email}
                  onChange={(e) => setNewLead((s) => ({ ...s, email: e.target.value }))}
                  type="email"
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Phone</label>
                <input
                  value={newLead.phone}
                  onChange={(e) => setNewLead((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="+1 555-0000"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Source</label>
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead((s) => ({ ...s, source: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option>Website</option>
                  <option>Referral</option>
                  <option>Walk-in</option>
                  <option>Social Media</option>
                  <option>Advertising</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Expected Value</label>
                <input
                  value={newLead.value}
                  onChange={(e) => setNewLead((s) => ({ ...s, value: e.target.value }))}
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Assign To</label>
                <select
                  value={newLead.assignedTo}
                  onChange={(e) => setNewLead((s) => ({ ...s, assignedTo: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option>John Doe</option>
                  <option>Sarah Wilson</option>
                  <option>Mike Johnson</option>
                </select>
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-sm text-gray-700">Notes</label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead((s) => ({ ...s, notes: e.target.value }))}
                  placeholder="Add any notes..."
                  className="w-full px-3 py-2 border rounded-md h-24"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t">
              <button onClick={() => setIsAddLeadOpen(false)} className="px-4 py-2 rounded-md border">Cancel</button>
              <button onClick={handleAddLead} className="px-4 py-2 rounded-md bg-purple-600 text-white">Add Lead</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}