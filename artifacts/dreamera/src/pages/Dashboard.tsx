import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Plus, BookOpen, Map, Star, Clock, Trash2, Edit2, LogOut,
  ChevronRight, Eye, Layers, TrendingUp, Menu, X
} from "lucide-react";

interface Story {
  id: number;
  title: string;
  description: string;
  status: "draft" | "rendering" | "complete";
  artifacts: number;
  energy: number;
  lastEdited: string;
}

const initialStories: Story[] = [
  { id: 1, title: "The Obsidian Chronicles", description: "A multi-layered narrative exploring the boundaries between digital consciousness and reality", status: "complete", artifacts: 24, energy: 92, lastEdited: "2 hours ago" },
  { id: 2, title: "Nebula's Whisper", description: "An interstellar journey through the memories of a dying star system", status: "rendering", artifacts: 16, energy: 67, lastEdited: "5 hours ago" },
  { id: 3, title: "Fractured Symmetry", description: "Parallel timelines converge in a city that exists in two dimensions simultaneously", status: "draft", artifacts: 8, energy: 34, lastEdited: "1 day ago" },
  { id: 4, title: "The Artifact Protocol", description: "When ancient maps begin rewriting themselves, a cartographer must decode the message", status: "complete", artifacts: 31, energy: 98, lastEdited: "3 days ago" },
  { id: 5, title: "Echo Chambers", description: "Stories within stories — an infinite regression of narrative consciousness", status: "draft", artifacts: 3, energy: 12, lastEdited: "1 week ago" },
];

const statusConfig = {
  draft: { label: "Draft", color: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
  rendering: { label: "Rendering", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  complete: { label: "Complete", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [stories, setStories] = useState(initialStories);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function logout() {
    const token = localStorage.getItem("szl_token");
    if (token) fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  function addStory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const description = fd.get("description") as string;
    if (!title.trim()) return;
    setStories(prev => [...prev, {
      id: Date.now(),
      title,
      description: description || "A new narrative awaits...",
      status: "draft",
      artifacts: 0,
      energy: 0,
      lastEdited: "Just now",
    }]);
    setShowForm(false);
  }

  function removeStory(id: number) {
    setStories(prev => prev.filter(s => s.id !== id));
  }

  const stats = [
    { label: "Total Stories", value: stories.length, icon: BookOpen, color: "from-violet-500 to-blue-500" },
    { label: "Artifact Maps", value: stories.reduce((sum, s) => sum + s.artifacts, 0), icon: Map, color: "from-blue-500 to-cyan-500" },
    { label: "Avg Energy", value: Math.round(stories.reduce((sum, s) => sum + s.energy, 0) / (stories.length || 1)), icon: TrendingUp, color: "from-violet-500 to-fuchsia-500" },
    { label: "Rendering", value: stories.filter(s => s.status === "rendering").length, icon: Layers, color: "from-blue-500 to-violet-500" },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-wider">DREAMERA</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Story Command</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-bold hover:bg-violet-500/20 transition">
              <Plus className="w-4 h-4" /> New Story
            </button>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition">
              <LogOut className="w-4 h-4" /> Disconnect
            </button>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-white/5 overflow-hidden">
              <div className="px-4 py-3 space-y-2">
                <button onClick={() => { setShowForm(true); setMobileMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-bold">
                  <Plus className="w-4 h-4" /> New Story
                </button>
                <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm">
                  <LogOut className="w-4 h-4" /> Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Story Archives</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your narrative worlds and artifact maps</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <form onSubmit={addStory} className="p-6 rounded-2xl bg-violet-500/5 border border-violet-500/20 space-y-4">
                <h3 className="text-lg font-display font-bold text-white">Initialize New Story</h3>
                <input name="title" placeholder="Story Title" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition text-sm" />
                <textarea name="description" placeholder="Story Description..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition text-sm resize-none" />
                <div className="flex gap-3">
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 text-white font-bold text-sm hover:opacity-90 transition">Create Story</button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {stories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/20 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-lg font-display font-bold text-white truncate">{story.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig[story.status].color}`}>
                      {statusConfig[story.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-1">{story.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Map className="w-3 h-3" />{story.artifacts} artifacts</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" />{story.energy}% energy</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{story.lastEdited}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="p-2 rounded-lg hover:bg-violet-500/10 text-gray-500 hover:text-violet-400 transition">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeStory(story.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-600 hidden sm:block" />
                </div>
              </div>
            </motion.div>
          ))}

          {stories.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-display font-bold text-gray-500">No Stories Yet</h3>
              <p className="text-sm text-gray-600 mt-1">Initialize your first story to begin exploring narrative space</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
