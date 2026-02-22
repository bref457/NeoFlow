"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeProjectColor } from "@/lib/project-colors";

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const color = normalizeProjectColor(formData.get("color"));
  if (!name) {
    return;
  }

  let data: { id: string } | null = null;
  let error: { code?: string; message: string } | null = null;

  const insertWithColor = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name,
      color,
    })
    .select("id")
    .single();

  data = insertWithColor.data;
  error = insertWithColor.error;

  if (error?.code === "42703") {
    const fallbackInsert = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
      })
      .select("id")
      .single();

    data = fallbackInsert.data;
    error = fallbackInsert.error;
  }

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("Project could not be created");
  }

  revalidatePath("/projects");
  redirect(`/projects/${data.id}`);
}

export async function deleteProject(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const projectId = String(formData.get("project_id") ?? "");
  if (!projectId) {
    return null;
  }

  const archivedAt = new Date().toISOString();

  const { error } = await supabase
    .from("projects")
    .update({ archived_at: archivedAt })
    .eq("id", projectId)
    .eq("user_id", userData.user.id)
    .is("archived_at", null);

  if (error) {
    throw new Error(error.message);
  }

  const { error: tasksArchiveError } = await supabase
    .from("tasks")
    .update({ archived_at: archivedAt })
    .eq("project_id", projectId)
    .eq("user_id", userData.user.id)
    .is("archived_at", null);

  if (tasksArchiveError) {
    throw new Error(tasksArchiveError.message);
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return { id: projectId, archivedAt };
}

export async function updateProject(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const projectId = String(formData.get("project_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const color = normalizeProjectColor(formData.get("color"));

  if (!projectId || !name) {
    return;
  }

  const { error } = await supabase
    .from("projects")
    .update({ name, color })
    .eq("id", projectId)
    .eq("user_id", userData.user.id)
    .is("archived_at", null);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
}

export async function restoreProject(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const projectId = String(formData.get("project_id") ?? "");
  const archivedAt = String(formData.get("archived_at") ?? "");

  if (!projectId || !archivedAt) {
    return;
  }

  const { error } = await supabase
    .from("projects")
    .update({ archived_at: null })
    .eq("id", projectId)
    .eq("user_id", userData.user.id)
    .eq("archived_at", archivedAt);

  if (error) {
    throw new Error(error.message);
  }

  const { error: tasksRestoreError } = await supabase
    .from("tasks")
    .update({ archived_at: null })
    .eq("project_id", projectId)
    .eq("user_id", userData.user.id)
    .eq("archived_at", archivedAt);

  if (tasksRestoreError) {
    throw new Error(tasksRestoreError.message);
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
}
