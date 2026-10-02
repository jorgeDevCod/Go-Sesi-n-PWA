import { describe, expect, it, vi } from "vitest";
import { backoffMs, createActionQueue, type QueuedAction, type QueueStorage } from "./action-queue";

function memoryStorage(seed: QueuedAction[] = []): QueueStorage & { items: QueuedAction[] } {
  const box = { items: [...seed] };
  return {
    items: box.items,
    load: () => [...box.items],
    save: (items) => {
      box.items = [...items];
    },
  };
}

describe("action-queue", () => {
  it("encola y lista pendientes", () => {
    const q = createActionQueue({ storage: memoryStorage(), now: () => 1000 });
    q.enqueue("pause", { id: "s1" }, "pause:s1");
    expect(q.pending()).toHaveLength(1);
    expect(q.pending()[0]).toMatchObject({ type: "pause", attempts: 0, nextRetryMs: 1000 });
  });

  it("misma key reemplaza (último gana, sin duplicar)", () => {
    const q = createActionQueue({ storage: memoryStorage(), now: () => 1000 });
    q.enqueue("note", { text: "a" }, "note:s1");
    q.enqueue("note", { text: "b" }, "note:s1");
    const items = q.pending();
    expect(items).toHaveLength(1);
    expect(items[0].payload).toEqual({ text: "b" });
  });

  it("flush procesa en FIFO y elimina éxitos", async () => {
    const q = createActionQueue({ storage: memoryStorage(), now: () => 1000 });
    q.enqueue("a", {}, "a");
    q.enqueue("b", {}, "b");
    const seen: string[] = [];
    const results = await q.flush(async (action) => {
      seen.push(action.key);
    });
    expect(seen).toEqual(["a", "b"]);
    expect(results).toEqual({ a: { status: "ok" }, b: { status: "ok" } });
    expect(q.pending()).toHaveLength(0);
  });

  it("no toca lo no vencido", async () => {
    let at = 1000;
    const q = createActionQueue({ storage: memoryStorage(), now: () => at });
    q.enqueue("a", {}, "a");
    const process = vi.fn();
    at = 500; // antes de nextRetryMs=1000
    const results = await q.flush(process);
    expect(process).not.toHaveBeenCalled();
    expect(results).toEqual({});
    expect(q.pending()).toHaveLength(1);
  });

  it("fallo reintenta con backoff y luego muere", async () => {
    let at = 1000;
    const q = createActionQueue({
      storage: memoryStorage(),
      now: () => at,
      maxAttempts: 2,
    });
    q.enqueue("a", {}, "a");
    const fail = vi.fn(async () => {
      throw new Error("red caída");
    });
    const first = await q.flush(fail);
    expect(first.a).toEqual({ status: "retry" });
    expect(q.pending()[0].attempts).toBe(1);
    expect(q.pending()[0].nextRetryMs).toBe(1000 + 30_000);
    at = 1000 + 30_000;
    const second = await q.flush(fail);
    expect(second.a).toEqual({ status: "dead" });
    expect(q.pending()).toHaveLength(0);
  });

  it("remove y clear", () => {
    const q = createActionQueue({ storage: memoryStorage(), now: () => 1000 });
    q.enqueue("a", {}, "a");
    q.enqueue("b", {}, "b");
    q.remove("a");
    expect(q.pending().map((i) => i.key)).toEqual(["b"]);
    q.clear();
    expect(q.pending()).toHaveLength(0);
  });

  it("backoff exponencial con tope", () => {
    expect(backoffMs(1)).toBe(30_000);
    expect(backoffMs(2)).toBe(60_000);
    expect(backoffMs(10)).toBe(15 * 60_000);
  });

  it("persiste entre instancias con el mismo storage", () => {
    const storage = memoryStorage();
    const q1 = createActionQueue({ storage, now: () => 1000 });
    q1.enqueue("a", { x: 1 }, "a");
    const q2 = createActionQueue({ storage, now: () => 1000 });
    expect(q2.pending()).toHaveLength(1);
  });
});
