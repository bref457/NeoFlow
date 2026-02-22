export const PROJECT_PASTEL_COLORS = [
  "#A8E6CF",
  "#B8E0FF",
  "#FFD3B6",
  "#FFDFBA",
  "#FFAAA5",
  "#D4A5FF",
  "#FFF3B0",
  "#C7CEEA",
] as const;

export const DEFAULT_PROJECT_COLOR = PROJECT_PASTEL_COLORS[0];

const PROJECT_COLOR_SET = new Set<string>(PROJECT_PASTEL_COLORS);

export function normalizeProjectColor(value: unknown): string {
  const color = String(value ?? "").trim().toUpperCase();
  return PROJECT_COLOR_SET.has(color) ? color : DEFAULT_PROJECT_COLOR;
}
