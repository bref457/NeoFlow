import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

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
            ARIA
          </span>
          <div className="flex items-center gap-2">
            {!user && (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Registrieren</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-12 px-4 py-20 text-center sm:px-6">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-aria/30 bg-aria-dim px-3 py-1 font-mono text-xs text-aria">
            <span className="size-1.5 rounded-full bg-aria animate-pulse" />
            Autonomous Research &amp; Intelligence Agent
          </p>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Dein persönlicher{" "}
            <span className="text-aria">KI-Agent</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            ARIA verbindet Telegram, lokales LLM, Web-Automation und Erinnerungen
            zu einem System — steuerbar von überall, läuft 24/7 auf eigenem Server.
          </p>
        </div>

        {!user ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-aria text-black hover:bg-aria/90 font-semibold">
              <Link href="/login">Einloggen</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/signup">Account erstellen</Link>
            </Button>
          </div>
        ) : (
          <Button asChild size="lg" className="bg-aria text-black hover:bg-aria/90 font-semibold">
            <Link href="/chat">ARIA öffnen</Link>
          </Button>
        )}
      </main>

      <footer className="border-t border-border/40">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
          <span className="font-mono text-aria">ARIA</span>
          <span>Self-hosted · Private · 24/7</span>
        </div>
      </footer>
    </div>
  );
}
