import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { getAuthUser } from "../../components/ProtectedRoute";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import { 
  Users, Activity, AlertTriangle, Briefcase, UserX, UserCheck
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 hover:translate-y-[-2px] transition-all cursor-default">
    <div className={`p-4 ${bgColorClass} ${colorClass} rounded-2xl`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

function HRDashboard() {
  const [data, setData] = useState({
    employees: [],
    projects: [],
    allocations: [],
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
      const [empRes, projRes, allocRes] = await Promise.all([
        api.get("/employees/"),
        api.get("/projects/"),
        api.get("/allocations/")
      ]);

      setData({
        employees: empRes.data,
        projects: projRes.data,
        allocations: allocRes.data,
      });
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  // Process Data
  const activeEmployees = data.employees.filter(e => e.status === 'active');
  const activeProjects = data.projects.filter(p => p.status === 'active');

  // Calculate allocations per employee
  const employeeAllocations = activeEmployees.map(emp => {
    const empAllocs = data.allocations.filter(a => a.employee_id === emp.id);
    const totalPercent = empAllocs.reduce((sum, a) => sum + a.allocation_percent, 0);
    const assignedProjects = empAllocs.map(a => {
      const proj = data.projects.find(p => p.id === a.project_id);
      return proj ? proj.name : `Project #${a.project_id}`;
    });

    let status = 'balanced';
    if (totalPercent === 0) status = 'unallocated';
    else if (totalPercent > 100) status = 'over-allocated';
    else if (totalPercent < 100) status = 'under-allocated';

    return {
      ...emp,
      totalAllocation: totalPercent,
      assignedProjects,
      allocationStatus: status
    };
  });

  const unallocatedCount = employeeAllocations.filter(e => e.allocationStatus === 'unallocated').length;
  const overAllocatedCount = employeeAllocations.filter(e => e.allocationStatus === 'over-allocated').length;

  // Chart Data: Role Distribution
  const roles = activeEmployees.reduce((acc, emp) => {
    acc[emp.role] = (acc[emp.role] || 0) + 1;
    return acc;
  }, {});
  
  const roleColors = { admin: '#f43f5e', hr: '#f59e0b', manager: '#8b5cf6', employee: '#6366f1' };
  const roleChartData = Object.keys(roles).map(role => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    value: roles[role],
    color: roleColors[role] || '#94a3b8'
  }));

  // Chart Data: Allocation Buckets
  const buckets = { '0%': 0, '1-50%': 0, '51-99%': 0, '100%': 0, '>100%': 0 };
  employeeAllocations.forEach(emp => {
    if (emp.totalAllocation === 0) buckets['0%']++;
    else if (emp.totalAllocation <= 50) buckets['1-50%']++;
    else if (emp.totalAllocation < 100) buckets['51-99%']++;
    else if (emp.totalAllocation === 100) buckets['100%']++;
    else buckets['>100%']++;
  });
  const allocationChartData = Object.keys(buckets).map(key => ({ name: key, count: buckets[key] }));

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
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">HR Dashboard</h1>
        <p className="text-slate-600 font-medium">Workforce allocation and capacity overview.</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Headcount" 
          value={activeEmployees.length} 
          icon={Users} 
          colorClass="text-indigo-600" 
          bgColorClass="bg-indigo-50" 
        />
        <StatCard 
          title="Unallocated" 
          value={unallocatedCount} 
          icon={UserX} 
          colorClass="text-rose-600" 
          bgColorClass="bg-rose-50" 
        />
        <StatCard 
          title="Over-Allocated" 
          value={overAllocatedCount} 
          icon={AlertTriangle} 
          colorClass="text-amber-600" 
          bgColorClass="bg-amber-50" 
        />
        <StatCard 
          title="Active Projects" 
          value={activeProjects.length} 
          icon={Briefcase} 
          colorClass="text-emerald-600" 
          bgColorClass="bg-emerald-50" 
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 border-none shadow-sm min-h-[350px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users size={20} className="text-indigo-500" />
            Role Distribution
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-8 h-[220px]">
            <div className="relative w-[200px] h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    stroke="none"
                  >
                    {roleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-2xl font-black text-slate-800">{activeEmployees.length}</span>
                <span className="text-xs font-bold text-slate-400">Total</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-1 w-full">
              {roleChartData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-bold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-8 border-none shadow-sm min-h-[350px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-indigo-500" />
            Capacity Overview
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocationChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} allowDecimals={false} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32}>
                  {allocationChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === '>100%' ? '#f59e0b' : entry.name === '0%' ? '#f43f5e' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* TABLE */}
      <Card className="overflow-hidden border-none shadow-sm">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UserCheck size={20} className="text-indigo-500" />
            Resource Allocation Matrix
          </h3>
        </div>
        <Table headers={["Employee", "Role", "Total Allocation", "Assigned Projects", "Status"]}>
          {employeeAllocations.length > 0 ? (
            employeeAllocations.map((emp) => (
              <tr key={emp.id} className="group hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${emp.name.replace(' ', '+')}&background=f8fafc&color=6366f1`} 
                      alt={emp.name} 
                      className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                    />
                    <span className="font-bold text-slate-700">{emp.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-medium capitalize">{emp.role}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px] max-w-[100px]">
                      <div 
                        className={`h-full ${emp.totalAllocation > 100 ? 'bg-amber-500' : emp.totalAllocation === 0 ? 'bg-slate-300' : 'bg-indigo-500'}`} 
                        style={{ width: `${Math.min(emp.totalAllocation, 100)}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-bold ${emp.totalAllocation > 100 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {emp.totalAllocation}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                  {emp.assignedProjects.length > 0 ? emp.assignedProjects.join(', ') : '—'}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={
                    emp.allocationStatus === 'balanced' ? 'success' : 
                    emp.allocationStatus === 'over-allocated' ? 'warning' : 
                    emp.allocationStatus === 'under-allocated' ? 'info' : 'danger'
                  }>
                    {emp.allocationStatus.replace('-', ' ')}
                  </Badge>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                No active employees found.
              </td>
            </tr>
          )}
        </Table>
      </Card>
    </div>
  );
}

export default HRDashboard;
