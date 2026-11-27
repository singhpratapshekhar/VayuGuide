import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("supports ArrowRight and ArrowLeft keyboard navigation across tabs with roving tabIndex", () => {
    render(<VayuGuide />);
    const dashboardTab = screen.getAllByRole("tab", { name: /Dashboard/i })[0];
    const routineTab = screen.getAllByRole("tab", { name: /Daily Routine/i })[0];

    expect(dashboardTab).toHaveAttribute("tabindex", "0");
    expect(routineTab).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(dashboardTab, { key: "ArrowRight" });
    expect(routineTab).toHaveAttribute("aria-selected", "true");
    expect(routineTab).toHaveAttribute("tabindex", "0");

    fireEvent.keyDown(routineTab, { key: "ArrowLeft" });
    expect(dashboardTab).toHaveAttribute("aria-selected", "true");
  });

  it("toggles Smog Simulator, Household Lifestyle, and opens City Search from Dashboard", async () => {
    render(<VayuGuide />);

    const simBtn = screen.getByRole("button", { name: /Simulate Smog/i });
    fireEvent.click(simBtn);
    expect(screen.getByLabelText(/Severe Winter Smog Scenario Slider/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /GRAP IV • 450/i }));
    expect(screen.getByLabelText(/Severe Winter Smog Scenario Slider/i)).toHaveValue("450");

    const seniorBtn = screen.getByRole("button", { name: /Senior Citizens/i });
    expect(seniorBtn).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(seniorBtn);
    expect(seniorBtn).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: /Change City/i }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("toggles Daily Routine items, Indoor Hacks, Eco Swaps, and RWA pledges", () => {
    render(<VayuGuide />);

    fireEvent.click(screen.getAllByRole("tab", { name: /Daily Routine/i })[0]);
    const morningCard = screen.getByRole("button", { name: /Morning Inversion Lockdown/i });
    expect(morningCard).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(morningCard);
    expect(morningCard).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getAllByRole("tab", { name: /Indoor Hacks/i })[0]);
    const hepaCheckbox = screen.getByRole("checkbox", { name: /Run HEPA Purifier/i });
    expect(hepaCheckbox).not.toBeChecked();
    fireEvent.click(hepaCheckbox);
    expect(hepaCheckbox).toBeChecked();

    fireEvent.click(screen.getAllByRole("tab", { name: /Eco Swaps/i })[0]);
    const metroSwap = screen.getByRole("button", { name: /Low-Emission Commute/i });
    expect(metroSwap).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(metroSwap);
    expect(metroSwap).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getAllByRole("tab", { name: /Community/i })[0]);
    const idlingPledge = screen.getByRole("button", { name: /No-Idling Gate Zone/i });
    expect(idlingPledge).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(idlingPledge);
    expect(idlingPledge).toHaveAttribute("aria-pressed", "true");
  });

  it("responds via offline Atmospheric Engine in AI Co-Pilot and switches GenUI widgets", async () => {
    render(<VayuGuide />);

    fireEvent.click(screen.getAllByRole("tab", { name: /AI Co-Pilot/i })[0]);
    const input = screen.getByLabelText(/Ask VayuGuide AI Co-Pilot/i);
    fireEvent.change(input, { target: { value: "What mask should my kids wear?" } });
    fireEvent.click(screen.getByRole("button", { name: /Send message to AI Co-Pilot/i }));

    await waitFor(() => {
      const log = screen.getByRole("log");
      expect(log.textContent).toMatch(/N95/i);
    });

    fireEvent.click(screen.getByRole("button", { name: /3-Year Purifier TCO Bench/i }));
    expect(screen.getByText(/3-Year Total Cost of Ownership/i)).toBeInTheDocument();
  });

  it("renders ErrorBoundary safe fallback when a child throws", () => {
    const consoleErr = vi.spyOn(console, "error").mockImplementation(() => {});
    function BrokenChild() {
      throw new Error("Simulated render crash");
    }
    render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/Something went wrong/i);
    consoleErr.mockRestore();
  });
});
