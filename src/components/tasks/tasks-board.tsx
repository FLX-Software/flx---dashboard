"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTask, updateTaskStatus, deleteTask } from "@/lib/actions";
import type { Profile, Task, TaskStatus } from "@/lib/types";

const columns: { status: TaskStatus; label: string }[] = [
  { status: "open", label: "Offen" },
  { status: "in_progress", label: "In Bearbeitung" },
  { status: "done", label: "Erledigt" },
];

export function TasksBoard({
  tasks,
  profiles,
  currentUserId,
}: {
  tasks: Task[];
  profiles: Profile[];
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);

  function handleStatusChange(id: string, status: TaskStatus) {
    startTransition(async () => {
      try {
        await updateTaskStatus(id, status);
        toast.success("Status aktualisiert");
      } catch {
        toast.error("Fehler beim Aktualisieren");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteTask(id);
        toast.success("Aufgabe gelöscht");
      } catch {
        toast.error("Fehler beim Löschen");
      }
    });
  }

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      try {
        await createTask(formData);
        toast.success("Aufgabe erstellt");
        setCreateOpen(false);
      } catch {
        toast.error("Fehler beim Erstellen");
      }
    });
  }

  return (
    <div>
      <PageHeader
        title="FLX Aufgaben"
        description="To-Do-Liste für das Team verwalten"
      >
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2">
              <Plus className="h-4 w-4" />
              Neue Aufgabe
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Neue Aufgabe</DialogTitle>
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
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priorität</Label>
                  <select
                    id="priority"
                    name="priority"
                    defaultValue="medium"
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="low">Niedrig</option>
                    <option value="medium">Mittel</option>
                    <option value="high">Hoch</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Fällig am</Label>
                  <Input
                    id="due_date"
                    name="due_date"
                    type="date"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Zugewiesen an</Label>
                <select
                  id="assigned_to"
                  name="assigned_to"
                  defaultValue={currentUserId}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || p.email}
                    </option>
                  ))}
                </select>
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

      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => (
          <div key={col.status} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <span className="rounded-lg bg-muted px-2 py-0.5 text-xs">
                {tasks.filter((t) => t.status === col.status).length}
              </span>
            </div>
            <div className="space-y-3">
              {tasks
                .filter((t) => t.status === col.status)
                .map((task) => (
                  <Card key={task.id} className="rounded-xl">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <StatusBadge status={task.priority} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(task.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                      {task.due_date && (
                        <p className="mt-2 text-[10px] text-muted-foreground">
                          Fällig:{" "}
                          {format(new Date(task.due_date), "dd. MMM yyyy", {
                            locale: de,
                          })}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {col.status !== "open" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 rounded-lg text-xs"
                            onClick={() =>
                              handleStatusChange(task.id, "open")
                            }
                            disabled={isPending}
                          >
                            Offen
                          </Button>
                        )}
                        {col.status !== "in_progress" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 rounded-lg text-xs"
                            onClick={() =>
                              handleStatusChange(task.id, "in_progress")
                            }
                            disabled={isPending}
                          >
                            Bearbeiten
                          </Button>
                        )}
                        {col.status !== "done" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 rounded-lg text-xs"
                            onClick={() =>
                              handleStatusChange(task.id, "done")
                            }
                            disabled={isPending}
                          >
                            Erledigt
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {!tasks.filter((t) => t.status === col.status).length && (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  Keine Aufgaben
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
