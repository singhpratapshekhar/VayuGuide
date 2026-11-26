/**
 * US-EPA AQI categorization, GRAP stage mapping, and protective advice helper.
 * @module utils/aqi
 */

/**
 * Compute AQI severity category, styling tokens, and protective verdicts.
 * @param {number} rawAqi
 * @returns {object}
 */
export const getAQICategory = (rawAqi) => {
  const aqi = Number.isFinite(Number(rawAqi)) ? Math.max(0, Number(rawAqi)) : 0;

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
