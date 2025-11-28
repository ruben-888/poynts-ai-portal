import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import JsonViewer from "./json-viewer";

// Mock the dynamic import
vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: (callback: () => Promise<any>) => {
    const Component = () => (
      <div data-testid="mock-json-viewer">JSON Viewer Mock</div>
    );
    Component.displayName = "MockedJsonViewer";
    return Component;
  },
}));

describe("JsonViewer", () => {
  it("renders without crashing", () => {
    const testData = { test: "data", nested: { value: 123 } };
    render(<JsonViewer jsonObject={testData} />);

    // Since we've mocked the dynamic component, we check for our mock
    expect(screen.getByTestId("mock-json-viewer")).toBeInTheDocument();
  });
});
