"use client";

import { useEffect, useState, useCallback } from "react";


type Service = { name: string; status: string; latency_ms: number | null };
type Container = { name: string; status: string; uptime: string; image: string };
type SystemStats = {
  ram: { total_mb: number; used_mb: number; percent: number };
  disk: { total: string; used: string; free: string; percent: string };
};

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: "bg-aria shadow-[0_0_6px_var(--color-aria)]",
    running: "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]",
    offline: "bg-destructive",
    stopped: "bg-muted-foreground",
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

function ProgressBar({ percent, color = "bg-aria" }: { percent: number; color?: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  );
}

export default function MissionControl() {
  const [services, setServices] = useState<Service[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [system, setSystem] = useState<SystemStats | null>(null);
  const [lastUpdate, setLastUpdate] = useState("");
  const refresh = useCallback(async () => {
    const [sRes, dRes, syRes] = await Promise.allSettled([
      fetch("/api/aria/dashboard/status").then(r => r.json()),
      fetch("/api/aria/dashboard/docker").then(r => r.json()),
      fetch("/api/aria/dashboard/system").then(r => r.json()),
    ]);
    if (sRes.status === "fulfilled") setServices(sRes.value.services ?? []);
    if (dRes.status === "fulfilled") setContainers(dRes.value.containers ?? []);
    if (syRes.status === "fulfilled") setSystem(syRes.value);
    setLastUpdate(new Date().toLocaleTimeString("de-CH"));
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  const online = services.filter(s => s.status === "online").length;
  const running = containers.filter(c => c.status === "running").length;

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-lg font-semibold text-aria">⚡ Mission Control</h1>
        {lastUpdate && (
          <span className="text-xs text-muted-foreground">Aktualisiert: {lastUpdate}</span>
        )}
      </div>

      {/* VPS System Stats */}
      {system && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border/60 bg-card/50 p-3 space-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">RAM</p>
            <p className="text-lg font-semibold">{system.ram.percent}%</p>
            <ProgressBar percent={system.ram.percent} color={system.ram.percent > 80 ? "bg-red-500" : "bg-aria"} />
            <p className="text-[11px] text-muted-foreground">{system.ram.used_mb} / {system.ram.total_mb} MB</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/50 p-3 space-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Disk</p>
            <p className="text-lg font-semibold">{system.disk.percent}</p>
            <ProgressBar percent={parseFloat(system.disk.percent)} color={parseFloat(system.disk.percent) > 80 ? "bg-red-500" : "bg-aria"} />
            <p className="text-[11px] text-muted-foreground">{system.disk.used} / {system.disk.total}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/50 p-3 space-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Container</p>
            <p className="text-lg font-semibold">{running}<span className="text-sm text-muted-foreground">/{containers.length}</span></p>
            <ProgressBar percent={containers.length ? running / containers.length * 100 : 0} color="bg-green-500" />
            <p className="text-[11px] text-muted-foreground">{running} running</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/50 p-3 space-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Services</p>
            <p className="text-lg font-semibold">{online}<span className="text-sm text-muted-foreground">/{services.length}</span></p>
            <ProgressBar percent={services.length ? online / services.length * 100 : 0} color="bg-aria" />
            <p className="text-[11px] text-muted-foreground">{online} online</p>
          </div>
        </div>
      )}

      {/* Services */}
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

      {/* Docker Container */}
      <Card title="Docker Container" badge={containers.length ? `${running}/${containers.length}` : undefined}>
        {containers.length === 0 ? <Empty text="Lade..." /> : (
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {containers.map(c => (
              <div key={c.name} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm">
                <StatusDot status={c.status} />
                <span className="font-mono text-xs">{c.name}</span>
                <span className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded ${c.status === "running" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
