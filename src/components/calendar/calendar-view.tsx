"use client";

import { useState, useTransition } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createEvent, deleteEvent } from "@/lib/actions";
import type { CalendarEvent, Profile } from "@/lib/types";

export function CalendarView({
  events,
  profiles,
  currentUserId,
}: {
  events: CalendarEvent[];
  profiles: Profile[];
  currentUserId: string;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = monthStart.getDay();
  const paddingDays = startDay === 0 ? 6 : startDay - 1;

  function getEventsForDay(day: Date) {
    return events.filter((e) => isSameDay(new Date(e.start_time), day));
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteEvent(id);
        toast.success("Termin gelöscht");
      } catch {
        toast.error("Fehler beim Löschen");
      }
    });
  }

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      try {
        await createEvent(formData);
        toast.success("Termin erstellt");
        setCreateOpen(false);
      } catch {
        toast.error("Fehler beim Erstellen");
      }
    });
  }

  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  return (
    <div>
      <PageHeader
        title="FLX Kalender"
        description="Termine für Mitarbeiter und sich selbst planen"
      >
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2">
              <Plus className="h-4 w-4" />
              Neuer Termin
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Neuer Termin</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  name="description"
                  className="rounded-xl"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ort</Label>
                <Input id="location" name="location" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user_id">Mitarbeiter</Label>
                <select
                  id="user_id"
                  name="user_id"
                  defaultValue={currentUserId}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || p.email}
                      {p.id === currentUserId ? " (Ich)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Datum</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  defaultValue={
                    selectedDate
                      ? format(selectedDate, "yyyy-MM-dd")
                      : format(new Date(), "yyyy-MM-dd")
                  }
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="all_day"
                  name="all_day"
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <Label htmlFor="all_day" className="font-normal">
                  Ganztägig
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Von</Label>
                  <Input
                    id="start_time"
                    name="start_time"
                    type="time"
                    defaultValue="09:00"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Bis</Label>
                  <Input
                    id="end_time"
                    name="end_time"
                    type="time"
                    defaultValue="10:00"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl"
                disabled={isPending}
              >
                Erstellen
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl lg:col-span-2">
          <CardContent className="p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: de })}
              </h2>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Heute
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1">
              {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: paddingDays }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square" />
              ))}
              {days.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square rounded-xl p-1 text-sm transition-colors hover:bg-accent",
                      !isSameMonth(day, currentMonth) &&
                        "text-muted-foreground/50",
                      isToday(day) && "ring-2 ring-primary/50",
                      isSelected &&
                        "bg-primary text-primary-foreground hover:bg-primary"
                    )}
                  >
                    <span className="block text-center">{format(day, "d")}</span>
                    {dayEvents.length > 0 && (
                      <div className="mt-0.5 flex justify-center gap-0.5">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span
                            key={e.id}
                            className={cn(
                              "h-1 w-1 rounded-full",
                              isSelected ? "bg-primary-foreground" : "bg-primary"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <h3 className="mb-4 font-semibold">
              {selectedDate
                ? format(selectedDate, "EEEE, dd. MMMM", { locale: de })
                : "Tag auswählen"}
            </h3>
            {selectedEvents.length ? (
              <div className="space-y-3">
                {selectedEvents.map((event) => {
                  const assignee = profiles.find((p) => p.id === event.user_id);
                  return (
                    <div
                      key={event.id}
                      className="rounded-xl border border-border p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.all_day
                              ? "Ganztägig"
                              : `${format(new Date(event.start_time), "HH:mm")} – ${format(new Date(event.end_time), "HH:mm")} Uhr`}
                          </p>
                          {assignee && (
                            <p className="mt-1 text-xs text-primary">
                              {assignee.full_name || assignee.email}
                            </p>
                          )}
                          {event.location && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {event.location}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 rounded-lg text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(event.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {selectedDate
                  ? "Keine Termine an diesem Tag"
                  : "Wählen Sie einen Tag im Kalender"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
