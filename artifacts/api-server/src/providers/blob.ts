import type { BlobStorageProvider } from "./index";
import {
  uploadBlob,
  downloadBlob,
  deleteBlob,
  listBlobs,
  getBlobUrl,
} from "../lib/blobStorage";

export class LiveBlobStorageProvider implements BlobStorageProvider {
  async upload(container: string, blob: string, content: Buffer | string, contentType?: string): Promise<string | null> {
    return uploadBlob(container, blob, content, contentType);
  }

  async download(container: string, blob: string): Promise<Buffer | null> {
    return downloadBlob(container, blob);
  }

  async remove(container: string, blob: string): Promise<boolean> {
    return deleteBlob(container, blob);
  }

  async list(container: string, prefix?: string): Promise<string[]> {
    return listBlobs(container, prefix);
  }

  async getUrl(container: string, blob: string, expiresInMinutes?: number): Promise<string | null> {
    return getBlobUrl(container, blob, expiresInMinutes);
  }
}

export class MockBlobStorageProvider implements BlobStorageProvider {
  private store = new Map<string, Buffer>();

  private key(container: string, blob: string): string {
    return `${container}/${blob}`;
  }

  async upload(container: string, blob: string, content: Buffer | string): Promise<string | null> {
    const buf = typeof content === "string" ? Buffer.from(content) : content;
    this.store.set(this.key(container, blob), buf);
    return `mock://${container}/${blob}`;
  }

  async download(container: string, blob: string): Promise<Buffer | null> {
    return this.store.get(this.key(container, blob)) || null;
  }

  async remove(container: string, blob: string): Promise<boolean> {
    return this.store.delete(this.key(container, blob));
  }

  async list(container: string, prefix?: string): Promise<string[]> {
    const p = prefix ? `${container}/${prefix}` : `${container}/`;
    return Array.from(this.store.keys())
      .filter((k) => k.startsWith(p))
      .map((k) => k.slice(container.length + 1));
  }

  async getUrl(container: string, blob: string): Promise<string | null> {
    if (this.store.has(this.key(container, blob))) {
      return `mock://${container}/${blob}`;
    }
    return null;
  }
}
