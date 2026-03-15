"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CATEGORY_LABELS: Record<string, string> = {
  note: "Notiz",
  feedback: "Feedback",
  brainstorming: "Brainstorming",
  infra: "Infra",
  claude: "Claude",
  task: "Task",
};

type Props = {
  action: (formData: FormData) => Promise<void>;
  projects?: { id: string; name: string }[];
  defaultProjectName?: string; // vorausgefüllt wenn im Projekt-Kontext
};

export function NoteForm({ action, projects, defaultProjectName }: Props) {
  const [category, setCategory] = useState("note");

  return (
    <form action={action} className="flex flex-col gap-3">
      {defaultProjectName && (
        <input type="hidden" name="app_name" value={defaultProjectName} />
      )}
      <Input name="content" placeholder="Inhalt..." required minLength={1} maxLength={2000} />
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        {category === "task" && (
          <>
            <select
              name="priority"
              defaultValue="mittel"
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="hoch">Hoch</option>
              <option value="mittel">Mittel</option>
              <option value="niedrig">Niedrig</option>
            </select>
            <Input name="due_date" type="datetime-local" className="sm:w-auto" />
          </>
        )}

        {!defaultProjectName && projects && (
          <select
            name="app_name"
            defaultValue=""
            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Kein Projekt</option>
            {projects.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        )}

        <Input name="source" placeholder="Quelle (optional)" className="sm:flex-1" />
        <Button type="submit" className="w-full sm:w-auto">Hinzufügen</Button>
      </div>
    </form>
  );
}
