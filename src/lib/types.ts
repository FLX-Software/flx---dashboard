export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "open" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "manager" | "employee";
  avatar_url: string | null;
  created_at: string;
}

export type TicketSource = "website" | "manual";

export interface SupportTicket {
  id: string;
  ticket_number: number;
  external_ticket_id: string | null;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  customer_email: string | null;
  customer_name: string | null;
  customer_company: string | null;
  customer_phone: string | null;
  source: TicketSource;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  assignee?: Profile | null;
}

export interface WebsiteTicketPayload {
  ticketId: string;
  company: string;
  name: string;
  phone: string;
  email: string;
  description: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  created_by: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  assignee?: Profile | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location: string | null;
  user_id: string;
  created_by: string | null;
  created_at: string;
  assignee?: Profile | null;
}

export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  preview: string;
  read: boolean;
  body?: string;
}
