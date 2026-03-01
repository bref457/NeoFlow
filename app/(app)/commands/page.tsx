"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

type Section = {
  title: string;
  items: { label: string; cmd: string; note?: string }[];
};

const sections: Section[] = [
  {
    title: "SSH Verbindungen",
    items: [
      { label: "VPS verbinden", cmd: "ssh -i ~/.ssh/aria_vps root@162.55.209.62" },
      { label: "Pi verbinden (lokal)", cmd: "ssh -i ~/.ssh/piclaw neo@192.168.1.221" },
      {
        label: "n8n Tunnel (von überall)",
        cmd: "ssh -i ~/.ssh/aria_vps -L 5678:10.0.0.3:5678 root@162.55.209.62",
        note: "Dann http://localhost:5678 öffnen",
      },
    ],
  },
  {
    title: "VPS Docker",
    items: [
      { label: "Bot Logs", cmd: "cd /opt/aria && docker compose logs -f aria-bot" },
      { label: "API Logs", cmd: "cd /opt/aria && docker compose logs -f aria-api" },
      { label: "Alle Dienste neustarten", cmd: "cd /opt/aria && docker compose restart" },
      {
        label: "Bot nach Code-Änderung deployen",
        cmd: "cd /opt/aria && docker compose build aria-bot && docker compose up -d aria-bot",
      },
    ],
  },
  {
    title: "Claude Code",
    items: [
      { label: "Nutzung & Limits anzeigen", cmd: "npx ccusage" },
    ],
  },
  {
    title: "Telegram Bot Commands",
    items: [
      { label: "Direkte Nachricht", cmd: "<text>", note: "Chat mit ARIA (LLM + Gesprächsgedächtnis)" },
      { label: "LLM-Frage", cmd: "/ask <frage>" },
      { label: "Web-Suche + LLM", cmd: "/web <frage>" },
      { label: "Wetter", cmd: "/weather [Ort]", note: "Standard: Schaffhausen" },
      { label: "Notiz speichern", cmd: "/note <Text>" },
      { label: "Notizen anzeigen", cmd: "/notes" },
      { label: "Morning Report auslösen", cmd: "/morning" },
      { label: "Aktuelle KI-News", cmd: "/kinews", note: "SearXNG-Suche + LLM-Zusammenfassung" },
      { label: "Webseite analysieren", cmd: "/scrape <URL>" },
      { label: "Letzte 5 Einträge", cmd: "/history" },
      { label: "Gesprächshistorie löschen", cmd: "/clear" },
      { label: "Dienststatus", cmd: "/status" },
      { label: "OSINT-Abfrage", cmd: "/osint <Domain>" },
      { label: "Alle Commands", cmd: "/start" },
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      className="ml-2 shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
      aria-label="Kopieren"
    >
      {copied ? <Check className="size-3.5 text-aria" /> : <Copy className="size-3.5" />}
    </button>
  );
}

export default function CommandsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Commands</h1>
        <p className="text-sm text-muted-foreground">SSH, Docker, Claude Code & Telegram Referenz.</p>
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          <div className="mb-3 flex items-center gap-2">
            <Terminal className="size-4 text-aria" />
            <h2 className="text-sm font-semibold text-aria">{section.title}</h2>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/30 divide-y divide-border/40">
            {section.items.map((item) => (
              <div key={item.cmd} className="group flex items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <div className="flex items-center">
                    <code className={cn(
                      "text-sm font-mono break-all",
                      item.cmd.startsWith("<") ? "text-muted-foreground italic" : "text-foreground"
                    )}>
                      {item.cmd}
                    </code>
                    {!item.cmd.startsWith("<") && <CopyButton text={item.cmd} />}
                  </div>
                  {item.note && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{item.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
