"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

function revalidateAll() {
  revalidatePath("/trash");
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/notes");
}

export async function restoreFromTrash(formData: FormData) {
  const { supabase, user } = await requireUser();
  const kind = String(formData.get("kind") ?? "");
  const id = String(formData.get("id") ?? "");
  const archivedAt = String(formData.get("archived_at") ?? "");

  if (!kind || !id || !archivedAt) {
    return;
  }

  if (kind === "project") {
    const { error } = await supabase
      .from("projects")
      .update({ archived_at: null })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("archived_at", archivedAt);

    if (error) {
      throw new Error(error.message);
    }

    const { error: taskError } = await supabase
      .from("tasks")
      .update({ archived_at: null })
      .eq("project_id", id)
      .eq("user_id", user.id)
      .eq("archived_at", archivedAt);

    if (taskError) {
      throw new Error(taskError.message);
    }
  } else if (kind === "task") {
    const { error } = await supabase
      .from("tasks")
      .update({ archived_at: null })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("archived_at", archivedAt);

    if (error) {
      throw new Error(error.message);
    }
  } else if (kind === "note") {
    const { error } = await supabase
      .from("notes")
      .update({ archived_at: null })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("archived_at", archivedAt);

    if (error) {
      throw new Error(error.message);
    }
  } else if (kind === "calendar_entry") {
    const { error } = await supabase
      .from("calendar_entries")
      .update({ archived_at: null })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("archived_at", archivedAt);

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidateAll();
}

export async function deleteFromTrash(formData: FormData) {
  const { supabase, user } = await requireUser();
  const kind = String(formData.get("kind") ?? "");
  const id = String(formData.get("id") ?? "");

  if (!kind || !id) {
    return;
  }

  if (kind === "project") {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .not("archived_at", "is", null);

    if (error) {
      throw new Error(error.message);
    }
  } else if (kind === "task") {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .not("archived_at", "is", null);

    if (error) {
      throw new Error(error.message);
    }
  } else if (kind === "note") {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .not("archived_at", "is", null);

    if (error) {
      throw new Error(error.message);
    }
  } else if (kind === "calendar_entry") {
    const { error } = await supabase
      .from("calendar_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .not("archived_at", "is", null);

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidateAll();
}
