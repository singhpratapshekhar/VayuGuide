# VayuGuide (वायुगाइड) — Clean Air Co-Pilot for Indian Families & RWAs

> **A GenAI-powered interactive web assistant that helps families and communities navigate severe winter smog and urban air pollution — suggesting low-emission daily routines, frugal indoor air quality hacks, and sustainable alternatives tailored to their location and lifestyle, while clearly explaining the direct measurable impact of every choice.**

---

## 🎯 Target Audience & Regional Focus
Engineered for urban centers across the Indo-Gangetic Plain, industrial belts, and coastal metros (plus live GPS & global Open-Meteo city search):
* **Delhi NCR** (Nocturnal thermal inversion, vehicular exhaust, regional stubble & biomass plume)
* **Kanpur** (Industrial corridor particulates, brick kiln emissions, stagnant winter fog)
* **Lucknow** (Evening traffic congestion, low-wind nocturnal stagnation)
* **Patna** (Gangetic valley moisture fog trap, construction dust, biomass heating)
* **Mumbai & Kolkata** (Coastal moisture inversion, diesel corridor traffic, river delta haze)
* **Bengaluru, Pune, Hyderabad, Jaipur, Ahmedabad** + any city via Open-Meteo Geocoding & GPS

---

## 🔬 Scientific Foundations & Direct Impact Formulae

1. **Berkeley Earth Particulate Exposure Equivalence:**
   $$\text{Daily Cigarette Equivalence} = \frac{\text{PM}_{2.5} \, (\mu\text{g/m}^3)}{22}$$
   Inhaling $22 \, \mu\text{g/m}^3$ of $\text{PM}_{2.5}$ over 24 hours approximates the cytotoxic load of smoking 1 cigarette.

2. **Inhaled Particulate Avoidance (Family & Winter Scale):**
   $$\text{PM}_{2.5} \text{ Avoided (mg/person/day)} = \frac{(\text{Baseline PM}_{2.5} - \text{Protected PM}_{2.5}) \times 12 \, \text{m}^3}{1000}$$
   Computed across resting adult tidal volume ($12 \, \text{m}^3/\text{day}$), household size, and a 120-day winter smog season.

3. **Diurnal Inversion & Solar Ventilation Window:**
   * **06:00 – 09:00 AM:** Surface cooling forms a nocturnal temperature inversion trapping $\text{PM}_{2.5}$ near ground level.
   * **12:30 – 03:00 PM:** Midday solar irradiation expands the planetary boundary layer, dropping ground-level AQI by 25–40% — the safest cross-ventilation window.

4. **Community Multiplier & RWA Equation:**
   * Replacing scrap wood and leaf burning at society security gates with 800W quartz radiant heaters prevents **~2.4 kg of $\text{PM}_{2.5}$ emissions per gate per night**.

---

## 🌟 6 Core Modules

1. **Dashboard & Household Lifestyle Profiler (`dashboard`)**
   * Live Open-Meteo AQI & multi-pollutant telemetry ($\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{O}_3$), GPS detection, city search, and a **50–500 AQI Smog Scenario Simulator** (Moderate through GRAP Stage IV).
   * Interactive **Household & Lifestyle Profiler** (school kids, seniors, asthma/COPD, incense usage, family size, commute mode & distance, home floor/type, cooking style) with live before/after **Direct Impact** comparison.
2. **Low-Emission Daily Routine & 24h Diurnal Planner (`routine`)**
   * Time-blocked daily defense routine synchronized to the city's diurnal inversion curve, with interactive completion tracking, emission impact badges, and 1-tap shareable summary.
3. **Indoor Air Quality Hacks & Room Simulator (`indoor`)**
   * 6 toggleable low-cost indoor hacks (EVA door tape, *geela pocha* damp mopping, ₹1,800 DIY Box-Fan + HEPA H13 blueprint, pre-drafted chimney, smoke-free prayer, carbon/plant buffer) with a room size Air Changes Per Hour (ACH) calculator and N95 fit/lifespan estimator.
4. **Sustainable Alternatives & Direct Impact Explorer (`swaps`)**
   * 6 lifestyle & community swaps (Metro/EV carpool, pre-drafted tadka/induction, ghee/LED diyas, RWA guard electric heaters, damp mop, leaf composting) synced with household impact metrics, $\text{CO}_2$ saved, and monthly rupee savings.
5. **Community Hub, RWA Multiplier & WhatsApp Broadcasts (`whatsapp`)**
   * Society-scale calculator (1–200 flats) quantifying collective $\text{PM}_{2.5}$ prevented, $\text{CO}_2$ avoided, clean-air person-days, and clinic visits averted, plus 1-tap WhatsApp circulars.
6. **GenAI Atmospheric Co-Pilot & Generative UI Studio (`ai`)**
   * Conversational AI assistant aware of your city, AQI, indoor hacks, eco swaps, and household profile — powered by **Gemini Live** (`gemini-2.5-flash` / `gemini-2.0-flash` with optional browser-stored API key) and a zero-dependency **VayuGuide Atmospheric Engine** offline fallback.
   * **Interactive Decision Widgets:** `PediatricExposureWidget`, `PurifierBenchWidget`, `DiurnalInversionWidget`, `AsthmaRiskWidget`, and `RwaResolutionWidget`, plus a live **GenUI JSON Spec** inspector.

---

## 🚀 Quick Start (Zero-Build Browser ESM)

Serve the directory over HTTP (required for ES modules):

```bash
pnpm install
pnpm test        # Run unit, security, API, flow, and axe-core WCAG accessibility tests
pnpm run build:esm
pnpm build       # Production Vite bundle -> dist/
pnpm dev         # Zero-build ESM preview on http://localhost:5173
```

---

## 🏗️ Modular Architecture, Security & Accessibility

* **Modular `src/` layout:**
  * `src/data/` (`cities.js`, `lifestyleData.js`) — Regional profiles, indoor hacks, eco swaps
  * `src/utils/` (`aqi.js`, `metrics.js`, `security.js`) — Scientific exposure calculations, input/coordinate sanitization, safe `localStorage`, sliding-window `RateLimiter`, error redaction
  * `src/services/` (`airQualityApi.js`, `geminiApi.js`) — Open-Meteo & Gemini API clients (`x-goog-api-key` header auth, `AbortController` timeouts, `maxOutputTokens`, prompt-injection separation)
  * `src/hooks/useVayuGuideState.js` — Centralized state & derived impact calculations
  * `src/components/` (`Navbar.jsx`, `HeroBanner.jsx`, `CitySearchModal.jsx`, `PrivacyModal.jsx`, `ErrorBoundary.jsx`, `GenUIWidgets.jsx`, `dashboard/*`, `tabs/*`)
* **Security & Privacy:** Session-memory-only optional Gemini API key (never written to `localStorage` or URLs), strict CSP with SHA-256 script hash (no `'unsafe-inline'` in `script-src`), Netlify HTTP headers (`public/_headers`), `public/.well-known/security.txt`, and one-click **Clear All Local Data** in `PrivacyModal`.
* **Accessibility (WCAG 2.1 AA):** Skip-to-content link, semantic landmarks (`header`, `nav`, `main`, `footer`), strict `h1 → h2 → h3` hierarchy, ARIA `tablist`/`tab`/`tabpanel` with ArrowLeft/ArrowRight & roving `tabIndex`, `aria-modal` dialogs with Escape & focus restoration, and automated `axe-core` verification across all 6 tabs.
