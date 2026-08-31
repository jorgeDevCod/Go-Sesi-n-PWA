import { describe, expect, it } from "vitest";
import { sortActivitiesByEnergy } from "./sort-activities";
import type { Complexity } from "@/lib/constants/default-subcategories";

type Item = { id: string; complexity: Complexity };

const items: Item[] = [
  { id: "a", complexity: "HIGH" },
  { id: "b", complexity: "LOW" },
  { id: "c", complexity: "MEDIUM" },
];

describe("sortActivitiesByEnergy", () => {
  it("puts HIGH first with high energy", () => {
    const sorted = sortActivitiesByEnergy(items, "alta");
    expect(sorted.map((i) => i.id)).toEqual(["a", "c", "b"]);
  });

  it("puts MEDIUM first with medium energy (normal/cotidianas), then LOW", () => {
    const sorted = sortActivitiesByEnergy(items, "media");
    expect(sorted.map((i) => i.id)).toEqual(["c", "b", "a"]);
  });

  it("puts LOW first with low energy", () => {
    const sorted = sortActivitiesByEnergy(items, "baja");
    expect(sorted.map((i) => i.id)).toEqual(["b", "c", "a"]);
  });

  it("does not mutate the original array", () => {
    const copy = [...items];
    sortActivitiesByEnergy(items, "alta");
    expect(items).toEqual(copy);
  });
});
