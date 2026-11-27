import React, { useState } from "react";
import { Copy, MessageSquare } from "lucide-react";
import { sanitizeText } from "../utils/security.js";

/**
 * Pediatric Commute Lung Deposition Simulator widget.
 */
export function PediatricExposureWidget({ city, airData }) {
  const [age, setAge] = useState(8);
  const [commuteMins, setCommuteMins] = useState(40);
  const [transit, setTransit] = useState("bus");
  const [hasN95, setHasN95] = useState(true);

  const modeFactor = { rickshaw: 1.5, bus: 1.25, metro: 0.65, car: 0.7 }[transit];
  const ageFactor = age <= 10 ? 1.45 : 1.2;
  const maskFactor = hasN95 ? 0.18 : 1.0;
  const inhaledUg = Math.round(
    airData.pm25 * (commuteMins / 60) * 0.55 * modeFactor * ageFactor * maskFactor
  );
  const unmaskedUg = Math.round(
    airData.pm25 * (commuteMins / 60) * 0.55 * modeFactor * ageFactor
  );

  return (
    <div className="p-5 rounded-2xl bg-[#121026] border border-purple-500/25 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white">
            Pediatric Commute Lung Deposition Simulator ({city.name})
          </h3>
          <p className="text-[11px] text-slate-300">
            Adjust child age, transit mode, and N95 seal to see exact commute particulate load
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-right">
          <span className="text-[10px] font-mono text-emerald-300 block">COMMUTE LUNG DOSE</span>
          <span className="font-mono font-black text-lg text-emerald-400">{inhaledUg} µg PM2.5</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="pediatric-age-slider" className="text-slate-200">
              Child Age:
            </label>
            <strong className="font-mono text-purple-300">{age} yrs</strong>
          </div>
          <input
            id="pediatric-age-slider"
            type="range"
            min="3"
            max="16"
            value={age}
            aria-valuetext={`${age} years`}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full accent-purple-500"
          />

          <div className="flex justify-between pt-1">
            <label htmlFor="pediatric-transit-slider" className="text-slate-200">
              Daily School Transit:
            </label>
            <strong className="font-mono text-purple-300">{commuteMins} mins</strong>
          </div>
          <input
            id="pediatric-transit-slider"
            type="range"
            min="10"
            max="120"
            step="5"
            value={commuteMins}
            aria-valuetext={`${commuteMins} minutes`}
            onChange={(e) => setCommuteMins(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>

        <div className="space-y-2.5">
          <span className="text-slate-200 block">Transit Mode:</span>
          <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Child transit mode">
            {[
              { id: "rickshaw", label: "Open Rickshaw" },
              { id: "bus", label: "School Bus" },
              { id: "metro", label: "Metro Rail" },
              { id: "car", label: "AC Car (Recirc)" }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={transit === m.id}
                onClick={() => setTransit(m.id)}
                className={`p-2 rounded-xl border text-[11px] font-semibold ${
                  transit === m.id
                    ? "bg-purple-600/30 border-purple-400 text-white"
                    : "bg-[#181632] border-purple-500/15 text-slate-300"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={hasN95}
              onChange={(e) => setHasN95(e.target.checked)}
              className="accent-purple-600"
            />
            <span className="text-slate-200 font-medium">
              Tight-Seal Child N95 Mask (cuts deposition by 82%: {unmaskedUg} µg → {inhaledUg} µg)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

/**
 * 3-Year Total Cost of Ownership benchmark comparing DIY Box-Fan vs commercial purifiers.
 */
export function PurifierBenchWidget() {
  const options = [
    {
      name: "DIY Box-Fan + HEPA H13",
      upfront: "₹1,800",
      filterYr: "₹650 / yr",
      tco3Yr: "₹3,100",
      cadr: "280 m³/hr",
      verdict: "Best Value (80% Cheaper)"
    },
    {
      name: "Mid-Range Commercial",
      upfront: "₹9,999",
      filterYr: "₹2,400 / yr",
      tco3Yr: "₹14,799",
      cadr: "320 m³/hr",
      verdict: "Quiet Sleep Mode"
    },
    {
      name: "Premium Brand Purifier",
      upfront: "₹26,500",
      filterYr: "₹4,500 / yr",
      tco3Yr: "₹35,500",
      cadr: "380 m³/hr",
      verdict: "App Telemetry Included"
    }
  ];

  return (
    <div className="p-5 rounded-2xl bg-[#121026] border border-purple-500/25 space-y-3">
      <h3 className="text-sm font-bold text-white">3-Year Total Cost of Ownership (TCO) Benchmark</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => (
          <div
            key={opt.name}
            className={`p-4 rounded-xl border space-y-1.5 ${
              opt.name.startsWith("DIY")
                ? "bg-emerald-950/25 border-emerald-500/40"
                : "bg-[#181632] border-purple-500/20"
            }`}
          >
            <span className="text-xs font-bold text-white block">{opt.name}</span>
            <span className="font-mono font-black text-xl text-purple-300 block">{opt.tco3Yr}</span>
            <span className="text-[11px] text-slate-300 block">
              Upfront: {opt.upfront} • Filter: {opt.filterYr}
            </span>
            <span className="text-[11px] text-slate-200 block">CADR: {opt.cadr}</span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 block pt-1">
              {opt.verdict}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 24-Hour Boundary Layer & Inversion Scrubber widget.
 */
export function DiurnalInversionWidget({ airData, safestWindowLabel }) {
  const [slotIdx, setSlotIdx] = useState(0);
  const points = airData.trend.slice(0, 6);
  const current = points[slotIdx] || points[0];
  const ceilingHeight =
    current.time.includes("12") || current.time.includes("3")
      ? 950
      : current.time.includes("9 AM") || current.time.includes("6 PM")
      ? 240
      : 65;

  return (
    <div className="p-5 rounded-2xl bg-[#121026] border border-purple-500/25 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white">24-Hour Boundary Layer &amp; Inversion Scrubber</h3>
          <p className="text-[11px] text-slate-300">
            Scrub across today&apos;s cycle — best cross-ventilation window: {safestWindowLabel}
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 font-mono text-xs text-purple-200">
          {current.time}: {current.aqi} AQI • Lid ~{ceilingHeight}m
        </span>
      </div>

      <label htmlFor="diurnal-inversion-slider" className="sr-only">
        Scrub time of day to inspect inversion ceiling height
      </label>
      <input
        id="diurnal-inversion-slider"
        type="range"
        min="0"
        max={Math.max(0, points.length - 1)}
        value={slotIdx}
        aria-valuetext={`${current.time}, ${current.aqi} AQI`}
        onChange={(e) => setSlotIdx(Number(e.target.value))}
        className="w-full accent-purple-500 cursor-pointer"
      />

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-[#181632] border border-purple-500/15">
          <span className="text-[10px] text-slate-300 block">Inversion Ceiling</span>
          <strong className="font-mono text-white">{ceilingHeight} meters</strong>
        </div>
        <div className="p-3 rounded-xl bg-[#181632] border border-purple-500/15">
          <span className="text-[10px] text-slate-300 block">Projected PM2.5</span>
          <strong className="font-mono text-white">{current.pm25} µg/m³</strong>
        </div>
        <div className="p-3 rounded-xl bg-[#181632] border border-purple-500/15">
          <span className="text-[10px] text-slate-300 block">Window Advice</span>
          <strong className="text-emerald-400">
            {ceilingHeight > 500 ? "Open 20 mins" : "Keep Sealed"}
          </strong>
        </div>
      </div>
    </div>
  );
}

/**
 * Respiratory & Bronchial Precaution Protocol widget.
 */
export function AsthmaRiskWidget({ airData, protectedIndoorAQI }) {
  const pefrDropPct = airData.aqi > 300 ? "18–25%" : airData.aqi > 200 ? "12–17%" : "5–10%";
  return (
    <div className="p-5 rounded-2xl bg-[#121026] border border-purple-500/25 space-y-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white">Respiratory &amp; Bronchial Precaution Protocol</h3>
        <span className="px-2.5 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-200 font-mono font-bold">
          Estimated Outdoor PEFR Dip: {pefrDropPct}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-200">
        <div className="p-3 rounded-xl bg-[#181632] border border-purple-500/15">
          <strong className="text-purple-300 block mb-1">1. Pre-Exposure Buffer</strong>
          Keep prescribed reliever inhaler accessible; stay inside your {protectedIndoorAQI} AQI clean zone during 6–10 AM.
        </div>
        <div className="p-3 rounded-xl bg-[#181632] border border-purple-500/15">
          <strong className="text-purple-300 block mb-1">2. Warm Moisture Shield</strong>
          Use warm saline steam/hydration after outdoor transit to help mucociliary clearance of trapped dust.
        </div>
        <div className="p-3 rounded-xl bg-[#181632] border border-purple-500/15">
          <strong className="text-purple-300 block mb-1">3. Red-Flag Escalation</strong>
          If night cough, wheezing, or SpO₂ &lt;94% persists, consult a physician immediately.
        </div>
      </div>
    </div>
  );
}

/**
 * RWA Society Circular & Resolution Builder widget.
 */
export function RwaResolutionWidget({ city, airData, societyName, setSocietyName, rwaMetrics, onCopy }) {
  const [heaters, setHeaters] = useState(true);
  const [banSweep, setBanSweep] = useState(true);
  const [dgRule, setDgRule] = useState(true);

  const safeSocietyName = sanitizeText(societyName, 80) || "Our Society";
  const circularText = `🌿 *${safeSocietyName} — Emergency Clean-Air Resolution*\nCity: ${city.name} (${airData.aqi} AQI)\n${heaters ? "• Sponsor 800W Guard Heaters (₹150/flat) to eliminate 2.4 kg PM2.5/gate/night from scrap fires.\n" : ""}${banSweep ? "• Ban dry broom sweeping; mandate Geela Pocha twice daily.\n" : ""}${dgRule ? "• Enforce GRAP DG-set & leaf-burning restrictions across society premises.\n" : ""}📊 Collective Impact: *${rwaMetrics.totalPmSavedKgMonth} kg PM2.5* & *${rwaMetrics.co2SavedKgMonth} kg CO₂* prevented/month!`;

  return (
    <div className="p-5 rounded-2xl bg-[#121026] border border-purple-500/25 space-y-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white">RWA Society Circular &amp; Resolution Builder</h3>
          <p className="text-[11px] text-slate-300">
            Customize society directives &amp; copy ready-to-broadcast circular
          </p>
        </div>
        <div>
          <label htmlFor="rwa-widget-society-name" className="sr-only">
            Society Name
          </label>
          <input
            id="rwa-widget-society-name"
            type="text"
            maxLength={80}
            value={societyName}
            onChange={(e) => setSocietyName(sanitizeText(e.target.value, 80))}
            className="px-3 py-1.5 rounded-xl bg-[#181632] border border-purple-500/30 text-white text-xs outline-none focus:border-purple-400"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="RWA resolution directives">
        {[
          { label: "Guard Electric Heaters", val: heaters, set: setHeaters },
          { label: "Ban Dry Sweeping", val: banSweep, set: setBanSweep },
          { label: "DG & Leaf-Fire Ban", val: dgRule, set: setDgRule }
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={item.val}
            onClick={() => item.set(!item.val)}
            className={`px-3 py-1.5 rounded-xl border font-semibold ${
              item.val
                ? "bg-purple-600/30 border-purple-400 text-white"
                : "bg-[#181632] border-purple-500/15 text-slate-300"
            }`}
          >
            {item.val ? "✓ " : ""}
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-[#090815] border border-purple-500/15 font-mono text-[11px] text-slate-200 whitespace-pre-line">
        {circularText}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onCopy(circularText)}
          className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-1.5"
        >
          <Copy size={13} aria-hidden="true" />
          <span>Copy Circular</span>
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(circularText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5"
        >
          <MessageSquare size={13} aria-hidden="true" />
          <span>Share on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
