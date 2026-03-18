import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateTimeEU } from "@/lib/date-format";
import { createNote, deleteNote } from "../notes/actions";
import { DeleteNoteForm } from "../notes/delete-note-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FeedbackRow = {
  id: string;
  content: string;
  created_at: string;
  app_name: string | null;
  source: string | null;
  archived_at: string | null;
};

const APP_OPTIONS = ["gartenplaner", "aria", "dishboard", "neoflow"];

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string; q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const filterApp = String(resolvedSearchParams.app ?? "").trim();
  const query = String(resolvedSearchParams.q ?? "").trim();

  const supabase = await createClient();

  let feedbackQuery = supabase
    .from("notes")
    .select("id, content, created_at, app_name, source, archived_at")
    .eq("category", "feedback")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (filterApp) feedbackQuery = feedbackQuery.eq("app_name", filterApp);
  if (query) feedbackQuery = feedbackQuery.ilike("content", `%${query}%`);

  const { data: items, error } = await feedbackQuery;
  if (error) throw new Error(error.message);

  const count = items?.length ?? 0;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Feedback</h1>
        <p className="text-sm text-muted-foreground">
          User-Feedback von Testern und Früh-Nutzern. Gesamt: {count}
        </p>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Neues Feedback erfassen</CardTitle>
          <CardDescription>Trage Feedback von Testern manuell ein.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createNote} className="flex flex-col gap-3">
            <input type="hidden" name="category" value="feedback" />
            <textarea
              name="content"
              placeholder="Feedback-Inhalt..."
              required
              minLength={1}
              maxLength={2000}
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                name="app_name"
                defaultValue="gartenplaner"
                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {APP_OPTIONS.map((app) => (
                  <option key={app} value={app}>{app.charAt(0).toUpperCase() + app.slice(1)}</option>
                ))}
              </select>
              <Input name="source" placeholder="Von wem? (z.B. Max, Tester 1)" className="sm:flex-1" />
              <Input name="reply_email" type="email" placeholder="E-Mail (für Antwort, optional)" className="sm:flex-1" />
              <Button type="submit" className="w-full sm:w-auto">
                Speichern
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input name="q" placeholder="Suchen..." defaultValue={query} className="sm:flex-1" />
            <select
              name="app"
              defaultValue={filterApp}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Alle Apps</option>
              {APP_OPTIONS.map((app) => (
                <option key={app} value={app}>{app.charAt(0).toUpperCase() + app.slice(1)}</option>
              ))}
            </select>
            <Button type="submit" variant="outline" className="w-full sm:w-auto">Filtern</Button>
            {(filterApp || query) && (
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <Link href="/feedback">Zurücksetzen</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {items?.length ? (
          items.map((item) => (
            <Card key={item.id} className="border-border/70 shadow-sm">
              <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.app_name && (
                      <span className="inline-flex items-center rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-400">
                        {item.app_name}
                      </span>
                    )}
                    {item.source && (
                      <span className="text-xs text-muted-foreground">von {item.source}</span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap break-words">{item.content}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTimeEU(item.created_at)}</p>
                </div>
                <div className="self-end sm:self-auto">
                  <DeleteNoteForm noteId={item.id} action={deleteNote} />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {filterApp || query ? "Kein Feedback für diesen Filter." : "Noch kein Feedback erfasst."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
