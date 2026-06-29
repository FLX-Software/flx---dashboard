"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateTicketStatus, updateTicket } from "@/lib/actions";
import type { Profile, SupportTicket, TicketStatus } from "@/lib/types";

export function TicketsBoard({
  tickets,
  profiles,
}: {
  tickets: SupportTicket[];
  profiles: Profile[];
}) {
  const [isPending, startTransition] = useTransition();
  const [editTicket, setEditTicket] = useState<SupportTicket | null>(null);

  function handleStatusChange(id: string, status: TicketStatus) {
    startTransition(async () => {
      try {
        await updateTicketStatus(id, status);
        toast.success("Status aktualisiert");
      } catch {
        toast.error("Fehler beim Aktualisieren");
      }
    });
  }

  async function handleUpdate(formData: FormData) {
    if (!editTicket) return;
    startTransition(async () => {
      try {
        await updateTicket(editTicket.id, formData);
        toast.success("Ticket aktualisiert");
        setEditTicket(null);
      } catch {
        toast.error("Fehler beim Aktualisieren");
      }
    });
  }

  const columns: { status: TicketStatus; label: string }[] = [
    { status: "open", label: "Offen" },
    { status: "in_progress", label: "In Bearbeitung" },
    { status: "resolved", label: "Gelöst" },
    { status: "closed", label: "Geschlossen" },
  ];

  return (
    <div>
      <PageHeader
        title="FLX Support"
        description="Tickets von flx-software.de – hier ansehen und bearbeiten"
      />

      {tickets.length === 0 && (
        <div className="mb-6 rounded-xl border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
          Noch keine Tickets von der Website eingegangen.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => (
          <div key={col.status} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <span className="rounded-lg bg-muted px-2 py-0.5 text-xs">
                {tickets.filter((t) => t.status === col.status).length}
              </span>
            </div>
            <div className="space-y-3">
              {tickets
                .filter((t) => t.status === col.status)
                .map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="cursor-pointer rounded-xl transition-all hover:border-primary/50 hover:shadow-md"
                    onClick={() => setEditTicket(ticket)}
                  >
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-xs text-primary">
                            {ticket.external_ticket_id}
                          </span>
                          <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            Website
                          </span>
                        </div>
                        <StatusBadge status={ticket.priority} />
                      </div>
                      <p className="font-medium">{ticket.title}</p>
                      {ticket.customer_company && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {ticket.customer_company}
                          {ticket.customer_name ? ` · ${ticket.customer_name}` : ""}
                        </p>
                      )}
                      {ticket.customer_email && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {ticket.customer_email}
                        </p>
                      )}
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        {format(new Date(ticket.created_at), "dd. MMM yyyy", {
                          locale: de,
                        })}
                      </p>
                      <div
                        className="mt-3 flex gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {col.status !== "open" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 rounded-lg text-xs"
                            onClick={() => handleStatusChange(ticket.id, "open")}
                            disabled={isPending}
                          >
                            Offen
                          </Button>
                        )}
                        {col.status !== "in_progress" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 rounded-lg text-xs"
                            onClick={() =>
                              handleStatusChange(ticket.id, "in_progress")
                            }
                            disabled={isPending}
                          >
                            Bearbeiten
                          </Button>
                        )}
                        {col.status !== "resolved" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 rounded-lg text-xs"
                            onClick={() =>
                              handleStatusChange(ticket.id, "resolved")
                            }
                            disabled={isPending}
                          >
                            Gelöst
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editTicket} onOpenChange={() => setEditTicket(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              Ticket {editTicket?.external_ticket_id} bearbeiten
            </DialogTitle>
          </DialogHeader>
          {editTicket && (
            <form action={handleUpdate} className="space-y-4">
              <TicketEditForm ticket={editTicket} profiles={profiles} />
              <Button
                type="submit"
                className="w-full rounded-xl"
                disabled={isPending}
              >
                Speichern
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TicketEditForm({
  ticket,
  profiles,
}: {
  ticket: SupportTicket;
  profiles: Profile[];
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          name="title"
          defaultValue={ticket.title}
          required
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={ticket.description || ""}
          className="rounded-xl"
          rows={4}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={ticket.status}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="open">Offen</option>
            <option value="in_progress">In Bearbeitung</option>
            <option value="resolved">Gelöst</option>
            <option value="closed">Geschlossen</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priorität</Label>
          <select
            id="priority"
            name="priority"
            defaultValue={ticket.priority}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="low">Niedrig</option>
            <option value="medium">Mittel</option>
            <option value="high">Hoch</option>
            <option value="urgent">Dringend</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="assigned_to">Zugewiesen an</Label>
        <select
          id="assigned_to"
          name="assigned_to"
          defaultValue={ticket.assigned_to || "none"}
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="none">Niemand</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name || p.email}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
