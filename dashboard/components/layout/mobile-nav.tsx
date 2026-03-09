"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsOwner } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Scissors, Calendar, Users, Package, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/clienti", label: "Clienti", icon: Users },
  { href: "/barbieri", label: "Barbieri", icon: Scissors, ownerOnly: true },
  { href: "/servizi", label: "Servizi", icon: Package, ownerOnly: true },
  { href: "/impostazioni", label: "Impostazioni", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isOwner = useIsOwner();

  const items = NAV_ITEMS.filter((item) => !item.ownerOnly || isOwner);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="lg:hidden" />}
      >
        <Menu className="w-5 h-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-56 p-0 bg-card border-border/50">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border/50">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <Scissors className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">BarberX</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
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
      </SheetContent>
    </Sheet>
  );
}
