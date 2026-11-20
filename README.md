# VayuGuide (वायुगाइड) — Urban Winter Smog & Lifestyle Assistant

> **A GenAI-powered interactive web dashboard and lifestyle assistant tailored for Indian urban families and Resident Welfare Associations (RWAs) navigating severe winter smog episodes (GRAP Stages I to IV).**

---

## 🎯 Target Audience & Regional Focus
Engineered for high-vulnerability urban centers across the Indo-Gangetic Plain and coastal metropolitan belts:
* **Delhi NCR** (Severe+, Stubble & Vehicular Inversion Plume)
* **Kanpur** (Severe, Industrial Corridor & Brick Kiln Basin)
* **Lucknow** (Very Poor, Traffic Congestion & Night Warming Stagnation)
* **Patna** (Very Poor, Gangetic Valley River Fog Trap)
* **Mumbai** (Moderate to Poor, Coastal Moisture Inversion)
* **Kolkata** (Poor, Old Commercial Fleet & Biomass Haze)

---

## 🔬 Scientific Foundations & Formulae

1. **Berkeley Earth Particulate Exposure Equivalence:**
   $$\text{Daily Cigarette Equivalence} = \frac{\text{PM}_{2.5} \, (\mu\text{g/m}^3)}{22}$$
   Inhaling $22 \, \mu\text{g/m}^3$ of fine particulate over 24 hours matches the cytotoxic stress of smoking 1 conventional cigarette.

2. **Inhaled Particulate Avoidance Calculation:**
   $$\text{PM}_{2.5} \text{ Avoided (mg/person/day)} = \frac{(\text{Outdoor PM}_{2.5} - \text{Indoor PM}_{2.5}) \times 12 \, \text{m}^3}{1000}$$
   Assuming an average adult resting breathing tidal volume of $12 \, \text{m}^3$ of air per 24 hours.

3. **Diurnal Inversion & Solar Ventilation Window:**
   * **06:00 – 09:00 AM:** Surface cooling creates a steep nocturnal temperature inversion ceiling trapping toxic PM2.5 within 50m of ground level. Complete lockdown required.
   * **13:00 – 15:30 PM:** Peak solar irradiation heats the surface, triggering convective thermal lifting and boundary layer expansion. Ground-level AQI temporarily dips by 25–40%, making this the **sole recommended window for 20-minute cross-ventilation**.

4. **Community Multiplier & RWA Equation:**
   * Eliminating scrap wood and leaf burning across society security gates saves **~2.4 kg of PM2.5 emissions per gate per winter night**.
   * Providing an **800W quartz radiant heater** costs less than ₹850 and prevents ground-floor residential plume accumulation.

---

## 🛠️ Tech Stack & Key Files
* **Component:** `VayuGuide.jsx` (Single-file runnable React component with stateful hooks and Lucide React icons)
* **Interactive Standalone HTML:** `index.html` (Runs in browser via ESM + Tailwind CSS CDN + Babel Standalone)
* **Package Config:** `package.json` (Vite + React 18 compatible)

---

## 🌟 Core Modules

### 1. Navigation Bar & Live GRAP Watch
* Sticky top header with city dropdown, real-time AQI badge, and dynamic GRAP stage indicator.
* Tabbed access to all 5 modules with instant status cues.

### 2. Smog Radar & Household Vulnerability Profile
* Real-time Outdoor vs. Clean Indoor Living Room comparison cards.
* Interactive outdoor AQI slider (80 to 500 AQI).
* Toggles for **School-going children**, **Senior citizens**, **Asthma/COPD**, and **Commute mode** with live health directives.

### 3. AI Time-Blocked Daily Defense Routine
* **06:00 - 09:00:** Morning Smog Lockdown
* **08:30 - 10:30:** Commute Defense (Cabin recirculation & N95 nose seal)
* **13:00 - 15:30:** Solar Ventilation Window (20-min flush)
* **18:30 - 20:30:** Low-Smoke Evening Cooking (Pre-chimney draft & lid tadka)
* **21:00 - 06:00:** Night RWA Guard Support & Bedroom Recovery

### 4. 3-Column Sustainable Lifestyle Swaps
* Replacing Agarbatti/Dhoop with pure cow ghee diyas or ultrasonic reed diffusers (-92% PAHs).
* Replacing guard scrap fires with 800W quartz radiant heaters.
* Pre-drafting chimney before high-heat mustard oil tadka.
* Replacing dry grass jhadu with hot water microfibre pocha.
* Transitioning commute from open 2-wheeler to underground metro.

### 5. Frugal DIY Indoor Air Lab & RWA Multiplier
* Real-time room simulator testing EPDM draft tape, ₹1,800 box-fan HEPA filter, damp pocha, and chimney protocols.
* Community slider (1 to 200 flats) calculating collective grams of PM2.5 avoided, monthly CO2 saved, and pediatric doctor visits averted.
* **1-Click WhatsApp Bulletin:** Formatted bilingual broadcast copy with visual toast confirmation.

### 6. ✨ Generative UI Synthesis Engine & Studio
* **Dynamic Component Dispatcher:** AI queries synthesize stateful React micro-applications on demand rather than static markdown cards.
* **Component Spectrum:**
  1. `PediatricExposureWidget`: Dynamic sliders for age (3–16 yrs), commute minutes, transit modes (Open Rickshaw, Bus, Metro, Car), and N95 masks, calculating real-time $\mu\text{g}$ PM2.5 lung deposition.
  2. `PurifierBenchWidget`: 3-Year Total Cost of Ownership (TCO) calculator comparing ₹1,800 DIY Box-Fan HEPA with ₹9,999 commercial & ₹26,500 premium purifiers.
  3. `RwaResolutionWidget`: Society circular & WhatsApp broadcast generator with customizable society name and toggles for guard heaters, sweeping bans, and DG restrictions.
  4. `DiurnalInversionWidget`: 24-Hour diurnal scrubber tracking boundary layer ceiling height (meters) and predicting hourly surface AQI dips.
  5. `AsthmaRiskWidget`: Clinical PEFR (Peak Expiratory Flow Rate) drop predictor and emergency bronchial action plan.
* **Inspect GenUI JSON Spec:** Live toggle allowing engineers to inspect the component schema representation transmitted by the GenAI synthesizer.
