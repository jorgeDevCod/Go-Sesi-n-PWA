/**
 * Pure helpers for drag-and-drop reordering. Kept free of any DOM/dnd-kit
 * dependency so the reordering math can be unit tested in isolation.
 */

export function reorderIds(
  ids: readonly string[],
  fromIndex: number,
  toIndex: number,
): string[] {
  if (
    fromIndex < 0 ||
    fromIndex >= ids.length ||
    toIndex < 0 ||
    toIndex >= ids.length
  ) {
    return [...ids];
  }

  const result = [...ids];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

export type OrderUpdate = { id: string; order: number };

export function toOrderedUpdates(ids: readonly string[]): OrderUpdate[] {
  return ids.map((id, index) => ({ id, order: index }));
}
