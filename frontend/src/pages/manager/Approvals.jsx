import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { 
  Check, X, ChevronDown, Filter, Clock, 
  User, Briefcase, FileText, CheckCircle2, AlertCircle,
  Inbox, Sparkles, TrendingUp, Zap
} from "lucide-react";

const ApprovalsStat = ({ icon: Icon, label, value, subValue, colorClass, bgClass }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:scale-110 transition-transform duration-500 ${bgClass}`}></div>
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <h3 className="text-2xl font-black text-slate-800 leading-none">{value}</h3>
      </div>
    </div>
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${bgClass.replace('bg-', 'bg-').replace('-50', '-400')}`}></div>
      <span className="text-[11px] font-bold text-slate-500">{subValue}</span>
    </div>
  </div>
);

function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/approvals/pending");
      setApprovals(data);
    } catch (err) {
      console.error("Failed to fetch approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setProcessingId(id);
    try {
      await api.put(`/approvals/${id}`, { action, comment: "" });
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApprovals = approvals.filter(a => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-md">Manager Hub</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workflow</span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Timesheet Approvals</h1>
          <p className="text-slate-500 font-medium mt-1">Efficiently verify and approve team labor logs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
            {["pending", "all"].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      {/* Modern Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ApprovalsStat 
          icon={Inbox} 
          label="Pending Review" 
          value={approvals.length} 
          subValue="Requires action"
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <ApprovalsStat 
          icon={TrendingUp} 
          label="Weekly Productivity" 
          value="92%" 
          subValue="Across 4 teams"
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <ApprovalsStat 
          icon={Clock} 
          label="Avg. Approval Time" 
          value="4.2h" 
          subValue="Target: < 24h"
          colorClass="text-indigo-600"
          bgClass="bg-indigo-50"
        />
        <ApprovalsStat 
          icon={Zap} 
          label="Team Utilization" 
          value="88%" 
          subValue="+5% from last week"
          colorClass="text-violet-600"
          bgClass="bg-violet-50"
        />
      </div>

      {/* Approvals Feed */}
      <div className="flex flex-col gap-5">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white animate-pulse rounded-2xl border border-slate-100"></div>)}
          </div>
        ) : filteredApprovals.length > 0 ? (
          filteredApprovals.map((log) => (
            <div key={log.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group relative">
              <div className="flex flex-col lg:flex-row items-center gap-6 p-5">
                
                {/* Profile Section */}
                <div className="flex items-center gap-4 min-w-[220px]">
                  <div className="relative">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${log.employee?.name || 'User'}&background=6366f1&color=fff&bold=true`} 
                      alt="Avatar" 
                      className="w-14 h-14 rounded-2xl object-cover shadow-inner border-2 border-white" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-base leading-tight">{log.employee?.name || `Employee #${log.employee_id}`}</h4>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                      <Clock size={10} className="text-indigo-500" />
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden lg:block w-px h-10 bg-slate-100"></div>

                {/* Details Section */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Project Assignment</span>
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      {log.project?.name || `Project #${log.project_id}`}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Activity Narrative</span>
                    <p className="text-sm font-medium text-slate-500 line-clamp-1 italic italic-medium italic text-slate-600">"{log.description || "Project work and coordination."}"</p>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-8 pl-6 border-l border-slate-50">
                  <div className="text-right">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Time Logged</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-black text-slate-800 leading-none">{log.hours}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase">hrs</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleAction(log.id, "approved")}
                      disabled={processingId === log.id}
                      className="group/btn w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      <Check size={22} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={() => handleAction(log.id, "rejected")}
                      disabled={processingId === log.id}
                      className="group/btn w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      <X size={22} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Accents */}
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-400 rounded-l-2xl"></div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shadow-inner">
                <Inbox size={40} strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-slate-50 flex items-center justify-center text-emerald-500">
                <Sparkles size={20} />
              </div>
            </div>
            <div className="max-w-xs">
              <h3 className="text-xl font-black text-slate-800 mb-2">Zero Pending Tasks</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Your team is all caught up! There are no timesheets awaiting your review at this moment.
              </p>
            </div>
            <button 
              onClick={fetchApprovals}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Refresh Inbox
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Approvals;
