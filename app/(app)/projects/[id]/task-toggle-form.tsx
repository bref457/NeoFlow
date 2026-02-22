"use client";

import { useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleTask } from "./actions";

type TaskToggleFormProps = {
  taskId: string;
  done: boolean;
};

export function TaskToggleForm({ taskId, done }: TaskToggleFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={toggleTask} className="flex items-center">
      <input type="hidden" name="taskId" value={taskId} />
      <Checkbox
        name="done"
        checked={done}
        onCheckedChange={() => {
          formRef.current?.requestSubmit();
        }}
        aria-label="Task Status umschalten"
      />
    </form>
  );
}
