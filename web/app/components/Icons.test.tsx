import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarIcon, ListIcon, PlusIcon, RefreshIcon } from "./Icons";

describe("Icon components", () => {
  it("renders CalendarIcon as an SVG", () => {
    const { container } = render(<CalendarIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders ListIcon as an SVG", () => {
    const { container } = render(<ListIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders PlusIcon as an SVG", () => {
    const { container } = render(<PlusIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders RefreshIcon as an SVG", () => {
    const { container } = render(<RefreshIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
