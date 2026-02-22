"use client";

import { ARCHIVE_UNDO_STORAGE_KEY, type ArchiveUndoItem } from "@/lib/archive-undo";

export function setArchiveUndoItem(item: ArchiveUndoItem) {
  sessionStorage.setItem(ARCHIVE_UNDO_STORAGE_KEY, JSON.stringify(item));
}

export function getArchiveUndoItem() {
  const raw = sessionStorage.getItem(ARCHIVE_UNDO_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as ArchiveUndoItem;
    if (!parsed?.id || !parsed?.kind || !parsed?.archivedAt || !parsed?.expiresAt) {
      sessionStorage.removeItem(ARCHIVE_UNDO_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(ARCHIVE_UNDO_STORAGE_KEY);
    return null;
  }
}

export function clearArchiveUndoItem() {
  sessionStorage.removeItem(ARCHIVE_UNDO_STORAGE_KEY);
}
