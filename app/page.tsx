import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-[20rem] w-[20rem] rounded-full bg-sky-300/20 blur-3xl" />
      </div>

      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-5xl flex-col items-center justify-center gap-8 px-4 py-14 text-center sm:px-6 sm:py-20">
        <p className="inline-flex rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          NeoFlow Productivity App
        </p>

        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Build your productivity flow with NeoFlow
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            NeoFlow ist deine zentrale App für Projekte, Tasks, Notizen und Kalender.
            Alles an einem Ort, klar strukturiert und einfach zu bedienen.
          </p>
        </div>

        {!user ? (
          <div className="flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signup">Sign up</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        ) : (
          <div className="flex w-full max-w-md justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/dashboard">Zum Dashboard</Link>
            </Button>
          </div>
        )}
      </main>

      <footer className="border-t">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 text-sm text-muted-foreground sm:px-6">
          <p>© {new Date().getFullYear()} NeoFlow</p>
          <p>Strukturiert. Klar. Produktiv.</p>
        </div>
      </footer>
    </div>
  );
}

