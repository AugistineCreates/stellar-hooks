import { useMutation } from "react-query";
import { useFreighter } from "stellar-hooks";
import type { UseFreighterQueryOptions } from "../types";

/**
 * React Query adapter for useFreighter — wraps the Freighter connect logic in useMutation.
 *
 * @example
 * ```tsx
 * const { mutate: connect, isPending, isError } = useFreighterQuery();
 *
 * return (
 *   <>
 *     <button onClick={() => connect()} disabled={isPending}>
 *       {isPending ? "Connecting..." : "Connect Wallet"}
 *     </button>
 *     {isError && <p>Failed to connect</p>}
 *   </>
 * );
 * ```
 */
export function useFreighterQuery(options?: UseFreighterQueryOptions) {
  const { connect, ...freighterState } = useFreighter();

  const mutation = useMutation(
    {
      mutationFn: async () => {
        await connect();
      },
      ...options,
    }
  );

  return {
    ...mutation,
    freighterState,
  };
}
