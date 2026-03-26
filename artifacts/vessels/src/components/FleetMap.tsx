import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Ship, Anchor, AlertTriangle, Navigation } from "lucide-react";

let L: any = null;

function loadLeaflet(): Promise<any> {
  if (L) return Promise.resolve(L);
  return new Promise((resolve) => {
    if (document.querySelector('link[href*="leaflet"]')) {
      import("leaflet").then(mod => { L = mod.default || mod; resolve(L); });
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    import("leaflet").then(mod => {
      L = mod.default || mod;
      resolve(L);
    });
  });
}

function vesselIcon(leaflet: any, status: string) {
  const color = status === "laden" ? "#10b981" : status === "ballast" ? "#3b82f6" : status === "at-port" ? "#f59e0b" : status === "drydock" ? "#ef4444" : "#6b7280";
  return leaflet.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px ${color}80;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/><path d="M12 2v3"/></svg></div>`,
  });
}

function portIcon(leaflet: any) {
  return leaflet.divIcon({
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: `<div style="width:20px;height:20px;border-radius:4px;background:#06b6d4;border:2px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px rgba(6,182,212,0.5);"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/></svg></div>`,
  });
}

export default function FleetMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedVessel, setSelectedVessel] = useState<any>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["vessels-fleet"],
    queryFn: async () => { const r = await fetch("/api/vessels/fleet"); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); },
  });

  useEffect(() => {
    if (!data || !mapRef.current) return;
    let cancelled = false;

    loadLeaflet().then(leaflet => {
      if (cancelled || !mapRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = leaflet.map(mapRef.current, {
        center: [20, 60],
        zoom: 3,
        zoomControl: true,
        attributionControl: false,
      });

      leaflet.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      if (data.ports) {
        for (const port of data.ports) {
          const marker = leaflet.marker([port.lat, port.lng], { icon: portIcon(leaflet) }).addTo(map);
          marker.bindPopup(`
            <div style="font-family:system-ui;color:#fff;background:#111827;padding:8px 12px;border-radius:8px;border:1px solid rgba(6,182,212,0.3);min-width:140px;">
              <div style="font-weight:600;font-size:12px;color:#06b6d4;margin-bottom:4px;">${port.name}</div>
              <div style="font-size:10px;color:#9ca3af;">${port.country} · ${port.code}</div>
            </div>
          `, { className: "dark-popup", closeButton: false });
        }
      }

      if (data.vessels) {
        for (const vessel of data.vessels) {
          const marker = leaflet.marker([vessel.lat, vessel.lng], { icon: vesselIcon(leaflet, vessel.status) }).addTo(map);
          marker.on("click", () => setSelectedVessel(vessel));
          marker.bindTooltip(vessel.name, {
            permanent: false,
            direction: "top",
            offset: [0, -16],
            className: "vessel-tooltip",
          });
        }
      }

      if (data.routes) {
        for (const route of data.routes) {
          try {
            const waypoints = typeof route.waypoints === "string" ? JSON.parse(route.waypoints) : route.waypoints;
            if (waypoints && waypoints.length >= 2) {
              leaflet.polyline(waypoints, {
                color: "#06b6d4",
                weight: 1.5,
                opacity: 0.4,
                dashArray: "5 5",
              }).addTo(map);
            }
          } catch {}
        }
      }

      if (data.voyages) {
        for (const voyage of data.voyages) {
          if (voyage.originLat && voyage.destLat) {
            const color = voyage.riskScore >= 30 ? "#ef4444" : voyage.riskScore >= 15 ? "#f59e0b" : "#10b981";
            leaflet.polyline(
              [[voyage.originLat, voyage.originLng], [voyage.destLat, voyage.destLng]],
              { color, weight: 2, opacity: 0.6, dashArray: "8 4" }
            ).addTo(map);
          }
        }
      }

      mapInstanceRef.current = map;

      const style = document.createElement("style");
      style.textContent = `
        .dark-popup .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
        .dark-popup .leaflet-popup-content { margin: 0 !important; }
        .dark-popup .leaflet-popup-tip { background: #111827 !important; }
        .vessel-tooltip { background: #111827 !important; color: #fff !important; border: 1px solid rgba(6,182,212,0.3) !important; font-size: 11px !important; padding: 2px 8px !important; border-radius: 6px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important; }
        .vessel-tooltip::before { border-top-color: rgba(6,182,212,0.3) !important; }
      `;
      document.head.appendChild(style);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">Failed to load fleet map data</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="h-[500px] rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-gray-400">Laden</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-400">Ballast</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-gray-400">At Port</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-400">Drydock</span>
        </div>
        <div className="flex items-center gap-1.5 ml-4">
          <div className="w-4 h-0.5 bg-emerald-500" />
          <span className="text-gray-400">Low Risk Route</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-amber-500" />
          <span className="text-gray-400">Med Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-red-500" />
          <span className="text-gray-400">High Risk</span>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-white/10">
        <div ref={mapRef} className="h-[500px] w-full" />

        {selectedVessel && (
          <div className="absolute top-4 right-4 w-72 bg-[#0a0e17]/95 border border-cyan-500/20 rounded-xl p-4 backdrop-blur-md z-[1000]">
            <button
              onClick={() => setSelectedVessel(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-white text-xs"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedVessel.status === "laden" ? "bg-emerald-500/10" :
                selectedVessel.status === "ballast" ? "bg-blue-500/10" :
                selectedVessel.status === "at-port" ? "bg-amber-500/10" : "bg-red-500/10"
              }`}>
                <Ship className={`w-5 h-5 ${
                  selectedVessel.status === "laden" ? "text-emerald-400" :
                  selectedVessel.status === "ballast" ? "text-blue-400" :
                  selectedVessel.status === "at-port" ? "text-amber-400" : "text-red-400"
                }`} />
              </div>
              <div>
                <h4 className="font-display font-semibold text-white text-sm">{selectedVessel.name}</h4>
                <p className="text-[10px] text-gray-500">{selectedVessel.imo} · {selectedVessel.flag}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white/[0.03] rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Status</p>
                <p className="text-white font-medium capitalize">{selectedVessel.status}</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Speed</p>
                <p className="text-white font-mono">{selectedVessel.speed} kn</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Route</p>
                <p className="text-white truncate">{selectedVessel.route || "—"}</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">TCE</p>
                <p className="text-emerald-400 font-mono">{selectedVessel.tce > 0 ? `$${(selectedVessel.tce / 1000).toFixed(1)}k` : "—"}</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">CII</p>
                <p className={`font-bold ${
                  selectedVessel.cii === "A" ? "text-emerald-400" : selectedVessel.cii === "B" ? "text-cyan-400" :
                  selectedVessel.cii === "C" ? "text-amber-400" : "text-red-400"
                }`}>{selectedVessel.cii}</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Charterer</p>
                <p className="text-white truncate">{selectedVessel.charterer || "—"}</p>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-500">
              <Navigation className="w-3 h-3" />
              <span>{selectedVessel.lat.toFixed(2)}°, {selectedVessel.lng.toFixed(2)}°</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
