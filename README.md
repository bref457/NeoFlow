# NeoFlow

Persönliche Kontrollzentrale für Projekt-Management, Notizen, Kalender und Mission Control.

**Live:** [neo457.ch](https://neo457.ch)

## Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui + Magic UI
- Supabase (Auth + Postgres)
- Vercel Deployment

## Features

- **Dashboard** – Übersicht: Projekte, Tasks, Notizen, Abschlussquote
- **Projekte** – Projektverwaltung mit Tasks, Prioritäten und Fälligkeitsdaten
- **Notizen** – Kategorien: Notiz / Feedback / Brainstorming / Infra / Claude / Task
- **Kalender** – Termine mit Projekt-Zuordnung
- **Mission Control** – VPS-Status, Docker-Services, System-Monitoring
- **Papierkorb** – Archivierte Einträge wiederherstellen

## Telegram Bot (NeoFlow__CC)

Claude Code läuft als Telegram-Bot auf dem VPS — Sprach- und Textnachrichten werden direkt verarbeitet. Whisper (faster-whisper) transkribiert Sprachnachrichten automatisch.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

`.env.local` benötigt:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Deploy

Automatisch via Vercel bei jedem Push auf `master`.
