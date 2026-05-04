import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import { Users, Briefcase, Activity, CheckCircle2, AlertCircle, Plus } from "lucide-react";

function Allocations() {
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [form, setForm] = useState({ employee_id: "", project_id: "", allocation_percent: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, projRes, allocRes] = await Promise.all([
        api.get("/employees/"),
        api.get("/projects/"),
        api.get("/allocations/")
      ]);
      setEmployees(empRes.data);
      setProjects(projRes.data.filter(p => p.status === 'active'));
      setAllocations(allocRes.data); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg({ text: "", type: "" });
    try {
      await api.post("/allocations/", {
        employee_id: parseInt(form.employee_id),
        project_id: parseInt(form.project_id),
        allocation_percent: parseFloat(form.allocation_percent)
      });
      setMsg({ text: "Allocation successfully added.", type: "success" });
      setForm({ ...form, allocation_percent: "" });
      fetchData();
    } catch (err) {
      setMsg({ text: err.response?.data?.detail || "Failed to allocate.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to get names with type-safe lookup
  const getEmployeeName = (id) => employees.find(e => String(e.id) === String(id))?.name || `Employee #${id}`;
  const getProjectName = (id) => projects.find(p => String(p.id) === String(id))?.name || `Project #${id}`;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Resource Allocations</h1>
        <p className="text-slate-500 font-medium">Assign workforce bandwidth to active projects.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Create Allocation Form */}
        <Card className="p-8 border-none shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Plus size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Assign Employee</h3>
          </div>

          {msg.text && (
            <div className={`p-4 mb-6 rounded-2xl flex items-center gap-3 text-sm font-bold border ${
              msg.type === "error" 
                ? "bg-rose-50 text-rose-600 border-rose-100" 
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}>
              {msg.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Users size={18} />
                </div>
                <select 
                  required 
                  value={form.employee_id} 
                  onChange={e => setForm({...form, employee_id: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all appearance-none"
                >
                  <option value="">- Select Employee -</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Briefcase size={18} />
                </div>
                <select 
                  required 
                  value={form.project_id} 
                  onChange={e => setForm({...form, project_id: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all appearance-none"
                >
                  <option value="">- Select Project -</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allocation (%)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Activity size={18} />
                </div>
                <input 
                  type="number" 
                  step="0.1" 
                  min="1"
                  max="100" 
                  required 
                  value={form.allocation_percent} 
                  onChange={e => setForm({...form, allocation_percent: e.target.value})}
                  placeholder="e.g. 50"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="mt-2 py-4 shadow-lg shadow-indigo-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Allocating..." : "Submit Allocation"}
            </Button>
          </form>
        </Card>

        {/* Global Read-Only Allocation View */}
        <div className="xl:col-span-2">
          <Card className="overflow-hidden border-none shadow-sm">
            <div className="px-8 py-6 border-b border-slate-50 bg-white">
              <h3 className="text-lg font-bold text-slate-800">Active Allocations</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Overview of bandwidth usage across projects.</p>
            </div>
            
            <div className="p-0">
              {loading ? (
                <div className="p-8">
                  <Skeleton count={5} height="40px" />
                </div>
              ) : (
                <Table headers={["Employee", "Project", "Allocation %"]}>
                  {allocations.length > 0 ? (
                    allocations.map((alloc) => (
                      <tr key={alloc.id} className="group hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={`https://ui-avatars.com/api/?name=${getEmployeeName(alloc.employee_id).replace(' ', '+')}&background=f8fafc&color=6366f1`} 
                              alt="Avatar" 
                              className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                            />
                            <span className="font-bold text-slate-700">{getEmployeeName(alloc.employee_id)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-700">{getProjectName(alloc.project_id)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px] max-w-[100px]">
                              <div 
                                className="h-full bg-indigo-500" 
                                style={{ width: `${Math.min(alloc.allocation_percent, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                              {alloc.allocation_percent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                        No active allocations found.
                      </td>
                    </tr>
                  )}
                </Table>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Allocations;
