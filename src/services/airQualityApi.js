/**
 * Open-Meteo Air Quality & Geocoding API clients with coordinate validation,
 * rate limiting, finite value clamping, and AbortController timeouts.
 * @module services/airQualityApi
 */

import { INITIAL_AIR_DATA } from "../data/lifestyleData.js";
import { RateLimiter, sanitizeText, validateCoordinates } from "../utils/security.js";

const DEFAULT_TIMEOUT_MS = 10000;
const searchRateLimiter = new RateLimiter({ maxRequests: 20, windowMs: 60000, cooldownMs: 250 });

function clampMetric(value, fallback, min = 0, max = 5000) {
  const num = value === null || value === undefined ? NaN : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
}

function buildHourlyTrend(hourly) {
  if (!Array.isArray(hourly?.time) || !Array.isArray(hourly?.us_aqi)) {
    return INITIAL_AIR_DATA.trend;
  }

  const indices =
    hourly.time.length >= 22
      ? [6, 9, 12, 15, 18, 21]
      : Array.from({ length: Math.ceil(Math.min(24, hourly.time.length) / 3) }, (_, k) => k * 3);

  const trend = indices
    .filter((idx) => idx < hourly.time.length)
    .map((idx) => {
      const date = new Date(hourly.time[idx]);
      const label = Number.isNaN(date.getTime())
        ? `${idx}:00`
        : date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
      return {
        time: label,
        aqi: clampMetric(hourly.us_aqi[idx], 150, 0, 500),
        pm25: clampMetric(hourly.pm2_5?.[idx], 75, 0, 1000)
      };
    });

  return trend.length > 0 ? trend : INITIAL_AIR_DATA.trend;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const externalSignal = options.signal;
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", onExternalAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    if (externalSignal) {
      externalSignal.removeEventListener("abort", onExternalAbort);
    }
  }
}

/**
 * Fetch live air quality and hourly diurnal trend from Open-Meteo.
 * @param {number} lat
 * @param {number} lon
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 */
export async function fetchLiveAirQuality(lat, lon, options = {}) {
  const coords = validateCoordinates(lat, lon);
  if (!coords.valid) {
    throw new Error("Invalid coordinates supplied for air quality lookup");
  }

  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${coords.lat}&longitude=${coords.lon}` +
    `&current=us_aqi,pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide` +
    `&hourly=us_aqi,pm2_5&forecast_days=1`;

  const res = await fetchWithTimeout(url, { signal: options.signal });
  if (!res.ok) {
    throw new Error(`Air quality service returned HTTP ${res.status}`);
  }

  const data = await res.json();
  const current = data?.current || {};

  return {
    aqi: clampMetric(current.us_aqi, 160, 0, 500),
    pm25: clampMetric(current.pm2_5, 75, 0, 1000),
    pm10: clampMetric(current.pm10, 110, 0, 2000),
    no2: clampMetric(current.nitrogen_dioxide, 22, 0, 1000),
    so2: clampMetric(current.sulphur_dioxide, 12, 0, 1000),
    o3: clampMetric(current.ozone, 35, 0, 1000),
    co: clampMetric(current.carbon_monoxide, 400, 0, 10000),
    updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    trend: buildHourlyTrend(data?.hourly)
  };
}

/**
 * Search cities via Open-Meteo Geocoding API with input sanitization and rate limiting.
 * @param {string} rawQuery
 * @param {object} [options]
 * @param {RateLimiter} [options.rateLimiter]
 * @param {AbortSignal} [options.signal]
 */
export async function searchCitiesAPI(rawQuery, options = {}) {
  const query = sanitizeText(rawQuery, 80);
  if (query.length < 2) return [];

  const limiter = options.rateLimiter || searchRateLimiter;
  const limit = limiter.tryAcquire();
  if (!limit.allowed) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
  const res = await fetchWithTimeout(url, { signal: options.signal });
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
