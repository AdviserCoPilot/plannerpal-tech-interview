import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Toast from "./Toast";

describe("Toast", () => {
  it("renders success message text", () => {
    render(<Toast message={{ type: "ok", text: "Registered!" }} />);
    expect(screen.getByText("Registered!")).toBeInTheDocument();
  });

  it("renders error message text", () => {
    render(<Toast message={{ type: "err", text: "Something went wrong" }} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("has role='alert' for accessibility", () => {
    render(<Toast message={{ type: "ok", text: "Done" }} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("applies success styling for 'ok' type", () => {
    render(<Toast message={{ type: "ok", text: "Done" }} />);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("bg-emerald-500");
  });

  it("applies error styling for 'err' type", () => {
    render(<Toast message={{ type: "err", text: "Error" }} />);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("bg-red-500");
  });
});
