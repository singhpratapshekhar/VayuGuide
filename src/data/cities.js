/**
 * Curated Indian urban centers and location profile inference helpers.
 * @module data/cities
 */

export const POPULAR_CITIES = [
  {
    name: "Delhi NCR",
    state: "Delhi",
    lat: 28.6139,
    lon: 77.209,
    regionType: "indo-gangetic",
    smogDrivers: "Nocturnal thermal inversion + vehicular exhaust + regional stubble & biomass plume",
    localTip: "Ground-level inversion peaks between 6–9 AM; ventilate strictly during 1–3 PM solar lift."
  },
  {
    name: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4499,
    lon: 80.3319,
    regionType: "industrial",
    smogDrivers: "Industrial corridor particulates + brick kiln emissions + stagnant winter fog",
    localTip: "Coarse dust & kiln soot settle indoors fast; prioritize door foam seals and wet mopping twice daily."
  },
  {
    name: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8467,
    lon: 80.9462,
    regionType: "indo-gangetic",
    smogDrivers: "Evening traffic congestion + low wind speed nocturnal stagnation",
    localTip: "Shift evening outdoor errands before 5:30 PM when boundary layer begins collapsing."
  },
  {
    name: "Patna",
    state: "Bihar",
    lat: 25.5941,
    lon: 85.1376,
    regionType: "indo-gangetic",
    smogDrivers: "Gangetic river valley moisture fog trap + construction dust + biomass heating",
    localTip: "High winter humidity binds PM2.5 into persistent haze; keep bedroom HEPA or DIY fan running overnight."
  },
  {
    name: "Mumbai",
    state: "Maharashtra",
    lat: 19.076,
    lon: 72.8777,
    regionType: "coastal",
    smogDrivers: "Coastal moisture inversion + construction dust + diesel corridor traffic",
    localTip: "Land-sea breeze reversal traps haze mid-morning; afternoon sea breeze (1–4 PM) offers cleanest cross-ventilation."
  },
  {
    name: "Kolkata",
    state: "West Bengal",
    lat: 22.5726,
    lon: 88.3639,
    regionType: "coastal",
    smogDrivers: "Old commercial diesel fleet + winter biomass smoke + river delta humidity",
    localTip: "Avoid roadside morning walks near busy intersections; use tight-seal N95 during evening transit."
  },
  {
    name: "Bengaluru",
    state: "Karnataka",
    lat: 12.9716,
    lon: 77.5946,
    regionType: "peninsular",
    smogDrivers: "Traffic corridor NO₂ + road dust resuspension + cool morning mist",
    localTip: "Pollutant spikes concentrate near major arterial roads; keep car/bus windows shut in traffic."
  },
  {
    name: "Pune",
    state: "Maharashtra",
    lat: 18.5204,
    lon: 73.8567,
    regionType: "peninsular",
    smogDrivers: "Valley topography trapping two-wheeler exhaust + construction particulates",
    localTip: "Cool dawn valley air holds exhaust low until 9:30 AM; time outdoor exercise for late afternoon."
  },
  {
    name: "Hyderabad",
    state: "Telangana",
    lat: 17.385,
    lon: 78.4867,
    regionType: "peninsular",
    smogDrivers: "Urban vehicular corridors + dry winter dust",
    localTip: "Use damp mopping over dry sweeping to cut indoor settled PM10 dust by half."
  },
  {
    name: "Jaipur",
    state: "Rajasthan",
    lat: 26.9124,
    lon: 75.7873,
    regionType: "indo-gangetic",
    smogDrivers: "Arid mineral dust + winter inversion + evening biomass burning",
    localTip: "Keep balcony sliders sealed with EVA foam strips to block fine desert-urban dust."
  },
  {
    name: "Ahmedabad",
    state: "Gujarat",
    lat: 23.0225,
    lon: 72.5714,
    regionType: "industrial",
    smogDrivers: "Industrial belt aerosols + dry dust + peak-hour traffic emissions",
    localTip: "Use recirculate mode in cars and N95 respirators on two-wheelers during morning rush."
  }
];

/**
 * Infer smog drivers and local clean-air guidance from city metadata or pollutant ratios.
 * @param {object} city
 * @param {object} airData
 * @returns {{ smogDrivers: string, localTip: string, regionType: string }}
 */
export function inferLocationProfile(city, airData) {
  if (city?.smogDrivers && city?.localTip) {
    return {
      smogDrivers: city.smogDrivers,
      localTip: city.localTip,
      regionType: city.regionType || "urban"
    };
  }

  const pm25 = Number(airData?.pm25 ?? 0);
  const pm10 = Number(airData?.pm10 ?? 1);
  const no2 = Number(airData?.no2 ?? 0);
  const lat = Number(city?.lat ?? 0);
  const pmRatio = pm25 / Math.max(1, pm10);

  if (no2 > 40) {
    return {
      smogDrivers: "High vehicular NO₂ exhaust + urban traffic corridor buildup",
      localTip: "Avoid roadside exercise during rush hours; switch AC/car vents to internal recirculation.",
      regionType: "traffic"
    };
  }
  if (pmRatio > 0.65 || lat > 24) {
    return {
      smogDrivers: "Fine combustion PM2.5 + winter nocturnal thermal inversion",
      localTip: "Keep doors sealed until midday solar warming breaks the ground inversion lid (12–3 PM).",
      regionType: "indo-gangetic"
    };
  }
  return {
    smogDrivers: "Mixed urban road dust + morning boundary-layer stagnation",
    localTip: "Ventilate briefly during peak sunlight and prefer damp mopping indoors.",
    regionType: "urban"
  };
}
