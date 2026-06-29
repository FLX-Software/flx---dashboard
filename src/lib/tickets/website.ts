import type { WebsiteTicketPayload } from "@/lib/types";

export function buildWebsiteTicketData(payload: WebsiteTicketPayload) {
  const fullDescription = [
    payload.description,
    payload.phone ? `Telefon: ${payload.phone}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    external_ticket_id: payload.ticketId,
    title: `[${payload.ticketId}] Support – ${payload.company}`,
    description: fullDescription,
    status: "open" as const,
    priority: "medium" as const,
    customer_email: payload.email,
    customer_name: payload.name,
    customer_company: payload.company,
    customer_phone: payload.phone,
    source: "website" as const,
    assigned_to: null,
    created_by: null,
  };
}
