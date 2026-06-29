import "server-only";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

function getGraphConfig() {
  return {
    tenantId: process.env.MICROSOFT_TENANT_ID,
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    mailbox: process.env.MAILBOX_USER || "info@flx-software.de",
  };
}

export function isGraphConfigured(): boolean {
  const { tenantId, clientId, clientSecret } = getGraphConfig();
  return Boolean(tenantId && clientId && clientSecret);
}

export function getMailboxUser(): string {
  return getGraphConfig().mailbox;
}

async function fetchAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }

  const { tenantId, clientId, clientSecret } = getGraphConfig();
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Microsoft Graph nicht konfiguriert");
  }

  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    const detail = data.error_description || data.error || response.statusText;
    throw new Error(`OAuth2-Token konnte nicht abgerufen werden: ${detail}`);
  }

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };

  return data.access_token;
}

export class GraphApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string
  ) {
    super(message);
    this.name = "GraphApiError";
  }
}

export async function graphRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await fetchAccessToken();
  const response = await fetch(`${GRAPH_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : null;

  if (!response.ok) {
    const error = data?.error as
      | { message?: string; code?: string }
      | undefined;
    throw new GraphApiError(
      error?.message || `Graph API Fehler (${response.status})`,
      response.status,
      error?.code
    );
  }

  return data as T;
}

export interface GraphMessage {
  id: string;
  subject?: string;
  from?: { emailAddress?: { address?: string; name?: string } };
  receivedDateTime?: string;
  isRead?: boolean;
  bodyPreview?: string;
  body?: { contentType?: string; content?: string };
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
