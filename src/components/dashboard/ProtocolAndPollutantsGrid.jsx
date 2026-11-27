import React from "react";
import { Activity, Flame, Sun, Wind } from "lucide-react";

/**
 * 10-Second Tailored Protocol Verdicts and Multi-Pollutant Telemetry Bento grid.
 */
export default function ProtocolAndPollutantsGrid({
  effectiveAirData,
  aqiCategory,
  lifestyle,
  metrics,
  safestWindowLabel
}) {
  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-xs" aria-hidden="true">✦</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              10-Second Tailored Protocol Verdicts
            </h2>
          </div>
          <span className="text-xs text-slate-300 font-mono">Calibrated to Your Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
                  01 / MORNING WALK
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${aqiCategory.walkVerdictColor}`}>
                  {aqiCategory.walkVerdict}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{aqiCategory.walk}</h3>
            </div>
            <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-purple-500/10">
              {lifestyle.hasAsthma || lifestyle.hasSeniors
                ? "Priority alert for seniors/asthma: exercise strictly indoors until afternoon sun."
                : effectiveAirData.aqi > 200
                ? "Shift cardio indoors. Deep inhalation of PM2.5 bypasses nasal cilia."
                : "Safe for regular outdoor jogging and morning strolls."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
                  02 / {lifestyle.hasKids ? "KIDS & COMMUTE" : "TRANSIT SHIELD"}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${aqiCategory.schoolVerdictColor}`}>
                  {aqiCategory.schoolVerdict}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{aqiCategory.mask}</h3>
            </div>
            <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-purple-500/10">
              {metrics.commuteObj.note}. {lifestyle.hasKids ? "Fasten child N95 before school bus queue." : "Keep nose-clip sealed."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
                  03 / VENTILATION
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${aqiCategory.windowsVerdictColor}`}>
                  {aqiCategory.windowsVerdict}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{aqiCategory.windows}</h3>
            </div>
            <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-purple-500/10">
              Safest flush window today: <strong className="text-emerald-400">{safestWindowLabel}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
                  04 / INDOOR SHIELD
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30">
                  ~{metrics.protectedIndoorAQI} AQI
                </span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">
                Purifier: {aqiCategory.purifierSpeed}
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-purple-500/10">
              Your active indoor hacks cut indoor smog by{" "}
              <strong className="text-purple-300">
                {Math.max(0, metrics.unshieldedIndoorAQI - metrics.protectedIndoorAQI)} AQI
              </strong>
              .
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-xs" aria-hidden="true">✦</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Multi-Pollutant Telemetry Bento (µg/m³)
            </h2>
          </div>
          <span className="text-xs text-slate-300 font-mono">WHO Standard Calibrated</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">PM2.5 (Fine Smog)</span>
              <Flame size={14} className="text-purple-400" aria-hidden="true" />
            </div>
            <span className="font-mono font-bold text-2xl md:text-3xl text-white block my-1">
              {effectiveAirData.pm25}
            </span>
            <span className="text-[11px] font-semibold text-red-400">
              {effectiveAirData.pm25 > 15 ? `${Math.round(effectiveAirData.pm25 / 15)}x WHO Limit` : "Within safe range"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">PM10 (Coarse Dust)</span>
              <Wind size={14} className="text-amber-400" aria-hidden="true" />
            </div>
            <span className="font-mono font-bold text-2xl md:text-3xl text-white block my-1">
              {effectiveAirData.pm10}
            </span>
            <span className="text-[11px] font-semibold text-amber-400">
              {effectiveAirData.pm10 > 45 ? `${Math.round(effectiveAirData.pm10 / 45)}x WHO Limit` : "Within safe range"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">NO₂ (Vehicle Exhaust)</span>
              <Activity size={14} className="text-indigo-400" aria-hidden="true" />
            </div>
            <span className="font-mono font-bold text-2xl md:text-3xl text-white block my-1">
              {effectiveAirData.no2}
            </span>
            <span className="text-[11px] text-slate-300">Urban Traffic Inflow</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">Ozone (O₃)</span>
              <Sun size={14} className="text-cyan-400" aria-hidden="true" />
            </div>
            <span className="font-mono font-bold text-2xl md:text-3xl text-white block my-1">
              {effectiveAirData.o3}
            </span>
            <span className="text-[11px] text-slate-300">Sunlight Photochemical</span>
          </div>
        </div>
      </div>
    </>
  );
}
