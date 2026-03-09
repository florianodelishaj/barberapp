"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsOwner } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Users,
  Scissors,
  Package,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/clienti", label: "Clienti", icon: Users },
  { href: "/barbieri", label: "Barbieri", icon: Scissors, ownerOnly: true },
  { href: "/servizi", label: "Servizi", icon: Package, ownerOnly: true },
  { href: "/impostazioni", label: "Impostazioni", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const isOwner = useIsOwner();

  const items = NAV_ITEMS.filter((item) => !item.ownerOnly || isOwner);

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-card border-r border-border/50 px-3 py-4">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 mb-6">
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Scissors className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm text-foreground">BarberX</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
