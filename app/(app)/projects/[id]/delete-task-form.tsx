"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ARCHIVE_UNDO_WINDOW_MS } from "@/lib/archive-undo";
import { setArchiveUndoItem } from "@/lib/archive-undo-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DeleteTaskFormProps = {
  taskId: string;
  projectId: string;
  action: (
    formData: FormData,
  ) => Promise<{ id: string; archivedAt: string; projectId: string } | null | void>;
};

export function DeleteTaskForm({ taskId, projectId, action }: DeleteTaskFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("taskId", taskId);
      const result = await action(formData);
      if (!result) {
        return;
      }

      setArchiveUndoItem({
        kind: "task",
        id: result.id,
        archivedAt: result.archivedAt,
        projectId: result.projectId || projectId,
        expiresAt: Date.now() + ARCHIVE_UNDO_WINDOW_MS,
        label: "Task gelöscht",
      });

      router.refresh();
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="sm" disabled={isPending}>
          Löschen
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Task löschen?</AlertDialogTitle>
          <AlertDialogDescription>Der Task wird in den Papierkorb verschoben.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            Task löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

