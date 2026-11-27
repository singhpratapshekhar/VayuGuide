import React from "react";
import {
  Activity,
  Bot,
  Clock,
  Crosshair,
  Leaf,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wind
} from "lucide-react";

export const NAV_TABS = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "routine", label: "Daily Routine", icon: Clock },
  { id: "indoor", label: "Indoor Hacks", icon: ShieldCheck },
  { id: "swaps", label: "Eco Swaps", icon: Leaf },
  { id: "whatsapp", label: "Community", icon: Users },
  { id: "ai", label: "AI Co-Pilot", icon: Bot }
];

function TabButtonList({ activeTab, setActiveTab, handleTabKeyDown, idPrefix, compact = false }) {
  return NAV_TABS.map((tab) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        type="button"
        role="tab"
        id={`${idPrefix}-${tab.id}`}
        tabIndex={isActive ? 0 : -1}
        aria-selected={isActive}
        aria-controls={`panel-${tab.id}`}
        onClick={() => setActiveTab(tab.id)}
        onKeyDown={(e) => handleTabKeyDown(e, tab.id, idPrefix)}
        className={`flex items-center cursor-pointer whitespace-nowrap transition-all duration-200 rounded-full font-semibold ${
          compact ? "gap-1 px-3 py-1.5 text-[11px]" : "gap-1.5 px-3.5 py-1.5 text-xs"
        } ${
          isActive
            ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.6)]"
            : compact
            ? "text-slate-300 bg-white/5 hover:text-white"
            : "text-slate-300 hover:text-white hover:bg-white/5"
        }`}
      >
        <Icon size={compact ? 12 : 13} aria-hidden="true" />
        <span>{tab.label}</span>
      </button>
    );
  });
}

/**
 * Sticky top navigation bar with accessible desktop & mobile tablists,
 * city selector trigger, and GPS location detection button.
 */
export default function Navbar({
  activeTab,
  setActiveTab,
  handleTabKeyDown,
  city,
  onOpenSearch,
  onDetectGPS,
  loading
}) {
  return (
    <header className="sticky top-0 z-40 px-4 py-3 bg-[#06060C]/75 backdrop-blur-xl border-b border-purple-500/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.6)]">
            <Wind size={20} className="stroke-[2.5]" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg tracking-tight text-white leading-none">
                VayuGuide
              </span>
              <Sparkles size={12} className="text-purple-300" aria-hidden="true" />
            </div>
            <span className="text-[11px] text-slate-300 font-medium tracking-wide">
              Clean Air Co-Pilot
            </span>
          </div>
        </div>

        <nav
          aria-label="Primary navigation"
          role="tablist"
          className="hidden lg:flex items-center gap-1 p-1 bg-[#100E22]/90 border border-purple-500/20 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        >
          <TabButtonList
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleTabKeyDown={handleTabKeyDown}
            idPrefix="tab"
          />
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label={`Select city, currently ${city.name}`}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#141228] hover:bg-[#1B1836] rounded-full text-xs font-semibold text-slate-200 border border-purple-500/25 transition-all shadow-sm hover:border-purple-400/50 cursor-pointer"
          >
            <MapPin size={13} className="text-purple-400" aria-hidden="true" />
            <span className="max-w-28 truncate">{city.name}</span>
            <Search size={12} className="text-slate-300" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onDetectGPS}
            aria-label="Detect GPS Location"
            title="Detect GPS Location"
            className="p-2 bg-[#141228] hover:bg-[#1B1836] rounded-full text-purple-300 border border-purple-500/25 transition-all hover:text-white cursor-pointer"
          >
            <Crosshair size={14} className={loading ? "animate-spin" : ""} aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav
        aria-label="Mobile navigation"
        role="tablist"
        className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-0.5"
      >
        <TabButtonList
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleTabKeyDown={handleTabKeyDown}
          idPrefix="mobile-tab"
          compact
        />
      </nav>
    </header>
  );
}
