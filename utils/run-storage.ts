// Persistence for run state. The only place that touches local storage —
// callers work with RunState, not strings. Mutations dispatch a DOM event so
// React views can subscribe via useSyncExternalStore.

import {
  RunState,
  serializeRun,
  deserializeRun,
} from "./run-state";

export const RUN_STORAGE_KEY = "arcana:run";
export const RUN_CHANGED_EVENT = "arcana:run-changed";

function notifyChange(): void {
  window.dispatchEvent(new Event(RUN_CHANGED_EVENT));
}

export function saveRun(run: RunState): void {
  localStorage.setItem(RUN_STORAGE_KEY, serializeRun(run));
  notifyChange();
}

export function loadRun(): RunState | null {
  const raw = localStorage.getItem(RUN_STORAGE_KEY);
  if (raw === null) return null;
  return deserializeRun(raw);
}

export function clearRun(): void {
  localStorage.removeItem(RUN_STORAGE_KEY);
  notifyChange();
}

export function subscribeToRun(onChange: () => void): () => void {
  window.addEventListener(RUN_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(RUN_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
