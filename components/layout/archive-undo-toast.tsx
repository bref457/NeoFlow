"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { restoreProject } from "@/app/(app)/projects/actions";
import { restoreTask } from "@/app/(app)/projects/[id]/actions";
import { restoreNote } from "@/app/(app)/notes/actions";
import { restoreCalendarEntry } from "@/app/(app)/calendar/actions";
import { type ArchiveUndoItem } from "@/lib/archive-undo";
import { clearArchiveUndoItem, getArchiveUndoItem } from "@/lib/archive-undo-client";

export function ArchiveUndoToast() {
  const router = useRouter();
  const [item, setItem] = useState<ArchiveUndoItem | null>(null);
  const [now, setNow] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const sync = () => {
      const stored = getArchiveUndoItem();
      if (!stored) {
        setItem(null);
        return;
      }
      if (stored.expiresAt <= Date.now()) {
        clearArchiveUndoItem();
        setItem(null);
        return;
      }
      setItem(stored);
    };

    sync();
    const interval = window.setInterval(() => {
      setNow(Date.now());
      sync();
    }, 250);

    return () => window.clearInterval(interval);
  }, []);

  const secondsLeft = useMemo(() => {
    if (!item) {
      return 0;
    }
    return Math.max(0, Math.ceil((item.expiresAt - now) / 1000));
  }, [item, now]);

  if (!item) {
    return null;
  }

  const handleUndo = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("archived_at", item.archivedAt);

      if (item.kind === "project") {
        formData.set("project_id", item.id);
        await restoreProject(formData);
      } else if (item.kind === "task") {
        formData.set("taskId", item.id);
        formData.set("projectId", item.projectId ?? "");
        await restoreTask(formData);
      } else if (item.kind === "note") {
        formData.set("noteId", item.id);
        await restoreNote(formData);
      } else if (item.kind === "calendar_entry") {
        formData.set("entryId", item.id);
        await restoreCalendarEntry(formData);
      }

      clearArchiveUndoItem();
      setItem(null);

      if (item.redirectTo) {
        router.push(item.redirectTo);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-lg border bg-background p-3 shadow-lg">
      <p className="text-sm font-medium">{item.label}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Gelöscht. Du kannst die Aktion noch {secondsLeft}s rückgängig machen.
      </p>
      <div className="mt-3 flex justify-end">
        <Button type="button" size="sm" variant="outline" onClick={handleUndo} disabled={isPending}>
          Rückgängig
        </Button>
      </div>
    </div>
  );
}

