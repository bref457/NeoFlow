export const ARCHIVE_UNDO_STORAGE_KEY = "vibe.archiveUndo";
export const ARCHIVE_UNDO_WINDOW_MS = 10_000;

export type ArchiveUndoKind = "project" | "task" | "note" | "calendar_entry";

export type ArchiveUndoItem = {
  kind: ArchiveUndoKind;
  id: string;
  archivedAt: string;
  expiresAt: number;
  label: string;
  projectId?: string;
  redirectTo?: string;
};
