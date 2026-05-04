import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { getAuthUser } from "../components/ProtectedRoute";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { 
  User, Mail, Shield, Clock, Briefcase, 
  Settings, Bell, Lock, Edit3, Camera, TrendingUp
} from "lucide-react";

function Profile() {
  const user = getAuthUser();
  const [stats, setStats] = useState({
    totalHours: 0,
    activeProjects: 0,
    approvalRate: "98%"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      // Use /my for personal stats
      const { data } = await api.get('/time-logs/my');
      const totalHours = data.reduce((sum, l) => sum + l.hours, 0);
      
      setStats(prev => ({
        ...prev,
        totalHours: totalHours.toFixed(1),
        activeProjects: new Set(data.map(l => l.project_id)).size
      }));
    } catch (err) {
      console.error("Failed to fetch profile stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Profile Header */}
      <Card className="p-0 border-none shadow-sm overflow-hidden bg-white">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-[2rem] shadow-xl">
            <div className="relative group">
              <img 
                src={`https://ui-avatars.com/api/?name=${user.name}&background=f1f5f9&color=6366f1&size=128`} 
                alt="Profile" 
                className="w-28 h-28 rounded-[1.8rem] object-cover"
              />
              <button className="absolute inset-0 bg-black/40 rounded-[1.8rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-slate-800">{user.name}</h1>
              <Badge variant="indigo">{user.role}</Badge>
            </div>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <Mail size={14} />
              {user.email || "user@worktrack.com"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="flex items-center gap-2">
              <Settings size={18} />
              Settings
            </Button>
            <Button className="flex items-center gap-2 shadow-lg shadow-indigo-100">
              <Edit3 size={18} />
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Info */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card className="p-8 border-none shadow-sm flex flex-col gap-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500" />
              Quick Stats
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Hours</p>
                  <p className="text-xl font-black text-slate-700">{stats.totalHours}h</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Active Projects</p>
                  <p className="text-xl font-black text-slate-700">{stats.activeProjects}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Approval Rate</p>
                  <p className="text-xl font-black text-slate-700">{stats.approvalRate}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Lock size={20} className="text-indigo-500" />
              Security
            </h3>
            <div className="space-y-4">
              <button className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors group">
                <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Change Password</p>
                <p className="text-xs text-slate-400 font-medium">Last updated 3 months ago</p>
              </button>
              <button className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors group">
                <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Two-Factor Auth</p>
                <p className="text-xs text-rose-400 font-bold">Currently Disabled</p>
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column: Preferences & Activity */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card className="p-8 border-none shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
              <Bell size={20} className="text-indigo-500" />
              Preferences
            </h3>
            
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-700">Email Notifications</p>
                  <p className="text-xs text-slate-500 font-medium">Receive weekly activity summaries</p>
                </div>
                <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-700">Daily Reminders</p>
                  <p className="text-xs text-slate-500 font-medium">Alert if logs aren't submitted by 6 PM</p>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-700">Display Language</p>
                  <p className="text-xs text-slate-500 font-medium">System default</p>
                </div>
                <select className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-600 outline-none">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Hindi</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <User size={20} className="text-indigo-500" />
              Personal Bio
            </h3>
            <textarea 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              rows={4}
              placeholder="Tell us about your professional background..."
              defaultValue="Productivity enthusiast and full-stack developer. Focused on building efficient time tracking solutions and improving team workflows."
            />
            <div className="flex justify-end mt-4">
              <Button size="sm">Save Changes</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile;
