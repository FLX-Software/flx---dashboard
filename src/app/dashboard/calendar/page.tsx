import { CalendarView } from "@/components/calendar/calendar-view";
import { getCurrentUser } from "@/lib/auth/get-user";
import { fetchEvents, fetchProfiles } from "@/lib/db";

export default async function CalendarPage() {
  const user = await getCurrentUser();

  const [events, profiles] = await Promise.all([
    fetchEvents(),
    fetchProfiles(),
  ]);

  return (
    <CalendarView
      events={events}
      profiles={profiles}
      currentUserId={user?.id || ""}
    />
  );
}
