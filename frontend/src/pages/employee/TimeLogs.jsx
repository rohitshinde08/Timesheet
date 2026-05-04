import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { getAuthUser } from "../../components/ProtectedRoute";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { 
  Clock, Plus, Calendar, Briefcase, 
  LayoutGrid, FileText, CheckCircle2, AlertCircle
} from "lucide-react";

function TimeLogs() {
  const [myLogs, setMyLogs] = useState([]);
  const [allocatedProjects, setAllocatedProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [form, setForm] = useState({ project_id: "", task_id: "", date: new Date().toISOString().split('T')[0], hours: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  
  const user = getAuthUser();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (form.project_id) {
      fetchTasks(form.project_id);
    } else {
      setTasks([]);
    }
  }, [form.project_id]);

  const fetchData = async () => {
    try {
      const [logsRes, allocRes, allProj] = await Promise.all([
        api.get("/time-logs/my"),
        api.get(`/allocations/employee/${user.id}`), 
        api.get("/projects/") 
      ]);
      setMyLogs(logsRes.data);

      const myProjectIds = allocRes.data.map(a => a.project_id);
      const myProjects = allProj.data.filter(p => myProjectIds.includes(p.id));
      setAllocatedProjects(myProjects);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const res = await api.get(`/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg({ text: "", type: "" });
    try {
      await api.post("/time-logs/", {
        ...form,
        project_id: parseInt(form.project_id),
        task_id: parseInt(form.task_id),
        hours: parseFloat(form.hours)
      });
      setMsg({ text: "Hours successfully booked.", type: "success" });
      setForm({ ...form, task_id: "", hours: "", description: "" });
      fetchData();
    } catch (err) {
      setMsg({ text: err.response?.data?.detail || "Failed to log time.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Time Tracking</h1>
        <p className="text-slate-500 font-medium">Record and manage your daily project contributions.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Input Log Form */}
        <Card className="p-8 border-none shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Plus size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Book Hours</h3>
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Briefcase size={18} />
                </div>
                <select 
                  required 
                  value={form.project_id} 
                  onChange={e => setForm({...form, project_id: e.target.value, task_id: ""})}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all appearance-none"
                >
                  <option value="">Select Project</option>
                  {allocatedProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task / Milestone</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <LayoutGrid size={18} />
                </div>
                <select 
                  required 
                  value={form.task_id} 
                  onChange={e => setForm({...form, task_id: e.target.value})}
                  disabled={!form.project_id}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all appearance-none disabled:opacity-50"
                >
                  <option value="">Select Task</option>
                  {tasks.map(t => <option key={t.id} value={t.id}>{t.title || t.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <input 
                    type="date" 
                    required 
                    value={form.date} 
                    onChange={e => setForm({...form, date: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hours</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Clock size={18} />
                  </div>
                  <input 
                    type="number" 
                    step="0.5" 
                    min="0.5" 
                    max="24" 
                    required 
                    value={form.hours} 
                    onChange={e => setForm({...form, hours: e.target.value})}
                    placeholder="e.g. 4.5"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
              <div className="relative">
                <div className="absolute left-4 top-4 text-slate-400">
                  <FileText size={18} />
                </div>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="What did you achieve?"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 transition-all h-24 resize-none"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="mt-2 py-4 shadow-lg shadow-indigo-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Booking..." : "Book Time"}
            </Button>
          </form>
        </Card>

        {/* History Area */}
        <div className="xl:col-span-2">
          <Card className="overflow-hidden border-none shadow-sm">
            <div className="px-8 py-6 border-b border-slate-50 bg-white">
              <h3 className="text-lg font-bold text-slate-800">Recent History</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Your latest timesheet submissions</p>
            </div>
            
            <div className="p-0">
              <Table headers={["Date", "Project", "Task", "Hours", "Status"]}>
                {myLogs.length > 0 ? (
                  myLogs.slice(0).reverse().map(log => (
                    <tr key={log.id} className="group hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm font-bold text-slate-600">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-700">{log.project?.name || `Proj #${log.project_id}`}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{log.task?.title || `Task #${log.task_id}`}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-indigo-50 rounded-lg text-xs font-black text-indigo-600">{log.hours}h</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={log.status}>{log.status}</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                      No time booked yet. Start logging your hours to see history.
                    </td>
                  </tr>
                )}
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TimeLogs;
