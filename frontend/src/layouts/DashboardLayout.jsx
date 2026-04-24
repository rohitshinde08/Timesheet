import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getAuthUser } from "../components/ProtectedRoute";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import "./DashboardLayout.css";

const baseNavItems = [
  { path: "/dashboard", label: "Dashboard", roles: ["admin", "hr", "manager", "employee"], icon: "📊" },
  { path: "/projects", label: "Projects", roles: ["admin", "manager", "hr", "employee"], icon: "📁" },
  { path: "/employees", label: "Employees", roles: ["admin", "hr"], icon: "👥" },
  { path: "/allocations", label: "Allocations", roles: ["admin", "hr"], icon: "🔗" },
  { path: "/approvals", label: "Approvals", roles: ["admin", "manager"], icon: "✅" },
  { path: "/time-logs", label: "My Timesheet", roles: ["employee"], icon: "⏱" },
  { path: "/time-logs", label: "Manage Logs", roles: ["admin", "hr", "manager"], icon: "⏱" },
];

function DashboardLayout() {
  const navigate = useNavigate();
  const user = getAuthUser();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  };

  const navItems = user 
    ? baseNavItems.filter((item) => item.roles.includes(user.role))
    : [];

  return (
    <div className="layout-wrapper">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">⏱</div>
          <h1 className="brand-title">TimeStamp</h1>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-group-label">MENU</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <div className="main-wrapper">
        {/* TOP NAVBAR */}
        <header className="top-navbar">
          <div className="navbar-left">
            {/* Could put breadcrumbs or search here */}
          </div>
          <div className="navbar-right">
            <div className="user-profile">
              <div className="avatar">
                {user?.id ? `E${user.id}` : "?"}
              </div>
              <div className="user-details">
                <span className="user-name">Employee #{user?.id}</span>
                <Badge variant={user?.role}>{user?.role}</Badge>
              </div>
            </div>
            <Button variant="secondary" size="small" onClick={handleLogout} className="logout-btn">
              Logout
            </Button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="main-content">
          <div className="content-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
