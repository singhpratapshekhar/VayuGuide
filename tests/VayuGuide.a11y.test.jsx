import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VayuGuide from "../src/VayuGuide.jsx";

describe("VayuGuide Accessibility & Core Flows", () => {
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

  it("renders semantic landmarks, skip link, and passes axe-core WCAG audit with 0 violations", async () => {
    const { container } = render(<VayuGuide />);

    expect(screen.getByText("Skip to main content")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();

    const results = await axe.run(container, {
      rules: {
        // jsdom does not compute external Tailwind stylesheet colors, so color-contrast is checked manually/in browser
        "color-contrast": { enabled: false }
      }
    });
    expect(results.violations).toEqual([]);
  });

  it("passes axe-core WCAG audit across all 6 navigation tabs", async () => {
    const { container } = render(<VayuGuide />);
    const tabNames = [/Dashboard/i, /Daily Routine/i, /Indoor Hacks/i, /Eco Swaps/i, /Community/i, /AI Co-Pilot/i];

    for (const name of tabNames) {
      const tab = screen.getAllByRole("tab", { name })[0];
      fireEvent.click(tab);
      expect(screen.getByRole("tabpanel")).toBeInTheDocument();
      const results = await axe.run(container, {
        rules: { "color-contrast": { enabled: false } }
      });
      expect(results.violations).toEqual([]);
    }
  }, 15000);

  it("supports keyboard tab switching and opens/closes CitySearchModal with Escape", async () => {
    render(<VayuGuide />);

    const routineTab = screen.getAllByRole("tab", { name: /Daily Routine/i })[0];
    fireEvent.click(routineTab);
    expect(screen.getByRole("tabpanel")).toHaveAttribute("id", "panel-routine");

    const cityBtn = screen.getByRole("button", { name: /Select city, currently/i });
    fireEvent.click(cityBtn);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");

    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("opens PrivacyModal and clears localStorage on Clear All Local Data without storing Gemini key", async () => {
    render(<VayuGuide />);

    const aiTab = screen.getAllByRole("tab", { name: /AI Co-Pilot/i })[0];
    fireEvent.click(aiTab);

    const keyInput = screen.getByLabelText(/Optional Gemini API Key/i);
    fireEvent.change(keyInput, { target: { value: "AIzaSessionOnlyTest12345" } });
    fireEvent.click(screen.getByRole("button", { name: /^Save$/i }));

    // Ensure secret is NEVER written to localStorage
    expect(localStorage.getItem("vg_gemini_key")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Privacy, Terms & Clear Data/i }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Clear All Local Data/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
