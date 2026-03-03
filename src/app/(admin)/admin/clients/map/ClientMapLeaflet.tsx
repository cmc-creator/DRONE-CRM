"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon broken by webpack
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SHADOW = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

function makeIcon(color: string, selected: boolean) {
  const size = selected ? 36 : 28;
  const anchor = selected ? 18 : 14;
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 34" width="${size}" height="${size * 34 / 24}">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 22 12 22S24 21 24 12C24 5.373 18.627 0 12 0z" fill="${color}" stroke="${selected ? "#ffffff" : "rgba(0,0,0,0.3)"}" stroke-width="${selected ? 2 : 1}"/>
      <circle cx="12" cy="12" r="4.5" fill="white" opacity="0.9"/>
    </svg>`
  );
  return new L.Icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    shadowUrl: SHADOW,
    iconSize: [size, size * 34 / 24],
    iconAnchor: [anchor, size * 34 / 24],
    popupAnchor: [0, -(size * 34 / 24)],
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  });
}

const STATUS_COLORS: Record<string, string> = {
  LEAD:     "#6b7280",
  ACTIVE:   "#22c55e",
  INACTIVE: "#f59e0b",
  ARCHIVED: "#374151",
};

export interface ClientPin {
  id: string;
  companyName: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  status: string;
  type: string;
  jobCount: number;
  invoiceCount: number;
  lat: number;
  lng: number;
}

interface FitBoundsProps {
  pins: ClientPin[];
  routeOrder: ClientPin[];
}

function FitBounds({ pins, routeOrder }: FitBoundsProps) {
  const map = useMap();
  const prevLen = useRef(0);

  useEffect(() => {
    const targets = routeOrder.length > 0 ? routeOrder : pins;
    if (targets.length > 0 && targets.length !== prevLen.current) {
      prevLen.current = targets.length;
      const bounds = L.latLngBounds(targets.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
  }, [pins, routeOrder, map]);

  return null;
}

interface Props {
  pins: ClientPin[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  routeOrder: ClientPin[];
  routeIds: Set<string>;
  height?: string;
}

export default function ClientMapLeaflet({
  pins,
  selectedId,
  onSelect,
  routeOrder,
  routeIds,
  height = "100%",
}: Props) {
  const routeCoords: [number, number][] = routeOrder.map((p) => [p.lat, p.lng]);

  return (
    <MapContainer
      center={[39.5, -98.35]}
      zoom={4}
      style={{ height, width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds pins={pins} routeOrder={routeOrder} />

      {/* Route polyline */}
      {routeCoords.length >= 2 && (
        <Polyline
          positions={routeCoords}
          pathOptions={{ color: "#00d4ff", weight: 3, dashArray: "8 4", opacity: 0.85 }}
        />
      )}

      {/* Client pins */}
      {pins.map((p, idx) => {
        const color = STATUS_COLORS[p.status] ?? "#6b7280";
        const isSelected = p.id === selectedId;
        const routeIdx = routeOrder.findIndex((r) => r.id === p.id);
        const inRoute = routeIdx >= 0;

        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={makeIcon(inRoute ? "#00d4ff" : color, isSelected)}
            eventHandlers={{ click: () => onSelect(p.id) }}
            zIndexOffset={isSelected ? 1000 : inRoute ? 500 : 0}
          >
            <Popup>
              <div style={{ minWidth: 180, fontFamily: "system-ui, sans-serif" }}>
                {inRoute && (
                  <div style={{ background: "#00d4ff", color: "#04080f", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontWeight: 700, marginBottom: 6, display: "inline-block" }}>
                    STOP #{routeIdx + 1}
                  </div>
                )}
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{p.companyName}</div>
                {p.contactName && <div style={{ fontSize: 11, color: "#555" }}>{p.contactName}</div>}
                {p.email && <div style={{ fontSize: 11, color: "#0077cc" }}>{p.email}</div>}
                {p.phone && <div style={{ fontSize: 11 }}>{p.phone}</div>}
                <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                  {p.city}, {p.state} &nbsp;·&nbsp; {p.jobCount} job{p.jobCount !== 1 ? "s" : ""}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{
                    background: inRoute ? "#00d4ff22" : color + "22",
                    color: inRoute ? "#0099bb" : color,
                    padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                    border: `1px solid ${inRoute ? "#00d4ff44" : color + "44"}`,
                  }}>{p.status}</span>
                </div>
                <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                  <a href={`/admin/clients/${p.id}`} style={{ fontSize: 11, color: "#0077cc", textDecoration: "none" }}>View Profile →</a>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Route stop number labels */}
      {routeOrder.map((p, idx) => (
        <Marker
          key={`label-${p.id}`}
          position={[p.lat + 0.3, p.lng]}
          icon={new L.DivIcon({
            html: `<div style="background:#00d4ff;color:#04080f;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)">${idx + 1}</div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
            className: "",
          })}
          interactive={false}
        />
      ))}
    </MapContainer>
  );
}
