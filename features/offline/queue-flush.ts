import { createActionQueue, localStorageQueue } from "@/lib/action-queue";
import { saveFeedbackAction } from "@/features/session/actions/recommendation.actions";
import { savePreferencesAction } from "@/features/preferences/actions/preferences.actions";

export const OFFLINE_QUEUE_KEY = "gosession-offline-queue";

/**
 * Solo acciones idempotentes (upsert) son encolables. Las de timer
 * (pausa/fin) dependen del reloj del servidor y NO se encolan.
 */
export type OfflineQueueKind = "feedback" | "prefs";

export function isOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

export async function dispatchQueuedAction(action: {
  type: string;
  payload: unknown;
}): Promise<void> {
  if (action.type === "feedback") {
    const result = await saveFeedbackAction(action.payload);
    if (!result.success) throw new Error(result.error);
    return;
  }
  if (action.type === "prefs") {
    const result = await savePreferencesAction(action.payload);
    if (!result.success) throw new Error(result.error);
    return;
  }
  throw new Error(`Tipo no encolable: ${action.type}`);
}

export function enqueueOffline(type: OfflineQueueKind, payload: unknown, key: string) {
  createActionQueue({ storage: localStorageQueue(OFFLINE_QUEUE_KEY) }).enqueue(
    type,
    payload,
    key,
  );
}

export async function flushOfflineQueue() {
  const queue = createActionQueue({ storage: localStorageQueue(OFFLINE_QUEUE_KEY) });
  return queue.flush(dispatchQueuedAction);
}
