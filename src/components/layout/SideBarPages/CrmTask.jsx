// CrmTask.jsx
import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Edit,
  Trash2,
  Users,
  Target,
  Clock,
  Clipboard,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import crmtasksService from "./services/crmtasksService"; 
import userService from "./services/userService";
import leadsService from "./services/leadsService"; 
import customersService from "./services/customersService";

export default function CrmTask() {
  // data
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [leadsMap, setLeadsMap] = useState({});
  const [customersMap, setCustomersMap] = useState({});

  // ui
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activePriorityFilter, setActivePriorityFilter] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");

  // add/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    related_type: "Lead", // Lead | Customer | Other
    related_id: "",
    title: "",
    due_date: "",
    fellow_up_date: "",
    priority: "Medium",
    status: "Not Started",
    assigned_to: "",
    notes: "",
  });

  // bulk
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkSummary, setBulkSummary] = useState(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // loaders for related lists
  const [usersLoading, setUsersLoading] = useState(false);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);

  // helpers for badge colors
  const priorityColor = (p) => {
    const s = (p || "").toLowerCase();
    if (s === "high") return "bg-red-100 text-red-700";
    if (s === "low") return "bg-green-100 text-green-700";
    return "bg-yellow-100 text-yellow-800";
  };
  const statusColor = (s) => {
    const v = (s || "").toLowerCase();
    if (v === "completed") return "bg-green-100 text-green-700";
    if (v === "in progress") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  // fetch functions -------------------------------------------------------
  const fetchTasks = async (params = {}) => {
    setLoading(true);
    try {
      const res = await crmtasksService.getAll(params);
      // service returns either array or { data: rows, ... }
      const list = Array.isArray(res) ? res : res?.data || [];
      setTasks(list);
    } catch (err) {
      console.error("fetchTasks:", err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await userService.getAll();
      const list = Array.isArray(res) ? res : res?.data || [];
      setUsers(list);
      const map = {};
      list.forEach((u) => (map[u.id] = u.name || u.username || u.email));
      setUsersMap(map);

      // default assigned_to in form if empty
      if (!form.assigned_to && list.length > 0) {
        setForm((f) => ({ ...f, assigned_to: list[0].id }));
      }
    } catch (err) {
      console.error("fetchUsers:", err);
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchLeads = async () => {
    setLeadsLoading(true);
    try {
      const res = await leadsService.getAll({ limit: 1000 });
      const list = Array.isArray(res) ? res : res?.data || [];
      const map = {};
      list.forEach((l) => (map[l.id] = l.name));
      setLeadsMap(map);
    } catch (err) {
      console.error("fetchLeads:", err);
    } finally {
      setLeadsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const res = await customersService.getAll({ limit: 1000 });
      const list = Array.isArray(res) ? res : res?.data || [];
      const map = {};
      list.forEach((c) => (map[c.id] = c.name));
      setCustomersMap(map);
    } catch (err) {
      console.error("fetchCustomers:", err);
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchLeads();
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CRUD helpers ----------------------------------------------------------
  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      related_type: "Lead",
      related_id: "",
      title: "",
      due_date: "",
      fellow_up_date: "",
      priority: "Medium",
      status: "Not Started",
      assigned_to: users[0]?.id || "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleEditClick = async (id) => {
    try {
      setLoading(true);
      const res = await crmtasksService.getById(id);
      const task = res?.data || res || null;
      if (!task) {
        toast.error("Task not found");
        return;
      }

      setForm({
        related_type: task.related_type || "Lead",
        related_id: task.related_id || "",
        title: task.title || "",
        due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : "",
        fellow_up_date: task.fellow_up_date ? new Date(task.fellow_up_date).toISOString().slice(0, 10) : "",
        priority: task.priority || "Medium",
        status: task.status || "Not Started",
        assigned_to: task.assigned_to || users[0]?.id || "",
        notes: task.notes || "",
      });
      setIsEditing(true);
      setEditingId(id);
      setIsModalOpen(true);
    } catch (err) {
      console.error("handleEditClick:", err);
      toast.error("Failed to load task for edit");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await crmtasksService.remove(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted");
    } catch (err) {
      console.error("handleDelete:", err);
      toast.error("Failed to delete task");
    }
  };

  const handleAddTask = async () => {
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    try {
      const payload = {
        ...form,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        fellow_up_date: form.fellow_up_date ? new Date(form.fellow_up_date).toISOString() : null,
      };
      const res = await crmtasksService.create(payload);
      const created = res?.data || res || null;
      if (created && created.id) {
        setTasks((p) => [created, ...p]);
      } else {
        await fetchTasks();
      }
      setIsModalOpen(false);
      toast.success("Task created");
    } catch (err) {
      console.error("handleAddTask:", err);
      const message = err?.response?.data?.error || err?.message || "Failed to create task";
      toast.error(message);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingId) {
      toast.error("No task selected");
      return;
    }
    try {
      const payload = {
        ...form,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        fellow_up_date: form.fellow_up_date ? new Date(form.fellow_up_date).toISOString() : null,
      };
      const res = await crmtasksService.update(editingId, payload);
      const updated = res?.data || res || null;

      setTasks((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...(updated || payload) } : t)));
      setIsModalOpen(false);
      setIsEditing(false);
      setEditingId(null);
      toast.success("Task updated");
    } catch (err) {
      console.error("handleUpdateTask:", err);
      const message = err?.response?.data?.error || err?.message || "Failed to update task";
      toast.error(message);
    }
  };

  // Bulk upload handlers -------------------------------------------------
  const handleBulkFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setBulkFile(f);
    setBulkSummary(null);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error("Please select a file");
      return;
    }
    setBulkUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", bulkFile);
      const res = await crmtasksService.bulkUpload(fd, { skipDuplicates });
      const summary = res?.summary ?? res;
      setBulkSummary(summary || { message: res?.message || "Uploaded" });
      await fetchTasks();
      toast.success("Bulk upload completed");
    } catch (err) {
      console.error("handleBulkUpload:", err);
      const message = err?.response?.data?.error || err?.message || "Bulk upload failed";
      toast.error(message);
    } finally {
      setBulkUploading(false);
    }
  };

  // Derived / filter
  const filtered = tasks.filter((t) => {
    const q = searchTerm.toLowerCase();
    const relatedName =
      (t.related_type === "Lead" ? leadsMap[t.related_id] : t.related_type === "Customer" ? customersMap[t.related_id] : "") || "";
    const assignee = usersMap[t.assigned_to] || "";
    const title = (t.title || "").toLowerCase();
    const matchSearch = [title, relatedName.toLowerCase(), assignee.toLowerCase()].join(" ").includes(q);
    const matchPriority = activePriorityFilter === "all" ? true : (t.priority || "").toLowerCase() === activePriorityFilter;
    const matchStatus = activeStatusFilter === "all" ? true : (t.status || "").toLowerCase() === activeStatusFilter;
    return matchSearch && matchPriority && matchStatus;
  });

  // UI ------------------------------------------------------------------
  return (
    <div className="min-h-screen w-full px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#1F2937]">CRM Tasks</h1>
          <p className="text-gray-500 mt-1">Manage user tasks, follow-ups and priorities</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => { setIsBulkOpen(true); setBulkFile(null); setBulkSummary(null); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4C6EF5] !text-white">
            <Plus className="w-4 h-4" /> Bulk Upload
          </button>

          <button onClick={openAddModal} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4C6EF5] !text-white">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center bg-[#F3F4F6] rounded-xl px-4 h-10 w-full">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tasks..." className="bg-transparent w-full focus:outline-none text-base text-gray-700" />
        </div>

        <div className="flex gap-2">
          <select value={activePriorityFilter} onChange={(e) => setActivePriorityFilter(e.target.value)} className="px-3 py-2 bg-[#F3F4F6] rounded-md">
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select value={activeStatusFilter} onChange={(e) => setActiveStatusFilter(e.target.value)} className="px-3 py-2 bg-[#F3F4F6] rounded-md">
            <option value="all">All status</option>
            <option value="not started">Not Started</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-6 bg-white rounded-xl shadow text-center">Loading tasks...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((task, idx) => {
            const relatedName =
              task.related_type === "Lead" ? leadsMap[task.related_id] : task.related_type === "Customer" ? customersMap[task.related_id] : task.related_id || "-";
            const assignee = usersMap[task.assigned_to] || "-";
            return (
              <motion.div key={task.id || idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-gray-900 font-semibold">{task.title}</h3>
                      <div className="mt-2 text-sm text-gray-600 flex gap-2 items-center">
                        <Calendar className="w-4 h-4" /> <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 flex gap-2 items-center">
                        <Clock className="w-4 h-4" /> <span>Next follow: {task.fellow_up_date ? new Date(task.fellow_up_date).toLocaleDateString() : "-"}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 flex gap-2 items-center">
                        <Target className="w-4 h-4" /> <span>{task.related_type}: {relatedName}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <div className={`px-3 py-1 rounded-full text-xs ${priorityColor(task.priority)}`}>{task.priority}</div>
                      <div className={`px-3 py-1 rounded-full text-xs ${statusColor(task.status)}`}>{task.status}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
                    <div className="flex items-center gap-2"><Users className="w-4 h-4" /> <span>{assignee}</span></div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(task.id)} className="p-2 rounded-md hover:bg-gray-100"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(task.id)} className="p-2 rounded-md hover:bg-gray-100"><Trash2 className="w-4 h-4 text-red-600" /></button>
                    </div>
                  </div>

                  {task.notes && <div className="mt-3 text-sm text-gray-600 border-t pt-3"><Clipboard className="w-4 h-4 inline-block mr-2" /> {task.notes}</div>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="fixed inset-0 bg-black/40" onClick={() => { setIsModalOpen(false); setIsEditing(false); setEditingId(null); }} />
          <div className="relative bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg z-10 overflow-auto" style={{ maxHeight: "85vh" }}>
            <div className="flex items-center justify-between px-6 py-4 ">
              <h3 className="text-lg font-medium">{isEditing ? "Edit Task" : "Add Task"}</h3>
              <button onClick={() => { setIsModalOpen(false); setIsEditing(false); setEditingId(null); }} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Title</label>
                <input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} className="w-full px-3 py-2 bg-gray-100 rounded-md" />
              </div>

              <div>
                <label className="text-sm text-gray-700">Related Type</label>
                <select value={form.related_type} onChange={(e) => setForm((s) => ({ ...s, related_type: e.target.value, related_id: "" }))} className="w-full px-3 py-2 bg-gray-100 rounded-md">
                  <option>Lead</option>
                  <option>Customer</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700">Related Entity</label>
                {form.related_type === "Lead" ? (
                  <select value={form.related_id} onChange={(e) => setForm((s) => ({ ...s, related_id: e.target.value }))} className="w-full px-3 py-2 bg-gray-100 rounded-md">
                    <option value="">-- Select lead --</option>
                    {Object.entries(leadsMap).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                  </select>
                ) : form.related_type === "Customer" ? (
                  <select value={form.related_id} onChange={(e) => setForm((s) => ({ ...s, related_id: e.target.value }))} className="w-full px-3 py-2 bg-gray-100 rounded-md">
                    <option value="">-- Select customer --</option>
                    {Object.entries(customersMap).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                  </select>
                ) : (
                  <input value={form.related_id} onChange={(e) => setForm((s) => ({ ...s, related_id: e.target.value }))} placeholder="Free text or id" className="w-full px-3 py-2 bg-gray-100 rounded-md" />
                )}
              </div>

              <div>
                <label className="text-sm text-gray-700">Assign To</label>
                <select value={form.assigned_to} onChange={(e) => setForm((s) => ({ ...s, assigned_to: e.target.value }))} className="w-full px-3 py-2 bg-gray-100 rounded-md">
                  {usersLoading ? <option>Loading...</option> : users.length ? users.map(u => <option key={u.id} value={u.id}>{u.name || u.username || u.email}</option>) : <option>No users</option>}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700">Priority</label>
                <select value={form.priority} onChange={(e) => setForm((s) => ({ ...s, priority: e.target.value }))} className="w-full px-3 py-2 bg-gray-100 rounded-md">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700">Status</label>
                <select value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))} className="w-full px-3 py-2 bg-gray-100 rounded-md">
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700">Due Date</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm((s) => ({ ...s, due_date: e.target.value }))} className="w-full px-3 py-2 bg-gray-100 rounded-md" />
              </div>

              <div>
                <label className="text-sm text-gray-700">Follow-up Date</label>
                <input type="date" value={form.fellow_up_date} onChange={(e) => setForm((s) => ({ ...s, fellow_up_date: e.target.value }))} className="w-full px-3 py-2 bg-gray-100 rounded-md" />
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-700">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} className="w-full px-3 py-2 bg-gray-100 rounded-md h-28" />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4">
              <button onClick={() => { setIsModalOpen(false); setIsEditing(false); setEditingId(null); }} className="px-4 py-2 rounded-md border">Cancel</button>
              {isEditing ? (
                <button onClick={handleUpdateTask} className="px-4 py-2 rounded-md bg-purple-600 !text-white">Update Task</button>
              ) : (
                <button onClick={handleAddTask} className="px-4 py-2 rounded-md bg-[#4C6EF5] !text-white">Create Task</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsBulkOpen(false)} />
          <div className="relative bg-white w-full max-w-xl mx-4 rounded-xl shadow-lg z-10" style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-medium">Bulk Upload Tasks</h3>
              <button onClick={() => setIsBulkOpen(false)} className="text-gray-500">Close</button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Upload CSV / Excel containing tasks. Expected columns: title, related_type, related_id, due_date, fellow_up_date, priority, status, assigned_to, notes</p>

              <div>
                <label className="text-sm text-gray-700 block mb-2">Select file</label>
                <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleBulkFileChange} />
                {bulkFile && <div className="text-sm mt-2 text-gray-700">Selected: {bulkFile.name} ({Math.round(bulkFile.size / 1024)} KB)</div>}
              </div>

              <div className="flex items-center gap-3">
                <input id="skipDupTasks" type="checkbox" checked={skipDuplicates} onChange={(e) => setSkipDuplicates(e.target.checked)} />
                <label htmlFor="skipDupTasks" className="text-sm text-gray-700">Skip duplicates</label>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleBulkUpload} disabled={bulkUploading} className="px-4 py-2 bg-blue-600 !text-white rounded-md">
                  {bulkUploading ? "Uploading..." : "Upload"}
                </button>
                <button onClick={() => { setBulkFile(null); setBulkSummary(null); }} className="px-4 py-2 border rounded-md">Reset</button>
              </div>

              {bulkSummary && (
                <div className="mt-4 bg-gray-50 border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Upload Summary</h4>
                  <ul className="text-sm space-y-1">
                    <li>📥 Total Records: <b>{bulkSummary.totalReceived}</b></li>
                    <li>✅ Successfully Added: <b>{bulkSummary.createdCount}</b></li>
                    <li>⏭ Skipped (Duplicates): <b>{bulkSummary.skippedCount}</b></li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
