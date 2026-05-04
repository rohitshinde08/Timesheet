import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Plus, Briefcase, User, Info, Calendar, Trash2, MoreVertical, LayoutGrid, ExternalLink } from "lucide-react";
import { getAuthUser } from "../../components/ProtectedRoute";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getAuthUser();
  const canManage = user?.role === 'admin' || user?.role === 'hr';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", manager_id: "" });
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projRes, empRes] = await Promise.all([
        api.get("/projects/"),
        api.get("/employees/") 
      ]);
      
      let allProjects = projRes.data;
      if (user?.role === 'manager') {
        allProjects = allProjects.filter(p => String(p.manager_id) === String(user.id));
      }

      setProjects(allProjects);
      setManagers(empRes.data.filter(e => e.role === "manager" || e.role === "admin"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    try {
      const payload = { ...form };
      if (payload.manager_id) payload.manager_id = parseInt(payload.manager_id);
      
      await api.post("/projects/", payload);
      setIsModalOpen(false);
      setForm({ name: "", description: "", manager_id: "" });
      fetchData(); 
    } catch (err) {
      setSubmitError(err.response?.data?.detail || "Failed to create project.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this project?")) {
      try {
        await api.delete(`/projects/${id}`);
        fetchData();
      } catch (err) {
        alert("Failed to deactivate project.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Project Portfolio</h1>
          <p className="text-slate-500 font-medium">Overview of active initiatives and team leads.</p>
        </div>
        {canManage && (
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 shadow-indigo-100 shadow-lg">
            <Plus size={18} />
            Create Project
          </Button>
        )}
      </div>

      <Card className="overflow-hidden border-none shadow-sm bg-white rounded-2xl">
        <Table headers={["Project Name", "Lead / Manager", "Status", "Started", ...(canManage ? ["Actions"] : [])]}>
          {projects.map((proj) => (
            <tr key={proj.id} className="group hover:bg-slate-50/50 transition-all duration-200">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50 shadow-inner">
                    <LayoutGrid size={24} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <Link 
                      to={`/projects/${proj.id}`} 
                      className="font-black text-slate-700 truncate hover:text-indigo-600 transition-colors flex items-center gap-2 text-base"
                    >
                      {proj.name}
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                    </Link>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID: PRJ-{proj.id}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black border border-slate-200">
                    {proj.manager_name?.charAt(0) || "U"}
                  </div>
                  <span className="text-sm font-bold text-slate-600">
                    {proj.manager_name || "Unassigned"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant={proj.status}>{proj.status}</Badge>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 font-bold">
                {new Date(proj.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              {canManage && (
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDelete(proj.id)}
                      disabled={proj.status === 'inactive'}
                      className={`p-2.5 rounded-xl transition-all duration-200 ${proj.status === 'inactive' ? 'text-slate-200' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 active:scale-90'}`}
                      title="Deactivate Project"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
              <Info size={16} />
              {submitError}
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              Project Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Briefcase size={18} />
              </span>
              <input 
                type="text" 
                required 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="e.g. Website Redesign"
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <textarea 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px]"
              placeholder="Brief project summary..."
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              Assign Manager
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={18} />
              </span>
              <select 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                value={form.manager_id} 
                onChange={e => setForm({...form, manager_id: e.target.value})}
              >
                <option value="">-- No Manager --</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Projects;
