import { useQuery } from "react-query";
import { useStellarBalance } from "stellar-hooks";
import type { StellarBalance } from "stellar-hooks";
import type { UseStellarBalanceQueryOptions } from "../types";

export interface UseStellarBalanceQueryReturn {
  data: {
    balances: StellarBalance[];
    xlmBalance: StellarBalance | null;
  } | null;
  isLoading: boolean;
  error: Error | null;
  isRefetching: boolean;
  refetch: () => Promise<any>;
}

/**
 * React Query adapter for useStellarBalance — wraps balance fetching in useQuery
 * with proper cache keys.
 *
 * @example
 * ```tsx
 * const { data } = useStellarBalanceQuery(publicKey, {
 *   staleTime: 1000 * 60, // 1 minute
 *   gcTime: 1000 * 60 * 5, // 5 minutes
 * });
 *
 * console.log(`XLM: ${data?.xlmBalance?.balance}`);
 * ```
 */
export function useStellarBalanceQuery(
  publicKey: string | null | undefined,
  options?: UseStellarBalanceQueryOptions
): UseStellarBalanceQueryReturn {
  const { balances, xlmBalance, isLoading, error, refetch } = useStellarBalance(publicKey, {
    enabled: false,
  });

  const query = useQuery(
    {
      queryKey: ["stellarBalance", publicKey],
      queryFn: async () => {
        if (!publicKey) return null;
        // The refetch will trigger the underlying hook
        await refetch();
        return {
          balances,
          xlmBalance,
        };
      },
      enabled: !!publicKey && (options?.enabled !== false),
      staleTime: 1000 * 60, // 1 minute by default
      gcTime: 1000 * 60 * 5, // 5 minutes by default (formerly cacheTime)
      ...options,
    }
  );

  return {
    data: query.data,
    isLoading: query.isLoading || isLoading,
    error: query.error as Error | null,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
