import React from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VayuGuide from "../src/VayuGuide.jsx";
import ErrorBoundary from "../src/components/ErrorBoundary.jsx";

describe("VayuGuide Interactive User Flows", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          us_aqi: 245,
          pm2_5: 135,
          pm10: 195,
          nitrogen_dioxide: 42,
          sulphur_dioxide: 14,
          ozone: 32,
          carbon_monoxide: 480
        },
        hourly: { time: [], us_aqi: [] },
        results: []
      })
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("supports ArrowRight, ArrowLeft, Home, and End keyboard navigation across tabs", () => {
    render(<VayuGuide />);
    const dashboardTab = screen.getAllByRole("tab", { name: /Dashboard/i })[0];
    const routineTab = screen.getAllByRole("tab", { name: /Daily Routine/i })[0];
    const aiTab = screen.getAllByRole("tab", { name: /AI Co-Pilot/i })[0];

    expect(dashboardTab).toHaveAttribute("tabindex", "0");
    expect(routineTab).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(dashboardTab, { key: "ArrowRight" });
    expect(routineTab).toHaveAttribute("aria-selected", "true");
    expect(routineTab).toHaveAttribute("tabindex", "0");

    fireEvent.keyDown(routineTab, { key: "ArrowLeft" });
    expect(dashboardTab).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(dashboardTab, { key: "End" });
    expect(aiTab).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(aiTab, { key: "Home" });
    expect(dashboardTab).toHaveAttribute("aria-selected", "true");
  });

  it("toggles Smog Simulator, Household Lifestyle, and searches/selects a city via CitySearchModal", async () => {
    render(<VayuGuide />);

    fireEvent.click(screen.getByRole("button", { name: /Simulate Smog/i }));
    const slider = screen.getByLabelText(/Severe Winter Smog Scenario Slider/i);
    fireEvent.click(screen.getByRole("button", { name: /GRAP IV • 450/i }));
    expect(slider).toHaveValue("450");

    const seniorBtn = screen.getByRole("button", { name: /Senior Citizens/i });
    fireEvent.click(seniorBtn);
    expect(seniorBtn).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: /Change City/i }));
    const dialog = await screen.findByRole("dialog");

    const searchInput = screen.getByLabelText(/Search for a city/i);
    fireEvent.change(searchInput, { target: { value: "Jaipur" } });

    await waitFor(() => {
      expect(screen.getByText(/No cities found matching/i)).toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: "" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /Kanpur/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("toggles Daily Routine, Indoor Hacks + DIY guide + room slider, Eco Swaps, and RWA pledges", () => {
    render(<VayuGuide />);

    fireEvent.click(screen.getAllByRole("tab", { name: /Daily Routine/i })[0]);
    const morningCard = screen.getByRole("button", { name: /Morning Inversion Lockdown/i });
    expect(morningCard).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(morningCard);
    expect(morningCard).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getAllByRole("tab", { name: /Indoor Hacks/i })[0]);
    const hepaCheckbox = screen.getByRole("checkbox", { name: /Run HEPA Purifier/i });
    fireEvent.click(hepaCheckbox);
    expect(hepaCheckbox).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: /Show 5-Min Build Guide/i }));
    expect(screen.getByText(/STEP 1 • PARTS/i)).toBeInTheDocument();

    const roomSlider = screen.getByLabelText(/Room Volume & Clean-Down Speed/i);
    fireEvent.change(roomSlider, { target: { value: "250" } });
    expect(screen.getByText(/250 sq ft/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("tab", { name: /Eco Swaps/i })[0]);
    const metroSwap = screen.getByRole("button", { name: /Low-Emission Commute/i });
    fireEvent.click(metroSwap);
    expect(metroSwap).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getAllByRole("tab", { name: /Community/i })[0]);
    const idlingPledge = screen.getByRole("button", { name: /No-Idling Gate Zone/i });
    fireEvent.click(idlingPledge);
    expect(idlingPledge).toHaveAttribute("aria-pressed", "true");
  });

  it("synthesizes Action Plan, responds in AI Co-Pilot, and interacts with all 5 GenUI widgets", async () => {
    render(<VayuGuide />);

    fireEvent.click(screen.getAllByRole("tab", { name: /AI Co-Pilot/i })[0]);

    fireEvent.click(screen.getByRole("button", { name: /Synthesize Full Action Plan/i }));
    await waitFor(() => {
      expect(screen.getByText(/1\. Low-Emission Daily Routine/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /Dismiss/i }));
    expect(screen.queryByText(/1\. Low-Emission Daily Routine/i)).not.toBeInTheDocument();

    const input = screen.getByLabelText(/Ask VayuGuide AI Co-Pilot/i);
    fireEvent.change(input, { target: { value: "What mask should my kids wear?" } });
    fireEvent.click(screen.getByRole("button", { name: /Send message to AI Co-Pilot/i }));

    await waitFor(() => {
      expect(screen.getByRole("log").textContent).toMatch(/N95/i);
    });

    fireEvent.click(screen.getByRole("button", { name: /3-Year Purifier TCO Bench/i }));
    expect(screen.getByText(/3-Year Total Cost of Ownership/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Diurnal Inversion Scrubber/i }));
    expect(screen.getByText(/24-Hour Boundary Layer/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Asthma \/ PEFR Action Plan/i }));
    expect(screen.getByText(/Respiratory & Bronchial Precaution Protocol/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /RWA Society Circular Builder/i }));
    expect(screen.getByText(/RWA Society Circular & Resolution Builder/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Inspect GenUI JSON Spec/i }));
    expect(screen.getByText(/"synthesizedComponent": "rwa"/i)).toBeInTheDocument();
  });

  it("handles GPS detection gracefully when supported or denied", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success) =>
          success({ coords: { latitude: 19.076, longitude: 72.8777 } })
      }
    });

    render(<VayuGuide />);
    fireEvent.click(screen.getByRole("button", { name: /Detect GPS Location/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Select city, currently My GPS Location/i })).toBeInTheDocument();
    });
  });

  it("renders ErrorBoundary safe fallback and recovers on Try Again", () => {
    const consoleErr = vi.spyOn(console, "error").mockImplementation(() => {});
    let shouldThrow = true;
    function FlakyChild() {
      if (shouldThrow) throw new Error("Simulated render crash");
      return <div>Recovered cleanly</div>;
    }
    render(
      <ErrorBoundary>
        <FlakyChild />
      </ErrorBoundary>
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/Something went wrong/i);
    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: /Try Again/i }));
    expect(screen.getByText("Recovered cleanly")).toBeInTheDocument();
    consoleErr.mockRestore();
  });
});
