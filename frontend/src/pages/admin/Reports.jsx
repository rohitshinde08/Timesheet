import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { getAuthUser } from "../../components/ProtectedRoute";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from "recharts";
import { 
  FileText, Download, Calendar, Filter, Users, 
  Briefcase, TrendingUp, Clock, AlertCircle, PieChart as PieIcon,
  Search, ChevronDown, Share2, Activity
} from "lucide-react";

const ReportStat = ({ icon: Icon, label, value, subValue, trend, colorClass, bgClass }) => (
  <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100/50 flex flex-col gap-5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group relative overflow-hidden">
    <div className={`absolute -right-4 -top-4 w-28 h-28 rounded-full opacity-[0.03] group-hover:scale-110 transition-transform duration-700 ${bgClass}`}></div>
    <div className="flex items-center justify-between">
      <div className={`p-4 rounded-2xl ${bgClass} ${colorClass} shadow-inner`}>
        <Icon size={26} />
      </div>
      {trend && (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          <TrendingUp size={10} /> {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        {subValue && <span className="text-xs font-bold text-slate-400">{subValue}</span>}
      </div>
    </div>
  </div>
);

function Reports() {
  const [data, setData] = useState({
    projects: [],
    employees: [],
    logs: [],
    summary: {
      totalHours: 0,
      activeProjects: 0,
      utilization: 0,
      capacity: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    project_id: '',
    employee_id: '',
    timeframe: 'this_month'
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [projRes, empRes, logRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/employees/'),
        api.get('/time-logs/')
      ]);

      let projects = projRes.data;
      let employees = empRes.data;
      let logs = logRes.data;

      const user = getAuthUser();
      
      // Role-based filtering for Managers (Strict Team Privacy)
      if (user?.role === 'manager') {
        projects = projects.filter(p => String(p.manager_id) === String(user.id));
        const managedProjectIds = new Set(projects.map(p => p.id));
        logs = logs.filter(l => managedProjectIds.has(l.project_id));
        const employeeIdsInManagedProjects = new Set(logs.map(l => l.employee_id));
        employees = employees.filter(e => employeeIdsInManagedProjects.has(e.id));
      }

      // Filter based on UI filters
      if (filters.project_id) {
        logs = logs.filter(l => String(l.project_id) === String(filters.project_id));
      }
      if (filters.employee_id) {
        logs = logs.filter(l => String(l.employee_id) === String(filters.employee_id));
      }

      const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);
      const activeProjects = projects.filter(p => p.status === 'active').length;
      
      setData({
        projects,
        employees,
        logs,
        summary: {
          totalHours: totalHours.toFixed(1),
          activeProjects,
          utilization: employees.length > 0 ? ((totalHours / (employees.length * 40)) * 100).toFixed(0) : 0,
          capacity: employees.length * 160 // Assuming 160h capacity per month
        }
      });
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  const projectChartData = data.projects.map(p => ({
    name: p.name,
    hours: data.logs.filter(l => l.project_id === p.id).reduce((s, l) => s + l.hours, 0)
  })).filter(p => p.hours > 0).sort((a, b) => b.hours - a.hours).slice(0, 6);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
  data.logs.forEach(l => {
    const day = dayNames[new Date(l.date).getDay()];
    if (dailyMap.hasOwnProperty(day)) dailyMap[day] += l.hours;
  });
  const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    hours: dailyMap[day]
  }));

  return (
    <div className="flex flex-col gap-10 pb-16 max-w-[1600px] mx-auto">
      {/* Header & Smart Actions */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Live Intelligence Engine</span>
          </div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tight">Executive Reports</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Harness real-time data to drive team productivity and project success.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Share2 size={16} />
            Share Insights
          </button>
          <button className="flex items-center gap-2 px-7 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* Advanced Filter Matrix */}
      <div className="bg-white/60 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/40 flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-2xl text-white">
          <Filter size={18} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Filter Matrix</span>
        </div>
        
        <div className="flex-1 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none shadow-sm cursor-pointer"
              value={filters.project_id}
              onChange={(e) => setFilters({...filters, project_id: e.target.value})}
            >
              <option value="">Global Projects</option>
              {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none shadow-sm cursor-pointer"
              value={filters.employee_id}
              onChange={(e) => setFilters({...filters, employee_id: e.target.value})}
            >
              <option value="">All Team Members</option>
              {data.employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>

          <div className="relative w-[180px]">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none shadow-sm cursor-pointer"
              value={filters.timeframe}
              onChange={(e) => setFilters({...filters, timeframe: e.target.value})}
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_quarter">This Quarter</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* High-Impact Summary Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportStat 
          icon={Clock} 
          label="Cumulative Labor" 
          value={`${data.summary.totalHours}h`} 
          subValue={`Target: ${data.summary.capacity}h`}
          trend="+12%"
          colorClass="text-indigo-600"
          bgClass="bg-indigo-50"
        />
        <ReportStat 
          icon={Activity} 
          label="Resource Utilization" 
          value={`${data.summary.utilization}%`} 
          subValue="Optimal Range: 80-90%"
          trend="+5%"
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <ReportStat 
          icon={Briefcase} 
          label="Project Health" 
          value={data.summary.activeProjects} 
          subValue="Active Initiatives"
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <ReportStat 
          icon={Users} 
          label="Team Magnitude" 
          value={data.employees.length} 
          subValue="Active Personnel"
          colorClass="text-violet-600"
          bgClass="bg-violet-50"
        />
      </div>

      {/* Strategic Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Labor Allocation</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Hours distributed by project</p>
            </div>
            <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
              <PieIcon size={20} />
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectChartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f8fafc" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }} 
                  width={140}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '15px' }}
                />
                <Bar dataKey="hours" radius={[0, 10, 10, 0]} barSize={32}>
                  {projectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Submission Momentum</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Weekly logging frequency</p>
            </div>
            <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 800, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 800, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '15px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorHours)"
                  dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Audit Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <FileText size={24} className="text-indigo-500" />
              Strategic Audit Log
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Detailed timesheet breakdown</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest">
              {data.logs.length} Total Records
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table headers={["Timeline", "Talent", "Assignment", "Intensity", "Validation"]}>
            {data.logs.length > 0 ? (
              data.logs.slice(0, 10).map((log) => (
                <tr key={log.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                  <td className="px-10 py-5 text-sm font-black text-slate-500 uppercase tracking-tighter">
                    {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-10 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black shadow-inner border border-indigo-100/50">
                        {log.employee?.name?.charAt(0) || 'E'}
                      </div>
                      <span className="text-base font-black text-slate-700">{log.employee?.name || `Emp #${log.employee_id}`}</span>
                    </div>
                  </td>
                  <td className="px-10 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">{log.project?.name || `Proj #${log.project_id}`}</td>
                  <td className="px-10 py-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-slate-800">{log.hours}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase">hrs</span>
                    </div>
                  </td>
                  <td className="px-10 py-5">
                    <Badge variant={log.status}>{log.status}</Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-10 py-20 text-center text-slate-400 font-bold uppercase tracking-[0.2em] italic">
                  No data points found for this segment.
                </td>
              </tr>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
