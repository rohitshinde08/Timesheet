import { useState, useEffect } from "react";
import { api } from "../utils/api";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Skeleton from "../components/ui/Skeleton";
import Badge from "../components/ui/Badge";
import { getAuthUser } from "../components/ProtectedRoute";

function Dashboard() {
  const [stats, setStats] = useState({ employees: 0, projects: 0, activeProjects: 0, logsCount: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getAuthUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app we'd have a specific /dashboard endpoint. 
      // Doing parallel calls here for boilerplate.
      const [empRes, projRes] = await Promise.all([
        api.get("/employees/"),
        api.get("/projects/")
      ]);

      const employees = empRes.data;
      const projects = projRes.data;
      const activeProj = projects.filter(p => p.status === "active").length;

      setStats({
        employees: employees.length,
        projects: projects.length,
        activeProjects: activeProj,
        logsCount: 0 // Placeholder until we aggregate hours
      });

      // If manager or admin, fetch approvals to show "Who is working on what" via recent logs
      if (user.role === 'admin' || user.role === 'manager') {
          const logsRes = await api.get("/approvals/pending"); // Use pending as a proxy for recent activity in boilerplate
          setRecentLogs(logsRes.data);
      } else {
          // just fetch own logs
          const logsRes = await api.get("/time-logs/my");
          setRecentLogs(logsRes.data);
      }
      
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{user?.role.toUpperCase()} Dashboard</h1>
          <p className="page-subtitle">Welcome back, here is your overview.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {user?.role !== 'employee' ? (
          <>
            <Card title="Total Employees" subtitle="Active in system">
              {loading ? <Skeleton height="40px" /> : <div style={{fontSize: "2rem", fontWeight: "700"}}>{stats.employees}</div>}
            </Card>
            <Card title="Active Projects" subtitle="Currently in progress">
              {loading ? <Skeleton height="40px" /> : <div style={{fontSize: "2rem", fontWeight: "700", color: "var(--color-primary)"}}>{stats.activeProjects}</div>}
            </Card>
            <Card title="Pending Approvals" subtitle="Awaiting your review">
              {loading ? <Skeleton height="40px" /> : <div style={{fontSize: "2rem", fontWeight: "700", color: "var(--color-warning)"}}>{recentLogs.length}</div>}
            </Card>
          </>
        ) : (
          <>
            <Card title="My Projects" subtitle="Assigned to you">
              {loading ? <Skeleton height="40px" /> : <div style={{fontSize: "2rem", fontWeight: "700"}}>{stats.projects}</div>}
            </Card>
            <Card title="Hours Logged" subtitle="This month total">
              {loading ? <Skeleton height="40px" /> : <div style={{fontSize: "2rem", fontWeight: "700", color: "var(--color-success)"}}>{recentLogs.reduce((acc, log) => acc + log.hours, 0)}h</div>}
            </Card>
            <Card title="Status" subtitle="Current timesheet">
              <Badge variant="success">Active</Badge>
            </Card>
          </>
        )}
      </div>

      <Card title={user?.role === 'employee' ? "My Recent Logs" : "Recent Activity"} subtitle={user?.role === 'employee' ? "Check your submission status" : "Who is working on what"}>
        {loading ? (
          <Skeleton count={3} height="40px" />
        ) : (
          <Table 
            headers={["Date", user?.role === 'employee' ? "Project" : "Employee", "Hours", "Status"]}
            emptyMessage="No recent activity to show."
          >
            {recentLogs.slice(0, 8).map(log => (
              <tr key={log.id}>
                <td>{log.date}</td>
                <td>{user?.role === 'employee' ? `P${log.project_id}` : `E${log.employee_id}`}</td>
                <td>{log.hours}h</td>
                <td><Badge variant={log.status}>{log.status}</Badge></td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
}

export default Dashboard;
