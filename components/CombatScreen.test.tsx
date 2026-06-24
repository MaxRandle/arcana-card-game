import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CombatScreen } from "./CombatScreen";
import { Unit, createCombat } from "@/utils/combat";

function arcanist(overrides: Partial<Unit> = {}): Unit {
  return {
    id: "arcanist",
    name: "Arcanist",
    side: "player",
    hp: 100,
    maxHp: 100,
    atk: 1,
    blk: 0,
    ...overrides,
  };
}

function enemy(overrides: Partial<Unit> = {}): Unit {
  return {
    id: "knight",
    name: "Knight",
    side: "enemy",
    hp: 60,
    maxHp: 60,
    atk: 1,
    blk: 2,
    ...overrides,
  };
}

describe("CombatScreen", () => {
  it("shows live hp/atk/blk for the arcanist and the enemy", () => {
    render(
      <CombatScreen
        initialState={createCombat(arcanist(), [enemy()])}
        deck={[]}
        onWin={() => {}}
        onLoss={() => {}}
      />,
    );
    expect(screen.getByLabelText("Arcanist stats")).toHaveTextContent(
      /hp\s*100/i,
    );
    expect(screen.getByLabelText("Knight stats")).toHaveTextContent(/blk\s*2/i);
  });

  it("applies attacks when End turn is pressed", async () => {
    render(
      <CombatScreen
        initialState={createCombat(arcanist({ atk: 5 }), [enemy({ blk: 0 })])}
        deck={[]}
        onWin={() => {}}
        onLoss={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /end turn/i }));
    expect(screen.getByLabelText("Knight stats")).toHaveTextContent(/hp\s*55/i);
  });

  it("calls onWin when the last enemy dies", async () => {
    const onWin = jest.fn();
    render(
      <CombatScreen
        initialState={createCombat(arcanist({ atk: 100 }), [enemy({ hp: 5 })])}
        deck={[]}
        onWin={onWin}
        onLoss={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /end turn/i }));
    expect(onWin).toHaveBeenCalledTimes(1);
  });

  it("calls onLoss when the arcanist dies", async () => {
    const onLoss = jest.fn();
    render(
      <CombatScreen
        initialState={createCombat(arcanist({ hp: 3 }), [enemy({ atk: 50 })])}
        deck={[]}
        onWin={() => {}}
        onLoss={onLoss}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /end turn/i }));
    expect(onLoss).toHaveBeenCalledTimes(1);
  });

  it("opens the deck overlay from the View deck button", async () => {
    render(
      <CombatScreen
        initialState={createCombat(arcanist(), [enemy()])}
        deck={[]}
        onWin={() => {}}
        onLoss={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /view deck/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
