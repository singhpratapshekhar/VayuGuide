import React from "react";
import { Check, Sliders } from "lucide-react";
import { COMMUTE_OPTIONS, HOME_OPTIONS } from "../../data/lifestyleData.js";

const VULNERABILITY_FLAGS = [
  { key: "hasKids", label: "School Kids (1.5x dose/kg)" },
  { key: "hasSeniors", label: "Senior Citizens (60+)" },
  { key: "hasAsthma", label: "Asthma / COPD Sensitive" },
  { key: "burnsIncense", label: "Daily Agarbatti / Dhoop" }
];

/**
 * Household Vulnerability & Lifestyle Profiler paired with live Direct Impact summary.
 */
export default function HouseholdProfilerCard({ lifestyle, setLifestyle, metrics }) {
  return (
    <div className="rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 p-5 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-500/15">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-purple-300" aria-hidden="true" />
          <div>
            <h2 className="font-display font-extrabold text-sm md:text-base text-white">
              Tailor to Your Household &amp; Lifestyle
            </h2>
            <p className="text-xs text-slate-300">
              Every routine, indoor hack, and AI recommendation dynamically adapts to these choices
            </p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold self-start sm:self-center">
          -{metrics.exposureDropPct}% Exposure With Your Choices
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block mb-2">
              Household Vulnerability Profile
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Household vulnerability factors">
              {VULNERABILITY_FLAGS.map((item) => {
                const active = Boolean(lifestyle[item.key]);
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setLifestyle({ ...lifestyle, [item.key]: !active })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? "bg-purple-600/30 border-purple-400 text-purple-100 shadow-[0_0_12px_rgba(147,51,234,0.3)]"
                        : "bg-[#131129] border-purple-500/15 text-slate-300 hover:text-white"
                    }`}
                  >
                    {active && <Check size={12} className="text-purple-300" aria-hidden="true" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-[#121026] border border-purple-500/15">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="family-size-slider" className="text-slate-300">
                  Family Members
                </label>
                <strong className="font-mono text-purple-300">{lifestyle.familySize || 4} people</strong>
              </div>
              <input
                id="family-size-slider"
                type="range"
                min="1"
                max="10"
                aria-valuetext={`${lifestyle.familySize || 4} people`}
                value={lifestyle.familySize || 4}
                onChange={(e) => setLifestyle({ ...lifestyle, familySize: Number(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="commute-distance-slider" className="text-slate-300">
                  Daily Commute Distance
                </label>
                <strong className="font-mono text-purple-300">{lifestyle.commuteKm || 12} km/day</strong>
              </div>
              <input
                id="commute-distance-slider"
                type="range"
                min="2"
                max="40"
                step="2"
                aria-valuetext={`${lifestyle.commuteKm || 12} km per day`}
                value={lifestyle.commuteKm || 12}
                onChange={(e) => setLifestyle({ ...lifestyle, commuteKm: Number(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block mb-2">
                Daily Commute Mode
              </span>
              <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Daily commute mode">
                {COMMUTE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={lifestyle.commuteMode === opt.id}
                    onClick={() => setLifestyle({ ...lifestyle, commuteMode: opt.id })}
                    className={`p-2 rounded-xl text-[11px] font-semibold text-left border transition-all cursor-pointer ${
                      lifestyle.commuteMode === opt.id
                        ? "bg-purple-600/30 border-purple-400 text-white"
                        : "bg-[#131129] border-purple-500/15 text-slate-300 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block mb-2">
                Home Type &amp; Kitchen
              </span>
              <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Home type and kitchen style">
                {HOME_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={lifestyle.homeType === opt.id}
                    onClick={() => setLifestyle({ ...lifestyle, homeType: opt.id })}
                    className={`p-2 rounded-xl text-[11px] font-semibold text-left border transition-all cursor-pointer ${
                      lifestyle.homeType === opt.id
                        ? "bg-purple-600/30 border-purple-400 text-white"
                        : "bg-[#131129] border-purple-500/15 text-slate-300 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  aria-pressed={lifestyle.cookingStyle === "induction_chimney"}
                  onClick={() =>
                    setLifestyle({
                      ...lifestyle,
                      cookingStyle:
                        lifestyle.cookingStyle === "gas_tadka" ? "induction_chimney" : "gas_tadka"
                    })
                  }
                  className={`p-2 rounded-xl text-[11px] font-semibold text-left border transition-all cursor-pointer ${
                    lifestyle.cookingStyle === "induction_chimney"
                      ? "bg-emerald-600/25 border-emerald-400/60 text-emerald-200"
                      : "bg-[#131129] border-purple-500/15 text-slate-300 hover:text-white"
                  }`}
                >
                  {lifestyle.cookingStyle === "gas_tadka" ? "Gas + High Tadka" : "Chimney / Induction"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 p-4 rounded-2xl bg-[#121028] border border-purple-500/25 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300 font-bold block">
              Direct Impact ({lifestyle.familySize || 4}-Member Household)
            </span>
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/25">
                <span className="text-[11px] text-red-300 block">Unprotected Daily</span>
                <span className="font-mono font-black text-xl text-red-300">
                  {metrics.baselineDailyPM25} <span className="text-[11px] font-normal">µg/m³</span>
                </span>
                <span className="text-[11px] text-slate-300 block">
                  {metrics.baselineCigarettes} cigs eq/day
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                <span className="text-[11px] text-emerald-300 block">Protected With Plan</span>
                <span className="font-mono font-black text-xl text-emerald-300">
                  {metrics.protectedDailyPM25} <span className="text-[11px] font-normal">µg/m³</span>
                </span>
                <span className="text-[11px] text-slate-300 block">
                  {metrics.protectedCigarettes} cigs eq/day
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0A18] border border-purple-500/15 text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300">Family PM2.5 Avoided:</span>
              <span className="font-mono font-bold text-emerald-300">
                {metrics.familyPm25AvoidedMgDay} mg/day ({metrics.winterFamilyPm25Grams} g/winter)
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300">CO₂ Cut via Eco Swaps:</span>
              <span className="font-mono font-bold text-purple-300">
                {metrics.totalCo2SavedMonth} kg/mo ({metrics.winterCo2SavedKg} kg/winter)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 pt-1 border-t border-purple-500/10">
              Calculated using adult resting tidal volume (12 m³/day), Berkeley Earth equivalence, &amp; 120 winter smog days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
