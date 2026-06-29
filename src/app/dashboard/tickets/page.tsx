import { TicketsBoard } from "@/components/tickets/tickets-board";
import { fetchProfiles, fetchTickets } from "@/lib/db";

export default async function TicketsPage() {
  const [allTickets, profiles] = await Promise.all([
    fetchTickets(),
    fetchProfiles(),
  ]);

  const tickets = allTickets.filter((t) => t.source === "website");

  return <TicketsBoard tickets={tickets} profiles={profiles} />;
}
