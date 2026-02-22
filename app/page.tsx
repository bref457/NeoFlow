import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Lock, Rocket, Sparkles, Workflow, Zap } from "lucide-react";

const features = [
  {
    title: "Secure Authentication",
    description: "Built-in Supabase auth flows for login, signup, and protected routes.",
    icon: Lock,
  },
  {
    title: "Fast Note Workflow",
    description: "Create and manage notes instantly with server actions and real-time UX.",
    icon: Workflow,
  },
  {
    title: "Production Foundation",
    description: "Ready-to-extend architecture with clean components and typed data access.",
    icon: Rocket,
  },
  {
    title: "Modern UI System",
    description: "Shadcn/ui components paired with Tailwind for consistent product design.",
    icon: Sparkles,
  },
  {
    title: "Performance First",
    description: "Server rendering and lean interactions keep everything responsive.",
    icon: Zap,
  },
  {
    title: "Scalable Structure",
    description: "Clear app layout and modular pages built for future SaaS features.",
    icon: CheckCircle2,
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryHref = user ? "/dashboard" : "/signup";
  const secondaryHref = user ? "/notes" : "/login";

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-[20rem] w-[20rem] rounded-full bg-sky-300/20 blur-3xl" />
      </div>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-14 sm:px-6 sm:py-20">
        <section className="space-y-7 text-center">
          <p className="inline-flex rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            Built for focused teams
          </p>
          <div className="mx-auto max-w-3xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Build your productivity flow with NeoFlow
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              NeoFlow combines secure auth, fast project and notes workflows, and a polished UI
              foundation so you can focus on outcomes instead of boilerplate.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={primaryHref}>Get started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={secondaryHref}>Open App</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </section>

        <section className="rounded-2xl border bg-card/80 p-6 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-background/70 p-4">
              <p className="text-sm font-medium">Auth-ready</p>
              <p className="text-sm text-muted-foreground">Secure session flows from day one.</p>
            </div>
            <div className="rounded-lg border bg-background/70 p-4">
              <p className="text-sm font-medium">Supabase-powered</p>
              <p className="text-sm text-muted-foreground">Reliable backend with RLS support.</p>
            </div>
            <div className="rounded-lg border bg-background/70 p-4">
              <p className="text-sm font-medium">Modern UI</p>
              <p className="text-sm text-muted-foreground">Shadcn components and clean spacing.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 text-sm text-muted-foreground sm:px-6">
          <p>© {new Date().getFullYear()} NeoFlow</p>
          <p>Simple, secure, and ready to scale.</p>
        </div>
      </footer>
    </div>
  );
}

