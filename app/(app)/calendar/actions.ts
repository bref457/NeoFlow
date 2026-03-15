"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_CALENDAR_RECURRENCE_RULE,
  normalizeCalendarRecurrenceRule,
} from "@/lib/calendar-recurrence";

async function requireUser() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  return { supabase, user: userData.user };
}

export async function createCalendarEntry(formData: FormData) {
  const { supabase, user } = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "");
  const recurrenceRule = normalizeCalendarRecurrenceRule(formData.get("recurrenceRule"));
  const recurrenceUntilRaw = String(formData.get("recurrenceUntil") ?? "").trim();

  if (!title || !startsAtRaw) {
    return;
  }

  const startsAt = new Date(startsAtRaw);
  if (Number.isNaN(startsAt.getTime())) {
    return;
  }

  let recurrenceUntilIso: string | null = null;
  if (recurrenceRule !== DEFAULT_CALENDAR_RECURRENCE_RULE && recurrenceUntilRaw) {
    const recurrenceUntil = new Date(`${recurrenceUntilRaw}T23:59:59`);
    if (!Number.isNaN(recurrenceUntil.getTime()) && recurrenceUntil >= startsAt) {
      recurrenceUntilIso = recurrenceUntil.toISOString();
    }
  }

  const app_name = String(formData.get("app_name") ?? "").trim() || null;

  const { error } = await supabase.from("calendar_entries").insert({
    user_id: user.id,
    title,
    note: note || null,
    starts_at: startsAt.toISOString(),
    recurrence_rule: recurrenceRule,
    recurrence_until: recurrenceUntilIso,
    app_name,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/calendar");
}

export async function deleteCalendarEntry(formData: FormData) {
  const { supabase, user } = await requireUser();
  const entryId = String(formData.get("entryId") ?? "");

  if (!entryId) {
    return null;
  }

  const archivedAt = new Date().toISOString();

  const { error } = await supabase
    .from("calendar_entries")
    .update({ archived_at: archivedAt })
    .eq("id", entryId)
    .eq("user_id", user.id)
    .is("archived_at", null);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/calendar");
  return { id: entryId, archivedAt };
}

export async function updateCalendarEntry(formData: FormData) {
  const { supabase, user } = await requireUser();
  const entryId = String(formData.get("entryId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "");
  const recurrenceRule = normalizeCalendarRecurrenceRule(formData.get("recurrenceRule"));
  const recurrenceUntilRaw = String(formData.get("recurrenceUntil") ?? "").trim();

  if (!entryId || !title || !startsAtRaw) {
    return;
  }

  const startsAt = new Date(startsAtRaw);
  if (Number.isNaN(startsAt.getTime())) {
    return;
  }

  let recurrenceUntilIso: string | null = null;
  if (recurrenceRule !== DEFAULT_CALENDAR_RECURRENCE_RULE && recurrenceUntilRaw) {
    const recurrenceUntil = new Date(`${recurrenceUntilRaw}T23:59:59`);
    if (!Number.isNaN(recurrenceUntil.getTime()) && recurrenceUntil >= startsAt) {
      recurrenceUntilIso = recurrenceUntil.toISOString();
    }
  }

  const app_name = String(formData.get("app_name") ?? "").trim() || null;

  const { error } = await supabase
    .from("calendar_entries")
    .update({
      title,
      note: note || null,
      starts_at: startsAt.toISOString(),
      recurrence_rule: recurrenceRule,
      recurrence_until: recurrenceUntilIso,
      app_name,
    })
    .eq("id", entryId)
    .eq("user_id", user.id)
    .is("archived_at", null);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/calendar");
}

export async function restoreCalendarEntry(formData: FormData) {
  const { supabase, user } = await requireUser();
  const entryId = String(formData.get("entryId") ?? "");
  const archivedAt = String(formData.get("archived_at") ?? "");

  if (!entryId || !archivedAt) {
    return;
  }

  const { error } = await supabase
    .from("calendar_entries")
    .update({ archived_at: null })
    .eq("id", entryId)
    .eq("user_id", user.id)
    .eq("archived_at", archivedAt);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/calendar");
}
