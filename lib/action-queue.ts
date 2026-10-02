/**
 * Cola offline de acciones idempotente (6B, fundación).
 *
 * Pura y sin dependencias de plataforma: el almacenamiento, el reloj y la
 * red se inyectan. Sin cablear a actions todavía (6C): ningún comportamiento
 * cambia, solo se suma la pieza testeada.
 *
 * Reglas:
 * - Cada acción lleva `key` de idempotencia: encolar dos veces la misma key
 *   pendiente reemplaza el payload (último gana), nunca duplica.
 * - `flush` procesa en orden FIFO lo vencido (`nextRetryMs <= now`).
 * - Éxito → se elimina. Fallo → reintento con backoff exponencial
 *   (base 30s, ×2, tope 15 min); tras `maxAttempts` va a dead-letter.
 */

export type QueuedAction = {
  key: string;
  type: string;
  payload: unknown;
  attempts: number;
  nextRetryMs: number;
  createdAtMs: number;
};

export type QueueStorage = {
  load: () => QueuedAction[];
  save: (items: QueuedAction[]) => void;
};

export type FlushResult =
  | { status: "ok" }
  | { status: "retry" }
  | { status: "dead" };

const BASE_RETRY_MS = 30_000;
const MAX_RETRY_MS = 15 * 60_000;

export function backoffMs(attempts: number): number {
  return Math.min(MAX_RETRY_MS, BASE_RETRY_MS * 2 ** Math.max(0, attempts - 1));
}

export function createActionQueue(options: {
  storage: QueueStorage;
  now?: () => number;
  maxAttempts?: number;
}) {
  const { storage, now = () => Date.now(), maxAttempts = 5 } = options;

  function pending(): QueuedAction[] {
    return storage.load();
  }

  function enqueue(type: string, payload: unknown, key: string): QueuedAction[] {
    const at = now();
    const items = storage.load().filter((item) => item.key !== key);
    const action: QueuedAction = {
      key,
      type,
      payload,
      attempts: 0,
      nextRetryMs: at,
      createdAtMs: at,
    };
    const next = [...items, action];
    storage.save(next);
    return next;
  }

  function remove(key: string): QueuedAction[] {
    const next = storage.load().filter((item) => item.key !== key);
    storage.save(next);
    return next;
  }

  function clear(): void {
    storage.save([]);
  }

  /**
   * Procesa lo vencido en FIFO. `process` lanza si hay que reintentar.
   * Devuelve por key qué pasó con cada acción intentada.
   */
  async function flush(
    process: (action: QueuedAction) => Promise<void>,
  ): Promise<Record<string, FlushResult>> {
    const at = now();
    const results: Record<string, FlushResult> = {};
    let items = storage.load();

    for (const action of items.filter((item) => item.nextRetryMs <= at)) {
      try {
        await process(action);
        items = items.filter((item) => item.key !== action.key);
        results[action.key] = { status: "ok" };
      } catch {
        const attempts = action.attempts + 1;
        if (attempts >= maxAttempts) {
          items = items.filter((item) => item.key !== action.key);
          results[action.key] = { status: "dead" };
        } else {
          items = items.map((item) =>
            item.key === action.key
              ? { ...item, attempts, nextRetryMs: at + backoffMs(attempts) }
              : item,
          );
          results[action.key] = { status: "retry" };
        }
      }
      storage.save(items);
    }

    return results;
  }

  return { pending, enqueue, remove, clear, flush };
}

/** Adaptador localStorage (para 6C; aquí solo existe, no se usa). */
export function localStorageQueue(key: string): QueueStorage {
  function read(): QueuedAction[] {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as QueuedAction[]) : [];
    } catch {
      return [];
    }
  }
  return {
    load: read,
    save: (items) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(items));
      } catch {
        // Sin espacio o sin storage: la cola en memoria se pierde al recargar,
        // pero nada se rompe.
      }
    },
  };
}
