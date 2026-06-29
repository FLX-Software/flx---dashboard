import "server-only";

import path from "path";

/** Writable data directory (Vercel/serverless only allows writes under /tmp). */
export function getDataDir(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    return path.join("/tmp", "flx-dashboard-data");
  }
  return path.join(process.cwd(), "data");
}
