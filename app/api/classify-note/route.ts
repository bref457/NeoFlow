import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Du klassifizierst Notizen für ein persönliches Projektmanagementsystem.
Antworte NUR als gültiges JSON-Objekt mit exakt diesen Feldern:
{
  "category": "task" | "feedback" | "brainstorming" | "infra" | "claude" | "note",
  "app_name": "NeoFlow" | "NeoGarden" | "NeoDish" | "ARIA" | null,
  "priority": "hoch" | "mittel" | "niedrig" | null,
  "due_date": "<ISO-8601-Datum>" | null
}

Regeln:
- task = konkrete Handlung / To-Do ("reparieren", "hinzufügen", "erstellen", "beheben", "anpassen")
- infra = Server, Docker, Deploy, nginx, VPS, SSH
- brainstorming = Ideen, Konzepte, "wäre cool wenn", "Überlegung", "was wenn"
- feedback = Rückmeldungen von Usern, Testerberichte
- claude = KI/Claude/LLM-spezifisches
- note = alles andere (allgemeine Notizen, Informationen)

Projekte:
- NeoFlow = Kontrollzentrale, Dashboard, Mission Control, Tasks, Notizen, Projects
- NeoGarden = Gartenplaner, Anzucht, Pflanzen, Flora
- NeoDish = Essenswochenplaner, Mahlzeiten, Rezepte, Küche
- ARIA = KI-Agent, OSINT, Kali, Scraper
- null = kein spezifisches Projekt erwähnt

Priority (nur bei task, sonst null):
- hoch = dringend, wichtig, sofort, kritisch
- niedrig = irgendwann, nice-to-have, wenn Zeit
- mittel = Standard wenn nichts Spezifisches erwähnt

due_date: Nur setzen wenn explizit ein Datum/Deadline erwähnt wird. Heutiges Datum: ${new Date().toISOString().split("T")[0]}

Antworte AUSSCHLIESSLICH mit dem JSON-Objekt, kein anderer Text.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
  }

  let text: string;
  try {
    const body = await request.json();
    text = String(body.text ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "anthropic/claude-haiku-4-5",
      max_tokens: 150,
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "AI request failed" }, { status: 502 });
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content ?? "";

  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    const validCategories = ["task", "feedback", "brainstorming", "infra", "claude", "note"];
    const validProjects = ["NeoFlow", "NeoGarden", "NeoDish", "ARIA", null];
    const validPriorities = ["hoch", "mittel", "niedrig", null];

    return NextResponse.json({
      category: validCategories.includes(parsed.category) ? parsed.category : "note",
      app_name: validProjects.includes(parsed.app_name) ? parsed.app_name : null,
      priority: validPriorities.includes(parsed.priority) ? parsed.priority : null,
      due_date: typeof parsed.due_date === "string" ? parsed.due_date : null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response", raw }, { status: 500 });
  }
}
