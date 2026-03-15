import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateTimeEU } from "@/lib/date-format";
import { createProject, updateProject } from "./actions";
import { DeleteProjectButton } from "./delete-project-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEFAULT_PROJECT_COLOR, PROJECT_PASTEL_COLORS, normalizeProjectColor } from "@/lib/project-colors";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";

type ProjectRow = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; color?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = String(resolvedSearchParams.q ?? "").trim();
  const colorParam = String(resolvedSearchParams.color ?? "").trim();
  const colorFilter = PROJECT_PASTEL_COLORS.includes(colorParam as typeof PROJECT_PASTEL_COLORS[number]) ? colorParam as typeof PROJECT_PASTEL_COLORS[number] : "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let projectsWithColorQuery = supabase
    .from("projects")
    .select("id, name, color, created_at")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (query) {
    projectsWithColorQuery = projectsWithColorQuery.ilike("name", `%${query}%`);
  }
  if (colorFilter) {
    projectsWithColorQuery = projectsWithColorQuery.eq("color", colorFilter);
  }

  const projectsWithColorResult = await projectsWithColorQuery;
  let projects = projectsWithColorResult.data;
  let error = projectsWithColorResult.error;

  if (error?.code === "42703") {
    let fallbackQuery = supabase
      .from("projects")
      .select("id, name, created_at")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (query) {
      fallbackQuery = fallbackQuery.ilike("name", `%${query}%`);
    }

    const fallbackResult = await fallbackQuery;
    projects = (fallbackResult.data ?? [])
      .map((project) => ({ ...project, color: DEFAULT_PROJECT_COLOR }))
      .filter((project) => !colorFilter || project.color === colorFilter);
    error = fallbackResult.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  const typedProjects = (projects ?? []) as ProjectRow[];

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Projects</h1>
        <p className="text-sm text-muted-foreground">Verwalte deine Projekte und ihre Tasks.</p>
      </div>

      <Card className="relative overflow-hidden border-border/70 shadow-sm">
        <BorderBeam size={80} duration={8} colorFrom="#9E7AFF" colorTo="#FE8BBB" />
        <CardHeader>
          <CardTitle>Neues Projekt</CardTitle>
          <CardDescription>Erstelle ein Projekt als Container für deine Tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createProject} className="space-y-4">
            <Input name="name" placeholder="Projektname" required minLength={1} maxLength={120} />
            <div className="space-y-2">
              <p className="text-sm font-medium">Projektfarbe</p>
              <div className="flex flex-wrap gap-2">
                {PROJECT_PASTEL_COLORS.map((color, index) => (
                  <label key={color} className="cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={color}
                      className="peer sr-only"
                      defaultChecked={index === 0}
                    />
                    <span
                      className="block size-8 rounded-full border border-border shadow-sm ring-offset-background transition peer-checked:ring-2 peer-checked:ring-ring peer-checked:ring-offset-2"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" className="sm:w-auto">
              Erstellen
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Suche & Filter</CardTitle>
          <CardDescription>
            Filtere Projekte nach Namen und Farbe. {query || colorFilter ? `Treffer: ${typedProjects.length}` : `Gesamt: ${typedProjects.length}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
            <Input name="q" placeholder="z. B. Einkauf, Arbeit, Zuhause" defaultValue={query} className="sm:min-w-64" />
            <select
              name="color"
              defaultValue={colorFilter}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="">Alle Farben</option>
              {PROJECT_PASTEL_COLORS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline" className="w-full sm:w-auto">
              Filtern
            </Button>
            {query || colorFilter ? (
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <Link href="/projects">Zurücksetzen</Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {typedProjects.length ? (
          typedProjects.map((project) => {
            const projectColor = normalizeProjectColor(project.color);
            return (
              <Card
                key={project.id}
                className="border-border/70 shadow-sm"
                style={{ borderLeftWidth: "6px", borderLeftColor: projectColor || DEFAULT_PROJECT_COLOR }}
              >
                <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: projectColor }} />
                      <p className="font-medium">{project.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Erstellt am {formatDateTimeEU(project.created_at)}</p>
                    <details>
                      <summary className="cursor-pointer text-xs text-muted-foreground">Bearbeiten</summary>
                      <form action={updateProject} className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input type="hidden" name="project_id" value={project.id} />
                        <Input
                          name="name"
                          defaultValue={project.name}
                          required
                          minLength={1}
                          maxLength={120}
                          className="sm:min-w-52"
                        />
                        <select
                          name="color"
                          defaultValue={projectColor}
                          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        >
                          {PROJECT_PASTEL_COLORS.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" size="sm" className="sm:w-auto">
                          Speichern
                        </Button>
                      </form>
                    </details>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                      <Link href={`/projects/${project.id}`}>Öffnen</Link>
                    </Button>
                    <DeleteProjectButton projectId={project.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {query || colorFilter
                  ? "Keine Projekte für den aktuellen Filter gefunden."
                  : "Noch keine Projekte vorhanden. Erstelle dein erstes Projekt."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


