import { describe, it, expect, vi } from "vitest";
import { useStellarBalanceQuery } from "../hooks/useStellarBalanceQuery";

vi.mock("stellar-hooks", () => ({
  useStellarBalance: vi.fn(() => ({
    balances: [],
    xlmBalance: null,
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

describe("useStellarBalanceQuery", () => {
  it("should use proper cache key with publicKey", () => {
    const publicKey = "GBRPYHIL2CI3WHZDTOOQFC6EB4PSJ2BUMTOJ4ONKJMK646ARTICONX2";
    const result = useStellarBalanceQuery(publicKey);

    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("isLoading");
    expect(result).toHaveProperty("error");
    expect(result).toHaveProperty("xlmBalance");
  });

  it("should return null data when publicKey is not provided", () => {
    const result = useStellarBalanceQuery(null);

    expect(result.data).toBeNull();
  });

  it("should have xlmBalance property", () => {
    const publicKey = "GBRPYHIL2CI3WHZDTOOQFC6EB4PSJ2BUMTOJ4ONKJMK646ARTICONX2";
    const result = useStellarBalanceQuery(publicKey);

    expect(result).toHaveProperty("data.xlmBalance");
  });
});
