import "server-only";

import { list, put } from "@vercel/blob";

const BLOB_PATHNAME = "flx-dashboard/dashboard.json";

function getBlobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
}

export function isBlobStorageConfigured(): boolean {
  return Boolean(getBlobToken());
}

export async function readPersistedJson(): Promise<string | null> {
  const token = getBlobToken();
  if (!token) return null;

  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, token });
    const blob = blobs.find((entry) => entry.pathname === BLOB_PATHNAME);
    if (!blob?.url) return null;

    const response = await fetch(blob.url);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

export async function writePersistedJson(content: string): Promise<boolean> {
  const token = getBlobToken();
  if (!token) return false;

  try {
    await put(BLOB_PATHNAME, content, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      token,
    });
    return true;
  } catch {
    return false;
  }
}
