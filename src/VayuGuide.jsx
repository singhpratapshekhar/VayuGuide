import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useVayuGuideState } from "./hooks/useVayuGuideState.js";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Navbar from "./components/Navbar.jsx";
import HeroBanner from "./components/HeroBanner.jsx";
import DashboardTab from "./components/tabs/DashboardTab.jsx";
import RoutineTab from "./components/tabs/RoutineTab.jsx";
import IndoorTab from "./components/tabs/IndoorTab.jsx";
import SwapsTab from "./components/tabs/SwapsTab.jsx";
import CommunityTab from "./components/tabs/CommunityTab.jsx";
import AiCopilotTab from "./components/tabs/AiCopilotTab.jsx";
import CitySearchModal from "./components/CitySearchModal.jsx";
import PrivacyModal from "./components/PrivacyModal.jsx";

const TAB_IDS = ["dashboard", "routine", "indoor", "swaps", "whatsapp", "ai"];

function VayuGuideApp() {
  const s = useVayuGuideState();

  const handleTabKeyDown = (e, currentId, idPrefix = "tab") => {
    const idx = TAB_IDS.indexOf(currentId);
    if (idx === -1) return;

    let targetId = null;
    if (e.key === "ArrowRight") {
      targetId = TAB_IDS[(idx + 1) % TAB_IDS.length];
    } else if (e.key === "ArrowLeft") {
      targetId = TAB_IDS[(idx - 1 + TAB_IDS.length) % TAB_IDS.length];
    } else if (e.key === "Home") {
      targetId = TAB_IDS[0];
    } else if (e.key === "End") {
      targetId = TAB_IDS[TAB_IDS.length - 1];
    }

    if (targetId) {
      e.preventDefault();
      s.setActiveTab(targetId);
      document.getElementById(`${idPrefix}-${targetId}`)?.focus();
    }
  };

  const askAiWithTopic = (topic) => {
    s.setActiveTab("ai");
    s.handleSendMessage(topic);
  };

  return (
    <div className="min-h-screen bg-[#06060C] text-slate-100 font-sans selection:bg-purple-600 selection:text-white pb-20 relative">
      {s.toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-2xl bg-[#15132B]/95 border border-purple-400/40 text-xs font-semibold text-purple-100 shadow-[0_10px_30px_rgba(139,92,246,0.4)] flex items-center gap-2 backdrop-blur-xl"
        >
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" aria-hidden="true" />
          <span>{s.toastMsg}</span>
        </div>
      )}

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-purple-600 focus:text-white focus:text-xs focus:font-bold"
      >
        Skip to main content
      </a>

      <Navbar
        activeTab={s.activeTab}
        setActiveTab={s.setActiveTab}
        handleTabKeyDown={handleTabKeyDown}
        city={s.city}
        onOpenSearch={() => s.setIsSearchOpen(true)}
        onDetectGPS={s.handleDetectGPS}
        loading={s.loading}
      />

      <HeroBanner
        city={s.city}
        setCity={s.setCity}
        onOpenSearch={() => s.setIsSearchOpen(true)}
      />

      <main id="main-content" tabIndex={-1} className="max-w-5xl mx-auto px-4 space-y-6 outline-none">
        {s.activeTab === "dashboard" && (
          <DashboardTab
            city={s.city}
            effectiveAirData={s.effectiveAirData}
            aqiCategory={s.aqiCategory}
            locationProfile={s.locationProfile}
            metrics={s.metrics}
            lifestyle={s.lifestyle}
            setLifestyle={s.setLifestyle}
            isSimulatingAQI={s.isSimulatingAQI}
            setIsSimulatingAQI={s.setIsSimulatingAQI}
            simulatedAQI={s.simulatedAQI}
            setSimulatedAQI={s.setSimulatedAQI}
            loading={s.loading}
            loadCityData={s.loadCityData}
            peakPoint={s.peakPoint}
            safestPoint={s.safestPoint}
            safestWindowLabel={s.safestWindowLabel}
            setActiveTab={s.setActiveTab}
            setIsSearchOpen={s.setIsSearchOpen}
            askAiWithTopic={askAiWithTopic}
          />
        )}

        {s.activeTab === "routine" && (
          <RoutineTab
            city={s.city}
            effectiveAirData={s.effectiveAirData}
            metrics={s.metrics}
            routineBlocks={s.routineBlocks}
            routineCompleted={s.routineCompleted}
            setRoutineCompleted={s.setRoutineCompleted}
            completedRoutineCount={s.completedRoutineCount}
            safestWindowLabel={s.safestWindowLabel}
            safestPoint={s.safestPoint}
            peakPoint={s.peakPoint}
            copiedKey={s.copiedKey}
            copyToClipboard={s.copyToClipboard}
            askAiWithTopic={askAiWithTopic}
          />
        )}

        {s.activeTab === "indoor" && (
          <IndoorTab
            city={s.city}
            effectiveAirData={s.effectiveAirData}
            indoorCategory={s.indoorCategory}
            metrics={s.metrics}
            indoorActions={s.indoorActions}
            setIndoorActions={s.setIndoorActions}
            showDiyGuide={s.showDiyGuide}
            setShowDiyGuide={s.setShowDiyGuide}
            roomSqFt={s.roomSqFt}
            setRoomSqFt={s.setRoomSqFt}
            roomAchStats={s.roomAchStats}
            askAiWithTopic={askAiWithTopic}
          />
        )}

        {s.activeTab === "swaps" && (
          <SwapsTab
            city={s.city}
            locationProfile={s.locationProfile}
            lifestyle={s.lifestyle}
            metrics={s.metrics}
            adoptedSwaps={s.adoptedSwaps}
            toggleEcoSwap={s.toggleEcoSwap}
          />
        )}

        {s.activeTab === "whatsapp" && (
          <CommunityTab
            city={s.city}
            effectiveAirData={s.effectiveAirData}
            aqiCategory={s.aqiCategory}
            safestWindowLabel={s.safestWindowLabel}
            metrics={s.metrics}
            societyName={s.societyName}
            setSocietyName={s.setSocietyName}
            flatCount={s.flatCount}
            setFlatCount={s.setFlatCount}
            rwaPledges={s.rwaPledges}
            setRwaPledges={s.setRwaPledges}
            rwaMetrics={s.rwaMetrics}
            copiedKey={s.copiedKey}
            copyToClipboard={s.copyToClipboard}
          />
        )}

        {s.activeTab === "ai" && (
          <AiCopilotTab
            city={s.city}
            effectiveAirData={s.effectiveAirData}
            isSimulatingAQI={s.isSimulatingAQI}
            lifestyle={s.lifestyle}
            metrics={s.metrics}
            safestWindowLabel={s.safestWindowLabel}
            societyName={s.societyName}
            setSocietyName={s.setSocietyName}
            rwaMetrics={s.rwaMetrics}
            apiKey={s.apiKey}
            setApiKey={s.setApiKey}
            inputKey={s.inputKey}
            setInputKey={s.setInputKey}
            messages={s.messages}
            promptInput={s.promptInput}
            setPromptInput={s.setPromptInput}
            aiLoading={s.aiLoading}
            handleSendMessage={s.handleSendMessage}
            customAiPlan={s.customAiPlan}
            setCustomAiPlan={s.setCustomAiPlan}
            planLoading={s.planLoading}
            handleGenerateCustomPlan={s.handleGenerateCustomPlan}
            activeGenWidget={s.activeGenWidget}
            setActiveGenWidget={s.setActiveGenWidget}
            showGenSpec={s.showGenSpec}
            setShowGenSpec={s.setShowGenSpec}
            copyToClipboard={s.copyToClipboard}
            showToast={s.showToast}
          />
        )}
      </main>

      {s.isSearchOpen && (
        <CitySearchModal
          isOpen={s.isSearchOpen}
          onClose={() => s.setIsSearchOpen(false)}
          onSelectCity={(newCity) => {
            s.setCity(newCity);
            s.setIsSearchOpen(false);
          }}
          onDetectGPS={() => {
            s.handleDetectGPS();
            s.setIsSearchOpen(false);
          }}
        />
      )}

      <PrivacyModal
        isOpen={s.isPrivacyOpen}
        onClose={() => s.setIsPrivacyOpen(false)}
        onClearAllData={s.handleClearAllData}
      />

      <footer className="max-w-5xl mx-auto px-4 mt-10 pt-6 border-t border-purple-500/15 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>
          VayuGuide — Transparent exposure math (Berkeley Earth 22 µg/m³ = 1 cig, 12 m³/day tidal volume).
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => s.setIsPrivacyOpen(true)}
            className="text-purple-300 hover:text-white underline underline-offset-4 font-semibold cursor-pointer"
          >
            Privacy, Terms &amp; Clear Data
          </button>
        </div>
      </footer>
    </div>
  );
}

/**
 * Root VayuGuide component wrapped in a resilient ErrorBoundary.
 */
export default function VayuGuide() {
  return (
    <ErrorBoundary>
      <VayuGuideApp />
    </ErrorBoundary>
  );
}
