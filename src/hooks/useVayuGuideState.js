import { useEffect, useMemo, useRef, useState } from "react";
import { POPULAR_CITIES, inferLocationProfile } from "../data/cities.js";
import {
  DEFAULT_LIFESTYLE,
  ECO_SWAPS_DATA,
  INDOOR_HACKS_DATA
} from "../data/lifestyleData.js";
import { getAQICategory } from "../utils/aqi.js";
import {
  buildDailyRoutineBlocks,
  computePersonalMetrics,
  computeRwaMetrics
} from "../utils/metrics.js";
import {
  clearAllStored,
  loadStored,
  sanitizeErrorMessage,
  sanitizeText,
  saveStored,
  validateCoordinates
} from "../utils/security.js";
import { fetchLiveAirQuality } from "../services/airQualityApi.js";
import {
  MAX_CHAT_INPUT_LENGTH,
  buildOfflineAtmosphericReply,
  callGeminiModels
} from "../services/geminiApi.js";

const INITIAL_AIR_DATA = {
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
};

const DEFAULT_INDOOR_ACTIONS = {
  doorTape: true,
  wetMop: true,
  hepaFilter: false,
  kitchenExhaust: true,
  zeroSmokePrayer: false,
  plantCarbon: false
};

const DEFAULT_RWA_PLEDGES = {
  guardHeaters: true,
  dampMopping: true,
  noLeafBurning: true,
  noIdling: false
};

/**
 * Custom hook encapsulating VayuGuide's state, persistence, derived metrics,
 * live Open-Meteo fetching, GPS sync, and GenAI Co-Pilot handlers.
 */
export function useVayuGuideState() {
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

  const [lifestyle, setLifestyle] = useState(() =>
    loadStored("vg_lifestyle_profile", DEFAULT_LIFESTYLE)
  );
  const [airData, setAirData] = useState(INITIAL_AIR_DATA);
  const [indoorActions, setIndoorActions] = useState(() =>
    loadStored("vg_indoor_actions", DEFAULT_INDOOR_ACTIONS)
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
    loadStored("vg_rwa_pledges", DEFAULT_RWA_PLEDGES)
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
    setIndoorActions(DEFAULT_INDOOR_ACTIONS);
    setAdoptedSwaps(["wet_pocha", "cooking_induction"]);
    setRoutineCompleted({ morning_lockdown: true, solar_ventilation: true });
    setRoomSqFt(150);
    setSocietyName("Greenwood Residency RWA");
    setFlatCount(60);
    setRwaPledges(DEFAULT_RWA_PLEDGES);
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
    () => computePersonalMetrics(effectiveAirData, lifestyle, indoorActions, adoptedSwaps, routineCompleted),
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
    return t.includes("12 pm") || t.includes("3 pm")
      ? "12:30 PM – 3:00 PM"
      : `${safestPoint?.time || "1:00 PM"} Window`;
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
    () => computeRwaMetrics(flatCount, rwaPledges, metrics.totalCo2SavedMonth, metrics.exposureDropPct),
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

    const activeHackNames = INDOOR_HACKS_DATA.filter((h) => indoorActions[h.key]).map((h) => h.key).join(", ") || "none";
    const activeSwapNames = ECO_SWAPS_DATA.filter((s) => adoptedSwaps.includes(s.id)).map((s) => s.category).join(", ") || "none";
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
          setMessages((prev) => [...prev, { role: "ai", text: result.text, source: `Gemini (${result.model})` }]);
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
        setMessages((prev) => [...prev, { role: "ai", text: advice, source: "VayuGuide Atmospheric Engine" }]);
        setAiLoading(false);
      }, 250);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Unable to reach the AI cloud right now. Switching to offline atmospheric guidance.", source: "VayuGuide Atmospheric Engine" }
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

  return {
    city, setCity,
    isSearchOpen, setIsSearchOpen,
    isPrivacyOpen, setIsPrivacyOpen,
    activeTab, setActiveTab,
    loading, toastMsg, showToast,
    lifestyle, setLifestyle,
    indoorActions, setIndoorActions,
    adoptedSwaps, toggleEcoSwap,
    routineCompleted, setRoutineCompleted,
    showDiyGuide, setShowDiyGuide,
    roomSqFt, setRoomSqFt,
    isSimulatingAQI, setIsSimulatingAQI,
    simulatedAQI, setSimulatedAQI,
    societyName, setSocietyName,
    flatCount, setFlatCount,
    rwaPledges, setRwaPledges,
    copiedKey, copyToClipboard,
    apiKey, setApiKey, inputKey, setInputKey,
    messages, promptInput, setPromptInput, aiLoading, handleSendMessage,
    activeGenWidget, setActiveGenWidget,
    showGenSpec, setShowGenSpec,
    customAiPlan, setCustomAiPlan, planLoading, handleGenerateCustomPlan,
    loadCityData, handleDetectGPS, handleClearAllData,
    effectiveAirData, locationProfile, aqiCategory, metrics, indoorCategory,
    peakPoint, safestPoint, safestWindowLabel, routineBlocks, completedRoutineCount,
    roomAchStats, rwaMetrics
  };
}
