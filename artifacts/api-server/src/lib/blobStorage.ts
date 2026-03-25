import type { BlobServiceClient, StorageSharedKeyCredential as SKC } from "@azure/storage-blob";
import { logger } from "./logger";

let blobServiceClient: BlobServiceClient | null = null;
let storageInitialized = false;

async function initBlobStorage(): Promise<void> {
  if (storageInitialized) return;
  storageInitialized = true;

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;

  if (connectionString) {
    try {
      const { BlobServiceClient: BSC } = await import("@azure/storage-blob");
      blobServiceClient = BSC.fromConnectionString(connectionString);
      logger.info("Azure Blob Storage initialized via connection string");
      return;
    } catch (err) {
      logger.error({ err }, "Failed to initialize Blob Storage via connection string");
    }
  }

  if (accountName) {
    try {
      const { BlobServiceClient: BSC } = await import("@azure/storage-blob");
      const { DefaultAzureCredential } = await import("@azure/identity");
      const credential = new DefaultAzureCredential();
      blobServiceClient = new BSC(
        `https://${accountName}.blob.core.windows.net`,
        credential
      );
      logger.info({ accountName }, "Azure Blob Storage initialized via managed identity");
      return;
    } catch (err) {
      logger.error({ err }, "Failed to initialize Blob Storage via managed identity");
    }
  }

  logger.info("Azure Blob Storage not configured — file operations will be unavailable");
}

export async function uploadBlob(
  containerName: string,
  blobName: string,
  content: Buffer | string,
  contentType?: string
): Promise<string | null> {
  await initBlobStorage();
  if (!blobServiceClient) return null;

  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(content, typeof content === "string" ? Buffer.byteLength(content) : content.length, {
      blobHTTPHeaders: { blobContentType: contentType || "application/octet-stream" },
    });

    return blockBlobClient.url;
  } catch (err) {
    logger.error({ err, containerName, blobName }, "Failed to upload blob");
    return null;
  }
}

export async function downloadBlob(
  containerName: string,
  blobName: string
): Promise<Buffer | null> {
  await initBlobStorage();
  if (!blobServiceClient) return null;

  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    const downloadResponse = await blobClient.download(0);

    const chunks: Buffer[] = [];
    for await (const chunk of downloadResponse.readableStreamBody!) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 404) return null;
    logger.error({ err, containerName, blobName }, "Failed to download blob");
    return null;
  }
}

export async function deleteBlob(
  containerName: string,
  blobName: string
): Promise<boolean> {
  await initBlobStorage();
  if (!blobServiceClient) return false;

  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    await blobClient.delete();
    return true;
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 404) return true;
    logger.error({ err, containerName, blobName }, "Failed to delete blob");
    return false;
  }
}

export async function listBlobs(
  containerName: string,
  prefix?: string
): Promise<string[]> {
  await initBlobStorage();
  if (!blobServiceClient) return [];

  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobs: string[] = [];
    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
      blobs.push(blob.name);
    }
    return blobs;
  } catch (err) {
    logger.error({ err, containerName, prefix }, "Failed to list blobs");
    return [];
  }
}

export async function getBlobUrl(
  containerName: string,
  blobName: string,
  expiresInMinutes: number = 60
): Promise<string | null> {
  await initBlobStorage();
  if (!blobServiceClient) return null;

  try {
    const { BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } =
      await import("@azure/storage-blob");

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    if (blobServiceClient.credential instanceof StorageSharedKeyCredential) {
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName,
          blobName,
          permissions: BlobSASPermissions.parse("r"),
          expiresOn: new Date(Date.now() + expiresInMinutes * 60 * 1000),
        },
        blobServiceClient.credential as SKC
      ).toString();
      return `${blobClient.url}?${sasToken}`;
    }

    return blobClient.url;
  } catch (err) {
    logger.error({ err, containerName, blobName }, "Failed to generate blob URL");
    return null;
  }
}

export function isBlobStorageConfigured(): boolean {
  return !!(process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.AZURE_STORAGE_ACCOUNT_NAME);
}
