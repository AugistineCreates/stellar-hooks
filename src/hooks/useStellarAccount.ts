import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Horizon } from "@stellar/stellar-sdk";
import { useStellarContext } from "../context";
import { parseAccountResponse, getCache, setCache } from "../utils";
import type { StellarAccountData } from "../types";

export interface UseStellarAccountOptions {
  enabled?: boolean;
  refetchInterval?: number;
  /** Time-to-live for cache in milliseconds (default: 60000 = 1 minute) */
  cacheTTL?: number;
}

export interface UseStellarAccountReturn {
  data: StellarAccountData | null;
  isLoading: boolean;
  error: Error | null;
  lastFetchedAt: Date | null;
  refetch: () => Promise<void>;
}

export function useStellarAccount(
  publicKey: string | null | undefined,
  options: UseStellarAccountOptions = {}
): UseStellarAccountReturn {
  const { enabled = true, refetchInterval = 0, cacheTTL = 60000 } = options;
  const { config } = useStellarContext();

  const server = useMemo(() => new Horizon.Server(config.horizonUrl), [config.horizonUrl]);

  const [data, setData] = useState<StellarAccountData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAccount = useCallback(async (force = false) => {
    if (!publicKey || !enabled) return;

    const cacheKey = `stellar-account-${publicKey}-${config.network}`;
    
    if (!force) {
      const cached = getCache<StellarAccountData>(cacheKey);
      if (cached) {
        setData(cached);
        setLastFetchedAt(new Date());
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      const raw = await server.loadAccount(publicKey);
      const parsed = parseAccountResponse(raw);
      setCache(cacheKey, parsed, cacheTTL);
      setData(parsed);
      setLastFetchedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, enabled, server, config.network, cacheTTL]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  useEffect(() => {
    if (refetchInterval > 0) {
      intervalRef.current = setInterval(() => fetchAccount(true), refetchInterval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAccount, refetchInterval]);

  return { 
    data, 
    isLoading, 
    error, 
    lastFetchedAt, 
    refetch: () => fetchAccount(true) 
  };
}
