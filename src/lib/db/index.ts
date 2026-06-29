import "server-only";

import { isSupabaseConfigured } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import * as local from "@/lib/db/local";
import type { TaskPriority, TaskStatus, TicketPriority, TicketStatus, WebsiteTicketPayload } from "@/lib/types";
import { buildWebsiteTicketData } from "@/lib/tickets/website";

export async function fetchProfiles() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("*").order("full_name");
    return data ?? [];
  }
  return local.getProfiles();
}

export async function fetchTickets() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  }
  return local.getTickets();
}

export async function fetchOpenTickets(limit?: number) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .in("status", ["open", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(limit ?? 100);
    return data ?? [];
  }
  return local.getOpenTickets(limit);
}

export async function fetchTasks() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  }
  return local.getTasks();
}

export async function fetchOpenTasks(limit?: number) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .neq("status", "done")
      .order("created_at", { ascending: false })
      .limit(limit ?? 100);
    return data ?? [];
  }
  return local.getOpenTasks(limit);
}

export async function fetchEvents() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .order("start_time", { ascending: true });
    return data ?? [];
  }
  return local.getEvents();
}

export async function fetchUpcomingEvents(limit?: number) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(limit ?? 100);
    return data ?? [];
  }
  return local.getUpcomingEvents(limit);
}

export async function insertTicket(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Nicht angemeldet");

  const assignedTo = formData.get("assigned_to") as string;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("support_tickets").insert({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      customer_email: (formData.get("customer_email") as string) || null,
      customer_name: (formData.get("customer_name") as string) || null,
      priority: (formData.get("priority") as string) || "medium",
      assigned_to: assignedTo === "none" ? null : assignedTo || null,
      created_by: user.id,
    });
    if (error) throw new Error(error.message);
    return;
  }

  await local.createTicketLocal({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    customer_email: (formData.get("customer_email") as string) || null,
    customer_name: (formData.get("customer_name") as string) || null,
    external_ticket_id: null,
    customer_company: null,
    customer_phone: null,
    source: "manual",
    priority: ((formData.get("priority") as string) || "medium") as TicketPriority,
    status: "open",
    assigned_to: assignedTo === "none" ? null : assignedTo || null,
    created_by: user.id,
  });
}

export async function insertWebsiteTicket(payload: WebsiteTicketPayload) {
  const ticketData = buildWebsiteTicketData(payload);

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("support_tickets")
      .select("id")
      .eq("external_ticket_id", payload.ticketId)
      .maybeSingle();

    if (existing) return { created: false, ticketId: payload.ticketId };

    const { error } = await supabase.from("support_tickets").insert(ticketData);
    if (error) throw new Error(error.message);
    return { created: true, ticketId: payload.ticketId };
  }

  const created = await local.createWebsiteTicketLocal(ticketData);
  return { created: !!created, ticketId: payload.ticketId };
}

export async function patchTicketStatus(id: string, status: TicketStatus) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  await local.updateTicketLocal(id, { status });
}

export async function patchTicket(id: string, formData: FormData) {
  const assignedTo = formData.get("assigned_to") as string;
  const payload = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    status: formData.get("status") as TicketStatus,
    priority: formData.get("priority") as TicketPriority,
    assigned_to: assignedTo === "none" ? null : assignedTo || null,
  };

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("support_tickets")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  await local.updateTicketLocal(id, payload);
}

export async function insertTask(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Nicht angemeldet");

  const dueDate = formData.get("due_date") as string;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("tasks").insert({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      priority: (formData.get("priority") as string) || "medium",
      assigned_to: (formData.get("assigned_to") as string) || user.id,
      created_by: user.id,
      due_date: dueDate || null,
    });
    if (error) throw new Error(error.message);
    return;
  }

  await local.createTaskLocal({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    priority: ((formData.get("priority") as string) || "medium") as TaskPriority,
    status: "open",
    assigned_to: (formData.get("assigned_to") as string) || user.id,
    created_by: user.id,
    due_date: dueDate || null,
  });
}

export async function patchTaskStatus(id: string, status: TaskStatus) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  await local.updateTaskLocal(id, { status });
}

export async function removeTask(id: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  await local.deleteTaskLocal(id);
}

export async function insertEvent(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Nicht angemeldet");

  const startDate = formData.get("start_date") as string;
  const startTime = (formData.get("start_time") as string) || "09:00";
  const endTime = (formData.get("end_time") as string) || "10:00";
  const allDay = formData.get("all_day") === "on";
  const userId = (formData.get("user_id") as string) || user.id;

  const start = allDay
    ? new Date(`${startDate}T00:00:00`).toISOString()
    : new Date(`${startDate}T${startTime}:00`).toISOString();
  const end = allDay
    ? new Date(`${startDate}T23:59:59`).toISOString()
    : new Date(`${startDate}T${endTime}:00`).toISOString();

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("calendar_events").insert({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      location: (formData.get("location") as string) || null,
      start_time: start,
      end_time: end,
      all_day: allDay,
      user_id: userId,
      created_by: user.id,
    });
    if (error) throw new Error(error.message);
    return;
  }

  await local.createEventLocal({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    location: (formData.get("location") as string) || null,
    start_time: start,
    end_time: end,
    all_day: allDay,
    user_id: userId,
    created_by: user.id,
  });
}

export async function removeEvent(id: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  await local.deleteEventLocal(id);
}
