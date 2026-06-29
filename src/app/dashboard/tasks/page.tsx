import { TasksBoard } from "@/components/tasks/tasks-board";
import { getCurrentUser } from "@/lib/auth/get-user";
import { fetchProfiles, fetchTasks } from "@/lib/db";

export default async function TasksPage() {
  const user = await getCurrentUser();

  const [tasks, profiles] = await Promise.all([
    fetchTasks(),
    fetchProfiles(),
  ]);

  return (
    <TasksBoard
      tasks={tasks}
      profiles={profiles}
      currentUserId={user?.id || ""}
    />
  );
}
