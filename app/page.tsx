"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Sprout,
  UtensilsCrossed,
  MonitorDot,
  ArrowRight,
  Github,
  Server,
  Laptop,
  MessageSquare,
  Globe,
  Lock,
} from "lucide-react";

const stack = [
  "Next.js", "TypeScript", "Tailwind CSS", "Supabase",
  "Docker", "nginx", "Hetzner", "Claude Code",
];

const terminalLines = [
  { prefix: "~", cmd: "ssh root@neo457.ch", delay: 0 },
  { prefix: "vps", cmd: "docker ps --format 'table {{.Names}}\\t{{.Status}}'", delay: 800 },
  { prefix: "vps", cmd: "claude  # Mission Control öffnen", delay: 1800 },
  { prefix: "vps", cmd: "git pull && docker compose up -d --build", delay: 2800 },
];

function TerminalLine({ prefix, cmd, delay }: { prefix: string; cmd: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className={`flex gap-2 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
      <span className="text-aria select-none shrink-0">{prefix} $</span>
      <span className="text-foreground/80">{cmd}</span>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes border-spin {
          to { --border-angle: 360deg; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
        .gradient-text {
          background: linear-gradient(135deg, #4ade80, #22d3ee, #a78bfa, #4ade80);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 5s ease infinite;
        }
        .fade-up { animation: fade-up 0.6s ease both; }
        .fade-up-1 { animation: fade-up 0.6s ease 0.1s both; }
        .fade-up-2 { animation: fade-up 0.6s ease 0.2s both; }
        .fade-up-3 { animation: fade-up 0.6s ease 0.35s both; }
        .fade-up-4 { animation: fade-up 0.6s ease 0.5s both; }
        .card-glow {
          position: relative;
          transition: all 0.3s;
        }
        .card-glow::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(74,222,128,0), rgba(74,222,128,0));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          transition: all 0.3s;
          opacity: 0;
        }
        .card-glow:hover::before {
          background: linear-gradient(135deg, rgba(74,222,128,0.6), rgba(34,211,238,0.3), rgba(167,139,250,0.3));
          opacity: 1;
        }
        .cursor-blink { animation: cursor-blink 1s step-end infinite; }
      `}</style>

      <div className="relative min-h-dvh bg-background text-foreground overflow-hidden">

        {/* Dot-grid */}
        <div className="pointer-events-none fixed inset-0 -z-20"
          style={{ backgroundImage: "radial-gradient(circle, rgba(74,222,128,0.09) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_90%_55%_at_50%_-5%,transparent_0%,hsl(var(--background))_65%)]" />
        <div className="pointer-events-none fixed left-1/2 top-[-12rem] -z-10 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-aria-glow blur-3xl opacity-40" />
        {/* Side glows */}
        <div className="pointer-events-none fixed -left-32 top-1/3 -z-10 h-64 w-64 rounded-full bg-aria-glow blur-3xl opacity-20" />
        <div className="pointer-events-none fixed -right-32 top-2/3 -z-10 h-64 w-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(167,139,250,0.15), transparent)" }} />

        {/* ── HEADER ── */}
        <header className="sticky top-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
            <div className="flex items-center gap-2.5">
              <Image src="/logo-n-white.png" alt="NEO457" width={26} height={26} className="opacity-90" />
              <span className="font-mono text-sm font-bold tracking-[0.18em] text-aria">neo457.ch</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://github.com/bref457" target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="size-4" />
              </a>
              <Button asChild variant="ghost" size="sm"
                className="font-mono text-xs text-muted-foreground hover:text-foreground">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 sm:px-8">

          {/* ── HERO ── */}
          <section className="pt-20 pb-16 sm:pt-28 sm:pb-20">
            <div className="max-w-4xl space-y-6">
              <p className="fade-up font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-aria">
                Solo Developer · Schweiz
              </p>
              <h1 className="fade-up-1 text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[1.05] tracking-tight">
                Ich baue Software{" "}
                <br className="hidden sm:block" />
                <span className="gradient-text">die ich selbst nutze.</span>
              </h1>
              <p className="fade-up-2 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Ich bin Neo — Solo-Developer aus der Schweiz. Kleine, fokussierte Web-Apps —
                von der Idee bis zum Deploy auf eigenem Server.
              </p>
              <div className="fade-up-3 flex items-center gap-4 pt-2">
                <a href="https://github.com/bref457" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-4 py-2 font-mono text-xs text-muted-foreground transition-all hover:border-aria/40 hover:text-foreground">
                  <Github className="size-3.5" />
                  github.com/bref457
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </section>

          {/* ── BENTO GRID ── */}
          <section className="fade-up-4 pb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Projekte</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {/* NeoGarden */}
              <a href="https://garten.neo457.ch" target="_blank" rel="noopener noreferrer"
                className="card-glow group lg:col-span-2 rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur hover:bg-card/70"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
                <div className="flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-muted/40 group-hover:border-aria/30 transition-colors">
                        <Sprout className="size-5 text-aria" />
                      </div>
                      <div>
                        <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">01</p>
                        <h2 className="text-base font-bold">NeoGarden</h2>
                      </div>
                    </div>
                    <ExternalLink className="size-3.5 text-muted-foreground/30 transition-all group-hover:text-aria group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="font-mono text-[11px] text-aria">Von der Aussaat bis zur Ernte.</p>
                  <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                    Pflanzkalender, Anzucht-Tagebuch und KI-Gartenberatung.
                    Alles an einem Ort — persönlich, ohne Datenweitergabe.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Next.js", "Supabase", "KI-Chat"].map(t => (
                      <span key={t} className="rounded-md border border-border/50 bg-muted/30 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </div>
              </a>

              {/* NeoDish */}
              <a href="https://essen.neo457.ch" target="_blank" rel="noopener noreferrer"
                className="card-glow group rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur hover:bg-card/70"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
                <div className="flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-muted/40 group-hover:border-aria/30 transition-colors">
                        <UtensilsCrossed className="size-5 text-aria" />
                      </div>
                      <div>
                        <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">02</p>
                        <h2 className="text-base font-bold">NeoDish</h2>
                      </div>
                    </div>
                    <ExternalLink className="size-3.5 text-muted-foreground/30 transition-all group-hover:text-aria group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="font-mono text-[11px] text-aria">Keine Frage mehr: Was essen wir heute?</p>
                  <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                    Wochenplaner für Mahlzeiten. Rezepte organisieren,
                    Wochen vorplanen, Einkaufsliste auf Knopfdruck.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Next.js", "Supabase", "Meal Planning"].map(t => (
                      <span key={t} className="rounded-md border border-border/50 bg-muted/30 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </div>
              </a>

              {/* NeoFlow — full width */}
              <div className="card-glow group lg:col-span-3 rounded-2xl border border-aria/20 bg-card/40 p-6 backdrop-blur"
                style={{ boxShadow: "inset 0 1px 0 rgba(74,222,128,0.05), 0 0 40px rgba(74,222,128,0.04)" }}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col gap-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl border border-aria/30 bg-aria-dim">
                        <MonitorDot className="size-5 text-aria" />
                      </div>
                      <div>
                        <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">03</p>
                        <h2 className="text-base font-bold">NeoFlow</h2>
                      </div>
                      <span className="ml-1 flex items-center gap-1 rounded-full border border-aria/20 bg-aria-dim px-2 py-0.5 font-mono text-[10px] text-aria">
                        <Lock className="size-2.5" /> Private
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-aria">Mein persönliches Kontrollzentrum.</p>
                    <p className="text-sm leading-relaxed text-muted-foreground max-w-xl">
                      Überblick über alle Services, Docker Container, VPS-Ressourcen,
                      Tasks und Notizen — alles auf einen Blick, von überall erreichbar.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:flex-col sm:items-end sm:gap-2">
                    {["Mission Control", "Docker", "Self-hosted"].map(t => (
                      <span key={t} className="rounded-md border border-aria/20 bg-aria-dim/50 px-2 py-0.5 font-mono text-[10px] text-aria">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ── TERMINAL / SETUP ── */}
          <section className="pb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Wie ich arbeite</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

              {/* Terminal */}
              <div className="rounded-2xl border border-border/50 bg-[#0d0d0d] overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-2 border-b border-border/30 px-4 py-3">
                  <span className="size-3 rounded-full bg-red-500/70" />
                  <span className="size-3 rounded-full bg-yellow-500/70" />
                  <span className="size-3 rounded-full bg-green-500/70" />
                  <span className="ml-3 font-mono text-[11px] text-muted-foreground">neo@vps:~</span>
                </div>
                {/* Lines */}
                <div className="p-5 font-mono text-[12px] leading-7 space-y-1">
                  {mounted && terminalLines.map((line, i) => (
                    <TerminalLine key={i} {...line} />
                  ))}
                  <div className="flex gap-2 mt-1">
                    <span className="text-aria select-none">vps $</span>
                    <span className="cursor-blink text-foreground/60">▋</span>
                  </div>
                </div>
              </div>

              {/* Setup Cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Laptop, label: "Laptop", detail: "VS Code + Claude Code", color: "text-aria" },
                  { icon: Server, label: "VPS (Hetzner)", detail: "Docker · nginx · 24/7", color: "text-cyan-400" },
                  { icon: MessageSquare, label: "Telegram", detail: "ARIA Bot · unterwegs", color: "text-violet-400" },
                  { icon: Globe, label: "Remote", detail: "vscode.neo457.ch", color: "text-emerald-400" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label}
                      className="rounded-xl border border-border/50 bg-card/30 p-4 flex flex-col gap-3 hover:border-border/80 transition-colors">
                      <div className={`flex size-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40`}>
                        <Icon className={`size-4 ${item.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── STACK ── */}
          <section className="pb-24">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Stack</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>
            <div className="flex flex-wrap gap-2">
              {stack.map((tech) => (
                <span key={tech}
                  className="rounded-lg border border-border/50 bg-muted/20 px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-aria/30 hover:text-foreground transition-colors cursor-default">
                  {tech}
                </span>
              ))}
            </div>
          </section>

        </main>

        {/* ── FOOTER ── */}
        <footer className="border-t border-border/30">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 text-xs text-muted-foreground sm:px-8">
            <div className="flex items-center gap-2">
              <Image src="/logo-n-white.png" alt="NEO457" width={18} height={18} className="opacity-50" />
              <span className="font-mono font-semibold tracking-widest text-aria/70">neo457.ch</span>
            </div>
            <a href="https://github.com/bref457" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Github className="size-3.5" />bref457
            </a>
            <span className="font-mono">© 2026</span>
          </div>
        </footer>

      </div>
    </>
  );
}
