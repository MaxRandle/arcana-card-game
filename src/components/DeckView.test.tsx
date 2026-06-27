import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeckView } from "./DeckView";

describe("DeckView", () => {
  it("renders a dialog", () => {
    render(<DeckView cards={[]} onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows an empty-deck message when there are no cards", () => {
    render(<DeckView cards={[]} onClose={() => {}} />);
    expect(screen.getByText(/no cards/i)).toBeInTheDocument();
  });

  it("renders one item per owned card", () => {
    render(<DeckView cards={["a", "b", "c"]} onClose={() => {}} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("closes when the close button is clicked", async () => {
    const onClose = jest.fn();
    render(<DeckView cards={[]} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
