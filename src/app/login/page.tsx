"use client";

import { useActionState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { loginAction, type LoginState } from "@/lib/auth/login-action";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.error) {
      toast.error("Anmeldung fehlgeschlagen", { description: state.error });
    }
  }, [state.error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

      <Card className="relative z-10 w-full max-w-md rounded-2xl border-border/50 shadow-2xl shadow-primary/10">
        <CardHeader className="space-y-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/flx-logo.png"
              alt="FLX Software"
              width={280}
              height={140}
              priority
              className="h-auto w-56 object-contain sm:w-64 md:w-72"
            />
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-foreground sm:text-base">
              Dashboard
            </p>
          </div>
          <CardDescription>
            Melden Sie sich an, um auf das interne Dashboard zuzugreifen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@flx-software.de"
                autoComplete="email"
                required
                disabled={pending}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={pending}
                className="rounded-xl"
              />
            </div>
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Button
              type="submit"
              className="w-full rounded-xl"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Anmelden...
                </>
              ) : (
                "Anmelden"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
