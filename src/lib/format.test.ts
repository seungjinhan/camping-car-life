import { describe, expect, it } from "vitest";
import { calendarDates, dayCount, distanceKm, formatDay, localDateKey } from "./format";

describe("dayCount", () => {
  it("counts the start day as D+1", () => {
    expect(dayCount("2026-09-30", new Date(2026, 8, 30, 15))).toBe(1);
    expect(dayCount("2026-09-30", new Date(2026, 10, 13, 9))).toBe(45);
  });
});

describe("formatDay", () => {
  it("follows the chosen language", () => {
    expect(formatDay("2026-11-22", "ko")).toContain("22");
    expect(formatDay("2026-11-22", "ko")).toContain("일");
    expect(formatDay("2026-11-22", "en")).toMatch(/Sun/);
  });
});

describe("localDateKey", () => {
  it("pads month and day", () => expect(localDateKey(new Date(2026, 0, 5))).toBe("2026-01-05"));
});

describe("distanceKm", () => {
  it("is about 0 for the same point and grows with distance", () => {
    expect(distanceKm({ lat: 37, lng: 128 }, { lat: 37, lng: 128 })).toBe(0);
    const km = distanceKm({ lat: 37.98, lng: 128.17 }, { lat: 38.1, lng: 127.7 });
    expect(km).toBeGreaterThan(40);
    expect(km).toBeLessThan(50);
  });
});

describe("calendarDates", () => {
  it("uses date ranges for all-day events", () => expect(calendarDates({ start: "2026-11-08", end: "2026-11-09", allDay: true })).toBe("20261108/20261109"));
  it("uses UTC times for timed events", () => expect(calendarDates({ start: "2026-11-22T10:00:00+09:00", end: "2026-11-22T18:00:00+09:00", allDay: false })).toBe("20261122T010000Z/20261122T090000Z"));
});

describe("dayCount before departure", () => {
  // 홈은 출발 전이면 D-(1 - dayCount)를 보여줘요.
  it("counts down to a future start date", () => {
    expect(1 - dayCount("2026-12-01", new Date(2026, 10, 18))).toBe(13);
    expect(1 - dayCount("2026-12-01", new Date(2026, 10, 30))).toBe(1);
    expect(dayCount("2026-12-01", new Date(2026, 11, 1))).toBe(1);
  });
});
