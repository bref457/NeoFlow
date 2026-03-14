# NeoFlow

Persönliches Web-Interface für ARIA und zentrales Projekt-Management-Tool.

**Live:** [neo457.ch](https://neo457.ch)

## Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase (Auth + Postgres)
- Vercel Deployment

## Features

### ARIA Integration
- **Chat** – Direkter Chat mit ARIA (LLM via OpenRouter)
- **Commands** – ARIA-Kommandos ausführen
- **Mission Control** – System-Status und Services-Übersicht

### NeoFlow (Projekt-Management)
- **Dashboard** – KPIs: Projekte, Tasks, Notes, Abschlussquote
- **Notes** – Notizen mit Kategorien (Notiz / Feedback / Brainstorming / Infra / Claude) und App-Filter
- **Projects + Tasks** – Projektverwaltung mit Prioritäten und Fälligkeitsdaten
- **Calendar** – Kalender mit Wiederholungsregeln
- **Feedback** – User-Feedback von Testern, filterbar nach App
- **Papierkorb** – Archivierte Einträge wiederherstellen

### Claude MCP Zugriff
Claude Code kann via Supabase REST API direkt Einträge schreiben (Notes, Tasks) – mit Kategorie `claude` als Badge erkennbar.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

`.env.local` benötigt:
```
ARIA_API_URL=...
ARIA_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## Deploy

Automatisch via Vercel bei jedem Push auf `master`.
