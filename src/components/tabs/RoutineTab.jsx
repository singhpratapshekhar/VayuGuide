import React from "react";
import { Check, Copy, Sun } from "lucide-react";
import { getAQICategory } from "../../utils/aqi.js";

/**
 * Low-Emission Daily Routine Tab: 24h diurnal planner & completion tracker.
 */
export default function RoutineTab({
  city,
  effectiveAirData,
  metrics,
  routineBlocks,
  routineCompleted,
  setRoutineCompleted,
  completedRoutineCount,
  safestWindowLabel,
  safestPoint,
  peakPoint,
  copiedKey,
  copyToClipboard,
  askAiWithTopic
}) {
  return (
          <div id="panel-routine" role="tabpanel" aria-labelledby="tab-routine" className="space-y-6 animate-fadeIn">
            {/* Routine Header & Adherence Impact */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-500/15">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold">
                    Tailored to {city.name} ({effectiveAirData.aqi} AQI) • {metrics.commuteObj.label} • {metrics.homeObj.label}
                  </span>
                  <h2 className="font-display font-extrabold text-xl text-white mt-1">
                    Low-Emission Daily Defense Routine
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Time-blocked actions synchronized with today's thermal inversion curve to cut lung dose & neighborhood emissions
                  </p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="px-3.5 py-2 rounded-2xl bg-[#131129] border border-purple-500/30 text-center">
                    <span className="text-[10px] font-mono text-slate-400 block">ADOPTED TODAY</span>
                    <span className="font-mono font-black text-base text-purple-300">
                      {completedRoutineCount} / {routineBlocks.length}
                    </span>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
                    <span className="text-[10px] font-mono text-emerald-300 block">FAMILY AVOIDED</span>
                    <span className="font-mono font-black text-base text-emerald-400">
                      {metrics.familyPm25AvoidedMgDay} mg
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const summary = `🌿 *VayuGuide Daily Routine — ${city.name} (${effectiveAirData.aqi} AQI)*\n${routineBlocks
                        .map((b) => `• *${b.time}* (${b.title}): ${b.action} [${b.directImpact}]`)
                        .join("\n")}\n\n⚡ Impact: Saves ${metrics.familyPm25AvoidedMgDay} mg PM2.5/day for our family!`;
                      copyToClipboard("dailyRoutine", summary);
                    }}
                    className="px-3.5 py-2.5 rounded-2xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-xs font-bold text-purple-200 flex items-center gap-1.5"
                  >
                    <Copy size={13} aria-hidden="true" />
                    <span>{copiedKey === "dailyRoutine" ? "Copied!" : "Share Routine"}</span>
                  </button>
                </div>
              </div>

              {/* Time-Blocked Interactive Routine List */}
              <div className="space-y-3">
                {routineBlocks.map((block) => {
                  const done = !!routineCompleted[block.id];
                  return (
                    <button
                      key={block.id}
                      type="button"
                      aria-pressed={done}
                      onClick={() =>
                        setRoutineCompleted((prev) => ({ ...prev, [block.id]: !prev[block.id] }))
                      }
                      className={`w-full text-left p-4 md:p-5 rounded-2xl border cursor-pointer transition-all ${
                        done
                          ? "bg-purple-950/30 border-purple-500/50 shadow-[0_0_20px_rgba(147,51,234,0.15)]"
                          : "bg-[#111025] border-purple-500/15 hover:border-purple-500/35"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          aria-hidden="true"
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                            done
                              ? "bg-purple-600 border-purple-400 text-white"
                              : "bg-[#1A1836] border-purple-500/30 text-transparent"
                          }`}
                        >
                          <Check size={13} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#1B1838] border border-purple-500/30 text-[11px] font-mono font-bold text-purple-300">
                                {block.time}
                              </span>
                              <h3 className="text-sm font-bold text-white">{block.title}</h3>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300">
                                {block.directImpact}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-[10px] font-mono font-bold text-indigo-300">
                                {block.emissionImpact}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-200 leading-relaxed">{block.action}</p>

                          <div className="text-[11px] text-slate-300 bg-[#0A0916] px-3 py-2 rounded-xl border border-purple-500/10">
                            <strong className="text-purple-300">Direct Impact & Why:</strong> {block.why}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 24-Hour Smog Dispersion Hourly Grid */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/15">
                <div>
                  <h2 className="font-display font-extrabold text-lg text-white">
                    24-Hour Diurnal Dispersion Windows ({city.name})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hourly AQI trajectory guiding when to seal doors vs. cross-ventilate
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <Sun size={13} />
                  <span>Safest Window: {safestWindowLabel}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {effectiveAirData.trend.slice(0, 6).map((point, index) => {
                  const cat = getAQICategory(point.aqi);
                  const isSafeWindow = point.aqi === safestPoint.aqi;
                  const isPeak = point.aqi === peakPoint.aqi;

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        isPeak
                          ? "bg-purple-950/50 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                          : isSafeWindow
                          ? "bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          : "bg-[#111025] border-purple-500/15"
                      }`}
                    >
                      <span className="text-xs font-mono font-bold text-slate-400 block">
                        {point.time}
                      </span>
                      <span
                        className="font-mono font-black text-3xl block my-1.5"
                        style={{ color: cat.ringColor }}
                      >
                        {point.aqi}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-300">
                        {cat.status}
                      </span>
                      {isSafeWindow && (
                        <span className="text-[9px] font-extrabold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full mt-2 inline-block border border-emerald-500/30">
                          Safe Air Out
                        </span>
                      )}
                      {isPeak && (
                        <span className="text-[9px] font-extrabold text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full mt-2 inline-block border border-purple-500/30">
                          Peak Smog
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-[#141228] border border-purple-500/20 text-xs space-y-1.5">
                <span className="font-bold text-purple-300 block">
                  Atmospheric Science: Why does timing your routine cut exposure by 25–40%?
                </span>
                <p className="text-slate-300 leading-relaxed">
                  During winter nights, ground cooling forms a shallow Thermal Inversion Lid that traps
                  exhaust and biomass smoke near street level. Midday solar warming triggers convective
                  updrafts, expanding the boundary layer and diluting ground AQI briefly in the early afternoon.
                </p>
              </div>
            </div>
          </div>
  );
}
