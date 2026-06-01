/**
 * @file index.ts
 * @description Internal utility functions for data parsing and helpers.
 * @package stellar-hooks
 * @license MIT
 */

import { Horizon } from "@stellar/stellar-sdk";
import type { StellarBalance, StellarAccountData } from "../types";

type AccountResponseWithReserveFields = Horizon.AccountResponse & {
  num_sponsored?: number;
  num_sponsoring?: number;
};

// ─── Cache Utility ─────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Get a value from the cache if it exists and hasn't expired.
 * @param key Cache key
 * @returns The cached value or undefined if not found/expired
 */
export function getCache<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.value;
  }
  cache.delete(key);
  return undefined;
}

/**
 * Set a value in the cache with a TTL.
 * @param key Cache key
 * @param value Value to cache
 * @param ttlMs Time-to-live in milliseconds
 */
export function setCache<T>(key: string, value: T, ttlMs: number): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Clear the entire cache.
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Clear a specific cache entry.
 * @param key Cache key
 */
export function deleteCache(key: string): void {
  cache.delete(key);
}

// ─── Account Parsing ──────────────────────────────────────────────────────────

/**
 * Parse a raw Horizon AccountResponse into the friendlier StellarAccountData shape.
 */
export function parseAccountResponse(
  raw: Horizon.AccountResponse
): StellarAccountData {
  const account = raw as AccountResponseWithReserveFields;
  const balances: StellarBalance[] = raw.balances.map((b) => {
    const isNative = b.asset_type === "native";
    const balance: StellarBalance = {
      assetType: b.asset_type,
      balance: b.balance,
      balanceFloat: parseFloat(b.balance),
      buyingLiabilities:
        "buying_liabilities" in b ? b.buying_liabilities : "0.0000000",
      sellingLiabilities:
        "selling_liabilities" in b ? b.selling_liabilities : "0.0000000",
      isNative,
    };

    if ("asset_code" in b) balance.assetCode = b.asset_code;
    if ("asset_issuer" in b) balance.assetIssuer = b.asset_issuer;
    if ("limit" in b) balance.limit = b.limit;

    return balance;
  });

  return {
    accountId: raw.account_id,
    balances,
    sequence: raw.sequence,
    subentryCount: raw.subentry_count,
    numSponsored: account.num_sponsored ?? 0,
    numSponsoring: account.num_sponsoring ?? 0,
    thresholds: {
      lowThreshold: raw.thresholds.low_threshold,
      medThreshold: raw.thresholds.med_threshold,
      highThreshold: raw.thresholds.high_threshold,
    },
    flags: {
      authRequired: raw.flags.auth_required,
      authRevocable: raw.flags.auth_revocable,
      authImmutable: raw.flags.auth_immutable,
      authClawbackEnabled: raw.flags.auth_clawback_enabled ?? false,
    },
    raw,
  };
}

/**
 * Clamp a polling interval between min and max ms with exponential back-off.
 */
export function backoff(attempt: number, baseMs = 1000, maxMs = 10000): number {
  return Math.min(baseMs * 2 ** attempt, maxMs);
}

/**
 * Sleep for `ms` milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Type-safe assertion that a value is not null/undefined.
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string
): asserts value is T {
  if (value == null) throw new Error(`[stellar-hooks] ${message}`);
}
