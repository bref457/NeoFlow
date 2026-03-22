import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateEU, formatDateTimeEU } from "@/lib/date-format";
import { createCalendarEntry, deleteCalendarEntry, updateCalendarEntry } from "./actions";
import { DeleteCalendarEntryForm } from "./delete-calendar-entry-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_PROJECT_COLOR, normalizeProjectColor } from "@/lib/project-colors";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  CALENDAR_RECURRENCE_RULES,
  expandCalendarEntryOccurrencesInRange,
  normalizeCalendarRecurrenceRule,
  type CalendarRecurrenceRule,
} from "@/lib/calendar-recurrence";

type CalendarEntryRow = {
  id: string;
  title: string;
  note: string | null;
  starts_at: string;
  recurrence_rule: CalendarRecurrenceRule;
  recurrence_until: string | null;
  app_name: string | null;
};

type DueTaskRow = {
  id: string;
  title: string;
  project_id: string;
  due_at: string;
};

type ProjectRow = {
  id: string;
  name: string;
  color: string;
};

const recurrenceLabel: Record<CalendarRecurrenceRule, string> = {
  none: "Einmalig",
  daily: "Täglich",
  weekly: "Wöchentlich",
  monthly: "Monatlich",
  yearly: "Jährlich",
};

function parseMonth(monthValue?: string) {
  const current = new Date();
  const fallbackYear = current.getFullYear();
  const fallbackMonthIndex = current.getMonth();

  if (!monthValue || !/^\d{4}-\d{2}$/.test(monthValue)) {
    return { year: fallbackYear, monthIndex: fallbackMonthIndex };
  }

  const [yearRaw, monthRaw] = monthValue.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return { year: fallbackYear, monthIndex: fallbackMonthIndex };
  }

  return { year, monthIndex: month - 1 };
}

function formatMonthValue(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTimeInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function formatDateTimeInputValueFromIso(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return formatDateTimeInputValue(date);
}

function formatDateInputValueFromIso(value: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return formatDateValue(date);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; date?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { year, monthIndex } = parseMonth(resolvedSearchParams.month);
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 1);
  const previousMonth = new Date(year, monthIndex - 1, 1);
  const nextMonth = new Date(year, monthIndex + 1, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const monthValue = formatMonthValue(year, monthIndex);
  const todayValue = formatDateValue(new Date());

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [entriesResult, dueTasksResult, projectsWithColorResult] = await Promise.all([
    supabase
      .from("calendar_entries")
      .select("id, title, note, starts_at, recurrence_rule, recurrence_until, app_name")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .lt("starts_at", monthEnd.toISOString())
      .order("starts_at", { ascending: true }),
    supabase
      .from("tasks")
      .select("id, title, project_id, due_at")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .not("due_at", "is", null)
      .gte("due_at", monthStart.toISOString())
      .lt("due_at", monthEnd.toISOString())
      .order("due_at", { ascending: true }),
    supabase.from("projects").select("id, name, color").eq("user_id", user.id).is("archived_at", null),
  ]);

  let projectsError = projectsWithColorResult.error;
  let projectsData = projectsWithColorResult.data;

  if (projectsError?.code === "42703") {
    const fallbackProjectsResult = await supabase
      .from("projects")
      .select("id, name")
      .eq("user_id", user.id)
      .is("archived_at", null);

    projectsError = fallbackProjectsResult.error;
    projectsData = (fallbackProjectsResult.data ?? []).map((project) => ({
      ...project,
      color: DEFAULT_PROJECT_COLOR,
    }));
  }

  if (entriesResult.error) {
    throw new Error(entriesResult.error.message);
  }
  if (dueTasksResult.error) {
    throw new Error(dueTasksResult.error.message);
  }
  if (projectsError) {
    throw new Error(projectsError.message);
  }

  const rawEntries = ((entriesResult.data ?? []) as CalendarEntryRow[]).map((entry) => ({
    ...entry,
    recurrence_rule: normalizeCalendarRecurrenceRule(entry.recurrence_rule),
  }));
  const typedDueTasks = (dueTasksResult.data ?? []) as DueTaskRow[];
  const typedProjects = (projectsData ?? []) as ProjectRow[];

  const projectNameById = new Map(typedProjects.map((project) => [project.id, project.name]));
  const projectColorById = new Map(
    typedProjects.map((project) => [project.id, normalizeProjectColor(project.color)]),
  );

  const selectedDate =
    resolvedSearchParams.date && /^\d{4}-\d{2}-\d{2}$/.test(resolvedSearchParams.date)
      ? resolvedSearchParams.date
      : todayValue.startsWith(`${monthValue}-`)
        ? todayValue
        : formatDateValue(monthStart);

  const entryById = new Map(rawEntries.map((entry) => [entry.id, entry]));
  const entriesByDay = new Map<string, Array<{ entryId: string; occurrenceAt: string }>>();

  for (const entry of rawEntries) {
    const occurrences = expandCalendarEntryOccurrencesInRange(entry, monthStart, monthEnd);
    for (const occurrence of occurrences) {
      const dayKey = formatDateValue(new Date(occurrence.occurrenceAt));
      const current = entriesByDay.get(dayKey) ?? [];
      current.push(occurrence);
      entriesByDay.set(dayKey, current);
    }
  }

  const dueTasksByDay = new Map<string, DueTaskRow[]>();
  for (const task of typedDueTasks) {
    const dayKey = formatDateValue(new Date(task.due_at));
    const current = dueTasksByDay.get(dayKey) ?? [];
    current.push(task);
    dueTasksByDay.set(dayKey, current);
  }

  const selectedEntries = (entriesByDay.get(selectedDate) ?? [])
    .map((occurrence) => {
      const entry = entryById.get(occurrence.entryId);
      if (!entry) {
        return null;
      }
      return { entry, occurrenceAt: occurrence.occurrenceAt };
    })
    .filter((value): value is { entry: CalendarEntryRow; occurrenceAt: string } => Boolean(value));

  const selectedDueTasks = dueTasksByDay.get(selectedDate) ?? [];
  const monthEntryCount = Array.from(entriesByDay.values()).reduce((acc, items) => acc + items.length, 0);
  const monthDueTaskCount = Array.from(dueTasksByDay.values()).reduce((acc, items) => acc + items.length, 0);
  const initialDateTime = formatDateTimeInputValue(new Date(`${selectedDate}T09:00:00`));
  const weekdayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Kalender</h1>
        <p className="text-sm text-muted-foreground">Notizen mit Datum und Uhrzeit planen.</p>
        <p className="text-xs text-muted-foreground">
          Dieser Monat: {monthEntryCount} Kalendereinträge, {monthDueTaskCount} fällige Tasks
        </p>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>
              {monthStart.toLocaleString("de-DE", { month: "long", year: "numeric" })}
            </CardTitle>
            <CardDescription>Wähle einen Tag und plane einen Eintrag.</CardDescription>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Link href={`/calendar?month=${formatMonthValue(previousMonth.getFullYear(), previousMonth.getMonth())}`}>
                Zurück
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Link href={`/calendar?month=${formatMonthValue(nextMonth.getFullYear(), nextMonth.getMonth())}`}>
                Weiter
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
            {weekdayNames.map((name) => (
              <p key={name}>{name}</p>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstWeekday }).map((_, index) => (
              <div key={`empty-${index}`} className="h-16 rounded-md border border-dashed bg-muted/30" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const date = new Date(year, monthIndex, day);
              const dayValue = formatDateValue(date);
              const calendarCount = entriesByDay.get(dayValue)?.length ?? 0;
              const dueTasksCount = dueTasksByDay.get(dayValue)?.length ?? 0;
              const count = calendarCount + dueTasksCount;
              const isSelected = dayValue === selectedDate;
              const isToday = dayValue === todayValue;

              return (
                <Link
                  key={dayValue}
                  href={`/calendar?month=${monthValue}&date=${dayValue}`}
                  className={`h-16 rounded-md border p-2 text-left transition hover:bg-accent ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : isToday
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-border/70"
                  }`}
                >
                  <p className="text-sm font-medium">{day}</p>
                  <p className="text-xs text-muted-foreground">{count ? `${count} Eintrag(e)` : "-"}</p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="relative overflow-hidden border-border/70 shadow-sm">
          <BorderBeam size={80} duration={8} colorFrom="#9E7AFF" colorTo="#FE8BBB" />
          <CardHeader>
            <CardTitle>Neuer Termin</CardTitle>
            <CardDescription>Notiz und Zeit für {formatDateEU(selectedDate)} eintragen.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCalendarEntry} className="space-y-3">
              <Input name="title" placeholder="Titel" required minLength={1} maxLength={160} />
              <Input name="startsAt" type="datetime-local" defaultValue={initialDateTime} required />
              <select
                name="app_name"
                defaultValue=""
                className="h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="">Kein Projekt</option>
                {typedProjects.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
              <select
                name="recurrenceRule"
                defaultValue="none"
                className="h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                {CALENDAR_RECURRENCE_RULES.map((rule) => (
                  <option key={rule} value={rule}>
                    {recurrenceLabel[rule]}
                  </option>
                ))}
              </select>
              <div className="space-y-1">
                <p className="text-sm font-medium">Enddatum</p>
                <Input name="recurrenceUntil" type="date" />
                <p className="text-xs text-muted-foreground">Optional. Nur relevant bei Wiederholung.</p>
              </div>
              <textarea
                name="note"
                placeholder="Notiz (optional)"
                maxLength={3000}
                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
              <Button type="submit">Eintrag speichern</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Einträge am {formatDateEU(selectedDate)}</CardTitle>
            <CardDescription>
              {selectedEntries.length + selectedDueTasks.length} Eintrag(e) gefunden.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedEntries.length && !selectedDueTasks.length ? (
              <p className="text-sm text-muted-foreground">Keine Einträge für diesen Tag.</p>
            ) : null}

            {selectedEntries.map(({ entry, occurrenceAt }) => (
              <div key={`${entry.id}:${occurrenceAt}`} className="rounded-lg border p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{entry.title}</p>
                      {entry.app_name && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {entry.app_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Termin {formatDateTimeEU(occurrenceAt)}</p>
                    {entry.recurrence_rule !== "none" ? (
                      <p className="text-xs text-muted-foreground">
                        Wiederholung: {recurrenceLabel[entry.recurrence_rule]}
                        {entry.recurrence_until ? ` bis ${formatDateEU(entry.recurrence_until)}` : ""}
                      </p>
                    ) : null}
                  </div>
                  <div className="self-end sm:self-auto">
                    <DeleteCalendarEntryForm entryId={entry.id} action={deleteCalendarEntry} />
                  </div>
                </div>
                {entry.note ? (
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">{entry.note}</p>
                ) : null}
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground">Bearbeiten</summary>
                  <form action={updateCalendarEntry} className="mt-2 space-y-2">
                    <input type="hidden" name="entryId" value={entry.id} />
                    <Input name="title" defaultValue={entry.title} required minLength={1} maxLength={160} />
                    <Input
                      name="startsAt"
                      type="datetime-local"
                      defaultValue={formatDateTimeInputValueFromIso(entry.starts_at)}
                      required
                    />
                    <select
                      name="app_name"
                      defaultValue={entry.app_name ?? ""}
                      className="h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    >
                      <option value="">Kein Projekt</option>
                      {typedProjects.map((p) => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                    <select
                      name="recurrenceRule"
                      defaultValue={entry.recurrence_rule}
                      className="h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    >
                      {CALENDAR_RECURRENCE_RULES.map((rule) => (
                        <option key={rule} value={rule}>
                          {recurrenceLabel[rule]}
                        </option>
                      ))}
                    </select>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Enddatum</p>
                      <Input
                        name="recurrenceUntil"
                        type="date"
                        defaultValue={formatDateInputValueFromIso(entry.recurrence_until)}
                      />
                      <p className="text-xs text-muted-foreground">Optional. Nur relevant bei Wiederholung.</p>
                    </div>
                    <textarea
                      name="note"
                      defaultValue={entry.note ?? ""}
                      placeholder="Notiz (optional)"
                      maxLength={3000}
                      className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    />
                    <Button type="submit" size="sm">
                      Speichern
                    </Button>
                  </form>
                </details>
              </div>
            ))}

            {selectedDueTasks.map((task) => (
              <div key={task.id} className="rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">Task-Termin {formatDateTimeEU(task.due_at)}</p>
                  <Button asChild variant="outline" size="sm" className="mt-1 w-fit">
                    <Link href={`/projects/${task.project_id}`}>
                      <span
                        className="mr-2 inline-block size-2 rounded-full"
                        style={{ backgroundColor: projectColorById.get(task.project_id) }}
                      />
                      Zu {projectNameById.get(task.project_id) ?? "Projekt"}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

