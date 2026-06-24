import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdventureScreen } from "./AdventureScreen";
import { createRun } from "@/utils/run-state";

describe("AdventureScreen", () => {
  it("shows the 'Next encounter' CTA between encounters", () => {
    render(<AdventureScreen run={createRun()} onRetire={() => {}} />);
    expect(
      screen.getByRole("button", { name: "Next encounter" }),
    ).toBeInTheDocument();
  });

  it("shows the 'Next level' CTA between levels", () => {
    const run = { ...createRun(), phase: "between-levels" as const };
    render(<AdventureScreen run={run} onRetire={() => {}} />);
    expect(
      screen.getByRole("button", { name: "Next level" }),
    ).toBeInTheDocument();
  });

  it("opens and closes the deck overlay", async () => {
    render(<AdventureScreen run={createRun()} onRetire={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /view deck/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /close deck/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reveals the Retire item from the menu and fires onRetire", async () => {
    const onRetire = jest.fn();
    render(<AdventureScreen run={createRun()} onRetire={onRetire} />);

    expect(
      screen.queryByRole("menuitem", { name: /retire/i }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /menu/i }));
    await userEvent.click(screen.getByRole("menuitem", { name: /retire/i }));
    expect(onRetire).toHaveBeenCalledTimes(1);
  });
});
