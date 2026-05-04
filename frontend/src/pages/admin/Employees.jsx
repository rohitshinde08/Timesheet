import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";
import { getAuthUser } from "../../components/ProtectedRoute";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { UserPlus, Mail, Lock, UserCog, Trash2, ShieldCheck, MoreVertical, ExternalLink } from "lucide-react";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee" });
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const [empRes, projRes, logRes, allocRes] = await Promise.all([
        api.get("/employees/"),
        api.get("/projects/"),
        api.get("/time-logs/"),
        api.get("/allocations/")
      ]);

      let allEmployees = empRes.data;
      let projects = projRes.data;
      let logs = logRes.data;
      let allocations = allocRes.data;
      const user = getAuthUser();

      if (user?.role === 'manager') {
        // Find projects managed by this user
        const managedProjects = projects.filter(p => String(p.manager_id) === String(user.id));
        const managedProjectIds = new Set(managedProjects.map(p => p.id));
        
        // Find employees who have logged time to these projects
        const employeeIdsWithLogs = new Set(
          logs.filter(l => managedProjectIds.has(l.project_id)).map(l => l.employee_id)
        );

        // Find employees who are allocated to these projects
        const employeeIdsWithAllocations = new Set(
          allocations.filter(a => managedProjectIds.has(a.project_id)).map(a => a.employee_id)
        );

        // Combine both sets
        const teamMemberIds = new Set([...employeeIdsWithLogs, ...employeeIdsWithAllocations]);
        
        // Filter the list (exclude self and only show team)
        allEmployees = allEmployees.filter(e => 
          teamMemberIds.has(e.id) && String(e.id) !== String(user.id)
        );
      }

      setEmployees(allEmployees);
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
      await api.post("/employees/", form);
      setIsModalOpen(false);
      setForm({ name: "", email: "", password: "", role: "employee" });
      fetchEmployees();
    } catch (err) {
      setSubmitError(err.response?.data?.detail || "Failed to create employee.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this employee?")) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        alert("Failed to deactivate employee.");
      }
    }
  };

  const user = getAuthUser();
  const canManage = user?.role === 'admin' || user?.role === 'hr';

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Team Directory</h1>
          <p className="text-slate-500 font-medium">Browse and manage company personnel.</p>
        </div>
        {canManage && (
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 shadow-indigo-100 shadow-lg">
            <UserPlus size={18} />
            Add Employee
          </Button>
        )}
      </div>

      <Card className="overflow-hidden border-none shadow-sm bg-white rounded-2xl">
        <Table headers={["Employee", "Role", "Status", "Joined", ...(canManage ? ["Actions"] : [])]}>
          {employees.map((emp) => (
            <tr key={emp.id} className="group hover:bg-slate-50/50 transition-all duration-200">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0 border border-indigo-100/50 shadow-inner">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <Link 
                      to={`/employees/${emp.id}`} 
                      className="font-black text-slate-700 truncate hover:text-indigo-600 transition-colors flex items-center gap-2 text-base"
                    >
                      {emp.name}
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                    </Link>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{emp.email}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant={emp.role}>{emp.role}</Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${emp.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
                  <span className={`text-xs font-black uppercase tracking-widest ${emp.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {emp.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 font-bold">
                {new Date(emp.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              {canManage && (
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDelete(emp.id)}
                      disabled={emp.status === 'inactive'}
                      className={`p-2.5 rounded-xl transition-all duration-200 ${emp.status === 'inactive' ? 'text-slate-200' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 active:scale-90'}`}
                      title="Deactivate Account"
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Employee">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
              <ShieldCheck size={16} />
              {submitError}
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <UserCog size={18} />
              </span>
              <input 
                type="text" 
                required 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="e.g. John Doe"
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail size={18} />
              </span>
              <input 
                type="email" 
                required 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="john@company.com"
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={18} />
              </span>
              <input 
                type="password" 
                required 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="••••••••"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">Assign Role</label>
            <select 
              required 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
              value={form.role} 
              onChange={e => setForm({...form, role: e.target.value})}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Employees;
