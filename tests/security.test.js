import { beforeEach, describe, expect, it } from "vitest";
import {
  RateLimiter,
  clearAllStored,
  isValidApiKeyFormat,
  loadStored,
  sanitizeAiOutput,
  sanitizeErrorMessage,
  sanitizeObjectDeep,
  sanitizeText,
  saveStored,
  validateCoordinates
} from "../src/utils/security.js";
import {
  isValidAdoptedSwaps,
  isValidBooleanMap,
  isValidCity,
  isValidLifestyle
} from "../src/utils/schemas.js";

describe("Input sanitization, API key format & coordinate validation", () => {
  it("strips control characters, angle brackets, and clamps length", () => {
    expect(sanitizeText("  Delhi\n<script>alert(1)</script>  ", 30)).toBe("Delhi scriptalert(1)/script");
    expect(sanitizeText(12345)).toBe("");
  });

  it("validates latitude and longitude bounds and rejects empty/non-finite inputs", () => {
    expect(validateCoordinates(28.6139, 77.209)).toEqual({ valid: true, lat: 28.6139, lon: 77.209 });
    expect(validateCoordinates(95, 77)).toEqual({ valid: false, lat: null, lon: null });
    expect(validateCoordinates(28, -200)).toEqual({ valid: false, lat: null, lon: null });
    expect(validateCoordinates("NaN", 77)).toEqual({ valid: false, lat: null, lon: null });
    expect(validateCoordinates("", 77)).toEqual({ valid: false, lat: null, lon: null });
    expect(validateCoordinates(null, 77)).toEqual({ valid: false, lat: null, lon: null });
  });

  it("validates API key format to prevent HTTP header injection", () => {
    expect(isValidApiKeyFormat("AIzaSyFakeKey1234567890")).toBe(true);
    expect(isValidApiKeyFormat("short")).toBe(false);
    expect(isValidApiKeyFormat("AIzaFake\r\nX-Injected: 1")).toBe(false);
    expect(isValidApiKeyFormat("AIzaFake Key With Spaces")).toBe(false);
    expect(isValidApiKeyFormat(null)).toBe(false);
  });
});

describe("Prototype pollution protection & schema-validated localStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("refuses to persist sensitive key names or credential-like values", () => {
    expect(() => saveStored("vg_gemini_key", "AIzaSyFakeKey1234567890")).toThrow();
    expect(() => saveStored("auth_token", "abc")).toThrow();
    expect(() => saveStored("vg_notes", "AIzaSyFakeSecretValue12345")).toThrow();
  });

  it("recursively strips prototype-pollution keys and validates stored schemas", () => {
    const dirty = JSON.parse('{"__proto__":{"polluted":true},"nested":{"constructor":{"x":1},"ok":2}}');
    const cleaned = sanitizeObjectDeep(dirty);
    expect(cleaned.nested.ok).toBe(2);
    expect(Object.prototype.hasOwnProperty.call(cleaned.nested, "constructor")).toBe(false);
    expect(({}).polluted).toBeUndefined();

    localStorage.setItem("vg_test_obj", '{"__proto__":{"polluted":true},"familySize":5}');
    const loaded = loadStored("vg_test_obj", { familySize: 4 });
    expect(loaded.familySize).toBe(5);
    expect(({}).polluted).toBeUndefined();

    localStorage.setItem("vg_room_sqft", '"bad-string"');
    expect(loadStored("vg_room_sqft", 150, (v) => typeof v === "number")).toBe(150);

    localStorage.setItem("vg_broken_json", "{not-json");
    expect(loadStored("vg_broken_json", { a: 1 })).toEqual({ a: 1 });
  });

  it("validates persisted city, lifestyle, boolean map, and swap schemas", () => {
    expect(isValidCity({ name: "Delhi", lat: 28.6, lon: 77.2 })).toBe(true);
    expect(isValidCity({ name: "", lat: 28.6, lon: 77.2 })).toBe(false);
    expect(isValidCity({ name: "Bad", lat: 999, lon: 77.2 })).toBe(false);

    expect(isValidLifestyle({ familySize: 4, commuteKm: 12, commuteMode: "auto_bus" })).toBe(true);
    expect(isValidLifestyle({ familySize: 999 })).toBe(false);
    expect(isValidLifestyle({ commuteMode: "jetpack" })).toBe(false);

    expect(isValidBooleanMap({ doorTape: true, wetMop: false })).toBe(true);
    expect(isValidBooleanMap({ doorTape: "yes" })).toBe(false);

    expect(isValidAdoptedSwaps(["wet_pocha", "commute_metro"])).toBe(true);
    expect(isValidAdoptedSwaps(["unknown_swap"])).toBe(false);
  });

  it("clears all VayuGuide keys on user data deletion", () => {
    saveStored("vg_city", { name: "Delhi" });
    saveStored("vg_room", 180);
    localStorage.setItem("other_app", "keep");

    const removed = clearAllStored("vg_");
    expect(removed).toBe(2);
    expect(localStorage.getItem("vg_city")).toBeNull();
    expect(localStorage.getItem("other_app")).toBe("keep");
  });
});

describe("RateLimiter, AI output sanitization & error redaction", () => {
  it("enforces sliding-window limit and cooldown", () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 10000, cooldownMs: 1000 });
    expect(limiter.tryAcquire(1000).allowed).toBe(true);
    expect(limiter.tryAcquire(1500).allowed).toBe(false);
    expect(limiter.tryAcquire(2500).allowed).toBe(true);
    expect(limiter.tryAcquire(4000).allowed).toBe(false);
    expect(limiter.tryAcquire(12000).allowed).toBe(true);
  });

  it("strips HTML tags and dangerous URI schemes from AI output", () => {
    const dirty = 'Use <img src=x onerror=alert(1)> HEPA and javascript:alert(1) or data:text/html';
    expect(sanitizeAiOutput(dirty)).toBe("Use  HEPA and [blocked-uri]:alert(1) or [blocked-uri]:text/html");
    expect(sanitizeAiOutput(null)).toBe("");
  });

  it("redacts API keys, bearer tokens, and query secrets from error messages", () => {
    const err = new Error("Request failed for https://api.example.com?key=AIzaSySecret123456789012345");
    const safe = sanitizeErrorMessage(err);
    expect(safe).not.toContain("AIzaSySecret");
    expect(safe).toContain("[REDACTED");

    const bearerSafe = sanitizeErrorMessage("Authorization: Bearer eyJhbGciOiJIUzI1NiJ9 failed");
    expect(bearerSafe).toContain("Bearer [REDACTED]");
  });
});
