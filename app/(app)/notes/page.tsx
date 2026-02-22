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
};

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = String(resolvedSearchParams.q ?? "").trim();
  const supabase = await createClient();

  let notesQuery = supabase
    .from("notes")
    .select("id, content, created_at")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (query) {
    notesQuery = notesQuery.ilike("content", `%${query}%`);
  }

  const { data: notes, error } = await notesQuery;
  if (error) {
    throw new Error(error.message);
  }

  const noteCount = (notes as NoteRow[] | null)?.length ?? 0;

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
          <form action={createNote} className="flex flex-col gap-3 sm:flex-row">
            <Input name="content" placeholder="Neue Notiz eingeben..." required minLength={1} maxLength={2000} />
            <Button type="submit" className="w-full sm:w-auto">
              Hinzufügen
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Suche</CardTitle>
          <CardDescription>
            Durchsuche deine Notizen nach Inhalt. {query ? `Treffer: ${noteCount}` : `Gesamt: ${noteCount}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              name="q"
              placeholder="z. B. Einkauf, Idee, Meeting"
              defaultValue={query}
              className="sm:min-w-64 sm:flex-1"
            />
            <Button type="submit" variant="outline" className="w-full sm:w-auto">
              Filtern
            </Button>
            {query ? (
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <Link href="/notes">Zurücksetzen</Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {(notes as NoteRow[] | null)?.length ? (
          notes.map((note) => (
            <Card key={note.id} className="border-border/70 shadow-sm">
              <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="whitespace-pre-wrap break-words">{note.content}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTimeEU(note.created_at)}</p>
                  <details>
                    <summary className="cursor-pointer text-xs text-muted-foreground">Bearbeiten</summary>
                    <form action={updateNote} className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input type="hidden" name="noteId" value={note.id} />
                      <Input
                        name="content"
                        defaultValue={note.content}
                        required
                        minLength={1}
                        maxLength={2000}
                        className="sm:flex-1"
                      />
                      <Button type="submit" size="sm" className="sm:w-auto">
                        Speichern
                      </Button>
                    </form>
                  </details>
                </div>
                <div className="self-end sm:self-auto">
                  <DeleteNoteForm noteId={note.id} action={deleteNote} />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {query ? "Keine Notizen für diesen Suchbegriff gefunden." : "Noch keine Notes vorhanden."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


