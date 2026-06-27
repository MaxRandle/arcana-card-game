import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpeningDraftView } from "./OpeningDraftView";

const DECK = [
  "windshear",
  "rock",
  "cinders",
  "zap",
  "splash",
  "tremors",
  "endurance",
];

describe("OpeningDraftView", () => {
  it("offers 5 cards from the deck", () => {
    render(<OpeningDraftView deck={DECK} onConfirm={() => {}} rng={() => 0} />);
    const list = screen.getByRole("list", { name: "Opening draft" });
    expect(list.querySelectorAll("li")).toHaveLength(5);
  });

  it("disables Begin combat until 3 are kept", async () => {
    render(<OpeningDraftView deck={DECK} onConfirm={() => {}} rng={() => 0} />);
    const begin = screen.getByRole("button", { name: /begin combat/i });
    expect(begin).toBeDisabled();

    const keepButtons = screen.getAllByRole("button", { name: /^Keep / });
    await userEvent.click(keepButtons[0]);
    await userEvent.click(keepButtons[1]);
    expect(begin).toBeDisabled();
    await userEvent.click(keepButtons[2]);
    expect(begin).toBeEnabled();
  });

  it("won't let a fourth card be selected", async () => {
    render(<OpeningDraftView deck={DECK} onConfirm={() => {}} rng={() => 0} />);
    const keepButtons = screen.getAllByRole("button", { name: /^Keep / });
    for (const b of keepButtons) await userEvent.click(b);
    const pressed = keepButtons.filter(
      (b) => b.getAttribute("aria-pressed") === "true",
    );
    expect(pressed).toHaveLength(3);
  });

  it("confirms a DeckState with the 3 kept cards in hand", async () => {
    const onConfirm = jest.fn();
    render(<OpeningDraftView deck={DECK} onConfirm={onConfirm} rng={() => 0} />);
    const keepButtons = screen.getAllByRole("button", { name: /^Keep / });
    await userEvent.click(keepButtons[0]);
    await userEvent.click(keepButtons[1]);
    await userEvent.click(keepButtons[2]);
    await userEvent.click(screen.getByRole("button", { name: /begin combat/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    const deckState = onConfirm.mock.calls[0][0];
    expect(deckState.hand).toHaveLength(3);
    expect(deckState.drawPile).toHaveLength(DECK.length - 3);
  });
});
