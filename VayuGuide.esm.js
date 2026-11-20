// VayuGuide.jsx
import React, { useState, useEffect } from "react";
import {
  Wind,
  MapPin,
  Search,
  Crosshair,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sun,
  Moon,
  Droplets,
  ShieldCheck,
  Flame,
  Leaf,
  ChevronDown,
  ChevronRight,
  Share2,
  Copy,
  MessageSquare,
  Clock,
  Sparkles,
  Key,
  Send,
  Bot,
  X,
  Activity,
  Thermometer,
  ExternalLink,
  Heart,
  Info,
  Shield,
  Radio,
  Sliders,
  Check
} from "lucide-react";
var POPULAR_CITIES = [
  { name: "Delhi NCR", state: "Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lon: 72.8777 },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lon: 77.5946 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lon: 88.3639 },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lon: 78.4867 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873 },
  { name: "Patna", state: "Bihar", lat: 25.5941, lon: 85.1376 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.5714 }
];
var getAQICategory = (aqi) => {
  if (aqi <= 50) {
    return {
      status: "Good",
      label: "Saaf (Good)",
      color: "emerald",
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-950/40",
      badgeColor: "bg-emerald-500",
      glowColor: "rgba(16, 185, 129, 0.4)",
      borderColor: "border-emerald-500/30",
      ringColor: "#10B981",
      grap: "Standard Safe",
      summary: "Air quality is pristine and poses virtually no health risk.",
      walkVerdict: "Safe",
      walkVerdictColor: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30",
      walk: "Safe for all outdoor workouts & runs",
      schoolVerdict: "Safe",
      schoolVerdictColor: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30",
      school: "Normal outdoor playtime allowed",
      windowsVerdict: "Open All Day",
      windowsVerdictColor: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30",
      windows: "Safe to keep windows open throughout the day",
      purifierSpeed: "Eco Mode",
      mask: "No mask required"
    };
  }
  if (aqi <= 100) {
    return {
      status: "Moderate",
      label: "Theek (Moderate)",
      color: "amber",
      textColor: "text-amber-400",
      bgColor: "bg-amber-950/40",
      badgeColor: "bg-amber-500",
      glowColor: "rgba(245, 158, 11, 0.4)",
      borderColor: "border-amber-500/30",
      ringColor: "#F59E0B",
      grap: "Advisory Level",
      summary: "Acceptable quality; sensitive individuals may experience mild throat tickle.",
      walkVerdict: "Caution",
      walkVerdictColor: "text-amber-400 bg-amber-950/60 border-amber-500/30",
      walk: "Safe for general public; asthmatics take caution",
      schoolVerdict: "Normal",
      schoolVerdictColor: "text-amber-400 bg-amber-950/60 border-amber-500/30",
      school: "Regular school sports acceptable",
      windowsVerdict: "Midday Window",
      windowsVerdictColor: "text-amber-400 bg-amber-950/60 border-amber-500/30",
      windows: "Best to ventilate between 12 PM - 3 PM",
      purifierSpeed: "Low / Auto",
      mask: "Optional for sensitive groups"
    };
  }
  if (aqi <= 200) {
    return {
      status: "Poor",
      label: "Kharab (Poor)",
      color: "orange",
      textColor: "text-orange-400",
      bgColor: "bg-orange-950/40",
      badgeColor: "bg-orange-500",
      glowColor: "rgba(249, 115, 22, 0.4)",
      borderColor: "border-orange-500/30",
      ringColor: "#F97316",
      grap: "GRAP Stage I",
      summary: "Breathing discomfort to people with lung/heart conditions and children.",
      walkVerdict: "Restricted",
      walkVerdictColor: "text-orange-400 bg-orange-950/60 border-orange-500/30",
      walk: "Avoid intense outdoor jogging or cycling",
      schoolVerdict: "Restricted",
      schoolVerdictColor: "text-orange-400 bg-orange-950/60 border-orange-500/30",
      school: "Curtail prolonged outdoor assemblies",
      windowsVerdict: "12 PM - 3 PM",
      windowsVerdictColor: "text-orange-400 bg-orange-950/60 border-orange-500/30",
      windows: "Open only during peak sunlight (12 PM - 3 PM)",
      purifierSpeed: "Medium",
      mask: "N95 recommended for commute"
    };
  }
  if (aqi <= 300) {
    return {
      status: "Very Poor",
      label: "Bahut Kharab (Very Poor)",
      color: "red",
      textColor: "text-red-400",
      bgColor: "bg-red-950/40",
      badgeColor: "bg-red-500",
      glowColor: "rgba(239, 68, 68, 0.4)",
      borderColor: "border-red-500/30",
      ringColor: "#EF4444",
      grap: "GRAP Stage II",
      summary: "Respiratory illness on prolonged exposure. Significant cardiovascular load.",
      walkVerdict: "Avoid",
      walkVerdictColor: "text-red-400 bg-red-950/60 border-red-500/30",
      walk: "Strictly avoid morning garden runs",
      schoolVerdict: "N95 Mandatory",
      schoolVerdictColor: "text-red-400 bg-red-950/60 border-red-500/30",
      school: "Ensure tight-fit N95 for bus transit",
      windowsVerdict: "Keep Sealed",
      windowsVerdictColor: "text-red-400 bg-red-950/60 border-red-500/30",
      windows: "Keep doors shut; ground inversion trapped",
      purifierSpeed: "High Speed",
      mask: "N95 / FFP2 mandatory"
    };
  }
  return {
    status: "Severe / Hazardous",
    label: "Khatarnak (Hazardous)",
    color: "purple",
    textColor: "text-purple-400",
    bgColor: "bg-purple-950/40",
    badgeColor: "bg-purple-600",
    glowColor: "rgba(168, 85, 247, 0.5)",
    borderColor: "border-purple-500/40",
    ringColor: "#A855F7",
    grap: "GRAP Stage IV Emergency",
    summary: "Health emergency. High toxic micro-particle density; immediate lung irritation.",
    walkVerdict: "Strictly Avoid",
    walkVerdictColor: "text-purple-400 bg-purple-950/70 border-purple-500/40",
    walk: "Do not exercise outside; walk in indoor hallways",
    schoolVerdict: "Stay Indoors",
    schoolVerdictColor: "text-purple-400 bg-purple-950/70 border-purple-500/40",
    school: "Recommend school online classes; seal bus windows",
    windowsVerdict: "Tightly Sealed",
    windowsVerdictColor: "text-purple-400 bg-purple-950/70 border-purple-500/40",
    windows: "Seal gaps with foam tape; do not open",
    purifierSpeed: "Turbo / Max",
    mask: "Certified tight-seal N95/FFP3"
  };
};
async function fetchLiveAirQuality(lat, lon) {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide&hourly=us_aqi,pm2_5&forecast_days=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Air quality data fetch failed");
  const data = await res.json();
  const current = data.current || {};
  const hourly = data.hourly || {};
  const trend = [];
  if (hourly.time && hourly.us_aqi) {
    for (let i = 0; i < Math.min(24, hourly.time.length); i += 3) {
      const date = new Date(hourly.time[i]);
      trend.push({
        time: date.toLocaleTimeString([], { hour: "numeric", hour12: true }),
        aqi: Math.round(hourly.us_aqi[i] || 150),
        pm25: Math.round(hourly.pm2_5?.[i] || 75)
      });
    }
  }
  return {
    aqi: Math.round(current.us_aqi || 160),
    pm25: Math.round(current.pm2_5 || 75),
    pm10: Math.round(current.pm10 || 110),
    no2: Math.round(current.nitrogen_dioxide || 22),
    so2: Math.round(current.sulphur_dioxide || 12),
    o3: Math.round(current.ozone || 35),
    co: Math.round(current.carbon_monoxide || 400),
    updatedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    trend: trend.length > 0 ? trend : [
      { time: "6 AM", aqi: 285, pm25: 165 },
      { time: "9 AM", aqi: 240, pm25: 130 },
      { time: "12 PM", aqi: 155, pm25: 85 },
      { time: "3 PM", aqi: 130, pm25: 68 },
      { time: "6 PM", aqi: 195, pm25: 110 },
      { time: "9 PM", aqi: 250, pm25: 145 }
    ]
  };
}
async function searchCitiesAPI(query) {
  if (!query || query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((item) => ({
    name: item.name,
    state: item.admin1 || item.country || "",
    country: item.country || "",
    lat: item.latitude,
    lon: item.longitude
  }));
}
function VayuGuide() {
  const [city, setCity] = useState(POPULAR_CITIES[0]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
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
  const [indoorActions, setIndoorActions] = useState({
    doorTape: true,
    wetMop: true,
    hepaFilter: false
  });
  const [copiedKey, setCopiedKey] = useState(null);
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem("vg_gemini_key") || "";
    } catch {
      return "";
    }
  });
  const [inputKey, setInputKey] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Namaste! I am your VayuGuide Atmospheric Co-Pilot. Currently in ${city.name}, the AQI is ${airData.aqi} (${getAQICategory(airData.aqi).status}). Ask me about morning walk safety, DIY air filters, child mask sizing, or building society guidelines!`
    }
  ]);
  const [promptInput, setPromptInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const loadCityData = async (targetCity) => {
    setLoading(true);
    try {
      const data = await fetchLiveAirQuality(targetCity.lat, targetCity.lon);
      setAirData(data);
    } catch (e) {
      console.warn("Using fallback live telemetry:", e);
    }
    setLoading(false);
  };
  useEffect(() => {
    loadCityData(city);
  }, [city]);
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const gpsCity = {
          name: "My GPS Location",
          state: "Detected Coordinates",
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };
        setCity(gpsCity);
        await loadCityData(gpsCity);
      },
      () => {
        alert("Please enable location permissions to detect local air quality.");
        setLoading(false);
      }
    );
  };
  const calculateIndoorAQI = () => {
    let current = Math.round(airData.aqi * 0.72);
    if (indoorActions.doorTape) current -= 90;
    if (indoorActions.wetMop) current -= 40;
    if (indoorActions.hepaFilter) current -= 120;
    return Math.max(35, current);
  };
  const indoorAQI = calculateIndoorAQI();
  const indoorCategory = getAQICategory(indoorAQI);
  const aqiCategory = getAQICategory(airData.aqi);
  const cigaretteCount = (airData.aqi / 22).toFixed(1);
  const peakPoint = airData.trend.reduce(
    (max, p) => p.aqi > max.aqi ? p : max,
    airData.trend[0] || { time: "6 AM", aqi: airData.aqi }
  );
  const copyToClipboard = (key, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };
  const handleSendMessage = async (textToSend) => {
    const userMsg = (textToSend || promptInput).trim();
    if (!userMsg) return;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setPromptInput("");
    setAiLoading(true);
    try {
      if (apiKey.trim()) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are VayuGuide, an expert atmospheric scientist and empathetic clean-air advisor for families in India. City: ${city.name}, Current AQI: ${airData.aqi} (${aqiCategory.status}). Answer clearly and crisply in 2-3 friendly sentences. Provide practical low-cost guidance without confusing jargon.

User: ${userMsg}`
                  }
                ]
              }
            ]
          })
        });
        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Keep windows closed during early mornings and wear a fitted N95 mask when outdoors.";
        setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      } else {
        setTimeout(() => {
          let advice = `At AQI ${airData.aqi} in ${city.name}, prioritize keeping children and elders indoors during peak morning inversion hours (6 AM - 10 AM).`;
          if (userMsg.toLowerCase().includes("mask")) {
            advice = "Cloth masks and surgical masks filter under 10% of PM2.5. Always choose a snug-fitting N95 or FFP2 respirator with tight headloops.";
          } else if (userMsg.toLowerCase().includes("walk") || userMsg.toLowerCase().includes("run")) {
            advice = airData.aqi > 200 ? "Outdoor cardio at this AQI forces deep toxic particles into lung alveoli. Shift your workout indoors or walk in closed corridors." : "Morning strolls are fine, but prefer afternoon hours when solar warmth disperses stagnant particulate matter.";
          } else if (userMsg.toLowerCase().includes("filter") || userMsg.toLowerCase().includes("purifier") || userMsg.toLowerCase().includes("diy")) {
            advice = "You can assemble a high-performance DIY air cleaner using a standard \u20B91,200 box fan and taping a \u20B9600 HEPA H13 filter tightly onto the intake.";
          } else if (userMsg.toLowerCase().includes("school") || userMsg.toLowerCase().includes("child")) {
            advice = "Children breathe 50% more air per kg than adults. Request school management to conduct morning assembly in indoor auditoriums.";
          }
          setMessages((prev) => [...prev, { role: "ai", text: advice }]);
          setAiLoading(false);
        }, 500);
        return;
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Unable to reach the AI cloud. Please verify your internet connection or Gemini API key." }
      ]);
    }
    setAiLoading(false);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-[#06060C] text-slate-100 font-sans selection:bg-purple-600 selection:text-white pb-20 relative" }, /* @__PURE__ */ React.createElement("header", { className: "sticky top-0 z-40 px-4 py-3 bg-[#06060C]/70 backdrop-blur-xl border-b border-purple-500/10" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-6xl mx-auto flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.6)]" }, /* @__PURE__ */ React.createElement(Wind, { size: 20, className: "stroke-[2.5]" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", { className: "font-display font-extrabold text-lg tracking-tight text-white leading-none" }, "VayuGuide"), /* @__PURE__ */ React.createElement("span", { className: "text-purple-400 text-xs" }, "\u2726")), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400 font-medium tracking-wide" }, "Clean Air Intelligence"))), /* @__PURE__ */ React.createElement("nav", { className: "hidden md:flex items-center gap-1 p-1 bg-[#100E22]/90 border border-purple-500/20 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)]" }, [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "forecast", label: "24h Forecast", icon: Clock },
    { id: "indoor", label: "Indoor Shield", icon: ShieldCheck },
    { id: "whatsapp", label: "WhatsApp Hub", icon: MessageSquare },
    { id: "ai", label: "AI Advisor", icon: Bot }
  ].map((tab) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: tab.id,
        onClick: () => setActiveTab(tab.id),
        className: `flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${isActive ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.6)]" : "text-slate-400 hover:text-white hover:bg-white/5"}`
      },
      /* @__PURE__ */ React.createElement(Icon, { size: 13 }),
      /* @__PURE__ */ React.createElement("span", null, tab.label)
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setIsSearchOpen(true),
      className: "flex items-center gap-2 px-3.5 py-1.5 bg-[#141228] hover:bg-[#1B1836] rounded-full text-xs font-semibold text-slate-200 border border-purple-500/25 transition-all shadow-sm hover:border-purple-400/50"
    },
    /* @__PURE__ */ React.createElement(MapPin, { size: 13, className: "text-purple-400" }),
    /* @__PURE__ */ React.createElement("span", { className: "max-w-28 truncate" }, city.name),
    /* @__PURE__ */ React.createElement(Search, { size: 12, className: "text-slate-400" })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleDetectGPS,
      title: "Detect GPS Location",
      className: "p-2 bg-[#141228] hover:bg-[#1B1836] rounded-full text-purple-400 border border-purple-500/25 transition-all hover:text-white"
    },
    /* @__PURE__ */ React.createElement(Crosshair, { size: 14, className: loading ? "animate-spin" : "" })
  ))), /* @__PURE__ */ React.createElement("div", { className: "md:hidden flex items-center gap-1 overflow-x-auto no-scrollbar pt-2.5 pb-0.5" }, [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "forecast", label: "24h Forecast", icon: Clock },
    { id: "indoor", label: "Indoor Shield", icon: ShieldCheck },
    { id: "whatsapp", label: "WhatsApp Hub", icon: MessageSquare },
    { id: "ai", label: "AI Advisor", icon: Bot }
  ].map((tab) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: tab.id,
        onClick: () => setActiveTab(tab.id),
        className: `flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${isActive ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.6)]" : "text-slate-400 bg-white/5 hover:text-white"}`
      },
      /* @__PURE__ */ React.createElement(Icon, { size: 12 }),
      /* @__PURE__ */ React.createElement("span", null, tab.label)
    );
  }))), /* @__PURE__ */ React.createElement("section", { className: "relative pt-8 pb-6 px-4 text-center max-w-4xl mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-4 backdrop-blur-md shadow-[0_0_20px_rgba(147,51,234,0.2)]" }, /* @__PURE__ */ React.createElement(Sparkles, { size: 13, className: "text-purple-400" }), /* @__PURE__ */ React.createElement("span", null, "Real-Time Atmospheric Telemetry & Decision Engine")), /* @__PURE__ */ React.createElement("h1", { className: "text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight" }, "Elevate Family Health With ", /* @__PURE__ */ React.createElement("br", { className: "hidden sm:inline" }), /* @__PURE__ */ React.createElement("span", { className: "bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent" }, "Precision Air Intelligence")), /* @__PURE__ */ React.createElement("p", { className: "mt-3 text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed" }, "Hyperlocal atmospheric monitoring, predictive 24-hour smog hazard modeling, and pediatric-safe lifestyle protocols for Indian homes."), /* @__PURE__ */ React.createElement("div", { className: "mt-6 flex items-center justify-center gap-1.5 flex-wrap" }, POPULAR_CITIES.slice(0, 6).map((c) => {
    const isSelected = city.name === c.name;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: c.name,
        onClick: () => setCity(c),
        className: `px-3 py-1 rounded-full text-xs font-semibold transition-all ${isSelected ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.7)] border border-purple-400" : "bg-[#111024] text-slate-400 hover:text-white hover:bg-[#191836] border border-purple-500/15"}`
      },
      c.name
    );
  }), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setIsSearchOpen(true),
      className: "px-3 py-1 rounded-full text-xs font-semibold bg-[#111024] text-purple-400 hover:text-purple-300 hover:bg-[#191836] border border-purple-500/25 flex items-center gap-1"
    },
    /* @__PURE__ */ React.createElement(Search, { size: 11 }),
    /* @__PURE__ */ React.createElement("span", null, "More Cities")
  ))), /* @__PURE__ */ React.createElement("main", { className: "max-w-5xl mx-auto px-4 space-y-6" }, activeTab === "dashboard" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6 animate-fadeIn" }, /* @__PURE__ */ React.createElement("div", { className: "relative rounded-3xl bg-[#0D0C1D]/85 backdrop-blur-2xl border border-purple-500/25 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700",
      style: { background: aqiCategory.glowColor }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-purple-500/15" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" }), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono font-bold tracking-wider text-slate-300 uppercase" }, "LIVE SENSOR TELEMETRY \u2014 ", city.name.toUpperCase()), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-500 font-mono" }, "(Updated ", airData.updatedAt, ")")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => loadCityData(city),
      disabled: loading,
      className: "flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181630] hover:bg-[#232044] text-xs font-semibold text-slate-300 border border-purple-500/20 transition-colors"
    },
    /* @__PURE__ */ React.createElement(RefreshCw, { size: 12, className: loading ? "animate-spin text-purple-400" : "" }),
    /* @__PURE__ */ React.createElement("span", null, "Sync Feed")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setIsSearchOpen(true),
      className: "flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181630] hover:bg-[#232044] text-xs font-semibold text-purple-300 border border-purple-500/20 transition-colors"
    },
    /* @__PURE__ */ React.createElement(MapPin, { size: 12 }),
    /* @__PURE__ */ React.createElement("span", null, "Change City")
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center" }, /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-5 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#15132B] border border-purple-500/30" }, /* @__PURE__ */ React.createElement(
    "span",
    {
      className: "w-2 h-2 rounded-full",
      style: { background: aqiCategory.ringColor }
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold font-mono uppercase tracking-wider text-slate-200" }, aqiCategory.status), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-purple-400 font-bold px-1.5 py-0.2 rounded bg-purple-950/80" }, aqiCategory.grap)), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest block" }, "US-EPA Air Quality Index"), /* @__PURE__ */ React.createElement("div", { className: "flex items-baseline gap-3" }, /* @__PURE__ */ React.createElement(
    "span",
    {
      className: "font-mono font-black text-6xl sm:text-7xl md:text-8xl tracking-tighter",
      style: {
        color: aqiCategory.ringColor,
        textShadow: `0 0 35px ${aqiCategory.glowColor}`
      }
    },
    airData.aqi
  ), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-bold text-slate-400 uppercase font-mono" }, "AQI"))), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-300 leading-relaxed font-medium" }, aqiCategory.summary), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 p-3 rounded-2xl bg-[#141229] border border-purple-500/20 text-xs text-slate-300 shadow-inner" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl" }, "\u{1F6AC}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-400 block font-medium" }, "Berkeley Earth Lung Inhalation Index"), /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, "Equivalent to smoking", " ", /* @__PURE__ */ React.createElement("strong", { className: "font-mono text-purple-300 text-sm font-bold" }, cigaretteCount, " cigarettes"), " ", "today")))), /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-7 bg-[#121026]/90 p-5 rounded-2xl border border-purple-500/20 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between pb-2 border-b border-purple-500/10" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-display font-bold text-sm text-white" }, "24-Hour Smog Dispersion Flow"), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-400 font-medium" }, "Thermal Inversion & Boundary Layer Trajectory")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold" }, /* @__PURE__ */ React.createElement(Sun, { size: 12 }), /* @__PURE__ */ React.createElement("span", null, "Safest: 12 PM - 3 PM"))), /* @__PURE__ */ React.createElement("div", { className: "pt-6 pb-2" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-6 gap-2 sm:gap-3 items-end h-48" }, airData.trend.map((point, index) => {
    const isPeak = point.aqi === peakPoint.aqi;
    const isSafe = point.time.includes("12 PM") || point.time.includes("3 PM");
    const heightPct = Math.min(95, Math.max(22, point.aqi / 350 * 100));
    return /* @__PURE__ */ React.createElement("div", { key: index, className: "flex flex-col items-center h-full justify-end group" }, isPeak ? /* @__PURE__ */ React.createElement("div", { className: "mb-2 flex flex-col items-center animate-bounce" }, /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-mono font-bold shadow-[0_0_15px_rgba(168,85,247,0.8)] whitespace-nowrap" }, "Peak ", point.aqi), /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 rounded-full bg-white ring-4 ring-purple-500 shadow-[0_0_10px_white] mt-0.5" })) : /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity" }, point.aqi), /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-[42px] bg-[#1A1838] rounded-full overflow-hidden p-1 flex flex-col justify-end h-32 border border-purple-500/15" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `w-full rounded-full transition-all duration-700 ${isPeak ? "bg-gradient-to-t from-purple-700 via-purple-500 to-violet-400 shadow-[0_0_20px_rgba(168,85,247,0.7)]" : isSafe ? "bg-gradient-to-t from-emerald-800 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-gradient-to-t from-[#2E2856] to-[#4C3F8C]"}`,
        style: { height: `${heightPct}%` }
      }
    )), /* @__PURE__ */ React.createElement(
      "span",
      {
        className: `text-[11px] font-mono mt-2 font-semibold ${isPeak ? "text-purple-300 font-bold" : isSafe ? "text-emerald-400 font-bold" : "text-slate-400"}`
      },
      point.time
    ));
  })))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3 px-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-purple-400 text-xs" }, "\u2726"), /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold uppercase tracking-wider text-slate-400 font-mono" }, "10-Second Morning Protocol Verdicts")), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-500 font-mono" }, "Zero Guesswork")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-mono uppercase tracking-wider text-slate-400" }, "01 / MORNING WALK"), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: `text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${aqiCategory.walkVerdictColor}`
    },
    aqiCategory.walkVerdict
  )), /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-bold text-white leading-snug" }, aqiCategory.walk)), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-3 pt-3 border-t border-purple-500/10" }, airData.aqi > 200 ? "Shift cardio indoors. Deep inhalation of PM2.5 bypasses nasal cilia." : "Safe for regular outdoor jogging and morning strolls.")), /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-mono uppercase tracking-wider text-slate-400" }, "02 / KIDS COMMUTE"), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: `text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${aqiCategory.schoolVerdictColor}`
    },
    aqiCategory.schoolVerdict
  )), /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-bold text-white leading-snug" }, aqiCategory.mask)), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-3 pt-3 border-t border-purple-500/10" }, "Fasten child-sized N95 mask before stepping into the school bus queue.")), /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-mono uppercase tracking-wider text-slate-400" }, "03 / VENTILATION"), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: `text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${aqiCategory.windowsVerdictColor}`
    },
    aqiCategory.windowsVerdict
  )), /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-bold text-white leading-snug" }, aqiCategory.windows)), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-3 pt-3 border-t border-purple-500/10" }, "Afternoon solar radiation breaks ground thermal inversion layer.")), /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-mono uppercase tracking-wider text-slate-400" }, "04 / HEPA PURIFIER"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30" }, aqiCategory.purifierSpeed)), /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-bold text-white leading-snug" }, "Indoor Air Recirculation")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-3 pt-3 border-t border-purple-500/10" }, "Keep bedroom door closed to achieve 4 air changes per hour (ACH).")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3 px-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-purple-400 text-xs" }, "\u2726"), /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold uppercase tracking-wider text-slate-400 font-mono" }, "Multi-Pollutant Telemetry Bento (\xB5g/m\xB3)")), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-500 font-mono" }, "WHO Standard Calibrated")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all relative overflow-hidden group" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono text-slate-400" }, "PM2.5 (Fine Smog)"), /* @__PURE__ */ React.createElement(Flame, { size: 14, className: "text-purple-400" })), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-2xl md:text-3xl text-white block my-1" }, airData.pm25), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-semibold text-red-400" }, airData.pm25 > 15 ? `${Math.round(airData.pm25 / 15)}x WHO Limit` : "Within safe range")), /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all relative overflow-hidden group" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono text-slate-400" }, "PM10 (Coarse Dust)"), /* @__PURE__ */ React.createElement(Wind, { size: 14, className: "text-amber-400" })), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-2xl md:text-3xl text-white block my-1" }, airData.pm10), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-semibold text-amber-400" }, airData.pm10 > 45 ? `${Math.round(airData.pm10 / 45)}x WHO Limit` : "Within safe range")), /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all relative overflow-hidden group" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono text-slate-400" }, "NO\u2082 (Vehicle Exhaust)"), /* @__PURE__ */ React.createElement(Activity, { size: 14, className: "text-indigo-400" })), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-2xl md:text-3xl text-white block my-1" }, airData.no2), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-400" }, "Urban Traffic Inflow")), /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-[#0E0D1B]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all relative overflow-hidden group" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono text-slate-400" }, "Ozone (O\u2083)"), /* @__PURE__ */ React.createElement(Sun, { size: 14, className: "text-cyan-400" })), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-2xl md:text-3xl text-white block my-1" }, airData.o3), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-400" }, "Sunlight Photochemical"))))), activeTab === "forecast" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6 animate-fadeIn" }, /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/15" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-display font-extrabold text-lg text-white" }, "24-Hour Smog Dispersion Trajectory"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, "Modeled particulate density across diurnal temperature inversion cycles")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-xs font-bold" }, /* @__PURE__ */ React.createElement(Sun, { size: 13 }), /* @__PURE__ */ React.createElement("span", null, "Safest Window: 12:00 PM \u2013 3:00 PM"))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3" }, airData.trend.map((point, index) => {
    const cat = getAQICategory(point.aqi);
    const isSafeWindow = point.time.includes("12 PM") || point.time.includes("3 PM");
    const isPeak = point.aqi === peakPoint.aqi;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: index,
        className: `p-4 rounded-2xl border text-center transition-all ${isPeak ? "bg-purple-950/50 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.3)]" : isSafeWindow ? "bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-[#111025] border-purple-500/15"}`
      },
      /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono font-bold text-slate-400 block" }, point.time),
      /* @__PURE__ */ React.createElement(
        "span",
        {
          className: "font-mono font-black text-3xl block my-1.5",
          style: { color: cat.ringColor }
        },
        point.aqi
      ),
      /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold uppercase tracking-wider block text-slate-300" }, cat.status),
      isSafeWindow && /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-extrabold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full mt-2 inline-block border border-emerald-500/30" }, "Safe Air Out"),
      isPeak && /* @__PURE__ */ React.createElement("span", { className: "text-[9px] font-extrabold text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full mt-2 inline-block border border-purple-500/30" }, "Peak Smog")
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-[#141228] border border-purple-500/20 text-xs space-y-2" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-purple-300 block" }, "Why does AQI drop sharply between 12 PM and 3 PM in Indian cities?"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-300 leading-relaxed" }, 'During winter nights, the ground cools rapidly, creating a shallow "Thermal Inversion Lid" that traps vehicle exhaust, biomass smoke, and dust near breathing level. When midday sunlight heats the surface, convective updrafts break through the inversion layer, dispersing particulate concentrations temporarily into the upper atmosphere.')))), activeTab === "indoor" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6 animate-fadeIn" }, /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/15" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-display font-extrabold text-lg text-white" }, "Indoor Air Simulator: Before vs. After"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, "Outdoor smog infiltrates homes within 45 minutes unless sealed and scrubbed")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono text-slate-400" }, "Simulated Bedroom:"), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: "font-mono font-black text-2xl",
      style: { color: indoorCategory.ringColor }
    },
    "~",
    indoorAQI,
    " AQI"
  ), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: "text-[10px] font-bold px-2 py-0.5 rounded-full border",
      style: {
        color: indoorCategory.ringColor,
        borderColor: indoorCategory.ringColor
      }
    },
    indoorCategory.status
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono font-bold uppercase tracking-wider text-red-400 block" }, "\u274C Unsealed / No Action Taken"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-black text-4xl text-red-400 my-1.5 block" }, "~", Math.round(airData.aqi * 0.72), " AQI"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Outdoor particulates seep through door gaps and dry sweeping kicks dust up.")), /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block" }, "\u2705 With 3 Frugal Interventions"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-black text-4xl text-emerald-400 my-1.5 block" }, "~", indoorAQI, " AQI"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Seals prevent draft intrusion; HEPA filtration scrubs recirculated air."))), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 pt-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block" }, "Toggle steps you have applied at your home:"), [
    {
      key: "doorTape",
      title: "1. Apply Door Gap Foam Weatherstrip Tape",
      desc: "\u20B999 self-adhesive high-density EVA foam along entrance door frame and balcony sliders.",
      benefit: "-90 AQI"
    },
    {
      key: "wetMop",
      title: "2. Mandate Wet Damp Mopping (Geela Pocha)",
      desc: "Prohibit dry brooms (jhadu) which resuspend settled PM2.5 micro-dust directly into your breathing zone.",
      benefit: "-40 AQI"
    },
    {
      key: "hepaFilter",
      title: "3. Run HEPA Purifier or DIY Box-Fan in Sealed Bedroom",
      desc: "Run on medium/high speed with doors shut to achieve 4 clean air changes per hour (ACH).",
      benefit: "-120 AQI"
    }
  ].map((step) => {
    const active = indoorActions[step.key];
    return /* @__PURE__ */ React.createElement(
      "label",
      {
        key: step.key,
        className: `flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${active ? "bg-purple-950/30 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "bg-[#111025] border-purple-500/15 hover:border-purple-500/30"}`
      },
      /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "checkbox",
          checked: active,
          onChange: (e) => setIndoorActions({ ...indoorActions, [step.key]: e.target.checked }),
          className: "mt-1 h-4 w-4 rounded accent-purple-600 cursor-pointer"
        }
      ),
      /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-white" }, step.title), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-[11px] font-extrabold text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-500/30 shrink-0" }, step.benefit)), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, step.desc))
    );
  }))), /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-4" }, /* @__PURE__ */ React.createElement("h3", { className: "font-display font-extrabold text-base text-white" }, "Frugal Low-Emission Lifestyle Swaps"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3" }, [
    {
      from: "\u{1FA94} Incense & Dhoop",
      to: "\u{1F4A1} LED Diya / Essential Oil",
      impact: "Reduces indoor PM2.5 by 40%",
      cost: "\u20B949"
    },
    {
      from: "\u{1FAA8} Coal Sigdi for Guards",
      to: "\u26A1 Halogen Radiant Heater",
      impact: "Eliminates toxic ground smoke",
      cost: "\u20B9899"
    },
    {
      from: "\u{1F9F9} Dry Brooming (Jhadu)",
      to: "\u{1FAE7} Wet Damp Mopping",
      impact: "Traps settled micro-dust",
      cost: "\u20B90"
    }
  ].map((swap, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "p-4 rounded-2xl bg-[#111025] border border-purple-500/20 space-y-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-500 line-through block font-medium" }, swap.from), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-white block" }, swap.to), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-semibold text-emerald-400 block" }, swap.impact), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400 font-mono block" }, "Cost: ", swap.cost)))))), activeTab === "whatsapp" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6 animate-fadeIn" }, /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-display font-extrabold text-lg text-white" }, "1-Tap WhatsApp Society & Family Hub"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, "Mobilize your apartment society (RWA), protect housekeeping staff, and alert loved ones")), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, [
    {
      id: "guardHeater",
      title: "\u{1F525} Sponsor Guard Halogen Heaters",
      purpose: "Stop security guards from burning scrap wood & plastic for warmth",
      text: `Dear Neighbors & RWA Committee, Tonight ${city.name} AQI is touching ${airData.aqi} (${aqiCategory.status}). Our security guards sit in freezing cold wind for 12-hour shifts. When they burn scrap wood to keep warm, toxic smoke enters our balconies.

\u{1F4A1} Proposal: Let's pool together \u20B9150 per flat to sponsor 4 Halogen radiant heaters (\u20B9899 each) and blankets for every guard booth. Who would like to contribute? \u{1F64F}`
    },
    {
      id: "moppingNotice",
      title: "\u{1F9F9} Mandate Damp Mopping (Ban Dry Brooms)",
      purpose: "Send to Estate Manager to prevent micro-dust resuspension in corridors",
      text: `\u{1F6A8} URGENT NOTICE TO ESTATE MANAGER & HOUSEKEEPING STAFF
Due to severe air quality in ${city.name} (AQI ${airData.aqi}):
1. STOP all dry broom sweeping (Jhadu) in tower lobbies and corridors \u2014 it kicks fine PM2.5 back into our lungs.
2. MANDATE damp mopping (Geela Pocha) twice daily.
Thank you for protecting our building's air! \u{1F64F}`
    },
    {
      id: "familyWarning",
      title: "\u26A0\uFE0F Family Smog Warning (Cigarette Equivalent)",
      purpose: "Alert family group to skip morning garden walks and wear N95",
      text: `\u26A0\uFE0F Family Health Alert (${city.name} AQI ${airData.aqi}):
Breathing today's outdoor air is equivalent to smoking ${cigaretteCount} cigarettes.
\u2022 Papa/Mummy: Please skip the morning garden walk; walk in the corridor instead.
\u2022 Kids: Wear tight-fitting N95 mask before stepping out for the school bus.
\u2022 Keep balcony doors closed until 1 PM. Stay safe! \u2764\uFE0F`
    }
  ].map((item) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: item.id,
      className: "p-4 md:p-5 rounded-2xl bg-[#121026] border border-purple-500/20 space-y-3"
    },
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "text-xs font-bold text-white" }, item.title), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400" }, item.purpose)),
    /* @__PURE__ */ React.createElement("div", { className: "p-3.5 bg-[#090815] rounded-xl border border-purple-500/15 text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto" }, item.text),
    /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 pt-1" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => copyToClipboard(item.id, item.text),
        className: "flex-1 py-2 px-3 bg-[#1A1838] hover:bg-[#25234E] text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-purple-500/20"
      },
      copiedKey === item.id ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(CheckCircle2, { size: 13, className: "text-emerald-400" }), /* @__PURE__ */ React.createElement("span", null, "Copied to Clipboard!")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Copy, { size: 13 }), /* @__PURE__ */ React.createElement("span", null, "Copy Message"))
    ), /* @__PURE__ */ React.createElement(
      "a",
      {
        href: `https://wa.me/?text=${encodeURIComponent(item.text)}`,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,211,102,0.4)]"
      },
      /* @__PURE__ */ React.createElement(MessageSquare, { size: 13 }),
      /* @__PURE__ */ React.createElement("span", null, "Send on WhatsApp")
    ))
  ))))), activeTab === "ai" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6 animate-fadeIn" }, /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/15" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.4)]" }, /* @__PURE__ */ React.createElement(Bot, { size: 18 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-display font-extrabold text-base text-white" }, "VayuGuide Atmospheric Co-Pilot"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Personalized clean-air scientific consultation"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "password",
      placeholder: "Gemini API Key (Optional)",
      value: inputKey,
      onChange: (e) => setInputKey(e.target.value),
      className: "text-xs px-3 py-1.5 bg-[#121026] border border-purple-500/25 rounded-xl outline-none focus:border-purple-400 w-44 text-slate-200 placeholder-slate-500"
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        if (inputKey.trim()) {
          localStorage.setItem("vg_gemini_key", inputKey.trim());
          setApiKey(inputKey.trim());
          alert("API key saved securely in browser localStorage!");
        }
      },
      className: "text-xs font-semibold px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all"
    },
    "Save"
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 max-h-80 overflow-y-auto pr-1" }, messages.map((msg, index) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: index,
      className: `flex ${msg.role === "user" ? "justify-end" : "justify-start"}`
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${msg.role === "user" ? "bg-purple-600 text-white rounded-br-sm shadow-[0_0_15px_rgba(147,51,234,0.4)]" : "bg-[#141228] text-slate-200 rounded-bl-sm border border-purple-500/20"}`
      },
      msg.text
    )
  )), aiLoading && /* @__PURE__ */ React.createElement("div", { className: "flex justify-start" }, /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-[#141228] rounded-2xl text-xs text-purple-300 border border-purple-500/20 animate-pulse" }, "Analyzing atmospheric data & formulating guidance..."))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1" }, [
    "Is morning walk safe today?",
    "How to build a DIY box-fan air purifier?",
    "Which mask is safe for school kids?",
    "Should I open windows right now?"
  ].map((chip, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: i,
      onClick: () => handleSendMessage(chip),
      className: "px-3 py-1 rounded-full bg-[#141228] hover:bg-[#1D1A3B] text-[11px] text-purple-300 border border-purple-500/20 whitespace-nowrap transition-colors"
    },
    chip
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 pt-2 border-t border-purple-500/15" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Ask a question (e.g. Is morning walk safe in Delhi? How to seal door gaps?)",
      value: promptInput,
      onChange: (e) => setPromptInput(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && handleSendMessage(),
      className: "flex-1 bg-[#121026] border border-purple-500/25 rounded-2xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-purple-400 transition-colors"
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleSendMessage(),
      disabled: aiLoading,
      className: "px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all"
    },
    /* @__PURE__ */ React.createElement(Send, { size: 14 })
  ))))), isSearchOpen && /* @__PURE__ */ React.createElement(
    CitySearchModal,
    {
      isOpen: isSearchOpen,
      onClose: () => setIsSearchOpen(false),
      onSelectCity: (newCity) => {
        setCity(newCity);
        setIsSearchOpen(false);
      },
      onDetectGPS: () => {
        handleDetectGPS();
        setIsSearchOpen(false);
      }
    }
  ));
}
function CitySearchModal({ isOpen, onClose, onSelectCity, onDetectGPS }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await searchCitiesAPI(query);
      setResults(res);
      setSearching(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [query]);
  if (!isOpen) return null;
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-[#06060C]/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-md bg-[#0E0D1B] rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-purple-500/30 max-h-[85vh] flex flex-col space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between pb-3 border-b border-purple-500/15" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-display font-extrabold text-base text-white" }, "Select City"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Live air quality across Indian cities")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onClose,
      className: "p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
    },
    /* @__PURE__ */ React.createElement(X, { size: 18 })
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onDetectGPS,
      className: "w-full py-2.5 px-3 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-purple-500/30 transition-all shadow-[0_0_15px_rgba(147,51,234,0.2)]"
    },
    /* @__PURE__ */ React.createElement(Crosshair, { size: 14, className: "text-purple-400" }),
    /* @__PURE__ */ React.createElement("span", null, "Detect Current GPS Location")
  ), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Search, { size: 15, className: "absolute left-3.5 top-3 text-slate-400" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search any Indian city (e.g. Pune, Jaipur, Lucknow, Patna...)",
      value: query,
      onChange: (e) => setQuery(e.target.value),
      autoFocus: true,
      className: "w-full pl-9 pr-4 py-2.5 bg-[#141226] border border-purple-500/25 rounded-xl text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-purple-400 transition-colors"
    }
  ), searching && /* @__PURE__ */ React.createElement("div", { className: "absolute right-3.5 top-3" }, /* @__PURE__ */ React.createElement(RefreshCw, { size: 13, className: "animate-spin text-purple-400" }))), /* @__PURE__ */ React.createElement("div", { className: "overflow-y-auto space-y-1 flex-1 max-h-60 pr-1" }, results.length > 0 ? results.map((c, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: i,
      onClick: () => onSelectCity(c),
      className: "w-full p-2.5 rounded-xl text-left hover:bg-[#181630] flex items-center justify-between text-xs transition-colors border border-transparent hover:border-purple-500/20"
    },
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-white block" }, c.name), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-400" }, c.state ? `${c.state}, ` : "", c.country)),
    /* @__PURE__ */ React.createElement(ChevronRight, { size: 14, className: "text-purple-400" })
  )) : query.length >= 2 && !searching ? /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 text-center py-4" }, 'No cities found matching "', query, '".') : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 px-1 block" }, "Popular Cities"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-1.5" }, POPULAR_CITIES.map((c, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: i,
      onClick: () => onSelectCity(c),
      className: "p-2.5 rounded-xl bg-[#141226] hover:bg-[#1B1834] text-left transition-colors border border-purple-500/15 hover:border-purple-500/30"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-bold text-xs text-slate-200 block truncate" }, c.name),
    /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400 block truncate" }, c.state)
  )))))));
}
export {
  VayuGuide as default
};
