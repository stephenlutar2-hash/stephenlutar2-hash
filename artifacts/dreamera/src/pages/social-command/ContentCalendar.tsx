import { useState, useEffect, useMemo } from "react";
import SocialLayout from "@/components/social/SocialLayout";
import { listScheduledPosts, reschedulePost, deleteScheduledPost, seedCalendar } from "@/lib/api";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Edit3,
  Loader2,
  Database,
} from "lucide-react";
import { Link } from "wouter";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const STATUS_ICONS: Record<string, any> = {
  draft: Edit3,
  scheduled: Clock,
  published: CheckCircle2,
  failed: AlertCircle,
  pending: Send,
};

const PLATFORM_ICONS: Record<string, string> = {
  meta: "📘",
  twitter: "𝕏",
  linkedin: "💼",
  instagram: "📸",
  youtube: "▶️",
  medium: "✍️",
  substack: "📰",
};

const ALL_PLATFORMS = ["twitter", "linkedin", "meta", "instagram", "youtube", "medium", "substack"];
const PLATFORM_NAMES: Record<string, string> = {
  twitter: "X (Twitter)", linkedin: "LinkedIn", meta: "Meta", instagram: "Instagram",
  youtube: "YouTube", medium: "Medium", substack: "Substack",
};

interface Post {
  id: number;
  platform: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPlatform, setFilterPlatform] = useState<string>("");
  const [dragPost, setDragPost] = useState<Post | null>(null);
  const [seeding, setSeeding] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPlatform) params.platform = filterPlatform;
      const res = await listScheduledPosts(params);
      setPosts(res.data || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSeedCalendar = async () => {
    setSeeding(true);
    try {
      await seedCalendar({ startDate: new Date().toISOString() });
      await loadPosts();
    } catch (e) {
      console.error("Seed failed:", e);
    } finally {
      setSeeding(false);
    }
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: Date; inMonth: boolean }[] = [];
    for (let i = startPad - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), inMonth: false });
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push({ date: new Date(year, month, d), inMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), inMonth: false });
    }
    return days;
  }, [year, month]);

  const getPostsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return posts.filter((p) => {
      const postDate = p.scheduledAt || p.createdAt;
      return postDate && postDate.split("T")[0] === dateStr;
    });
  };

  const handleDrop = async (date: Date) => {
    if (!dragPost) return;
    const newDate = new Date(date);
    newDate.setHours(12, 0, 0, 0);
    try {
      await reschedulePost(dragPost.id, newDate.toISOString());
      setPosts((prev) =>
        prev.map((p) =>
          p.id === dragPost.id ? { ...p, scheduledAt: newDate.toISOString(), status: "scheduled" } : p
        )
      );
    } catch (e) {
      console.error("Reschedule failed:", e);
    }
    setDragPost(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteScheduledPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date();

  return (
    <SocialLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Content Calendar
            </h1>
            <p className="text-muted-foreground mt-1">
              Schedule and manage posts across all 7 platforms
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedCalendar}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 disabled:opacity-50 transition-colors"
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Seed 8-Week Calendar
            </button>
            <Link
              to="/social-command/generator"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-semibold text-foreground min-w-[180px] text-center">
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setTimeout(loadPosts, 0); }}
                className="bg-input border border-border rounded-lg px-2 py-1.5 text-xs text-foreground"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={filterPlatform}
                onChange={(e) => { setFilterPlatform(e.target.value); setTimeout(loadPosts, 0); }}
                className="bg-input border border-border rounded-lg px-2 py-1.5 text-xs text-foreground"
              >
                <option value="">All Platforms</option>
                {ALL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>{PLATFORM_NAMES[p]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="grid grid-cols-7 border-b border-border/50">
            {DAY_LABELS.map((day) => (
              <div key={day} className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map(({ date, inMonth }, idx) => {
              const dayPosts = getPostsForDate(date);
              const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] border-b border-r border-border/30 p-1.5 transition-colors ${
                    inMonth ? "" : "opacity-30"
                  } ${dragPost ? "hover:bg-primary/5" : ""}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(date)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}>
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {dayPosts.slice(0, 3).map((post) => (
                      <div
                        key={post.id}
                        draggable
                        onDragStart={() => setDragPost(post)}
                        onDragEnd={() => setDragPost(null)}
                        className={`group flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border cursor-grab active:cursor-grabbing ${
                          STATUS_COLORS[post.status] || STATUS_COLORS.draft
                        }`}
                      >
                        <span>{PLATFORM_ICONS[post.platform] || "📱"}</span>
                        <span className="truncate flex-1">{post.content.slice(0, 20)}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                          className="hidden group-hover:block"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <span className="text-[10px] text-muted-foreground pl-1">+{dayPosts.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span className="font-medium">Legend:</span>
          {Object.entries(STATUS_COLORS).map(([status, cls]) => (
            <span key={status} className={`px-2 py-0.5 rounded border ${cls}`}>{status}</span>
          ))}
          <span className="ml-4 font-medium">Platforms:</span>
          {ALL_PLATFORMS.map((p) => (
            <span key={p}>{PLATFORM_ICONS[p]} {PLATFORM_NAMES[p]}</span>
          ))}
        </div>
      </div>
    </SocialLayout>
  );
}
