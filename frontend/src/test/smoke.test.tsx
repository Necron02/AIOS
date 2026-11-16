// Frontend Smoke Tests

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "../app/App";

// Mock API client
vi.mock("../lib/api/client", () => ({
  api: {
    get: vi.fn(),
    interceptors: {
      response: { use: vi.fn() },
    },
  },
  checkHealth: vi.fn().mockResolvedValue({
    status: "healthy",
    version: "0.1.0",
    database: "healthy",
    timestamp: new Date().toISOString(),
  }),
  getVersion: vi.fn().mockResolvedValue({
    version: "0.1.0",
    name: "NEXUS",
    description: "Test",
  }),
}));

function renderApp() {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}

describe("App Smoke Tests", () => {
  it("renders without crashing", () => {
    renderApp();
    expect(screen.getByText("NEXUS")).toBeInTheDocument();
  });

  it("shows dashboard by default", () => {
    renderApp();
    // Dashboard appears in nav and as page title - check for the page title
    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });

  it("has navigation links", () => {
    renderApp();
    // Check nav links specifically - they're in the header nav
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveTextContent("Projects");
    expect(nav).toHaveTextContent("Repositories");
    expect(nav).toHaveTextContent("Skills");
    expect(nav).toHaveTextContent("MCP");
    expect(nav).toHaveTextContent("Applications");
    expect(nav).toHaveTextContent("System");
    expect(nav).toHaveTextContent("Activity");
    expect(nav).toHaveTextContent("Settings");
  });
});

describe("Health Status Display", () => {
  it("shows API status in header", () => {
    renderApp();
    expect(screen.getByText("API")).toBeInTheDocument();
  });
});
