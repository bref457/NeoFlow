import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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

const projects = [
  {
    index: "01",
    name: "Gartenplaner",
    icon: Sprout,
    tagline: "Von der Aussaat bis zur Ernte.",
    description:
      "Pflanzkalender, Anzucht-Tagebuch und KI-Gartenberatung. Alles an einem Ort — persönlich, ohne Datenweitergabe.",
    url: "https://garten.neo457.ch",
    tags: ["Next.js", "Supabase", "KI-Chat"],
    external: true,
  },
  {
    index: "02",
    name: "Dishboard",
    icon: UtensilsCrossed,
    tagline: "Keine Frage mehr: Was essen wir heute?",
    description:
      "Wochenplaner für Mahlzeiten. Rezepte organisieren, Wochen vorplanen, Einkaufsliste auf Knopfdruck.",
    url: "https://essen.neo457.ch",
    tags: ["Next.js", "Supabase", "Meal Planning"],
    external: true,
  },
  {
    index: "03",
    name: "NeoFlow",
    icon: MonitorDot,
    tagline: "Mein persönliches Kontrollzentrum.",
    description:
      "Überblick über alle Services, Docker Container, VPS-Ressourcen, Tasks und Notizen — alles auf einen Blick.",
    url: null,
    tags: ["Mission Control", "Self-hosted", "Private"],
    external: false,
  },
];

const setup = [
  {
    icon: Laptop,
    label: "Laptop",
    detail: "VS Code + Claude Code",
  },
  {
    icon: Server,
    label: "VPS (Hetzner)",
    detail: "Docker · nginx · 24/7",
  },
  {
    icon: MessageSquare,
    label: "Telegram",
    detail: "ARIA Bot · Steuerung unterwegs",
  },
  {
    icon: Globe,
    label: "Remote",
    detail: "vscode.neo457.ch · von überall",
  },
];

const stack = [
  "Next.js", "TypeScript", "Tailwind CSS", "Supabase",
  "Docker", "nginx", "Hetzner", "Claude Code",
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative min-h-dvh bg-background text-foreground overflow-hidden">

      {/* Dot-grid background */}
      <div
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(74,222,128,0.10) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_90%_60%_at_50%_-5%,transparent_0%,hsl(var(--background))_65%)]" />
      <div className="pointer-events-none fixed left-1/2 top-[-10rem] -z-10 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full bg-aria-glow blur-3xl opacity-50" />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="size-1.5 rounded-full bg-aria animate-pulse" />
            <span className="font-mono text-sm font-bold tracking-[0.18em] text-aria">
              neo457.ch
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/bref457"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="size-4" />
            </a>
            {user ? (
              <Button
                asChild
                size="sm"
                className="bg-aria text-black hover:bg-aria/90 font-mono font-semibold"
              >
                <Link href="/mission-control">
                  Mission Control <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">

        {/* ── HERO ── */}
        <section className="pt-20 pb-20 sm:pt-28 sm:pb-24 max-w-3xl">
          <p className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-aria">
            Solo Developer · Schweiz
          </p>
          <h1 className="mb-6 text-[clamp(2.6rem,6.5vw,5rem)] font-black leading-[1.05] tracking-tight">
            Ich baue Software{" "}
            <br className="hidden sm:block" />
            <span className="text-aria" style={{ textShadow: "0 0 50px rgba(74,222,128,0.2)" }}>
              die ich selbst nutze.
            </span>
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg max-w-xl">
            Ich bin Fabio — Solo-Developer aus der Schweiz. Ich entwickle kleine,
            fokussierte Web-Apps: von der Idee bis zum Deploy auf eigenem Server.
          </p>
        </section>

        {/* ── PROJEKTE ── */}
        <section className="pb-20">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Projekte
            </span>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {projects.map((project) => {
              const Icon = project.icon;
              const CardContent = (
                <div
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-5 backdrop-blur transition-all duration-300 hover:border-aria/40 hover:bg-card/70 h-full flex flex-col"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
                >
                  {/* Hover glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 0%, rgba(74,222,128,0.07) 0%, transparent 65%)",
                    }}
                  />

                  <div className="relative flex flex-col flex-1 gap-3">
                    {/* Top */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
                          <Icon className="size-4.5 text-aria" />
                        </div>
                        <div>
                          <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {project.index}
                          </p>
                          <h2 className="text-sm font-bold leading-tight">{project.name}</h2>
                        </div>
                      </div>
                      {project.external ? (
                        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:text-aria group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      ) : (
                        <Lock className="size-3.5 shrink-0 text-muted-foreground/30" />
                      )}
                    </div>

                    {/* Tagline */}
                    <p className="font-mono text-[11px] text-aria">{project.tagline}</p>

                    {/* Description */}
                    <p className="text-xs leading-relaxed text-muted-foreground flex-1">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-border/50 bg-muted/30 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );

              return project.external && project.url ? (
                <a
                  key={project.name}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {CardContent}
                </a>
              ) : (
                <div key={project.name}>{CardContent}</div>
              );
            })}
          </div>
        </section>

        {/* ── SETUP ── */}
        <section className="pb-20">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Wie ich arbeite
            </span>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {setup.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="relative rounded-xl border border-border/50 bg-card/30 p-4 flex flex-col gap-3"
                >
                  {/* Connector arrow (not on last) */}
                  {i < setup.length - 1 && (
                    <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="size-3 text-border/60" />
                    </div>
                  )}
                  <div className="flex size-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40">
                    <Icon className="size-4 text-aria" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{item.label}</p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── STACK ── */}
        <section className="pb-24">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Stack
            </span>
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="flex flex-wrap gap-2">
            {stack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-border/50 bg-muted/20 px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-aria/30 hover:text-foreground transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/30">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 text-xs text-muted-foreground sm:px-8">
          <span className="font-mono font-semibold tracking-widest text-aria/70">neo457.ch</span>
          <a
            href="https://github.com/bref457"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Github className="size-3.5" />
            bref457
          </a>
          <span className="font-mono">© 2026</span>
        </div>
      </footer>

    </div>
  );
}
