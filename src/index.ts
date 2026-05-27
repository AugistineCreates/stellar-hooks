// Provider
export { StellarProvider } from "./context";

// Hooks
export { useFreighter } from "./hooks/useFreighter";
export { useStellarAccount } from "./hooks/useStellarAccount";
export { useStellarBalance } from "./hooks/useStellarBalance";
export { useSorobanContract } from "./hooks/useSorobanContract";
export { useTransaction } from "./hooks/useTransaction";
export { useLedgerEntry } from "./hooks/useLedgerEntry";
export { usePathPayment } from "./hooks/usePathPayment";
export type {
  PathPaymentAsset,
  UsePathPaymentOptions,
  UsePathPaymentReturn,
} from "./hooks/usePathPayment";

// Types
export type {
  // Network
  StellarNetwork,
  NetworkConfig,
  // Account
  StellarAccountData,
  StellarBalance,
  // Wallet
  FreighterState,
  UseFreighterReturn,
  SignTransactionOptions,
  // Transactions
  TransactionStatus,
  TransactionState,
  // Contract
  ContractCallOptions,
  UseContractCallReturn,
  // Ledger
  LedgerEntryState,
  // Provider
  StellarProviderProps,
  StellarContextValue,
} from "./types";

// Network presets (useful for custom configs)
export { NETWORK_CONFIGS } from "./types";
