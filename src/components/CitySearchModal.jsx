import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, Crosshair, RefreshCw, Search, X } from "lucide-react";
import { POPULAR_CITIES } from "../data/cities.js";
import { searchCitiesAPI } from "../services/airQualityApi.js";
import { sanitizeText } from "../utils/security.js";

/**
 * Accessible City Search Modal with dialog semantics, Escape handling, and focus management.
 */
export default function CitySearchModal({ isOpen, onClose, onSelectCity, onDetectGPS }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(focusTimer);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const clean = sanitizeText(query, 80);
    if (!clean || clean.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await searchCitiesAPI(clean);
      if (!cancelled) {
        setResults(res);
        setSearching(false);
      }
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#06060C]/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="city-search-title"
        className="w-full max-w-md bg-[#0E0D1B] rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-purple-500/30 max-h-[85vh] flex flex-col space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/15">
          <div>
            <h2 id="city-search-title" className="font-display font-extrabold text-base text-white">
              Select City
            </h2>
            <p className="text-xs text-slate-300">Live air quality across Indian & global cities</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close city search dialog"
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={onDetectGPS}
          className="w-full py-2.5 px-3 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-purple-500/30 transition-all shadow-[0_0_15px_rgba(147,51,234,0.2)]"
        >
          <Crosshair size={14} className="text-purple-400" aria-hidden="true" />
          <span>Detect Current GPS Location</span>
        </button>

        <div className="relative">
          <label htmlFor="city-search-input" className="sr-only">
            Search for a city
          </label>
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" aria-hidden="true" />
          <input
            ref={inputRef}
            id="city-search-input"
            type="text"
            maxLength={80}
            placeholder="Search any city (e.g. Kanpur, Pune, Jaipur, Patna...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-[#141226] border border-purple-500/25 rounded-xl text-xs font-medium text-white placeholder-slate-400 outline-none focus:border-purple-400 transition-colors"
          />
          {searching && (
            <div className="absolute right-3.5 top-3" aria-live="polite" aria-label="Searching cities">
              <RefreshCw size={13} className="animate-spin text-purple-400" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="overflow-y-auto space-y-1 flex-1 max-h-60 pr-1">
          {results.length > 0 ? (
            results.map((c, i) => (
              <button
                key={`${c.name}-${c.lat}-${c.lon}-${i}`}
                type="button"
                onClick={() => onSelectCity(c)}
                className="w-full p-2.5 rounded-xl text-left hover:bg-[#181630] flex items-center justify-between text-xs transition-colors border border-transparent hover:border-purple-500/20"
              >
                <div>
                  <span className="font-bold text-white block">{c.name}</span>
                  <span className="text-[11px] text-slate-300">
                    {c.state ? `${c.state}, ` : ""}
                    {c.country}
                  </span>
                </div>
                <ChevronRight size={14} className="text-purple-400" aria-hidden="true" />
              </button>
            ))
          ) : query.trim().length >= 2 && !searching ? (
            <p className="text-xs text-slate-300 text-center py-4" role="status">
              No cities found matching &ldquo;{sanitizeText(query, 40)}&rdquo;.
            </p>
          ) : (
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-2 px-1 block">
                Popular Cities
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => onSelectCity(c)}
                    className="p-2.5 rounded-xl bg-[#141226] hover:bg-[#1B1834] text-left transition-colors border border-purple-500/15 hover:border-purple-500/30"
                  >
                    <span className="font-bold text-xs text-slate-100 block truncate">{c.name}</span>
                    <span className="text-[10px] text-slate-300 block truncate">{c.state}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
