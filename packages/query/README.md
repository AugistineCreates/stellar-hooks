# @stellar-hooks/query

React Query adapter for [stellar-hooks](../). This package wraps data-fetching hooks in React Query's `useQuery` and `useMutation` for better cache management and request deduplication.

## Installation

```bash
npm install @stellar-hooks/query react-query stellar-hooks
```

## Usage

### useFreighterQuery

Wraps `useFreighter` connect in `useMutation`:

```tsx
import { useFreighterQuery } from "@stellar-hooks/query";

export function ConnectWallet() {
  const { mutate: connect, isPending, isError } = useFreighterQuery();

  return (
    <div>
      <button onClick={() => connect()} disabled={isPending}>
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>
      {isError && <p>Failed to connect</p>}
    </div>
  );
}
```

### useStellarAccountQuery

Wraps `useStellarAccount` in `useQuery` with proper cache keys:

```tsx
import { useStellarAccountQuery } from "@stellar-hooks/query";

export function AccountInfo({ publicKey }: { publicKey: string }) {
  const { data, isLoading, error } = useStellarAccountQuery(publicKey, {
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <p>Balance: {data?.balances.length}</p>
      <p>Sequence: {data?.sequenceNumber}</p>
    </div>
  );
}
```

### useStellarBalanceQuery

Wraps `useStellarBalance` in `useQuery`:

```tsx
import { useStellarBalanceQuery } from "@stellar-hooks/query";

export function Balance({ publicKey }: { publicKey: string }) {
  const { data, isLoading } = useStellarBalanceQuery(publicKey, {
    staleTime: 1000 * 60,
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <p>XLM Balance: {data?.xlmBalance?.balance}</p>
      <p>Total Assets: {data?.balances.length}</p>
    </div>
  );
}
```

## Cache Keys

- **Stellar Account**: `["stellarAccount", publicKey]`
- **Stellar Balance**: `["stellarBalance", publicKey]`

## Options

All hooks accept standard React Query options with these defaults:

- `staleTime`: 1 minute (60000ms)
- `gcTime`: 5 minutes (300000ms)
- `enabled`: Based on publicKey availability

## License

MIT
