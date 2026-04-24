import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";

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
      const { data } = await api.get("/employees/");
      setEmployees(data);
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
      fetchEmployees(); // Refresh table
    } catch (err) {
      setSubmitError(err.response?.data?.detail || "Failed to create employee.");
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Directory</h1>
          <p className="page-subtitle">Manage company employees and roles.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Employee</Button>
      </div>

      <Card>
        {loading ? (
          <Skeleton count={5} height="40px" />
        ) : (
          <Table headers={["ID", "Name", "Email", "Role", "Joined"]}>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td style={{ fontWeight: 500 }}>{emp.name}</td>
                <td style={{ color: "var(--color-text-muted)" }}>{emp.email}</td>
                <td><Badge variant={emp.role}>{emp.role}</Badge></td>
                <td>{new Date(emp.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Employee">
        {submitError && <div style={{ color: "var(--color-danger)", marginBottom: 16 }}>{submitError}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label>Full Name</label>
            <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{width: "100%"}} />
          </div>
          <div>
            <label>Email Address</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{width: "100%"}} />
          </div>
          <div>
            <label>Temporary Password</label>
            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={{width: "100%"}} />
          </div>
          <div>
            <label>Assign Role</label>
            <select required value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={{width: "100%"}}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Employees;
