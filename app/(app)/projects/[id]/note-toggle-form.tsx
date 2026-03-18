"use client";

import { useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { markNoteDone } from "@/app/(app)/notes/actions";

type Props = {
  noteId: string;
  done: boolean;
};

export function NoteToggleForm({ noteId, done }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={markNoteDone} className="flex items-center">
      <input type="hidden" name="noteId" value={noteId} />
      <input type="hidden" name="done" value={done ? "false" : "true"} />
      <Checkbox
        checked={done}
        onCheckedChange={() => {
          formRef.current?.requestSubmit();
        }}
        aria-label="Task Status umschalten"
      />
    </form>
  );
}
