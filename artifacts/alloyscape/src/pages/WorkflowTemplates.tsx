import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import { FileCode2, Clock, Hash, Tag, ChevronRight, Search, ArrowUpDown } from "lucide-react";
import { workflowTemplates } from "@/data/demo";

const categoryColors: Record<string, string> = {
  Security: "from-red-500 to-orange-500",
  Data: "from-emerald-500 to-green-500",
  "Machine Learning": "from-violet-500 to-purple-500",
  Operations: "from-blue-500 to-cyan-500",
  Content: "from-pink-500 to-rose-500",
  Finance: "from-amber-500 to-yellow-500",
  Infrastructure: "from-teal-500 to-cyan-500",
};

type SortKey = "name" | "steps" | "usageCount";

export default function WorkflowTemplates() {
  const loading = useSimulatedLoading();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("usageCount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoadingSkeleton title="Workflow Templates" />
      </DashboardLayout>
    );
  }

  const categories = ["all", ...Array.from(new Set(workflowTemplates.map(t => t.category)))];

  function toggleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  const filtered = workflowTemplates
    .filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
      if (sortBy === "steps") return (a.steps - b.steps) * dir;
      if (sortBy === "usageCount") return (a.usageCount - b.usageCount) * dir;
      return 0;
    });

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-white">Workflow Templates</h2>
          <p className="text-sm text-gray-500 mt-1">Reusable workflow definitions for common operations</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-colors ${
                  selectedCategory === cat
                    ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {(["name", "steps", "usageCount"] as SortKey[]).map(key => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wider border transition-colors ${sortBy === key ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"}`}
            >
              <ArrowUpDown className="w-3 h-3" />
              {key === "usageCount" ? "usage" : key} {sortBy === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </button>
          ))}
        </div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
        >
          {filtered.map(tmpl => (
            <motion.div
              key={tmpl.id}
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.01 }}
              className="group rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all p-5"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categoryColors[tmpl.category] || "from-gray-500 to-gray-600"} flex items-center justify-center shrink-0 group-hover:shadow-lg transition-shadow`}>
                  <FileCode2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white">{tmpl.name}</h3>
                    <ChevronRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{tmpl.description}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{tmpl.steps} steps</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tmpl.lastUsed}</span>
                    <span className="flex items-center gap-1 font-medium text-cyan-400/60">Used {tmpl.usageCount.toLocaleString()}x</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tmpl.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <FileCode2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-500">No Templates Found</h3>
              <p className="text-sm text-gray-600 mt-1">Try adjusting your search or category filter</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
