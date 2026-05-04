import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { 
  ArrowLeft, LayoutGrid, User, Users, Calendar, 
  Clock, CheckCircle2, AlertCircle, FileText, MoreVertical, Info, Trash2, Activity
} from "lucide-react";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading project details...</div>;
  if (!project) return <div className="p-8 text-center text-red-500 font-medium">Project not found.</div>;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors w-fit font-medium text-sm"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0 shadow-sm">
              <LayoutGrid size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{project.name}</h1>
                <Badge variant={project.status}>{project.status}</Badge>
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-2 text-sm">
                <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-[10px] font-bold uppercase tracking-wider">PRJ-{project.id}</span>
                • Started {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="flex items-center gap-2">
              <FileText size={18} />
              Export Report
            </Button>
            <Button className="flex items-center gap-2">
              Add Member
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-none shadow-sm flex items-center gap-4 hover:translate-y-[-2px] transition-all cursor-default">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <User size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Project Lead</p>
            <p className="text-lg font-bold text-slate-700">{project.manager?.name || project.manager_name || "Unassigned"}</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm flex items-center gap-4 hover:translate-y-[-2px] transition-all cursor-default">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Hours</p>
            <p className="text-lg font-bold text-slate-700">{project.total_logged_hours || 0}h / {project.estimated_hours || '∞'}</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm flex items-center gap-4 hover:translate-y-[-2px] transition-all cursor-default">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Team Size</p>
            <p className="text-lg font-bold text-slate-700">{project.allocations?.length || 0} Members</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm flex items-center gap-4 hover:translate-y-[-2px] transition-all cursor-default">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Tasks</p>
            <p className="text-lg font-bold text-slate-700">{project.tasks?.filter(t => t.status !== 'done').length || 0}</p>
          </div>
        </Card>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Team */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card className="p-8 border-none shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Info size={20} className="text-indigo-500" />
              About Project
            </h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              {project.description || "No description provided for this project."}
            </p>
          </Card>

          <Card className="overflow-hidden border-none shadow-sm">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users size={20} className="text-indigo-500" />
                Active Team
              </h3>
              <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Manage Team</button>
            </div>
            <Table headers={["Member", "Role", "Allocation", "Actions"]}>
              {project.allocations && project.allocations.length > 0 ? (
                project.allocations.map((alloc) => (
                  <tr key={alloc.id} className="group hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-700">{alloc.employee.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium capitalize">{alloc.employee.role}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                          <div className="h-full bg-indigo-500" style={{ width: `${alloc.allocation_percent}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{alloc.allocation_percent}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-slate-400 hover:text-red-500 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                    No members assigned yet.
                  </td>
                </tr>
              )}
            </Table>
          </Card>

          <Card className="overflow-hidden border-none shadow-sm">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <LayoutGrid size={20} className="text-indigo-500" />
                Tasks & Milestones
              </h3>
              <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">+ New Task</button>
            </div>
            <Table headers={["Task Title", "Assignee", "Status", "Actions"]}>
              {project.tasks && project.tasks.length > 0 ? (
                project.tasks.map((task) => (
                  <tr key={task.id} className="group hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-700">{task.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">E{task.assigned_to}</td>
                    <td className="px-6 py-4">
                      <Badge variant={task.status}>{task.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                    No tasks created for this project yet.
                  </td>
                </tr>
              )}
            </Table>
          </Card>
        </div>

        {/* Right Column: Sidebar info */}
        <div className="flex flex-col gap-8">
          <Card className="p-8 border-none shadow-sm bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-400" />
              Project Timeline
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0 shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>
                <div>
                  <p className="text-sm font-bold mb-0.5">Kickoff Meeting</p>
                  <p className="text-xs text-slate-400 font-medium">{new Date(project.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-slate-600 mt-2 shrink-0"></div>
                <div>
                  <p className="text-sm font-bold mb-0.5 text-slate-400">Phase 1 Delivery</p>
                  <p className="text-xs text-slate-500 font-medium">Coming soon</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MoreVertical size={20} className="text-indigo-500" />
              Quick Actions
            </h3>
            <div className="flex flex-col gap-3">
              <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl font-bold text-sm transition-all border border-slate-100 hover:border-indigo-100 flex items-center justify-between group">
                Mark as Completed
                <CheckCircle2 size={16} className="text-slate-300 group-hover:text-indigo-500" />
              </button>
              <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl font-bold text-sm transition-all border border-slate-100 hover:border-rose-100 flex items-center justify-between group">
                Archive Project
                <AlertCircle size={16} className="text-slate-300 group-hover:text-rose-500" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;
