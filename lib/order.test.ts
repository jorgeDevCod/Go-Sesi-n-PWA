import { describe, expect, it } from "vitest";
import { reorderIds, toOrderedUpdates } from "@/lib/order";

describe("reorderIds", () => {
  it("moves an item from a lower to a higher index", () => {
    expect(reorderIds(["a", "b", "c", "d"], 0, 2)).toEqual([
      "b",
      "c",
      "a",
      "d",
    ]);
  });

  it("moves an item from a higher to a lower index", () => {
    expect(reorderIds(["a", "b", "c", "d"], 3, 1)).toEqual([
      "a",
      "d",
      "b",
      "c",
    ]);
  });

  it("is a no-op when moving to the same index", () => {
    expect(reorderIds(["a", "b", "c"], 1, 1)).toEqual(["a", "b", "c"]);
  });

  it("returns a copy unchanged for out-of-range indices", () => {
    const original = ["a", "b", "c"];
    expect(reorderIds(original, -1, 1)).toEqual(original);
    expect(reorderIds(original, 0, 5)).toEqual(original);
  });

  it("does not mutate the input array", () => {
    const original = ["a", "b", "c"];
    reorderIds(original, 0, 2);
    expect(original).toEqual(["a", "b", "c"]);
  });
});

describe("toOrderedUpdates", () => {
  it("maps array position to a 0-based order integer", () => {
    expect(toOrderedUpdates(["x", "y", "z"])).toEqual([
      { id: "x", order: 0 },
      { id: "y", order: 1 },
      { id: "z", order: 2 },
    ]);
  });

  it("returns an empty array for an empty input", () => {
    expect(toOrderedUpdates([])).toEqual([]);
  });
});
