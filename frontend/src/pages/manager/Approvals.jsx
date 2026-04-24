import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";

function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const { data } = await api.get("/approvals/pending");
      setApprovals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const comment = prompt(`Add a note for ${action.toUpperCase()} (optional):`);
    try {
      await api.put(`/approvals/${id}`, { action, comment: comment || "" });
      fetchApprovals();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to process approval.");
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Timesheet Approvals</h1>
          <p className="page-subtitle">Review logged hours pending authorization for your projects.</p>
        </div>
      </div>

      <Card>
        {loading ? (
           <Skeleton count={4} height="40px" />
        ) : (
          <Table headers={["Date", "Employee", "Project", "Log Desc.", "Hours", "Actions"]} emptyMessage="You have no pending approvals.">
            {approvals.map(log => (
              <tr key={log.id}>
                <td>{log.date}</td>
                <td style={{ fontWeight: 500 }}>E{log.employee_id}</td>
                <td>P{log.project_id}</td>
                <td style={{ maxWidth: "200px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {log.description || <span style={{color: "var(--color-border)"}}>No description</span>}
                </td>
                <td style={{ fontWeight: 600 }}>{log.hours}h</td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button variant="success" size="small" onClick={() => handleAction(log.id, "approved")}>Approve</Button>
                    <Button variant="danger" size="small" onClick={() => handleAction(log.id, "rejected")}>Reject</Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
}

export default Approvals;
