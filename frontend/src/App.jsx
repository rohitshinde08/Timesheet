import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute, { getAuthUser } from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";

// Unified Pages
import Dashboard from "./pages/Dashboard";
import HRDashboard from "./pages/hr/HRDashboard";
import Employees from "./pages/admin/Employees";
import Projects from "./pages/admin/Projects";
import Allocations from "./pages/hr/Allocations";
import Approvals from "./pages/manager/Approvals";
import TimeLogs from "./pages/employee/TimeLogs";
import ProjectDetails from "./pages/admin/ProjectDetails";
import EmployeeDetails from "./pages/admin/EmployeeDetails";
import Reports from "./pages/admin/Reports";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";

// Dashboard Switcher to route users based on role
function DashboardSwitcher() {
  const user = getAuthUser();
  if (user?.role === 'hr') return <HRDashboard />;
  if (user?.role === 'employee') return <TimeLogs />;
  return <Dashboard />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Layout wrapper applying to all authenticated routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Main Smart Dashboard */}
          <Route path="/dashboard" element={<DashboardSwitcher />} />
          
          {/* Role-Specific Fallbacks */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/manager" element={<Dashboard />} />
          <Route path="/employee" element={<TimeLogs />} />

          {/* Core Routes */}
          <Route path="/time-logs" element={<TimeLogs />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin, HR & Manager */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "hr", "manager"]} />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* Admin & HR Only */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "hr"]} />}>
            <Route path="/allocations" element={<Allocations />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
          
          <Route path="/projects/:id" element={<ProjectDetails />} />

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
