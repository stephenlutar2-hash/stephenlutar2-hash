import { useState, useRef, useCallback } from "react";
import SocialLayout from "@/components/social/SocialLayout";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Image,
  Type,
  Palette,
  GripVertical,
  Copy,
  Layers,
} from "lucide-react";

interface Slide {
  id: string;
  title: string;
  body: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  layout: "centered" | "left" | "split";
}

const DEFAULT_COLORS = {
  bgColor: "#0a0814",
  textColor: "#f8f8f8",
  accentColor: "#a855f7",
};

const BRAND_COLORS = [
  "#a855f7", "#d4a84b", "#3b82f6", "#10b981", "#ef4444",
  "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
];

const BG_COLORS = [
  "#0a0814", "#0f172a", "#18181b", "#1e1b4b", "#1a1a2e",
  "#0d1117", "#1c1917", "#0a192f", "#111827", "#0c0a1a",
];

function createSlide(): Slide {
  return {
    id: crypto.randomUUID(),
    title: "Slide Title",
    body: "Add your content here. Click to edit.",
    ...DEFAULT_COLORS,
    layout: "centered",
  };
}

function SlidePreview({ slide, scale = 1, onClick }: { slide: Slide; scale?: number; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer overflow-hidden"
      style={{
        width: 320 * scale,
        height: 400 * scale,
        backgroundColor: slide.bgColor,
        borderRadius: 12 * scale,
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 70% 20%, ${slide.accentColor}, transparent 60%)`,
        }}
      />
      <div
        className={`relative h-full flex flex-col p-${Math.round(6 * scale)} ${
          slide.layout === "centered"
            ? "items-center justify-center text-center"
            : slide.layout === "left"
            ? "items-start justify-center"
            : "items-start justify-end"
        }`}
        style={{ padding: 24 * scale }}
      >
        <div
          className="w-8 h-1 rounded-full mb-4"
          style={{ backgroundColor: slide.accentColor, width: 32 * scale, height: 4 * scale }}
        />
        <h3
          className="font-bold leading-tight mb-2"
          style={{
            color: slide.textColor,
            fontSize: 20 * scale,
            lineHeight: 1.2,
          }}
        >
          {slide.title}
        </h3>
        <p
          className="leading-relaxed opacity-80"
          style={{
            color: slide.textColor,
            fontSize: 12 * scale,
            lineHeight: 1.6,
          }}
        >
          {slide.body}
        </p>
        <div
          className="absolute bottom-4 opacity-30 font-bold tracking-widest uppercase"
          style={{
            color: slide.textColor,
            fontSize: 8 * scale,
            bottom: 16 * scale,
          }}
        >
          SZL HOLDINGS
        </div>
      </div>
    </div>
  );
}

export default function CarouselBuilder() {
  const [slides, setSlides] = useState<Slide[]>([createSlide()]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeSlide = slides[activeIdx] || slides[0];

  const updateSlide = (field: keyof Slide, value: string) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === activeIdx ? { ...s, [field]: value } : s))
    );
  };

  const addSlide = () => {
    const newSlide = {
      ...createSlide(),
      bgColor: activeSlide.bgColor,
      textColor: activeSlide.textColor,
      accentColor: activeSlide.accentColor,
      layout: activeSlide.layout,
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveIdx(slides.length);
  };

  const duplicateSlide = () => {
    const dup = { ...activeSlide, id: crypto.randomUUID() };
    setSlides((prev) => {
      const next = [...prev];
      next.splice(activeIdx + 1, 0, dup);
      return next;
    });
    setActiveIdx(activeIdx + 1);
  };

  const removeSlide = (idx: number) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== idx));
    if (activeIdx >= slides.length - 1) setActiveIdx(Math.max(0, slides.length - 2));
  };

  const exportPDF = useCallback(async () => {
    setExporting(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = 640;
      const h = 800;
      canvas.width = w;
      canvas.height = h * slides.length;

      slides.forEach((slide, i) => {
        const y = i * h;

        ctx.fillStyle = slide.bgColor;
        ctx.fillRect(0, y, w, h);

        const grad = ctx.createRadialGradient(w * 0.7, y + h * 0.2, 0, w * 0.7, y + h * 0.2, w * 0.6);
        grad.addColorStop(0, slide.accentColor + "1A");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, y, w, h);

        const px = slide.layout === "centered" ? w / 2 : 48;
        const textAlign = slide.layout === "centered" ? "center" : "left";

        ctx.fillStyle = slide.accentColor;
        const barW = 64;
        const barX = textAlign === "center" ? (w - barW) / 2 : px;
        ctx.fillRect(barX, y + h * 0.35, barW, 6);

        ctx.fillStyle = slide.textColor;
        ctx.font = "bold 36px system-ui, sans-serif";
        ctx.textAlign = textAlign as CanvasTextAlign;
        const titleX = textAlign === "center" ? w / 2 : px;
        ctx.fillText(slide.title, titleX, y + h * 0.35 + 48, w - 96);

        ctx.font = "20px system-ui, sans-serif";
        ctx.globalAlpha = 0.8;
        const words = slide.body.split(" ");
        let line = "";
        let lineY = y + h * 0.35 + 84;
        for (const word of words) {
          const test = line + word + " ";
          if (ctx.measureText(test).width > w - 96) {
            ctx.fillText(line, titleX, lineY, w - 96);
            line = word + " ";
            lineY += 28;
          } else {
            line = test;
          }
        }
        ctx.fillText(line, titleX, lineY, w - 96);
        ctx.globalAlpha = 1;

        ctx.fillStyle = slide.textColor;
        ctx.globalAlpha = 0.3;
        ctx.font = "bold 10px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SZL HOLDINGS", w / 2, y + h - 24);
        ctx.globalAlpha = 1;
      });

      const link = document.createElement("a");
      link.download = "szl-carousel.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setExporting(false);
    }
  }, [slides]);

  return (
    <SocialLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Carousel Builder
            </h1>
            <p className="text-muted-foreground mt-1">
              Create branded carousel content for LinkedIn, X, and more
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportPDF}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              {exporting ? "Exporting..." : "Export Images"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Slides ({slides.length})
                </h3>
                <button
                  onClick={addSlide}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {slides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    onClick={() => setActiveIdx(idx)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      idx === activeIdx
                        ? "bg-primary/15 border border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <div
                      className="w-12 h-14 rounded flex-shrink-0 flex items-center justify-center text-[8px] font-bold"
                      style={{ backgroundColor: slide.bgColor, color: slide.textColor }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {slide.title}
                      </p>
                    </div>
                    {slides.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSlide(idx);
                        }}
                        className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={addSlide}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground text-xs transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Slide
                </button>
                <button
                  onClick={duplicateSlide}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground text-xs transition-colors"
                >
                  <Copy className="w-3 h-3" /> Duplicate
                </button>
              </div>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Type className="w-4 h-4" />
                Content
              </h3>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Title</label>
                <input
                  value={activeSlide.title}
                  onChange={(e) => updateSlide("title", e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Body</label>
                <textarea
                  value={activeSlide.body}
                  onChange={(e) => updateSlide("body", e.target.value)}
                  rows={4}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Layout</label>
                <div className="flex gap-2">
                  {(["centered", "left", "split"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => updateSlide("layout", l)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        activeSlide.layout === l
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Colors
              </h3>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Background</label>
                <div className="flex flex-wrap gap-1.5">
                  {BG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateSlide("bgColor", c)}
                      className={`w-7 h-7 rounded-lg border-2 transition-all ${
                        activeSlide.bgColor === c ? "border-primary scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Accent</label>
                <div className="flex flex-wrap gap-1.5">
                  {BRAND_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateSlide("accentColor", c)}
                      className={`w-7 h-7 rounded-lg border-2 transition-all ${
                        activeSlide.accentColor === c ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-card/30 border border-border/50 rounded-xl p-8 backdrop-blur-sm flex flex-col items-center">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                  disabled={activeIdx === 0}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-muted-foreground">
                  Slide {activeIdx + 1} of {slides.length}
                </span>
                <button
                  onClick={() => setActiveIdx(Math.min(slides.length - 1, activeIdx + 1))}
                  disabled={activeIdx === slides.length - 1}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <SlidePreview slide={activeSlide} scale={1.2} />

              <div className="mt-6 flex gap-3 overflow-x-auto pb-2 w-full justify-center">
                {slides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    onClick={() => setActiveIdx(idx)}
                    className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeIdx ? "border-primary" : "border-transparent opacity-60 hover:opacity-80"
                    }`}
                  >
                    <SlidePreview slide={slide} scale={0.2} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </SocialLayout>
  );
}
