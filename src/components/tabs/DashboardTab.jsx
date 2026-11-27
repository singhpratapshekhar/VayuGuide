import React from "react";
import TelemetryHeroCard from "../dashboard/TelemetryHeroCard.jsx";
import HouseholdProfilerCard from "../dashboard/HouseholdProfilerCard.jsx";
import ProtocolAndPollutantsGrid from "../dashboard/ProtocolAndPollutantsGrid.jsx";

/**
 * Primary Dashboard Tab orchestrating live telemetry, household lifestyle profiler,
 * protocol verdicts, and multi-pollutant bento.
 */
export default function DashboardTab({
  city,
  effectiveAirData,
  aqiCategory,
  locationProfile,
  metrics,
  lifestyle,
  setLifestyle,
  isSimulatingAQI,
  setIsSimulatingAQI,
  simulatedAQI,
  setSimulatedAQI,
  loading,
  loadCityData,
  peakPoint,
  safestPoint,
  safestWindowLabel,
  setActiveTab,
  setIsSearchOpen,
  askAiWithTopic
}) {
  return (
    <div id="panel-dashboard" role="tabpanel" aria-labelledby="tab-dashboard" className="space-y-6 animate-fadeIn">
      <TelemetryHeroCard
        city={city}
        effectiveAirData={effectiveAirData}
        aqiCategory={aqiCategory}
        locationProfile={locationProfile}
        metrics={metrics}
        isSimulatingAQI={isSimulatingAQI}
        setIsSimulatingAQI={setIsSimulatingAQI}
        simulatedAQI={simulatedAQI}
        setSimulatedAQI={setSimulatedAQI}
        loading={loading}
        loadCityData={loadCityData}
        peakPoint={peakPoint}
        safestPoint={safestPoint}
        safestWindowLabel={safestWindowLabel}
        setActiveTab={setActiveTab}
        setIsSearchOpen={setIsSearchOpen}
        askAiWithTopic={askAiWithTopic}
      />
      <HouseholdProfilerCard
        lifestyle={lifestyle}
        setLifestyle={setLifestyle}
        metrics={metrics}
      />
      <ProtocolAndPollutantsGrid
        effectiveAirData={effectiveAirData}
        aqiCategory={aqiCategory}
        lifestyle={lifestyle}
        metrics={metrics}
        safestWindowLabel={safestWindowLabel}
      />
    </div>
  );
}
