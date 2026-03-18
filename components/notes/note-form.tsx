"use client";

import { useRef, useState } from "react";
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
  defaultProjectName?: string;
};

export function NoteForm({ action, projects, defaultProjectName }: Props) {
  const [category, setCategory] = useState("note");
  const [appName, setAppName] = useState(defaultProjectName ?? "");
  const [priority, setPriority] = useState("mittel");
  const [dueDate, setDueDate] = useState("");
  const [classifying, setClassifying] = useState(false);
  const contentRef = useRef<HTMLInputElement>(null);

  async function handleAutoClassify() {
    const text = contentRef.current?.value?.trim();
    if (!text) return;

    setClassifying(true);
    try {
      const res = await fetch("/api/classify-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.category) setCategory(data.category);
      if (data.app_name !== undefined) setAppName(data.app_name ?? "");
      if (data.priority) setPriority(data.priority);
      if (data.due_date) setDueDate(data.due_date.slice(0, 16));
    } finally {
      setClassifying(false);
    }
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      {defaultProjectName && (
        <input type="hidden" name="app_name" value={defaultProjectName} />
      )}
      <div className="flex gap-2">
        <Input
          ref={contentRef}
          name="content"
          placeholder="Inhalt..."
          required
          minLength={1}
          maxLength={2000}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAutoClassify}
          disabled={classifying}
          className="shrink-0"
          title="Automatisch klassifizieren"
        >
          {classifying ? "..." : "Auto ✨"}
        </Button>
      </div>
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
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="hoch">Hoch</option>
              <option value="mittel">Mittel</option>
              <option value="niedrig">Niedrig</option>
            </select>
            <Input
              name="due_date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="sm:w-auto"
            />
          </>
        )}

        {!defaultProjectName && projects && (
          <select
            name="app_name"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
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
