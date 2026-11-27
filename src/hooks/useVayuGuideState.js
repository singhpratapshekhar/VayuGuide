import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { POPULAR_CITIES, inferLocationProfile } from "../data/cities.js";
import {
  DEFAULT_ADOPTED_SWAPS,
  DEFAULT_INDOOR_ACTIONS,
  DEFAULT_LIFESTYLE,
  DEFAULT_ROUTINE_COMPLETED,
  DEFAULT_RWA_PLEDGES,
  ECO_SWAPS_DATA,
  INDOOR_HACKS_DATA,
  INITIAL_AIR_DATA
} from "../data/lifestyleData.js";
import { getAQICategory } from "../utils/aqi.js";
import {
  buildDailyRoutineBlocks,
  computePersonalMetrics,
  computeRoomAchStats,
  computeRwaMetrics
} from "../utils/metrics.js";
import {
  isValidAdoptedSwaps,
  isValidBooleanMap,
  isValidCity,
  isValidLifestyle
} from "../utils/schemas.js";
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
  callGeminiModels,
  detectGenWidgetIntent,
  synthesizeCustomActionPlan
} from "../services/geminiApi.js";

function createWelcomeMessage(cityName) {
  return {
    id: `welcome-${Date.now()}`,
    role: "ai",
    text: `Namaste! I am your VayuGuide Atmospheric Co-Pilot. I've tailored today's analysis for ${cityName} and your household profile. Ask me for low-emission daily routines, indoor air hacks, or launch a GenUI Synthesizer widget below.`
  };
}

/**
 * Custom hook encapsulating VayuGuide's state, schema-validated persistence,
 * derived impact metrics, race-safe Open-Meteo fetching, GPS sync, and GenAI Co-Pilot.
 */
export function useVayuGuideState() {
  const [city, setCity] = useState(() =>
    loadStored("vg_selected_city", POPULAR_CITIES[0], isValidCity)
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const toastTimerRef = useRef(null);
  const copyTimerRef = useRef(null);
  const aiTimerRef = useRef(null);
  const planTimerRef = useRef(null);
  const fetchAbortRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (planTimerRef.current) clearTimeout(planTimerRef.current);
      if (fetchAbortRef.current) fetchAbortRef.current.abort();
    };
  }, []);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 3200);
  }, []);

  const [lifestyle, setLifestyle] = useState(() =>
    loadStored("vg_lifestyle_profile", DEFAULT_LIFESTYLE, isValidLifestyle)
  );
  const [airData, setAirData] = useState(INITIAL_AIR_DATA);
  const [indoorActions, setIndoorActions] = useState(() =>
    loadStored("vg_indoor_actions", DEFAULT_INDOOR_ACTIONS, isValidBooleanMap)
  );
  const [adoptedSwaps, setAdoptedSwaps] = useState(() =>
    loadStored("vg_adopted_swaps", DEFAULT_ADOPTED_SWAPS, isValidAdoptedSwaps)
  );
  const [routineCompleted, setRoutineCompleted] = useState(() =>
    loadStored("vg_routine_completed", DEFAULT_ROUTINE_COMPLETED, isValidBooleanMap)
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
    loadStored("vg_rwa_pledges", DEFAULT_RWA_PLEDGES, isValidBooleanMap)
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
  const [messages, setMessages] = useState(() => [createWelcomeMessage(POPULAR_CITIES[0].name)]);
  const [promptInput, setPromptInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [activeGenWidget, setActiveGenWidget] = useState("pediatric");
  const [showGenSpec, setShowGenSpec] = useState(false);
  const [customAiPlan, setCustomAiPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  const loadCityData = useCallback(
    async (targetCity) => {
      if (fetchAbortRef.current) fetchAbortRef.current.abort();
      const controller = new AbortController();
      fetchAbortRef.current = controller;

      setLoading(true);
      try {
        const data = await fetchLiveAirQuality(targetCity.lat, targetCity.lon, {
          signal: controller.signal
        });
        if (!controller.signal.aborted) {
          setAirData(data);
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          showToast(`Live telemetry unavailable (${sanitizeErrorMessage(err)}); showing cached baseline.`);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [showToast]
  );

  useEffect(() => {
    loadCityData(city);
  }, [city, loadCityData]);

  const handleDetectGPS = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
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
        showToast("Synced air quality to your live GPS coordinates.");
      },
      () => {
        showToast("Enable browser location permissions to detect local air quality.");
        setLoading(false);
      }
    );
  }, [showToast]);

  const handleClearAllData = useCallback(() => {
    clearAllStored("vg_");
    setCity(POPULAR_CITIES[0]);
    setLifestyle(DEFAULT_LIFESTYLE);
    setIndoorActions(DEFAULT_INDOOR_ACTIONS);
    setAdoptedSwaps(DEFAULT_ADOPTED_SWAPS);
    setRoutineCompleted(DEFAULT_ROUTINE_COMPLETED);
    setRoomSqFt(150);
    setIsSimulatingAQI(false);
    setSimulatedAQI(320);
    setSocietyName("Greenwood Residency RWA");
    setFlatCount(60);
    setRwaPledges(DEFAULT_RWA_PLEDGES);
    setApiKey("");
    setInputKey("");
    setPromptInput("");
    setCustomAiPlan(null);
    setMessages([createWelcomeMessage(POPULAR_CITIES[0].name)]);
    setIsPrivacyOpen(false);
    showToast("Cleared all saved local preferences and session data.");
  }, [showToast]);

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
    return t.includes("12 pm") || t.includes("3 pm")
      ? "12:30 PM – 3:00 PM"
      : `${safestPoint?.time || "1:00 PM"} Window`;
  }, [safestPoint]);

  const routineBlocks = useMemo(
    () => buildDailyRoutineBlocks(city, effectiveAirData, lifestyle, safestWindowLabel),
    [city, effectiveAirData, lifestyle, safestWindowLabel]
  );

  const completedRoutineCount = routineBlocks.filter((b) => routineCompleted[b.id]).length;
  const roomAchStats = useMemo(() => computeRoomAchStats(roomSqFt), [roomSqFt]);

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

  const copyToClipboard = useCallback(
    (key, text) => {
      navigator.clipboard?.writeText(text);
      setCopiedKey(key);
      showToast("Copied message to clipboard!");
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedKey(null), 2500);
    },
    [showToast]
  );

  const toggleEcoSwap = useCallback((id) => {
    setAdoptedSwaps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleSendMessage = async (textToSend) => {
    if (aiLoading) return;
    const userMsg = sanitizeText(textToSend || promptInput, MAX_CHAT_INPUT_LENGTH);
    if (!userMsg) return;
    const msgIdBase = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setMessages((prev) => [...prev, { id: `u-${msgIdBase}`, role: "user", text: userMsg }]);
    setPromptInput("");
    setAiLoading(true);

    const matchedWidget = detectGenWidgetIntent(userMsg);
    if (matchedWidget) setActiveGenWidget(matchedWidget);

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
            { id: `a-${msgIdBase}`, role: "ai", text: result.text, source: `Gemini (${result.model})` }
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

      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      aiTimerRef.current = setTimeout(() => {
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
          { id: `a-${msgIdBase}`, role: "ai", text: advice, source: "VayuGuide Atmospheric Engine" }
        ]);
        setAiLoading(false);
      }, 80);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${msgIdBase}`,
          role: "ai",
          text: "Unable to reach the AI cloud right now. Switching to offline atmospheric guidance.",
          source: "VayuGuide Atmospheric Engine"
        }
      ]);
      setAiLoading(false);
    }
  };

  const handleGenerateCustomPlan = async () => {
    if (planLoading) return;
    setPlanLoading(true);
    const planParams = {
      city,
      effectiveAirData,
      aqiCategory,
      lifestyle,
      routineBlocks,
      safestWindowLabel,
      roomSqFt,
      roomAchStats,
      metrics,
      societyName
    };
    if (apiKey.trim()) {
      const plan = await synthesizeCustomActionPlan(planParams, apiKey);
      setCustomAiPlan(plan);
      setPlanLoading(false);
      return;
    }
    if (planTimerRef.current) clearTimeout(planTimerRef.current);
    planTimerRef.current = setTimeout(async () => {
      const plan = await synthesizeCustomActionPlan(planParams, "");
      setCustomAiPlan(plan);
      setPlanLoading(false);
    }, 80);
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
