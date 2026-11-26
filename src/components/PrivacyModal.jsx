import React, { useEffect, useRef } from "react";
import { ShieldCheck, Trash2, X } from "lucide-react";

/**
 * Privacy Policy, AI Data Disclosure, and User Data Deletion modal.
 */
export default function PrivacyModal({ isOpen, onClose, onClearAllData }) {
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const timer = setTimeout(() => closeBtnRef.current?.focus(), 20);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

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
        aria-labelledby="privacy-modal-title"
        className="w-full max-w-lg bg-[#0E0D1B] rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-purple-500/30 max-h-[85vh] overflow-y-auto space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/15">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" aria-hidden="true" />
            <h2 id="privacy-modal-title" className="font-display font-extrabold text-base text-white">
              Privacy, Terms &amp; Data Control
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close privacy and data control dialog"
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-200 leading-relaxed">
          <section className="p-3.5 rounded-xl bg-[#141226] border border-purple-500/20 space-y-1">
            <h3 className="font-bold text-purple-300">1. Local Browser Preferences</h3>
            <p>
              Your selected city, household profile, indoor hacks, eco swaps, and routine checklist
              are stored locally in your browser&apos;s <code>localStorage</code> so your setup
              persists across visits. No account or server database is used.
            </p>
          </section>

          <section className="p-3.5 rounded-xl bg-[#141226] border border-purple-500/20 space-y-1">
            <h3 className="font-bold text-purple-300">2. External APIs &amp; AI Processing</h3>
            <p>
              <strong>Air Quality &amp; City Search:</strong> Coordinates or city search queries are
              sent to Open-Meteo (<code>open-meteo.com</code>) to fetch live AQI and hourly forecasts.
            </p>
            <p>
              <strong>Optional Gemini AI:</strong> If you enter a Gemini API key, it is held{" "}
              <strong>in memory only</strong> for the current session (never saved to{" "}
              <code>localStorage</code>) and sent via the <code>x-goog-api-key</code> header to
              Google&apos;s Gemini API with your sanitized city/lifestyle summary. Without a key,
              VayuGuide runs 100% offline.
            </p>
          </section>

          <section className="p-3.5 rounded-xl bg-[#141226] border border-purple-500/20 space-y-1">
            <h3 className="font-bold text-purple-300">3. Health Disclaimer &amp; Contact</h3>
            <p>
              VayuGuide provides educational air-quality guidance and is not a medical device. For
              security or privacy reports, see <code>/.well-known/security.txt</code> or contact{" "}
              <span className="text-purple-300 font-mono">security@vayuguide.local</span>.
            </p>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-purple-500/15">
          <button
            type="button"
            onClick={onClearAllData}
            className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/70 border border-red-500/40 text-red-200 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} aria-hidden="true" />
            <span>Clear All Local Data</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
