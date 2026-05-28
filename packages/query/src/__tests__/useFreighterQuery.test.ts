import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFreighterQuery } from "../hooks/useFreighterQuery";

vi.mock("stellar-hooks", () => ({
  useFreighter: vi.fn(() => ({
    connect: vi.fn(async () => {}),
    isConnected: false,
    publicKey: null,
    isLoading: false,
    error: null,
  })),
}));

describe("useFreighterQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should wrap useFreighter connect in useMutation", () => {
    const { result } = renderHook(() => useFreighterQuery());

    expect(result.current).toHaveProperty("mutate");
    expect(result.current).toHaveProperty("freighterState");
  });

  it("should have mutation methods", () => {
    const { result } = renderHook(() => useFreighterQuery());

    expect(result.current).toHaveProperty("isPending");
    expect(result.current).toHaveProperty("isError");
    expect(result.current).toHaveProperty("data");
  });
});
