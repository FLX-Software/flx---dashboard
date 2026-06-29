import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
