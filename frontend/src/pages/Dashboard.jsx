import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { getAuthUser } from "../components/ProtectedRoute";
import { Users, Clock, CheckSquare, FileCheck, ArrowUp, ArrowDown, Folder } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const StatCard5 = ({ title, value, trend, trendValue, linkText, linkTo, linkColor = "text-indigo-600" }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div>
      <p className="text-slate-500 font-medium text-sm mb-2">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className="mt-4 flex items-center gap-2">
      {trend ? (
        <span className={`text-xs font-semibold flex items-center gap-1 ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
          {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          {trendValue}
        </span>
      ) : (
        <Link to={linkTo || "#"} className={`text-xs font-semibold flex items-center gap-1 hover:underline ${linkColor}`}>
          {linkText}
        </Link>
      )}
    </div>
  </div>
);

function Dashboard() {
  const [stats, setStats] = useState({ employees: 0, projects: 0, activeProjects: 0, totalHours: 0, pendingCount: 0, approvedHours: 0 });
  const [chartData, setChartData] = useState({
    projectHours: [],
    dailyHours: [],
    pendingApprovals: []
  });
  const [loading, setLoading] = useState(true);
  const user = getAuthUser();

  // Capitalize name safely
  const rawName = user?.email?.split('@')[0] || 'User';
  const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [empRes, projRes, logRes] = await Promise.all([
        api.get("/employees/"),
        api.get("/projects/"),
        api.get("/time-logs/")
      ]);

      let projects = projRes.data;
      let employees = empRes.data;
      let logs = logRes.data;

      // Filter data if user is a manager (but not admin)
      if (user?.role === 'manager') {
        projects = projects.filter(p => String(p.manager_id) === String(user.id));
        const managedProjectIds = new Set(projects.map(p => p.id));
        logs = logs.filter(l => managedProjectIds.has(l.project_id));
        const employeeIdsInManagedProjects = new Set(logs.map(l => l.employee_id));
        employees = employees.filter(e => employeeIdsInManagedProjects.has(e.id));
      }

      // Process Project Hours Data
      const projMap = {};
      logs.forEach(l => {
        const pName = projects.find(p => p.id === l.project_id)?.name || "Other";
        projMap[pName] = (projMap[pName] || 0) + l.hours;
      });
      const totalHoursSum = Object.values(projMap).reduce((a, b) => a + b, 0);
      const COLORS = ['#4f46e5', '#f97316', '#eab308', '#10b981', '#94a3b8'];
      const projectHours = Object.keys(projMap).map((name, i) => ({
        name,
        value: projMap[name],
        percent: totalHoursSum > 0 ? `${((projMap[name]/totalHoursSum)*100).toFixed(0)}%` : '0%',
        color: COLORS[i % COLORS.length]
      }));

      // Process Daily Hours Data
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
      logs.forEach(l => {
        const day = dayNames[new Date(l.date).getDay()];
        dailyMap[day] += l.hours;
      });
      const dailyHours = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(name => ({
        name,
        hours: dailyMap[name]
      }));

      // Process Pending Approvals (Group by project)
      const pendingLogs = logs.filter(l => l.status === "pending");
      const pendingMap = {};
      pendingLogs.forEach(l => {
        const pName = projects.find(p => p.id === l.project_id)?.name || "Other";
        pendingMap[pName] = (pendingMap[pName] || 0) + 1;
      });
      const pendingTotal = pendingLogs.length;
      const pendingApprovals = Object.keys(pendingMap).map((name, i) => ({
        name,
        value: pendingMap[name],
        percent: pendingTotal > 0 ? `${((pendingMap[name]/pendingTotal)*100).toFixed(0)}%` : '0%',
        color: COLORS[i % COLORS.length]
      }));

      setStats({
        employees: employees.length,
        projects: projects.length,
        activeProjects: projects.filter(p => p.status === "active").length,
        totalHours: totalHoursSum,
        pendingCount: pendingTotal,
        approvedHours: logs.filter(l => l.status === "approved").reduce((sum, l) => sum + l.hours, 0)
      });

      setChartData({ projectHours, dailyHours, pendingApprovals });
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const totalHours = stats.totalHours || 0;
  const pendingCount = stats.pendingCount || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
        <p className="text-slate-600 font-medium">Welcome back, {userName} 👋</p>
      </div>

      {/* 5 STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard5 
          title={user?.role === 'admin' ? "Total Employees" : "Team Size"} 
          value={stats.employees} 
          linkText={<><Users size={14} /> View all</>} 
          linkTo="/employees"
        />
        <StatCard5 
          title="Total Logged Hours" 
          value={`${totalHours}h`} 
          trend="up" 
          trendValue="Live" 
        />
        <StatCard5 
          title="Pending Approvals" 
          value={pendingCount} 
          linkText="View pending" 
          linkTo="/approvals"
          linkColor={pendingCount > 0 ? "text-amber-600" : "text-slate-400"}
        />
        <StatCard5 
          title="Approved Hours" 
          value={`${stats.approvedHours || 0}h`} 
          trend="up" 
          trendValue="Verified" 
        />
        <StatCard5 
          title={user?.role === 'admin' ? "Total Projects" : "Active Projects"} 
          value={stats.activeProjects} 
          linkText="View all" 
          linkTo="/projects"
        />
      </div>

      {/* 3 CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PIE CHART 1: Hours by Project */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden min-h-[250px]">
          <h3 className="text-[15px] font-bold text-slate-800 mb-6 shrink-0">Hours by Project</h3>
          {chartData.projectHours.length > 0 ? (
            <div className="flex flex-col xl:flex-row flex-1 items-center gap-4 xl:gap-2">
              <div className="relative w-[140px] h-[140px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.projectHours}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.projectHours.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                  <span className="text-lg font-bold text-slate-800 leading-tight">{totalHours}h</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 flex-1 w-full mt-4 xl:mt-0 overflow-hidden px-2">
                {chartData.projectHours.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px] xl:text-[13px] min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                      <span className="text-slate-600 font-medium truncate" title={item.name}>{item.name}</span>
                    </div>
                    <div className="flex gap-1.5 xl:gap-2 text-slate-500 shrink-0 ml-2">
                      <span className="w-7 xl:w-8 text-right text-slate-800 font-semibold">{item.percent}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed border-slate-50 rounded-xl">
              <Folder size={32} strokeWidth={1} />
              <p className="text-xs font-medium uppercase tracking-widest">No project labor data</p>
            </div>
          )}
        </div>

        {/* BAR CHART: Hours by Day */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-[15px] font-bold text-slate-800 mb-2 shrink-0">Hours by Day</h3>
          <p className="text-[11px] text-slate-400 font-medium mb-4 shrink-0">Hours</p>
          <div className="h-[180px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.dailyHours} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="hours" fill="#4f46e5" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART 2: Pending Approvals */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden min-h-[250px]">
          <h3 className="text-[15px] font-bold text-slate-800 mb-6 shrink-0">Pending Approvals</h3>
          {chartData.pendingApprovals.length > 0 ? (
            <div className="flex flex-col xl:flex-row flex-1 items-center gap-4 xl:gap-2">
              <div className="relative w-[140px] h-[140px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.pendingApprovals}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.pendingApprovals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                  <span className="text-xl font-bold text-slate-800 leading-tight">{pendingCount}</span>
                  <span className="text-xs font-semibold text-slate-800">Pending</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 flex-1 w-full mt-4 xl:mt-0 overflow-hidden px-2">
                {chartData.pendingApprovals.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px] xl:text-[13px] min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                      <span className="text-slate-600 font-medium truncate" title={item.name}>{item.name}</span>
                    </div>
                    <div className="flex gap-1.5 xl:gap-2 text-slate-500 shrink-0 ml-2">
                      <span className="w-4 xl:w-6 text-right text-slate-800 font-semibold">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed border-slate-50 rounded-xl">
              <CheckSquare size={32} strokeWidth={1} />
              <p className="text-xs font-medium uppercase tracking-widest">No pending reviews</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
