"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createNote(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const content = String(formData.get("content") ?? "").trim();
  if (!content) {
    return;
  }

  const { error } = await supabase.from("notes").insert({
    user_id: user.id,
    content,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
}

export async function deleteNote(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const noteId = String(formData.get("noteId") ?? "");
  if (!noteId) {
    return null;
  }

  const archivedAt = new Date().toISOString();

  const { error } = await supabase
    .from("notes")
    .update({ archived_at: archivedAt })
    .eq("id", noteId)
    .eq("user_id", user.id)
    .is("archived_at", null);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
  return { id: noteId, archivedAt };
}

export async function updateNote(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const noteId = String(formData.get("noteId") ?? "");
  const content = String(formData.get("content") ?? "").trim();

  if (!noteId || !content) {
    return;
  }

  const { error } = await supabase
    .from("notes")
    .update({ content })
    .eq("id", noteId)
    .eq("user_id", user.id)
    .is("archived_at", null);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
}

export async function restoreNote(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const noteId = String(formData.get("noteId") ?? "");
  const archivedAt = String(formData.get("archived_at") ?? "");

  if (!noteId || !archivedAt) {
    return;
  }

  const { error } = await supabase
    .from("notes")
    .update({ archived_at: null })
    .eq("id", noteId)
    .eq("user_id", user.id)
    .eq("archived_at", archivedAt);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
}
