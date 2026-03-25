import { useQuery } from "@tanstack/react-query";
import { Map, Navigation, MapPin, Anchor, Ship, Compass, Waves } from "lucide-react";
import { cn, getApiBase, formatCoord, statusColor } from "@/lib/utils";

export default function MapView() {
  const { data: fleetData, isLoading } = useQuery({
    queryKey: ["fleet"],
    queryFn: () => fetch(`${getApiBase()}/fleet`).then(r => r.json()),
  });

  const { data: routesData } = useQuery({
    queryKey: ["routes"],
    queryFn: () => fetch(`${getApiBase()}/routes`).then(r => r.json()),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const vessels = fleetData?.vessels || [];
  const routes = routesData?.routes || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Fleet Map</h1>
        <p className="text-sm text-muted-foreground mt-1">Global vessel positions and route visualization</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="relative aspect-[16/10] bg-[#0a1628] overflow-hidden">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)
                `,
                backgroundSize: "60px 60px",
              }} />

              <svg viewBox="-180 -90 360 180" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <radialGradient id="vesselGlow">
                    <stop offset="0%" stopColor="rgb(6,182,212)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="rgb(6,182,212)" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {[
                  "M-130,-50 L-120,-35 L-105,-35 L-100,-30 L-80,-30 L-60,-50 L-80,-55 L-100,-45 L-115,-55 Z",
                  "M-90,-15 L-85,-5 L-80,0 L-75,5 L-80,10 L-85,15 L-80,30 L-70,55 L-75,56 L-82,50 L-78,35 L-82,25 L-85,20 L-90,10 Z",
                  "M-40,58 L-38,55 L-35,58 L-30,55 Z",
                  "M-15,-40 L-5,-38 L5,-45 L15,-40 L30,-35 L45,-40 L40,-48 L30,-50 L20,-45 L5,-55 L-10,-50 Z",
                  "M-20,-10 L-15,0 L-10,-5 L0,5 L10,0 L20,-5 L30,-10 L40,-5 L50,0 L55,10 L50,15 L45,5 L35,10 L25,10 L20,15 L10,20 L5,10 L-5,15 L-15,10 L-20,5 Z",
                  "M-25,25 L-10,35 L5,40 L20,35 L30,30 L35,35 L40,30 L50,25 L55,30 L50,38 L40,40 L35,45 L30,40 L25,42 L15,45 L10,40 L0,42 L-10,38 L-15,40 L-20,35 Z",
                  "M55,-5 L65,-15 L75,-10 L90,-15 L100,-10 L110,-15 L120,-5 L130,-10 L140,-5 L150,-15 L155,-10 L160,-25 L150,-30 L140,-35 L130,-30 L120,-35 L100,-30 L90,-35 L80,-25 L70,-20 L60,-15 Z",
                  "M90,5 L100,0 L110,5 L120,0 L130,5 L140,10 L150,5 L155,10 L150,20 L145,15 L140,20 L130,25 L120,30 L115,25 L110,30 L105,20 L100,25 L95,15 L90,20 L85,10 Z",
                  "M110,-60 L140,-55 L160,-60 L170,-55 L160,-50 L150,-55 L130,-50 L120,-55 Z",
                ].map((d, i) => (
                  <path key={i} d={d} fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.15)" strokeWidth="0.3" />
                ))}

                {routes.filter((r: any) => r.status === "in-transit").map((route: any) => {
                  if (!route.waypoints || route.waypoints.length < 2) return null;
                  const pathD = route.waypoints.map((wp: any, idx: number) =>
                    `${idx === 0 ? "M" : "L"}${wp.lng},${-wp.lat}`
                  ).join(" ");
                  return (
                    <path key={route.id} d={pathD} fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="0.5" strokeDasharray="2,2" />
                  );
                })}

                {vessels.map((v: any) => (
                  <g key={v.id}>
                    <circle cx={v.lng} cy={-v.lat} r="3" fill="url(#vesselGlow)" />
                    <circle
                      cx={v.lng}
                      cy={-v.lat}
                      r="1.2"
                      fill={v.status === "underway" ? "#06b6d4" : v.status === "at-port" ? "#3b82f6" : "#eab308"}
                      stroke="white"
                      strokeWidth="0.3"
                    />
                    <text
                      x={v.lng + 2.5}
                      y={-v.lat + 0.5}
                      fill="rgba(255,255,255,0.6)"
                      fontSize="3"
                      fontFamily="monospace"
                    >
                      {v.name.split(" ").pop()}
                    </text>
                  </g>
                ))}
              </svg>

              <div className="absolute top-4 left-4 glass-panel rounded-lg px-3 py-2 text-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-muted-foreground font-medium">Map Legend</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500" /><span className="text-muted-foreground">Underway</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-muted-foreground">At Port</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" /><span className="text-muted-foreground">Anchored</span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-px bg-emerald-400 border-dashed" /><span className="text-muted-foreground">Route</span></div>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 glass-panel rounded-lg px-3 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Waves className="w-3 h-3 text-cyan-400" />
                  <span>Map-ready — integrate Mapbox/Leaflet for production</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
              <Ship className="w-4 h-4 text-cyan-400" /> Vessel Positions
            </h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {vessels.map((v: any) => (
                <div key={v.id} className="p-3 rounded-lg bg-white/3 hover:bg-white/5 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium truncate mr-2">{v.name}</span>
                    <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium capitalize", statusColor(v.status))}>
                      {v.status.replace("-", " ")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="font-mono">{formatCoord(v.lat, "lat")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="font-mono">{formatCoord(v.lng, "lng")}</span>
                    </div>
                    {v.speed > 0 && (
                      <div className="flex items-center gap-1">
                        <Navigation className="w-2.5 h-2.5" />
                        <span>{v.speed} kn / {v.heading}°</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Anchor className="w-2.5 h-2.5" />
                      <span className="truncate">{v.destination}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
