import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WorkshopList from "../WorkshopList";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

describe("WorkshopList", () => {
  it("doit afficher le titre de la liste d'ateliers", () => {
    render(<WorkshopList />);
    expect(screen.getByText("Liste des ateliers")).toBeInTheDocument();
  });
});
