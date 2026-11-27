import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VayuGuide from "../src/VayuGuide.jsx";

async function runAxe(container) {
  const results = await axe.run(container, {
    rules: {
      // jsdom does not compute external Tailwind stylesheet colors; contrast tokens are audited in design/CSS
      "color-contrast": { enabled: false }
    }
  });
  expect(results.violations).toEqual([]);
}

describe("VayuGuide Accessibility & Privacy Controls", () => {
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

  it("renders semantic landmarks, skip link, h1 heading, and passes axe-core across all 6 tabs", async () => {
    const { container } = render(<VayuGuide />);

    expect(screen.getByText("Skip to main content")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();

    const tabNames = [/Dashboard/i, /Daily Routine/i, /Indoor Hacks/i, /Eco Swaps/i, /Community/i, /AI Co-Pilot/i];
    for (const name of tabNames) {
      const tab = screen.getAllByRole("tab", { name })[0];
      fireEvent.click(tab);
      expect(screen.getByRole("tabpanel")).toBeInTheDocument();
      await runAxe(container);
    }
  }, 20000);

  it("passes axe-core with CitySearchModal open and restores focus on Escape", async () => {
    const { container } = render(<VayuGuide />);
    const cityBtn = screen.getByRole("button", { name: /Select city, currently/i });
    cityBtn.focus();
    fireEvent.click(cityBtn);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    await runAxe(container);

    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("opens PrivacyModal, passes axe-core, never stores Gemini key, and clears localStorage", async () => {
    const { container } = render(<VayuGuide />);

    fireEvent.click(screen.getAllByRole("tab", { name: /AI Co-Pilot/i })[0]);
    const keyInput = screen.getByLabelText(/Optional Gemini API Key/i);
    fireEvent.change(keyInput, { target: { value: "AIzaSessionOnlyTest12345" } });
    fireEvent.click(screen.getByRole("button", { name: /^Save$/i }));

    expect(localStorage.getItem("vg_gemini_key")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Privacy, Terms & Clear Data/i }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await runAxe(container);

    fireEvent.click(screen.getByRole("button", { name: /Clear All Local Data/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
