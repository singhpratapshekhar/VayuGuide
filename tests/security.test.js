import { beforeEach, describe, expect, it } from "vitest";
import {
  RateLimiter,
  clearAllStored,
  loadStored,
  sanitizeAiOutput,
  sanitizeErrorMessage,
  sanitizeText,
  saveStored,
  validateCoordinates
} from "../src/utils/security.js";

describe("Input sanitization & coordinate validation", () => {
  it("strips control characters, angle brackets, and clamps length", () => {
    expect(sanitizeText("  Delhi\n<script>alert(1)</script>  ", 30)).toBe("Delhi scriptalert(1)/script");
    expect(sanitizeText(12345)).toBe("");
  });

  it("validates latitude and longitude bounds", () => {
    expect(validateCoordinates(28.6139, 77.209)).toEqual({ valid: true, lat: 28.6139, lon: 77.209 });
    expect(validateCoordinates(95, 77)).toEqual({ valid: false, lat: null, lon: null });
    expect(validateCoordinates(28, -200)).toEqual({ valid: false, lat: null, lon: null });
    expect(validateCoordinates("NaN", 77)).toEqual({ valid: false, lat: null, lon: null });
  });
});

describe("Safe localStorage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("refuses to persist sensitive key/token/secret names in localStorage", () => {
    expect(() => saveStored("vg_gemini_key", "AIzaSyFakeKey1234567890")).toThrow();
    expect(() => saveStored("auth_token", "abc")).toThrow();
  });

  it("validates stored data and strips prototype-pollution keys", () => {
    localStorage.setItem("vg_test_obj", '{"__proto__":{"polluted":true},"familySize":5}');
    const loaded = loadStored("vg_test_obj", { familySize: 4 });
    expect(loaded.familySize).toBe(5);
    expect(({}).polluted).toBeUndefined();

    localStorage.setItem("vg_room_sqft", '"bad-string"');
    const clamped = loadStored("vg_room_sqft", 150, (v) => typeof v === "number");
    expect(clamped).toBe(150);
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
    expect(limiter.tryAcquire(1500).allowed).toBe(false); // cooldown
    expect(limiter.tryAcquire(2500).allowed).toBe(true);
    expect(limiter.tryAcquire(4000).allowed).toBe(false); // maxRequests
    expect(limiter.tryAcquire(12000).allowed).toBe(true); // window expired
  });

  it("strips HTML tags and dangerous URI schemes from AI output", () => {
    const dirty = 'Use <img src=x onerror=alert(1)> HEPA and javascript:alert(1)';
    expect(sanitizeAiOutput(dirty)).toBe("Use  HEPA and [blocked-uri]:alert(1)");
  });

  it("redacts API keys and tokens from error messages", () => {
    const err = new Error("Request failed for https://api.example.com?key=AIzaSySecret123456789012345");
    const safe = sanitizeErrorMessage(err);
    expect(safe).not.toContain("AIzaSySecret");
    expect(safe).toContain("[REDACTED");
  });
});
