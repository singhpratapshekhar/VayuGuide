/**
 * Default household profile, commute/home options, indoor air hacks, and eco swaps data.
 * @module data/lifestyleData
 */

export const INITIAL_AIR_DATA = {
  aqi: 285,
  pm25: 165,
  pm10: 220,
  no2: 48,
  so2: 18,
  o3: 38,
  co: 520,
  updatedAt: "Baseline",
  trend: [
    { time: "6 AM", aqi: 310, pm25: 190 },
    { time: "9 AM", aqi: 260, pm25: 150 },
    { time: "12 PM", aqi: 165, pm25: 90 },
    { time: "3 PM", aqi: 140, pm25: 75 },
    { time: "6 PM", aqi: 210, pm25: 125 },
    { time: "9 PM", aqi: 275, pm25: 160 }
  ]
};

export const DEFAULT_LIFESTYLE = {
  hasKids: true,
  hasSeniors: false,
  hasAsthma: false,
  familySize: 4,
  commuteKm: 12,
  commuteMode: "auto_bus",
  homeType: "ground_roadside",
  cookingStyle: "gas_tadka",
  burnsIncense: true
};

export const DEFAULT_INDOOR_ACTIONS = {
  doorTape: true,
  wetMop: true,
  hepaFilter: false,
  kitchenExhaust: true,
  zeroSmokePrayer: false,
  plantCarbon: false
};

export const DEFAULT_ADOPTED_SWAPS = ["wet_pocha", "cooking_induction"];

export const DEFAULT_ROUTINE_COMPLETED = {
  morning_lockdown: true,
  solar_ventilation: true
};

export const DEFAULT_RWA_PLEDGES = {
  guardHeaters: true,
  dampMopping: true,
  noLeafBurning: true,
  noIdling: false
};

export const COMMUTE_OPTIONS = [
  { id: "two_wheeler", label: "2-Wheeler / Walk", mult: 1.45, note: "Highest direct tailpipe plume inhalation" },
  { id: "auto_bus", label: "Auto / School Bus", mult: 1.25, note: "Semi-open cabin exposed to road dust" },
  { id: "metro_car", label: "Metro / AC Car", mult: 0.78, note: "Filtered cabin reduces particulate dose" },
  { id: "wfh", label: "Work From Home", mult: 0.58, note: "Minimal outdoor transit exposure" }
];

export const HOME_OPTIONS = [
  { id: "ground_roadside", label: "Low-Floor / Roadside", infiltration: 0.78 },
  { id: "independent", label: "Independent House", infiltration: 0.72 },
  { id: "high_rise", label: "High-Rise (6th+)", infiltration: 0.62 }
];

export const ECO_SWAPS_DATA = [
  {
    id: "commute_metro",
    category: "Low-Emission Commute",
    from: "Solo Petrol 2-Wheeler / Cab in Rush Hour",
    to: "Underground Metro / Shared EV Carpool",
    why: "Open 2-wheeler riders inhale 2–3x more concentrated tailpipe PM2.5 and ultrafine soot directly at exhaust height. Underground metro & shared EVs cut personal dose and remove tailpipe NO₂ from neighborhood streets.",
    pm25DropUg: 28,
    co2SavedKgMonth: 38,
    rupeeDeltaMonth: "+₹650 saved on fuel",
    impactBadge: "-65% Transit Lung Dose • 38 kg CO₂/mo saved",
    cost: "Transit Card"
  },
  {
    id: "cooking_induction",
    category: "Clean Kitchen Protocol",
    from: "Open-Pan High-Heat Mustard Oil Tadka",
    to: "Pre-Drafted Chimney + Lid Tadka / Induction",
    why: "High-heat frying and unvented gas combustion spike kitchen PM2.5 above 400 µg/m³ within 5 minutes. Running exhaust 5 mins early and covering tadka traps aerosolized oil droplets before they spread to bedrooms.",
    pm25DropUg: 22,
    co2SavedKgMonth: 12,
    rupeeDeltaMonth: "₹0 (Habit Change)",
    impactBadge: "-78% Kitchen PM2.5 Spike • Zero Oil Haze",
    cost: "₹0"
  },
  {
    id: "ritual_led",
    category: "Zero-Smoke Rituals",
    from: "Daily Agarbatti, Dhoop & Paraffin Candles",
    to: "Pure Cow-Ghee Diya / LED Diya / Essential Oil",
    why: "One incense stick indoors releases ~45 mg of PM2.5 plus carcinogenic PAHs in a closed winter room. Switching to a clean-burning ghee wick or ultrasonic diffuser keeps prayer rituals sacred without poisoning indoor air.",
    pm25DropUg: 24,
    co2SavedKgMonth: 5,
    rupeeDeltaMonth: "Neutral (₹49 setup)",
    impactBadge: "-92% Indoor PAHs • -24 µg/m³ PM2.5",
    cost: "₹49"
  },
  {
    id: "guard_heater",
    category: "Community RWA Heating",
    from: "Guard Booth Scrap Wood / Plastic / Coal Sigdi",
    to: "800W Quartz / Halogen Radiant Heater",
    why: "A single smoldering scrap-wood fire at a society gate emits ~2.4 kg of toxic PM2.5 per winter night, drifting straight into 1st–4th floor balconies. Pooling ₹150/flat eliminates the entire society's worst ground-level plume.",
    pm25DropUg: 32,
    co2SavedKgMonth: 65,
    rupeeDeltaMonth: "₹150 one-time/flat",
    impactBadge: "2.4 kg PM2.5/night stopped per gate",
    cost: "₹899 / unit"
  },
  {
    id: "wet_pocha",
    category: "Zero-Resuspension Cleaning",
    from: "Dry Grass Brooming (Jhadu) Indoors & Lobbies",
    to: "Hot-Water Microfibre Damp Mop (Geela Pocha)",
    why: "Dry brooms kick settled heavy metals, allergens, and PM2.5 micro-dust back up to 1.2 meters — directly into children's breathing zone. Damp mopping binds particles permanently into wash water.",
    pm25DropUg: 18,
    co2SavedKgMonth: 0,
    rupeeDeltaMonth: "₹0",
    impactBadge: "-40 AQI Indoor Dust • Child Lung Safe",
    cost: "₹0"
  },
  {
    id: "leaf_compost",
    category: "Neighborhood Waste",
    from: "Open Burning of Dry Garden Leaves & Trash",
    to: "Society Leaf-Compost Pit & Mulching",
    why: "Wet winter leaf piles smolder at low temperatures, producing 10x more fine particulate smoke and dioxins than dry combustion. Converting society leaf litter into garden compost eliminates local smoke plumes.",
    pm25DropUg: 16,
    co2SavedKgMonth: 45,
    rupeeDeltaMonth: "Saves ₹1,200/mo manure",
    impactBadge: "Zero Dioxin Smoke • 45 kg CO₂/mo saved",
    cost: "₹0 (RWA Pit)"
  }
];

export const INDOOR_HACKS_DATA = [
  {
    key: "doorTape",
    title: "1. Seal Door & Balcony Gaps with EVA Foam Tape",
    desc: "Apply ₹99 self-adhesive high-density foam weatherstripping along main doors and sliding balcony frames to stop cold smog drafts.",
    why: "Outdoor smog infiltrates unsealed Indian flats within 45 minutes via stack-effect pressure drafts.",
    aqiDrop: 75,
    pmDrop: 38,
    cost: "₹99",
    badge: "-32% Infiltration"
  },
  {
    key: "wetMop",
    title: "2. Mandate Damp Mopping (Geela Pocha) Twice Daily",
    desc: "Replace dry jhadu sweeping indoors and in society corridors with damp microfibre mopping.",
    why: "Prevents settled toxic PM2.5 from resuspending into chest-height breathing zones.",
    aqiDrop: 38,
    pmDrop: 18,
    cost: "₹0",
    badge: "-38 AQI Dust"
  },
  {
    key: "hepaFilter",
    title: "3. Run HEPA Purifier or ₹1,800 DIY Box-Fan Filter",
    desc: "Seal bedroom doors and run a HEPA H13 unit (or 12-inch exhaust/box fan taped to an H13 filter) to hit 4 Air Changes/Hour.",
    why: "Active mechanical filtration captures 99.95% of 0.3µm fine smog particles trapped indoors.",
    aqiDrop: 115,
    pmDrop: 62,
    cost: "₹1,800 DIY",
    badge: "-55% Indoor PM2.5"
  },
  {
    key: "kitchenExhaust",
    title: "4. Pre-Draft Kitchen Chimney + Covered Tadka",
    desc: "Turn on exhaust fan/chimney 5 minutes BEFORE heating oil and cover tempering pans with a lid.",
    why: "Stops cooking aerosol spikes (which otherwise double indoor PM2.5 during evening hours).",
    aqiDrop: 32,
    pmDrop: 16,
    cost: "₹0",
    badge: "-78% Cooking Spike"
  },
  {
    key: "zeroSmokePrayer",
    title: "5. Smoke-Free Prayer & Entryway Decontamination",
    desc: "Swap agarbatti/dhoop for LED/ghee diyas and leave outdoor shoes & jackets at the foyer.",
    why: "Eliminates indoor PAH combustion and prevents tracked-in road soot from shedding onto sofas and beds.",
    aqiDrop: 34,
    pmDrop: 18,
    cost: "₹49",
    badge: "-92% Indoor PAHs"
  },
  {
    key: "plantCarbon",
    title: "6. Activated Carbon Mesh + Snake/Areca Plant Buffer",
    desc: "Place low-light Snake Plants (night O₂) & Areca Palms near windows plus an inexpensive carbon pre-filter sheet.",
    why: "Helps adsorb trace VOCs and NO₂ gases that basic dust filters miss (complementing, not replacing, HEPA).",
    aqiDrop: 14,
    pmDrop: 7,
    cost: "₹250",
    badge: "NO₂ & VOC Buffer"
  }
];
