import { describe, it, expect } from "vitest";
import { formatDate } from "./utils";

describe("formatDate", () => {
  it("formats an ISO date string into a human-readable format", () => {
    const result = formatDate("2025-03-15T14:30:00Z");
    expect(result).toContain("Mar");
    expect(result).toContain("15");
  });

  it("includes the day of week", () => {
    const result = formatDate("2025-03-15T14:30:00Z");
    expect(result).toContain("Sat");
  });

  it("includes the time", () => {
    const result = formatDate("2025-03-15T14:30:00Z");
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("handles different dates", () => {
    const result = formatDate("2025-12-25T09:00:00Z");
    expect(result).toContain("Dec");
    expect(result).toContain("25");
  });
});
