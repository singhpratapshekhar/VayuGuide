import React from "react";
import { Bot, Clock, MapPin, RefreshCw, Sliders, Sun } from "lucide-react";

/**
 * Live AQI & Smog Simulator centerpiece card with 24-hour diurnal dispersion chart
 * and location smog drivers.
 */
export default function TelemetryHeroCard({
  city,
  effectiveAirData,
  aqiCategory,
  locationProfile,
  metrics,
  isSimulatingAQI,
  setIsSimulatingAQI,
  simulatedAQI,
  setSimulatedAQI,
  loading,
  loadCityData,
  peakPoint,
  safestPoint,
  safestWindowLabel,
  setActiveTab,
  setIsSearchOpen,
  askAiWithTopic
}) {
  return (
    <div className="relative rounded-3xl bg-[#0D0C1D]/85 backdrop-blur-2xl border border-purple-500/25 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ background: aqiCategory.glowColor }}
        aria-hidden="true"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-purple-500/15">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            aria-hidden="true"
            className={`w-2.5 h-2.5 rounded-full ${
              isSimulatingAQI ? "bg-purple-400 animate-pulse" : "bg-emerald-400 animate-ping"
            }`}
          />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            {isSimulatingAQI ? "SIMULATED SMOG EPISODE" : "LIVE SENSOR TELEMETRY"} — {city.name.toUpperCase()}
          </span>
          <span className="text-[11px] text-slate-300 font-mono">
            ({isSimulatingAQI ? "Scenario Stress Test" : `Updated ${effectiveAirData.updatedAt}`})
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            aria-pressed={isSimulatingAQI}
            onClick={() => setIsSimulatingAQI((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              isSimulatingAQI
                ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(147,51,234,0.5)]"
                : "bg-[#181630] hover:bg-[#232044] text-purple-300 border-purple-500/20"
            }`}
          >
            <Sliders size={12} aria-hidden="true" />
            <span>{isSimulatingAQI ? "Exit Simulator" : "Simulate Smog (50-500)"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSimulatingAQI(false);
              loadCityData(city);
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181630] hover:bg-[#232044] text-xs font-semibold text-slate-200 border border-purple-500/20 transition-colors"
          >
            <RefreshCw size={12} className={loading ? "animate-spin text-purple-400" : ""} aria-hidden="true" />
            <span>Sync Feed</span>
          </button>
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181630] hover:bg-[#232044] text-xs font-semibold text-purple-300 border border-purple-500/20 transition-colors"
          >
            <MapPin size={12} aria-hidden="true" />
            <span>Change City</span>
          </button>
        </div>
      </div>

      {isSimulatingAQI && (
        <div className="mt-4 p-4 rounded-2xl bg-purple-950/35 border border-purple-500/35 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <label htmlFor="smog-simulator-slider" className="font-mono font-bold text-purple-200">
              Severe Winter Smog Scenario Slider: {simulatedAQI} AQI ({aqiCategory.grap})
            </label>
            <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Smog scenario presets">
              {[
                { label: "Moderate 95", val: 95 },
                { label: "GRAP I • 180", val: 180 },
                { label: "GRAP II • 285", val: 285 },
                { label: "GRAP IV • 450", val: 450 }
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  aria-pressed={simulatedAQI === preset.val}
                  onClick={() => setSimulatedAQI(preset.val)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    simulatedAQI === preset.val
                      ? "bg-purple-600 border-purple-300 text-white"
                      : "bg-[#141229] border-purple-500/25 text-slate-300 hover:text-white"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <input
            id="smog-simulator-slider"
            type="range"
            min="50"
            max="500"
            step="5"
            aria-valuetext={`${simulatedAQI} AQI`}
            value={simulatedAQI}
            onChange={(e) => setSimulatedAQI(Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center">
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#15132B] border border-purple-500/30">
            <span className="w-2 h-2 rounded-full" style={{ background: aqiCategory.ringColor }} aria-hidden="true" />
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
              {aqiCategory.status}
            </span>
            <span className="text-[10px] text-purple-300 font-bold px-1.5 py-0.2 rounded bg-purple-950/80">
              {aqiCategory.grap}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-widest block">
              US-EPA Air Quality Index
            </span>
            <div className="flex items-baseline gap-3">
              <span
                className="font-mono font-black text-6xl sm:text-7xl md:text-8xl tracking-tighter"
                style={{
                  color: aqiCategory.ringColor,
                  textShadow: `0 0 35px ${aqiCategory.glowColor}`
                }}
              >
                {effectiveAirData.aqi}
              </span>
              <span className="text-sm font-bold text-slate-300 uppercase font-mono">AQI</span>
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-medium">{aqiCategory.summary}</p>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#141229] border border-purple-500/20 text-xs text-slate-200 shadow-inner">
            <span className="text-2xl" aria-hidden="true">🚬</span>
            <div>
              <span className="text-[11px] text-slate-300 block font-medium">
                Berkeley Earth Equivalence ({effectiveAirData.pm25} µg/m³ ÷ 22)
              </span>
              <span className="font-medium">
                Outdoor air = smoking{" "}
                <strong className="font-mono text-purple-300 text-sm font-bold">
                  {metrics.outdoorCigarettes} cigarettes
                </strong>{" "}
                / day
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#121026]/90 p-5 rounded-2xl border border-purple-500/20 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/10 flex-wrap gap-2">
            <div>
              <h2 className="font-display font-bold text-sm text-white">
                24-Hour Smog Dispersion Flow
              </h2>
              <span className="text-[11px] text-slate-300 font-medium">
                Thermal Inversion &amp; Boundary Layer Trajectory
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
              <Sun size={12} aria-hidden="true" />
              <span>Safest: {safestWindowLabel}</span>
            </div>
          </div>

          <div className="pt-6 pb-2" role="region" aria-label="24-hour AQI trajectory chart">
            <div className="grid grid-cols-6 gap-2 sm:gap-3 items-end h-48">
              {effectiveAirData.trend.slice(0, 6).map((point) => {
                const isPeak = point.aqi === peakPoint.aqi;
                const isSafe = point.aqi === safestPoint.aqi && !isPeak;
                const heightPct = Math.min(95, Math.max(22, (point.aqi / 380) * 100));

                return (
                  <div
                    key={point.time}
                    className="flex flex-col items-center h-full justify-end group"
                    aria-label={`${point.time}: ${point.aqi} AQI`}
                  >
                    {isPeak ? (
                      <div className="mb-2 flex flex-col items-center animate-bounce">
                        <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-mono font-bold shadow-[0_0_15px_rgba(168,85,247,0.8)] whitespace-nowrap">
                          Peak {point.aqi}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-white ring-4 ring-purple-500 shadow-[0_0_10px_white] mt-0.5" aria-hidden="true" />
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-300 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {point.aqi}
                      </span>
                    )}

                    <div className="w-full max-w-[42px] bg-[#1A1838] rounded-full overflow-hidden p-1 flex flex-col justify-end h-32 border border-purple-500/15">
                      <div
                        className={`w-full rounded-full transition-all duration-700 ${
                          isPeak
                            ? "bg-gradient-to-t from-purple-700 via-purple-500 to-violet-400 shadow-[0_0_20px_rgba(168,85,247,0.7)]"
                            : isSafe
                            ? "bg-gradient-to-t from-emerald-800 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                            : "bg-gradient-to-t from-[#2E2856] to-[#4C3F8C]"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>

                    <span
                      className={`text-[11px] font-mono mt-2 font-semibold ${
                        isPeak
                          ? "text-purple-300 font-bold"
                          : isSafe
                          ? "text-emerald-400 font-bold"
                          : "text-slate-300"
                      }`}
                    >
                      {point.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-[#131129] border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold block">
            📍 {city.name} Smog Fingerprint
          </span>
          <p className="text-xs text-slate-200 font-medium">{locationProfile.smogDrivers}</p>
          <p className="text-[11px] text-slate-300">{locationProfile.localTip}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
          <button
            type="button"
            onClick={() => setActiveTab("routine")}
            className="px-3.5 py-2 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-xs font-bold text-purple-200 whitespace-nowrap flex items-center gap-1.5 transition-colors"
          >
            <Clock size={13} aria-hidden="true" />
            <span>Daily Routine</span>
          </button>
          <button
            type="button"
            onClick={() =>
              askAiWithTopic(
                `Plan my low-emission daily routine today in ${city.name} at ${effectiveAirData.aqi} AQI`
              )
            }
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white whitespace-nowrap flex items-center gap-1.5 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-colors"
          >
            <Bot size={13} aria-hidden="true" />
            <span>Ask AI Co-Pilot</span>
          </button>
        </div>
      </div>

      {effectiveAirData.aqi >= 201 && (
        <div
          role="region"
          aria-label="GRAP smog advisory"
          className="mt-4 p-4 rounded-2xl bg-red-950/25 border border-red-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-300 block">
              🚨 {aqiCategory.grap} Family &amp; Community Advisory
            </span>
            <p className="text-xs text-slate-200">
              {effectiveAirData.aqi > 300
                ? "Emergency protocol: Stop all outdoor exercise, enforce child N95/hybrid school alerts, halt RWA leaf/guard wood fires, and keep HEPA/DIY fan running 24x7."
                : "Elevated inversion episode: Seal balcony gaps, mandate damp corridor mopping in your RWA, and restrict outdoor transit to tight-seal N95."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("whatsapp")}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-xs font-bold text-red-200 whitespace-nowrap self-start sm:self-center"
          >
            Alert RWA &amp; Family
          </button>
        </div>
      )}
    </div>
  );
}
