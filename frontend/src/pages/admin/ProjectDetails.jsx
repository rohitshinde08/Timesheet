import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { 
  ArrowLeft, LayoutGrid, User, Users, Calendar, 
  Clock, CheckCircle2, AlertCircle, FileText, MoreVertical, Info, Trash2, Activity
} from "lucide-react";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Add Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigned_to: '' });

  // Add Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ employee_id: '', allocation_percent: '100' });
  const [employees, setEmployees] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMemberSubmitting, setIsMemberSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProject();
    fetchEmployees();
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

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees/');
      setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/tasks/', {
        ...newTask,
        project_id: parseInt(id),
        assigned_to: parseInt(newTask.assigned_to)
      });
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', assigned_to: '' });
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsMemberSubmitting(true);
    setError('');
    try {
      await api.post('/allocations/', {
        employee_id: parseInt(newMember.employee_id),
        project_id: parseInt(id),
        allocation_percent: parseFloat(newMember.allocation_percent)
      });
      setIsMemberModalOpen(false);
      setNewMember({ employee_id: '', allocation_percent: '100' });
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add member');
    } finally {
      setIsMemberSubmitting(false);
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
            <Button 
              onClick={() => setIsMemberModalOpen(true)}
              className="flex items-center gap-2"
            >
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
              <button 
                onClick={() => setIsMemberModalOpen(true)}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                Manage Team
              </button>
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
                      <button className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
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
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                + New Task
              </button>
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
          <Card className="p-8 border-none shadow-sm bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
            
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 text-slate-800 relative z-10">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Calendar size={18} />
              </div>
              Project Timeline
            </h3>
            
            <div className="relative space-y-10 relative z-10 ml-3">
              {/* Vertical Line */}
              <div className="absolute left-[3px] top-2 bottom-2 w-[2px] bg-slate-100"></div>
              
              <div className="flex items-start gap-6 relative">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 ring-4 ring-indigo-50"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Kickoff Meeting</p>
                  <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                    <Clock size={12} />
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 relative">
                <div className="w-2 h-2 rounded-full bg-slate-200 mt-2 shrink-0 ring-4 ring-white"></div>
                <div>
                  <p className="text-sm font-bold text-slate-400 mb-1">Phase 1 Delivery</p>
                  <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Coming soon</p>
                </div>
              </div>

              <div className="flex items-start gap-6 relative">
                <div className="w-2 h-2 rounded-full bg-slate-200 mt-2 shrink-0 ring-4 ring-white"></div>
                <div>
                  <p className="text-sm font-bold text-slate-400 mb-1">Final Handover</p>
                  <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">TBD</p>
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

      {/* Add Task Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Task"
      >
        <form onSubmit={handleAddTask} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2 border border-rose-100">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Task Title</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <FileText size={18} />
              </div>
              <input
                type="text"
                placeholder="e.g. Design Database Schema"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea
              placeholder="Provide more context..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all resize-none"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assign To</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={18} />
              </div>
              <select
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all appearance-none"
                value={newTask.assigned_to}
                onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
              >
                <option value="">Select a team member</option>
                {project.allocations?.map((alloc) => (
                  <option key={alloc.employee.id} value={alloc.employee.id}>
                    {alloc.employee.name} ({alloc.employee.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal 
        isOpen={isMemberModalOpen} 
        onClose={() => setIsMemberModalOpen(false)} 
        title="Assign New Member"
      >
        <form onSubmit={handleAddMember} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2 border border-rose-100">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Employee</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={18} />
              </div>
              <select
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all appearance-none"
                value={newMember.employee_id}
                onChange={(e) => setNewMember({ ...newMember, employee_id: e.target.value })}
              >
                <option value="">Select an employee</option>
                {employees.filter(e => !project.allocations?.some(a => a.employee.id === e.id)).map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Allocation Percentage (%)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Activity size={18} />
              </div>
              <input
                type="number"
                min="1"
                max="100"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
                value={newMember.allocation_percent}
                onChange={(e) => setNewMember({ ...newMember, allocation_percent: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1" 
              onClick={() => setIsMemberModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isMemberSubmitting}
            >
              {isMemberSubmitting ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProjectDetails;
