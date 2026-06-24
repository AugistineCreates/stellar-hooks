/**
 * @file useFreighter.test.ts
 * @description Unit tests for the useFreighter hook.
 * @package stellar-hooks
 * @license MIT
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFreighter } from "../hooks/useFreighter";
import {
  resetFreighterMocks,
  mockFreighterConnected,
  mockFreighterInstalled,
  mockFreighterError,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
  signAuthEntry,
  signBlob,
} from "@stellar/freighter-api";



beforeEach(() => {
  resetFreighterMocks();
});

describe("useFreighter — not installed", () => {
  it("starts with isLoading true", () => {
    const { result } = renderHook(() => useFreighter());
    expect(result.current.isLoading).toBe(true);
  });

  it("sets isInstalled false when Freighter is not detected", async () => {
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.publicKey).toBeNull();
  });
});

describe("useFreighter — installed but not connected", () => {
  it("sets isInstalled true and isConnected false", async () => {
    mockFreighterInstalled();
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.publicKey).toBeNull();
  });
});

describe("useFreighter — connected", () => {
  it("sets publicKey, network, and networkPassphrase when connected", async () => {
    mockFreighterConnected("GAAZI4BCE7Y5L7S25K2LJKBJHW7X2UHLW4XY5R2DZPHFBUHE5PQ7L2UQ", "TESTNET", "Test SDF Network ; September 2015");
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isConnected).toBe(true);
    expect(result.current.publicKey).toBe("GAAZI4BCE7Y5L7S25K2LJKBJHW7X2UHLW4XY5R2DZPHFBUHE5PQ7L2UQ");
    expect(result.current.network).toBe("TESTNET");
    expect(result.current.networkPassphrase).toBe("Test SDF Network ; September 2015");
  });
});

describe("useFreighter — connect()", () => {
  it("connects successfully when requestAccess succeeds", async () => {
    mockFreighterInstalled();
    vi.mocked(requestAccess).mockResolvedValue({ address: "GAAZI4BCE7Y5L7S25K2LJKBJHW7X2UHLW4XY5R2DZPHFBUHE5PQ7L2UR", error: null });
    vi.mocked(getAddress).mockResolvedValue({ address: "GAAZI4BCE7Y5L7S25K2LJKBJHW7X2UHLW4XY5R2DZPHFBUHE5PQ7L2UR", error: null });
    vi.mocked(getNetwork).mockResolvedValue({ network: "TESTNET", networkPassphrase: "Test SDF Network ; September 2015" });

    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.publicKey).toBe("GAAZI4BCE7Y5L7S25K2LJKBJHW7X2UHLW4XY5R2DZPHFBUHE5PQ7L2UR");
  });

  it("sets error when requestAccess fails", async () => {
    vi.mocked(requestAccess).mockRejectedValue(new Error("User rejected"));
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("User rejected");
    expect(result.current.isConnected).toBe(false);
  });
});

describe("useFreighter — disconnect()", () => {
  it("clears publicKey and sets isConnected false", async () => {
    mockFreighterConnected();
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.publicKey).toBeNull();
  });
});

describe("useFreighter — error state", () => {
  it("sets error when Freighter throws on probe", async () => {
    mockFreighterError("Extension crashed");
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Extension crashed");
  });
});

describe("useFreighter — signTransaction()", () => {
  it("returns signed XDR", async () => {
    mockFreighterConnected();
    vi.mocked(signTransaction).mockResolvedValue({ signedTxXdr: "signed-result-xdr", error: null });
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    const signed = await result.current.signTransaction("raw-xdr" as any);
    expect(signed).toBe("signed-result-xdr");
  });

  it("throws when signTransaction returns error", async () => {
    mockFreighterConnected();
    vi.mocked(signTransaction).mockResolvedValue({ signedTxXdr: "", error: { message: "Sign failed" } });
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    await expect(result.current.signTransaction("raw-xdr" as any)).rejects.toThrow("Sign failed");
  });
});

describe("useFreighter — signAuthEntry()", () => {
  it("returns signed auth entry", async () => {
    mockFreighterConnected();
    vi.mocked(signAuthEntry).mockResolvedValue({ signedAuthEntry: "signed-auth", error: null });
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    const signed = await result.current.signAuthEntry("entry-xdr" as any);
    expect(signed).toBe("signed-auth");
  });
});

describe("useFreighter — signBlob()", () => {
  it("returns signed blob", async () => {
    mockFreighterConnected();
    vi.mocked(signBlob).mockResolvedValue({ signedMessage: "signed-blob-result", error: null });
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    const signed = await result.current.signBlob("my-blob");
    expect(signed).toBe("signed-blob-result");
  });
});