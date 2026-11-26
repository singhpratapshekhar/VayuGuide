import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLiveAirQuality, searchCitiesAPI } from "../src/services/airQualityApi.js";
import { callGeminiModels } from "../src/services/geminiApi.js";
import { RateLimiter } from "../src/utils/security.js";

describe("airQualityApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects out-of-range coordinates before fetching", async () => {
    await expect(fetchLiveAirQuality(999, 77)).rejects.toThrow("Invalid coordinates");
  });

  it("parses Open-Meteo response and sanitizes city search results", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current: { us_aqi: 210, pm2_5: 115, pm10: 180, nitrogen_dioxide: 30, sulphur_dioxide: 10, ozone: 25, carbon_monoxide: 400 },
        hourly: { time: [], us_aqi: [] }
      })
    });

    const air = await fetchLiveAirQuality(28.6, 77.2);
    expect(air.aqi).toBe(210);
    expect(air.pm25).toBe(115);

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ name: "Kanpur<script>", admin1: "UP", country: "India", latitude: 26.45, longitude: 80.33 }]
      })
    });

    const cities = await searchCitiesAPI("Kanpur");
    expect(cities[0].name).toBe("Kanpurscript");
  });
});

describe("geminiApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends API key in x-goog-api-key header (never in URL) and sanitizes output", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "<b>Seal doors</b> and save 12 mg PM2.5." }] } }]
      })
    });

    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60000, cooldownMs: 0 });
    const result = await callGeminiModels(
      "AIzaTestKey123456",
      "City: Delhi",
      "",
      "How to protect kids?",
      { rateLimiter: limiter }
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOpts] = fetchMock.mock.calls[0];
    expect(calledUrl).not.toContain("AIzaTestKey123456");
    expect(calledUrl).not.toContain("?key=");
    expect(calledOpts.headers["x-goog-api-key"]).toBe("AIzaTestKey123456");
    expect(JSON.parse(calledOpts.body).generationConfig.maxOutputTokens).toBe(1024);
    expect(result.text).toBe("Seal doors and save 12 mg PM2.5.");
  });

  it("enforces rate limit when exhausted", async () => {
    const limiter = new RateLimiter({ maxRequests: 0, windowMs: 60000, cooldownMs: 0 });
    const res = await callGeminiModels("AIzaTestKey123456", "ctx", "", "hi", { rateLimiter: limiter });
    expect(res.rateLimited).toBe(true);
    expect(res.errorStatus).toBe(429);
  });
});
