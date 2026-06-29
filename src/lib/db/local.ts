import "server-only";

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getLocalProfiles } from "@/lib/auth/users";
import type {
  CalendarEvent,
  Profile,
  SupportTicket,
  Task,
  TaskStatus,
  TicketStatus,
} from "@/lib/types";

interface LocalDatabase {
  ticketCounter: number;
  profiles: Profile[];
  support_tickets: SupportTicket[];
  tasks: Task[];
  calendar_events: CalendarEvent[];
}

const DB_PATH = path.join(process.cwd(), "data", "dashboard.json");

async function ensureDb(): Promise<LocalDatabase> {
  try {
    const raw = await readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as LocalDatabase;
  } catch {
    const initial: LocalDatabase = {
      ticketCounter: 0,
      profiles: getLocalProfiles(),
      support_tickets: [],
      tasks: [],
      calendar_events: [],
    };
    await mkdir(path.dirname(DB_PATH), { recursive: true });
    await writeFile(DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}

async function saveDb(db: LocalDatabase) {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export async function getProfiles(): Promise<Profile[]> {
  const db = await ensureDb();
  return db.profiles;
}

export async function getTickets(): Promise<SupportTicket[]> {
  const db = await ensureDb();
  return [...db.support_tickets]
    .map(normalizeTicket)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

function normalizeTicket(ticket: SupportTicket): SupportTicket {
  return {
    ...ticket,
    external_ticket_id: ticket.external_ticket_id ?? null,
    customer_company: ticket.customer_company ?? null,
    customer_phone: ticket.customer_phone ?? null,
    source: ticket.source ?? "manual",
  };
}

export async function ticketExistsByExternalId(
  externalId: string
): Promise<boolean> {
  const db = await ensureDb();
  return db.support_tickets.some(
    (t) => t.external_ticket_id === externalId
  );
}

export async function createWebsiteTicketLocal(
  data: Omit<
    SupportTicket,
    "id" | "ticket_number" | "created_at" | "updated_at"
  >
) {
  if (data.external_ticket_id) {
    const exists = await ticketExistsByExternalId(data.external_ticket_id);
    if (exists) return null;
  }
  return createTicketLocal(data);
}

export async function getOpenTickets(limit?: number): Promise<SupportTicket[]> {
  const tickets = (await getTickets()).filter((t) =>
    ["open", "in_progress"].includes(t.status)
  );
  return limit ? tickets.slice(0, limit) : tickets;
}

export async function createTicketLocal(
  data: Omit<
    SupportTicket,
    "id" | "ticket_number" | "created_at" | "updated_at"
  >
) {
  const db = await ensureDb();
  db.ticketCounter += 1;
  const now = new Date().toISOString();
  const ticket: SupportTicket = {
    id: randomUUID(),
    ticket_number: db.ticketCounter,
    created_at: now,
    updated_at: now,
    ...data,
  };
  db.support_tickets.push(ticket);
  await saveDb(db);
  return ticket;
}

export async function updateTicketLocal(
  id: string,
  data: Partial<SupportTicket>
) {
  const db = await ensureDb();
  const index = db.support_tickets.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Ticket nicht gefunden");
  db.support_tickets[index] = {
    ...db.support_tickets[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  await saveDb(db);
}

export async function getTasks(): Promise<Task[]> {
  const db = await ensureDb();
  return [...db.tasks].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getOpenTasks(limit?: number): Promise<Task[]> {
  const tasks = (await getTasks()).filter((t) => t.status !== "done");
  return limit ? tasks.slice(0, limit) : tasks;
}

export async function createTaskLocal(
  data: Omit<Task, "id" | "created_at" | "updated_at">
) {
  const db = await ensureDb();
  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    created_at: now,
    updated_at: now,
    ...data,
  };
  db.tasks.push(task);
  await saveDb(db);
  return task;
}

export async function updateTaskLocal(id: string, data: Partial<Task>) {
  const db = await ensureDb();
  const index = db.tasks.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Aufgabe nicht gefunden");
  db.tasks[index] = {
    ...db.tasks[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  await saveDb(db);
}

export async function deleteTaskLocal(id: string) {
  const db = await ensureDb();
  db.tasks = db.tasks.filter((t) => t.id !== id);
  await saveDb(db);
}

export async function getEvents(): Promise<CalendarEvent[]> {
  const db = await ensureDb();
  return [...db.calendar_events].sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
}

export async function getUpcomingEvents(limit?: number): Promise<CalendarEvent[]> {
  const now = new Date().toISOString();
  const events = (await getEvents()).filter((e) => e.start_time >= now);
  return limit ? events.slice(0, limit) : events;
}

export async function createEventLocal(
  data: Omit<CalendarEvent, "id" | "created_at">
) {
  const db = await ensureDb();
  const event: CalendarEvent = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    ...data,
  };
  db.calendar_events.push(event);
  await saveDb(db);
  return event;
}

export async function deleteEventLocal(id: string) {
  const db = await ensureDb();
  db.calendar_events = db.calendar_events.filter((e) => e.id !== id);
  await saveDb(db);
}

export type { TicketStatus, TaskStatus };
