import { describe, it, expect } from "vitest";
import {
  cn, formatTime, pctColor, pctBgColor, categoryColor, categoryLabel,
  classificationOrder, generateId, formatDate, formatDateTime, minutesBetween,
} from "../utils";

describe("cn", () => {
  it("joins truthy classes and drops falsy ones", () => {
    expect(cn("a", undefined, false, null, "b")).toBe("a b");
    expect(cn()).toBe("");
  });
});

describe("formatTime", () => {
  it("always renders two decimals", () => {
    expect(formatTime(1)).toBe("1.00");
    expect(formatTime(1.234)).toBe("1.23");
    expect(formatTime(1.235)).toBe("1.24");
  });
});

describe("colour thresholds", () => {
  it("pctColor switches at 100 and 90", () => {
    expect(pctColor(100)).toContain("green");
    expect(pctColor(99.9)).toContain("yellow");
    expect(pctColor(90)).toContain("yellow");
    expect(pctColor(89.9)).toContain("red");
  });

  it("pctBgColor switches at 100 and 85", () => {
    expect(pctBgColor(100)).toContain("green");
    expect(pctBgColor(85)).toContain("yellow");
    expect(pctBgColor(84.9)).toContain("red");
  });
});

describe("category display", () => {
  it("maps known categories and falls back for unknown ones", () => {
    expect(categoryColor("marksmanship").text).toContain("red");
    expect(categoryColor("mystery")).toEqual({ bg: "bg-gray-50", text: "text-gray-700" });
    expect(categoryLabel("transition_vision")).toBe("Transitions");
    expect(categoryLabel("mystery")).toBe("mystery");
  });
});

describe("classificationOrder", () => {
  it("ranks D through GM and returns -1 for unknown", () => {
    expect(classificationOrder("D")).toBe(0);
    expect(classificationOrder("GM")).toBe(5);
    expect(classificationOrder("B")).toBeLessThan(classificationOrder("A"));
    expect(classificationOrder("Z")).toBe(-1);
  });
});

describe("generateId", () => {
  it("is non-empty and collision-free across a burst", () => {
    const ids = new Set(Array.from({ length: 500 }, generateId));
    expect(ids.size).toBe(500);
  });
});

describe("date formatting", () => {
  it("formats a date and a date-time", () => {
    const iso = "2026-06-01T15:30:00.000Z";
    expect(formatDate(iso)).toMatch(/\w{3} \d{1,2}/);
    expect(formatDateTime(iso)).toMatch(/\w{3} \d{1,2}, 2026/);
  });

  it("minutesBetween rounds to the nearest minute and can go negative", () => {
    expect(minutesBetween("2026-06-01T10:00:00Z", "2026-06-01T10:45:00Z")).toBe(45);
    expect(minutesBetween("2026-06-01T10:00:00Z", "2026-06-01T10:00:20Z")).toBe(0);
    expect(minutesBetween("2026-06-01T10:45:00Z", "2026-06-01T10:00:00Z")).toBe(-45);
  });
});
