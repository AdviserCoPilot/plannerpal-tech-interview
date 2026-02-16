import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import AdminView from "./AdminView";
import { Class } from "../types";

const mockClasses: Class[] = [
  {
    id: "c1",
    name: "Piano for Beginners",
    description: "Learn basic piano",
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
    registered_count: "0",
    start_time: "2025-03-21T14:00:00Z",
    end_time: "2025-03-21T15:00:00Z",
  },
];

const mockAllRegs = [
  {
    id: "r1",
    class_id: "c1",
    class_name: "Piano for Beginners",
    parent_name: "Alice Smith",
    parent_email: "alice@example.com",
    created_at: "2025-03-01T00:00:00Z",
  },
  {
    id: "r2",
    class_id: "c1",
    class_name: "Piano for Beginners",
    parent_name: "Bob Jones",
    parent_email: "bob@example.com",
    created_at: "2025-03-01T00:00:00Z",
  },
];

describe("AdminView", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAllRegs),
      })
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders a card for each class", async () => {
    await act(async () => {
      render(<AdminView classes={mockClasses} />);
    });

    await waitFor(() => {
      expect(screen.getByText("Piano for Beginners")).toBeInTheDocument();
      expect(screen.getByText("Chess Club")).toBeInTheDocument();
    });
  });

  it("shows registered parents under the correct class", async () => {
    await act(async () => {
      render(<AdminView classes={mockClasses} />);
    });

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(screen.getByText("alice@example.com")).toBeInTheDocument();
      expect(screen.getByText("Bob Jones")).toBeInTheDocument();
      expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    });
  });

  it("shows spot counts", async () => {
    await act(async () => {
      render(<AdminView classes={mockClasses} />);
    });

    await waitFor(() => {
      expect(screen.getByText("2 / 2 spots filled")).toBeInTheDocument();
      expect(screen.getByText("0 / 3 spots filled")).toBeInTheDocument();
    });
  });

  it("shows 'No registrations yet' for empty classes", async () => {
    await act(async () => {
      render(<AdminView classes={mockClasses} />);
    });

    await waitFor(() => {
      expect(screen.getByText("No registrations yet")).toBeInTheDocument();
    });
  });

  it("fetches from /registrations/all", async () => {
    await act(async () => {
      render(<AdminView classes={mockClasses} />);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/registrations/all")
    );
  });
});
