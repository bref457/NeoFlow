"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "./actions";
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

type DeleteProjectButtonProps = {
  projectId: string;
  redirectTo?: string;
};

export function DeleteProjectButton({ projectId, redirectTo }: DeleteProjectButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("project_id", projectId);
      const result = await deleteProject(formData);
      if (!result) {
        return;
      }

      setArchiveUndoItem({
        kind: "project",
        id: result.id,
        archivedAt: result.archivedAt,
        expiresAt: Date.now() + ARCHIVE_UNDO_WINDOW_MS,
        label: "Projekt gelöscht",
        redirectTo,
      });

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
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
          <AlertDialogTitle>Projekt löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Das Projekt wird in den Papierkorb verschoben. Zugehörige Tasks ebenfalls.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            Projekt löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

