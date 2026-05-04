import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { getAuthUser } from "../components/ProtectedRoute";
import { 
  Home, 
  FileText, 
  Users, 
  Folder, 
  BarChart2, 
  Calendar, 
  User, 
  LogOut, 
  Clock, 
  PlusCircle, 
  Menu,
  ChevronDown,
  Bell
} from "lucide-react";

const baseNavItems = [
  { path: "/dashboard", label: "Dashboard", roles: ["admin", "hr", "manager", "employee"], icon: Home },
  { path: "/time-logs", label: "Add Work", roles: ["employee"], icon: PlusCircle },
  { path: "/my-timesheet", label: "My Timesheet", roles: ["employee"], icon: Clock },
  { path: "/approvals", label: "Pending Approvals", roles: ["admin", "manager"], icon: FileText, badge: 8 },
  { path: "/employees", label: "Employees", roles: ["admin", "hr", "manager"], icon: Users },
  { path: "/allocations", label: "Allocations", roles: ["admin", "hr"], icon: Users },
  { path: "/projects", label: "Projects", roles: ["admin", "manager", "hr", "employee"], icon: Folder },
  { path: "/reports", label: "Reports", roles: ["admin", "hr", "manager", "employee"], icon: BarChart2 },
  { path: "/calendar", label: "Calendar", roles: ["admin", "hr", "manager", "employee"], icon: Calendar },
  { path: "/profile", label: "Profile", roles: ["admin", "hr", "manager", "employee"], icon: User },
];

function DashboardLayout() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'manager' || user?.role === 'admin') {
      fetchPendingCount();
    }
  }, [user]);

  const fetchPendingCount = async () => {
    try {
      const { data } = await api.get("/approvals/pending");
      setPendingCount(data.length);
    } catch (err) {
      console.error("Failed to fetch pending count:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  };

  const navItems = user 
    ? baseNavItems.map(item => {
        if (item.path === "/approvals") {
          return { ...item, badge: pendingCount };
        }
        return item;
      }).filter((item) => item.roles.includes(user.role))
    : [];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* LEFT SIDEBAR */}
      <aside className="w-[260px] bg-[#0f172a] flex flex-col shrink-0 text-slate-300 shadow-xl z-20">
        <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-800/50">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">WorkTrack</h1>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 translate-x-1" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 mt-auto"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* TOP NAVBAR */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100">
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
              <span>This Week</span>
              <ChevronDown size={16} className="text-slate-400" />
            </div>
            
            <div className="hidden lg:flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
              <span>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <Calendar size={16} className="text-slate-400" />
            </div>

            <button className="relative text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50">
              <Bell size={22} />
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer group">
              <img src={`https://ui-avatars.com/api/?name=${(user?.email || 'User').split('@')[0]}&background=f8fafc&color=6366f1`} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 group-hover:border-indigo-100 transition-colors" />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors capitalize">
                  {(user?.email || 'User').split('@')[0].replace('.', ' ')}
                </span>
                <span className="text-xs text-slate-500 font-medium capitalize">{user?.role || 'Manager'}</span>
              </div>
              <ChevronDown size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto p-8 bg-[#f4f7fc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
