import React from "react";
import { Activity, Flame, Sparkles, Sun, Wind } from "lucide-react";

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
  const verdictCards = [
    {
      step: "01 / MORNING WALK",
      badge: aqiCategory.walkVerdict,
      badgeClass: aqiCategory.walkVerdictColor,
      title: aqiCategory.walk,
      note:
        lifestyle.hasAsthma || lifestyle.hasSeniors
          ? "Priority alert for seniors/asthma: exercise strictly indoors until afternoon sun."
          : effectiveAirData.aqi > 200
          ? "Shift cardio indoors. Deep inhalation of PM2.5 bypasses nasal cilia."
          : "Safe for regular outdoor jogging and morning strolls."
    },
    {
      step: `02 / ${lifestyle.hasKids ? "KIDS & COMMUTE" : "TRANSIT SHIELD"}`,
      badge: aqiCategory.schoolVerdict,
      badgeClass: aqiCategory.schoolVerdictColor,
      title: aqiCategory.mask,
      note: `${metrics.commuteObj.note}. ${
        lifestyle.hasKids ? "Fasten child N95 before school bus queue." : "Keep nose-clip sealed."
      }`
    },
    {
      step: "03 / VENTILATION",
      badge: aqiCategory.windowsVerdict,
      badgeClass: aqiCategory.windowsVerdictColor,
      title: aqiCategory.windows,
      note: (
        <>
          Safest flush window today:{" "}
          <strong className="text-emerald-300">{safestWindowLabel}</strong>.
        </>
      )
    },
    {
      step: "04 / INDOOR SHIELD",
      badge: `~${metrics.protectedIndoorAQI} AQI`,
      badgeClass: "bg-purple-950/60 text-purple-200 border-purple-500/30",
      title: `Purifier: ${aqiCategory.purifierSpeed}`,
      note: (
        <>
          Your active indoor hacks cut indoor smog by{" "}
          <strong className="text-purple-300">
            {Math.max(0, metrics.unshieldedIndoorAQI - metrics.protectedIndoorAQI)} AQI
          </strong>
          .
        </>
      )
    }
  ];

  const pollutants = [
    {
      label: "PM2.5 (Fine Smog)",
      value: effectiveAirData.pm25,
      icon: Flame,
      iconClass: "text-purple-300",
      subtext:
        effectiveAirData.pm25 > 15
          ? `${Math.round(effectiveAirData.pm25 / 15)}x WHO Limit`
          : "Within safe range",
      subClass: "text-red-300 font-semibold"
    },
    {
      label: "PM10 (Coarse Dust)",
      value: effectiveAirData.pm10,
      icon: Wind,
      iconClass: "text-amber-300",
      subtext:
        effectiveAirData.pm10 > 45
          ? `${Math.round(effectiveAirData.pm10 / 45)}x WHO Limit`
          : "Within safe range",
      subClass: "text-amber-300 font-semibold"
    },
    {
      label: "NO₂ (Vehicle Exhaust)",
      value: effectiveAirData.no2,
      icon: Activity,
      iconClass: "text-indigo-300",
      subtext: "Urban Traffic Inflow",
      subClass: "text-slate-300"
    },
    {
      label: "Ozone (O₃)",
      value: effectiveAirData.o3,
      icon: Sun,
      iconClass: "text-cyan-300",
      subtext: "Sunlight Photochemical",
      subClass: "text-slate-300"
    }
  ];

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-purple-300" aria-hidden="true" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              10-Second Tailored Protocol Verdicts
            </h2>
          </div>
          <span className="text-xs text-slate-300 font-mono">Calibrated to Your Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {verdictCards.map((card) => (
            <div
              key={card.step}
              className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                    {card.step}
                  </span>
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{card.title}</h3>
              </div>
              <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-purple-500/10">
                {card.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-purple-300" aria-hidden="true" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Multi-Pollutant Telemetry Bento (µg/m³)
            </h2>
          </div>
          <span className="text-xs text-slate-300 font-mono">WHO Standard Calibrated</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {pollutants.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.label}
                className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300">{p.label}</span>
                  <Icon size={14} className={p.iconClass} aria-hidden="true" />
                </div>
                <span className="font-mono font-bold text-2xl md:text-3xl text-white block my-1">
                  {p.value}
                </span>
                <span className={`text-xs ${p.subClass}`}>{p.subtext}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
