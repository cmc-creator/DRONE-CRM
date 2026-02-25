"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Briefcase } from "lucide-react";

// Leaflet must be loaded client-side only — no SSR
const Map = dynamic(() => import("./LeafletMap"), { ssr: false, loading: () => (
  <div className="h-[480px] rounded-xl bg-[#080f1e] border border-white/5 flex items-center justify-center text-muted-foreground text-sm">
    Loading map…
  </div>
) });

interface PilotData {
  id: string;
  name: string;
  email: string;
  markets: string[];
  rating: number | null;
  isActive: boolean;
}

interface JobData {
  id: string;
  title: string;
  location: string;
  status: string;
  scheduledDate: string | null;
  client: string;
  pilotName: string | null;
}

interface Props {
  pilots: PilotData[];
  jobs: JobData[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#6b7280",
  SCHEDULED: "#00d4ff",
  IN_PROGRESS: "#fbbf24",
};

export function DispatchMapClient({ pilots, jobs }: Props) {
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);

  const unassigned = jobs.filter((j) => !j.pilotName);
  const active = jobs.filter((j) => j.status === "IN_PROGRESS");

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#080f1e] border-white/5">
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-[#00d4ff]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pilots.length}</p>
              <p className="text-xs text-muted-foreground">Active Pilots</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#080f1e] border-white/5">
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{active.length}</p>
              <p className="text-xs text-muted-foreground">Flights Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#080f1e] border-white/5">
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unassigned.length}</p>
              <p className="text-xs text-muted-foreground">Unassigned Jobs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2">
          <Map jobs={jobs} />
        </div>

        {/* Job list */}
        <Card className="bg-[#080f1e] border-white/5 max-h-[540px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Active & Pending Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1 space-y-2 pr-3">
            {jobs.length === 0 && (
              <p className="text-sm text-muted-foreground">No active jobs.</p>
            )}
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job.id === selectedJob?.id ? null : job)}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                  selectedJob?.id === job.id
                    ? "border-primary/40 bg-primary/5"
                    : "border-white/5 hover:bg-white/3"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium leading-tight">{job.title}</p>
                  <Badge
                    className="text-[10px] shrink-0"
                    style={{
                      background: (STATUS_COLORS[job.status] ?? "#6b7280") + "22",
                      color: STATUS_COLORS[job.status] ?? "#6b7280",
                      border: `1px solid ${(STATUS_COLORS[job.status] ?? "#6b7280")}40`,
                    }}
                  >
                    {job.status}
                  </Badge>
                </div>
                {job.location && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{job.location}
                  </p>
                )}
                {job.pilotName ? (
                  <p className="text-xs text-[#00d4ff] mt-1">✈ {job.pilotName}</p>
                ) : (
                  <p className="text-xs text-amber-400/70 mt-1">⚠ Unassigned</p>
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
