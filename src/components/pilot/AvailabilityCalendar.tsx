"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface AvailabilityEntry {
  id:        string;
  date:      string;
  available: boolean;
  startTime: string | null;
  endTime:   string | null;
  notes:     string | null;
}

interface Props { pilotId: string }

export default function AvailabilityCalendar({ pilotId }: Props) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [entries, setEntries]   = useState<Record<string, AvailabilityEntry>>({});
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState<string | null>(null);

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const fetchMonth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pilots/${pilotId}/availability?month=${monthKey}`);
      if (!res.ok) return;
      const data: AvailabilityEntry[] = await res.json();
      const map: Record<string, AvailabilityEntry> = {};
      for (const e of data) {
        const key = e.date.slice(0, 10);
        map[key] = e;
      }
      setEntries(map);
    } finally {
      setLoading(false);
    }
  }, [pilotId, monthKey]);

  useEffect(() => { fetchMonth(); }, [fetchMonth]);

  async function toggleDay(dateStr: string) {
    const current = entries[dateStr];
    const newAvailable = current ? !current.available : false; // clicking = mark unavailable first
    setSaving(dateStr);
    try {
      if (current && !newAvailable === false) {
        // Delete entry to reset to "available" (default)
        await fetch(`/api/pilots/${pilotId}/availability?date=${dateStr}`, { method: "DELETE" });
        setEntries((prev) => { const next = { ...prev }; delete next[dateStr]; return next; });
      } else {
        const res = await fetch(`/api/pilots/${pilotId}/availability`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateStr, available: newAvailable }),
        });
        if (res.ok) {
          const entry: AvailabilityEntry = await res.json();
          setEntries((prev) => ({ ...prev, [dateStr]: entry }));
        }
      }
    } finally {
      setSaving(null);
    }
  }

  async function markUnavailable(dateStr: string) {
    setSaving(dateStr);
    try {
      const res = await fetch(`/api/pilots/${pilotId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, available: false }),
      });
      if (res.ok) {
        const entry: AvailabilityEntry = await res.json();
        setEntries((prev) => ({ ...prev, [dateStr]: entry }));
      }
    } finally {
      setSaving(null);
    }
  }

  async function markAvailable(dateStr: string) {
    setSaving(dateStr);
    try {
      await fetch(`/api/pilots/${pilotId}/availability?date=${dateStr}`, { method: "DELETE" });
      setEntries((prev) => { const next = { ...prev }; delete next[dateStr]; return next; });
    } finally {
      setSaving(null);
    }
  }

  function prevMonth() { setMonth((m) => { if (m === 0) { setYear((y) => y - 1); return 11; } return m - 1; }); }
  function nextMonth() { setMonth((m) => { if (m === 11) { setYear((y) => y + 1); return 0; } return m + 1; }); }

  // Build calendar grid
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = today.toISOString().slice(0, 10);

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,212,255,0.1)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(0,212,255,0.04)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
        <button onClick={prevMonth} className="p-1 rounded hover:bg-white/5 transition-colors">
          <ChevronLeft className="w-4 h-4" style={{ color: "rgba(0,212,255,0.6)" }} />
        </button>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold" style={{ color: "#d8e8f4" }}>
            {MONTHS[month]} {year}
          </h3>
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "rgba(0,212,255,0.4)" }} />}
        </div>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-white/5 transition-colors">
          <ChevronRight className="w-4 h-4" style={{ color: "rgba(0,212,255,0.6)" }} />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2" style={{ borderBottom: "1px solid rgba(0,212,255,0.06)" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: "rgba(52,211,153,0.25)", border: "1px solid rgba(52,211,153,0.4)" }} />
          <span className="text-xs" style={{ color: "rgba(0,212,255,0.5)" }}>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: "rgba(248,113,113,0.2)", border: "1px solid rgba(248,113,113,0.35)" }} />
          <span className="text-xs" style={{ color: "rgba(0,212,255,0.5)" }}>Unavailable</span>
        </div>
        <span className="text-xs ml-auto" style={{ color: "rgba(0,212,255,0.3)" }}>Click a day to toggle</span>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center py-1">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(0,212,255,0.35)" }}>{d}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 p-2">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr  = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const entry    = entries[dateStr];
          const isToday  = dateStr === todayStr;
          const isPast   = dateStr < todayStr;
          const isUnavail = entry && !entry.available;
          const isSaving = saving === dateStr;

          return (
            <button
              key={i}
              disabled={isPast || isSaving}
              onClick={() => isUnavail ? markAvailable(dateStr) : markUnavailable(dateStr)}
              className="aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all relative"
              style={{
                background: isUnavail
                  ? "rgba(248,113,113,0.18)"
                  : isPast
                  ? "transparent"
                  : "rgba(52,211,153,0.1)",
                border: isToday
                  ? "2px solid rgba(0,212,255,0.7)"
                  : isUnavail
                  ? "1px solid rgba(248,113,113,0.3)"
                  : isPast
                  ? "1px solid rgba(255,255,255,0.04)"
                  : "1px solid rgba(52,211,153,0.25)",
                color: isUnavail ? "#f87171" : isPast ? "rgba(0,212,255,0.2)" : "#34d399",
                cursor: isPast ? "default" : "pointer",
              }}
            >
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : day}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(0,212,255,0.06)", background: "rgba(0,212,255,0.02)" }}>
        <span className="text-xs" style={{ color: "rgba(0,212,255,0.4)" }}>
          {Object.values(entries).filter((e) => !e.available).length} day{Object.values(entries).filter((e) => !e.available).length !== 1 ? "s" : ""} marked unavailable this month
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7"
          style={{ color: "rgba(0,212,255,0.5)" }}
          onClick={fetchMonth}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
