import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeScreen } from "./HomeScreen";

describe("HomeScreen", () => {
  it("fires onNewAdventure when the button is clicked", async () => {
    const onNewAdventure = jest.fn();
    render(<HomeScreen onNewAdventure={onNewAdventure} />);
    await userEvent.click(
      screen.getByRole("button", { name: /new adventure/i }),
    );
    expect(onNewAdventure).toHaveBeenCalledTimes(1);
  });
});
