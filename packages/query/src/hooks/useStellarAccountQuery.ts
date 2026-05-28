import { useQuery } from "react-query";
import { useStellarAccount } from "stellar-hooks";
import type { UseStellarAccountQueryOptions } from "../types";

/**
 * React Query adapter for useStellarAccount — wraps account fetching in useQuery
 * with proper cache keys.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useStellarAccountQuery(publicKey, {
 *   staleTime: 1000 * 60, // 1 minute
 *   gcTime: 1000 * 60 * 5, // 5 minutes
 * });
 * ```
 */
export function useStellarAccountQuery(
  publicKey: string | null | undefined,
  options?: UseStellarAccountQueryOptions
) {
  const { data, isLoading, error, refetch } = useStellarAccount(publicKey, {
    enabled: false,
  });

  const query = useQuery(
    {
      queryKey: ["stellarAccount", publicKey],
      queryFn: async () => {
        if (!publicKey) return null;
        // The refetch will trigger the underlying hook
        await refetch();
        return data;
      },
      enabled: !!publicKey && (options?.enabled !== false),
      staleTime: 1000 * 60, // 1 minute by default
      gcTime: 1000 * 60 * 5, // 5 minutes by default (formerly cacheTime)
      ...options,
    }
  );

  return query;
}
