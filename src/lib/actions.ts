"use server";

import { revalidatePath } from "next/cache";
import * as db from "@/lib/db";
import type { TaskStatus, TicketStatus } from "@/lib/types";

export async function updateTicketStatus(id: string, status: TicketStatus) {
  await db.patchTicketStatus(id, status);
  revalidatePath("/dashboard/tickets");
  revalidatePath("/dashboard");
}

export async function updateTicket(id: string, formData: FormData) {
  await db.patchTicket(id, formData);
  revalidatePath("/dashboard/tickets");
}

export async function createTask(formData: FormData) {
  await db.insertTask(formData);
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  await db.patchTaskStatus(id, status);
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string) {
  await db.removeTask(id);
  revalidatePath("/dashboard/tasks");
}

export async function createEvent(formData: FormData) {
  await db.insertEvent(formData);
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
}

export async function deleteEvent(id: string) {
  await db.removeEvent(id);
  revalidatePath("/dashboard/calendar");
}
