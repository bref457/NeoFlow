import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEFAULT_PROJECT_COLOR, normalizeProjectColor } from "@/lib/project-colors";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";

type ProjectRow = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

type TaskRow = {
  id: string;
  project_id: string;
  done: boolean;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [projectsWithColorResult, tasksResult, notesResult] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, color, created_at")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("id, project_id, done, created_at")
      .eq("user_id", user.id)
      .is("archived_at", null),
    supabase
      .from("notes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("archived_at", null),
  ]);

  let projectsError = projectsWithColorResult.error;
  let projectsData = projectsWithColorResult.data;

  if (projectsError?.code === "42703") {
    const fallbackProjectsResult = await supabase
      .from("projects")
      .select("id, name, created_at")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    projectsError = fallbackProjectsResult.error;
    projectsData = (fallbackProjectsResult.data ?? []).map((project) => ({
      ...project,
      color: DEFAULT_PROJECT_COLOR,
    }));
  }

  if (projectsError) {
    throw new Error(projectsError.message);
  }
  if (tasksResult.error) {
    throw new Error(tasksResult.error.message);
  }
  if (notesResult.error) {
    throw new Error(notesResult.error.message);
  }

  const projects = (projectsData ?? []) as ProjectRow[];
  const tasks = (tasksResult.data ?? []) as TaskRow[];
  const notesCount = notesResult.count ?? 0;

  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.done).length;
  const openTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const todayIso = new Date().toISOString().slice(0, 10);
  const tasksCreatedToday = tasks.filter((task) => task.created_at.slice(0, 10) === todayIso).length;

  const statsByProjectId = new Map<string, { total: number; done: number }>();
  for (const task of tasks) {
    const current = statsByProjectId.get(task.project_id) ?? { total: 0, done: 0 };
    current.total += 1;
    if (task.done) {
      current.done += 1;
    }
    statsByProjectId.set(task.project_id, current);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Übersicht über deinen aktuellen Stand.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Projekte</CardDescription>
            <CardTitle className="text-3xl"><NumberTicker value={totalProjects} /></CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Aktive Projekt-Container.</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Offene Tasks</CardDescription>
            <CardTitle className="text-3xl"><NumberTicker value={openTasks} /></CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Noch nicht erledigt.</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Erledigt</CardDescription>
            <CardTitle className="text-3xl"><NumberTicker value={completedTasks} /></CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{completionRate}% Abschlussquote.</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Notes</CardDescription>
            <CardTitle className="text-3xl"><NumberTicker value={notesCount} /></CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{tasksCreatedToday} Tasks heute erstellt.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Fortschritt gesamt</CardTitle>
          <CardDescription>
            {completedTasks} von {totalTasks} Tasks erledigt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${completionRate}%` }} />
          </div>
          <p className="text-sm text-muted-foreground">{completionRate}% erledigt</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-border/70 shadow-sm">
        <BorderBeam size={80} duration={8} colorFrom="#9E7AFF" colorTo="#FE8BBB" />
        <CardHeader>
          <CardTitle>Neueste Projekte</CardTitle>
          <CardDescription>Schneller Zugriff auf deine zuletzt erstellten Projekte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {projects.length ? (
            projects.slice(0, 5).map((project) => {
              const stats = statsByProjectId.get(project.id) ?? { total: 0, done: 0 };
              const projectRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
              const projectColor = normalizeProjectColor(project.color);

              return (
                <div key={project.id} className="overflow-hidden rounded-lg" style={{ borderLeftWidth: "4px", borderLeftColor: projectColor }}>
                <MagicCard
                  className="flex flex-wrap items-center justify-between gap-3 p-3"
                  gradientColor="#1a1a2e"
                  gradientOpacity={0.6}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block size-2.5 rounded-full"
                        style={{ backgroundColor: projectColor }}
                      />
                      <p className="truncate text-sm font-medium">{project.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.done}/{stats.total} erledigt ({projectRate}%)
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/projects/${project.id}`}>Öffnen</Link>
                  </Button>
                </MagicCard>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">Noch keine Projekte vorhanden.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

