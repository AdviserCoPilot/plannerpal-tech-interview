import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyBookings from "./MyBookings";
import { MyRegistrations } from "../types";

const mockRegs: MyRegistrations = {
  registrations: [
    { id: "r1", class_id: "c1", class_name: "Piano for Beginners" },
    { id: "r2", class_id: "c2", class_name: "Chess Club" },
  ],
};

describe("MyBookings", () => {
  it("renders the My Bookings heading", () => {
    render(<MyBookings myRegs={mockRegs} busy={null} onCancel={() => {}} />);
    expect(screen.getByText("My Bookings")).toBeInTheDocument();
  });

  it("shows the total booking count badge", () => {
    render(<MyBookings myRegs={mockRegs} busy={null} onCancel={() => {}} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders all registered classes", () => {
    render(<MyBookings myRegs={mockRegs} busy={null} onCancel={() => {}} />);
    expect(screen.getByText("Piano for Beginners")).toBeInTheDocument();
    expect(screen.getByText("Chess Club")).toBeInTheDocument();
  });

  it("shows REGISTERED badge for registrations", () => {
    render(<MyBookings myRegs={mockRegs} busy={null} onCancel={() => {}} />);
    const badges = screen.getAllByText("REGISTERED");
    expect(badges).toHaveLength(2);
  });

  it("renders Cancel buttons for registrations", () => {
    render(<MyBookings myRegs={mockRegs} busy={null} onCancel={() => {}} />);
    const cancelButtons = screen.getAllByText("Cancel");
    expect(cancelButtons).toHaveLength(2);
  });

  it("calls onCancel with correct registration id", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<MyBookings myRegs={mockRegs} busy={null} onCancel={onCancel} />);

    const cancelButtons = screen.getAllByText("Cancel");
    await user.click(cancelButtons[0]);
    expect(onCancel).toHaveBeenCalledWith("r1");
  });

  it("disables Cancel buttons when busy", () => {
    render(
      <MyBookings myRegs={mockRegs} busy="some-id" onCancel={() => {}} />
    );
    const cancelButtons = screen.getAllByRole("button", { name: /cancel/i });
    cancelButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("returns null when there are no bookings", () => {
    const emptyRegs: MyRegistrations = { registrations: [] };
    const { container } = render(
      <MyBookings myRegs={emptyRegs} busy={null} onCancel={() => {}} />
    );
    expect(container.innerHTML).toBe("");
  });
});
