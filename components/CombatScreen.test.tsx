import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CombatScreen } from "./CombatScreen";
import { Unit, createCombat } from "@/utils/combat";
import { toInstances } from "@/utils/cards";

const noShuffle = () => 0.999999;

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
        onRetire={() => {}}
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
        onRetire={() => {}}
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
        onRetire={() => {}}
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
        onRetire={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /end turn/i }));
    expect(onLoss).toHaveBeenCalledTimes(1);
  });

  it("shows current mana", () => {
    render(
      <CombatScreen
        initialState={createCombat(
          arcanist(),
          [enemy()],
          toInstances(["windshear", "windshear"]),
          noShuffle,
        )}
        deck={[]}
        onWin={() => {}}
        onLoss={() => {}}
        onRetire={() => {}}
      />,
    );
    expect(screen.getByLabelText(/mana/i)).toHaveTextContent("3");
  });

  it("renders the drawn hand with card details", () => {
    render(
      <CombatScreen
        initialState={createCombat(
          arcanist(),
          [enemy()],
          toInstances(["windshear", "windshear"]),
          noShuffle,
        )}
        deck={[]}
        onWin={() => {}}
        onLoss={() => {}}
        onRetire={() => {}}
      />,
    );
    const hand = screen.getByLabelText("Hand");
    expect(hand).toHaveTextContent("Windshear");
    expect(hand).toHaveTextContent("Deal 3 damage.");
  });

  it("plays a damage card dragged onto an enemy, spending mana", () => {
    render(
      <CombatScreen
        initialState={createCombat(
          arcanist(),
          [enemy({ hp: 10, blk: 0 })],
          toInstances(["windshear", "windshear"]),
          noShuffle,
        )}
        deck={[]}
        onWin={() => {}}
        onLoss={() => {}}
        onRetire={() => {}}
      />,
    );
    const cardEl = screen.getByLabelText(/play windshear/i);
    fireEvent.pointerDown(cardEl);
    fireEvent.pointerUp(screen.getByLabelText("Knight target"));

    expect(screen.getByLabelText("Knight stats")).toHaveTextContent(/hp\s*7/i);
    expect(screen.getByLabelText(/mana/i)).toHaveTextContent("2");
  });

  it("does not play a card the player cannot afford", () => {
    render(
      <CombatScreen
        // 0 mana: 0 start + 0 gain via a stubbed initial state below
        initialState={{
          ...createCombat(
            arcanist(),
            [enemy({ hp: 10, blk: 0 })],
            toInstances(["windshear"]),
            noShuffle,
          ),
          mana: 0,
        }}
        deck={[]}
        onWin={() => {}}
        onLoss={() => {}}
        onRetire={() => {}}
      />,
    );
    const cardEl = screen.getByLabelText(/play windshear/i);
    fireEvent.pointerDown(cardEl);
    fireEvent.pointerUp(screen.getByLabelText("Knight target"));

    // Unchanged: enemy unhurt and card still in hand.
    expect(screen.getByLabelText("Knight stats")).toHaveTextContent(/hp\s*10/i);
    expect(screen.getByLabelText("Hand")).toHaveTextContent("Windshear");
  });

  it("retires the run from the menu", async () => {
    const onRetire = jest.fn();
    render(
      <CombatScreen
        initialState={createCombat(arcanist(), [enemy()])}
        deck={[]}
        onWin={() => {}}
        onLoss={() => {}}
        onRetire={onRetire}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /menu/i }));
    await userEvent.click(screen.getByRole("menuitem", { name: /retire/i }));
    expect(onRetire).toHaveBeenCalledTimes(1);
  });

  it("opens the deck overlay from the View deck button", async () => {
    render(
      <CombatScreen
        initialState={createCombat(arcanist(), [enemy()])}
        deck={[]}
        onWin={() => {}}
        onLoss={() => {}}
        onRetire={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /view deck/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
