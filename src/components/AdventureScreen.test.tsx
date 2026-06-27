import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdventureScreen } from "./AdventureScreen";
import { createRun } from "@/utils/progression";
import { RunState } from "@/utils/run-state";

const rng = () => 0;

function renderScreen(run: RunState, overrides = {}) {
  const props = {
    run,
    onRetire: () => {},
    onStartCombat: () => {},
    onPickArcana: () => {},
    onPickCard: () => {},
    onFinish: () => {},
    ...overrides,
  };
  return render(<AdventureScreen {...props} />);
}

const ENCOUNTER: RunState = {
  ...createRun(rng),
  activity: { kind: "encounter" },
};

describe("AdventureScreen — encounter", () => {
  it("shows the 'Next encounter' CTA and starts combat", async () => {
    const onStartCombat = jest.fn();
    renderScreen(ENCOUNTER, { onStartCombat });
    const cta = screen.getByRole("button", { name: "Next encounter" });
    await userEvent.click(cta);
    expect(onStartCombat).toHaveBeenCalledTimes(1);
  });

  it("shows 'Next level' on a fresh level's first encounter", () => {
    renderScreen({ ...ENCOUNTER, level: 2, encounter: 1 });
    expect(
      screen.getByRole("button", { name: "Next level" }),
    ).toBeInTheDocument();
  });
});

describe("AdventureScreen — drafts", () => {
  it("renders the arcana draft and reports a pick", async () => {
    const onPickArcana = jest.fn();
    renderScreen(createRun(rng), { onPickArcana });
    expect(screen.getByLabelText("Arcana draft")).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    const arcanaButton = buttons.find((b) =>
      /Air|Water|Earth|Fire|Lightning/.test(b.textContent ?? ""),
    )!;
    await userEvent.click(arcanaButton);
    expect(onPickArcana).toHaveBeenCalledTimes(1);
  });
});

describe("AdventureScreen — run end", () => {
  it("offers Return home when won", async () => {
    const onFinish = jest.fn();
    renderScreen({ ...ENCOUNTER, activity: { kind: "won" } }, { onFinish });
    expect(screen.getByText(/run complete/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /return home/i }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("shows a defeat message when lost", () => {
    renderScreen({ ...ENCOUNTER, activity: { kind: "lost" } });
    expect(screen.getByText(/fallen/i)).toBeInTheDocument();
  });
});

describe("AdventureScreen — chrome", () => {
  it("opens and closes the deck overlay", async () => {
    renderScreen(ENCOUNTER);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /view deck/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /close deck/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reveals the Retire item from the menu and fires onRetire", async () => {
    const onRetire = jest.fn();
    renderScreen(ENCOUNTER, { onRetire });
    await userEvent.click(screen.getByRole("button", { name: /menu/i }));
    await userEvent.click(screen.getByRole("menuitem", { name: /retire/i }));
    expect(onRetire).toHaveBeenCalledTimes(1);
  });
});
