export const CALENDAR_RECURRENCE_RULES = ["none", "daily", "weekly", "monthly", "yearly"] as const;

export type CalendarRecurrenceRule = (typeof CALENDAR_RECURRENCE_RULES)[number];

export const DEFAULT_CALENDAR_RECURRENCE_RULE: CalendarRecurrenceRule = "none";

const CALENDAR_RECURRENCE_SET = new Set<string>(CALENDAR_RECURRENCE_RULES);

export function normalizeCalendarRecurrenceRule(value: unknown): CalendarRecurrenceRule {
  const rule = typeof value === "string" ? value.toLowerCase().trim() : "";
  return CALENDAR_RECURRENCE_SET.has(rule)
    ? (rule as CalendarRecurrenceRule)
    : DEFAULT_CALENDAR_RECURRENCE_RULE;
}

function addMonthsUtcClamped(date: Date, months: number) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  const ms = date.getUTCMilliseconds();

  const targetMonthIndex = month + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
  const clampedDay = Math.min(day, lastDay);

  return new Date(Date.UTC(targetYear, normalizedMonth, clampedDay, hour, minute, second, ms));
}

function nextOccurrenceUtc(date: Date, rule: CalendarRecurrenceRule) {
  if (rule === "daily") {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + 1);
    return next;
  }
  if (rule === "weekly") {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + 7);
    return next;
  }
  if (rule === "monthly") {
    return addMonthsUtcClamped(date, 1);
  }
  if (rule === "yearly") {
    return addMonthsUtcClamped(date, 12);
  }
  return new Date(date);
}

export type CalendarEntryWithRecurrence = {
  id: string;
  starts_at: string;
  recurrence_rule: CalendarRecurrenceRule;
  recurrence_until: string | null;
};

export type CalendarEntryOccurrence = {
  entryId: string;
  occurrenceAt: string;
};

export function expandCalendarEntryOccurrencesInRange(
  entry: CalendarEntryWithRecurrence,
  rangeStartInclusive: Date,
  rangeEndExclusive: Date,
) {
  const startsAt = new Date(entry.starts_at);
  if (Number.isNaN(startsAt.getTime())) {
    return [] as CalendarEntryOccurrence[];
  }

  const rule = normalizeCalendarRecurrenceRule(entry.recurrence_rule);
  const until = entry.recurrence_until ? new Date(entry.recurrence_until) : null;
  const hasUntil = until && !Number.isNaN(until.getTime());

  if (rule === "none") {
    if (startsAt >= rangeStartInclusive && startsAt < rangeEndExclusive) {
      return [{ entryId: entry.id, occurrenceAt: startsAt.toISOString() }];
    }
    return [];
  }

  const occurrences: CalendarEntryOccurrence[] = [];
  let current = new Date(startsAt);
  let safety = 0;

  if ((rule === "daily" || rule === "weekly") && current < rangeStartInclusive) {
    const intervalMs = rule === "daily" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const diff = rangeStartInclusive.getTime() - current.getTime();
    const jumpSteps = Math.floor(diff / intervalMs);
    if (jumpSteps > 0) {
      current = new Date(current.getTime() + jumpSteps * intervalMs);
    }
  }

  while (current < rangeEndExclusive && safety < 5000) {
    if (hasUntil && current > (until as Date)) {
      break;
    }
    if (current >= rangeStartInclusive) {
      occurrences.push({ entryId: entry.id, occurrenceAt: current.toISOString() });
    }
    current = nextOccurrenceUtc(current, rule);
    safety += 1;
  }

  return occurrences;
}
