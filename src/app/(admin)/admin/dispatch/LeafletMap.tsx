"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths broken by webpack
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const jobIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface JobData {
  id: string;
  title: string;
  location: string;
  status: string;
  scheduledDate: string | null;
  client: string;
  pilotName: string | null;
}

// Geocode US city/state strings to approximate coordinates using a simple lookup.
// In production replace with a real geocoding API call.
function approximateCoords(location: string): [number, number] | null {
  // Very coarse fallback — if location contains lat,lng pattern use that
  const latlng = location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
  if (latlng) return [parseFloat(latlng[1]), parseFloat(latlng[2])];
  return null; // Non-geocodeable locations won't render a pin
}

export default function LeafletMap({ jobs }: { jobs: JobData[] }) {
  const mappableJobs = jobs
    .map((j) => ({ ...j, coords: approximateCoords(j.location) }))
    .filter((j) => j.coords !== null) as (JobData & { coords: [number, number] })[];

  return (
    <MapContainer
      center={[39.5, -98.35]}
      zoom={4}
      style={{ height: "480px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mappableJobs.map((job) => (
        <Marker key={job.id} position={job.coords} icon={jobIcon}>
          <Popup>
            <div style={{ minWidth: 160 }}>
              <strong>{job.title}</strong>
              <br />
              <span style={{ fontSize: 11, color: "#666" }}>{job.client}</span>
              <br />
              <span style={{ fontSize: 11 }}>{job.status}</span>
              {job.pilotName && (
                <>
                  <br />
                  <span style={{ fontSize: 11, color: "#0077cc" }}>✈ {job.pilotName}</span>
                </>
              )}
              {job.scheduledDate && (
                <>
                  <br />
                  <span style={{ fontSize: 11 }}>
                    {new Date(job.scheduledDate).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
