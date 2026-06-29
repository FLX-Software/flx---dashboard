import type { EmailMessage } from "@/lib/types";
import {
  applyEmailState,
  deleteEmailLocal,
  setEmailReadLocal,
} from "@/lib/email-state";
import {
  GraphApiError,
  getMailboxUser,
  getMissingGraphEnvVars,
  graphRequest,
  isGraphConfigured,
  stripHtml,
  type GraphMessage,
} from "@/lib/microsoft-graph";

const DEMO_EMAILS: EmailMessage[] = [
  {
    id: "demo-1",
    from: "kunde@beispiel.de",
    subject: "Anfrage zur Software-Lizenz",
    date: new Date().toISOString(),
    preview:
      "Guten Tag, wir interessieren uns für Ihre FLX Software Lösung und hätten gerne weitere Informationen...",
    read: false,
    body: "Guten Tag,\n\nwir interessieren uns für Ihre FLX Software Lösung und hätten gerne weitere Informationen zu Preisen und Features.\n\nMit freundlichen Grüßen\nMax Mustermann",
  },
];

function mapGraphMessage(message: GraphMessage): EmailMessage {
  const from = message.from?.emailAddress;
  const fromLabel = from?.name
    ? `${from.name} <${from.address}>`
    : from?.address || "Unbekannt";

  const bodyContent = message.body?.content?.trim() ?? "";
  const textBody =
    message.body?.contentType?.toLowerCase() === "html"
      ? stripHtml(bodyContent)
      : bodyContent;

  const preview = (message.bodyPreview || textBody).slice(0, 150);

  return {
    id: message.id,
    from: fromLabel,
    subject: message.subject || "(Kein Betreff)",
    date: message.receivedDateTime || new Date().toISOString(),
    preview,
    read: message.isRead ?? false,
    body: textBody || undefined,
  };
}

function graphErrorMessage(err: unknown): string {
  if (err instanceof GraphApiError) {
    if (err.status === 401 || err.status === 403) {
      return `Microsoft Graph Zugriff verweigert (${err.code ?? err.status}). Bitte Application Permissions Mail.Read bzw. Mail.ReadWrite vergeben und Admin-Einwilligung erteilen.`;
    }
    return err.message;
  }
  return err instanceof Error ? err.message : "Unbekannter Verbindungsfehler";
}

function mailboxPath(suffix: string): string {
  const mailbox = encodeURIComponent(getMailboxUser());
  return `/users/${mailbox}${suffix}`;
}

export async function fetchEmails(): Promise<{
  emails: EmailMessage[];
  demo: boolean;
  mailbox: string;
  error?: string;
}> {
  const mailbox = getMailboxUser();

  if (!isGraphConfigured()) {
    const missing = getMissingGraphEnvVars().join(", ");
    return {
      emails: await applyEmailState(DEMO_EMAILS),
      demo: true,
      mailbox,
      error: `Microsoft Graph nicht konfiguriert. Fehlende Umgebungsvariablen: ${missing}. Auf Vercel unter Project → Settings → Environment Variables eintragen und neu deployen.`,
    };
  }

  try {
    const data = await graphRequest<{ value: GraphMessage[] }>(
      `${mailboxPath("/messages")}?$top=30&$orderby=receivedDateTime desc&$select=id,subject,from,receivedDateTime,isRead,bodyPreview,body`
    );

    const emails = data.value.map(mapGraphMessage);
    const filtered = await applyEmailState(emails);

    return { emails: filtered, demo: false, mailbox };
  } catch (err) {
    const message = graphErrorMessage(err);
    console.error("[Graph] E-Mail-Abruf fehlgeschlagen:", message);

    return {
      emails: await applyEmailState(DEMO_EMAILS),
      demo: true,
      mailbox,
      error: message,
    };
  }
}

export async function markEmailAsRead(
  id: string,
  read: boolean,
  demo: boolean
): Promise<void> {
  if (demo || !isGraphConfigured()) {
    await setEmailReadLocal(id, read);
    return;
  }

  await graphRequest(mailboxPath(`/messages/${id}`), {
    method: "PATCH",
    body: JSON.stringify({ isRead: read }),
  });
}

export async function deleteEmail(id: string, demo: boolean): Promise<void> {
  if (demo || !isGraphConfigured()) {
    await deleteEmailLocal(id);
    return;
  }

  await graphRequest(mailboxPath(`/messages/${id}`), {
    method: "DELETE",
  });

  await deleteEmailLocal(id);
}
