import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { 
  ArrowLeft, User, Mail, Calendar, 
  Clock, Briefcase, Activity, FileText,
  PieChart, Award, Settings
} from "lucide-react";

function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const { data } = await api.get(`/employees/${id}`);
      setEmployee(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading profile details...</div>;
  if (!employee) return <div className="p-8 text-center text-red-500 font-medium">Employee not found.</div>;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors w-fit font-medium text-sm"
        >
          <ArrowLeft size={16} />
          Back to Directory
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0 shadow-sm text-2xl font-bold">
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{employee.name}</h1>
                <Badge variant={employee.role}>{employee.role}</Badge>
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-2 text-sm">
                <Mail size={14} />
                {employee.email}
                <span className="text-slate-300 mx-1">•</span>
                <Calendar size={14} />
                Joined {new Date(employee.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="flex items-center gap-2">
              <Settings size={18} />
              Edit Profile
            </Button>
            <Button className="flex items-center gap-2">
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-none shadow-sm flex items-center gap-4 hover:translate-y-[-2px] transition-all cursor-default">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Weekly Hours</p>
            <p className="text-lg font-bold text-slate-700">38.5h</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm flex items-center gap-4 hover:translate-y-[-2px] transition-all cursor-default">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Projects</p>
            <p className="text-lg font-bold text-slate-700">3</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm flex items-center gap-4 hover:translate-y-[-2px] transition-all cursor-default">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Efficiency</p>
            <p className="text-lg font-bold text-slate-700">94%</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm flex items-center gap-4 hover:translate-y-[-2px] transition-all cursor-default">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Approvals</p>
            <p className="text-lg font-bold text-slate-700">5</p>
          </div>
        </Card>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card className="overflow-hidden border-none shadow-sm">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <PieChart size={20} className="text-indigo-500" />
                Current Project Assignments
              </h3>
            </div>
            <Table headers={["Project", "Assigned Role", "Utilization", "Actions"]}>
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                  No active project assignments found for this user.
                </td>
              </tr>
            </Table>
          </Card>

          <Card className="overflow-hidden border-none shadow-sm">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock size={20} className="text-indigo-500" />
                Recent Time Logs
              </h3>
              <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View History</button>
            </div>
            <Table headers={["Date", "Project", "Duration", "Status"]}>
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                  No time logs recorded in the last 7 days.
                </td>
              </tr>
            </Table>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          <Card className="p-8 border-none shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-indigo-500" />
              Work Distribution
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-600">Development</span>
                  <span className="text-sm font-bold text-indigo-600">65%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-600">Meetings</span>
                  <span className="text-sm font-bold text-amber-600">20%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-600">QA / Review</span>
                  <span className="text-sm font-bold text-emerald-600">15%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-sm bg-indigo-600 text-white">
            <h3 className="text-lg font-bold mb-4">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Company Email</span>
                <span className="font-medium">{employee.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Role Type</span>
                <span className="font-medium text-capitalize">{employee.role}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetails;
