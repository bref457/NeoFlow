import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sprout, UtensilsCrossed, Code2 } from "lucide-react";

const projects = [
  {
    name: "Gartenplaner",
    icon: Sprout,
    description: "Pflanzkalender, Anzucht-Tagebuch und KI-Beratung für deinen Garten. Alles an einem Ort — von der Aussaat bis zur Ernte.",
    url: "https://garten.neo457.ch",
    tags: ["Next.js", "Supabase", "KI-Chat"],
  },
  {
    name: "Dishboard",
    icon: UtensilsCrossed,
    description: "Wochenplaner für Mahlzeiten. Keine Frage mehr: \"Was essen wir heute?\" — Rezepte planen, Einkaufsliste generieren.",
    url: "https://essen.neo457.ch",
    tags: ["Next.js", "Supabase", "Meal Planning"],
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-8rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-aria-glow blur-3xl" />
        <div className="absolute bottom-0 right-[-4rem] h-[20rem] w-[20rem] rounded-full bg-aria-dim blur-3xl" />
      </div>

      {/* Nav */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="font-mono text-sm font-semibold tracking-widest text-aria">
            neo457.ch
          </span>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild size="sm" className="bg-aria text-black hover:bg-aria/90 font-semibold">
                <Link href="/mission-control">Mission Control</Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-20 px-4 py-20 sm:px-6">

        {/* Hero */}
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-aria/30 bg-aria-dim px-3 py-1 font-mono text-xs text-aria">
            <span className="size-1.5 rounded-full bg-aria animate-pulse" />
            Self-hosted · Private · Made in Switzerland
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Tools die ich{" "}
            <span className="text-aria">täglich nutze</span>
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Kleine, fokussierte Web-Apps — selbst entwickelt, selbst gehostet.
            Kein Abo, keine Tracker, volle Kontrolle.
          </p>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {projects.map((project) => {
            const Icon = project.icon;
            return (
              <a
                key={project.name}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur transition-all hover:border-aria/40 hover:bg-card/80 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
                      <Icon className="size-5 text-aria" />
                    </div>
                    <h2 className="text-lg font-semibold">{project.name}</h2>
                  </div>
                  <ExternalLink className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            );
          })}
        </div>

        {/* Framework teaser */}
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
              <Code2 className="size-5 text-aria" />
            </div>
          </div>
          <h3 className="text-lg font-semibold">Interessiert am Grundgerüst?</h3>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Gartenplaner und Dishboard basieren auf dem gleichen Next.js + Supabase Stack —
            sauber strukturiert, production-ready und anpassbar. Bei Interesse gerne melden.
          </p>
          <Button asChild variant="outline" size="sm">
            <a href="mailto:info@neo457.ch">Kontakt aufnehmen</a>
          </Button>
        </div>

      </main>

      <footer className="border-t border-border/40">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
          <span className="font-mono">neo457.ch</span>
          <span>Self-hosted · Private · 24/7</span>
        </div>
      </footer>
    </div>
  );
}
