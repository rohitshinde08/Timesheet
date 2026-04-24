import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";

// Unified Pages
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/admin/Employees";
import Projects from "./pages/admin/Projects";
import Allocations from "./pages/hr/Allocations";
import Approvals from "./pages/manager/Approvals";
import TimeLogs from "./pages/employee/TimeLogs";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Layout wrapper applying to all authenticated routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Role-Specific Root Dashboards */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/hr" element={<Dashboard />} />
          <Route path="/manager" element={<Dashboard />} />
          <Route path="/employee" element={<TimeLogs />} />

          {/* Existing Shared/Specific Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/time-logs" element={<TimeLogs />} />
          <Route path="/projects" element={<Projects />} />

          {/* Admin & HR Only */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "hr"]} />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/allocations" element={<Allocations />} />
          </Route>

          {/* Admin & Manager Only */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
            <Route path="/approvals" element={<Approvals />} />
          </Route>

        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
