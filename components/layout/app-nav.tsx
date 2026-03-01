"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bot, CalendarDays, FolderKanban, LayoutDashboard, NotebookPen, Terminal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AppNavProps = {
  className?: string;
  onNavigate?: () => void;
};

const ariaItems = [
  { href: "/chat", label: "ARIA Chat", icon: Bot },
  { href: "/status", label: "Service Status", icon: Activity },
  { href: "/commands", label: "Commands", icon: Terminal },
];

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/trash", label: "Papierkorb", icon: Trash2 },
];

export function AppNav({ className, onNavigate }: AppNavProps) {
  const pathname = usePathname();

  function NavButton({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Button
        asChild
        variant={isActive ? "secondary" : "ghost"}
        className={cn("justify-start", isActive && "font-medium")}
      >
        <Link href={href} onClick={onNavigate}>
          <Icon className="size-4" />
          {label}
        </Link>
      </Button>
    );
  }

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Hauptnavigation">
      <p className="px-2 pb-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-aria">
        ARIA
      </p>
      {ariaItems.map((item) => (
        <NavButton key={item.href} {...item} />
      ))}

      <Separator className="my-3" />

      {navItems.map((item) => (
        <NavButton key={item.href} {...item} />
      ))}
    </nav>
  );
}
