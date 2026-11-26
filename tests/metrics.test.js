import { describe, expect, it } from "vitest";
import { POPULAR_CITIES, inferLocationProfile } from "../src/data/cities.js";
import { DEFAULT_LIFESTYLE } from "../src/data/lifestyleData.js";
import { getAQICategory } from "../src/utils/aqi.js";
import {
  buildDailyRoutineBlocks,
  computePersonalMetrics,
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
  });
});

describe("computePersonalMetrics", () => {
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
  });

  it("does not double-count overlapping indoor hacks and eco swaps", () => {
    const withHackOnly = computePersonalMetrics(
      sampleAir,
      DEFAULT_LIFESTYLE,
      { wetMop: true },
      [],
      {}
    );
    const withBoth = computePersonalMetrics(
      sampleAir,
      DEFAULT_LIFESTYLE,
      { wetMop: true },
      ["wet_pocha"],
      {}
    );

    expect(withBoth.protectedIndoorAQI).toBe(withHackOnly.protectedIndoorAQI);
  });
});

describe("buildDailyRoutineBlocks & computeRwaMetrics & inferLocationProfile", () => {
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
  });

  it("computes RWA collective PM2.5 and CO2 savings", () => {
    const rwa = computeRwaMetrics(
      60,
      { guardHeaters: true, dampMopping: true, noLeafBurning: true, noIdling: false },
      50,
      45
    );
    expect(rwa.gates).toBe(2);
    expect(rwa.totalPmSavedKgMonth).toBeGreaterThan(100);
    expect(rwa.co2SavedKgMonth).toBeGreaterThan(500);
  });

  it("infers location profile for custom coordinates", () => {
    const profile = inferLocationProfile({ name: "Custom", lat: 27, lon: 78 }, { pm25: 90, pm10: 120, no2: 50 });
    expect(profile.regionType).toBe("traffic");
  });
});
