import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sprout, UtensilsCrossed, Code2, ArrowRight } from "lucide-react";

const projects = [
  {
    index: "01",
    name: "Gartenplaner",
    icon: Sprout,
    tagline: "Vom Samen zur Ernte.",
    description:
      "Pflanzkalender, Anzucht-Tagebuch und KI-Gartenberatung. Alles an einem Ort — persönlich, lokal, ohne Datenweitergabe.",
    url: "https://garten.neo457.ch",
    tags: ["Next.js", "Supabase", "KI-Chat", "Self-hosted"],
  },
  {
    index: "02",
    name: "Dishboard",
    icon: UtensilsCrossed,
    tagline: "Keine Frage mehr: Was essen wir heute?",
    description:
      "Wochenplaner für Mahlzeiten. Rezepte organisieren, Wochen vorplanen, Einkaufsliste auf Knopfdruck.",
    url: "https://essen.neo457.ch",
    tags: ["Next.js", "Supabase", "Meal Planning", "Self-hosted"],
  },
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
          backgroundImage: "radial-gradient(circle, rgba(var(--color-aria-raw, 74,222,128), 0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Vignette over dot grid */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,transparent_0%,hsl(var(--background))_70%)]" />
      {/* Glow top */}
      <div className="pointer-events-none fixed left-1/2 top-[-12rem] -z-10 h-[36rem] w-[48rem] -translate-x-1/2 rounded-full bg-aria-glow blur-3xl opacity-60" />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-aria animate-pulse" />
            <span className="font-mono text-sm font-bold tracking-[0.2em] text-aria uppercase">
              neo457.ch
            </span>
          </div>
          <nav className="flex items-center gap-2">
            {user ? (
              <Button
                asChild
                size="sm"
                className="bg-aria text-black hover:bg-aria/90 font-mono font-semibold tracking-wide"
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
                className="font-mono text-muted-foreground hover:text-foreground"
              >
                <Link href="/login">Login</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">

        {/* ── HERO ── */}
        <section className="pb-24 pt-20 sm:pt-28">
          <div className="max-w-4xl space-y-6">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-aria">
              — Solo Developer · Switzerland · Self-hosted
            </p>
            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[1.05] tracking-tight">
              Tools die ich{" "}
              <br className="hidden sm:block" />
              <span
                className="text-aria"
                style={{ textShadow: "0 0 40px rgba(74,222,128,0.25)" }}
              >
                täglich nutze.
              </span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Kleine, fokussierte Web-Apps — selbst entwickelt, selbst gehostet.
              Kein Abo, keine Tracker, volle Kontrolle über meine Daten.
            </p>
          </div>
        </section>

        {/* ── PROJECTS ── */}
        <section className="pb-24 space-y-5">
          <div className="flex items-center gap-4 pb-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Projekte
            </span>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((project) => {
              const Icon = project.icon;
              return (
                <a
                  key={project.name}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur transition-all duration-300 hover:border-aria/40 hover:bg-card/70"
                  style={{
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: "radial-gradient(circle at 50% 0%, rgba(74,222,128,0.06) 0%, transparent 60%)" }}
                  />

                  <div className="relative space-y-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
                          <Icon className="size-5 text-aria" />
                        </div>
                        <div>
                          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {project.index}
                          </p>
                          <h2 className="text-base font-bold leading-tight">{project.name}</h2>
                        </div>
                      </div>
                      <ExternalLink className="size-4 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:text-aria group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>

                    {/* Tagline */}
                    <p className="font-mono text-[11px] text-aria">{project.tagline}</p>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-muted-foreground">
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
                </a>
              );
            })}
          </div>
        </section>

        {/* ── FRAMEWORK TEASER ── */}
        <section className="pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-aria/25 bg-aria-dim/30 p-8 sm:p-10">
            {/* Corner decoration */}
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 opacity-10"
              style={{ background: "radial-gradient(circle at top right, rgba(74,222,128,0.6), transparent 70%)" }}
            />

            <div className="max-w-2xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-aria/30 bg-aria-dim">
                  <Code2 className="size-4 text-aria" />
                </div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-aria">
                  Grundgerüst
                </span>
              </div>

              <h3 className="text-xl font-bold sm:text-2xl">
                Interessiert am Stack dahinter?
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Gartenplaner und Dishboard basieren auf dem gleichen Next.js + Supabase Grundgerüst —
                sauber strukturiert, production-ready, mit Auth, Dark Mode und Docker-Deploy.
                Ideal als Ausgangspunkt für eigene Apps.
              </p>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-aria/30 font-mono text-aria hover:bg-aria-dim hover:border-aria/60"
              >
                <a href="mailto:info@neo457.ch">
                  Kontakt aufnehmen <ArrowRight className="ml-1.5 size-3.5" />
                </a>
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/30">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 text-xs text-muted-foreground sm:px-8">
          <span className="font-mono font-semibold tracking-widest text-aria/60">neo457.ch</span>
          <span className="font-mono">Self-hosted · Private · 24/7</span>
        </div>
      </footer>

    </div>
  );
}
