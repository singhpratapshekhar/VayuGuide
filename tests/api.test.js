import { afterEach, describe, expect, it, vi } from "vitest";
import { POPULAR_CITIES } from "../src/data/cities.js";
import { DEFAULT_LIFESTYLE } from "../src/data/lifestyleData.js";
import { fetchLiveAirQuality, searchCitiesAPI } from "../src/services/airQualityApi.js";
import {
  buildOfflineAtmosphericReply,
  callGeminiModels,
  detectGenWidgetIntent,
  synthesizeCustomActionPlan
} from "../src/services/geminiApi.js";
import { getAQICategory } from "../src/utils/aqi.js";
import { buildDailyRoutineBlocks, computePersonalMetrics, computeRoomAchStats, computeRwaMetrics } from "../src/utils/metrics.js";
import { RateLimiter } from "../src/utils/security.js";

describe("airQualityApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects out-of-range coordinates before fetching", async () => {
    await expect(fetchLiveAirQuality(999, 77)).rejects.toThrow("Invalid coordinates");
  });

  it("preserves zero AQI values, parses 24h hourly trend, and handles HTTP errors", async () => {
    const times = Array.from({ length: 24 }, (_, i) => `2026-11-27T${String(i).padStart(2, "0")}:00`);
    const usAqi = Array.from({ length: 24 }, (_, i) => 100 + i * 5);
    const pm25 = Array.from({ length: 24 }, (_, i) => 50 + i * 2);

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current: { us_aqi: 0, pm2_5: 0, pm10: 10, nitrogen_dioxide: 5, sulphur_dioxide: 2, ozone: 15, carbon_monoxide: 100 },
        hourly: { time: times, us_aqi: usAqi, pm2_5: pm25 }
      })
    });

    const air = await fetchLiveAirQuality(28.6, 77.2);
    expect(air.aqi).toBe(0);
    expect(air.pm25).toBe(0);
    expect(air.trend).toHaveLength(6);

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: false, status: 503 });
    await expect(fetchLiveAirQuality(28.6, 77.2)).rejects.toThrow("HTTP 503");
  });

  it("sanitizes city search results, skips short queries, and enforces rate limit", async () => {
    expect(await searchCitiesAPI("a")).toEqual([]);

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { name: "Kanpur<script>", admin1: "UP", country: "India", latitude: 26.45, longitude: 80.33 },
          { name: "BadCoords", latitude: 999, longitude: 80 }
        ]
      })
    });

    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000, cooldownMs: 0 });
    const cities = await searchCitiesAPI("Kanpur", { rateLimiter: limiter });
    expect(cities).toHaveLength(1);
    expect(cities[0].name).toBe("Kanpurscript");

    expect(await searchCitiesAPI("Delhi", { rateLimiter: limiter })).toEqual([]);
  });
});

describe("geminiApi & offline atmospheric engine", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends API key in x-goog-api-key header, falls back to secondary model, and sanitizes output", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "<b>Seal doors</b> and save 12 mg PM2.5." }] } }]
        })
      });

    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60000, cooldownMs: 0 });
    const result = await callGeminiModels(
      "AIzaTestKey123456",
      "City: Delhi",
      "User: Hi",
      "How to protect kids?",
      { rateLimiter: limiter }
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [calledUrl, calledOpts] = fetchMock.mock.calls[1];
    expect(calledUrl).toContain("gemini-2.0-flash");
    expect(calledUrl).not.toContain("AIzaTestKey123456");
    expect(calledOpts.headers["x-goog-api-key"]).toBe("AIzaTestKey123456");
    expect(JSON.parse(calledOpts.body).generationConfig.maxOutputTokens).toBe(1024);
    expect(result.text).toBe("Seal doors and save 12 mg PM2.5.");
  });

  it("rejects malformed keys and enforces rate limit", async () => {
    const bad = await callGeminiModels("bad\nkey", "ctx", "", "hi");
    expect(bad.errorStatus).toBe(400);

    const limiter = new RateLimiter({ maxRequests: 0, windowMs: 60000, cooldownMs: 0 });
    const res = await callGeminiModels("AIzaTestKey123456", "ctx", "", "hi", { rateLimiter: limiter });
    expect(res.rateLimited).toBe(true);
    expect(res.errorStatus).toBe(429);
  });

  it("synthesizes live JSON action plan and falls back cleanly on malformed JSON", async () => {
    const air = { aqi: 260, pm25: 140, pm10: 200, no2: 40, trend: [{ time: "6 AM", aqi: 280, pm25: 150 }] };
    const metrics = computePersonalMetrics(air, DEFAULT_LIFESTYLE, {}, [], {});
    const params = {
      city: POPULAR_CITIES[0],
      effectiveAirData: air,
      aqiCategory: getAQICategory(air.aqi),
      lifestyle: DEFAULT_LIFESTYLE,
      routineBlocks: buildDailyRoutineBlocks(POPULAR_CITIES[0], air, DEFAULT_LIFESTYLE, "12:30 PM – 3:00 PM"),
      safestWindowLabel: "12:30 PM – 3:00 PM",
      roomSqFt: 150,
      roomAchStats: computeRoomAchStats(150),
      metrics,
      societyName: "Greenwood RWA"
    };

    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60000, cooldownMs: 0 });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                headline: "Live Delhi Plan",
                routine: "Stay inside 6-9 AM",
                indoorHack: "Run DIY HEPA",
                ecoSwap: "Take Metro",
                directImpact: "Avoids 1.2 mg/day"
              })
            }]
          }
        }]
      })
    });
    const livePlan = await synthesizeCustomActionPlan(params, "AIzaTestKey123456", { rateLimiter: limiter });
    expect(livePlan.headline).toBe("Live Delhi Plan");
    expect(livePlan.source).toContain("Live");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: "not-valid-json" }] } }] })
    });
    const fallbackPlan = await synthesizeCustomActionPlan(params, "AIzaTestKey123456", { rateLimiter: limiter });
    expect(fallbackPlan.source).toBe("VayuGuide Atmospheric Engine");
  });

  it("detects GenUI widget intents and builds tailored offline replies across topics", () => {
    expect(detectGenWidgetIntent("kid school bus")).toBe("pediatric");
    expect(detectGenWidgetIntent("diy purifier cost")).toBe("purifier");
    expect(detectGenWidgetIntent("best window ventilation time")).toBe("diurnal");
    expect(detectGenWidgetIntent("senior asthma wheeze")).toBe("asthma");
    expect(detectGenWidgetIntent("rwa guard heater")).toBe("rwa");
    expect(detectGenWidgetIntent("hello")).toBeNull();

    const air = { aqi: 260, pm25: 140, pm10: 200, no2: 40 };
    const baseArgs = {
      city: POPULAR_CITIES[0],
      effectiveAirData: air,
      aqiCategory: getAQICategory(air.aqi),
      metrics: computePersonalMetrics(air, DEFAULT_LIFESTYLE, {}, [], {}),
      lifestyle: DEFAULT_LIFESTYLE,
      adoptedSwaps: ["commute_metro"],
      safestWindowLabel: "12:30 PM – 3:00 PM",
      safestPoint: { time: "3 PM", aqi: 140 },
      peakPoint: { time: "6 AM", aqi: 310 },
      roomSqFt: 150,
      roomAchStats: computeRoomAchStats(150),
      societyName: "Greenwood RWA",
      flatCount: 60,
      rwaMetrics: computeRwaMetrics(60, { guardHeaters: true }, 40, 50)
    };

    expect(buildOfflineAtmosphericReply({ ...baseArgs, userMsg: "daily routine" })).toContain("exposure");
    expect(buildOfflineAtmosphericReply({ ...baseArgs, userMsg: "mask advice" })).toContain("N95");
    expect(buildOfflineAtmosphericReply({ ...baseArgs, userMsg: "morning walk" })).toContain("Skip outdoor");
    expect(buildOfflineAtmosphericReply({ ...baseArgs, userMsg: "diy purifier" })).toContain("DIY Box-Fan");
    expect(buildOfflineAtmosphericReply({ ...baseArgs, userMsg: "school kids" })).toContain("Children breathe");
    expect(buildOfflineAtmosphericReply({ ...baseArgs, userMsg: "society rwa" })).toContain("Greenwood RWA");
    expect(buildOfflineAtmosphericReply({ ...baseArgs, userMsg: "cooking swaps" })).toContain("tadka");
    expect(buildOfflineAtmosphericReply({ ...baseArgs, userMsg: "general summary" })).toContain("Delhi NCR");
  });
});
