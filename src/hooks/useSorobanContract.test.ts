/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSorobanContract } from "../hooks/useSorobanContract";
import { rpc, xdr, Account } from "@stellar/stellar-sdk";
import { xdr } from "@stellar/stellar-sdk";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockSignTransaction = vi.fn();
vi.mock("../hooks/useFreighter", () => ({
  useFreighter: () => ({
    publicKey: "GBL5T5MLZ57JTBNS643LEJBKAKSOTJCCZVY54FTNZHDSNA56NS6LM3WG",
    networkPassphrase: "Test Net",
    signTransaction: mockSignTransaction,
  }),
}));

vi.mock("../context", () => ({
  useStellarContext: () => ({
    config: { sorobanRpcUrl: "https://rpc.example.com", networkPassphrase: "Test Net" },
  }),
}));

const mockSimulateTransaction = vi.fn();
const mockSendTransaction = vi.fn();
const mockGetTransaction = vi.fn();
const mockGetAccount = vi.fn().mockImplementation((publicKey: string) => {
  return Promise.resolve(new Account(publicKey, "1"));
});

vi.mock("@stellar/stellar-sdk/rpc", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    Server: vi.fn().mockImplementation(() => ({
      simulateTransaction: mockSimulateTransaction,
      sendTransaction: mockSendTransaction,
      getTransaction: mockGetTransaction,
      getAccount: mockGetAccount,
    })),
    Api: {
      ...actual.Api,
      isSimulationError: () => false,
      GetTransactionStatus: { SUCCESS: "SUCCESS", FAILED: "FAILED" },
    },
    assembleTransaction: (tx: any) => ({ build: () => tx }),
  };
});

vi.mock("@stellar/stellar-sdk", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    TransactionBuilder: class extends actual.TransactionBuilder {
      static fromXDR = vi.fn().mockImplementation((xdr: string) => xdr) as any;
    },
  };
});

describe("useSorobanContract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with idle status", () => {
    const { result } = renderHook(() => useSorobanContract("CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4" as any, { method: "hello" }));
    expect(result.current.status).toBe("idle");
    expect(result.current.isLoading).toBe(false);
  });

  it("executes a full call lifecycle successfully", async () => {
    // Mocking the sequence of RPC responses
    mockSimulateTransaction.mockResolvedValue({ results: [{ retval: {} }] });
    mockSignTransaction.mockResolvedValue("signed-xdr");
    mockSendTransaction.mockResolvedValue({ status: "PENDING", hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2" });
    mockGetTransaction.mockResolvedValue({
      status: "SUCCESS",
      resultMetaXdr: { toXDR: () => Buffer.from([]) } // simplified
    });

    const { result } = renderHook(() => useSorobanContract("CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4" as any, { method: "hello" }));

    await act(async () => {
      await result.current.call();
    });

    expect(result.current.status).toBe("success");
    expect(result.current.hash).toBe("a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2");
    expect(mockSignTransaction).toHaveBeenCalled();
    expect(mockSendTransaction).toHaveBeenCalled();
  });

  it("performs a query (simulation) without signing", async () => {
    mockSimulateTransaction.mockResolvedValue({
      result: { retval: xdr.ScVal.scvSymbol("query_ok") }
    });

    const { result } = renderHook(() => useSorobanContract("CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4" as any, { 
      method: "get_val",
      parseResult: () => "parsed_val"
    }));

    await act(async () => {
      const queryRes = await result.current.query();
      expect(queryRes).toBe("parsed_val");
    });

    expect(result.current.status).toBe("success");
    expect(mockSignTransaction).not.toHaveBeenCalled();
  });

  it("resets state correctly", async () => {
    const { result } = renderHook(() => useSorobanContract("CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4" as any, { method: "hello" }));
    
    act(() => { result.current.reset(); });

    expect(result.current.status).toBe("idle");
    expect(result.current.result).toBeNull();
  });
});