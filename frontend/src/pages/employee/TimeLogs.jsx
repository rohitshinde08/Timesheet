import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { getAuthUser } from "../../components/ProtectedRoute";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";

function TimeLogs() {
  const [myLogs, setMyLogs] = useState([]);
  const [allocatedProjects, setAllocatedProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [form, setForm] = useState({ project_id: "", task_id: "", date: new Date().toISOString().split('T')[0], hours: "", description: "" });
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
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Time Logs</h1>
          <p className="page-subtitle">Track and report your project contribution hours.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        
        {/* Input Log Form */}
        <Card title="Book Hours">
          {msg.text && (
            <div style={{ padding: 12, marginBottom: 16, borderRadius: "8px", 
              backgroundColor: msg.type === "error" ? "var(--color-danger-bg)" : "var(--color-success-bg)",
              color: msg.type === "error" ? "var(--color-danger)" : "var(--color-success)",
              fontSize: "0.85rem" }}>
              {msg.text}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
             <div>
              <label>Select Project</label>
              <select required value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value, task_id: ""})} style={{width: "100%"}}>
                <option value="">- Available Projects -</option>
                {allocatedProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label>Select Task</label>
              <select required value={form.task_id} onChange={e => setForm({...form, task_id: e.target.value})} style={{width: "100%"}} disabled={!form.project_id}>
                <option value="">- Select Task -</option>
                {tasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label>Date</label>
              <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{width: "100%"}} />
            </div>
            <div>
              <label>Hours Worked</label>
              <input type="number" step="0.5" min="0.5" max="24" required value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} style={{width: "100%"}} placeholder="4.5" />
            </div>
            <div>
              <label>Work Description (Optional)</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{width: "100%", height: "80px"}} />
            </div>
            <Button type="submit" style={{marginTop: "8px"}}>Book Time</Button>
          </form>
        </Card>

        {/* History Area */}
        <Card title="History" subtitle="Your recently submitted timesheets.">
          {loading ? <Skeleton count={4} height="40px" /> : (
            <Table headers={["Date", "Project", "Task", "Hours", "Status", "Description"]} emptyMessage="No time booked yet.">
               {myLogs.slice(0).reverse().map(log => (
                 <tr key={log.id}>
                   <td style={{ fontWeight: 500 }}>{log.date}</td>
                   <td>P{log.project_id}</td>
                   <td>T{log.task_id}</td>
                   <td>{log.hours}h</td>
                   <td><Badge variant={log.status}>{log.status}</Badge></td>
                   <td style={{ maxWidth: "200px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", color: "var(--color-text-muted)" }}>
                      {log.description || "—"}
                   </td>
                 </tr>
               ))}
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}

export default TimeLogs;
