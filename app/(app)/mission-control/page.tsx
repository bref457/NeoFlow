"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Server, HardDrive, Container, Activity, BrainCircuit } from "lucide-react";

type Service = { name: string; status: string; latency_ms: number | null };
type ContainerItem = { name: string; status: string; uptime: string; image: string };
type SystemStats = {
  ram: { total_mb: number; used_mb: number; percent: number };
  disk: { total: string; used: string; free: string; percent: string };
};
type ClaudeUsage = {
  sessions: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
  models: Record<string, number>;
  sessions_by_day: Record<string, number>;
};

// ─── STATUS DOT ─────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: "bg-aria shadow-[0_0_6px_var(--color-aria)]",
    running: "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]",
    offline: "bg-destructive",
    stopped: "bg-muted-foreground",
    degraded: "bg-yellow-500",
  };
  return <span className={`inline-block size-2 rounded-full flex-shrink-0 ${colors[status] ?? "bg-muted"}`} />;
}

// ─── KPI CARD ────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, display, sub, percent, icon: Icon, index,
}: {
  label: string;
  value: number;
  display: string;
  sub: string;
  percent: number;
  icon: React.ElementType;
  index: number;
}) {
  const color = percent >= 80 ? "bg-red-500" : percent >= 60 ? "bg-yellow-500" : "bg-aria";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 30 }}
      className="relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur hover:border-aria/30 transition-colors duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-aria/5 to-transparent pointer-events-none" />
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground">{display}</span>
              <span className="text-xs text-muted-foreground">{sub}</span>
            </div>
          </div>
          <motion.div
            className="flex size-10 items-center justify-center rounded-xl border border-aria/20 bg-aria/10"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Icon className="size-5 text-aria" />
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Usage</span>
            <span className="font-mono font-medium">{percent.toFixed(1)}%</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-muted/50 overflow-hidden border border-border/30">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full ${color}`}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 20, delay: index * 0.08 + 0.3 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="flex items-end gap-0.5 h-5 pt-1 border-t border-border/30">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t"
              style={{ backgroundColor: `rgba(74,222,128,${0.15 + Math.random() * 0.35})` }}
              initial={{ height: 0 }}
              animate={{ height: `${20 + Math.random() * 80}%` }}
              transition={{ delay: index * 0.08 + i * 0.03, type: "spring", stiffness: 300, damping: 25 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── SECTION CARD ────────────────────────────────────────────────────────────
function SectionCard({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-border/60 bg-card/50 backdrop-blur overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-2.5">
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-foreground/60">{title}</span>
        {badge && (
          <span className="rounded-full border border-aria/20 bg-aria/10 px-2 py-0.5 font-mono text-[11px] text-aria">{badge}</span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </motion.div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function MissionControl() {
  const [services, setServices] = useState<Service[]>([]);
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [system, setSystem] = useState<SystemStats | null>(null);
  const [claudeUsage, setClaudeUsage] = useState<ClaudeUsage | null>(null);
  const [lastUpdate, setLastUpdate] = useState("");

  const refresh = useCallback(async () => {
    const [sRes, dRes, syRes, cuRes] = await Promise.allSettled([
      fetch("/api/aria/dashboard/status").then(r => r.json()),
      fetch("/api/aria/dashboard/docker").then(r => r.json()),
      fetch("/api/aria/dashboard/system").then(r => r.json()),
      fetch("/api/aria/dashboard/claude-usage").then(r => r.json()),
    ]);
    if (sRes.status === "fulfilled") setServices(sRes.value.services ?? []);
    if (dRes.status === "fulfilled") setContainers(dRes.value.containers ?? []);
    if (syRes.status === "fulfilled") setSystem(syRes.value);
    if (cuRes.status === "fulfilled") setClaudeUsage(cuRes.value);
    setLastUpdate(new Date().toLocaleTimeString("de-CH"));
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  const online = services.filter(s => s.status === "online").length;
  const running = containers.filter(c => c.status === "running").length;
  const diskPercent = system ? parseFloat(system.disk.percent) : 0;

  return (
    <div className="space-y-5 p-4 sm:p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="size-2.5 rounded-full bg-aria"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <h1 className="font-mono text-base font-bold text-foreground">Mission Control</h1>
        </div>
        {lastUpdate && (
          <span className="font-mono text-[11px] text-muted-foreground">
            Aktualisiert: {lastUpdate}
          </span>
        )}
      </div>

      {/* Claude Usage */}
      {claudeUsage && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl border border-aria/20 bg-aria/5 backdrop-blur overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-aria/20 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <BrainCircuit className="size-3.5 text-aria" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-aria">Claude Code Usage (VPS)</span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              ~${claudeUsage.estimated_cost_usd.toFixed(4)} USD heute
            </span>
          </div>
          <div className="grid grid-cols-2 gap-px sm:grid-cols-4 bg-aria/10">
            {[
              { label: "Sessions", value: claudeUsage.sessions },
              { label: "Input Tokens", value: claudeUsage.input_tokens.toLocaleString() },
              { label: "Output Tokens", value: claudeUsage.output_tokens.toLocaleString() },
              { label: "Total Tokens", value: claudeUsage.total_tokens.toLocaleString() },
            ].map((item) => (
              <div key={item.label} className="bg-card/50 px-4 py-3 space-y-0.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{item.label}</p>
                <p className="font-mono text-lg font-bold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
          {Object.keys(claudeUsage.sessions_by_day).length > 0 && (
            <div className="px-4 py-2.5 flex items-center gap-4 flex-wrap">
              {Object.entries(claudeUsage.sessions_by_day).map(([day, count]) => (
                <span key={day} className="font-mono text-[10px] text-muted-foreground">
                  {day}: <span className="text-aria font-semibold">{count} sessions</span>
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {system && (
          <>
            <KpiCard
              index={0} label="RAM" icon={Activity}
              value={system.ram.percent} display={`${system.ram.percent}%`}
              sub={`${system.ram.used_mb}/${system.ram.total_mb} MB`}
              percent={system.ram.percent}
            />
            <KpiCard
              index={1} label="Disk" icon={HardDrive}
              value={diskPercent} display={system.disk.percent}
              sub={`${system.disk.used} / ${system.disk.total}`}
              percent={diskPercent}
            />
          </>
        )}
        <KpiCard
          index={2} label="Container" icon={Container}
          value={running} display={`${running}/${containers.length}`}
          sub="running"
          percent={containers.length ? (running / containers.length) * 100 : 0}
        />
        <KpiCard
          index={3} label="Services" icon={Server}
          value={online} display={`${online}/${services.length}`}
          sub="online"
          percent={services.length ? (online / services.length) * 100 : 0}
        />
      </div>

      {/* Services */}
      <SectionCard title="Services" badge={services.length ? `${online}/${services.length}` : undefined}>
        {services.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">Lade...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {services.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm hover:border-border/90 transition-colors"
              >
                <StatusDot status={s.status} />
                <span>{s.name}</span>
                {s.latency_ms != null && (
                  <span className="ml-1 font-mono text-[10px] text-muted-foreground">{s.latency_ms}ms</span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Docker Container */}
      <SectionCard title="Docker Container" badge={containers.length ? `${running}/${containers.length}` : undefined}>
        {containers.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">Lade...</p>
        ) : (
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {containers.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background/50 px-3 py-2 hover:border-border/90 transition-colors"
              >
                <StatusDot status={c.status} />
                <span className="flex-1 font-mono text-xs">{c.name}</span>
                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                  c.status === "running"
                    ? "border-aria/20 bg-aria/10 text-aria"
                    : "border-border/40 bg-muted/30 text-muted-foreground"
                }`}>
                  {c.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-between rounded-xl border border-border/40 bg-card/30 px-4 py-2.5"
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="size-2 rounded-full bg-aria"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs text-muted-foreground">
            {online === services.length && services.length > 0 ? "All systems operational" : "Checking systems..."}
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">Auto-refresh: 30s</span>
      </motion.div>

    </div>
  );
}
