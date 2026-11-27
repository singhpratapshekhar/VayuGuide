import React from "react";
import { Bot, CheckCircle2, Wrench, XCircle, Zap } from "lucide-react";
import { INDOOR_HACKS_DATA } from "../../data/lifestyleData.js";

/**
 * Indoor Air Quality Hacks & Room ACH Simulator Tab.
 */
export default function IndoorTab({
  city,
  effectiveAirData,
  indoorCategory,
  metrics,
  indoorActions,
  setIndoorActions,
  showDiyGuide,
  setShowDiyGuide,
  roomSqFt,
  setRoomSqFt,
  roomAchStats,
  askAiWithTopic
}) {
  return (
    <div id="panel-indoor" role="tabpanel" aria-labelledby="tab-indoor" className="space-y-6 animate-fadeIn">
      <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/15">
          <div>
            <h2 className="font-display font-extrabold text-lg text-white">
              Indoor Air Quality Hacks &amp; Room Simulator
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Tailored for your <strong className="text-slate-100">{metrics.homeObj.label}</strong> in{" "}
              <strong className="text-slate-100">{city.name}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-300">Simulated Room:</span>
            <span className={`font-mono font-black text-2xl ${indoorCategory.ringTextClass}`}>
              ~{metrics.protectedIndoorAQI} AQI
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${indoorCategory.badgeBorderClass}`}>
              {indoorCategory.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-center">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-300 inline-flex items-center gap-1.5">
              <XCircle size={13} aria-hidden="true" />
              <span>Unsealed + Sources</span>
            </span>
            <span className="font-mono font-black text-3xl md:text-4xl text-red-300 my-1.5 block">
              ~{metrics.unshieldedIndoorAQI} AQI
            </span>
            <p className="text-xs text-slate-300">
              Draft infiltration + cooking &amp; incense smoke (~{metrics.unshieldedPM25} µg/m³ PM2.5)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300 inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} aria-hidden="true" />
              <span>With Active IAQ Hacks</span>
            </span>
            <span className="font-mono font-black text-3xl md:text-4xl text-emerald-300 my-1.5 block">
              ~{metrics.protectedIndoorAQI} AQI
            </span>
            <p className="text-xs text-slate-300">
              Protected indoor air (~{metrics.protectedPM25} µg/m³ PM2.5)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/35 border border-purple-500/35 text-center flex flex-col justify-center">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-200 inline-flex items-center justify-center gap-1.5">
              <Zap size={13} aria-hidden="true" />
              <span>Direct Family Impact</span>
            </span>
            <span className="font-mono font-black text-3xl text-white my-1 block">
              {metrics.pm25AvoidedMg} mg
            </span>
            <p className="text-xs text-purple-200 font-medium">
              PM2.5 avoided/person/day ({metrics.cigarettesAvoided} fewer cigs eq)
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block">
            Toggle low-cost indoor hacks applied in your home:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {INDOOR_HACKS_DATA.map((hack) => {
              const active = !!indoorActions[hack.key];
              return (
                <label
                  key={hack.key}
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    active
                      ? "bg-purple-950/30 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                      : "bg-[#111025] border-purple-500/15 hover:border-purple-500/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) =>
                      setIndoorActions({ ...indoorActions, [hack.key]: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 rounded accent-purple-600 cursor-pointer shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-white leading-snug">{hack.title}</span>
                      <span className="font-mono text-[11px] font-extrabold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                        {hack.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{hack.desc}</p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-purple-500/10">
                      <span className="text-slate-300">{hack.why}</span>
                      <span className="font-mono font-bold text-purple-300 shrink-0 ml-2">
                        {hack.cost}
                      </span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Wrench size={18} className="text-purple-300" aria-hidden="true" />
            <div>
              <h2 className="font-display font-extrabold text-base text-white">
                ₹1,800 DIY Box-Fan HEPA Purifier Blueprint
              </h2>
              <p className="text-xs text-slate-300">
                Build a 280 m³/hr Clean Air Delivery Rate (CADR) room scrubber in 5 minutes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
            <button
              type="button"
              aria-expanded={showDiyGuide}
              onClick={() => setShowDiyGuide((prev) => !prev)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-xs font-bold text-purple-200 cursor-pointer"
            >
              {showDiyGuide ? "Hide Build Steps" : "Show 5-Min Build Guide"}
            </button>
            <button
              type="button"
              onClick={() =>
                askAiWithTopic(`Compare DIY box-fan purifier cost and sizing for a ${roomSqFt} sq ft room`)
              }
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Bot size={13} aria-hidden="true" />
              <span>Ask AI Purifier Bench</span>
            </button>
          </div>
        </div>

        {showDiyGuide && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-[#121026] border border-purple-500/20 space-y-1.5">
              <span className="text-xs font-mono font-bold text-purple-300">STEP 1 • PARTS (~₹1,800)</span>
              <p className="text-xs text-slate-200 leading-relaxed">
                1x 12-inch high-RPM cabin/box fan (₹1,100) + 1x cylindrical or flat True HEPA H13 replacement filter (₹650) + wide masking tape (₹50).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#121026] border border-purple-500/20 space-y-1.5">
              <span className="text-xs font-mono font-bold text-purple-300">STEP 2 • SEAL AIRFLOW</span>
              <p className="text-xs text-slate-200 leading-relaxed">
                Tape the HEPA filter tightly onto the INTAKE (suction) side of the fan with zero air gaps so all room air is forced through the H13 pleats.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#121026] border border-purple-500/20 space-y-1.5">
              <span className="text-xs font-mono font-bold text-emerald-300">3-YEAR TCO IMPACT</span>
              <p className="text-xs text-slate-200 leading-relaxed">
                DIY 3-Yr Total Cost: <strong className="text-emerald-300">₹3,100</strong> vs. Commercial ₹14,500+ vs. Premium ₹34,000+ — same 99.95% PM2.5 capture.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-purple-500/15">
          <div className="p-4 rounded-2xl bg-[#121026] border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="room-sqft-slider" className="font-bold text-white">
                Room Volume &amp; Clean-Down Speed
              </label>
              <strong className="font-mono text-purple-300">{roomSqFt} sq ft</strong>
            </div>
            <input
              id="room-sqft-slider"
              type="range"
              min="80"
              max="400"
              step="10"
              aria-valuetext={`${roomSqFt} square feet`}
              value={roomSqFt}
              onChange={(e) => setRoomSqFt(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#0B0A18] border border-purple-500/15">
                <span className="text-slate-300 block">Room Volume</span>
                <strong className="font-mono text-white">{roomAchStats.volumeM3} m³</strong>
              </div>
              <div className="p-2 rounded-xl bg-[#0B0A18] border border-purple-500/15">
                <span className="text-slate-300 block">Filtration Rate</span>
                <strong className="font-mono text-emerald-300">{roomAchStats.ach} ACH</strong>
              </div>
              <div className="p-2 rounded-xl bg-[#0B0A18] border border-purple-500/15">
                <span className="text-slate-300 block">1 Air Cycle</span>
                <strong className="font-mono text-purple-300">{roomAchStats.cleanCycleMins} mins</strong>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121026] border border-purple-500/20 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold text-white">N95 / FFP2 Seal &amp; Lifespan Hack</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-200 border border-purple-500/30">
                ~{Math.max(12, Math.round(9000 / Math.max(50, effectiveAirData.aqi)))} hrs life at {effectiveAirData.aqi} AQI
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              1) Pinch nose-bridge wire with both hands. 2) Exhale sharply — if air leaks near eyes, tighten head-loops. 3) Air-dry in shade after use; never wash electrostatic N95 meltblown layers with water.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
