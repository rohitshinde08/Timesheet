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
          {trendValue} from last week
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
  const [stats, setStats] = useState({ employees: 0, projects: 0, activeProjects: 0, logsCount: 0 });
  const [loading, setLoading] = useState(true);
  const user = getAuthUser();

  const isManager = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'hr';

  // Capitalize name safely
  const rawName = user?.email?.split('@')[0] || 'User';
  const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [empRes, projRes] = await Promise.all([
        api.get("/employees/"),
        api.get("/projects/")
      ]);

      setStats({
        employees: empRes.data.length,
        projects: projRes.data.length,
        activeProjects: projRes.data.filter(p => p.status === "active").length,
        logsCount: 0
      });
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  // Mock Data for Charts
  const hoursByDayData = [
    { name: 'Mon', hours: 62 },
    { name: 'Tue', hours: 81 },
    { name: 'Wed', hours: 63 },
    { name: 'Thu', hours: 90 },
    { name: 'Fri', hours: 70 },
    { name: 'Sat', hours: 50 },
    { name: 'Sun', hours: 0 },
  ];

  const projectHoursData = [
    { name: 'Website Revamp', value: 205, percent: '40%', color: '#4f46e5' }, 
    { name: 'Mobile App', value: 128, percent: '25%', color: '#f97316' },     
    { name: 'Admin Panel', value: 77, percent: '15%', color: '#eab308' },     
    { name: 'Bug Fixing', value: 51, percent: '10%', color: '#10b981' },      
    { name: 'Others', value: 51, percent: '10%', color: '#94a3b8' },          
  ];

  const pendingApprovalsData = [
    { name: 'Development', value: 5, percent: '62.5%', color: '#4f46e5' },
    { name: 'Testing', value: 2, percent: '25%', color: '#f97316' },
    { name: 'Documentation', value: 1, percent: '12.5%', color: '#10b981' },
  ];

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
          title="Total Employees" 
          value={stats.employees || 24} 
          linkText={<><Users size={14} /> View all</>} 
          linkTo="/employees"
        />
        <StatCard5 
          title="Total Hours (This Week)" 
          value="512h 30m" 
          trend="up" 
          trendValue="8%" 
        />
        <StatCard5 
          title="Pending Approvals" 
          value="8" 
          linkText="View pending" 
          linkTo="/approvals"
        />
        <StatCard5 
          title="Approved Hours (This Week)" 
          value="456h 15m" 
          trend="up" 
          trendValue="12%" 
        />
        <StatCard5 
          title="Projects" 
          value={stats.projects || 12} 
          linkText="View all projects" 
          linkTo="/projects"
        />
      </div>

      {/* 3 CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PIE CHART 1: Hours by Project */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <h3 className="text-[15px] font-bold text-slate-800 mb-6 shrink-0">Hours by Project (This Week)</h3>
          <div className="flex flex-col xl:flex-row flex-1 items-center gap-4 xl:gap-2">
            <div className="relative w-[140px] h-[140px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectHoursData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {projectHoursData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-lg font-bold text-slate-800 leading-tight">512h</span>
                <span className="text-sm font-bold text-slate-800 leading-none">30m</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 flex-1 w-full mt-4 xl:mt-0 overflow-hidden">
              {projectHoursData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[12px] xl:text-[13px] min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-600 font-medium truncate" title={item.name}>{item.name}</span>
                  </div>
                  <div className="flex gap-1.5 xl:gap-2 text-slate-500 shrink-0 ml-2">
                    <span className="w-7 xl:w-8 text-right text-slate-800 font-semibold">{item.percent}</span>
                    <span className="w-10 xl:w-12 text-right text-[11px] xl:text-[12px]">({item.value}h)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BAR CHART: Hours by Day */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-[15px] font-bold text-slate-800 mb-2 shrink-0">Hours by Day (This Week)</h3>
          <p className="text-[11px] text-slate-400 font-medium mb-4 shrink-0">Hours</p>
          <div className="h-[180px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursByDayData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} ticks={[0, 20, 40, 60, 80, 100]} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="hours" fill="#4f46e5" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART 2: Pending Approvals */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <h3 className="text-[15px] font-bold text-slate-800 mb-6 shrink-0">Pending Approvals</h3>
          <div className="flex flex-col xl:flex-row flex-1 items-center gap-4 xl:gap-2">
            <div className="relative w-[140px] h-[140px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pendingApprovalsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {pendingApprovalsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-xl font-bold text-slate-800 leading-tight">8</span>
                <span className="text-xs font-semibold text-slate-800">Pending</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 flex-1 w-full mt-4 xl:mt-0 overflow-hidden">
              {pendingApprovalsData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[12px] xl:text-[13px] min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-600 font-medium truncate" title={item.name}>{item.name}</span>
                  </div>
                  <div className="flex gap-1.5 xl:gap-2 text-slate-500 shrink-0 ml-2">
                    <span className="w-4 xl:w-6 text-right text-slate-800 font-semibold">{item.value}</span>
                    <span className="w-10 xl:w-12 text-right text-[11px] xl:text-[12px]">({item.percent})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
