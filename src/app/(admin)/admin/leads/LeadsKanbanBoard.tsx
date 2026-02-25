"use client";

import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const PIPELINE_STAGES = [
  { key: "NEW",           label: "New",           color: "#94a3b8", glow: "rgba(148,163,184,0.15)" },
  { key: "CONTACTED",     label: "Contacted",     color: "#60a5fa", glow: "rgba(96,165,250,0.15)"  },
  { key: "QUALIFIED",     label: "Qualified",     color: "#a78bfa", glow: "rgba(167,139,250,0.15)" },
  { key: "PROPOSAL_SENT", label: "Proposal Sent", color: "#fbbf24", glow: "rgba(251,191,36,0.15)"  },
  { key: "NEGOTIATING",   label: "Negotiating",   color: "#00d4ff", glow: "rgba(0,212,255,0.15)"   },
  { key: "WON",           label: "Won",           color: "#34d399", glow: "rgba(52,211,153,0.15)"  },
  { key: "LOST",          label: "Lost",          color: "#f87171", glow: "rgba(248,113,113,0.15)" },
] as const;

const SOURCE_LABELS: Record<string, string> = {
  REFERRAL: "Referral", WEBSITE: "Website", SOCIAL_MEDIA: "Social",
  COLD_OUTREACH: "Cold Outreach", REPEAT_CLIENT: "Repeat Client",
  TRADE_SHOW: "Trade Show", OTHER: "Other",
};

type Lead = {
  id: string;
  companyName: string;
  contactName: string;
  email: string | null;
  phone: string | null;
  value: number | null;
  status: string;
  source: string | null;
  nextFollowUp: Date | null;
};

export default function LeadsKanbanBoard({ leads }: { leads: Lead[] }) {
  const byStage = Object.fromEntries(
    PIPELINE_STAGES.map((s) => [s.key, leads.filter((l) => l.status === s.key)])
  );

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = byStage[stage.key] ?? [];
          const stageValue = stageLeads.reduce((sum, l) => sum + (l.value ?? 0), 0);
          return (
            <div key={stage.key} className="w-56 flex flex-col gap-2">
              {/* Column header */}
              <div
                className="rounded-lg px-3 py-2 flex items-center justify-between"
                style={{ background: stage.glow, border: `1px solid ${stage.color}30` }}
              >
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: stage.color }}>
                  {stage.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${stage.color}20`, color: stage.color }}
                  >
                    {stageLeads.length}
                  </span>
                </div>
              </div>
              {stageValue > 0 && (
                <p className="text-[10px] px-1" style={{ color: "rgba(0,212,255,0.35)" }}>
                  {formatCurrency(stageValue)}
                </p>
              )}

              {/* Lead cards */}
              <div className="space-y-2">
                {stageLeads.length === 0 ? (
                  <div
                    className="rounded-lg p-3 text-center text-xs"
                    style={{
                      border: `1px dashed ${stage.color}20`,
                      color: "rgba(0,212,255,0.2)",
                      minHeight: 60,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    No leads
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <Link key={lead.id} href={`/admin/leads/${lead.id}`}>
                      <div
                        className="rounded-lg p-3 cursor-pointer transition-all duration-150"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(0,212,255,0.07)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = `${stage.color}40`;
                          (e.currentTarget as HTMLDivElement).style.background = `${stage.color}08`;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,212,255,0.07)";
                          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                        }}
                      >
                        <p className="text-sm font-bold truncate" style={{ color: "#d8e8f4" }}>
                          {lead.companyName}
                        </p>
                        <p className="text-xs truncate mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
                          {lead.contactName}
                        </p>
                        {lead.value && (
                          <p className="text-xs font-semibold mt-1.5" style={{ color: stage.color }}>
                            {formatCurrency(lead.value)}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {lead.email && <Mail className="w-3 h-3" style={{ color: "rgba(0,212,255,0.3)" }} />}
                          {lead.phone && <Phone className="w-3 h-3" style={{ color: "rgba(0,212,255,0.3)" }} />}
                          <span className="text-[10px] ml-auto" style={{ color: "rgba(0,212,255,0.3)" }}>
                            {SOURCE_LABELS[lead.source ?? "OTHER"]}
                          </span>
                        </div>
                        {lead.nextFollowUp && (
                          <p
                            className="text-[10px] mt-1 font-medium"
                            style={{
                              color: new Date(lead.nextFollowUp) < new Date() ? "#f87171" : "#fbbf24",
                            }}
                          >
                            Follow up: {new Date(lead.nextFollowUp).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
