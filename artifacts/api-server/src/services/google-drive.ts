import { ReplitConnectors } from "@replit/connectors-sdk";
import { logger } from "../lib/logger";

const connectors = new ReplitConnectors();

export async function listFiles(pageSize = 10, query?: string) {
  const params: Record<string, string> = {
    pageSize: String(pageSize),
    fields: "files(id,name,mimeType,modifiedTime,size,webViewLink)",
  };
  if (query) params.q = query;
  const qstr = new URLSearchParams(params).toString();
  const response = await connectors.proxy("google-drive", `/drive/v3/files?${qstr}`, {
    method: "GET",
  });
  const data = await response.json();
  logger.info({ count: data.files?.length }, "Listed Google Drive files");
  return data.files || [];
}

export async function getFileMetadata(fileId: string) {
  const response = await connectors.proxy(
    "google-drive",
    `/drive/v3/files/${fileId}?fields=id,name,mimeType,modifiedTime,size,webViewLink,owners,permissions`,
    { method: "GET" },
  );
  return response.json();
}

export async function uploadFile(name: string, content: string, mimeType = "text/plain") {
  const metadata = JSON.stringify({ name, mimeType });
  const boundary = "szl_upload_boundary";
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    metadata,
    `--${boundary}`,
    `Content-Type: ${mimeType}`,
    "",
    content,
    `--${boundary}--`,
  ].join("\r\n");

  const response = await connectors.proxy(
    "google-drive",
    "/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    },
  );
  const data = await response.json();
  logger.info({ fileId: data.id, name }, "Uploaded file to Google Drive");
  return data;
}

export async function searchFiles(query: string, pageSize = 25) {
  return listFiles(pageSize, query);
}
