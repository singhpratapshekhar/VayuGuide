import React from "react";
import { Search, Sparkles } from "lucide-react";
import { POPULAR_CITIES } from "../data/cities.js";

/**
 * Hero Banner with app headline and quick popular city switcher pills.
 */
export default function HeroBanner({ city, setCity, onOpenSearch }) {
  return (
    <section className="relative pt-7 pb-5 px-4 text-center max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-4 backdrop-blur-md shadow-[0_0_20px_rgba(147,51,234,0.2)]">
        <Sparkles size={13} className="text-purple-400" aria-hidden="true" />
        <span>GenAI Smog Navigation • Location &amp; Lifestyle Tailored</span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
        Navigate Winter Smog With <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
          Precision Air Intelligence
        </span>
      </h1>

      <p className="mt-3 text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
        Low-emission daily routines, frugal indoor air hacks, and sustainable community swaps tailored
        to your city and family lifestyle — with transparent health &amp; emission impact.
      </p>

      <div
        className="mt-5 flex items-center justify-center gap-1.5 flex-wrap"
        role="group"
        aria-label="Quick city selector"
      >
        {POPULAR_CITIES.slice(0, 6).map((c) => {
          const isSelected = city.name === c.name;
          return (
            <button
              key={c.name}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setCity(c)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.7)] border border-purple-400"
                  : "bg-[#111024] text-slate-300 hover:text-white hover:bg-[#191836] border border-purple-500/15"
              }`}
            >
              {c.name}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onOpenSearch}
          className="px-3 py-1 rounded-full text-xs font-semibold bg-[#111024] text-purple-300 hover:text-purple-200 hover:bg-[#191836] border border-purple-500/25 flex items-center gap-1"
        >
          <Search size={11} aria-hidden="true" />
          <span>More Cities</span>
        </button>
      </div>
    </section>
  );
}
