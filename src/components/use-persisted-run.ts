"use client";

import { useSyncExternalStore } from "react";
import { RunState } from "@/utils/run-state";
import {
  RUN_STORAGE_KEY,
  loadRun,
  subscribeToRun,
} from "@/utils/run-storage";

// getSnapshot must return a stable reference while the stored data is
// unchanged, or useSyncExternalStore loops forever. Cache the parsed run
// against the raw string it came from.
let cachedRaw: string | null = null;
let cachedRun: RunState | null = null;

function getSnapshot(): RunState | null {
  const raw = localStorage.getItem(RUN_STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedRun = loadRun();
  }
  return cachedRun;
}

// The server can't read local storage. `undefined` means "not known yet" — as
// distinct from `null`, which means "known to have no run" — so callers don't
// mistake the pre-hydration state for an absent run.
function getServerSnapshot(): RunState | null | undefined {
  return undefined;
}

export function usePersistedRun(): RunState | null | undefined {
  return useSyncExternalStore(subscribeToRun, getSnapshot, getServerSnapshot);
}
