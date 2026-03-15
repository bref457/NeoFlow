import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDateTimeEU } from "@/lib/date-format";
import { createTask, deleteTask, updateTask } from "./actions";
import { deleteNote } from "@/app/(app)/notes/actions";
import { DeleteNoteForm } from "@/app/(app)/notes/delete-note-form";
import { DeleteProjectButton } from "../delete-project-button";
import { TaskToggleForm } from "./task-toggle-form";
import { DeleteTaskForm } from "./delete-task-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEFAULT_PROJECT_COLOR, normalizeProjectColor } from "@/lib/project-colors";
import {
  compareTaskPriority,
  DEFAULT_TASK_PRIORITY,
  normalizeTaskPriority,
  type TaskPriority,
} from "@/lib/task-priority";

type NoteRow = {
  id: string;
  content: string;
  created_at: string;
  category: string | null;
  source: string | null;
};

const NOTE_CATEGORY_LABELS: Record<string, string> = {
  note: "Notiz",
  feedback: "Feedback",
  brainstorming: "Brainstorming",
  infra: "Infra",
  claude: "Claude",
};

const NOTE_CATEGORY_COLORS: Record<string, string> = {
  note: "bg-muted text-muted-foreground",
  feedback: "bg-blue-500/15 text-blue-400",
  brainstorming: "bg-purple-500/15 text-purple-400",
  infra: "bg-orange-500/15 text-orange-400",
  claude: "bg-green-500/15 text-green-400",
};

type ProjectRow = {
  id: string;
  name: string;
  color: string;
};

type TaskRow = {
  id: string;
  title: string;
  done: boolean;
  priority: TaskPriority;
  due_at: string | null;
  created_at: string;
};

function formatDateTimeInputValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

const priorityLabel: Record<TaskPriority, string> = {
  high: "Hoch",
  medium: "Mittel",
  low: "Niedrig",
};

const priorityBadgeClass: Record<TaskPriority, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; status?: string; priority?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const taskQuery = String(resolvedSearchParams.q ?? "").trim();
  const statusRaw = String(resolvedSearchParams.status ?? "").trim();
  const statusFilter = statusRaw === "open" || statusRaw === "done" ? statusRaw : "all";
  const priorityRaw = String(resolvedSearchParams.priority ?? "").trim();
  const priorityFilter: TaskPriority | "all" =
    priorityRaw === "low" || priorityRaw === "medium" || priorityRaw === "high" ? priorityRaw : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const projectWithColorResult = await supabase
    .from("projects")
    .select("id, name, color")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("archived_at", null)
    .single();

  let project = projectWithColorResult.data;
  let projectError = projectWithColorResult.error;

  if (projectError?.code === "42703") {
    const fallbackQuery = await supabase
      .from("projects")
      .select("id, name")
      .eq("id", id)
      .eq("user_id", user.id)
      .is("archived_at", null)
      .single();

    project = fallbackQuery.data ? { ...fallbackQuery.data, color: DEFAULT_PROJECT_COLOR } : null;
    projectError = fallbackQuery.error;
  }

  if (projectError) {
    if (projectError.code === "PGRST116") notFound();
    throw new Error(projectError.message);
  }

  let tasksQuery = supabase
    .from("tasks")
    .select("id, title, done, priority, due_at, created_at")
    .eq("project_id", id)
    .eq("user_id", user.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (taskQuery) tasksQuery = tasksQuery.ilike("title", `%${taskQuery}%`);
  if (statusFilter === "open") tasksQuery = tasksQuery.eq("done", false);
  if (statusFilter === "done") tasksQuery = tasksQuery.eq("done", true);
  if (priorityFilter !== "all") tasksQuery = tasksQuery.eq("priority", priorityFilter);

  const { data: tasksData, error: tasksError } = await tasksQuery;
  if (tasksError) throw new Error(tasksError.message);

  const { data: notesData, error: notesError } = await supabase
    .from("notes")
    .select("id, content, created_at, category, source")
    .eq("app_name", project!.name)
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  if (notesError) throw new Error(notesError.message);
  const notes = (notesData ?? []) as NoteRow[];

  const tasks = ((tasksData ?? []) as TaskRow[]).map((task) => ({
    ...task,
    priority: normalizeTaskPriority(task.priority),
  }));

  tasks.sort((a, b) => {
    const priorityComparison = compareTaskPriority(a.priority, b.priority);
    if (priorityComparison !== 0) return priorityComparison;
    if (a.due_at && b.due_at) {
      const dueComparison = new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      if (dueComparison !== 0) return dueComparison;
    } else if (a.due_at && !b.due_at) return -1;
    else if (!a.due_at && b.due_at) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const typedProject = project as ProjectRow;
  const projectColor = normalizeProjectColor(typedProject.color);
  const doneCount = tasks.filter((task) => task.done).length;
  const openCount = tasks.length - doneCount;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/projects">
            <ChevronLeft className="size-4" />
            Zurück zu Projects
          </Link>
        </Button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block size-3 rounded-full" style={{ backgroundColor: projectColor }} />
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{typedProject.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground">Tasks für dieses Projekt verwalten.</p>
          <p className="text-xs text-muted-foreground">
            Gesamt: {tasks.length} | Offen: {openCount} | Erledigt: {doneCount}
          </p>
        </div>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Neuer Task</CardTitle>
            <DeleteProjectButton projectId={typedProject.id} redirectTo="/projects" />
          </div>
          <CardDescription>Füge dem Projekt einen Task hinzu.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createTask} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <input type="hidden" name="projectId" value={typedProject.id} />
            <Input
              name="title"
              placeholder="Task Titel"
              required
              minLength={1}
              maxLength={240}
              className="sm:min-w-64 sm:flex-1"
            />
            <select
              name="priority"
              defaultValue={DEFAULT_TASK_PRIORITY}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="high">Hoch</option>
              <option value="medium">Mittel</option>
              <option value="low">Niedrig</option>
            </select>
            <Input name="dueAt" type="datetime-local" className="sm:w-auto" />
            <Button type="submit" className="w-full sm:w-auto">
              Hinzufügen
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Suche & Filter</CardTitle>
          <CardDescription>
            Filtere Tasks nach Titel, Status und Priorität.{" "}
            {taskQuery || statusFilter !== "all" || priorityFilter !== "all" ? `Treffer: ${tasks.length}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center">
            <Input
              name="q"
              placeholder="z. B. Apfel, Rechnung, Follow-up"
              defaultValue={taskQuery}
              className="sm:min-w-64"
            />
            <select
              name="status"
              defaultValue={statusFilter}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="all">Alle</option>
              <option value="open">Offen</option>
              <option value="done">Erledigt</option>
            </select>
            <select
              name="priority"
              defaultValue={priorityFilter}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="all">Alle Prioritäten</option>
              <option value="high">Hoch</option>
              <option value="medium">Mittel</option>
              <option value="low">Niedrig</option>
            </select>
            <Button type="submit" variant="outline" className="w-full sm:w-auto">
              Filtern
            </Button>
            {taskQuery || statusFilter !== "all" || priorityFilter !== "all" ? (
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <Link href={`/projects/${typedProject.id}`}>Zurücksetzen</Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {tasks.length ? (
          tasks.map((task) => (
            <Card key={task.id} className="border-border/70 shadow-sm">
              <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <TaskToggleForm taskId={task.id} done={task.done} />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className={task.done ? "line-through text-muted-foreground" : ""}>{task.title}</p>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${priorityBadgeClass[task.priority]}`}
                      >
                        {priorityLabel[task.priority]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Erstellt am {formatDateTimeEU(task.created_at)}</p>
                    {task.due_at ? <p className="text-xs text-muted-foreground">Termin: {formatDateTimeEU(task.due_at)}</p> : null}
                    <details>
                      <summary className="cursor-pointer text-xs text-muted-foreground">Bearbeiten</summary>
                      <form action={updateTask} className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <input type="hidden" name="taskId" value={task.id} />
                        <Input
                          name="title"
                          defaultValue={task.title}
                          required
                          minLength={1}
                          maxLength={240}
                          className="sm:min-w-64 sm:flex-1"
                        />
                        <select
                          name="priority"
                          defaultValue={task.priority}
                          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        >
                          <option value="high">Hoch</option>
                          <option value="medium">Mittel</option>
                          <option value="low">Niedrig</option>
                        </select>
                        <Input
                          name="dueAt"
                          type="datetime-local"
                          defaultValue={formatDateTimeInputValue(task.due_at)}
                          className="sm:w-auto"
                        />
                        <Button type="submit" size="sm" className="sm:w-auto">
                          Speichern
                        </Button>
                      </form>
                    </details>
                  </div>
                </div>
                <div className="self-end sm:self-auto">
                  <DeleteTaskForm taskId={task.id} projectId={typedProject.id} action={deleteTask} />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {taskQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Keine Tasks für den aktuellen Filter gefunden."
                  : "Noch keine Tasks vorhanden. Erstelle deinen ersten Task."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Notizen</h2>
        <div className="grid gap-4">
          {notes.length ? (
            notes.map((note) => {
              const cat = note.category ?? "note";
              const badgeClass = NOTE_CATEGORY_COLORS[cat] ?? NOTE_CATEGORY_COLORS.note;
              return (
                <Card key={note.id} className="border-border/70 shadow-sm">
                  <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
                          {NOTE_CATEGORY_LABELS[cat] ?? cat}
                        </span>
                        {note.source && (
                          <span className="text-xs text-muted-foreground">von {note.source}</span>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap break-words">{note.content}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTimeEU(note.created_at)}</p>
                    </div>
                    <div className="self-end sm:self-auto">
                      <DeleteNoteForm noteId={note.id} action={deleteNote} />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Keine Notizen für dieses Projekt vorhanden.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


