import { useState, useEffect } from "react";
import SocialLayout from "@/components/social/SocialLayout";
import {
  listTemplates,
  createTemplate,
  deleteTemplate,
  listBrandAssets,
  createBrandAsset,
  deleteBrandAsset,
} from "@/lib/api";
import {
  BookOpen,
  Plus,
  Trash2,
  Copy,
  Check,
  Tag,
  Palette,
  FileText,
  Search,
  X,
  Loader2,
} from "lucide-react";

const CATEGORIES = ["general", "announcement", "promotion", "educational", "engagement", "brand"];
const ASSET_TYPES = ["color", "font", "tagline", "hashtag", "boilerplate"];

const SZL_DEFAULT_TEMPLATES = [
  {
    name: "Product Launch",
    category: "announcement",
    content: "🚀 Exciting news! We're launching [Product Name] — [brief description]. Built for [audience], designed to [value prop].\n\nLearn more: [link]\n\n#SZLHoldings #Innovation",
    platform: null,
  },
  {
    name: "Thought Leadership",
    category: "educational",
    content: "The future of [industry] is being shaped by [trend]. At SZL Holdings, we're at the forefront with [solution/approach].\n\nHere's what we're seeing:\n\n1. [Insight 1]\n2. [Insight 2]\n3. [Insight 3]\n\n#SZLHoldings #ThoughtLeadership",
    platform: "linkedin",
  },
  {
    name: "Quick Update (X)",
    category: "general",
    content: "[Key message] 🔥\n\n[Supporting detail]\n\n#SZLHoldings",
    platform: "twitter",
  },
  {
    name: "Community Engagement",
    category: "engagement",
    content: "What's the biggest challenge you face with [topic]? We'd love to hear your thoughts! 💬\n\nDrop your answer below 👇\n\n#SZLHoldings #Community",
    platform: null,
  },
];

const SZL_DEFAULT_ASSETS = [
  { name: "Primary Brand Color", type: "color", value: "#d4a84b", category: "brand" },
  { name: "Secondary Brand Color", type: "color", value: "#a855f7", category: "brand" },
  { name: "Dark Background", type: "color", value: "#0a0814", category: "brand" },
  { name: "Display Font", type: "font", value: "Syne", category: "brand" },
  { name: "Body Font", type: "font", value: "Manrope", category: "brand" },
  { name: "Brand Tagline", type: "tagline", value: "Building Tomorrow's Infrastructure", category: "brand" },
  { name: "Primary Hashtags", type: "hashtag", value: "#SZLHoldings #Innovation #Enterprise", category: "brand" },
  { name: "Company Boilerplate", type: "boilerplate", value: "SZL Holdings is a diversified technology holding company building enterprise-grade platforms across cybersecurity, maritime intelligence, financial services, and creative technology.", category: "brand" },
];

export default function ContentLibrary() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"templates" | "assets">("templates");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "general", content: "", platform: "", type: "color", value: "" });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [templatesRes, assetsRes] = await Promise.allSettled([
        listTemplates(),
        listBrandAssets(),
      ]);
      let t = templatesRes.status === "fulfilled" ? (templatesRes.value.data || []) : [];
      let a = assetsRes.status === "fulfilled" ? (assetsRes.value.data || []) : [];

      if (t.length === 0) {
        t = SZL_DEFAULT_TEMPLATES.map((tmpl, i) => ({ id: -(i + 1), ...tmpl, tags: "", isDefault: true }));
      }
      if (a.length === 0) {
        a = SZL_DEFAULT_ASSETS.map((asset, i) => ({ id: -(i + 1), ...asset }));
      }
      setTemplates(t);
      setAssets(a);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTemplate = async () => {
    if (!newItem.name || !newItem.content) return;
    setSaving(true);
    try {
      const res = await createTemplate({
        name: newItem.name,
        category: newItem.category,
        content: newItem.content,
        platform: newItem.platform || null,
      });
      if (res.data) {
        setTemplates((prev) => [...prev, res.data]);
      }
      setShowNew(false);
      setNewItem({ name: "", category: "general", content: "", platform: "", type: "color", value: "" });
    } catch (e) {
      console.error("Create failed:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAsset = async () => {
    if (!newItem.name || !newItem.value) return;
    setSaving(true);
    try {
      const res = await createBrandAsset({
        name: newItem.name,
        type: newItem.type,
        value: newItem.value,
        category: newItem.category,
      });
      if (res.data) {
        setAssets((prev) => [...prev, res.data]);
      }
      setShowNew(false);
      setNewItem({ name: "", category: "general", content: "", platform: "", type: "color", value: "" });
    } catch (e) {
      console.error("Create failed:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (id < 0) return;
    try {
      await deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {}
  };

  const handleDeleteAsset = async (id: number) => {
    if (id < 0) return;
    try {
      await deleteBrandAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch {}
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredTemplates = templates.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.content.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory && t.category !== filterCategory) return false;
    return true;
  });

  const filteredAssets = assets.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <SocialLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </SocialLayout>
    );
  }

  return (
    <SocialLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Content Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Saved templates, brand assets, and reusable content blocks
            </p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {tab === "templates" ? "New Template" : "New Asset"}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setTab("templates")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === "templates"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-1.5" />
              Templates ({templates.length})
            </button>
            <button
              onClick={() => setTab("assets")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === "assets"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Palette className="w-4 h-4 inline mr-1.5" />
              Brand Assets ({assets.length})
            </button>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-input border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {tab === "templates" && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          )}
        </div>

        {showNew && (
          <div className="bg-card/50 border border-primary/20 rounded-xl p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                New {tab === "templates" ? "Template" : "Brand Asset"}
              </h3>
              <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Name</label>
                <input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {tab === "templates" ? (
              <>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Platform (optional)</label>
                  <select
                    value={newItem.platform}
                    onChange={(e) => setNewItem({ ...newItem, platform: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">Any platform</option>
                    <option value="twitter">X (Twitter)</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="meta">Meta</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Content Template</label>
                  <textarea
                    value={newItem.content}
                    onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                    rows={4}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Use [placeholders] for customizable parts..."
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Type</label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  >
                    {ASSET_TYPES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Value</label>
                  <input
                    value={newItem.value}
                    onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder={newItem.type === "color" ? "#hex" : "Value..."}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNew(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={tab === "templates" ? handleCreateTemplate : handleCreateAsset}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        )}

        {tab === "templates" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-card/50 border border-border/50 rounded-xl p-5 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{tmpl.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {tmpl.category}
                      </span>
                      {tmpl.platform && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {tmpl.platform}
                        </span>
                      )}
                      {tmpl.isDefault && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                          default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(tmpl.id, tmpl.content)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied === tmpl.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {tmpl.id > 0 && (
                      <button
                        onClick={() => handleDeleteTemplate(tmpl.id)}
                        className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans bg-muted/30 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {tmpl.content}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-card/50 border border-border/50 rounded-xl p-5 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground text-sm">{asset.name}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(asset.id, asset.value)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied === asset.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {asset.id > 0 && (
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {asset.type}
                </span>
                <div className="mt-3 flex items-center gap-2">
                  {asset.type === "color" && (
                    <div
                      className="w-8 h-8 rounded-lg border border-border"
                      style={{ backgroundColor: asset.value }}
                    />
                  )}
                  <span className="text-sm text-foreground font-mono">{asset.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SocialLayout>
  );
}
