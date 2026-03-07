"use client";

import { useEffect, useState, useCallback } from "react";

type Service = { name: string; status: string; latency_ms: number | null };
type LogEntry = { role: string; content: string; ts: string };
type NoteEntry = { text: string; ts: string };
type ScanEntry = { tool: string; target: string; ts: string; output: string };

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: "bg-aria shadow-[0_0_6px_var(--color-aria)]",
    offline: "bg-destructive",
    degraded: "bg-yellow-500",
  };
  return (
    <span className={`inline-block size-2 rounded-full flex-shrink-0 ${colors[status] ?? "bg-muted"}`} />
  );
}

function Card({ title, badge, children }: { title: string; badge?: string | number; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</span>
        {badge !== undefined && (
          <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{badge}</span>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto p-4">{children}</div>
    </div>
  );
}

function Empty({ text = "Keine Daten" }: { text?: string }) {
  return <p className="text-sm italic text-muted-foreground">{text}</p>;
}

export default function MissionControl() {
  const [services, setServices] = useState<Service[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [scans, setScans] = useState<ScanEntry[]>([]);
  const [memory, setMemory] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");
  const [expandedScans, setExpandedScans] = useState<Set<number>>(new Set());

  const refresh = useCallback(async () => {
    const [sRes, lRes, nRes, scRes, mRes] = await Promise.allSettled([
      fetch("/api/aria/dashboard/status").then(r => r.json()),
      fetch("/api/aria/dashboard/logs").then(r => r.json()),
      fetch("/api/aria/dashboard/notes").then(r => r.json()),
      fetch("/api/aria/dashboard/scans").then(r => r.json()),
      fetch("/api/aria/dashboard/memory").then(r => r.json()),
    ]);
    if (sRes.status === "fulfilled") setServices(sRes.value.services ?? []);
    if (lRes.status === "fulfilled") setLogs([...(lRes.value.logs ?? [])].reverse());
    if (nRes.status === "fulfilled") setNotes([...(nRes.value.notes ?? [])].reverse());
    if (scRes.status === "fulfilled") setScans([...(scRes.value.scans ?? [])].reverse());
    if (mRes.status === "fulfilled") setMemory(mRes.value.memory ?? "");
    setLastUpdate(new Date().toLocaleTimeString("de-CH"));
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  const online = services.filter(s => s.status === "online").length;

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-lg font-semibold text-aria">⚡ Mission Control</h1>
        {lastUpdate && (
          <span className="text-xs text-muted-foreground">Aktualisiert: {lastUpdate}</span>
        )}
      </div>

      {/* Services – full width */}
      <Card title="Services" badge={services.length ? `${online}/${services.length}` : undefined}>
        {services.length === 0 ? <Empty text="Lade..." /> : (
          <div className="flex flex-wrap gap-2">
            {services.map(s => (
              <div key={s.name} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm">
                <StatusDot status={s.status} />
                <span>{s.name}</span>
                {s.latency_ms != null && (
                  <span className="ml-auto text-xs text-muted-foreground">{s.latency_ms}ms</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Bot Aktivität */}
        <Card title="Bot Aktivität" badge={logs.length}>
          {logs.length === 0 ? <Empty text="Keine Einträge" /> : (
            <div className="space-y-3">
              {logs.map((l, i) => (
                <div key={i} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <div className="mb-1 flex gap-2 text-[11px] text-muted-foreground">
                    <span className={l.role === "user" ? "text-blue-400" : "text-aria"}>{l.role.toUpperCase()}</span>
                    <span>·</span>
                    <span>{l.ts}</span>
                  </div>
                  <p className="text-sm leading-snug">
                    {l.content.length > 200 ? l.content.slice(0, 200) + "…" : l.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Security Scans */}
        <Card title="Security Scans" badge={scans.length}>
          {scans.length === 0 ? <Empty text="Noch keine Scans" /> : (
            <div className="space-y-3">
              {scans.map((s, i) => (
                <div key={i} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <div className="mb-1 text-[11px] text-muted-foreground">
                    <span className="mr-1 rounded border border-border/60 bg-muted px-1.5 py-0.5 text-aria">{s.tool}</span>
                    {s.target} · {s.ts}
                  </div>
                  <pre
                    className={`cursor-pointer overflow-hidden font-mono text-[11px] text-muted-foreground ${expandedScans.has(i) ? "" : "max-h-16"}`}
                    onClick={() => setExpandedScans(prev => {
                      const next = new Set(prev);
                      next.has(i) ? next.delete(i) : next.add(i);
                      return next;
                    })}
                  >{s.output}</pre>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Notizen */}
        <Card title="Notizen" badge={notes.length}>
          {notes.length === 0 ? <Empty text="Keine Notizen" /> : (
            <div className="space-y-2">
              {notes.map((n, i) => (
                <div key={i} className="flex gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0">
                  <span className="shrink-0 text-[11px] text-muted-foreground pt-0.5">{n.ts}</span>
                  <span className="text-sm">{n.text}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* System Memory */}
        <Card title="System Memory">
          {memory ? (
            <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed">{memory}</pre>
          ) : <Empty text="Lade..." />}
        </Card>
      </div>
    </div>
  );
}
