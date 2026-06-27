import { renderHook, act } from "@testing-library/react";
import { usePersistedRun } from "./use-persisted-run";
import { createRun } from "@/utils/progression";
import { saveRun, clearRun } from "@/utils/run-storage";

beforeEach(() => {
  localStorage.clear();
});

describe("usePersistedRun", () => {
  it("returns null when nothing is stored", () => {
    const { result } = renderHook(() => usePersistedRun());
    expect(result.current).toBeNull();
  });

  it("returns the stored run", () => {
    saveRun({ ...createRun(), hp: 42 });
    const { result } = renderHook(() => usePersistedRun());
    expect(result.current?.hp).toBe(42);
  });

  it("reacts to the run being cleared", () => {
    saveRun(createRun());
    const { result } = renderHook(() => usePersistedRun());
    expect(result.current).not.toBeNull();

    act(() => {
      clearRun();
      window.dispatchEvent(new Event("arcana:run-changed"));
    });
    expect(result.current).toBeNull();
  });
});
