import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, LogOut, Menu, X, Calendar, ChevronLeft, ChevronRight,
  Plus, Clock, FileText, Video, Mail, Share2, Eye
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  type: "article" | "video" | "social" | "email";
  date: string;
  time?: string;
  status: "scheduled" | "draft" | "published";
}

const typeIcons: Record<string, typeof FileText> = {
  article: FileText,
  video: Video,
  social: Share2,
  email: Mail,
};

const typeColors: Record<string, string> = {
  article: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  video: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  social: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  email: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const statusDots: Record<string, string> = {
  scheduled: "bg-blue-400",
  draft: "bg-gray-400",
  published: "bg-emerald-400",
};

const initialEvents: CalendarEvent[] = [
  { id: "e1", title: "Q1 Brand Story Part 1", type: "article", date: "2026-03-02", time: "10:00", status: "published" },
  { id: "e2", title: "Product Launch Teaser", type: "video", date: "2026-03-05", time: "14:00", status: "published" },
  { id: "e3", title: "Weekly Newsletter #40", type: "email", date: "2026-03-07", time: "09:00", status: "published" },
  { id: "e4", title: "Instagram Carousel", type: "social", date: "2026-03-10", time: "12:00", status: "published" },
  { id: "e5", title: "Case Study: Enterprise", type: "article", date: "2026-03-12", time: "11:00", status: "published" },
  { id: "e6", title: "LinkedIn Thought Leadership", type: "social", date: "2026-03-15", time: "08:00", status: "published" },
  { id: "e7", title: "Product Demo Video", type: "video", date: "2026-03-18", time: "15:00", status: "published" },
  { id: "e8", title: "Weekly Newsletter #41", type: "email", date: "2026-03-21", time: "09:00", status: "published" },
  { id: "e9", title: "Spring Campaign Launch", type: "social", date: "2026-03-24", time: "10:00", status: "published" },
  { id: "e10", title: "Q1 Brand Story Part 2", type: "article", date: "2026-03-26", time: "11:00", status: "scheduled" },
  { id: "e11", title: "Weekly Newsletter #42", type: "email", date: "2026-03-28", time: "09:00", status: "scheduled" },
  { id: "e12", title: "Platform Update Video", type: "video", date: "2026-03-30", time: "14:00", status: "draft" },
  { id: "e13", title: "April Campaign Planning", type: "social", date: "2026-04-01", time: "10:00", status: "draft" },
  { id: "e14", title: "Q2 Kickoff Email", type: "email", date: "2026-04-02", time: "09:00", status: "draft" },
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ContentCalendar() {
  const [, setLocation] = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));
  const [events, setEvents] = useState(initialEvents);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);

  function logout() {
    const token = localStorage.getItem("szl_token");
    if (token) fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); }

  function getEventsForDate(dateStr: string) {
    return events.filter(e => e.date === dateStr);
  }

  function handleDrop(dateStr: string, e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!draggedEvent) return;
    setEvents(prev => prev.map(evt => evt.id === draggedEvent ? { ...evt, date: dateStr } : evt));
    setDraggedEvent(null);
  }

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const todayStr = "2026-03-26";

  const weekStart = (() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay());
    return d;
  })();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  function prevWeek() { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7)); }
  function nextWeek() { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7)); }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center cursor-pointer" onClick={() => setLocation("/dashboard")}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-wider">DREAMERA</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Content Calendar</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Dashboard</Link>
            <Link href="/content-pipeline" className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Pipeline</Link>
            <Link href="/campaign-analytics" className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Analytics</Link>
            <Link href="/content-calendar" className="px-3 py-2 rounded-lg text-sm bg-violet-500/10 text-violet-400 border border-violet-500/20">Calendar</Link>
            <Link href="/story-intelligence" className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Intelligence</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-white/5"
            >
              <div className="px-4 py-3 space-y-1">
                <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Dashboard</Link>
                <Link href="/content-pipeline" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Pipeline</Link>
                <Link href="/campaign-analytics" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Analytics</Link>
                <Link href="/content-calendar" className="block px-3 py-2 rounded-lg text-sm bg-violet-500/10 text-violet-400 border border-violet-500/20">Calendar</Link>
                <Link href="/story-intelligence" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Intelligence</Link>
                <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
            Content Calendar
          </h2>
          <p className="text-sm text-gray-500 mt-1">Schedule and manage your content publishing timeline</p>
        </motion.div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={viewMode === "month" ? prevMonth : prevWeek} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition">
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <h3 className="text-lg font-bold text-white min-w-[180px] text-center">
              {viewMode === "month" ? `${MONTHS[month]} ${year}` : `${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            </h3>
            <button onClick={viewMode === "month" ? nextMonth : nextWeek} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${viewMode === "month" ? "bg-violet-500/10 border-violet-500/20 text-violet-400" : "bg-white/5 border-white/10 text-gray-400"}`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${viewMode === "week" ? "bg-violet-500/10 border-violet-500/20 text-violet-400" : "bg-white/5 border-white/10 text-gray-400"}`}
            >
              Week
            </button>
          </div>
        </div>

        {viewMode === "month" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden"
          >
            <div className="grid grid-cols-7 border-b border-white/5">
              {DAYS.map(day => (
                <div key={day} className="px-2 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-white/[0.03]" />;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = getEventsForDate(dateStr);
                const isToday = dateStr === todayStr;
                const isSelected = selectedDay === dateStr;
                return (
                  <motion.div
                    key={dateStr}
                    onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                    onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
                    onDrop={(e: React.DragEvent<HTMLDivElement>) => handleDrop(dateStr, e)}
                    className={`min-h-[100px] border-b border-r border-white/[0.03] p-1.5 cursor-pointer transition-colors hover:bg-white/[0.02] ${
                      isSelected ? "bg-violet-500/5" : ""
                    } ${draggedEvent ? "hover:bg-violet-500/10" : ""}`}
                  >
                    <div className={`text-xs font-mono mb-1 px-1 ${isToday ? "text-violet-400 font-bold" : "text-gray-500"}`}>
                      {isToday && <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400 mr-1 align-middle" />}
                      {day}
                    </div>
                    {dayEvents.slice(0, 3).map(evt => (
                        <motion.div
                          key={evt.id}
                          draggable
                          onDragStart={() => setDraggedEvent(evt.id)}
                          onDragEnd={() => setDraggedEvent(null)}
                          whileHover={{ scale: 1.05 }}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] mb-0.5 border cursor-grab active:cursor-grabbing ${typeColors[evt.type]} ${
                            draggedEvent === evt.id ? "opacity-50" : ""
                          }`}
                        >
                          <div className={`w-1 h-1 rounded-full ${statusDots[evt.status]}`} />
                          <span className="truncate">{evt.title}</span>
                        </motion.div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-gray-600 px-1.5">+{dayEvents.length - 3} more</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="week"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden"
          >
            <div className="grid grid-cols-7 border-b border-white/5">
              {weekDays.map(d => {
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                const isToday2 = dateStr === todayStr;
                return (
                  <div key={dateStr} className={`px-2 py-3 text-center border-r border-white/[0.03] ${isToday2 ? "bg-violet-500/5" : ""}`}>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{DAYS[d.getDay()]}</div>
                    <div className={`text-sm font-mono mt-0.5 ${isToday2 ? "text-violet-400 font-bold" : "text-gray-400"}`}>{d.getDate()}</div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7">
              {weekDays.map(d => {
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                const dayEvents = getEventsForDate(dateStr);
                const isToday2 = dateStr === todayStr;
                const isSelected = selectedDay === dateStr;
                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                    onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
                    onDrop={(e: React.DragEvent<HTMLDivElement>) => handleDrop(dateStr, e)}
                    className={`min-h-[240px] border-r border-white/[0.03] p-2 cursor-pointer transition-colors hover:bg-white/[0.02] ${
                      isSelected ? "bg-violet-500/5" : ""
                    } ${isToday2 ? "bg-violet-500/[0.02]" : ""} ${draggedEvent ? "hover:bg-violet-500/10" : ""}`}
                  >
                    {dayEvents.map(evt => {
                      const Icon = typeIcons[evt.type];
                      return (
                        <motion.div
                          key={evt.id}
                          draggable
                          onDragStart={() => setDraggedEvent(evt.id)}
                          onDragEnd={() => setDraggedEvent(null)}
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs mb-1.5 border cursor-grab active:cursor-grabbing ${typeColors[evt.type]} ${
                            draggedEvent === evt.id ? "opacity-50" : ""
                          }`}
                        >
                          <Icon className="w-3 h-3 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{evt.title}</p>
                            {evt.time && <p className="text-[9px] opacity-70 flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5" />{evt.time}</p>}
                          </div>
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDots[evt.status]}`} />
                        </motion.div>
                      );
                    })}
                    {dayEvents.length === 0 && (
                      <div className="flex items-center justify-center h-full text-gray-700 text-[10px]">No events</div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">
                    {new Date(selectedDay + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </h3>
                  <button onClick={() => setSelectedDay(null)} className="text-gray-500 hover:text-white transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {getEventsForDate(selectedDay).length === 0 ? (
                  <p className="text-sm text-gray-600">No content scheduled for this day</p>
                ) : (
                  <div className="space-y-2">
                    {getEventsForDate(selectedDay).map(evt => {
                      const Icon = typeIcons[evt.type];
                      return (
                        <div key={evt.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[evt.type].split(" ").slice(0, 1).join(" ")}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{evt.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                              {evt.time && <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{evt.time}</span>}
                              <span className="capitalize">{evt.type}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${statusDots[evt.status]}`} />
                            <span className="text-[10px] text-gray-500 capitalize">{evt.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {Object.entries(typeIcons).map(([type, Icon]) => {
            const count = events.filter(e => e.type === type).length;
            const scheduled = events.filter(e => e.type === type && e.status === "scheduled").length;
            return (
              <div key={type} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider capitalize">{type}s</span>
                </div>
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{scheduled} upcoming</p>
              </div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
