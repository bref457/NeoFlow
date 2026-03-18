"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FolderKanban, LayoutDashboard, NotebookPen, Trash2, MonitorDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AppNavProps = {
  className?: string;
  onNavigate?: () => void;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Kalender", icon: CalendarDays },
  { href: "/notes", label: "Inbox", icon: NotebookPen },
  { href: "/projects", label: "Projekte", icon: FolderKanban },
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
      <Button asChild variant={pathname === "/mission-control" ? "secondary" : "ghost"} className="justify-start">
        <Link href="/mission-control" onClick={onNavigate}>
          <MonitorDot className="size-4" />
          Mission Control
        </Link>
      </Button>

      <Separator className="my-3" />

      {navItems.map((item) => (
        <NavButton key={item.href} {...item} />
      ))}
    </nav>
  );
}
