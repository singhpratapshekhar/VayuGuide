import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Bot,
  Calculator,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Crosshair,
  Flame,
  Leaf,
  MapPin,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sliders,
  Sparkles,
  Stethoscope,
  Sun,
  Users,
  Wind,
  Wrench,
  X
} from "lucide-react";
import { POPULAR_CITIES, inferLocationProfile } from "./data/cities.js";
import {
  COMMUTE_OPTIONS,
  DEFAULT_LIFESTYLE,
  ECO_SWAPS_DATA,
  HOME_OPTIONS,
  INDOOR_HACKS_DATA
} from "./data/lifestyleData.js";
import { getAQICategory } from "./utils/aqi.js";
import {
  buildDailyRoutineBlocks,
  computePersonalMetrics,
  computeRwaMetrics
} from "./utils/metrics.js";
import {
  clearAllStored,
  loadStored,
  sanitizeErrorMessage,
  sanitizeText,
  saveStored,
  validateCoordinates
} from "./utils/security.js";
import { fetchLiveAirQuality } from "./services/airQualityApi.js";
import {
  MAX_CHAT_INPUT_LENGTH,
  buildOfflineAtmosphericReply,
  callGeminiModels
} from "./services/geminiApi.js";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import CitySearchModal from "./components/CitySearchModal.jsx";
import PrivacyModal from "./components/PrivacyModal.jsx";
import {
  AsthmaRiskWidget,
  DiurnalInversionWidget,
  PediatricExposureWidget,
  PurifierBenchWidget,
  RwaResolutionWidget
} from "./components/GenUIWidgets.jsx";

const TAB_IDS = ["dashboard", "routine", "indoor", "swaps", "whatsapp", "ai"];

function VayuGuideApp() {
  const [city, setCity] = useState(() =>
    loadStored("vg_selected_city", POPULAR_CITIES[0], (c) =>
      Boolean(c && typeof c.name === "string" && validateCoordinates(c.lat, c.lon).valid)
    )
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 3200);
  };

  const handleTabKeyDown = (e, currentId) => {
    const idx = TAB_IDS.indexOf(currentId);
    if (idx === -1) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = TAB_IDS[(idx + 1) % TAB_IDS.length];
      setActiveTab(next);
      document.getElementById(`tab-${next}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = TAB_IDS[(idx - 1 + TAB_IDS.length) % TAB_IDS.length];
      setActiveTab(prev);
      document.getElementById(`tab-${prev}`)?.focus();
    }
  };

  const [lifestyle, setLifestyle] = useState(() =>
    loadStored("vg_lifestyle_profile", DEFAULT_LIFESTYLE)
  );

  const [airData, setAirData] = useState({
    aqi: 285,
    pm25: 165,
    pm10: 220,
    no2: 48,
    so2: 18,
    o3: 38,
    co: 520,
    updatedAt: "Just now",
    trend: [
      { time: "6 AM", aqi: 310, pm25: 190 },
      { time: "9 AM", aqi: 260, pm25: 150 },
      { time: "12 PM", aqi: 165, pm25: 90 },
      { time: "3 PM", aqi: 140, pm25: 75 },
      { time: "6 PM", aqi: 210, pm25: 125 },
      { time: "9 PM", aqi: 275, pm25: 160 }
    ]
  });

  const [indoorActions, setIndoorActions] = useState(() =>
    loadStored("vg_indoor_actions", {
      doorTape: true,
      wetMop: true,
      hepaFilter: false,
      kitchenExhaust: true,
      zeroSmokePrayer: false,
      plantCarbon: false
    })
  );

  const [adoptedSwaps, setAdoptedSwaps] = useState(() =>
    loadStored("vg_adopted_swaps", ["wet_pocha", "cooking_induction"], Array.isArray)
  );

  const [routineCompleted, setRoutineCompleted] = useState(() =>
    loadStored("vg_routine_completed", {
      morning_lockdown: true,
      solar_ventilation: true
    })
  );

  const [showDiyGuide, setShowDiyGuide] = useState(false);
  const [roomSqFt, setRoomSqFt] = useState(() =>
    loadStored("vg_room_sqft", 150, (v) => typeof v === "number" && v >= 60 && v <= 1000)
  );

  const [isSimulatingAQI, setIsSimulatingAQI] = useState(false);
  const [simulatedAQI, setSimulatedAQI] = useState(320);

  const [societyName, setSocietyName] = useState(() =>
    loadStored("vg_society_name", "Greenwood Residency RWA", (v) => typeof v === "string")
  );
  const [flatCount, setFlatCount] = useState(() =>
    loadStored("vg_flat_count", 60, (v) => typeof v === "number" && v >= 1 && v <= 500)
  );
  const [rwaPledges, setRwaPledges] = useState(() =>
    loadStored("vg_rwa_pledges", {
      guardHeaters: true,
      dampMopping: true,
      noLeafBurning: true,
      noIdling: false
    })
  );

  useEffect(() => { saveStored("vg_selected_city", city); }, [city]);
  useEffect(() => { saveStored("vg_lifestyle_profile", lifestyle); }, [lifestyle]);
  useEffect(() => { saveStored("vg_indoor_actions", indoorActions); }, [indoorActions]);
  useEffect(() => { saveStored("vg_adopted_swaps", adoptedSwaps); }, [adoptedSwaps]);
  useEffect(() => { saveStored("vg_routine_completed", routineCompleted); }, [routineCompleted]);
  useEffect(() => { saveStored("vg_room_sqft", roomSqFt); }, [roomSqFt]);
  useEffect(() => { saveStored("vg_society_name", societyName); }, [societyName]);
  useEffect(() => { saveStored("vg_flat_count", flatCount); }, [flatCount]);
  useEffect(() => { saveStored("vg_rwa_pledges", rwaPledges); }, [rwaPledges]);

  const [copiedKey, setCopiedKey] = useState(null);

  // Session-only in-memory Gemini API key (never persisted to localStorage)
  const [apiKey, setApiKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Namaste! I am your VayuGuide Atmospheric Co-Pilot. I've tailored today's analysis for ${POPULAR_CITIES[0].name} and your household profile. Ask me for low-emission daily routines, indoor air hacks, or click a GenUI Synthesizer tool below!`
    }
  ]);
  const [promptInput, setPromptInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [activeGenWidget, setActiveGenWidget] = useState("pediatric");
  const [showGenSpec, setShowGenSpec] = useState(false);
  const [customAiPlan, setCustomAiPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  const loadCityData = async (targetCity) => {
    setLoading(true);
    try {
      const data = await fetchLiveAirQuality(targetCity.lat, targetCity.lon);
      setAirData(data);
    } catch (err) {
      showToast(`Live telemetry unavailable (${sanitizeErrorMessage(err)}); showing cached baseline.`);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCityData(city);
  }, [city]);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = validateCoordinates(pos.coords.latitude, pos.coords.longitude);
        if (!coords.valid) {
          showToast("Received invalid GPS coordinates.");
          setLoading(false);
          return;
        }
        const gpsCity = {
          name: "My GPS Location",
          state: "Detected Coordinates",
          lat: coords.lat,
          lon: coords.lon
        };
        setCity(gpsCity);
        await loadCityData(gpsCity);
        showToast("Synced air quality to your live GPS coordinates.");
      },
      () => {
        showToast("Enable browser location permissions to detect local air quality.");
        setLoading(false);
      }
    );
  };

  const handleClearAllData = () => {
    clearAllStored("vg_");
    setCity(POPULAR_CITIES[0]);
    setLifestyle(DEFAULT_LIFESTYLE);
    setIndoorActions({
      doorTape: true,
      wetMop: true,
      hepaFilter: false,
      kitchenExhaust: true,
      zeroSmokePrayer: false,
      plantCarbon: false
    });
    setAdoptedSwaps(["wet_pocha", "cooking_induction"]);
    setRoutineCompleted({ morning_lockdown: true, solar_ventilation: true });
    setRoomSqFt(150);
    setSocietyName("Greenwood Residency RWA");
    setFlatCount(60);
    setApiKey("");
    setIsPrivacyOpen(false);
    showToast("Cleared all saved local preferences and session keys.");
  };

  const effectiveAirData = useMemo(() => {
    if (!isSimulatingAQI) return airData;
    const ratio = simulatedAQI / Math.max(1, airData.aqi);
    return {
      ...airData,
      aqi: simulatedAQI,
      pm25: Math.round(simulatedAQI * 0.58),
      pm10: Math.round(simulatedAQI * 0.82),
      trend: airData.trend.map((p) => ({
        ...p,
        aqi: Math.min(500, Math.max(25, Math.round(p.aqi * ratio))),
        pm25: Math.min(350, Math.max(12, Math.round(p.pm25 * ratio)))
      }))
    };
  }, [airData, isSimulatingAQI, simulatedAQI]);

  const locationProfile = useMemo(
    () => inferLocationProfile(city, effectiveAirData),
    [city, effectiveAirData]
  );
  const aqiCategory = useMemo(() => getAQICategory(effectiveAirData.aqi), [effectiveAirData.aqi]);

  const metrics = useMemo(
    () =>
      computePersonalMetrics(
        effectiveAirData,
        lifestyle,
        indoorActions,
        adoptedSwaps,
        routineCompleted
      ),
    [effectiveAirData, lifestyle, indoorActions, adoptedSwaps, routineCompleted]
  );

  const indoorCategory = useMemo(
    () => getAQICategory(metrics.protectedIndoorAQI),
    [metrics.protectedIndoorAQI]
  );

  const peakPoint = useMemo(
    () =>
      effectiveAirData.trend.reduce(
        (max, p) => (p.aqi > max.aqi ? p : max),
        effectiveAirData.trend[0] || { time: "6 AM", aqi: effectiveAirData.aqi }
      ),
    [effectiveAirData.trend, effectiveAirData.aqi]
  );

  const safestPoint = useMemo(
    () =>
      effectiveAirData.trend.reduce(
        (min, p) => (p.aqi < min.aqi ? p : min),
        effectiveAirData.trend[0] || { time: "12 PM", aqi: effectiveAirData.aqi }
      ),
    [effectiveAirData.trend, effectiveAirData.aqi]
  );

  const safestWindowLabel = useMemo(() => {
    const t = (safestPoint?.time || "").toLowerCase();
    if (t.includes("12 pm") || t.includes("3 pm")) {
      return "12:30 PM – 3:00 PM";
    }
    return `${safestPoint?.time || "1:00 PM"} Window`;
  }, [safestPoint]);

  const routineBlocks = useMemo(
    () => buildDailyRoutineBlocks(city, effectiveAirData, lifestyle, safestWindowLabel),
    [city, effectiveAirData, lifestyle, safestWindowLabel]
  );

  const completedRoutineCount = routineBlocks.filter((b) => routineCompleted[b.id]).length;

  const roomAchStats = useMemo(() => {
    const volumeM3 = Math.max(15, Math.round(roomSqFt * 0.0929 * 2.74));
    const ach = +(280 / volumeM3).toFixed(1);
    const cleanCycleMins = Math.max(8, Math.round((volumeM3 / 280) * 60));
    return { volumeM3, ach, cleanCycleMins };
  }, [roomSqFt]);

  const rwaMetrics = useMemo(
    () =>
      computeRwaMetrics(
        flatCount,
        rwaPledges,
        metrics.totalCo2SavedMonth,
        metrics.exposureDropPct
      ),
    [flatCount, rwaPledges, metrics.totalCo2SavedMonth, metrics.exposureDropPct]
  );

  const copyToClipboard = (key, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    showToast("Copied message to clipboard!");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const toggleEcoSwap = (id) => {
    setAdoptedSwaps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSendMessage = async (textToSend) => {
    const userMsg = sanitizeText(textToSend || promptInput, MAX_CHAT_INPUT_LENGTH);
    if (!userMsg) return;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setPromptInput("");
    setAiLoading(true);

    const lower = userMsg.toLowerCase();
    if (lower.includes("child") || lower.includes("kid") || lower.includes("pediatric") || lower.includes("school")) {
      setActiveGenWidget("pediatric");
    } else if (lower.includes("purifier") || lower.includes("diy") || lower.includes("tco") || lower.includes("cost")) {
      setActiveGenWidget("purifier");
    } else if (lower.includes("window") || lower.includes("ventilat") || lower.includes("inversion") || lower.includes("time")) {
      setActiveGenWidget("diurnal");
    } else if (lower.includes("asthma") || lower.includes("breath") || lower.includes("wheez") || lower.includes("senior")) {
      setActiveGenWidget("asthma");
    } else if (lower.includes("society") || lower.includes("rwa") || lower.includes("guard") || lower.includes("community")) {
      setActiveGenWidget("rwa");
    }

    const activeHackNames =
      INDOOR_HACKS_DATA.filter((h) => indoorActions[h.key])
        .map((h) => h.key)
        .join(", ") || "none";
    const activeSwapNames =
      ECO_SWAPS_DATA.filter((s) => adoptedSwaps.includes(s.id))
        .map((s) => s.category)
        .join(", ") || "none";
    const recentHistory = messages
      .slice(-4)
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${sanitizeText(m.text, 240)}`)
      .join("\n");

    const safeSociety = sanitizeText(societyName, 80);
    const contextSummary = `City: ${city.name} (${locationProfile.smogDrivers}). AQI: ${effectiveAirData.aqi} (${aqiCategory.status}, ${aqiCategory.grap}), PM2.5: ${effectiveAirData.pm25} µg/m³ (${metrics.outdoorCigarettes} cigarettes eq/day). Safest Window: ${safestWindowLabel}. Family Size: ${lifestyle.familySize}, Kids=${lifestyle.hasKids}, Seniors=${lifestyle.hasSeniors}, Asthma=${lifestyle.hasAsthma}, Commute=${metrics.commuteObj.label} (${lifestyle.commuteKm} km/day), Home=${metrics.homeObj.label}, Cooking=${lifestyle.cookingStyle}, Incense=${lifestyle.burnsIncense}. Active Indoor Hacks: ${activeHackNames}. Adopted Eco Swaps: ${activeSwapNames}. Room: ${roomSqFt} sq ft (${roomAchStats.ach} ACH). Protected Indoor AQI: ${metrics.protectedIndoorAQI} (saving ${metrics.familyPm25AvoidedMgDay} mg PM2.5/family/day, ${metrics.exposureDropPct}% exposure, ${metrics.totalCo2SavedMonth} kg CO₂/mo). RWA: ${safeSociety} (${flatCount} flats, ${rwaMetrics.totalPmSavedKgMonth} kg PM2.5/mo saved).`;

    try {
      if (apiKey.trim()) {
        const result = await callGeminiModels(apiKey, contextSummary, recentHistory, userMsg);
        if (result.text) {
          setMessages((prev) => [
            ...prev,
            { role: "ai", text: result.text, source: `Gemini (${result.model})` }
          ]);
          setAiLoading(false);
          return;
        }
        if (result.rateLimited) {
          showToast("AI rate limit reached; using offline Atmospheric Engine.");
        } else if (result.errorStatus) {
          showToast(`Gemini API returned HTTP ${result.errorStatus}; using offline Atmospheric Engine.`);
        }
      }

      setTimeout(() => {
        const advice = buildOfflineAtmosphericReply({
          userMsg,
          city,
          effectiveAirData,
          aqiCategory,
          metrics,
          lifestyle,
          adoptedSwaps,
          safestWindowLabel,
          safestPoint,
          peakPoint,
          roomSqFt,
          roomAchStats,
          societyName: safeSociety,
          flatCount,
          rwaMetrics
        });
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: advice, source: "VayuGuide Atmospheric Engine" }
        ]);
        setAiLoading(false);
      }, 250);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Unable to reach the AI cloud right now. Switching to offline atmospheric guidance.",
          source: "VayuGuide Atmospheric Engine"
        }
      ]);
      setAiLoading(false);
    }
  };

  const handleGenerateCustomPlan = async () => {
    setPlanLoading(true);
    const safeSociety = sanitizeText(societyName, 80);
    const localPlan = {
      headline: `${city.name} Action Plan (${effectiveAirData.aqi} AQI • ${lifestyle.familySize}-Member Household)`,
      routine: `${routineBlocks[0].time}: ${routineBlocks[0].action} | ${safestWindowLabel}: 20-min cross-ventilation flush`,
      indoorHack: `Apply EVA door tape + damp pocha + run HEPA/DIY Box-Fan in ${roomSqFt} sq ft bedroom (${roomAchStats.ach} ACH) to drop indoor AQI from ~${metrics.unshieldedIndoorAQI} to ~${metrics.protectedIndoorAQI}.`,
      ecoSwap: `${lifestyle.commuteMode === "two_wheeler" || lifestyle.commuteMode === "auto_bus" ? `Shift ${lifestyle.commuteKm} km transit to Metro/carpool` : "Keep cabin recirculation ON"} + pre-drafted kitchen chimney + guard electric heaters at ${safeSociety}.`,
      directImpact: `Avoids ${metrics.familyPm25AvoidedMgDay} mg PM2.5/day (${metrics.winterFamilyPm25Grams} g/winter) for your family and cuts ${metrics.totalCo2SavedMonth} kg CO₂/month.`,
      source: "VayuGuide Atmospheric Engine"
    };

    if (apiKey.trim()) {
      try {
        const jsonQuery = `Return ONLY raw JSON (no markdown) with keys: headline, routine, indoorHack, ecoSwap, directImpact. Tailor for City=${city.name}, AQI=${effectiveAirData.aqi} (${aqiCategory.grap}), FamilySize=${lifestyle.familySize}, Kids=${lifestyle.hasKids}, Seniors=${lifestyle.hasSeniors}, Asthma=${lifestyle.hasAsthma}, Commute=${metrics.commuteObj.label} (${lifestyle.commuteKm}km), Home=${metrics.homeObj.label}, Room=${roomSqFt}sqft (${roomAchStats.ach} ACH), ProtectedIndoorAQI=${metrics.protectedIndoorAQI}, FamilyPM25Avoided=${metrics.familyPm25AvoidedMgDay}mg/day, CO2Saved=${metrics.totalCo2SavedMonth}kg/mo.`;
        const result = await callGeminiModels(apiKey, "", "", jsonQuery);
        if (result.text) {
          const cleaned = result.text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          if (parsed && typeof parsed.routine === "string" && typeof parsed.indoorHack === "string") {
            setCustomAiPlan({
              ...localPlan,
              headline: sanitizeText(parsed.headline || localPlan.headline, 180),
              routine: sanitizeText(parsed.routine, 350),
              indoorHack: sanitizeText(parsed.indoorHack, 350),
              ecoSwap: sanitizeText(parsed.ecoSwap || localPlan.ecoSwap, 350),
              directImpact: sanitizeText(parsed.directImpact || localPlan.directImpact, 350),
              source: `Gemini (${result.model}) Live`
            });
            setPlanLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to localPlan below
      }
    }

    setTimeout(() => {
      setCustomAiPlan(localPlan);
      setPlanLoading(false);
    }, 250);
  };

  const askAiWithTopic = (topic) => {
    setActiveTab("ai");
    handleSendMessage(topic);
  };

  return (
    <div className="min-h-screen bg-[#06060C] text-slate-100 font-sans selection:bg-purple-600 selection:text-white pb-20 relative">
      {/* Inline Toast Notification */}
      {toastMsg && (
        <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-2xl bg-[#15132B]/95 border border-purple-400/40 text-xs font-semibold text-purple-100 shadow-[0_10px_30px_rgba(139,92,246,0.4)] flex items-center gap-2 backdrop-blur-xl">
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ====================================================================
          STICKY TOP NAVBAR (QUANTIX-STYLE FLOATING GLASS PILL)
         ==================================================================== */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-purple-600 focus:text-white focus:text-xs focus:font-bold">Skip to main content</a>
      <header className="sticky top-0 z-40 px-4 py-3 bg-[#06060C]/75 backdrop-blur-xl border-b border-purple-500/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Mark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.6)]">
              <Wind size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-lg tracking-tight text-white leading-none">
                  VayuGuide
                </span>
                <span className="text-purple-400 text-xs">✦</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Clean Air Co-Pilot
              </span>
            </div>
          </div>

          {/* Desktop Center Pill Navigation */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1 p-1 bg-[#100E22]/90 border border-purple-500/20 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)]" role="tablist">
            {[
              { id: "dashboard", label: "Dashboard", icon: Activity },
              { id: "routine", label: "Daily Routine", icon: Clock },
              { id: "indoor", label: "Indoor Hacks", icon: ShieldCheck },
              { id: "swaps", label: "Eco Swaps", icon: Leaf },
              { id: "whatsapp", label: "Community", icon: Users },
              { id: "ai", label: "AI Co-Pilot", icon: Bot }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.6)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: City Selector Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label={`Select city, currently ${city.name}`}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#141228] hover:bg-[#1B1836] rounded-full text-xs font-semibold text-slate-200 border border-purple-500/25 transition-all shadow-sm hover:border-purple-400/50"
            >
              <MapPin size={13} className="text-purple-400" />
              <span className="max-w-28 truncate">{city.name}</span>
              <Search size={12} className="text-slate-400" />
            </button>

            <button
              onClick={handleDetectGPS}
              aria-label="Detect GPS Location"
              title="Detect GPS Location"
              className="p-2 bg-[#141228] hover:bg-[#1B1836] rounded-full text-purple-400 border border-purple-500/25 transition-all hover:text-white"
            >
              <Crosshair size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Sub-Navigation Bar */}
        <nav aria-label="Mobile navigation" role="tablist" className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
          {[
            { id: "dashboard", label: "Dashboard", icon: Activity },
            { id: "routine", label: "Daily Routine", icon: Clock },
            { id: "indoor", label: "Indoor Hacks", icon: ShieldCheck },
            { id: "swaps", label: "Eco Swaps", icon: Leaf },
            { id: "whatsapp", label: "Community", icon: Users },
            { id: "ai", label: "AI Co-Pilot", icon: Bot }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.6)]"
                    : "text-slate-400 bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* ====================================================================
          HERO BANNER & QUICK CITY SWITCHER
         ==================================================================== */}
      <section className="relative pt-7 pb-5 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-4 backdrop-blur-md shadow-[0_0_20px_rgba(147,51,234,0.2)]">
          <Sparkles size={13} className="text-purple-400" />
          <span>GenAI Smog Navigation • Location & Lifestyle Tailored</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
          Navigate Winter Smog With <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
            Precision Air Intelligence
          </span>
        </h1>

        <p className="mt-3 text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Low-emission daily routines, frugal indoor air hacks, and sustainable community swaps tailored
          to your city and family lifestyle — with transparent health & emission impact.
        </p>

        {/* Quick Popular City Switcher Pills */}
        <div className="mt-5 flex items-center justify-center gap-1.5 flex-wrap">
          {POPULAR_CITIES.slice(0, 6).map((c) => {
            const isSelected = city.name === c.name;
            return (
              <button
                key={c.name}
                onClick={() => setCity(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.7)] border border-purple-400"
                    : "bg-[#111024] text-slate-400 hover:text-white hover:bg-[#191836] border border-purple-500/15"
                }`}
              >
                {c.name}
              </button>
            );
          })}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-[#111024] text-purple-400 hover:text-purple-300 hover:bg-[#191836] border border-purple-500/25 flex items-center gap-1"
          >
            <Search size={11} />
            <span>More Cities</span>
          </button>
        </div>
      </section>

      {/* ====================================================================
          MAIN CONTENT AREA (MAX 5XL)
         ==================================================================== */}
      <main id="main-content" tabIndex={-1} className="max-w-5xl mx-auto px-4 space-y-6 outline-none">
        {/* ==================================================================
            TAB 1: PRIMARY DASHBOARD
           ================================================================== */}
        {activeTab === "dashboard" && (
          <div id="panel-dashboard" role="tabpanel" aria-labelledby="tab-dashboard" className="space-y-6 animate-fadeIn">
            {/* 1. Floating Centerpiece Dashboard Card */}
            <div className="relative rounded-3xl bg-[#0D0C1D]/85 backdrop-blur-2xl border border-purple-500/25 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
              <div
                className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
                style={{ background: aqiCategory.glowColor }}
              />

              {/* Inner Dashboard Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-purple-500/15">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isSimulatingAQI ? "bg-purple-400 animate-pulse" : "bg-emerald-400 animate-ping"
                    }`}
                  />
                  <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                    {isSimulatingAQI ? "SIMULATED SMOG EPISODE" : "LIVE SENSOR TELEMETRY"} — {city.name.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-300 font-mono">
                    ({isSimulatingAQI ? "Scenario Stress Test" : `Updated ${effectiveAirData.updatedAt}`})
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsSimulatingAQI((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      isSimulatingAQI
                        ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(147,51,234,0.5)]"
                        : "bg-[#181630] hover:bg-[#232044] text-purple-300 border-purple-500/20"
                    }`}
                  >
                    <Sliders size={12} />
                    <span>{isSimulatingAQI ? "Exit Simulator" : "Simulate Smog (50-500)"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSimulatingAQI(false);
                      loadCityData(city);
                    }}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181630] hover:bg-[#232044] text-xs font-semibold text-slate-300 border border-purple-500/20 transition-colors"
                  >
                    <RefreshCw size={12} className={loading ? "animate-spin text-purple-400" : ""} />
                    <span>Sync Feed</span>
                  </button>
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181630] hover:bg-[#232044] text-xs font-semibold text-purple-300 border border-purple-500/20 transition-colors"
                  >
                    <MapPin size={12} />
                    <span>Change City</span>
                  </button>
                </div>
              </div>

              {/* Interactive Smog Scenario Simulator Bar (When Enabled) */}
              {isSimulatingAQI && (
                <div className="mt-4 p-4 rounded-2xl bg-purple-950/35 border border-purple-500/35 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-bold text-purple-200">
                      Severe Winter Smog Scenario Slider: {simulatedAQI} AQI ({aqiCategory.grap})
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { label: "Moderate 95", val: 95 },
                        { label: "GRAP I • 180", val: 180 },
                        { label: "GRAP II • 285", val: 285 },
                        { label: "GRAP IV • 450", val: 450 }
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          onClick={() => setSimulatedAQI(preset.val)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            simulatedAQI === preset.val
                              ? "bg-purple-600 border-purple-300 text-white"
                              : "bg-[#141229] border-purple-500/25 text-slate-300 hover:text-white"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="5"
                    aria-label="Simulate smog severity AQI"
                    aria-valuetext={`${simulatedAQI} AQI`}
                    value={simulatedAQI}
                    onChange={(e) => setSimulatedAQI(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Centerpiece Grid: Giant AQI Meter (Left) + Vertical Bar Telemetry (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#15132B] border border-purple-500/30">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: aqiCategory.ringColor }}
                    />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                      {aqiCategory.status}
                    </span>
                    <span className="text-[10px] text-purple-400 font-bold px-1.5 py-0.2 rounded bg-purple-950/80">
                      {aqiCategory.grap}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest block">
                      US-EPA Air Quality Index
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span
                        className="font-mono font-black text-6xl sm:text-7xl md:text-8xl tracking-tighter"
                        style={{
                          color: aqiCategory.ringColor,
                          textShadow: `0 0 35px ${aqiCategory.glowColor}`
                        }}
                      >
                        {effectiveAirData.aqi}
                      </span>
                      <span className="text-sm font-bold text-slate-400 uppercase font-mono">
                        AQI
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {aqiCategory.summary}
                  </p>

                  {/* Berkeley Earth Cigarette Metric Pill (PM2.5 / 22) */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#141229] border border-purple-500/20 text-xs text-slate-300 shadow-inner">
                    <span className="text-2xl">🚬</span>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Berkeley Earth Equivalence ({effectiveAirData.pm25} µg/m³ ÷ 22)
                      </span>
                      <span className="font-medium">
                        Outdoor air = smoking{" "}
                        <strong className="font-mono text-purple-300 text-sm font-bold">
                          {metrics.outdoorCigarettes} cigarettes
                        </strong>{" "}
                        / day
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right 7 Cols: 24h Dispersion Chart */}
                <div className="lg:col-span-7 bg-[#121026]/90 p-5 rounded-2xl border border-purple-500/20 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-500/10 flex-wrap gap-2">
                    <div>
                      <h2 className="font-display font-bold text-sm text-white">
                        24-Hour Smog Dispersion Flow
                      </h2>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Thermal Inversion & Boundary Layer Trajectory
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                      <Sun size={12} />
                      <span>Safest: {safestWindowLabel}</span>
                    </div>
                  </div>

                  <div className="pt-6 pb-2">
                    <div className="grid grid-cols-6 gap-2 sm:gap-3 items-end h-48">
                      {effectiveAirData.trend.slice(0, 6).map((point, index) => {
                        const isPeak = point.aqi === peakPoint.aqi;
                        const isSafe = point.aqi === safestPoint.aqi && !isPeak;
                        const heightPct = Math.min(95, Math.max(22, (point.aqi / 380) * 100));

                        return (
                          <div key={index} className="flex flex-col items-center h-full justify-end group">
                            {isPeak ? (
                              <div className="mb-2 flex flex-col items-center animate-bounce">
                                <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-mono font-bold shadow-[0_0_15px_rgba(168,85,247,0.8)] whitespace-nowrap">
                                  Peak {point.aqi}
                                </span>
                                <div className="w-2 h-2 rounded-full bg-white ring-4 ring-purple-500 shadow-[0_0_10px_white] mt-0.5" />
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {point.aqi}
                              </span>
                            )}

                            <div className="w-full max-w-[42px] bg-[#1A1838] rounded-full overflow-hidden p-1 flex flex-col justify-end h-32 border border-purple-500/15">
                              <div
                                className={`w-full rounded-full transition-all duration-700 ${
                                  isPeak
                                    ? "bg-gradient-to-t from-purple-700 via-purple-500 to-violet-400 shadow-[0_0_20px_rgba(168,85,247,0.7)]"
                                    : isSafe
                                    ? "bg-gradient-to-t from-emerald-800 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                    : "bg-gradient-to-t from-[#2E2856] to-[#4C3F8C]"
                                }`}
                                style={{ height: `${heightPct}%` }}
                              />
                            </div>

                            <span
                              className={`text-[11px] font-mono mt-2 font-semibold ${
                                isPeak
                                  ? "text-purple-300 font-bold"
                                  : isSafe
                                  ? "text-emerald-400 font-bold"
                                  : "text-slate-400"
                              }`}
                            >
                              {point.time}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location-Specific Smog Driver Strip */}
              <div className="mt-6 p-4 rounded-2xl bg-[#131129] border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold block">
                    📍 {city.name} Smog Fingerprint
                  </span>
                  <p className="text-xs text-slate-200 font-medium">{locationProfile.smogDrivers}</p>
                  <p className="text-[11px] text-slate-400">{locationProfile.localTip}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
                  <button
                    onClick={() => setActiveTab("routine")}
                    className="px-3.5 py-2 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-xs font-bold text-purple-200 whitespace-nowrap flex items-center gap-1.5 transition-colors"
                  >
                    <Clock size={13} />
                    <span>Daily Routine</span>
                  </button>
                  <button
                    onClick={() =>
                      askAiWithTopic(
                        `Plan my low-emission daily routine today in ${city.name} at ${effectiveAirData.aqi} AQI`
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white whitespace-nowrap flex items-center gap-1.5 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-colors"
                  >
                    <Bot size={13} />
                    <span>Ask AI Co-Pilot</span>
                  </button>
                </div>
              </div>

              {/* Severe Winter Smog GRAP Playbook Alert (AQI >= 201) */}
              {effectiveAirData.aqi >= 201 && (
                <div className="mt-4 p-4 rounded-2xl bg-red-950/25 border border-red-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-300 block">
                      🚨 {aqiCategory.grap} Family & Community Advisory
                    </span>
                    <p className="text-xs text-slate-200">
                      {effectiveAirData.aqi > 300
                        ? "Emergency protocol: Stop all outdoor exercise, enforce child N95/hybrid school alerts, halt RWA leaf/guard wood fires, and keep HEPA/DIY fan running 24x7."
                        : "Elevated inversion episode: Seal balcony gaps, mandate damp corridor mopping in your RWA, and restrict outdoor transit to tight-seal N95."}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("whatsapp")}
                    className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-xs font-bold text-red-200 whitespace-nowrap self-start sm:self-center"
                  >
                    Alert RWA & Family
                  </button>
                </div>
              )}
            </div>

            {/* 2. Tailored Household & Lifestyle Profile + Direct Impact Card */}
            <div className="rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 p-5 md:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-500/15">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-purple-400" />
                  <div>
                    <h2 className="font-display font-extrabold text-sm md:text-base text-white">
                      Tailor to Your Household & Lifestyle
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Every routine, indoor hack, and AI recommendation dynamically adapts to these choices
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold self-start sm:self-center">
                  -{metrics.exposureDropPct}% Exposure With Your Choices
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left 7 Cols: Lifestyle Selectors */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Household Vulnerability Toggles */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                      Household Vulnerability Profile
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "hasKids", label: "School Kids (1.5x dose/kg)" },
                        { key: "hasSeniors", label: "Senior Citizens (60+)" },
                        { key: "hasAsthma", label: "Asthma / COPD Sensitive" },
                        { key: "burnsIncense", label: "Daily Agarbatti / Dhoop" }
                      ].map((item) => {
                        const active = lifestyle[item.key];
                        return (
                          <button
                            key={item.key}
                            onClick={() => setLifestyle({ ...lifestyle, [item.key]: !active })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              active
                                ? "bg-purple-600/30 border-purple-400 text-purple-100 shadow-[0_0_12px_rgba(147,51,234,0.3)]"
                                : "bg-[#131129] border-purple-500/15 text-slate-400 hover:text-white"
                            }`}
                          >
                            {active ? <Check size={12} className="text-purple-300" /> : null}
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Family Size & Commute Distance Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-[#121026] border border-purple-500/15">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Family Members</span>
                        <strong className="font-mono text-purple-300">{lifestyle.familySize || 4} people</strong>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        aria-label="Family members count"
                        aria-valuetext={`${lifestyle.familySize || 4} people`}
                        value={lifestyle.familySize || 4}
                        onChange={(e) =>
                          setLifestyle({ ...lifestyle, familySize: Number(e.target.value) })
                        }
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Daily Commute Distance</span>
                        <strong className="font-mono text-purple-300">{lifestyle.commuteKm || 12} km/day</strong>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="40"
                        step="2"
                        aria-label="Daily commute distance in kilometers"
                        aria-valuetext={`${lifestyle.commuteKm || 12} km per day`}
                        value={lifestyle.commuteKm || 12}
                        onChange={(e) =>
                          setLifestyle({ ...lifestyle, commuteKm: Number(e.target.value) })
                        }
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Commute & Home Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                        Daily Commute Mode
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {COMMUTE_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setLifestyle({ ...lifestyle, commuteMode: opt.id })}
                            className={`p-2 rounded-xl text-[11px] font-semibold text-left border transition-all ${
                              lifestyle.commuteMode === opt.id
                                ? "bg-purple-600/30 border-purple-400 text-white"
                                : "bg-[#131129] border-purple-500/15 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                        Home Type & Kitchen
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {HOME_OPTIONS.slice(0, 2).map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setLifestyle({ ...lifestyle, homeType: opt.id })}
                            className={`p-2 rounded-xl text-[11px] font-semibold text-left border transition-all ${
                              lifestyle.homeType === opt.id
                                ? "bg-purple-600/30 border-purple-400 text-white"
                                : "bg-[#131129] border-purple-500/15 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                        <button
                          onClick={() => setLifestyle({ ...lifestyle, homeType: "high_rise" })}
                          className={`p-2 rounded-xl text-[11px] font-semibold text-left border transition-all ${
                            lifestyle.homeType === "high_rise"
                              ? "bg-purple-600/30 border-purple-400 text-white"
                              : "bg-[#131129] border-purple-500/15 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          High-Rise (6th+)
                        </button>
                        <button
                          onClick={() =>
                            setLifestyle({
                              ...lifestyle,
                              cookingStyle:
                                lifestyle.cookingStyle === "gas_tadka" ? "induction_chimney" : "gas_tadka"
                            })
                          }
                          className={`p-2 rounded-xl text-[11px] font-semibold text-left border transition-all ${
                            lifestyle.cookingStyle === "induction_chimney"
                              ? "bg-emerald-600/25 border-emerald-400/60 text-emerald-200"
                              : "bg-[#131129] border-purple-500/15 text-slate-300"
                          }`}
                        >
                          {lifestyle.cookingStyle === "gas_tadka" ? "Gas + High Tadka" : "Chimney / Induction"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 5 Cols: Direct Impact Explainer Box */}
                <div className="lg:col-span-5 p-4 rounded-2xl bg-[#121028] border border-purple-500/25 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold block">
                      Direct Impact ({lifestyle.familySize || 4}-Member Household)
                    </span>
                    <div className="grid grid-cols-2 gap-2.5 mt-3">
                      <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/25">
                        <span className="text-[10px] text-red-300 block">Unprotected Daily</span>
                        <span className="font-mono font-black text-xl text-red-400">
                          {metrics.baselineDailyPM25} <span className="text-[10px] font-normal">µg/m³</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {metrics.baselineCigarettes} cigs eq/day
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                        <span className="text-[10px] text-emerald-300 block">Protected With Plan</span>
                        <span className="font-mono font-black text-xl text-emerald-400">
                          {metrics.protectedDailyPM25} <span className="text-[10px] font-normal">µg/m³</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {metrics.protectedCigarettes} cigs eq/day
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0B0A18] border border-purple-500/15 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Family PM2.5 Avoided:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {metrics.familyPm25AvoidedMgDay} mg/day ({metrics.winterFamilyPm25Grams} g/winter)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">CO₂ Cut via Eco Swaps:</span>
                      <span className="font-mono font-bold text-purple-300">
                        {metrics.totalCo2SavedMonth} kg/mo ({metrics.winterCo2SavedKg} kg/winter)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-purple-500/10">
                      Calculated using adult resting tidal volume (12 m³/day), Berkeley Earth equivalence, & 120 winter smog days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 10-Second Morning Protocol Verdicts */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 text-xs">✦</span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    10-Second Tailored Protocol Verdicts
                  </h2>
                </div>
                <span className="text-xs text-slate-300 font-mono">Calibrated to Your Profile</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        01 / MORNING WALK
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${aqiCategory.walkVerdictColor}`}
                      >
                        {aqiCategory.walkVerdict}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">{aqiCategory.walk}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-purple-500/10">
                    {lifestyle.hasAsthma || lifestyle.hasSeniors
                      ? "Priority alert for seniors/asthma: exercise strictly indoors until afternoon sun."
                      : effectiveAirData.aqi > 200
                      ? "Shift cardio indoors. Deep inhalation of PM2.5 bypasses nasal cilia."
                      : "Safe for regular outdoor jogging and morning strolls."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        02 / {lifestyle.hasKids ? "KIDS & COMMUTE" : "TRANSIT SHIELD"}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${aqiCategory.schoolVerdictColor}`}
                      >
                        {aqiCategory.schoolVerdict}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">{aqiCategory.mask}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-purple-500/10">
                    {metrics.commuteObj.note}. {lifestyle.hasKids ? "Fasten child N95 before school bus queue." : "Keep nose-clip sealed."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        03 / VENTILATION
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${aqiCategory.windowsVerdictColor}`}
                      >
                        {aqiCategory.windowsVerdict}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">{aqiCategory.windows}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-purple-500/10">
                    Safest flush window today: <strong className="text-emerald-400">{safestWindowLabel}</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        04 / INDOOR SHIELD
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30">
                        ~{metrics.protectedIndoorAQI} AQI
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      Purifier: {aqiCategory.purifierSpeed}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-purple-500/10">
                    Your active indoor hacks cut indoor smog by{" "}
                    <strong className="text-purple-300">
                      {Math.max(0, metrics.unshieldedIndoorAQI - metrics.protectedIndoorAQI)} AQI
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Multi-Pollutant Telemetry Bento */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 text-xs">✦</span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Multi-Pollutant Telemetry Bento (µg/m³)
                  </h2>
                </div>
                <span className="text-xs text-slate-300 font-mono">WHO Standard Calibrated</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">PM2.5 (Fine Smog)</span>
                    <Flame size={14} className="text-purple-400" />
                  </div>
                  <span className="font-mono font-bold text-2xl md:text-3xl text-white block my-1">
                    {effectiveAirData.pm25}
                  </span>
                  <span className="text-[11px] font-semibold text-red-400">
                    {effectiveAirData.pm25 > 15 ? `${Math.round(effectiveAirData.pm25 / 15)}x WHO Limit` : "Within safe range"}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">PM10 (Coarse Dust)</span>
                    <Wind size={14} className="text-amber-400" />
                  </div>
                  <span className="font-mono font-bold text-2xl md:text-3xl text-white block my-1">
                    {effectiveAirData.pm10}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-400">
                    {effectiveAirData.pm10 > 45 ? `${Math.round(effectiveAirData.pm10 / 45)}x WHO Limit` : "Within safe range"}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">NO₂ (Vehicle Exhaust)</span>
                    <Activity size={14} className="text-indigo-400" />
                  </div>
                  <span className="font-mono font-bold text-2xl md:text-3xl text-white block my-1">
                    {effectiveAirData.no2}
                  </span>
                  <span className="text-[11px] text-slate-400">Urban Traffic Inflow</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Ozone (O₃)</span>
                    <Sun size={14} className="text-cyan-400" />
                  </div>
                  <span className="font-mono font-bold text-2xl md:text-3xl text-white block my-1">
                    {effectiveAirData.o3}
                  </span>
                  <span className="text-[11px] text-slate-400">Sunlight Photochemical</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB 2: LOW-EMISSION DAILY ROUTINE & 24H DIURNAL PLANNER
           ================================================================== */}
        {activeTab === "routine" && (
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
                    onClick={() => {
                      const summary = `🌿 *VayuGuide Daily Routine — ${city.name} (${effectiveAirData.aqi} AQI)*\n${routineBlocks
                        .map((b) => `• *${b.time}* (${b.title}): ${b.action} [${b.directImpact}]`)
                        .join("\n")}\n\n⚡ Impact: Saves ${metrics.familyPm25AvoidedMgDay} mg PM2.5/day for our family!`;
                      copyToClipboard("dailyRoutine", summary);
                    }}
                    className="px-3.5 py-2.5 rounded-2xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-xs font-bold text-purple-200 flex items-center gap-1.5"
                  >
                    <Copy size={13} />
                    <span>{copiedKey === "dailyRoutine" ? "Copied!" : "Share Routine"}</span>
                  </button>
                </div>
              </div>

              {/* Time-Blocked Interactive Routine List */}
              <div className="space-y-3">
                {routineBlocks.map((block) => {
                  const done = !!routineCompleted[block.id];
                  return (
                    <div
                      key={block.id}
                      onClick={() =>
                        setRoutineCompleted((prev) => ({ ...prev, [block.id]: !prev[block.id] }))
                      }
                      className={`p-4 md:p-5 rounded-2xl border cursor-pointer transition-all ${
                        done
                          ? "bg-purple-950/30 border-purple-500/50 shadow-[0_0_20px_rgba(147,51,234,0.15)]"
                          : "bg-[#111025] border-purple-500/15 hover:border-purple-500/35"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
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

                          <div className="text-[11px] text-slate-400 bg-[#0A0916] px-3 py-2 rounded-xl border border-purple-500/10">
                            <strong className="text-purple-300">Direct Impact & Why:</strong> {block.why}
                          </div>
                        </div>
                      </div>
                    </div>
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
        )}

        {/* ==================================================================
            TAB 3: INDOOR AIR QUALITY HACKS & ROOM SIMULATOR
           ================================================================== */}
        {activeTab === "indoor" && (
          <div id="panel-indoor" role="tabpanel" aria-labelledby="tab-indoor" className="space-y-6 animate-fadeIn">
            <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/15">
                <div>
                  <h2 className="font-display font-extrabold text-lg text-white">
                    Indoor Air Quality Hacks & Room Simulator
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tailored for your <strong className="text-slate-200">{metrics.homeObj.label}</strong> in{" "}
                    <strong className="text-slate-200">{city.name}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Simulated Room:</span>
                  <span
                    className="font-mono font-black text-2xl"
                    style={{ color: indoorCategory.ringColor }}
                  >
                    ~{metrics.protectedIndoorAQI} AQI
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      color: indoorCategory.ringColor,
                      borderColor: indoorCategory.ringColor
                    }}
                  >
                    {indoorCategory.status}
                  </span>
                </div>
              </div>

              {/* Before vs After + Direct Health Impact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-center">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-400 block">
                    ❌ Unsealed + Sources
                  </span>
                  <span className="font-mono font-black text-3xl md:text-4xl text-red-400 my-1.5 block">
                    ~{metrics.unshieldedIndoorAQI} AQI
                  </span>
                  <p className="text-xs text-slate-400">
                    Draft infiltration + cooking & incense smoke (~{metrics.unshieldedPM25} µg/m³ PM2.5)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                    ✅ With Active IAQ Hacks
                  </span>
                  <span className="font-mono font-black text-3xl md:text-4xl text-emerald-400 my-1.5 block">
                    ~{metrics.protectedIndoorAQI} AQI
                  </span>
                  <p className="text-xs text-slate-400">
                    Protected indoor air (~{metrics.protectedPM25} µg/m³ PM2.5)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-950/35 border border-purple-500/35 text-center flex flex-col justify-center">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-300 block">
                    ⚡ Direct Family Impact
                  </span>
                  <span className="font-mono font-black text-3xl text-white my-1 block">
                    {metrics.pm25AvoidedMg} mg
                  </span>
                  <p className="text-xs text-purple-200 font-medium">
                    PM2.5 avoided/person/day ({metrics.cigarettesAvoided} fewer cigs eq)
                  </p>
                </div>
              </div>

              {/* 6 Interactive IAQ Hacks */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
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
                            <span className="font-mono text-[10px] font-extrabold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                              {hack.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{hack.desc}</p>
                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-purple-500/10">
                            <span className="text-slate-400">{hack.why}</span>
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

            {/* DIY ₹1,800 Box-Fan HEPA Blueprint & 3-Year TCO */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Wrench size={18} className="text-purple-400" />
                  <div>
                    <h2 className="font-display font-extrabold text-base text-white">
                      ₹1,800 DIY Box-Fan HEPA Purifier Blueprint
                    </h2>
                    <p className="text-xs text-slate-400">
                      Build a 280 m³/hr Clean Air Delivery Rate (CADR) room scrubber in 5 minutes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDiyGuide((prev) => !prev)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-xs font-bold text-purple-200 self-start sm:self-center"
                >
                  {showDiyGuide ? "Hide Build Steps" : "Show 5-Min Build Guide"}
                </button>
              </div>

              {showDiyGuide && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-[#121026] border border-purple-500/20 space-y-1.5">
                    <span className="text-xs font-mono font-bold text-purple-300">STEP 1 • PARTS (~₹1,800)</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      1x 12-inch high-RPM cabin/box fan (₹1,100) + 1x cylindrical or flat True HEPA H13 replacement filter (₹650) + wide masking tape (₹50).
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#121026] border border-purple-500/20 space-y-1.5">
                    <span className="text-xs font-mono font-bold text-purple-300">STEP 2 • SEAL AIRFLOW</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Tape the HEPA filter tightly onto the INTAKE (suction) side of the fan with zero air gaps so all room air is forced through the H13 pleats.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#121026] border border-purple-500/20 space-y-1.5">
                    <span className="text-xs font-mono font-bold text-emerald-300">3-YEAR TCO IMPACT</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      DIY 3-Yr Total Cost: <strong className="text-emerald-400">₹3,100</strong> vs. Commercial ₹14,500+ vs. Premium ₹34,000+ — same 99.95% PM2.5 capture.
                    </p>
                  </div>
                </div>
              )}

              {/* Room Size ACH & N95 Fit-Check Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-purple-500/15">
                <div className="p-4 rounded-2xl bg-[#121026] border border-purple-500/20 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Room Volume & Clean-Down Speed</span>
                    <strong className="font-mono text-purple-300">{roomSqFt} sq ft</strong>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="400"
                    step="10"
                    aria-label="Bedroom floor area in square feet"
                    aria-valuetext={`${roomSqFt} square feet`}
                    value={roomSqFt}
                    onChange={(e) => setRoomSqFt(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 rounded-xl bg-[#0B0A18] border border-purple-500/15">
                      <span className="text-slate-400 block">Room Volume</span>
                      <strong className="font-mono text-white">{roomAchStats.volumeM3} m³</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[#0B0A18] border border-purple-500/15">
                      <span className="text-slate-400 block">Filtration Rate</span>
                      <strong className="font-mono text-emerald-400">{roomAchStats.ach} ACH</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[#0B0A18] border border-purple-500/15">
                      <span className="text-slate-400 block">1 Air Cycle</span>
                      <strong className="font-mono text-purple-300">{roomAchStats.cleanCycleMins} mins</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#121026] border border-purple-500/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">N95 / FFP2 Seal & Lifespan Hack</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                      ~{Math.max(12, Math.round(9000 / Math.max(50, effectiveAirData.aqi)))} hrs life at {effectiveAirData.aqi} AQI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    1) Pinch nose-bridge wire with both hands. 2) Exhale sharply — if air leaks near eyes, tighten head-loops. 3) Air-dry in shade after use; never wash electrostatic N95 meltblown layers with water.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB 4: SUSTAINABLE ALTERNATIVES & DIRECT IMPACT
           ================================================================== */}
        {activeTab === "swaps" && (
          <div id="panel-swaps" role="tabpanel" aria-labelledby="tab-swaps" className="space-y-6 animate-fadeIn">
            {/* Cumulative Direct Impact Banner */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-500/15">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                    Tailored to {city.name} & {metrics.commuteObj.label}
                  </span>
                  <h2 className="font-display font-extrabold text-xl text-white mt-1">
                    Sustainable Alternatives & Direct Impact Explorer
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select sustainable swaps below to see exactly how much pollution, CO₂, and lung damage your choices prevent
                  </p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="px-3.5 py-2 rounded-2xl bg-[#131129] border border-purple-500/30">
                    <span className="text-[10px] font-mono text-purple-300 block">SWAP PM2.5 DROP</span>
                    <span className="font-mono font-black text-lg text-purple-200">
                      -{metrics.totalSwapPmDrop} µg/m³
                    </span>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                    <span className="text-[10px] font-mono text-emerald-300 block">WINTER CO₂ CUT</span>
                    <span className="font-mono font-black text-lg text-emerald-400">
                      {metrics.winterCo2SavedKg} kg
                    </span>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-purple-950/40 border border-purple-500/30">
                    <span className="text-[10px] font-mono text-purple-300 block">WINTER PM2.5 AVOIDED</span>
                    <span className="font-mono font-black text-lg text-white">
                      {metrics.winterFamilyPm25Grams} g
                    </span>
                  </div>
                </div>
              </div>

              {/* 6 Interactive Sustainable Swap Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ECO_SWAPS_DATA.map((swap) => {
                  const isAdopted = adoptedSwaps.includes(swap.id);
                  const isTopMatch =
                    (swap.id === "commute_metro" &&
                      (lifestyle.commuteMode === "two_wheeler" || lifestyle.commuteMode === "auto_bus")) ||
                    (swap.id === "cooking_induction" && lifestyle.cookingStyle === "gas_tadka") ||
                    (swap.id === "ritual_led" && lifestyle.burnsIncense) ||
                    (swap.id === "guard_heater" &&
                      (lifestyle.homeType === "ground_roadside" ||
                        locationProfile.regionType === "indo-gangetic" ||
                        locationProfile.regionType === "industrial"));
                  return (
                    <div
                      key={swap.id}
                      onClick={() => toggleEcoSwap(swap.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                        isAdopted
                          ? "bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                          : "bg-[#111025] border-purple-500/20 hover:border-purple-400/40"
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 bg-purple-950/70 px-2.5 py-0.5 rounded-full border border-purple-500/25">
                              {swap.category}
                            </span>
                            {isTopMatch && (
                              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                                ★ Top Match
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                              isAdopted
                                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                                : "bg-[#1A1838] border-purple-500/25 text-slate-400"
                            }`}
                          >
                            {isAdopted ? <CheckCircle2 size={11} /> : null}
                            <span>{isAdopted ? "Adopted" : "Adopt Swap"}</span>
                          </span>
                        </div>

                        <div>
                          <span className="text-xs text-slate-300 line-through block">
                            ✕ {swap.from}
                          </span>
                          <span className="text-sm font-bold text-white block mt-0.5">
                            ✓ {swap.to}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">{swap.why}</p>
                      </div>

                      <div className="pt-3 border-t border-purple-500/15 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="font-mono font-bold text-emerald-400">
                          {swap.impactBadge}
                        </span>
                        <span className="font-mono text-slate-400">{swap.rupeeDeltaMonth}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB 5: COMMUNITY HUB & RWA MULTIPLIER + WHATSAPP
           ================================================================== */}
        {activeTab === "whatsapp" && (
          <div id="panel-whatsapp" role="tabpanel" aria-labelledby="tab-whatsapp" className="space-y-6 animate-fadeIn">
            {/* RWA Community Impact Multiplier */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-purple-500/15">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold">
                    Neighborhood Multiplier Engine
                  </span>
                  <h2 className="font-display font-extrabold text-lg text-white mt-0.5">
                    Community & RWA Collective Impact Calculator
                  </h2>
                  <p className="text-xs text-slate-400">
                    See how mobilizing your apartment society multiplies individual clean-air choices
                  </p>
                </div>
                <input
                  type="text"
                  aria-label="Society or RWA Name"
                  maxLength={80}
                  value={societyName}
                  onChange={(e) => setSocietyName(sanitizeText(e.target.value, 80))}
                  placeholder="Enter Society / RWA Name"
                  className="text-xs px-3.5 py-2 bg-[#131129] border border-purple-500/30 rounded-xl text-white outline-none focus:border-purple-400 w-full md:w-60"
                />
              </div>

              {/* Flats Slider + Pledges */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-300 font-semibold">Participating Households / Flats</span>
                      <span className="font-mono font-black text-purple-300 text-sm">
                        {flatCount} Flats (~{rwaMetrics.gates} Gate{rwaMetrics.gates > 1 ? "s" : ""})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="200"
                      aria-label="Participating households or flats"
                      aria-valuetext={`${flatCount} flats`}
                      value={flatCount}
                      onChange={(e) => setFlatCount(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "guardHeaters", label: "Guard Electric Heaters" },
                      { key: "dampMopping", label: "Corridor Geela Pocha" },
                      { key: "noLeafBurning", label: "Ban Leaf/Trash Fires" },
                      { key: "noIdling", label: "No-Idling Gate Zone" }
                    ].map((pledge) => {
                      const active = !!rwaPledges[pledge.key];
                      return (
                        <button
                          key={pledge.key}
                          onClick={() =>
                            setRwaPledges((prev) => ({ ...prev, [pledge.key]: !prev[pledge.key] }))
                          }
                          className={`p-2.5 rounded-xl text-xs font-semibold border text-left flex items-center gap-2 transition-all ${
                            active
                              ? "bg-purple-600/25 border-purple-400 text-white"
                              : "bg-[#121026] border-purple-500/15 text-slate-400"
                          }`}
                        >
                          <CheckCircle2
                            size={14}
                            className={active ? "text-emerald-400 shrink-0" : "text-slate-600 shrink-0"}
                          />
                          <span>{pledge.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right 6 Cols: Calculated Direct Community Impact */}
                <div className="lg:col-span-6 grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-[10px] font-mono text-emerald-300 uppercase block">
                      PM2.5 Emissions Prevented
                    </span>
                    <span className="font-mono font-black text-2xl text-emerald-400 block my-1">
                      {rwaMetrics.totalPmSavedKgMonth} kg
                    </span>
                    <span className="text-[11px] text-slate-400">per winter month</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30">
                    <span className="text-[10px] font-mono text-purple-300 uppercase block">
                      CO₂ Emissions Avoided
                    </span>
                    <span className="font-mono font-black text-2xl text-purple-300 block my-1">
                      {rwaMetrics.co2SavedKgMonth} kg
                    </span>
                    <span className="text-[11px] text-slate-400">collective monthly cut</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#121026] border border-purple-500/20">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      Clean-Air Person-Days
                    </span>
                    <span className="font-mono font-black text-2xl text-white block my-1">
                      {rwaMetrics.cleanAirPersonDays.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400">safer breathing days/mo</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#121026] border border-purple-500/20">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      Clinic Visits Averted
                    </span>
                    <span className="font-mono font-black text-2xl text-amber-300 block my-1">
                      ~{rwaMetrics.doctorVisitsAverted}
                    </span>
                    <span className="text-[11px] text-slate-400">pediatric/senior episodes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1-Tap WhatsApp Broadcast Templates */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-5">
              <div>
                <h2 className="font-display font-extrabold text-lg text-white">
                  1-Tap WhatsApp Society & Family Broadcasts
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Auto-populated with {societyName}, {city.name} AQI ({effectiveAirData.aqi}), and your calculated community impact
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: "rwaCircular",
                    title: "🏘️ Full RWA Clean-Air Resolution Circular",
                    purpose: `Mobilize all ${flatCount} flats in ${societyName} with quantified pollution impact`,
                    text: `🌿 *${societyName} — Winter Clean-Air Action Circular*\n📍 ${city.name} AQI: *${effectiveAirData.aqi} (${aqiCategory.status})*\n\nBy adopting just ${Object.values(rwaPledges).filter(Boolean).length} society-wide steps across ${flatCount} flats:\n✅ *${rwaMetrics.totalPmSavedKgMonth} kg* of toxic PM2.5 prevented/month\n✅ *${rwaMetrics.co2SavedKgMonth} kg* CO₂ saved monthly\n\nProposed Actions:\n${rwaPledges.guardHeaters ? "• Pool ₹150/flat for 800W guard heaters (stops 2.4 kg PM2.5/gate/night from scrap fires)\n" : ""}${rwaPledges.dampMopping ? "• Mandate damp mopping (Geela Pocha) instead of dry jhadu in lobbies\n" : ""}${rwaPledges.noLeafBurning ? "• Strict ban on dry leaf & waste burning; compost garden litter\n" : ""}${rwaPledges.noIdling ? "• Enforce engine-off No-Idling rule at society entry gates\n" : ""}\nReply 'YES' to co-sponsor! 🙏`
                  },
                  {
                    id: "moppingNotice",
                    title: "🧹 Estate Manager: Damp Mopping Mandate",
                    purpose: "Stop dry broom micro-dust resuspension in corridors & basements",
                    text: `🚨 *NOTICE TO ESTATE MANAGER & HOUSEKEEPING (${societyName})*\nDue to ${aqiCategory.status} air quality in ${city.name} (AQI ${effectiveAirData.aqi}):\n1. STOP all dry broom sweeping (Jhadu) in tower lobbies and corridors — it kicks fine PM2.5 back into children's lungs.\n2. MANDATE damp mopping (Geela Pocha) twice daily.\nThank you for protecting our building's indoor air! 🙏`
                  },
                  {
                    id: "familyWarning",
                    title: "⚠️ Family Smog Alert & Safe Routine",
                    purpose: "Alert family group with today's cigarette equivalence & safest window",
                    text: `⚠️ *Family Air Alert (${city.name} AQI ${effectiveAirData.aqi})*\nOutdoor air today = smoking *${metrics.outdoorCigarettes} cigarettes/day*.\n• Morning walk: Shift indoors until *${safestWindowLabel}* (safest airing window).\n• Commute: Wear tight-fit N95 & keep car vents on Recirculate.\n• Evening: Run kitchen chimney 5 mins before tadka & skip agarbatti smoke.\nStay safe! ❤️`
                  }
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-4 md:p-5 rounded-2xl bg-[#121026] border border-purple-500/20 space-y-3"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-white">{item.title}</h3>
                      <p className="text-[11px] text-slate-400">{item.purpose}</p>
                    </div>

                    <div className="p-3.5 bg-[#090815] rounded-xl border border-purple-500/15 text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                      {item.text}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => copyToClipboard(item.id, item.text)}
                        className="flex-1 py-2 px-3 bg-[#1A1838] hover:bg-[#25234E] text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-purple-500/20"
                      >
                        {copiedKey === item.id ? (
                          <>
                            <CheckCircle2 size={13} className="text-emerald-400" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy Message</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(item.text)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,211,102,0.4)]"
                      >
                        <MessageSquare size={13} />
                        <span>Send on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB 6: GENAI CO-PILOT & GENERATIVE UI SYNTHESIS STUDIO
           ================================================================== */}
        {activeTab === "ai" && (
          <div id="panel-ai" role="tabpanel" aria-labelledby="tab-ai" className="space-y-6 animate-fadeIn">
            {/* Conversational GenAI Co-Pilot */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-base text-white">
                      VayuGuide GenAI Atmospheric Co-Pilot
                    </h2>
                    <p className="text-xs text-slate-400">
                      Aware of {city.name} ({effectiveAirData.aqi} AQI), {lifestyle.familySize || 4}-member household & {metrics.commuteObj.label}
                    </p>
                  </div>
                </div>

                {/* API Key Input */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleGenerateCustomPlan}
                    disabled={planLoading}
                    className="text-xs font-bold px-3 py-1.5 bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/40 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles size={13} />
                    <span>{planLoading ? "Synthesizing..." : "Synthesize Full Action Plan"}</span>
                  </button>
                  <input
                    type="password"
                    aria-label="Optional Gemini API Key (held in memory only)"
                    placeholder={apiKey ? "Gemini Key Active (Memory) ✓" : "Gemini API Key (Session Only)"}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="text-xs px-3 py-1.5 bg-[#121026] border border-purple-500/25 rounded-xl outline-none focus:border-purple-400 w-44 text-slate-200 placeholder-slate-400"
                  />
                  <button
                    onClick={() => {
                      if (inputKey.trim()) {
                        setApiKey(inputKey.trim());
                        setInputKey("");
                        showToast("Gemini API key active in session memory only (cleared on refresh).");
                      } else if (apiKey) {
                        setApiKey("");
                        showToast("Cleared Gemini API key; using offline Atmospheric Engine.");
                      }
                    }}
                    className="text-xs font-semibold px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all"
                  >
                    {inputKey.trim() ? "Save" : apiKey ? "Clear" : "Save"}
                  </button>
                </div>
              </div>

              {/* Synthesized Custom Action Plan Card (when generated) */}
              {customAiPlan && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-emerald-950/25 border border-purple-400/35 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                        ✨ {customAiPlan.source}
                      </span>
                      <h3 className="text-sm font-bold text-white">{customAiPlan.headline}</h3>
                    </div>
                    <button
                      onClick={() => setCustomAiPlan(null)}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-[#0B0A18]/90 border border-purple-500/20">
                      <strong className="text-purple-300 block mb-1">1. Low-Emission Daily Routine</strong>
                      <p className="text-slate-200 leading-relaxed">{customAiPlan.routine}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0B0A18]/90 border border-purple-500/20">
                      <strong className="text-purple-300 block mb-1">2. Priority Indoor Hacks</strong>
                      <p className="text-slate-200 leading-relaxed">{customAiPlan.indoorHack}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0B0A18]/90 border border-purple-500/20">
                      <strong className="text-purple-300 block mb-1">3. Sustainable Alternatives</strong>
                      <p className="text-slate-200 leading-relaxed">{customAiPlan.ecoSwap}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                      <strong className="text-emerald-300 block mb-1">4. Direct Measurable Impact</strong>
                      <p className="text-emerald-100 leading-relaxed">{customAiPlan.directImpact}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Message History */}
              <div role="log" aria-live="polite" aria-label="AI Co-Pilot conversation" className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-purple-600 text-white rounded-br-sm shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                          : "bg-[#141228] text-slate-200 rounded-bl-sm border border-purple-500/20"
                      }`}
                    >
                      {msg.role === "ai" && msg.source && (
                        <span className="text-[9px] font-mono uppercase tracking-wider text-purple-300/80 block mb-1">
                          ✦ {msg.source}
                        </span>
                      )}
                      {msg.text}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-[#141228] rounded-2xl text-xs text-purple-300 border border-purple-500/20 animate-pulse">
                      Synthesizing location, lifestyle & atmospheric guidance...
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Prompt Recommendation Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {[
                  "Plan my low-emission daily routine today",
                  "How does my commute affect lung PM2.5?",
                  "Best indoor air hacks under ₹2,000?",
                  "Draft an RWA action plan for our society"
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(chip)}
                    className="px-3 py-1 rounded-full bg-[#141228] hover:bg-[#1D1A3B] text-[11px] text-purple-300 border border-purple-500/20 whitespace-nowrap transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Prompt Box */}
              <div className="flex gap-2 pt-2 border-t border-purple-500/15">
                <input
                  type="text"
                  aria-label="Ask VayuGuide AI Co-Pilot"
                  maxLength={MAX_CHAT_INPUT_LENGTH}
                  placeholder={`Ask about ${city.name} smog, child exposure, cooking swaps, or RWA rules...`}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-[#121026] border border-purple-500/25 rounded-2xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-400 outline-none focus:border-purple-400 transition-colors"
                />
                <button
                  type="button"
                  aria-label="Send message to AI Co-Pilot"
                  onClick={() => handleSendMessage()}
                  disabled={aiLoading}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

            {/* Generative UI Interactive Micro-App Studio */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/15">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold">
                    ✨ Generative UI Synthesis Studio
                  </span>
                  <h2 className="font-display font-extrabold text-base text-white mt-0.5">
                    Interactive Decision Widgets
                  </h2>
                </div>
                <button
                  onClick={() => setShowGenSpec((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-[#141228] hover:bg-[#1D1A3B] border border-purple-500/25 text-xs font-mono text-purple-300 flex items-center gap-1.5 self-start sm:self-center"
                >
                  <Code2 size={13} />
                  <span>{showGenSpec ? "Hide GenUI JSON" : "Inspect GenUI JSON Spec"}</span>
                </button>
              </div>

              {/* Widget Switcher Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "pediatric", label: "Pediatric Exposure Calculator", icon: Calculator },
                  { id: "purifier", label: "3-Year Purifier TCO Bench", icon: Wrench },
                  { id: "diurnal", label: "Diurnal Inversion Scrubber", icon: Sun },
                  { id: "asthma", label: "Asthma / PEFR Action Plan", icon: Stethoscope },
                  { id: "rwa", label: "RWA Society Circular Builder", icon: Users }
                ].map((w) => {
                  const Icon = w.icon;
                  const active = activeGenWidget === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setActiveGenWidget(w.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                        active
                          ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                          : "bg-[#121026] text-slate-300 border-purple-500/20 hover:border-purple-400/40"
                      }`}
                    >
                      <Icon size={13} />
                      <span>{w.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Synthesized Widget */}
              {activeGenWidget === "pediatric" && (
                <PediatricExposureWidget city={city} airData={effectiveAirData} />
              )}
              {activeGenWidget === "purifier" && <PurifierBenchWidget />}
              {activeGenWidget === "diurnal" && (
                <DiurnalInversionWidget airData={effectiveAirData} safestWindowLabel={safestWindowLabel} />
              )}
              {activeGenWidget === "asthma" && (
                <AsthmaRiskWidget airData={effectiveAirData} protectedIndoorAQI={metrics.protectedIndoorAQI} />
              )}
              {activeGenWidget === "rwa" && (
                <RwaResolutionWidget
                  city={city}
                  airData={effectiveAirData}
                  societyName={societyName}
                  setSocietyName={setSocietyName}
                  rwaMetrics={rwaMetrics}
                  onCopy={(txt) => copyToClipboard("rwaWidget", txt)}
                />
              )}

              {/* GenUI JSON Inspector */}
              {showGenSpec && (
                <pre className="p-4 rounded-2xl bg-[#080712] border border-purple-500/20 text-[11px] font-mono text-purple-200 overflow-x-auto">
                  {JSON.stringify(
                    {
                      synthesizedComponent: activeGenWidget,
                      context: {
                        city: city.name,
                        effectiveAQI: effectiveAirData.aqi,
                        isSimulatingAQI,
                        pm25: effectiveAirData.pm25,
                        lifestyle,
                        protectedIndoorAQI: metrics.protectedIndoorAQI,
                        familyPm25AvoidedMgPerDay: metrics.familyPm25AvoidedMgDay,
                        winterFamilyPm25Grams: metrics.winterFamilyPm25Grams,
                        co2SavedKgPerMonth: metrics.totalCo2SavedMonth
                      }
                    },
                    null,
                    2
                  )}
                </pre>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
          CITY SEARCH MODAL
         ==================================================================== */}
      {isSearchOpen && (
        <CitySearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectCity={(newCity) => {
            setCity(newCity);
            setIsSearchOpen(false);
          }}
          onDetectGPS={() => {
            handleDetectGPS();
            setIsSearchOpen(false);
          }}
        />
      )}

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onClearAllData={handleClearAllData}
      />

      <footer className="max-w-5xl mx-auto px-4 mt-10 pt-6 border-t border-purple-500/15 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>
          VayuGuide — Transparent exposure math (Berkeley Earth 22 µg/m³ = 1 cig, 12 m³/day tidal volume).
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsPrivacyOpen(true)}
            className="text-purple-300 hover:text-white underline underline-offset-4 font-semibold"
          >
            Privacy, Terms &amp; Clear Data
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function VayuGuide() {
  return (
    <ErrorBoundary>
      <VayuGuideApp />
    </ErrorBoundary>
  );
}
