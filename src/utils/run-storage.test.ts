import { createRun } from "./run-state";
import { loadRun, saveRun, clearRun, RUN_STORAGE_KEY } from "./run-storage";

beforeEach(() => {
  localStorage.clear();
});

describe("saveRun / loadRun", () => {
  it("returns null when no run is stored", () => {
    expect(loadRun()).toBeNull();
  });

  it("persists and restores a run", () => {
    const run = { ...createRun(), encounter: 3, hp: 42 };
    saveRun(run);
    expect(loadRun()).toEqual(run);
  });

  it("writes under the storage key", () => {
    saveRun(createRun());
    expect(localStorage.getItem(RUN_STORAGE_KEY)).not.toBeNull();
  });

  it("returns null when stored data is corrupt", () => {
    localStorage.setItem(RUN_STORAGE_KEY, "garbage");
    expect(loadRun()).toBeNull();
  });
});

describe("clearRun", () => {
  it("wipes the stored run", () => {
    saveRun(createRun());
    clearRun();
    expect(loadRun()).toBeNull();
  });
});
