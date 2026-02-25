"use client";

import { useState, useEffect } from "react";
import { Wind, Thermometer, Droplets, Eye, Cloud, Navigation, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  precipitation: number;
  cloudCover: number;
  visibility: number;
  weatherCode: number;
  locationName: string;
}

type FlightRating = "EXCELLENT" | "GOOD" | "CAUTION" | "NO_FLY";

function getFlightRating(w: WeatherData): FlightRating {
  if (w.windSpeed > 30 || w.windGusts > 40 || w.precipitation > 2 || w.visibility < 1600) return "NO_FLY";
  if (w.windSpeed > 20 || w.windGusts > 28 || w.precipitation > 0.5 || w.visibility < 4800) return "CAUTION";
  if (w.windSpeed > 12 || w.windGusts > 18 || w.cloudCover > 75) return "GOOD";
  return "EXCELLENT";
}

const RATING_CONFIG: Record<FlightRating, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  EXCELLENT: { label: "Excellent Conditions", color: "#34d399", bg: "rgba(52,211,153,0.1)",  icon: CheckCircle2   },
  GOOD:      { label: "Good to Fly",          color: "#00d4ff", bg: "rgba(0,212,255,0.1)",   icon: CheckCircle2   },
  CAUTION:   { label: "Fly with Caution",     color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  icon: AlertTriangle  },
  NO_FLY:    { label: "No-Fly Conditions",    color: "#f87171", bg: "rgba(248,113,113,0.1)", icon: XCircle        },
};

function windDirectionLabel(deg: number) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function windColor(mph: number) {
  if (mph > 30) return "#f87171";
  if (mph > 20) return "#fbbf24";
  if (mph > 12) return "#00d4ff";
  return "#34d399";
}

function visibilityLabel(meters: number) {
  const miles = meters / 1609.34;
  if (miles >= 10) return "10+ mi";
  return `${miles.toFixed(1)} mi`;
}

function visibilityColor(meters: number) {
  if (meters < 1600)  return "#f87171";
  if (meters < 4800)  return "#fbbf24";
  return "#34d399";
}

export function DroneWeatherWidget({ compact = false }: { compact?: boolean }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  async function fetchWeather() {
    setLoading(true);
    setError(null);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const { latitude: lat, longitude: lon } = pos.coords;

      const [meteoRes, geoRes] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,` +
          `precipitation,cloud_cover,visibility,weather_code` +
          `&wind_speed_unit=mph&temperature_unit=fahrenheit&forecast_days=1`
        ),
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          { headers: { "Accept-Language": "en" } }
        ),
      ]);

      const meteo = await meteoRes.json();
      const geo   = await geoRes.json();
      const c = meteo.current;

      const city =
        geo.address?.city ??
        geo.address?.town ??
        geo.address?.village ??
        geo.address?.county ??
        "Your Location";
      const state = geo.address?.state_code ?? geo.address?.state ?? "";

      setWeather({
        temperature:   Math.round(c.temperature_2m),
        windSpeed:     Math.round(c.wind_speed_10m),
        windDirection: Math.round(c.wind_direction_10m),
        windGusts:     Math.round(c.wind_gusts_10m),
        precipitation: c.precipitation,
        cloudCover:    c.cloud_cover,
        visibility:    c.visibility,
        weatherCode:   c.weather_code,
        locationName:  state ? `${city}, ${state}` : city,
      });
      setLastUpdated(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    } catch (err: unknown) {
      const msg = err instanceof GeolocationPositionError
        ? "Location access denied. Enable GPS to see local weather."
        : "Unable to load weather data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchWeather(); }, []);

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div
        className="rounded-xl p-4 flex items-center gap-3"
        style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)" }}
      >
        <RefreshCw className="w-4 h-4 animate-spin" style={{ color: "rgba(0,212,255,0.5)" }} />
        <p className="text-xs" style={{ color: "rgba(0,212,255,0.45)" }}>Fetching local conditions…</p>
      </div>
    );
  }

  /* ---------- ERROR ---------- */
  if (error || !weather) {
    return (
      <div
        className="rounded-xl p-4 flex items-center gap-3"
        style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.2)" }}
      >
        <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#fbbf24" }} />
        <p className="text-xs flex-1" style={{ color: "rgba(251,191,36,0.8)" }}>{error ?? "No data"}</p>
        <button onClick={fetchWeather} className="text-xs underline" style={{ color: "rgba(251,191,36,0.7)" }}>Retry</button>
      </div>
    );
  }

  const rating   = getFlightRating(weather);
  const rc       = RATING_CONFIG[rating];
  const RatingIcon = rc.icon;
  const wColor   = windColor(weather.windSpeed);

  /* ---------- COMPACT (for command center header) ---------- */
  if (compact) {
    return (
      <div
        className="flex items-center gap-3 px-3 py-2 rounded-xl"
        style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)" }}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: rc.color, boxShadow: `0 0 6px ${rc.color}` }}
        />
        <div>
          <p className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(0,212,255,0.4)" }}>
            Flight Weather
          </p>
          <p className="text-xs font-bold leading-tight" style={{ color: rc.color }}>
            {rc.label}
          </p>
        </div>
        <div className="flex items-center gap-1 ml-1" style={{ color: wColor }}>
          <Wind className="w-3 h-3" />
          <span className="text-xs font-bold font-mono">{weather.windSpeed} mph</span>
        </div>
        <div className="hidden sm:flex items-center gap-1" style={{ color: "rgba(0,212,255,0.55)" }}>
          <Thermometer className="w-3 h-3" />
          <span className="text-xs font-mono">{weather.temperature}°F</span>
        </div>
      </div>
    );
  }

  /* ---------- FULL ---------- */
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(0,212,255,0.1)" }}
    >
      {/* Header bar */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(0,212,255,0.05)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00d4ff" }}>
            🌤 Flight Weather
          </p>
          <span className="text-[10px]" style={{ color: "rgba(0,212,255,0.4)" }}>
            {weather.locationName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px]" style={{ color: "rgba(0,212,255,0.3)" }}>
              Updated {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchWeather}
            className="rounded-lg p-1 transition-colors hover:bg-white/5"
            title="Refresh"
          >
            <RefreshCw className="w-3 h-3" style={{ color: "rgba(0,212,255,0.4)" }} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4" style={{ background: "rgba(0,212,255,0.02)" }}>
        {/* Flight rating banner */}
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: rc.bg, border: `1px solid ${rc.color}40` }}
        >
          <RatingIcon className="w-5 h-5 flex-shrink-0" style={{ color: rc.color }} />
          <div>
            <p className="text-sm font-black" style={{ color: rc.color }}>{rc.label}</p>
            <p className="text-[11px]" style={{ color: `${rc.color}99` }}>
              {rating === "EXCELLENT" && "Optimal drone operations — go fly!"}
              {rating === "GOOD"      && "Safe for most drone operations."}
              {rating === "CAUTION"   && "Monitor conditions closely before launch."}
              {rating === "NO_FLY"    && "Conditions exceed safe operating thresholds."}
            </p>
          </div>
        </div>

        {/* Metric grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

          {/* Wind Speed */}
          <div className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.07)" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Wind className="w-3.5 h-3.5" style={{ color: wColor }} />
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(0,212,255,0.45)" }}>Wind</p>
            </div>
            <p className="text-xl font-black font-mono" style={{ color: wColor }}>
              {weather.windSpeed} <span className="text-xs font-normal">mph</span>
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
              {windDirectionLabel(weather.windDirection)} ({weather.windDirection}°)
            </p>
          </div>

          {/* Wind Gusts */}
          <div className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.07)" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Navigation className="w-3.5 h-3.5" style={{ color: windColor(weather.windGusts) }} />
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(0,212,255,0.45)" }}>Gusts</p>
            </div>
            <p className="text-xl font-black font-mono" style={{ color: windColor(weather.windGusts) }}>
              {weather.windGusts} <span className="text-xs font-normal">mph</span>
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
              {weather.windGusts > 28 ? "Above safe gust limit" : weather.windGusts > 18 ? "Monitor gusts" : "Within safe range"}
            </p>
          </div>

          {/* Temperature */}
          <div className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.07)" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Thermometer className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(0,212,255,0.45)" }}>Temp</p>
            </div>
            <p className="text-xl font-black font-mono" style={{ color: "#a78bfa" }}>
              {weather.temperature}° <span className="text-xs font-normal">F</span>
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
              {weather.temperature < 32 ? "Battery drain risk" : weather.temperature > 95 ? "Heat stress risk" : "Normal range"}
            </p>
          </div>

          {/* Visibility */}
          <div className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.07)" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Eye className="w-3.5 h-3.5" style={{ color: visibilityColor(weather.visibility) }} />
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(0,212,255,0.45)" }}>Visibility</p>
            </div>
            <p className="text-xl font-black font-mono" style={{ color: visibilityColor(weather.visibility) }}>
              {visibilityLabel(weather.visibility)}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
              {weather.visibility < 1600 ? "Below FAA minimums" : weather.visibility < 4800 ? "Reduced vis" : "VLOS safe"}
            </p>
          </div>

          {/* Precipitation */}
          <div className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.07)" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Droplets className="w-3.5 h-3.5" style={{ color: weather.precipitation > 0.5 ? "#f87171" : "#34d399" }} />
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(0,212,255,0.45)" }}>Precip</p>
            </div>
            <p className="text-xl font-black font-mono"
              style={{ color: weather.precipitation > 0.5 ? "#f87171" : weather.precipitation > 0 ? "#fbbf24" : "#34d399" }}>
              {weather.precipitation.toFixed(1)} <span className="text-xs font-normal">mm/h</span>
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
              {weather.precipitation === 0 ? "Clear — no precipitation" : weather.precipitation < 0.5 ? "Light precipitation" : "Active precipitation"}
            </p>
          </div>

          {/* Cloud Cover */}
          <div className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.07)" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Cloud className="w-3.5 h-3.5" style={{ color: "#60a5fa" }} />
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(0,212,255,0.45)" }}>Cloud Cover</p>
            </div>
            <p className="text-xl font-black font-mono" style={{ color: "#60a5fa" }}>
              {weather.cloudCover}<span className="text-xs font-normal">%</span>
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
              {weather.cloudCover < 30 ? "Clear skies" : weather.cloudCover < 70 ? "Partly cloudy" : "Overcast"}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
