import Link from "next/link";
import {
  Calendar,
  CheckSquare,
  LifeBuoy,
  Mail,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCurrentUser } from "@/lib/auth/get-user";
import {
  fetchOpenTickets,
  fetchOpenTasks,
  fetchUpcomingEvents,
} from "@/lib/db";
import { fetchEmails } from "@/lib/email";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [allTickets, tasks, events, emailData] = await Promise.all([
    fetchOpenTickets(5),
    fetchOpenTasks(5),
    fetchUpcomingEvents(5),
    fetchEmails(),
  ]);

  const tickets = allTickets.filter((t) => t.source === "website");

  const openTickets = tickets.length;
  const openTasks = tasks.length;
  const upcomingEvents = events.length;
  const unreadEmails = emailData.emails.filter((e) => !e.read).length;

  const stats = [
    {
      label: "Offene Tickets",
      value: openTickets,
      icon: LifeBuoy,
      href: "/dashboard/tickets",
      color: "text-primary",
    },
    {
      label: "Offene Aufgaben",
      value: openTasks,
      icon: CheckSquare,
      href: "/dashboard/tasks",
      color: "text-amber-500",
    },
    {
      label: "Termine",
      value: upcomingEvents,
      icon: Calendar,
      href: "/dashboard/calendar",
      color: "text-emerald-500",
    },
    {
      label: "Ungelesene E-Mails",
      value: unreadEmails,
      icon: Mail,
      href: "/dashboard/emails",
      color: "text-blue-500",
    },
  ];

  return (
    <div>
      <PageHeader
        title="FLX Übersicht"
        description={`Willkommen zurück${user?.email ? `, ${user.email.split("@")[0]}` : ""}. Hier ist Ihr aktueller Überblick.`}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="rounded-2xl transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Aktuelle Tickets</CardTitle>
            <Link
              href="/dashboard/tickets"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Alle <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.length ? (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-xl border border-border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {ticket.external_ticket_id || `#${ticket.ticket_number}`}{" "}
                      {ticket.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ticket.created_at), "dd. MMM yyyy", {
                        locale: de,
                      })}
                    </p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Keine offenen Tickets
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Anstehende Termine</CardTitle>
            <Link
              href="/dashboard/calendar"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Kalender <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.length ? (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-xl border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(
                        new Date(event.start_time),
                        "EEEE, dd. MMM · HH:mm",
                        { locale: de }
                      )}
                      {" Uhr"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Keine anstehenden Termine
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
