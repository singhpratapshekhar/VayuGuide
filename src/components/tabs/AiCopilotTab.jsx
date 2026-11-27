import React from "react";
import {
  Bot,
  Calculator,
  Code2,
  Send,
  Sparkles,
  Stethoscope,
  Sun,
  Users,
  Wrench
} from "lucide-react";
import { MAX_CHAT_INPUT_LENGTH } from "../../services/geminiApi.js";
import {
  AsthmaRiskWidget,
  DiurnalInversionWidget,
  PediatricExposureWidget,
  PurifierBenchWidget,
  RwaResolutionWidget
} from "../GenUIWidgets.jsx";

/**
 * GenAI Atmospheric Co-Pilot & Generative UI Synthesis Studio Tab.
 */
export default function AiCopilotTab({
  city,
  effectiveAirData,
  isSimulatingAQI,
  lifestyle,
  metrics,
  safestWindowLabel,
  societyName,
  setSocietyName,
  rwaMetrics,
  apiKey,
  setApiKey,
  inputKey,
  setInputKey,
  messages,
  promptInput,
  setPromptInput,
  aiLoading,
  handleSendMessage,
  customAiPlan,
  setCustomAiPlan,
  planLoading,
  handleGenerateCustomPlan,
  activeGenWidget,
  setActiveGenWidget,
  showGenSpec,
  setShowGenSpec,
  copyToClipboard,
  showToast
}) {
  return (
          <div id="panel-ai" role="tabpanel" aria-labelledby="tab-ai" className="space-y-6 animate-fadeIn">
            {/* Conversational GenAI Co-Pilot */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-base text-white">
                      VayuGuide GenAI Atmospheric Co-Pilot
                    </h2>
                    <p className="text-xs text-slate-400">
                      Aware of {city.name} ({effectiveAirData.aqi} AQI), {lifestyle.familySize || 4}-member household & {metrics.commuteObj.label}
                    </p>
                  </div>
                </div>

                {/* API Key Input */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleGenerateCustomPlan}
                    disabled={planLoading}
                    className="text-xs font-bold px-3 py-1.5 bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/40 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles size={13} aria-hidden="true" />
                    <span>{planLoading ? "Synthesizing..." : "Synthesize Full Action Plan"}</span>
                  </button>
                  <input
                    type="password"
                    aria-label="Optional Gemini API Key (held in memory only)"
                    placeholder={apiKey ? "Gemini Key Active (Memory) ✓" : "Gemini API Key (Session Only)"}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="text-xs px-3 py-1.5 bg-[#121026] border border-purple-500/25 rounded-xl outline-none focus:border-purple-400 w-44 text-slate-200 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (inputKey.trim()) {
                        setApiKey(inputKey.trim());
                        setInputKey("");
                        showToast("Gemini API key active in session memory only (cleared on refresh).");
                      } else if (apiKey) {
                        setApiKey("");
                        showToast("Cleared Gemini API key; using offline Atmospheric Engine.");
                      }
                    }}
                    className="text-xs font-semibold px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all"
                  >
                    {inputKey.trim() ? "Save" : apiKey ? "Clear" : "Save"}
                  </button>
                </div>
              </div>

              {/* Synthesized Custom Action Plan Card (when generated) */}
              {customAiPlan && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-emerald-950/25 border border-purple-400/35 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                        ✨ {customAiPlan.source}
                      </span>
                      <h3 className="text-sm font-bold text-white">{customAiPlan.headline}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomAiPlan(null)}
                      className="text-[11px] text-slate-300 hover:text-white"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-[#0B0A18]/90 border border-purple-500/20">
                      <strong className="text-purple-300 block mb-1">1. Low-Emission Daily Routine</strong>
                      <p className="text-slate-200 leading-relaxed">{customAiPlan.routine}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0B0A18]/90 border border-purple-500/20">
                      <strong className="text-purple-300 block mb-1">2. Priority Indoor Hacks</strong>
                      <p className="text-slate-200 leading-relaxed">{customAiPlan.indoorHack}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0B0A18]/90 border border-purple-500/20">
                      <strong className="text-purple-300 block mb-1">3. Sustainable Alternatives</strong>
                      <p className="text-slate-200 leading-relaxed">{customAiPlan.ecoSwap}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                      <strong className="text-emerald-300 block mb-1">4. Direct Measurable Impact</strong>
                      <p className="text-emerald-100 leading-relaxed">{customAiPlan.directImpact}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Message History */}
              <div role="log" aria-live="polite" aria-label="AI Co-Pilot conversation" className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-purple-600 text-white rounded-br-sm shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                          : "bg-[#141228] text-slate-200 rounded-bl-sm border border-purple-500/20"
                      }`}
                    >
                      {msg.role === "ai" && msg.source && (
                        <span className="text-[9px] font-mono uppercase tracking-wider text-purple-300/80 block mb-1">
                          ✦ {msg.source}
                        </span>
                      )}
                      {msg.text}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-[#141228] rounded-2xl text-xs text-purple-300 border border-purple-500/20 animate-pulse">
                      Synthesizing location, lifestyle & atmospheric guidance...
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Prompt Recommendation Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {[
                  "Plan my low-emission daily routine today",
                  "How does my commute affect lung PM2.5?",
                  "Best indoor air hacks under ₹2,000?",
                  "Draft an RWA action plan for our society"
                ].map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="px-3 py-1 rounded-full bg-[#141228] hover:bg-[#1D1A3B] text-[11px] text-purple-300 border border-purple-500/20 whitespace-nowrap transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Prompt Box */}
              <div className="flex gap-2 pt-2 border-t border-purple-500/15">
                <input
                  type="text"
                  aria-label="Ask VayuGuide AI Co-Pilot"
                  maxLength={MAX_CHAT_INPUT_LENGTH}
                  placeholder={`Ask about ${city.name} smog, child exposure, cooking swaps, or RWA rules...`}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-[#121026] border border-purple-500/25 rounded-2xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-400 outline-none focus:border-purple-400 transition-colors"
                />
                <button
                  type="button"
                  aria-label="Send message to AI Co-Pilot"
                  onClick={() => handleSendMessage()}
                  disabled={aiLoading}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

            {/* Generative UI Interactive Micro-App Studio */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#0D0C1D]/85 border border-purple-500/25 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/15">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold">
                    ✨ Generative UI Synthesis Studio
                  </span>
                  <h2 className="font-display font-extrabold text-base text-white mt-0.5">
                    Interactive Decision Widgets
                  </h2>
                </div>
                <button
                  type="button"
                  aria-expanded={showGenSpec}
                  onClick={() => setShowGenSpec((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-[#141228] hover:bg-[#1D1A3B] border border-purple-500/25 text-xs font-mono text-purple-300 flex items-center gap-1.5 self-start sm:self-center"
                >
                  <Code2 size={13} aria-hidden="true" />
                  <span>{showGenSpec ? "Hide GenUI JSON" : "Inspect GenUI JSON Spec"}</span>
                </button>
              </div>

              {/* Widget Switcher Pills */}
              <div className="flex flex-wrap gap-2" role="group" aria-label="Interactive decision widgets">
                {[
                  { id: "pediatric", label: "Pediatric Exposure Calculator", icon: Calculator },
                  { id: "purifier", label: "3-Year Purifier TCO Bench", icon: Wrench },
                  { id: "diurnal", label: "Diurnal Inversion Scrubber", icon: Sun },
                  { id: "asthma", label: "Asthma / PEFR Action Plan", icon: Stethoscope },
                  { id: "rwa", label: "RWA Society Circular Builder", icon: Users }
                ].map((w) => {
                  const Icon = w.icon;
                  const active = activeGenWidget === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setActiveGenWidget(w.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                        active
                          ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                          : "bg-[#121026] text-slate-300 border-purple-500/20 hover:border-purple-400/40"
                      }`}
                    >
                      <Icon size={13} aria-hidden="true" />
                      <span>{w.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Synthesized Widget */}
              {activeGenWidget === "pediatric" && (
                <PediatricExposureWidget city={city} airData={effectiveAirData} />
              )}
              {activeGenWidget === "purifier" && <PurifierBenchWidget />}
              {activeGenWidget === "diurnal" && (
                <DiurnalInversionWidget airData={effectiveAirData} safestWindowLabel={safestWindowLabel} />
              )}
              {activeGenWidget === "asthma" && (
                <AsthmaRiskWidget airData={effectiveAirData} protectedIndoorAQI={metrics.protectedIndoorAQI} />
              )}
              {activeGenWidget === "rwa" && (
                <RwaResolutionWidget
                  city={city}
                  airData={effectiveAirData}
                  societyName={societyName}
                  setSocietyName={setSocietyName}
                  rwaMetrics={rwaMetrics}
                  onCopy={(txt) => copyToClipboard("rwaWidget", txt)}
                />
              )}

              {/* GenUI JSON Inspector */}
              {showGenSpec && (
                <pre className="p-4 rounded-2xl bg-[#080712] border border-purple-500/20 text-[11px] font-mono text-purple-200 overflow-x-auto">
                  {JSON.stringify(
                    {
                      synthesizedComponent: activeGenWidget,
                      context: {
                        city: city.name,
                        effectiveAQI: effectiveAirData.aqi,
                        isSimulatingAQI,
                        pm25: effectiveAirData.pm25,
                        lifestyle,
                        protectedIndoorAQI: metrics.protectedIndoorAQI,
                        familyPm25AvoidedMgPerDay: metrics.familyPm25AvoidedMgDay,
                        winterFamilyPm25Grams: metrics.winterFamilyPm25Grams,
                        co2SavedKgPerMonth: metrics.totalCo2SavedMonth
                      }
                    },
                    null,
                    2
                  )}
                </pre>
              )}
            </div>
          </div>
  );
}
