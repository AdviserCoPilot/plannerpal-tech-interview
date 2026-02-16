import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

const mockParents = [
  { id: "p1", name: "Alice Smith", email: "alice@test.com" },
  { id: "p2", name: "Bob Jones", email: "bob@test.com" },
];

const mockClasses = [
  {
    id: "c1",
    name: "Chess Club",
    capacity: 3,
    registered_count: "1",
    description: null,
    start_time: "2025-03-21T14:00:00Z",
    end_time: "2025-03-21T15:00:00Z",
  },
];

const emptyRegs = { registrations: [] };
const aliceRegs = {
  registrations: [{ id: "r1", class_id: "c1", class_name: "Chess Club" }],
};

function mockFetchResponses(responses: Record<string, unknown>) {
  return vi.fn((url: string, opts?: RequestInit) => {
    const urlStr = url.toString();
    for (const [pattern, data] of Object.entries(responses)) {
      if (urlStr.includes(pattern)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(data),
        });
      }
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  }) as unknown as typeof fetch;
}

describe("Home page", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("loads and displays classes and parents on mount", async () => {
    global.fetch = mockFetchResponses({
      "/classes": mockClasses,
      "/parents": mockParents,
      "/registrations": emptyRegs,
    });

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByText("Chess Club")).toBeInTheDocument();
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });
  });

  it("shows My Bookings when parent has registrations", async () => {
    global.fetch = mockFetchResponses({
      "/classes": mockClasses,
      "/parents": mockParents,
      "/registrations": aliceRegs,
    });

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByText("My Bookings")).toBeInTheDocument();
      expect(screen.getByText("REGISTERED")).toBeInTheDocument();
    });
  });

  it("refreshes both classes and registrations after registering", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    let callCount = 0;

    global.fetch = vi.fn((url: string, opts?: RequestInit) => {
      const urlStr = url.toString();

      // POST registration
      if (opts?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ status: "registered", message: "ok" }),
        });
      }

      // After the POST, registrations should return the new data
      if (urlStr.includes("/registrations")) {
        callCount++;
        // First call: empty (initial load). Subsequent: has the registration.
        const data = callCount <= 2 ? emptyRegs : aliceRegs;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(data),
        });
      }

      if (urlStr.includes("/classes")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockClasses),
        });
      }

      if (urlStr.includes("/parents")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockParents),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as unknown as typeof fetch;

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByText("Register")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(screen.getByText("Registered!")).toBeInTheDocument();
      expect(screen.getByText("My Bookings")).toBeInTheDocument();
    });
  });

  it("refreshes both classes and registrations after cancelling", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    let deleteHappened = false;

    global.fetch = vi.fn((url: string, opts?: RequestInit) => {
      const urlStr = url.toString();

      if (opts?.method === "DELETE") {
        deleteHappened = true;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Registration cancelled" }),
        });
      }

      if (urlStr.includes("/registrations")) {
        const data = deleteHappened ? emptyRegs : aliceRegs;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(data),
        });
      }

      if (urlStr.includes("/classes")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockClasses),
        });
      }

      if (urlStr.includes("/parents")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockParents),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as unknown as typeof fetch;

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByText("My Bookings")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Cancel"));

    await waitFor(() => {
      const toast = screen.getByText("Registration cancelled");
      expect(toast).toBeInTheDocument();
      expect(toast.closest("[role='alert']")?.className).toContain("bg-red-500");
      expect(screen.queryByText("My Bookings")).not.toBeInTheDocument();
    });
  });

  it("polls for updates on an interval", async () => {
    global.fetch = mockFetchResponses({
      "/classes": mockClasses,
      "/parents": mockParents,
      "/registrations": emptyRegs,
    });

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByText("Chess Club")).toBeInTheDocument();
    });

    const callsBefore = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
      .length;

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      const callsAfter = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
        .length;
      expect(callsAfter).toBeGreaterThan(callsBefore);
    });
  });
});
