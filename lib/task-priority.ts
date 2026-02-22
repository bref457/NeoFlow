export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const DEFAULT_TASK_PRIORITY: TaskPriority = "medium";

const TASK_PRIORITY_SET = new Set<string>(TASK_PRIORITIES);

export function normalizeTaskPriority(value: unknown): TaskPriority {
  const priority = typeof value === "string" ? value.toLowerCase().trim() : "";
  return TASK_PRIORITY_SET.has(priority) ? (priority as TaskPriority) : DEFAULT_TASK_PRIORITY;
}

const TASK_PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function compareTaskPriority(a: TaskPriority, b: TaskPriority) {
  return TASK_PRIORITY_ORDER[a] - TASK_PRIORITY_ORDER[b];
}

