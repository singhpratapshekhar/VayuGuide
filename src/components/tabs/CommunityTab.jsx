import React from "react";
import { CheckCircle2, Copy, MessageSquare } from "lucide-react";
import { buildWhatsAppBroadcasts } from "../../utils/metrics.js";
import { sanitizeText } from "../../utils/security.js";

const RWA_PLEDGE_ITEMS = [
  { key: "guardHeaters", label: "Guard Electric Heaters" },
  { key: "dampMopping", label: "Corridor Geela Pocha" },
  { key: "noLeafBurning", label: "Ban Leaf/Trash Fires" },
  { key: "noIdling", label: "No-Idling Gate Zone" }
];

/**
 * Community Hub, RWA Collective Impact Calculator & WhatsApp Broadcasts Tab.
 */
export default function CommunityTab({
  city,
  effectiveAirData,
  aqiCategory,
  safestWindowLabel,
  metrics,
  societyName,
  setSocietyName,
  flatCount,
  setFlatCount,
  rwaPledges,
  setRwaPledges,
  rwaMetrics,
  copiedKey,
  copyToClipboard
}) {
  const broadcasts = buildWhatsAppBroadcasts({
    societyName,
    flatCount,
    city,
    effectiveAirData,
    aqiCategory,
    rwaPledges,
    rwaMetrics,
    metrics,
    safestWindowLabel
  });

  return (
    <div id="panel-whatsapp" role="tabpanel" aria-labelledby="tab-whatsapp" className="space-y-6 animate-fadeIn">
      <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-purple-500/15">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300 font-bold">
              Neighborhood Multiplier Engine
            </span>
            <h2 className="font-display font-extrabold text-lg text-white mt-0.5">
              Community &amp; RWA Collective Impact Calculator
            </h2>
            <p className="text-xs text-slate-300">
              See how mobilizing your apartment society multiplies individual clean-air choices
            </p>
          </div>
          <div>
            <label htmlFor="community-society-name" className="sr-only">
              Society or RWA Name
            </label>
            <input
              id="community-society-name"
              type="text"
              maxLength={80}
              value={societyName}
              onChange={(e) => setSocietyName(sanitizeText(e.target.value, 80))}
              placeholder="Enter Society / RWA Name"
              className="text-xs px-3.5 py-2 bg-[#131129] border border-purple-500/30 rounded-xl text-white placeholder-slate-400 outline-none focus:border-purple-400 w-full md:w-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <label htmlFor="community-flats-slider" className="text-slate-200 font-semibold">
                  Participating Households / Flats
                </label>
                <span className="font-mono font-black text-purple-300 text-sm">
                  {flatCount} Flats (~{rwaMetrics.gates} Gate{rwaMetrics.gates > 1 ? "s" : ""})
                </span>
              </div>
              <input
                id="community-flats-slider"
                type="range"
                min="1"
                max="200"
                aria-valuetext={`${flatCount} flats`}
                value={flatCount}
                onChange={(e) => setFlatCount(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2" role="group" aria-label="RWA society pledges">
              {RWA_PLEDGE_ITEMS.map((pledge) => {
                const active = !!rwaPledges[pledge.key];
                return (
                  <button
                    key={pledge.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setRwaPledges((prev) => ({ ...prev, [pledge.key]: !prev[pledge.key] }))
                    }
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      active
                        ? "bg-purple-600/25 border-purple-400 text-white"
                        : "bg-[#121026] border-purple-500/15 text-slate-300"
                    }`}
                  >
                    <CheckCircle2
                      size={14}
                      aria-hidden="true"
                      className={active ? "text-emerald-400 shrink-0" : "text-slate-400 shrink-0"}
                    />
                    <span>{pledge.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
              <span className="text-[11px] font-mono text-emerald-300 uppercase block">
                PM2.5 Emissions Prevented
              </span>
              <span className="font-mono font-black text-2xl text-emerald-300 block my-1">
                {rwaMetrics.totalPmSavedKgMonth} kg
              </span>
              <span className="text-xs text-slate-300">per winter month</span>
            </div>
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30">
              <span className="text-[11px] font-mono text-purple-300 uppercase block">
                CO₂ Emissions Avoided
              </span>
              <span className="font-mono font-black text-2xl text-purple-200 block my-1">
                {rwaMetrics.co2SavedKgMonth} kg
              </span>
              <span className="text-xs text-slate-300">collective monthly cut</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#121026] border border-purple-500/20">
              <span className="text-[11px] font-mono text-slate-300 uppercase block">
                Clean-Air Person-Days
              </span>
              <span className="font-mono font-black text-2xl text-white block my-1">
                {rwaMetrics.cleanAirPersonDays.toLocaleString()}
              </span>
              <span className="text-xs text-slate-300">safer breathing days/mo</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#121026] border border-purple-500/20">
              <span className="text-[11px] font-mono text-slate-300 uppercase block">
                Clinic Visits Averted
              </span>
              <span className="font-mono font-black text-2xl text-amber-300 block my-1">
                ~{rwaMetrics.doctorVisitsAverted}
              </span>
              <span className="text-xs text-slate-300">pediatric/senior episodes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-5">
        <div>
          <h2 className="font-display font-extrabold text-lg text-white">
            1-Tap WhatsApp Society &amp; Family Broadcasts
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Auto-populated with {societyName}, {city.name} AQI ({effectiveAirData.aqi}), and your calculated community impact
          </p>
        </div>

        <div className="space-y-4">
          {broadcasts.map((item) => (
            <div
              key={item.id}
              className="p-4 md:p-5 rounded-2xl bg-[#121026] border border-purple-500/20 space-y-3"
            >
              <div>
                <h3 className="text-xs font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-300">{item.purpose}</p>
              </div>

              <div className="p-3.5 bg-[#090815] rounded-xl border border-purple-500/15 text-xs font-mono text-slate-200 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                {item.text}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.id, item.text)}
                  className="flex-1 py-2 px-3 bg-[#1A1838] hover:bg-[#25234E] text-slate-100 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-purple-500/20 cursor-pointer"
                >
                  {copiedKey === item.id ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-400" aria-hidden="true" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} aria-hidden="true" />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(item.text)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,211,102,0.4)] cursor-pointer"
                >
                  <MessageSquare size={13} aria-hidden="true" />
                  <span>Send on WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
