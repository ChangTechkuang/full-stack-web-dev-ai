"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, PlusCircle, Workflow } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { cn } from "@/shared/lib/cn";
import { useAuth } from "@/features/auth/context";

const navItems = [
  { href: "/dashboard", label: "Requests" },
  { href: "/requests/new", label: "New Request" },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-border-default bg-bg-base/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-text-primary">
            <Workflow className="size-5 text-brand" />
            <span>TaskFlow</span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-bg-subtle text-text-primary"
                      : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/requests/new" className="md:hidden">
            <Button size="icon" variant="ghost" aria-label="New request">
              <PlusCircle className="size-4" />
            </Button>
          </Link>
          <ThemeToggle />
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <div className="text-right">
                <div className="text-sm font-medium text-text-primary">{user.fullName}</div>
                <div className="text-xs text-text-secondary">{user.role}</div>
              </div>
            </div>
          ) : null}
          <Button variant="ghost" size="icon" onClick={() => void logout()} aria-label="Sign out">
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
