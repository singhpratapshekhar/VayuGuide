/**
 * Open-Meteo Air Quality & Geocoding API clients with coordinate validation,
 * rate limiting, and AbortController timeouts.
 * @module services/airQualityApi
 */

import { RateLimiter, sanitizeText, validateCoordinates } from "../utils/security.js";

const DEFAULT_TIMEOUT_MS = 10000;
const searchRateLimiter = new RateLimiter({ maxRequests: 20, windowMs: 60000, cooldownMs: 250 });

const FALLBACK_TREND = [
  { time: "6 AM", aqi: 285, pm25: 165 },
  { time: "9 AM", aqi: 240, pm25: 130 },
  { time: "12 PM", aqi: 155, pm25: 85 },
  { time: "3 PM", aqi: 130, pm25: 68 },
  { time: "6 PM", aqi: 195, pm25: 110 },
  { time: "9 PM", aqi: 250, pm25: 145 }
];

/**
 * Fetch with an AbortController timeout.
 * @param {string} url
 * @param {RequestInit} [options={}]
 * @param {number} [timeoutMs=DEFAULT_TIMEOUT_MS]
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch live air quality and hourly diurnal trend from Open-Meteo.
 * @param {number} lat
 * @param {number} lon
 */
export async function fetchLiveAirQuality(lat, lon) {
  const coords = validateCoordinates(lat, lon);
  if (!coords.valid) {
    throw new Error("Invalid coordinates supplied for air quality lookup");
  }

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=us_aqi,pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide&hourly=us_aqi,pm2_5&forecast_days=1`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error("Air quality data fetch failed");
  const data = await res.json();
  const current = data?.current || {};
  const hourly = data?.hourly || {};

  const trend = [];
  if (Array.isArray(hourly.time) && Array.isArray(hourly.us_aqi) && hourly.time.length >= 22) {
    const targetHours = [6, 9, 12, 15, 18, 21];
    for (const idx of targetHours) {
      const date = new Date(hourly.time[idx]);
      trend.push({
        time: date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
        aqi: Math.round(hourly.us_aqi[idx] || 150),
        pm25: Math.round(hourly.pm2_5?.[idx] || 75)
      });
    }
  } else if (Array.isArray(hourly.time) && Array.isArray(hourly.us_aqi)) {
    for (let i = 0; i < Math.min(24, hourly.time.length); i += 3) {
      const date = new Date(hourly.time[i]);
      trend.push({
        time: date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
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
    updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    trend: trend.length > 0 ? trend : FALLBACK_TREND
  };
}

/**
 * Search cities via Open-Meteo Geocoding API with input sanitization and rate limiting.
 * @param {string} rawQuery
 */
export async function searchCitiesAPI(rawQuery) {
  const query = sanitizeText(rawQuery, 80);
  if (query.length < 2) return [];

  const limit = searchRateLimiter.tryAcquire();
  if (!limit.allowed) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.results || [])
    .filter((item) => validateCoordinates(item.latitude, item.longitude).valid)
    .map((item) => ({
      name: sanitizeText(item.name, 80),
      state: sanitizeText(item.admin1 || item.country || "", 80),
      country: sanitizeText(item.country || "", 80),
      lat: Number(item.latitude),
      lon: Number(item.longitude)
    }));
}
