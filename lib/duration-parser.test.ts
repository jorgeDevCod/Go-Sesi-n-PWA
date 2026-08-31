import { describe, expect, it } from "vitest";
import { MAX_MINUTES, parseDurationInput } from "@/lib/duration-parser";

describe("parseDurationInput-valid formats", () => {
  it("parses a plain number as minutes", () => {
    expect(parseDurationInput("45")).toBe(45);
  });

  it("parses '85m'", () => {
    expect(parseDurationInput("85m")).toBe(85);
  });

  it("parses '1h 25m'", () => {
    expect(parseDurationInput("1h 25m")).toBe(85);
  });

  it("parses '1h25m' without spaces", () => {
    expect(parseDurationInput("1h25m")).toBe(85);
  });

  it("parses '1:25' as H:MM", () => {
    expect(parseDurationInput("1:25")).toBe(85);
  });

  it("parses a bare hour token '1h'", () => {
    expect(parseDurationInput("1h")).toBe(60);
  });

  it("is tolerant of Spanish words and reordering", () => {
    expect(parseDurationInput("2 horas 10 minutos")).toBe(130);
    expect(parseDurationInput("25m 1h")).toBe(85);
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(parseDurationInput("  1H 10MIN  ")).toBe(70);
  });
});

describe("parseDurationInput-invalid input rejected", () => {
  it("rejects empty or whitespace-only input", () => {
    expect(parseDurationInput("")).toBeNull();
    expect(parseDurationInput("   ")).toBeNull();
  });

  it("rejects gibberish", () => {
    expect(parseDurationInput("abc")).toBeNull();
  });

  it("rejects zero", () => {
    expect(parseDurationInput("0")).toBeNull();
    expect(parseDurationInput("0m")).toBeNull();
  });

  it("rejects negative numbers", () => {
    expect(parseDurationInput("-5")).toBeNull();
    expect(parseDurationInput("-5m")).toBeNull();
  });

  it("rejects values above the max cap", () => {
    expect(parseDurationInput(`${MAX_MINUTES + 1}`)).toBeNull();
  });

  it("rejects malformed colon input", () => {
    expect(parseDurationInput("99:99")).toBeNull();
    expect(parseDurationInput(":30")).toBeNull();
  });

  it("rejects disallowed characters", () => {
    expect(parseDurationInput("45$")).toBeNull();
    expect(parseDurationInput("45m; DROP TABLE")).toBeNull();
  });
});
