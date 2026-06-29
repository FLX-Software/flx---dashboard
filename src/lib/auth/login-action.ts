"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/config";
import { validateLocalCredentials } from "@/lib/auth/users";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "E-Mail und Passwort erforderlich" };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { error: error.message };
    }
    redirect("/dashboard");
  }

  const user = validateLocalCredentials(email, password);
  if (!user) {
    return { error: "Ungültige E-Mail oder Passwort" };
  }

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/dashboard");
}
