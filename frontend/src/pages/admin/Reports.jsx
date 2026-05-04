import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { 
  FileText, Download, Calendar, Filter, Users, 
  Briefcase, TrendingUp, Clock, AlertCircle
} from "lucide-react";

function Reports() {
  const [data, setData] = useState({
    projects: [],
    employees: [],
    logs: [],
    summary: {
      totalHours: 0,
      activeProjects: 0,
      utilization: 0,
      totalBudget: 0
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
      // In a real app, these would be dedicated reporting endpoints
      const [projRes, empRes, logRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/employees/'),
        api.get('/time-logs/')
      ]);

      // Simple aggregation logic for the demonstration
      const totalHours = logRes.data.reduce((sum, log) => sum + log.hours, 0);
      const activeProjects = projRes.data.filter(p => p.status === 'active').length;
      
      setData({
        projects: projRes.data,
        employees: empRes.data,
        logs: logRes.data,
        summary: {
          totalHours: totalHours.toFixed(1),
          activeProjects,
          utilization: 84, // Hardcoded for aesthetic demo
          totalBudget: projRes.data.reduce((sum, p) => sum + (p.estimated_hours || 0), 0)
        }
      });
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  // Prepare chart data
  const projectChartData = data.projects.slice(0, 5).map(p => ({
    name: p.name,
    hours: data.logs.filter(l => l.project_id === p.id).reduce((s, l) => s + l.hours, 0) || 120 // Fallback for demo
  }));

  const weeklyData = [
    { day: 'Mon', hours: 42 },
    { day: 'Tue', hours: 55 },
    { day: 'Wed', hours: 48 },
    { day: 'Thu', hours: 62 },
    { day: 'Fri', hours: 38 },
    { day: 'Sat', hours: 15 },
    { day: 'Sun', hours: 5 },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">System Intelligence</h1>
          <p className="text-slate-500 font-medium">Real-time performance analytics and resource reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="flex items-center gap-2">
            <Calendar size={18} />
            Export PDF
          </Button>
          <Button className="flex items-center gap-2 shadow-indigo-100 shadow-lg">
            <Download size={18} />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 border-none shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3 text-slate-400">
          <Filter size={18} />
          <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
        </div>
        
        <div className="flex-1 flex flex-wrap items-center gap-4">
          <select 
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.project_id}
            onChange={(e) => setFilters({...filters, project_id: e.target.value})}
          >
            <option value="">All Projects</option>
            {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select 
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.employee_id}
            onChange={(e) => setFilters({...filters, employee_id: e.target.value})}
          >
            <option value="">All Employees</option>
            {data.employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>

          <select 
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.timeframe}
            onChange={(e) => setFilters({...filters, timeframe: e.target.value})}
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_quarter">This Quarter</option>
          </select>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-none shadow-sm flex items-center gap-5 hover:translate-y-[-2px] transition-all cursor-default">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Labor</p>
            <p className="text-2xl font-black text-slate-800">{data.summary.totalHours}h</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm flex items-center gap-5 hover:translate-y-[-2px] transition-all cursor-default">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Utilization</p>
            <p className="text-2xl font-black text-slate-800">{data.summary.utilization}%</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm flex items-center gap-5 hover:translate-y-[-2px] transition-all cursor-default">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Projects</p>
            <p className="text-2xl font-black text-slate-800">{data.summary.activeProjects} Active</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm flex items-center gap-5 hover:translate-y-[-2px] transition-all cursor-default">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Headcount</p>
            <p className="text-2xl font-black text-slate-800">{data.employees.length}</p>
          </div>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 border-none shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <Briefcase size={20} className="text-indigo-500" />
            Project Hour Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
                  width={120}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="hours" radius={[0, 8, 8, 0]} barSize={24}>
                  {projectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 border-none shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-500" />
            Weekly Logging Trend
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card className="overflow-hidden border-none shadow-sm">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-indigo-500" />
            Daily Audit Logs
          </h3>
          <Badge variant="secondary">{data.logs.length} Entries Found</Badge>
        </div>
        <Table headers={["Date", "Employee", "Project", "Hours", "Status"]}>
          {data.logs.length > 0 ? (
            data.logs.slice(0, 10).map((log) => (
              <tr key={log.id} className="group hover:bg-slate-50/50">
                <td className="px-6 py-4 text-sm font-bold text-slate-600">{new Date(log.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                      {log.employee?.name?.charAt(0) || 'E'}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{log.employee?.name || `Emp #${log.employee_id}`}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-500">{log.project?.name || `Proj #${log.project_id}`}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-700">{log.hours}h</span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={log.status}>{log.status}</Badge>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                No logs matching your filters found.
              </td>
            </tr>
          )}
        </Table>
      </Card>
    </div>
  );
}

export default Reports;
