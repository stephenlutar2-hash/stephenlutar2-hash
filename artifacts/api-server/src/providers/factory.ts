import type { CacheProvider, BlobStorageProvider, StripeProvider, PlaidProvider } from "./index";
import { getMockedProviders } from "./index";
import { LiveCacheProvider, MockCacheProvider } from "./cache";
import { LiveBlobStorageProvider, MockBlobStorageProvider } from "./blob";
import { LiveStripeProvider, MockStripeProvider } from "./stripe";
import { LivePlaidProvider, MockPlaidProvider } from "./plaid";
import { logger } from "../lib/logger";

let _cache: CacheProvider | null = null;
let _blob: BlobStorageProvider | null = null;
let _stripe: StripeProvider | null = null;
let _plaid: PlaidProvider | null = null;

function shouldMock(name: string): boolean {
  return getMockedProviders().has(name as any);
}

export function getCacheProvider(): CacheProvider {
  if (!_cache) {
    if (shouldMock("redis")) {
      logger.info("Using mock cache provider");
      _cache = new MockCacheProvider();
    } else {
      _cache = new LiveCacheProvider();
    }
  }
  return _cache;
}

export function getBlobStorageProvider(): BlobStorageProvider {
  if (!_blob) {
    if (shouldMock("blob")) {
      logger.info("Using mock blob storage provider");
      _blob = new MockBlobStorageProvider();
    } else {
      _blob = new LiveBlobStorageProvider();
    }
  }
  return _blob;
}

export function getStripeProvider(): StripeProvider {
  if (!_stripe) {
    if (shouldMock("stripe")) {
      logger.info("Using mock Stripe provider");
      _stripe = new MockStripeProvider();
    } else {
      _stripe = new LiveStripeProvider();
    }
  }
  return _stripe;
}

export function getPlaidProvider(): PlaidProvider {
  if (!_plaid) {
    if (shouldMock("plaid")) {
      logger.info("Using mock Plaid provider");
      _plaid = new MockPlaidProvider();
    } else {
      _plaid = new LivePlaidProvider();
    }
  }
  return _plaid;
}
