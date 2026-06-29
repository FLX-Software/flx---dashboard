"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CheckSquare,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Mail,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Übersicht", icon: LayoutDashboard },
  { href: "/dashboard/emails", label: "E-Mails", icon: Mail },
  { href: "/dashboard/tickets", label: "Support", icon: LifeBuoy },
  { href: "/dashboard/calendar", label: "Kalender", icon: Calendar },
  { href: "/dashboard/tasks", label: "Aufgaben", icon: CheckSquare },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-card">
        <div className="flex items-center justify-center border-b border-border px-6 py-8">
          <Image
            src="/flx-logo.png"
            alt="FLX Software"
            width={200}
            height={100}
            priority
            className="h-auto w-full max-w-[200px] object-contain"
          />
        </div>

        <div className="flex flex-1 flex-col justify-between p-4">
          <NavLinks />

          <div className="space-y-3 border-t border-border pt-4">
            {userEmail && (
              <p className="truncate px-3 text-xs text-muted-foreground">
                {userEmail}
              </p>
            )}
            <div className="flex items-center gap-2 px-1">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start gap-2 rounded-xl text-muted-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Image
          src="/flx-logo.png"
          alt="FLX Software"
          width={120}
          height={48}
          className="h-10 w-auto object-contain"
        />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 rounded-r-2xl">
              <div className="mb-6 flex justify-center pt-2">
                <Image
                  src="/flx-logo.png"
                  alt="FLX Software"
                  width={160}
                  height={80}
                  className="h-auto w-full max-w-[160px] object-contain"
                />
              </div>
              <div className="mt-2">
                <NavLinks />
              </div>
              <div className="absolute bottom-6 left-4 right-4">
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-xl"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Abmelden
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
