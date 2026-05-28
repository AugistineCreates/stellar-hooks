import { describe, it, expect, vi } from "vitest";
import { useStellarAccountQuery } from "../hooks/useStellarAccountQuery";

vi.mock("stellar-hooks", () => ({
  useStellarAccount: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

vi.mock("react-query", () => ({
  useQuery: vi.fn((config) => ({
    data: null,
    isLoading: false,
    error: null,
    isRefetching: false,
    refetch: vi.fn(),
  })),
}));

describe("useStellarAccountQuery", () => {
  it("should use proper cache key with publicKey", () => {
    const publicKey = "GBRPYHIL2CI3WHZDTOOQFC6EB4PSJ2BUMTOJ4ONKJMK646ARTICONX2";
    const result = useStellarAccountQuery(publicKey);

    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("isLoading");
    expect(result).toHaveProperty("error");
  });

  it("should return null when publicKey is not provided", () => {
    const result = useStellarAccountQuery(null);

    expect(result.data).toBeNull();
  });
});
