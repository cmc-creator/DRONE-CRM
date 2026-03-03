"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MapPin, Search, Route, X, ChevronRight, Building2,
  Users, Briefcase, TrendingUp, Navigation, Download,
  Phone, Mail, ExternalLink, RotateCcw, ListOrdered,
  CheckSquare, Square, Info,
} from "lucide-react";
import type { ClientPin } from "./ClientMapLeaflet";

// ── Leaflet: SSR-safe dynamic import ──────────────────────────────────────────
const Map = dynamic(() => import("./ClientMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full rounded-xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground text-sm">
      Loading map…
    </div>
  ),
});

// ── US State Centroids (lat / lng) ────────────────────────────────────────────
const STATE_COORDS: Record<string, [number, number]> = {
  AL:[32.806,  -86.791],  AK:[61.370, -152.404],  AZ:[33.729, -111.431],
  AR:[34.969,  -92.373],  CA:[36.116, -119.681],  CO:[39.060, -105.311],
  CT:[41.597,  -72.755],  DE:[39.318,  -75.508],  FL:[27.766,  -81.686],
  GA:[32.678,  -83.223],  HI:[21.094, -157.498],  ID:[44.240, -114.478],
  IL:[40.349,  -88.986],  IN:[39.849,  -86.258],  IA:[42.011,  -93.210],
  KS:[38.526,  -96.726],  KY:[37.668,  -84.670],  LA:[31.169,  -91.867],
  ME:[44.693,  -69.381],  MD:[39.063,  -76.802],  MA:[42.230,  -71.530],
  MI:[43.326,  -84.536],  MN:[45.694,  -93.900],  MS:[32.741,  -89.678],
  MO:[38.456,  -92.288],  MT:[46.921, -110.454],  NE:[41.125,  -98.268],
  NV:[38.313, -117.055],  NH:[43.452,  -71.563],  NJ:[40.298,  -74.521],
  NM:[34.840, -106.248],  NY:[42.165,  -74.948],  NC:[35.630,  -79.806],
  ND:[47.528, -099.784],  OH:[40.388,  -82.764],  OK:[35.565,  -96.928],
  OR:[44.572, -122.070],  PA:[40.590,  -77.209],  RI:[41.680,  -71.511],
  SC:[33.856,  -80.945],  SD:[44.299,  -99.438],  TN:[35.747,  -86.692],
  TX:[31.054,  -97.563],  UT:[40.150, -111.862],  VT:[44.045,  -72.710],
  VA:[37.769,  -78.169],  WA:[47.400, -121.490],  WV:[38.491,  -80.954],
  WI:[44.268,  -89.616],  WY:[42.755, -107.302],  DC:[38.897,  -77.036],
};

// Deterministic jitter so clients in same city don't stack
function jitter(id: string, idx: 0 | 1): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  const raw = ((h >>> (idx * 8)) & 0xff) / 255; // 0..1
  return (raw - 0.5) * 1.4; // roughly ±0.7°
}

export function geocodeClient(c: {
  id: string; city: string | null; state: string | null; address: string | null;
}): [number, number] | null {
  const state = c.state?.trim().toUpperCase().slice(0, 2);
  const base = state ? STATE_COORDS[state] : null;
  if (!base) return null;
  return [base[0] + jitter(c.id, 0), base[1] + jitter(c.id, 1)];
}

// ── RouteIQ: Nearest-Neighbour TSP ───────────────────────────────────────────
function haversine(a: ClientPin, b: ClientPin): number {
  const R = 3958.8; // miles
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestNeighbour(nodes: ClientPin[]): ClientPin[] {
  if (nodes.length <= 1) return nodes;
  const unvisited = [...nodes];
  const route: ClientPin[] = [unvisited.shift()!];
  while (unvisited.length > 0) {
    const last = route[route.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    unvisited.forEach((n, i) => {
      const d = haversine(last, n);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    route.push(unvisited.splice(bestIdx, 1)[0]);
  }
  return route;
}

function totalDistance(route: ClientPin[]): number {
  let d = 0;
  for (let i = 1; i < route.length; i++) d += haversine(route[i - 1], route[i]);
  return d;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  LEAD: "Lead", ACTIVE: "Active", INACTIVE: "Inactive", ARCHIVED: "Archived",
};
const STATUS_VARIANTS: Record<string, "outline" | "success" | "secondary"> = {
  LEAD: "outline", ACTIVE: "success", INACTIVE: "secondary", ARCHIVED: "secondary",
};
const TYPE_LABELS: Record<string, string> = {
  AGENCY: "Agency", COMMERCIAL: "Commercial", REAL_ESTATE: "Real Estate", OTHER: "Other",
};
const STATUS_DOT: Record<string, string> = {
  LEAD: "bg-slate-400", ACTIVE: "bg-green-500", INACTIVE: "bg-amber-400", ARCHIVED: "bg-gray-600",
};

// ── Component ─────────────────────────────────────────────────────────────────
export interface ClientMapData {
  id: string;
  companyName: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  status: string;
  type: string;
  jobCount: number;
  invoiceCount: number;
}

export function ClientMapView({ clients }: { clients: ClientMapData[] }) {
  // ── Geocode client-side ──────────────────────────────────────────────────
  const pins: ClientPin[] = useMemo(() => {
    return clients
      .map((c) => {
        const coords = geocodeClient(c);
        if (!coords) return null;
        return { ...c, lat: coords[0], lng: coords[1] };
      })
      .filter(Boolean) as ClientPin[];
  }, [clients]);

  // ── Filters ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return pins.filter((p) => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (typeFilter !== "ALL" && p.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.companyName.toLowerCase().includes(q) ||
          (p.contactName ?? "").toLowerCase().includes(q) ||
          (p.city ?? "").toLowerCase().includes(q) ||
          (p.state ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [pins, statusFilter, typeFilter, search]);

  // ── Selection & RouteIQ ──────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [routeIds, setRouteIds] = useState<Set<string>>(new Set());
  const [routeOrder, setRouteOrder] = useState<ClientPin[]>([]);
  const [routeBuilt, setRouteBuilt] = useState(false);
  const [panel, setPanel] = useState<"clients" | "route" | "stats">("clients");

  const selectedPin = pins.find((p) => p.id === selectedId) ?? null;

  const toggleRoute = useCallback((id: string) => {
    setRouteIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setRouteBuilt(false);
    setRouteOrder([]);
  }, []);

  const buildRoute = useCallback(() => {
    const nodes = filtered.filter((p) => routeIds.has(p.id));
    const ordered = nearestNeighbour(nodes);
    setRouteOrder(ordered);
    setRouteBuilt(true);
    setPanel("route");
  }, [filtered, routeIds]);

  const clearRoute = useCallback(() => {
    setRouteIds(new Set());
    setRouteOrder([]);
    setRouteBuilt(false);
  }, []);

  const selectAll = useCallback(() => {
    setRouteIds(new Set(filtered.map((p) => p.id)));
    setRouteBuilt(false);
    setRouteOrder([]);
  }, [filtered]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const byStatus = Object.fromEntries(
      ["LEAD", "ACTIVE", "INACTIVE", "ARCHIVED"].map((s) => [
        s, pins.filter((p) => p.status === s).length,
      ])
    );
    const byState = pins.reduce<Record<string, number>>((acc, p) => {
      const k = p.state ?? "?";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});
    const topStates = Object.entries(byState)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const totalJobs = pins.reduce((s, p) => s + p.jobCount, 0);
    return { byStatus, topStates, totalJobs, total: pins.length };
  }, [pins]);

  // ── Locate me ────────────────────────────────────────────────────────────
  const [locating, setLocating] = useState(false);
  const [nearbyState, setNearbyState] = useState<string | null>(null);

  const locateMe = useCallback(() => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Find the state whose centroid is closest to user
        let bestState = "";
        let bestDist = Infinity;
        Object.entries(STATE_COORDS).forEach(([st, [lat, lng]]) => {
          const d = Math.hypot(lat - pos.coords.latitude, lng - pos.coords.longitude);
          if (d < bestDist) { bestDist = d; bestState = st; }
        });
        setNearbyState(bestState);
        setStatusFilter("ALL");
        setTypeFilter("ALL");
        setSearch("");
        setLocating(false);
      },
      () => setLocating(false)
    );
  }, []);

  // Filter to nearby if we located
  const displayPins = useMemo(() => {
    if (!nearbyState) return filtered;
    return filtered.filter((p) => p.state?.toUpperCase() === nearbyState);
  }, [filtered, nearbyState]);

  // ── Route CSV export ─────────────────────────────────────────────────────
  const exportRoute = useCallback(() => {
    if (routeOrder.length === 0) return;
    const header = "Stop,Company,Contact,Email,Phone,City,State,Status\n";
    const rows = routeOrder.map((p, i) =>
      `${i + 1},"${p.companyName}","${p.contactName ?? ""}","${p.email ?? ""}","${p.phone ?? ""}","${p.city ?? ""}","${p.state ?? ""}","${p.status}"`
    );
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `route-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [routeOrder]);

  const routeDist = useMemo(() => totalDistance(routeOrder), [routeOrder]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)]">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Search clients…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setNearbyState(null); }}
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1">
          {["ALL", "LEAD", "ACTIVE", "INACTIVE"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === s
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "ALL" ? "All" : STATUS_LABELS[s]}
              {s !== "ALL" && (
                <span className="ml-1 opacity-60 text-[10px]">
                  {stats.byStatus[s] ?? 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 text-sm border border-border rounded-md px-2 bg-background text-foreground"
        >
          <option value="ALL">All Types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {/* Locate me */}
        <Button variant="outline" size="sm" onClick={locateMe} disabled={locating}>
          <Navigation className="w-3.5 h-3.5 mr-1.5" />
          {nearbyState ? `Nearby (${nearbyState})` : "Near Me"}
          {nearbyState && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); setNearbyState(null); }}
              className="ml-1.5 opacity-60 hover:opacity-100"
            >
              <X className="w-3 h-3 inline" />
            </span>
          )}
        </Button>

        {/* RouteIQ actions */}
        {routeIds.size > 0 && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-muted-foreground">{routeIds.size} selected</span>
            <Button size="sm" onClick={buildRoute}>
              <Route className="w-3.5 h-3.5 mr-1.5" />
              Plan Route
            </Button>
            <Button variant="ghost" size="sm" onClick={clearRoute}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* ── Main layout ─────────────────────────────────────────────────── */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-72 flex flex-col gap-3 shrink-0">
          {/* Panel tabs */}
          <div className="flex bg-muted/40 rounded-lg p-1 gap-1">
            {(["clients", "route", "stats"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPanel(p)}
                className={`flex-1 text-xs py-1.5 rounded-md font-medium capitalize transition-colors ${
                  panel === p ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "route" ? (
                  <span className="flex items-center justify-center gap-1">
                    <Route className="w-3 h-3" /> RouteIQ
                    {routeIds.size > 0 && (
                      <span className="bg-primary text-primary-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {routeIds.size}
                      </span>
                    )}
                  </span>
                ) : p}
              </button>
            ))}
          </div>

          {/* ── Clients list panel ───────────────────────────────────────── */}
          {panel === "clients" && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-xs text-muted-foreground">
                  {displayPins.length} of {pins.length} clients
                </span>
                <button
                  onClick={selectAll}
                  className="text-xs text-primary hover:underline"
                >
                  Select all for route
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {displayPins.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No clients match</p>
                )}
                {displayPins.map((p) => {
                  const isSelected = p.id === selectedId;
                  const inRoute = routeIds.has(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all text-sm ${
                        isSelected
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-border/80 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[p.status] ?? "bg-gray-400"}`} />
                          <span className="font-medium text-xs truncate">{p.companyName}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleRoute(p.id); }}
                          className={`shrink-0 transition-colors ${inRoute ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                          title={inRoute ? "Remove from route" : "Add to route"}
                        >
                          {inRoute ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 pl-3.5">
                        {p.city && p.state ? `${p.city}, ${p.state}` : p.state ?? "—"}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 pl-3.5">
                        <span className="text-[10px] text-muted-foreground">{p.jobCount} jobs</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <Badge variant={STATUS_VARIANTS[p.status] ?? "outline"} className="text-[9px] px-1.5 py-0 h-4">
                          {STATUS_LABELS[p.status]}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── RouteIQ panel ────────────────────────────────────────────── */}
          {panel === "route" && (
            <div className="flex flex-col flex-1 min-h-0">
              {routeOrder.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-3">
                  <Route className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">RouteIQ</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Check the box next to any clients, then click <strong>Plan Route</strong> to optimise your visit order.
                    </p>
                  </div>
                  {routeIds.size > 0 && (
                    <Button size="sm" onClick={buildRoute} className="mt-1">
                      <Route className="w-3.5 h-3.5 mr-1.5" />
                      Plan {routeIds.size} stops
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-primary">Optimised Route</p>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={exportRoute} title="Export CSV">
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={clearRoute} title="Clear route">
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span><strong className="text-foreground">{routeOrder.length}</strong> stops</span>
                      <span><strong className="text-foreground">{Math.round(routeDist).toLocaleString()}</strong> mi</span>
                      <span>~<strong className="text-foreground">{Math.round(routeDist / 55)}h</strong> drive</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                    {routeOrder.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedId(p.id)}
                        className="flex items-center gap-2.5 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 p-2 cursor-pointer transition-all"
                      >
                        <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{p.companyName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {p.city}, {p.state}
                            {idx > 0 && (
                              <span className="ml-1.5 text-primary/70">
                                {Math.round(haversine(routeOrder[idx - 1], p))} mi
                              </span>
                            )}
                          </p>
                        </div>
                        <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Stats panel ──────────────────────────────────────────────── */}
          {panel === "stats" && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {/* Status breakdown */}
              <Card className="border-border">
                <CardHeader className="py-2.5 px-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">By Status</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2">
                  {["ACTIVE", "LEAD", "INACTIVE", "ARCHIVED"].map((s) => {
                    const count = stats.byStatus[s] ?? 0;
                    const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={s}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-muted-foreground">{STATUS_LABELS[s]}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: s === "ACTIVE" ? "#22c55e" : s === "LEAD" ? "#6b7280" : s === "INACTIVE" ? "#f59e0b" : "#374151",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Top states */}
              <Card className="border-border">
                <CardHeader className="py-2.5 px-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top Territories</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-1.5">
                  {stats.topStates.map(([st, count]) => (
                    <div key={st} className="flex items-center justify-between">
                      <button
                        className="text-xs text-primary hover:underline font-medium"
                        onClick={() => { setSearch(st); setNearbyState(null); }}
                      >
                        {st}
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/60 rounded-full"
                            style={{ width: `${(count / (stats.topStates[0]?.[1] ?? 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-4 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Totals */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Users, label: "Total Clients", value: stats.total, color: "text-primary" },
                  { icon: Briefcase, label: "Total Jobs", value: stats.totalJobs, color: "text-amber-500" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <Card key={label} className="border-border">
                    <CardContent className="p-3">
                      <Icon className={`w-4 h-4 ${color} mb-1`} />
                      <p className="text-lg font-bold">{value}</p>
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Map ─────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden border border-border">
            <Map
              pins={displayPins}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
              routeOrder={routeOrder}
              routeIds={routeIds}
              height="100%"
            />

            {/* Map legend */}
            <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-[10px] space-y-1 z-[1000]">
              {[
                { color: "#22c55e", label: "Active" },
                { color: "#6b7280", label: "Lead" },
                { color: "#f59e0b", label: "Inactive" },
                { color: "#00d4ff", label: "In Route" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Client detail card */}
          {selectedPin && (
            <Card className="border-border shrink-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{selectedPin.companyName}</p>
                        <Badge variant={STATUS_VARIANTS[selectedPin.status] ?? "outline"} className="text-[10px]">
                          {STATUS_LABELS[selectedPin.status]}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {TYPE_LABELS[selectedPin.type]}
                        </Badge>
                      </div>
                      {selectedPin.contactName && (
                        <p className="text-xs text-muted-foreground mt-0.5">{selectedPin.contactName}</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-xs">
                  {selectedPin.email && (
                    <a href={`mailto:${selectedPin.email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="w-3.5 h-3.5" /> {selectedPin.email}
                    </a>
                  )}
                  {selectedPin.phone && (
                    <a href={`tel:${selectedPin.phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="w-3.5 h-3.5" /> {selectedPin.phone}
                    </a>
                  )}
                  {selectedPin.city && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" /> {selectedPin.city}, {selectedPin.state}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Briefcase className="w-3.5 h-3.5" /> {selectedPin.jobCount} jobs
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <a href={`/admin/clients/${selectedPin.id}`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <ExternalLink className="w-3 h-3 mr-1.5" /> View Profile
                    </Button>
                  </a>
                  <a href={`/admin/jobs/new?clientId=${selectedPin.id}`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <Briefcase className="w-3 h-3 mr-1.5" /> New Job
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    variant={routeIds.has(selectedPin.id) ? "default" : "outline"}
                    className="h-7 text-xs"
                    onClick={() => toggleRoute(selectedPin.id)}
                  >
                    <Route className="w-3 h-3 mr-1.5" />
                    {routeIds.has(selectedPin.id) ? "Remove from Route" : "Add to Route"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
