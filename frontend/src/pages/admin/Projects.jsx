import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        api.get("/employees/") // Fetch employees to find managers
      ]);
      setProjects(projRes.data);
      // Filter out admins from managers if needed, otherwise just list people who can manage
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
      fetchData(); // refresh table
    } catch (err) {
      setSubmitError(err.response?.data?.detail || "Failed to create project.");
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Track active projects and their designated managers.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Create Project</Button>
      </div>

      <Card>
        {loading ? (
          <Skeleton count={5} height="40px" />
        ) : (
          <Table headers={["ID", "Project Name", "Manager ID", "Status", "Started"]}>
            {projects.map((proj) => (
              <tr key={proj.id}>
                <td>{proj.id}</td>
                <td style={{ fontWeight: 500 }}>{proj.name}</td>
                <td>{proj.manager_id ? `E${proj.manager_id}` : "Unassigned"}</td>
                <td><Badge variant={proj.status}>{proj.status}</Badge></td>
                <td>{new Date(proj.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        {submitError && <div style={{ color: "var(--color-danger)", marginBottom: 16 }}>{submitError}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label>Project Name</label>
            <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{width: "100%"}} />
          </div>
          <div>
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{width: "100%", height: "80px"}} />
          </div>
          <div>
            <label>Assign Manager (Optional)</label>
            <select value={form.manager_id} onChange={e => setForm({...form, manager_id: e.target.value})} style={{width: "100%"}}>
              <option value="">-- No Manager --</option>
              {managers.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Projects;
