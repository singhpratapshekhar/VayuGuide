/**
 * Runtime schema validators for localStorage-persisted user preferences.
 * @module utils/schemas
 */

import { COMMUTE_OPTIONS, ECO_SWAPS_DATA, HOME_OPTIONS } from "../data/lifestyleData.js";
import { validateCoordinates } from "./security.js";

const VALID_COMMUTE_IDS = new Set(COMMUTE_OPTIONS.map((c) => c.id));
const VALID_HOME_IDS = new Set(HOME_OPTIONS.map((h) => h.id));
const VALID_COOKING_STYLES = new Set(["gas_tadka", "induction_chimney"]);
const VALID_SWAP_IDS = new Set(ECO_SWAPS_DATA.map((s) => s.id));

/**
 * Validate stored city selection.
 * @param {unknown} val
 * @returns {boolean}
 */
export function isValidCity(val) {
  return Boolean(
    val &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      typeof val.name === "string" &&
      val.name.trim().length > 0 &&
      validateCoordinates(val.lat, val.lon).valid
  );
}

/**
 * Validate stored household lifestyle profile.
 * @param {unknown} val
 * @returns {boolean}
 */
export function isValidLifestyle(val) {
  if (!val || typeof val !== "object" || Array.isArray(val)) return false;
  const familyOk =
    val.familySize === undefined ||
    (typeof val.familySize === "number" && val.familySize >= 1 && val.familySize <= 20);
  const commuteKmOk =
    val.commuteKm === undefined ||
    (typeof val.commuteKm === "number" && val.commuteKm >= 1 && val.commuteKm <= 100);
  const commuteOk = val.commuteMode === undefined || VALID_COMMUTE_IDS.has(val.commuteMode);
  const homeOk = val.homeType === undefined || VALID_HOME_IDS.has(val.homeType);
  const cookingOk = val.cookingStyle === undefined || VALID_COOKING_STYLES.has(val.cookingStyle);
  return familyOk && commuteKmOk && commuteOk && homeOk && cookingOk;
}

/**
 * Validate a plain object of boolean toggle flags.
 * @param {unknown} val
 * @returns {boolean}
 */
export function isValidBooleanMap(val) {
  if (!val || typeof val !== "object" || Array.isArray(val)) return false;
  return Object.values(val).every((v) => typeof v === "boolean");
}

/**
 * Validate stored array of adopted eco-swap IDs.
 * @param {unknown} val
 * @returns {boolean}
 */
export function isValidAdoptedSwaps(val) {
  return Array.isArray(val) && val.every((id) => typeof id === "string" && VALID_SWAP_IDS.has(id));
}
