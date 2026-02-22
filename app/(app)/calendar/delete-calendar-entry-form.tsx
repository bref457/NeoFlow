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

type DeleteCalendarEntryFormProps = {
  entryId: string;
  action: (formData: FormData) => Promise<{ id: string; archivedAt: string } | null | void>;
};

export function DeleteCalendarEntryForm({ entryId, action }: DeleteCalendarEntryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("entryId", entryId);
      const result = await action(formData);
      if (!result) {
        return;
      }

      setArchiveUndoItem({
        kind: "calendar_entry",
        id: result.id,
        archivedAt: result.archivedAt,
        expiresAt: Date.now() + ARCHIVE_UNDO_WINDOW_MS,
        label: "Kalendereintrag gelöscht",
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
          <AlertDialogTitle>Kalendereintrag löschen?</AlertDialogTitle>
          <AlertDialogDescription>Der Eintrag wird in den Papierkorb verschoben.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            Kalendereintrag löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

