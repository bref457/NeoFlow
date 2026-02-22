import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateTimeEU } from "@/lib/date-format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteFromTrash, restoreFromTrash } from "./actions";
import { TrashItemActions } from "./trash-item-actions";

type ProjectTrashRow = {
  id: string;
  name: string;
  archived_at: string;
};

type TaskTrashRow = {
  id: string;
  title: string;
  project_id: string;
  archived_at: string;
};

type NoteTrashRow = {
  id: string;
  content: string;
  archived_at: string;
};

type CalendarTrashRow = {
  id: string;
  title: string;
  starts_at: string;
  archived_at: string;
};

export default async function TrashPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [projectsRes, tasksRes, notesRes, entriesRes, projectNamesRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, archived_at")
      .eq("user_id", user.id)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("id, title, project_id, archived_at")
      .eq("user_id", user.id)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false }),
    supabase
      .from("notes")
      .select("id, content, archived_at")
      .eq("user_id", user.id)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false }),
    supabase
      .from("calendar_entries")
      .select("id, title, starts_at, archived_at")
      .eq("user_id", user.id)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false }),
    supabase.from("projects").select("id, name").eq("user_id", user.id),
  ]);

  if (projectsRes.error) throw new Error(projectsRes.error.message);
  if (tasksRes.error) throw new Error(tasksRes.error.message);
  if (notesRes.error) throw new Error(notesRes.error.message);
  if (entriesRes.error) throw new Error(entriesRes.error.message);
  if (projectNamesRes.error) throw new Error(projectNamesRes.error.message);

  const archivedProjects = (projectsRes.data ?? []) as ProjectTrashRow[];
  const archivedTasks = (tasksRes.data ?? []) as TaskTrashRow[];
  const archivedNotes = (notesRes.data ?? []) as NoteTrashRow[];
  const archivedEntries = (entriesRes.data ?? []) as CalendarTrashRow[];
  const projectNameById = new Map((projectNamesRes.data ?? []).map((p) => [p.id, p.name]));
  const total =
    archivedProjects.length + archivedTasks.length + archivedNotes.length + archivedEntries.length;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Papierkorb</h1>
        <p className="text-sm text-muted-foreground">
          Gelöschte Einträge landen hier und können wiederhergestellt oder endgültig gelöscht werden.
        </p>
        <p className="text-xs text-muted-foreground">Insgesamt {total} Eintrag(e) im Papierkorb.</p>
      </div>

      {!total ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Der Papierkorb ist leer.</p>
          </CardContent>
        </Card>
      ) : null}

      {!!archivedProjects.length && (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Projekte</CardTitle>
            <CardDescription>{archivedProjects.length} Eintrag(e)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {archivedProjects.map((project) => (
              <div key={project.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Gelöscht am {formatDateTimeEU(project.archived_at)}
                  </p>
                </div>
                <TrashItemActions
                  kind="project"
                  id={project.id}
                  archivedAt={project.archived_at}
                  restoreAction={restoreFromTrash}
                  deleteAction={deleteFromTrash}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!!archivedTasks.length && (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>{archivedTasks.length} Eintrag(e)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {archivedTasks.map((task) => (
              <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Projekt: {projectNameById.get(task.project_id) ?? "Unbekannt"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Gelöscht am {formatDateTimeEU(task.archived_at)}
                  </p>
                </div>
                <TrashItemActions
                  kind="task"
                  id={task.id}
                  archivedAt={task.archived_at}
                  restoreAction={restoreFromTrash}
                  deleteAction={deleteFromTrash}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!!archivedNotes.length && (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Notizen</CardTitle>
            <CardDescription>{archivedNotes.length} Eintrag(e)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {archivedNotes.map((note) => (
              <div key={note.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0 space-y-1">
                  <p className="line-clamp-2 break-words">{note.content}</p>
                  <p className="text-xs text-muted-foreground">
                    Gelöscht am {formatDateTimeEU(note.archived_at)}
                  </p>
                </div>
                <TrashItemActions
                  kind="note"
                  id={note.id}
                  archivedAt={note.archived_at}
                  restoreAction={restoreFromTrash}
                  deleteAction={deleteFromTrash}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!!archivedEntries.length && (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Kalendereinträge</CardTitle>
            <CardDescription>{archivedEntries.length} Eintrag(e)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {archivedEntries.map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium">{entry.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Termin: {formatDateTimeEU(entry.starts_at)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Gelöscht am {formatDateTimeEU(entry.archived_at)}
                  </p>
                </div>
                <TrashItemActions
                  kind="calendar_entry"
                  id={entry.id}
                  archivedAt={entry.archived_at}
                  restoreAction={restoreFromTrash}
                  deleteAction={deleteFromTrash}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

