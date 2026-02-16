import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "./Header";
import { Parent } from "../types";

const mockParents: Parent[] = [
  { id: "1", name: "Alice Smith", email: "alice@test.com" },
  { id: "2", name: "Bob Jones", email: "bob@test.com" },
];

const defaultProps = {
  parents: mockParents,
  selectedParent: "1",
  onParentChange: () => {},
  view: "classes" as const,
  onViewChange: () => {},
};

describe("Header", () => {
  it("renders the Atlas Academy branding", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("Atlas Academy")).toBeInTheDocument();
  });

  it("renders the Classes nav button", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("Classes")).toBeInTheDocument();
  });

  it("renders the Admin View nav button", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("Admin View")).toBeInTheDocument();
  });

  it("highlights Classes when view is classes", () => {
    render(<Header {...defaultProps} view="classes" />);
    const classesBtn = screen.getByText("Classes").closest("button");
    expect(classesBtn?.className).toContain("bg-violet-600");
  });

  it("highlights Admin View when view is admin", () => {
    render(<Header {...defaultProps} view="admin" />);
    const adminBtn = screen.getByText("Admin View").closest("button");
    expect(adminBtn?.className).toContain("bg-violet-600");
  });

  it("calls onViewChange when Admin View is clicked", async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    render(<Header {...defaultProps} onViewChange={onViewChange} />);
    await user.click(screen.getByText("Admin View"));
    expect(onViewChange).toHaveBeenCalledWith("admin");
  });

  it("calls onViewChange when Classes is clicked", async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    render(<Header {...defaultProps} view="admin" onViewChange={onViewChange} />);
    await user.click(screen.getByText("Classes"));
    expect(onViewChange).toHaveBeenCalledWith("classes");
  });

  it("renders parent selector with all parents", () => {
    render(<Header {...defaultProps} />);
    const select = screen.getByLabelText("Select parent");
    expect(select).toBeInTheDocument();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("shows the selected parent", () => {
    render(<Header {...defaultProps} selectedParent="2" />);
    const select = screen.getByLabelText("Select parent") as HTMLSelectElement;
    expect(select.value).toBe("2");
  });

  it("calls onParentChange when a different parent is selected", async () => {
    const user = userEvent.setup();
    const onParentChange = vi.fn();
    render(<Header {...defaultProps} onParentChange={onParentChange} />);
    const select = screen.getByLabelText("Select parent");
    await user.selectOptions(select, "2");
    expect(onParentChange).toHaveBeenCalledWith("2");
  });

  it("renders 'Booking as' label", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("Booking as")).toBeInTheDocument();
  });
});
