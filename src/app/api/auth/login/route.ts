import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { validateLocalCredentials } from "@/lib/auth/users";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-Mail und Passwort erforderlich" },
      { status: 400 }
    );
  }

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: true });
  }

  const user = validateLocalCredentials(email, password);
  if (!user) {
    return NextResponse.json(
      { error: "Ungültige E-Mail oder Passwort" },
      { status: 401 }
    );
  }

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
