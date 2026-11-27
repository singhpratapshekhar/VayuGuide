import { describe, expect, it } from "vitest";
import { POPULAR_CITIES, inferLocationProfile } from "../src/data/cities.js";
import { DEFAULT_LIFESTYLE } from "../src/data/lifestyleData.js";
import { getAQICategory } from "../src/utils/aqi.js";
import {
  buildDailyRoutineBlocks,
  buildWhatsAppBroadcasts,
  computePersonalMetrics,
  computeRoomAchStats,
  computeRwaMetrics
} from "../src/utils/metrics.js";

describe("getAQICategory", () => {
  it("maps AQI thresholds accurately across all 5 US-EPA / GRAP bands", () => {
    expect(getAQICategory(35).status).toBe("Good");
    expect(getAQICategory(85).status).toBe("Moderate");
    expect(getAQICategory(160).status).toBe("Poor");
    expect(getAQICategory(260).status).toBe("Very Poor");
    expect(getAQICategory(410).status).toBe("Severe / Hazardous");
    expect(getAQICategory(-10).status).toBe("Good");
    expect(getAQICategory(NaN).status).toBe("Good");
  });
});

describe("computePersonalMetrics & computeRoomAchStats", () => {
  const sampleAir = { aqi: 280, pm25: 165, pm10: 220, no2: 45 };

  it("computes Berkeley Earth cigarette equivalence and positive exposure reduction", () => {
    const metrics = computePersonalMetrics(
      sampleAir,
      DEFAULT_LIFESTYLE,
      { doorTape: true, wetMop: true, hepaFilter: true, kitchenExhaust: true, zeroSmokePrayer: true, plantCarbon: false },
      ["commute_metro", "guard_heater"],
      { morning_lockdown: true, solar_ventilation: true }
    );

    expect(metrics.outdoorCigarettes).toBeCloseTo(165 / 22, 1);
    expect(metrics.protectedIndoorAQI).toBeLessThan(metrics.unshieldedIndoorAQI);
    expect(metrics.protectedDailyPM25).toBeLessThan(metrics.baselineDailyPM25);
    expect(metrics.exposureDropPct).toBeGreaterThan(0);
    expect(metrics.familyPm25AvoidedMgDay).toBeGreaterThan(0);
    expect(metrics.winterFamilyPm25Grams).toBeGreaterThan(0);
    expect(metrics.totalCo2SavedMonth).toBeGreaterThan(0);
  });

  it("does not double-count overlapping indoor hacks and eco swaps", () => {
    const withHackOnly = computePersonalMetrics(sampleAir, DEFAULT_LIFESTYLE, { wetMop: true }, [], {});
    const withBoth = computePersonalMetrics(sampleAir, DEFAULT_LIFESTYLE, { wetMop: true }, ["wet_pocha"], {});
    expect(withBoth.protectedIndoorAQI).toBe(withHackOnly.protectedIndoorAQI);
  });

  it("calculates room volume, ACH, and clean cycle minutes", () => {
    const smallRoom = computeRoomAchStats(100);
    const largeRoom = computeRoomAchStats(300);
    expect(smallRoom.ach).toBeGreaterThan(largeRoom.ach);
    expect(smallRoom.cleanCycleMins).toBeLessThan(largeRoom.cleanCycleMins);
  });
});

describe("buildDailyRoutineBlocks, computeRwaMetrics, broadcasts & inferLocationProfile", () => {
  it("builds 5 routine blocks tailored to city and lifestyle", () => {
    const blocks = buildDailyRoutineBlocks(
      POPULAR_CITIES[0],
      { aqi: 310, pm25: 180 },
      DEFAULT_LIFESTYLE,
      "12:30 PM – 3:00 PM"
    );
    expect(blocks).toHaveLength(5);
    expect(blocks[0].why).toContain("Delhi NCR");
    expect(blocks[2].time).toBe("12:30 PM – 3:00 PM");

    const wfhBlocks = buildDailyRoutineBlocks(
      POPULAR_CITIES[4],
      { aqi: 90, pm25: 35 },
      { ...DEFAULT_LIFESTYLE, hasKids: false, hasSeniors: false, commuteMode: "wfh", homeType: "high_rise", cookingStyle: "induction_chimney" },
      "1:00 PM Window"
    );
    expect(wfhBlocks[1].action).toContain("work desk");
  });

  it("computes RWA collective PM2.5 and CO2 savings including dampMopping pledge", () => {
    const withoutMop = computeRwaMetrics(
      60,
      { guardHeaters: true, dampMopping: false, noLeafBurning: true, noIdling: false },
      50,
      45
    );
    const withMop = computeRwaMetrics(
      60,
      { guardHeaters: true, dampMopping: true, noLeafBurning: true, noIdling: true },
      50,
      45
    );
    expect(withMop.gates).toBe(2);
    expect(withMop.totalPmSavedKgMonth).toBeGreaterThan(withoutMop.totalPmSavedKgMonth);
    expect(withMop.co2SavedKgMonth).toBeGreaterThan(withoutMop.co2SavedKgMonth);
  });

  it("builds 3 sanitized WhatsApp broadcasts reflecting society and city data", () => {
    const air = { aqi: 280, pm25: 165, pm10: 220, no2: 45 };
    const metrics = computePersonalMetrics(air, DEFAULT_LIFESTYLE, {}, [], {});
    const rwaMetrics = computeRwaMetrics(60, { guardHeaters: true, dampMopping: true, noLeafBurning: true, noIdling: false }, 40, 50);
    const broadcasts = buildWhatsAppBroadcasts({
      societyName: "Oakwood <script> RWA",
      flatCount: 60,
      city: POPULAR_CITIES[0],
      effectiveAirData: air,
      aqiCategory: getAQICategory(air.aqi),
      rwaPledges: { guardHeaters: true, dampMopping: true, noLeafBurning: true, noIdling: false },
      rwaMetrics,
      metrics,
      safestWindowLabel: "12:30 PM – 3:00 PM"
    });
    expect(broadcasts).toHaveLength(3);
    expect(broadcasts[0].text).toContain("Oakwood script RWA");
    expect(broadcasts[0].text).not.toContain("<script>");
  });

  it("infers location profiles for known cities and custom coordinates", () => {
    expect(inferLocationProfile(POPULAR_CITIES[0], {}).regionType).toBe("indo-gangetic");
    expect(inferLocationProfile({ name: "Custom", lat: 27, lon: 78 }, { pm25: 90, pm10: 120, no2: 50 }).regionType).toBe("traffic");
    expect(inferLocationProfile({ name: "North", lat: 28, lon: 77 }, { pm25: 90, pm10: 120, no2: 20 }).regionType).toBe("indo-gangetic");
    expect(inferLocationProfile({ name: "South", lat: 11, lon: 77 }, { pm25: 30, pm10: 90, no2: 20 }).regionType).toBe("urban");
  });
});
