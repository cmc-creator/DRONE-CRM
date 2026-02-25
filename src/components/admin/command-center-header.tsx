"use client";

import { useState, useEffect } from "react";
import { Radio } from "lucide-react";

export function CommandCenterHeader() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
      setDate(now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.08)" }}>
      {/* Mini grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow orb */}
      <div className="absolute rounded-full blur-3xl pointer-events-none" style={{ width: 300, height: 300, background: "radial-gradient(circle, rgba(0,100,255,0.08) 0%, transparent 70%)", top: "-50%", right: "5%"}} />

      <div className="relative z-10 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(52,211,153,0.7)" }}>
                Systems Online
              </span>
            </div>
          </div>
          <h1
            className="text-2xl md:text-3xl font-black tracking-wide"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #00d4ff 60%, #0066ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Command Center
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
            {date || "Lumin Aerial LLC — Nationwide Drone Operations"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Live clock */}
          <div
            className="text-right px-4 py-2 rounded-xl"
            style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.1)" }}
          >
            <p className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
              Local Time
            </p>
            <p className="text-xl font-black font-mono" style={{ color: "#00d4ff", textShadow: "0 0 20px rgba(0,212,255,0.4)" }}>
              {time || "——:——:——"}
            </p>
          </div>

          {/* Broadcast indicator */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)" }}
          >
            <Radio className="w-4 h-4" style={{ color: "#00d4ff" }} />
            <div>
              <p className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(0,212,255,0.4)" }}>Network</p>
              <p className="text-xs font-bold" style={{ color: "#34d399" }}>48 States</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
