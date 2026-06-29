import "server-only";

import { isSupabaseConfigured } from "@/lib/config";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return { id: user.id, email: user.email ?? "" };
  }

  const session = await getSessionUser();
  if (!session) return null;
  return {
    id: session.id,
    email: session.email,
    full_name: session.full_name,
  };
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Nicht angemeldet");
  return user;
}
