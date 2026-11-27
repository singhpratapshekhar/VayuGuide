/**
 * Security utilities: input sanitization, coordinate validation, prototype-pollution-safe
 * storage, sliding-window rate limiting, AI output sanitization, and error redaction.
 * @module utils/security
 */

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const SECRET_KEY_NAME_RE = /key|token|secret|password/i;
const SECRET_VALUE_RE = /AIza[0-9A-Za-z\-_]{16,}|sk-[0-9A-Za-z\-_]{10,}|Bearer\s+[0-9A-Za-z\-_.]{8,}/i;

/**
 * Strip control characters and angle brackets, normalize whitespace, and clamp length.
 * @param {unknown} input
 * @param {number} [maxLength=200]
 * @returns {string}
 */
export function sanitizeText(input, maxLength = 200) {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate latitude and longitude bounds.
 * @param {unknown} lat
 * @param {unknown} lon
 * @returns {{ valid: boolean, lat: number | null, lon: number | null }}
 */
export function validateCoordinates(lat, lon) {
  if (lat === null || lat === undefined || lon === null || lon === undefined || lat === "" || lon === "") {
    return { valid: false, lat: null, lon: null };
  }
  const numLat = Number(lat);
  const numLon = Number(lon);
  const valid =
    Number.isFinite(numLat) &&
    Number.isFinite(numLon) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLon >= -180 &&
    numLon <= 180;

  return valid
    ? { valid: true, lat: numLat, lon: numLon }
    : { valid: false, lat: null, lon: null };
}

/**
 * Validate an optional API key string to prevent HTTP header injection or control characters.
 * @param {unknown} key
 * @returns {boolean}
 */
export function isValidApiKeyFormat(key) {
  if (typeof key !== "string") return false;
  const trimmed = key.trim();
  if (trimmed.length < 10 || trimmed.length > 256) return false;
  return /^[\x21-\x7E]+$/.test(trimmed);
}

/**
 * Recursively strip prototype-pollution keys from parsed JSON values.
 * @param {unknown} value
 * @returns {unknown}
 */
export function sanitizeObjectDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeObjectDeep);
  }
  if (value && typeof value === "object") {
    const clean = {};
    for (const [k, v] of Object.entries(value)) {
      if (!FORBIDDEN_KEYS.has(k)) {
        clean[k] = sanitizeObjectDeep(v);
      }
    }
    return clean;
  }
  return value;
}

/**
 * Safely read and schema-validate JSON from localStorage.
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @param {(val: unknown) => boolean} [validator]
 * @returns {T}
 */
export function loadStored(key, fallback, validator) {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = sanitizeObjectDeep(JSON.parse(raw));
    if (validator && !validator(parsed)) return fallback;
    if (fallback && typeof fallback === "object" && !Array.isArray(fallback)) {
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return fallback;
      return { ...fallback, ...parsed };
    }
    return parsed;
  } catch {
    return fallback;
  }
}

/**
 * Safely persist non-sensitive preferences to localStorage.
 * Refuses key names or serialized values resembling secrets/API keys.
 * @param {string} key
 * @param {unknown} value
 */
export function saveStored(key, value) {
  if (SECRET_KEY_NAME_RE.test(key)) {
    throw new Error("Refusing to persist sensitive key material in localStorage.");
  }
  const serialized = JSON.stringify(value);
  if (SECRET_VALUE_RE.test(serialized)) {
    throw new Error("Refusing to persist credential-like values in localStorage.");
  }
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, serialized);
    }
  } catch {
    // Ignore storage quota or private-mode restrictions
  }
}

/**
 * Remove all VayuGuide keys from localStorage (user data deletion control).
 * @param {string} [prefix="vg_"]
 * @returns {number}
 */
export function clearAllStored(prefix = "vg_") {
  try {
    if (typeof localStorage === "undefined") return 0;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    return keysToRemove.length;
  } catch {
    return 0;
  }
}

/**
 * Sliding-window client-side rate limiter with minimum cooldown.
 */
export class RateLimiter {
  constructor({ maxRequests, windowMs, cooldownMs = 0 }) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.cooldownMs = cooldownMs;
    this.timestamps = [];
  }

  /**
   * Attempt to consume one request slot.
   * @param {number} [now=Date.now()]
   * @returns {{ allowed: boolean, retryAfterMs: number }}
   */
  tryAcquire(now = Date.now()) {
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    const last = this.timestamps[this.timestamps.length - 1];

    if (last !== undefined && now - last < this.cooldownMs) {
      return { allowed: false, retryAfterMs: this.cooldownMs - (now - last) };
    }
    if (this.timestamps.length >= this.maxRequests) {
      const oldest = this.timestamps[0];
      return { allowed: false, retryAfterMs: Math.max(0, this.windowMs - (now - oldest)) };
    }
    this.timestamps.push(now);
    return { allowed: true, retryAfterMs: 0 };
  }
}

/**
 * Treat AI model output as untrusted: strip HTML tags and unsafe URI schemes.
 * @param {unknown} text
 * @returns {string}
 */
export function sanitizeAiOutput(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/(?:javascript|data|vbscript):/gi, "[blocked-uri]:")
    .trim();
}

/**
 * Redact potential API keys, bearer tokens, and URL query params from error messages.
 * @param {unknown} err
 * @returns {string}
 */
export function sanitizeErrorMessage(err) {
  const raw = err instanceof Error ? err.message : String(err || "Unexpected error");
  return raw
    .replace(/AIza[0-9A-Za-z\-_]{16,}/g, "[REDACTED_KEY]")
    .replace(/sk-[0-9A-Za-z\-_]{10,}/g, "[REDACTED_KEY]")
    .replace(/Bearer\s+[0-9A-Za-z\-_.]+/gi, "Bearer [REDACTED]")
    .replace(/([?&](?:key|token|api_key)=)[^&\s]+/gi, "$1[REDACTED]")
    .slice(0, 180);
}
