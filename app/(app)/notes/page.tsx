import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateTimeEU } from "@/lib/date-format";
import { createNote, deleteNote, updateNote } from "./actions";
import { DeleteNoteForm } from "./delete-note-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type NoteRow = {
  id: string;
  content: string;
  created_at: string;
  category: string | null;
  app_name: string | null;
  source: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  note: "Notiz",
  feedback: "Feedback",
  brainstorming: "Brainstorming",
  infra: "Infra",
  claude: "Claude",
};

const CATEGORY_COLORS: Record<string, string> = {
  note: "bg-muted text-muted-foreground",
  feedback: "bg-blue-500/15 text-blue-400",
  brainstorming: "bg-purple-500/15 text-purple-400",
  infra: "bg-orange-500/15 text-orange-400",
  claude: "bg-green-500/15 text-green-400",
};

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; app?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = String(resolvedSearchParams.q ?? "").trim();
  const filterCategory = String(resolvedSearchParams.category ?? "").trim();
  const filterApp = String(resolvedSearchParams.app ?? "").trim();

  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .is("archived_at", null)
    .order("name");

  let notesQuery = supabase
    .from("notes")
    .select("id, content, created_at, category, app_name, source")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (query) {
    notesQuery = notesQuery.ilike("content", `%${query}%`);
  }
  if (filterCategory) {
    notesQuery = notesQuery.eq("category", filterCategory);
  }
  if (filterApp) {
    notesQuery = notesQuery.eq("app_name", filterApp);
  }

  const { data: notes, error } = await notesQuery;
  if (error) {
    throw new Error(error.message);
  }

  const noteCount = (notes as NoteRow[] | null)?.length ?? 0;
  const hasFilter = !!(query || filterCategory || filterApp);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Notes</h1>
        <p className="text-sm text-muted-foreground">Erstelle und verwalte deine Notizen.</p>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Neue Notiz</CardTitle>
          <CardDescription>Füge schnell eine weitere Notiz hinzu.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createNote} className="flex flex-col gap-3">
            <Input name="content" placeholder="Neue Notiz eingeben..." required minLength={1} maxLength={2000} />
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                name="category"
                defaultValue="note"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-auto"
              >
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <select
                name="app_name"
                defaultValue=""
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-auto"
              >
                <option value="">Kein Projekt</option>
                {(projects ?? []).map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
              <Input name="source" placeholder="Quelle (optional)" className="sm:flex-1" />
              <Button type="submit" className="w-full sm:w-auto">
                Hinzufügen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Filter</CardTitle>
          <CardDescription>
            {hasFilter ? `Treffer: ${noteCount}` : `Gesamt: ${noteCount}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="get" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Input
              name="q"
              placeholder="Suchbegriff..."
              defaultValue={query}
              className="sm:min-w-48 sm:flex-1"
            />
            <select
              name="category"
              defaultValue={filterCategory}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Alle Kategorien</option>
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <select
              name="app"
              defaultValue={filterApp}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Alle Projekte</option>
              {(projects ?? []).map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <Button type="submit" variant="outline" className="w-full sm:w-auto">
              Filtern
            </Button>
            {hasFilter ? (
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <Link href="/notes">Zurücksetzen</Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {(notes as NoteRow[] | null)?.length ? (
          notes.map((note) => {
            const cat = note.category ?? "note";
            const badgeClass = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.note;
            return (
              <Card key={note.id} className="border-border/70 shadow-sm">
                <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
                        {CATEGORY_LABELS[cat] ?? cat}
                      </span>
                      {note.app_name && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {note.app_name}
                        </span>
                      )}
                      {note.source && (
                        <span className="text-xs text-muted-foreground">von {note.source}</span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap break-words">{note.content}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTimeEU(note.created_at)}</p>
                    <details>
                      <summary className="cursor-pointer text-xs text-muted-foreground">Bearbeiten</summary>
                      <form action={updateNote} className="mt-2 flex flex-col gap-2">
                        <input type="hidden" name="noteId" value={note.id} />
                        <Input
                          name="content"
                          defaultValue={note.content}
                          required
                          minLength={1}
                          maxLength={2000}
                        />
                        <div className="flex flex-wrap gap-2">
                          <select
                            name="category"
                            defaultValue={note.category ?? "note"}
                            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                          >
                            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                          <select
                            name="app_name"
                            defaultValue={note.app_name ?? ""}
                            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                          >
                            <option value="">Kein Projekt</option>
                            {(projects ?? []).map((p) => (
                              <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                          </select>
                          <Button type="submit" size="sm">Speichern</Button>
                        </div>
                      </form>
                    </details>
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
              <p className="text-sm text-muted-foreground">
                {hasFilter ? "Keine Notizen für diesen Filter gefunden." : "Noch keine Notes vorhanden."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
