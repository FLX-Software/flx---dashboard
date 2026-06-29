"use client";

import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Mail, MailOpen, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EmailMessage } from "@/lib/types";

export function EmailInbox({
  initialEmails,
  demo,
  mailbox,
  error: initialError,
}: {
  initialEmails: EmailMessage[];
  demo: boolean;
  mailbox: string;
  error?: string;
}) {
  const [emails, setEmails] = useState(initialEmails);
  const [selected, setSelected] = useState<EmailMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(initialError);

  const demoParam = demo ? "?demo=true" : "";

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/emails");
      const data = await res.json();
      setEmails(data.emails);
      setError(data.error);
      if (selected && !data.emails.find((e: EmailMessage) => e.id === selected.id)) {
        setSelected(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function setRead(email: EmailMessage, read: boolean) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/emails/${email.id}${demoParam}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
      if (!res.ok) throw new Error();
      setEmails((prev) =>
        prev.map((e) => (e.id === email.id ? { ...e, read } : e))
      );
      if (selected?.id === email.id) {
        setSelected({ ...email, read });
      }
      toast.success(read ? "Als gelesen markiert" : "Als ungelesen markiert");
    } catch {
      toast.error("Aktion fehlgeschlagen");
    } finally {
      setActionLoading(false);
    }
  }

  async function removeEmail(email: EmailMessage) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/emails/${email.id}${demoParam}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setEmails((prev) => prev.filter((e) => e.id !== email.id));
      if (selected?.id === email.id) setSelected(null);
      toast.success("E-Mail gelöscht");
    } catch {
      toast.error("Löschen fehlgeschlagen");
    } finally {
      setActionLoading(false);
    }
  }

  function openEmail(email: EmailMessage) {
    setSelected(email);
    if (!email.read) {
      void setRead(email, true);
    }
  }

  return (
    <div>
      <PageHeader
        title="FLX E-Mails"
        description={`Postfach: ${mailbox}`}
      >
        <Button
          variant="outline"
          className="rounded-xl gap-2"
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </PageHeader>

      {demo && error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Verbindung zu Microsoft 365 fehlgeschlagen: {error}
        </div>
      )}

      {demo && !error && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          Demo-Modus: Microsoft Graph in{" "}
          <code className="rounded bg-background/50 px-1">.env.local</code>{" "}
          konfigurieren (Tenant ID, Client ID, Client Secret).
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="rounded-2xl lg:col-span-2">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <CardContent className="p-2">
              {emails.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Keine E-Mails
                </p>
              ) : (
                emails.map((email) => (
                  <button
                    key={email.id}
                    type="button"
                    onClick={() => openEmail(email)}
                    className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-accent ${
                      selected?.id === email.id ? "bg-accent" : ""
                    } ${!email.read ? "font-medium" : ""}`}
                  >
                    {email.read ? (
                      <MailOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm">{email.from}</p>
                        {!email.read && (
                          <Badge className="shrink-0 rounded-lg text-[10px]">
                            Neu
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-sm">{email.subject}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {email.preview}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {format(new Date(email.date), "dd. MMM yyyy, HH:mm", {
                          locale: de,
                        })}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        <Card className="rounded-2xl lg:col-span-3">
          <CardContent className="p-6">
            {selected ? (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold">{selected.subject}</h2>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-2"
                      disabled={actionLoading}
                      onClick={() => setRead(selected, !selected.read)}
                    >
                      {selected.read ? (
                        <>
                          <Mail className="h-4 w-4" />
                          Ungelesen
                        </>
                      ) : (
                        <>
                          <MailOpen className="h-4 w-4" />
                          Gelesen
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-2 text-destructive hover:text-destructive"
                      disabled={actionLoading}
                      onClick={() => removeEmail(selected)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Löschen
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Von: {selected.from} ·{" "}
                  {format(new Date(selected.date), "dd. MMMM yyyy, HH:mm", {
                    locale: de,
                  })}{" "}
                  Uhr
                </p>
                <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed">
                  {selected.body || selected.preview}
                </div>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                Wählen Sie eine E-Mail aus
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
