import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClassManagementHeader from "./ClassManagementHeader";

describe("ClassManagementHeader", () => {
  it("renders the Class Management heading", () => {
    render(<ClassManagementHeader onRefresh={() => {}} />);
    expect(screen.getByText("Class Management")).toBeInTheDocument();
  });

  it("renders the Refresh button", () => {
    render(<ClassManagementHeader onRefresh={() => {}} />);
    expect(
      screen.getByRole("button", { name: /refresh/i })
    ).toBeInTheDocument();
  });

  it("calls onRefresh when Refresh button is clicked", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();

    render(<ClassManagementHeader onRefresh={onRefresh} />);

    await user.click(screen.getByRole("button", { name: /refresh/i }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
