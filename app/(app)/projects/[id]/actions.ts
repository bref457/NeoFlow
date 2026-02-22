"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeTaskPriority } from "@/lib/task-priority";

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

export async function createTask(formData: FormData) {
  const { supabase, user } = await requireUser();
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const dueAtRaw = String(formData.get("dueAt") ?? "");
  const priority = normalizeTaskPriority(formData.get("priority"));

  if (!projectId || !title) {
    return;
  }

  let dueAtIso: string | null = null;
  if (dueAtRaw) {
    const dueAt = new Date(dueAtRaw);
    if (!Number.isNaN(dueAt.getTime())) {
      dueAtIso = dueAt.toISOString();
    }
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("archived_at", null)
    .single();

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Project not found");
  }

  const { error } = await supabase.from("tasks").insert({
    project_id: projectId,
    user_id: user.id,
    title,
    due_at: dueAtIso,
    priority,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/calendar");
}

export async function toggleTask(formData: FormData) {
  const { supabase, user } = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");

  if (!taskId) {
    return;
  }

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id, done, project_id")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .is("archived_at", null)
    .single();

  if (taskError || !task) {
    throw new Error(taskError?.message ?? "Task not found");
  }

  const { error } = await supabase
    .from("tasks")
    .update({ done: !task.done })
    .eq("id", task.id)
    .eq("user_id", user.id)
    .is("archived_at", null);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${task.project_id}`);
  revalidatePath("/calendar");
}

export async function deleteTask(formData: FormData) {
  const { supabase, user } = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");

  if (!taskId) {
    return null;
  }

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id, project_id")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .is("archived_at", null)
    .single();

  if (taskError || !task) {
    throw new Error(taskError?.message ?? "Task not found");
  }

  const archivedAt = new Date().toISOString();

  const { error } = await supabase
    .from("tasks")
    .update({ archived_at: archivedAt })
    .eq("id", task.id)
    .is("archived_at", null);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${task.project_id}`);
  revalidatePath("/calendar");
  return { id: task.id, archivedAt, projectId: task.project_id };
}

export async function updateTask(formData: FormData) {
  const { supabase, user } = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const dueAtRaw = String(formData.get("dueAt") ?? "");
  const priority = normalizeTaskPriority(formData.get("priority"));

  if (!taskId || !title) {
    return;
  }

  let dueAtIso: string | null = null;
  if (dueAtRaw) {
    const dueAt = new Date(dueAtRaw);
    if (!Number.isNaN(dueAt.getTime())) {
      dueAtIso = dueAt.toISOString();
    }
  }

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id, project_id")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .is("archived_at", null)
    .single();

  if (taskError || !task) {
    throw new Error(taskError?.message ?? "Task not found");
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      due_at: dueAtIso,
      priority,
    })
    .eq("id", task.id)
    .eq("user_id", user.id)
    .is("archived_at", null);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${task.project_id}`);
  revalidatePath("/calendar");
}

export async function restoreTask(formData: FormData) {
  const { supabase, user } = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");
  const archivedAt = String(formData.get("archived_at") ?? "");
  const projectId = String(formData.get("projectId") ?? "");

  if (!taskId || !archivedAt || !projectId) {
    return;
  }

  const { error } = await supabase
    .from("tasks")
    .update({ archived_at: null })
    .eq("id", taskId)
    .eq("user_id", user.id)
    .eq("project_id", projectId)
    .eq("archived_at", archivedAt);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/calendar");
}
