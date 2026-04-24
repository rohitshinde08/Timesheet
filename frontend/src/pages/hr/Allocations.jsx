import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";

function Allocations() {
  const [allocations, setAllocations] = useState([]); // In a full app we'd fetch all allocations
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [form, setForm] = useState({ employee_id: "", project_id: "", allocation_percent: "" });
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
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Resource Allocations</h1>
          <p className="page-subtitle">Assign workforce bandwidth to active projects.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        
        {/* Create Allocation Form */}
        <Card title="Assign Employee">
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
              <label>Employee</label>
              <select required value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} style={{width: "100%"}}>
                <option value="">- Select -</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label>Project</label>
              <select required value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} style={{width: "100%"}}>
                <option value="">- Select -</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label>Allocation (%)</label>
              <input type="number" step="0.1" max="100" required value={form.allocation_percent} onChange={e => setForm({...form, allocation_percent: e.target.value})} style={{width: "100%"}} placeholder="e.g. 50" />
            </div>
            <Button type="submit" style={{marginTop: "8px"}}>Submit Allocation</Button>
          </form>
        </Card>

        {/* Global Read-Only Allocation View */}
        <Card title="Active Allocations" subtitle="Overview of bandwidth usage across projects.">
          {loading ? <Skeleton count={5} height="40px" /> : (
            <Table headers={["Employee ID", "Project ID", "Allocation %"]}>
                {/* Note: The boilerplate backend does not implement `GET /allocations` yet.
                    We will leave this array empty and rely on the UI's empty state visually. */}
                {allocations.map((alloc, i) => (
                  <tr key={i}>
                    <td>E{alloc.employee_id}</td>
                    <td>P{alloc.project_id}</td>
                    <td>{alloc.allocation_percent}%</td>
                  </tr>
                ))}
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}

export default Allocations;
