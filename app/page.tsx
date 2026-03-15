"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  ExternalLink, Sprout, UtensilsCrossed, MonitorDot,
  Github, Server, Laptop, MessageSquare, Globe, Lock, CheckCircle2,
} from "lucide-react";

// ─── SPARKLES ───────────────────────────────────────────────────────────────
const SPARKLE_COLORS = ["#4ade80", "#86efac", "#bbf7d0", "#dcfce7"];

function Sparkle({ x, y, color, size, delay }: { x: string | number; y: string | number; color: string; size: number; delay: number }) {
  return (
    <motion.svg
      className="pointer-events-none absolute"
      style={{ left: x, top: y, width: size, height: size }}
      viewBox="0 0 160 160"
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, 90] }}
      transition={{ duration: 1.2, delay, ease: "easeInOut", repeat: Infinity, repeatDelay: Math.random() * 3 + 2 }}
    >
      <path
        d="M80 0 C80 0 84 76 160 80 C84 84 80 160 80 160 C80 160 76 84 0 80 C76 76 80 0 80 0Z"
        fill={color}
      />
    </motion.svg>
  );
}

function Sparkles({ count = 8 }: { count?: number }) {
  const [items] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
      size: Math.random() * 16 + 10,
      delay: Math.random() * 2,
    }))
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((s) => (
        <Sparkle key={s.id} x={s.x + "%"} y={s.y + "%"} color={s.color} size={s.size} delay={s.delay} />
      ))}
    </div>
  );
}


// ─── TERMINAL ───────────────────────────────────────────────────────────────
const terminalSequence = [
  { prefix: "~", cmd: "ssh root@neo457.ch", type: "cmd" },
  { prefix: "vps", cmd: "docker ps", type: "cmd" },
  { prefix: "", cmd: "neodish      ↑ running", type: "out" },
  { prefix: "", cmd: "neogarden    ↑ running", type: "out" },
  { prefix: "vps", cmd: "claude  # Mission Control", type: "cmd" },
  { prefix: "vps", cmd: "git pull && docker compose up -d", type: "cmd" },
];

function TerminalBlock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const tick = () => { i++; setVisible(i); if (i < terminalSequence.length) setTimeout(tick, 550); };
    setTimeout(tick, 200);
  }, [inView]);

  return (
    <div ref={ref} className="rounded-2xl border border-border/50 bg-[#0a0a0a] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/30 px-4 py-3">
        <span className="size-3 rounded-full bg-red-500/70" />
        <span className="size-3 rounded-full bg-yellow-500/70" />
        <span className="size-3 rounded-full bg-green-500/70" />
        <span className="ml-3 font-mono text-[11px] text-muted-foreground">neo@vps:~</span>
      </div>
      <div className="p-5 font-mono text-[12px] leading-7 space-y-0.5 min-h-[200px]">
        {terminalSequence.slice(0, visible).map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="flex gap-2">
            {line.prefix
              ? <span className="text-aria select-none shrink-0">{line.prefix} $</span>
              : <span className="text-aria/30 select-none shrink-0 pl-4">→</span>
            }
            <span className={line.type === "out" ? "text-muted-foreground" : "text-foreground/85"}>{line.cmd}</span>
          </motion.div>
        ))}
        {visible >= terminalSequence.length && (
          <div className="flex gap-2">
            <span className="text-aria select-none">vps $</span>
            <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="text-aria">▋</motion.span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
const stack = ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Docker", "nginx", "Hetzner", "Claude Code"];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

type ProjectKey = "neogarden" | "neodish" | "neoflow";

const PROJECT_DETAILS: Record<ProjectKey, {
  icon: React.ReactNode;
  name: string;
  tagline: string;
  problem: string;
  solution: string;
  features: string[];
  url?: string;
  urlLabel?: string;
}> = {
  neogarden: {
    icon: <Sprout className="size-5 text-aria" />,
    name: "NeoGarden",
    tagline: "Von der Aussaat bis zur Ernte.",
    problem: "Du weißt nie mehr was du wann gepflanzt hast, was als nächstes dran ist — und welche Pflanzen eigentlich gut zusammenpassen.",
    solution: "NeoGarden ist dein digitales Gartenbuch. Du führst ein Anzucht-Tagebuch, planst im Kalender wann gesät oder gepflanzt wird, und ein KI-Assistent beantwortet alle Gartenfragen — von Pflanzabstand bis Schädlingsbekämpfung.",
    features: ["Anzucht-Tagebuch", "Pflanzkalender", "KI-Gartenberatung", "Privat & ohne Datenweitergabe"],
    url: "https://garten.neo457.ch",
    urlLabel: "App öffnen",
  },
  neodish: {
    icon: <UtensilsCrossed className="size-5 text-aria" />,
    name: "NeoDish",
    tagline: "Keine Frage mehr: Was essen wir heute?",
    problem: "Jeden Abend die gleiche Frage: 'Was essen wir heute?' Zutaten fehlen, Rezepte sind überall verstreut, der Einkauf wird zum Chaos.",
    solution: "NeoDish macht Schluss mit dem Mahlzeiten-Chaos. Du planst die Woche im Voraus, hast alle Rezepte an einem Ort — und die Einkaufsliste erstellt sich automatisch aus deinem Wochenplan.",
    features: ["Wochenplaner", "Rezept-Verwaltung", "Automatische Einkaufsliste"],
    url: "https://essen.neo457.ch",
    urlLabel: "App öffnen",
  },
  neoflow: {
    icon: <MonitorDot className="size-5 text-aria" />,
    name: "NeoFlow",
    tagline: "Mein persönliches Kontrollzentrum.",
    problem: "Wer mehrere Web-Apps, einen eigenen Server und viele Projekte betreibt, verliert schnell den Überblick. Was läuft gerade? Was steht an? Wie viel Ressourcen hat der Server noch?",
    solution: "NeoFlow ist mein persönliches Command Center. Auf einen Blick: alle laufenden Docker Container, Server-Status, Tasks und Notizen für alle Projekte — plus direkter KI-Chat. Von überall erreichbar, komplett selbst gehostet.",
    features: ["Mission Control", "Docker & Server Status", "Task- & Notiz-Verwaltung", "ARIA KI-Integration"],
  },
};

export default function Home() {
  const [openDialog, setOpenDialog] = useState<ProjectKey | null>(null);
  const activeProject = openDialog ? PROJECT_DETAILS[openDialog] : null;

  return (
    <>
      <style>{`
        @keyframes gradient-shift {
          0%,100%{background-position:0% 50%}50%{background-position:100% 50%}
        }
        .gradient-text{
          background:linear-gradient(135deg,#86efac,#4ade80,#16a34a,#4ade80,#86efac);
          background-size:300% 300%;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:gradient-shift 5s ease infinite;
        }
      `}</style>

      <div className="relative min-h-dvh bg-background text-foreground overflow-hidden">

        {/* Dot-grid */}
        <div className="pointer-events-none fixed inset-0 -z-20"
          style={{ backgroundImage: "radial-gradient(circle,rgba(74,222,128,0.07) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_90%_55%_at_50%_-5%,transparent_0%,hsl(var(--background))_65%)]" />
        <div className="pointer-events-none fixed left-1/2 top-[-12rem] -z-10 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-aria-glow blur-3xl opacity-35" />
        <div className="pointer-events-none fixed -left-32 top-1/3 -z-10 h-64 w-64 rounded-full bg-aria-glow blur-3xl opacity-15" />
        <div className="pointer-events-none fixed -right-32 top-2/3 -z-10 h-64 w-64 rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle,rgba(167,139,250,0.2),transparent)" }} />

        {/* HEADER */}
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

          {/* HERO — with Sparkles */}
          <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-20 overflow-hidden">
            <Sparkles count={10} />

            <div className="relative z-10 max-w-4xl space-y-6">
              <motion.p
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-aria"
              >
                Solo Developer · Schweiz
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[1.05] tracking-tight"
              >
                Ich baue Software{" "}
                <br className="hidden sm:block" />
                <span className="gradient-text">die ich selbst nutze.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              >
                Ich bin Neo — Solo-Developer aus der Schweiz. Kleine, fokussierte Web-Apps —
                von der Idee bis zum Deploy auf eigenem Server.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <a href="https://github.com/bref457" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-4 py-2 font-mono text-xs text-muted-foreground transition-all hover:border-aria/40 hover:text-foreground">
                  <Github className="size-3.5" />
                  github.com/bref457
                  <ExternalLink className="size-3" />
                </a>
              </motion.div>
            </div>
          </section>

          {/* BENTO GRID */}
          <section className="pb-16">
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.4 }}
              className="flex items-center gap-4 mb-6"
            >
              <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-foreground/60">Projekte</span>
              <div className="h-px flex-1 bg-border/40" />
            </motion.div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {/* NeoGarden */}
              <motion.a
                href="https://garten.neo457.ch" target="_blank" rel="noopener noreferrer"
                className="group relative rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur overflow-hidden hover:border-aria/30 transition-colors"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
                variants={fadeUp} initial="hidden" whileInView="show" custom={0}
                viewport={{ once: true }}
                whileHover={{ y: -3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-aria/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-muted/40 group-hover:border-aria/40 transition-colors">
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
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenDialog("neogarden"); }}
                    className="self-start rounded-md border border-aria/20 bg-aria-dim/60 px-3 py-1 font-mono text-[11px] text-aria transition-all hover:border-aria/50 hover:bg-aria/10"
                  >
                    Mehr erfahren →
                  </button>
                </div>
              </motion.a>

              {/* NeoDish */}
              <motion.a
                href="https://essen.neo457.ch" target="_blank" rel="noopener noreferrer"
                className="group relative rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur overflow-hidden hover:border-aria/30 transition-colors"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
                variants={fadeUp} initial="hidden" whileInView="show" custom={1}
                viewport={{ once: true }}
                whileHover={{ y: -3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-aria/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-muted/40 group-hover:border-aria/40 transition-colors">
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
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenDialog("neodish"); }}
                    className="self-start rounded-md border border-aria/20 bg-aria-dim/60 px-3 py-1 font-mono text-[11px] text-aria transition-all hover:border-aria/50 hover:bg-aria/10"
                  >
                    Mehr erfahren →
                  </button>
                </div>
              </motion.a>

              {/* NeoFlow */}
              <motion.div
                className="relative group rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur overflow-hidden hover:border-aria/30 transition-colors"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
                variants={fadeUp} initial="hidden" whileInView="show" custom={2}
                viewport={{ once: true }}
                whileHover={{ y: -3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-aria/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl border border-aria/30 bg-aria-dim">
                        <MonitorDot className="size-5 text-aria" />
                      </div>
                      <div>
                        <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">03</p>
                        <h2 className="text-base font-bold">NeoFlow</h2>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 rounded-full border border-aria/20 bg-aria-dim px-2 py-0.5 font-mono text-[10px] text-aria">
                      <Lock className="size-2.5" /> Private
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-aria">Mein persönliches Kontrollzentrum.</p>
                  <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                    Überblick über alle Services, Docker Container, VPS-Ressourcen,
                    Tasks und Notizen — alles auf einen Blick, von überall erreichbar.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Mission Control", "Docker", "Self-hosted"].map(t => (
                      <span key={t} className="rounded-md border border-aria/20 bg-aria-dim/50 px-2 py-0.5 font-mono text-[10px] text-aria">{t}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => setOpenDialog("neoflow")}
                    className="self-start rounded-md border border-aria/20 bg-aria-dim/60 px-3 py-1 font-mono text-[11px] text-aria transition-all hover:border-aria/50 hover:bg-aria/10"
                  >
                    Mehr erfahren →
                  </button>
                </div>
              </motion.div>

            </div>
          </section>

          {/* SETUP / TERMINAL */}
          <section className="pb-16">
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.4 }}
              className="flex items-center gap-4 mb-6"
            >
              <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-foreground/60">Wie ich arbeite</span>
              <div className="h-px flex-1 bg-border/40" />
            </motion.div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TerminalBlock />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Laptop, label: "Laptop", detail: "VS Code + Claude Code", color: "text-aria", glow: "rgba(74,222,128,0.15)", delay: 0 },
                  { icon: Server, label: "VPS (Hetzner)", detail: "Docker · nginx · 24/7", color: "text-cyan-400", glow: "rgba(34,211,238,0.15)", delay: 1 },
                  { icon: MessageSquare, label: "Telegram", detail: "ARIA Bot · unterwegs", color: "text-violet-400", glow: "rgba(167,139,250,0.15)", delay: 2 },
                  { icon: Globe, label: "Remote", detail: "vscode.neo457.ch", color: "text-emerald-400", glow: "rgba(52,211,153,0.15)", delay: 3 },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      variants={fadeUp} initial="hidden" whileInView="show" custom={item.delay}
                      viewport={{ once: true }}
                      whileHover={{ y: -3, boxShadow: `0 8px 30px ${item.glow}` }}
                      className="rounded-xl border border-border/50 bg-card/30 p-4 flex flex-col gap-3 hover:border-border/80 transition-colors cursor-default"
                    >
                      <div className="flex size-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40">
                        <Icon className={`size-4 ${item.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{item.detail}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* STACK */}
          <section className="pb-24">
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.4 }}
              className="flex items-center gap-4 mb-6"
            >
              <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-foreground/60">Stack</span>
              <div className="h-px flex-1 bg-border/40" />
            </motion.div>
            <motion.div
              className="flex flex-wrap gap-2"
              initial="hidden" whileInView="show" viewport={{ once: true }}
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
              {stack.map((tech) => (
                <motion.span
                  key={tech}
                  variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="rounded-lg border border-border/50 bg-muted/20 px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-aria/30 hover:text-foreground transition-colors cursor-default"
                >
                  {tech}
                </motion.span>
              ))}
            </motion.div>
          </section>

        </main>

        {/* FOOTER */}
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

      {/* PROJECT DETAIL DIALOG */}
      <Dialog open={!!openDialog} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-lg">
          {activeProject && (
            <>
              <DialogHeader>
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-aria/30 bg-aria-dim">
                    {activeProject.icon}
                  </div>
                  <div>
                    <DialogTitle className="text-lg">{activeProject.name}</DialogTitle>
                    <p className="font-mono text-[11px] text-aria">{activeProject.tagline}</p>
                  </div>
                </div>
                <DialogDescription asChild>
                  <div className="space-y-4 text-left">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Das Problem</p>
                      <p className="text-sm leading-relaxed text-foreground/80">{activeProject.problem}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Die Lösung</p>
                      <p className="text-sm leading-relaxed text-foreground/80">{activeProject.solution}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Features</p>
                      <ul className="space-y-1">
                        {activeProject.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                            <CheckCircle2 className="size-3.5 shrink-0 text-aria" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {activeProject.url && (
                      <a
                        href={activeProject.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-aria/30 bg-aria-dim px-4 py-2 font-mono text-xs text-aria transition-colors hover:bg-aria/10"
                      >
                        {activeProject.urlLabel} <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
