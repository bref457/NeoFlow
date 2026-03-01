"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Service = {
  name: string;
  status: "online" | "degraded" | "offline";
  latency_ms: number | null;
};

type StatusData = {
  services: Service[];
  checked_at: string;
};

function StatusDot({ status }: { status: Service["status"] }) {
  return (
    <span
      className={cn(
        "inline-block size-2.5 rounded-full",
        status === "online" ? "bg-aria" : status === "degraded" ? "bg-yellow-500" : "bg-destructive"
      )}
    />
  );
}

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/aria/status");
      if (!res.ok) throw new Error("Fehler beim Laden des Status.");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const checkedAt = data?.checked_at
    ? new Date(data.checked_at + "Z").toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })
    : null;

  const onlineCount = data?.services.filter((s) => s.status === "online").length ?? 0;
  const total = data?.services.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Service Status</h1>
          <p className="text-sm text-muted-foreground">
            {checkedAt ? `${onlineCount}/${total} online · Geprüft um ${checkedAt} Uhr` : "Live-Übersicht aller Dienste."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          Aktualisieren
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && !data
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border border-border/60 bg-card/30" />
            ))
          : data?.services.map((svc) => (
              <div
                key={svc.name}
                className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/50 p-5 transition-colors hover:border-aria/40"
              >
                <div className="flex items-center gap-2">
                  <StatusDot status={svc.status} />
                  <span className="text-sm font-medium">{svc.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      svc.status === "online"
                        ? "text-aria"
                        : svc.status === "degraded"
                          ? "text-yellow-500"
                          : "text-destructive"
                    )}
                  >
                    {svc.status === "online" ? "Online" : svc.status === "degraded" ? "Degraded" : "Offline"}
                  </span>
                  {svc.latency_ms !== null && (
                    <span className="text-xs text-muted-foreground">{svc.latency_ms} ms</span>
                  )}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
