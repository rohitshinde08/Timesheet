import { useState, useEffect } from "react";
import { api } from "../utils/api";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { 
  ChevronLeft, ChevronRight, Clock, Plus, 
  Calendar as CalendarIcon, User, Briefcase, Filter, TrendingUp
} from "lucide-react";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [currentDate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // In a real app, we'd filter by month on the backend
      const { data } = await api.get('/time-logs/');
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Adjust for Monday start (0 is Sunday)
    const padding = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    for (let i = 0; i < padding; i++) {
      days.push({ day: null, type: 'padding' });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      // Use local date parts to avoid UTC timezone shift
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayLogs = logs.filter(l => l.date === dateString);
      const totalHours = dayLogs.reduce((sum, l) => sum + l.hours, 0);
      
      days.push({ 
        day: i, 
        date: dateString,
        type: 'current',
        logs: dayLogs,
        totalHours
      });
    }
    return days;
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const selectedDayLogs = selectedDate ? days.find(d => d.date === selectedDate)?.logs || [] : [];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Resource Calendar</h1>
          <p className="text-slate-500 font-medium">Visualize team activity and time distribution.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 font-bold text-slate-700 min-w-[140px] text-center capitalize">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            Log Time
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        {/* Calendar Grid */}
        <div className="xl:col-span-3">
          <Card className="p-1 border-none shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
              {weekDays.map(day => (
                <div key={day} className="py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day, idx) => (
                <div 
                  key={idx} 
                  onClick={() => day.date && setSelectedDate(day.date)}
                  className={`min-h-[120px] p-3 border-r border-b border-slate-100 transition-all cursor-pointer relative group
                    ${!day.day ? 'bg-slate-50/30' : 'hover:bg-indigo-50/30'}
                    ${selectedDate === day.date ? 'bg-indigo-50/50 ring-1 ring-inset ring-indigo-200' : ''}
                    ${idx % 7 === 6 ? 'border-r-0' : ''}
                  `}
                >
                  {day.day && (
                    <>
                      <span className={`text-sm font-bold ${selectedDate === day.date ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {day.day}
                      </span>
                      {day.totalHours > 0 && (
                        <div className="mt-2 flex flex-col gap-1">
                          <div className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg w-fit shadow-md shadow-indigo-200">
                            {day.totalHours}h Logged
                          </div>
                          {day.logs.slice(0, 2).map(log => (
                            <div key={log.id} className="text-[9px] font-bold text-slate-500 truncate bg-white/50 px-1.5 py-0.5 rounded border border-slate-100">
                              {log.project?.name || 'Task'}
                            </div>
                          ))}
                          {day.logs.length > 2 && (
                            <div className="text-[9px] font-black text-indigo-400 pl-1">
                              +{day.logs.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                      {day.date === (() => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`; })() && (
                        <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar: Day Details */}
        <div className="flex flex-col gap-6">
          <Card className="p-6 border-none shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <CalendarIcon size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select a date'}
              </h3>
            </div>

            {selectedDayLogs.length > 0 ? (
              <div className="space-y-4">
                {selectedDayLogs.map(log => (
                  <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{log.hours} Hours</span>
                      <Badge variant={log.status}>{log.status}</Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-700 mb-1">{log.project?.name || "Project name"}</p>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2">{log.description || "No description provided."}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Clock size={24} />
                </div>
                <p className="text-sm font-bold text-slate-400">No activity logged for this day.</p>
                <Button variant="secondary" className="mt-2 text-xs">
                  Add Entry
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6 border-none shadow-sm bg-gradient-to-br from-indigo-600 to-indigo-700 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="font-bold mb-2">Monthly Insight</h4>
              <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                You have logged {logs.reduce((sum, l) => sum + l.hours, 0)} hours so far this month. You're on track to meet your targets!
              </p>
            </div>
            <TrendingUp size={80} className="absolute -bottom-4 -right-4 text-white/10" />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
