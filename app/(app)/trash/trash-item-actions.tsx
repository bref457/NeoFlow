"use client";

import { Button } from "@/components/ui/button";
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

type TrashItemActionsProps = {
  kind: "project" | "task" | "note" | "calendar_entry";
  id: string;
  archivedAt: string;
  restoreAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
};

export function TrashItemActions({
  kind,
  id,
  archivedAt,
  restoreAction,
  deleteAction,
}: TrashItemActionsProps) {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <form action={restoreAction} className="w-full sm:w-auto">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="archived_at" value={archivedAt} />
        <Button type="submit" size="sm" variant="outline" className="w-full sm:w-auto">
          Wiederherstellen
        </Button>
      </form>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" size="sm" variant="destructive" className="w-full sm:w-auto">
            Endgültig löschen
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Endgültig löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dieser Eintrag wird dauerhaft gelöscht und kann nicht wiederhergestellt werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <form action={deleteAction}>
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="id" value={id} />
              <AlertDialogAction type="submit" variant="destructive">
                Endgültig löschen
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

