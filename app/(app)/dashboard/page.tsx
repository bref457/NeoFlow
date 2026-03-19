import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEFAULT_PROJECT_COLOR, normalizeProjectColor } from "@/lib/project-colors";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { formatDateEU, formatDateTimeEU } from "@/lib/date-format";

type ProjectRow = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

type NoteRow = {
  id: string;
  app_name: string | null;
  done: boolean;
  category: string | null;
  priority: string | null;
};

type RecentNote = {
  id: string;
  content: string;
  category: string | null;
  app_name: string | null;
  created_at: string;
  done: boolean;
};

type DueSoonNote = {
  id: string;
  content: string;
  due_date: string;
  priority: string | null;
  app_name: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  task: "Task",
  feedback: "Feedback",
  brainstorming: "Idee",
  infra: "Infra",
  claude: "Claude",
  note: "Notiz",
};

const CATEGORY_COLORS: Record<string, string> = {
  task: "bg-violet-500/15 text-violet-400",
  feedback: "bg-blue-500/15 text-blue-400",
  brainstorming: "bg-purple-500/15 text-purple-400",
  infra: "bg-orange-500/15 text-orange-400",
  claude: "bg-green-500/15 text-green-400",
  note: "bg-muted text-muted-foreground",
};

const PRIORITY_COLORS: Record<string, string> = {
  hoch: "bg-red-100 text-red-700",
  mittel: "bg-amber-100 text-amber-700",
  niedrig: "bg-emerald-100 text-emerald-700",
};

function getGreeting(): string {
  const h = parseInt(
    new Date().toLocaleString("de-CH", { hour: "numeric", hour12: false, timeZone: "Europe/Zurich" })
  );
  if (h < 5) return "Gute Nacht";
  if (h < 12) return "Guten Morgen";
  if (h < 14) return "Guten Mittag";
  if (h < 18) return "Guten Nachmittag";
  return "Guten Abend";
}

function getTodayDate(): string {
  return new Date().toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Zurich",
  });
}

function isOverdue(due_date: string): boolean {
  return new Date(due_date) < new Date();
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [projectsWithColorResult, notesResult, highPrioResult, recentResult, dueSoonResult] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, name, color, created_at")
        .eq("user_id", user.id)
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("notes")
        .select("id, app_name, done, category, priority")
        .eq("user_id", user.id)
        .is("archived_at", null),
      supabase
        .from("notes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("category", "task")
        .eq("priority", "hoch")
        .eq("done", false)
        .is("archived_at", null),
      supabase
        .from("notes")
        .select("id, content, category, app_name, created_at, done")
        .eq("user_id", user.id)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("notes")
        .select("id, content, due_date, priority, app_name")
        .eq("user_id", user.id)
        .eq("category", "task")
        .eq("done", false)
        .is("archived_at", null)
        .not("due_date", "is", null)
        .order("due_date", { ascending: true })
        .limit(5),
    ]);

  let projectsError = projectsWithColorResult.error;
  let projectsData = projectsWithColorResult.data;

  if (projectsError?.code === "42703") {
    const fallback = await supabase
      .from("projects")
      .select("id, name, created_at")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    projectsError = fallback.error;
    projectsData = (fallback.data ?? []).map((p) => ({ ...p, color: DEFAULT_PROJECT_COLOR }));
  }

  if (projectsError) throw new Error(projectsError.message);
  if (notesResult.error) throw new Error(notesResult.error.message);

  const projects = (projectsData ?? []) as ProjectRow[];
  const notes = (notesResult.data ?? []) as NoteRow[];
  const highPrioCount = highPrioResult.count ?? 0;
  const recentNotes = (recentResult.data ?? []) as RecentNote[];
  const dueSoon = (dueSoonResult.data ?? []) as DueSoonNote[];

  const totalNotes = notes.length;
  const openNotes = notes.filter((n) => !n.done).length;
  const completedNotes = notes.filter((n) => n.done).length;
  const completionRate = totalNotes > 0 ? Math.round((completedNotes / totalNotes) * 100) : 0;

  // Kategorie-Breakdown
  const categoryCount: Record<string, number> = {};
  for (const n of notes.filter((n) => !n.done)) {
    const cat = n.category ?? "note";
    categoryCount[cat] = (categoryCount[cat] ?? 0) + 1;
  }

  // Projekt-Stats: alle notes pro Projekt
  const statsByProjectName = new Map<string, { total: number; done: number }>();
  for (const note of notes) {
    const name = note.app_name ?? "Allgemein";
    const current = statsByProjectName.get(name) ?? { total: 0, done: 0 };
    current.total += 1;
    if (note.done) current.done += 1;
    statsByProjectName.set(name, current);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header / Greeting */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{getTodayDate()}</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {getGreeting()}, Fabio 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          {openNotes === 0
            ? "Alles erledigt — grossartig! 🎉"
            : `${openNotes} offene Einträge warten auf dich.`}
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Projekte</CardDescription>
            <CardTitle className="text-3xl">
              <NumberTicker value={projects.length} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Aktive Projekt-Container.</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Inbox</CardDescription>
            <CardTitle className="text-3xl">
              <NumberTicker value={totalNotes} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {openNotes} offen · {completedNotes} erledigt
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Hohe Priorität</CardDescription>
            <CardTitle className="text-3xl">
              <NumberTicker value={highPrioCount} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Offene Tasks mit Priorität Hoch.</p>
          </CardContent>
        </Card>
      </div>

      {/* Fortschritt + Kategorie */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Fortschritt</CardTitle>
            <CardDescription>
              {completedNotes} von {totalNotes} Einträgen erledigt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{completionRate}% erledigt</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Offene Einträge nach Typ</CardTitle>
            <CardDescription>Wie sich deine offenen Einträge aufteilen.</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(categoryCount).length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine offenen Einträge. 🎉</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryCount)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count]) => (
                    <span
                      key={cat}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.note}`}
                    >
                      {CATEGORY_LABELS[cat] ?? cat}
                      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-xs font-bold">
                        {count}
                      </span>
                    </span>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fällig bald + Zuletzt hinzugefügt */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Fällig bald</CardTitle>
            <CardDescription>Offene Tasks mit Deadline.</CardDescription>
          </CardHeader>
          <CardContent>
            {dueSoon.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Tasks mit Deadline. ✅</p>
            ) : (
              <div className="space-y-2">
                {dueSoon.map((task) => {
                  const overdue = isOverdue(task.due_date);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start justify-between gap-2 rounded-md p-2 ${overdue ? "bg-red-500/10" : "bg-muted/40"}`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate text-sm">{task.content}</p>
                        <p className={`text-xs ${overdue ? "font-medium text-red-400" : "text-muted-foreground"}`}>
                          {overdue ? "⚠️ Überfällig: " : "📅 "}
                          {formatDateEU(task.due_date)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {task.priority && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority] ?? ""}`}>
                            {task.priority}
                          </span>
                        )}
                        {task.app_name && (
                          <span className="text-xs text-muted-foreground">{task.app_name}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Zuletzt hinzugefügt</CardTitle>
            <CardDescription>Die 5 neuesten Inbox-Einträge.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentNotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Einträge.</p>
            ) : (
              <div className="space-y-2">
                {recentNotes.map((note) => {
                  const cat = note.category ?? "note";
                  return (
                    <div key={note.id} className="flex items-start gap-2 rounded-md bg-muted/40 p-2">
                      <span
                        className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.note}`}
                      >
                        {CATEGORY_LABELS[cat] ?? cat}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm ${note.done ? "line-through text-muted-foreground" : ""}`}>
                          {note.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {note.app_name ?? "Allgemein"} · {formatDateTimeEU(note.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projekte */}
      <Card className="relative overflow-hidden border-border/70 shadow-sm">
        <BorderBeam size={80} duration={8} colorFrom="#9E7AFF" colorTo="#FE8BBB" />
        <CardHeader>
          <CardTitle>Projekte</CardTitle>
          <CardDescription>Schneller Zugriff und Inbox-Stand pro Projekt.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {projects.length ? (
            projects.slice(0, 5).map((project) => {
              const stats = statsByProjectName.get(project.name) ?? { total: 0, done: 0 };
              const projectRate =
                stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
              const projectColor = normalizeProjectColor(project.color);

              return (
                <div
                  key={project.id}
                  className="overflow-hidden rounded-lg"
                  style={{ borderLeftWidth: "4px", borderLeftColor: projectColor }}
                >
                  <MagicCard
                    className="flex flex-wrap items-center justify-between gap-3 p-3"
                    gradientColor="#1a1a2e"
                    gradientOpacity={0.6}
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block size-2.5 rounded-full"
                          style={{ backgroundColor: projectColor }}
                        />
                        <p className="truncate text-sm font-medium">{project.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${projectRate}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {stats.done}/{stats.total} erledigt ({projectRate}%)
                        </p>
                      </div>
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
