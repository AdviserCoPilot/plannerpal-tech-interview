import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClassTable from "./ClassTable";
import { Class, MyRegistrations } from "../types";

const mockClasses: Class[] = [
  {
    id: "c1",
    name: "Piano for Beginners",
    description: "Learn the basics of piano",
    capacity: 2,
    registered_count: "2",
    start_time: "2025-03-20T15:00:00Z",
    end_time: "2025-03-20T16:00:00Z",
  },
  {
    id: "c2",
    name: "Chess Club",
    description: null,
    capacity: 3,
    registered_count: "1",
    start_time: "2025-03-21T14:00:00Z",
    end_time: "2025-03-21T15:00:00Z",
  },
  {
    id: "c3",
    name: "Art & Crafts",
    description: "Explore your creativity",
    capacity: 4,
    registered_count: "4",
    start_time: "2025-03-22T13:00:00Z",
    end_time: "2025-03-22T14:00:00Z",
  },
];

const emptyRegs: MyRegistrations = { registrations: [] };

describe("ClassTable", () => {
  it("renders the All Classes heading", () => {
    render(
      <ClassTable
        classes={mockClasses}
        myRegs={emptyRegs}
        busy={null}
        onRegister={() => {}}
      />
    );
    expect(screen.getByText("All Classes")).toBeInTheDocument();
  });

  it("shows the class count badge", () => {
    render(
      <ClassTable
        classes={mockClasses}
        myRegs={emptyRegs}
        busy={null}
        onRegister={() => {}}
      />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders table headers", () => {
    render(
      <ClassTable
        classes={mockClasses}
        myRegs={emptyRegs}
        busy={null}
        onRegister={() => {}}
      />
    );
    expect(screen.getByText("Class")).toBeInTheDocument();
    expect(screen.getByText("Schedule")).toBeInTheDocument();
    expect(screen.getByText("Spots")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("renders all class names", () => {
    render(
      <ClassTable
        classes={mockClasses}
        myRegs={emptyRegs}
        busy={null}
        onRegister={() => {}}
      />
    );
    expect(screen.getByText("Piano for Beginners")).toBeInTheDocument();
    expect(screen.getByText("Chess Club")).toBeInTheDocument();
    expect(screen.getByText("Art & Crafts")).toBeInTheDocument();
  });

  it("renders class descriptions when present", () => {
    render(
      <ClassTable
        classes={mockClasses}
        myRegs={emptyRegs}
        busy={null}
        onRegister={() => {}}
      />
    );
    expect(screen.getByText("Learn the basics of piano")).toBeInTheDocument();
    expect(screen.getByText("Explore your creativity")).toBeInTheDocument();
  });

  it("shows FULL badge when class is at capacity", () => {
    render(
      <ClassTable
        classes={mockClasses}
        myRegs={emptyRegs}
        busy={null}
        onRegister={() => {}}
      />
    );
    const fullBadges = screen.getAllByText("FULL");
    expect(fullBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("shows spots LEFT for classes with available spots", () => {
    render(
      <ClassTable
        classes={mockClasses}
        myRegs={emptyRegs}
        busy={null}
        onRegister={() => {}}
      />
    );
    expect(screen.getByText("2 LEFT")).toBeInTheDocument();
  });

  it("shows Register button for open classes", () => {
    render(
      <ClassTable
        classes={mockClasses}
        myRegs={emptyRegs}
        busy={null}
        onRegister={() => {}}
      />
    );
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("shows Unavailable for full classes", () => {
    render(
      <ClassTable
        classes={mockClasses}
        myRegs={emptyRegs}
        busy={null}
        onRegister={() => {}}
      />
    );
    expect(screen.getAllByText("Unavailable").length).toBeGreaterThanOrEqual(1);
  });

  it("calls onRegister with the class id when Register is clicked", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn();

    render(
      <ClassTable
        classes={mockClasses}
        myRegs={emptyRegs}
        busy={null}
        onRegister={onRegister}
      />
    );

    await user.click(screen.getByText("Register"));
    expect(onRegister).toHaveBeenCalledWith("c2");
  });

  it("shows '✓ Registered' when the parent is registered for a class", () => {
    const regsWithRegistration: MyRegistrations = {
      registrations: [
        { id: "r1", class_id: "c2", class_name: "Chess Club" },
      ],
    };

    render(
      <ClassTable
        classes={mockClasses}
        myRegs={regsWithRegistration}
        busy={null}
        onRegister={() => {}}
      />
    );
    expect(screen.getByText("✓ Registered")).toBeInTheDocument();
  });

  it("disables action buttons when busy", () => {
    render(
      <ClassTable
        classes={mockClasses}
        myRegs={emptyRegs}
        busy="c2"
        onRegister={() => {}}
      />
    );
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("shows loading indicator for the busy class", () => {
    render(
      <ClassTable
        classes={mockClasses}
        myRegs={emptyRegs}
        busy="c2"
        onRegister={() => {}}
      />
    );
    expect(screen.getByText("…")).toBeInTheDocument();
  });
});
