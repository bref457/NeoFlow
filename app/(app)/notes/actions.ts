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

  const category = String(formData.get("category") ?? "note").trim();
  const app_name = String(formData.get("app_name") ?? "").trim() || null;
  const source = String(formData.get("source") ?? "").trim() || null;
  const priority = String(formData.get("priority") ?? "").trim() || null;
  const due_date = String(formData.get("due_date") ?? "").trim() || null;

  const validCategories = ["note", "feedback", "brainstorming", "infra", "claude", "task"];

  const { error } = await supabase.from("notes").insert({
    user_id: user.id,
    content,
    category: validCategories.includes(category) ? category : "note",
    app_name: app_name || null,
    source: source || null,
    priority: category === "task" && priority ? priority : null,
    due_date: category === "task" && due_date ? due_date : null,
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
  const category = String(formData.get("category") ?? "note").trim();
  const app_name = String(formData.get("app_name") ?? "").trim() || null;

  if (!noteId || !content) {
    return;
  }

  const { error } = await supabase
    .from("notes")
    .update({
      content,
      category: ["note", "feedback", "brainstorming", "infra", "claude"].includes(category) ? category : "note",
      app_name: app_name || null,
    })
    .eq("id", noteId)
    .eq("user_id", user.id)
    .is("archived_at", null);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
}

export async function markNoteDone(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const noteId = String(formData.get("noteId") ?? "");
  const done = formData.get("done") === "true";

  if (!noteId) return;

  const { error } = await supabase
    .from("notes")
    .update({ done })
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/notes");
  revalidatePath("/projects/[id]");
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
