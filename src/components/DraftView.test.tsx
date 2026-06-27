import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DraftView } from "./DraftView";
import { Arcana } from "@/utils/cards";

describe("DraftView — arcana draft", () => {
  it("offers a button per arcana and reports the pick", async () => {
    const onPickArcana = jest.fn();
    render(
      <DraftView
        activity={{ kind: "arcana-draft", offer: ["fire", "water"] as Arcana[] }}
        onPickArcana={onPickArcana}
        onPickCard={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Fire" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Water" }));
    expect(onPickArcana).toHaveBeenCalledWith("water");
  });
});

describe("DraftView — card draft", () => {
  const activity = {
    kind: "card-draft" as const,
    offer: ["windshear", "cinders"],
    pool: ["fire" as const],
    remaining: 3,
    next: "encounter" as const,
  };

  it("shows the remaining count", () => {
    render(
      <DraftView activity={{ ...activity }} onPickArcana={() => {}} onPickCard={() => {}} />,
    );
    expect(screen.getByText(/3 left/)).toBeInTheDocument();
  });

  it("offers each card and reports the pick by id", async () => {
    const onPickCard = jest.fn();
    render(
      <DraftView activity={{ ...activity }} onPickArcana={() => {}} onPickCard={onPickCard} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Pick Cinders/ }));
    expect(onPickCard).toHaveBeenCalledWith("cinders");
  });
});
