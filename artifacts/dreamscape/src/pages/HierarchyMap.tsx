import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe, Layers, Image, ChevronDown, ChevronRight,
  GitBranch, Minimize2, Maximize2
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { worlds, getProjectsByWorld, getArtifactsByProject, type World, type Project } from "@/data/demo";

interface TreeNode {
  world: World;
  expanded: boolean;
  projects: { project: Project; expanded: boolean }[];
}

export default function HierarchyMap() {
  const [treeData, setTreeData] = useState<TreeNode[]>(
    worlds.map(w => ({
      world: w,
      expanded: false,
      projects: getProjectsByWorld(w.id).map(p => ({ project: p, expanded: false })),
    }))
  );
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");

  function toggleWorld(worldId: string) {
    setTreeData(prev => prev.map(n =>
      n.world.id === worldId ? { ...n, expanded: !n.expanded } : n
    ));
  }

  function toggleProject(worldId: string, projectId: string) {
    setTreeData(prev => prev.map(n =>
      n.world.id === worldId
        ? { ...n, projects: n.projects.map(p => p.project.id === projectId ? { ...p, expanded: !p.expanded } : p) }
        : n
    ));
  }

  function expandAll() {
    setTreeData(prev => prev.map(n => ({ ...n, expanded: true, projects: n.projects.map(p => ({ ...p, expanded: true })) })));
  }

  function collapseAll() {
    setTreeData(prev => prev.map(n => ({ ...n, expanded: false, projects: n.projects.map(p => ({ ...p, expanded: false })) })));
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Hierarchy Map
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Visualize relationships between worlds, projects, and artifacts</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={expandAll} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 transition">
              <Maximize2 className="w-3 h-3" /> Expand All
            </button>
            <button onClick={collapseAll} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 transition">
              <Minimize2 className="w-3 h-3" /> Collapse
            </button>
            <button
              onClick={() => setViewMode(viewMode === "tree" ? "grid" : "tree")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 font-bold hover:bg-cyan-500/20 transition"
            >
              <GitBranch className="w-3 h-3" /> {viewMode === "tree" ? "Grid View" : "Tree View"}
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {worlds.map((w, i) => {
              const wProjects = getProjectsByWorld(w.id);
              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${w.color} flex items-center justify-center`}>
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-bold text-white">{w.name}</h3>
                      <p className="text-[10px] text-gray-500">{w.projectCount} projects &middot; {w.artifactCount} artifacts</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {wProjects.map(p => {
                      const pArtifacts = getArtifactsByProject(p.id);
                      return (
                        <div key={p.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-300">{p.name}</span>
                            <span className="text-[10px] text-gray-500">{pArtifacts.length} art.</span>
                          </div>
                          {pArtifacts.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {pArtifacts.slice(0, 4).map(a => (
                                <img key={a.id} src={a.thumbnail} alt={a.title} className="w-8 h-8 rounded object-cover border border-white/10" />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {treeData.map((node, i) => (
              <motion.div
                key={node.world.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => toggleWorld(node.world.id)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/20 transition group"
                >
                  {node.expanded ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${node.world.color} flex items-center justify-center`}>
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-display font-bold text-white">{node.world.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{node.world.description}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{node.projects.length}</span>
                    <span className="flex items-center gap-1"><Image className="w-3 h-3" />{node.world.artifactCount}</span>
                  </div>
                </button>

                {node.expanded && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-white/5 pl-4">
                    {node.projects.map(pNode => {
                      const pArtifacts = getArtifactsByProject(pNode.project.id);
                      return (
                        <div key={pNode.project.id}>
                          <button
                            onClick={() => toggleProject(node.world.id, pNode.project.id)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition"
                          >
                            {pArtifacts.length > 0 ? (
                              pNode.expanded ? <ChevronDown className="w-3.5 h-3.5 text-purple-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                            ) : <div className="w-3.5" />}
                            <Layers className="w-4 h-4 text-purple-400" />
                            <div className="text-left flex-1 min-w-0">
                              <p className="text-sm text-gray-300">{pNode.project.name}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              pNode.project.status === "active" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                              pNode.project.status === "draft" ? "text-gray-400 bg-gray-500/10 border-gray-500/20" :
                              "text-amber-400 bg-amber-500/10 border-amber-500/20"
                            }`}>
                              {pNode.project.status}
                            </span>
                            <span className="text-[10px] text-gray-600">{pArtifacts.length} artifacts</span>
                          </button>

                          {pNode.expanded && pArtifacts.length > 0 && (
                            <div className="ml-8 mt-1 space-y-1 border-l border-white/5 pl-4 pb-2">
                              {pArtifacts.map(a => (
                                <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition">
                                  <img src={a.thumbnail} alt={a.title} className="w-8 h-8 rounded object-cover border border-white/10" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-300 truncate">{a.title}</p>
                                    <p className="text-[10px] text-gray-600">{a.type} &middot; {a.resolution}</p>
                                  </div>
                                  <span className="flex items-center gap-1 text-[10px] text-gray-600">
                                    <Image className="w-3 h-3" /> {a.likes}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
