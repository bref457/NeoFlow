# NeoFlow – Stack Dokumentation

## Übersicht
NeoFlow ist die persönliche Kontrollzentrale von Fabio. Sie vereint Projekte, Tasks, Notizen, Kalender und Mission Control (VPS-Monitoring) an einem Ort.

**Live:** https://neo457.ch
**Repo:** https://github.com/bref457/NeoFlow

---

## Technologien

| Bereich | Technologie | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| Sprache | TypeScript | ^5 |
| UI | React | 19.2.3 |
| Styling | Tailwind CSS v4 | latest |
| Komponenten | shadcn/ui | latest |
| Animationen | Magic UI (BorderBeam, MagicCard, NumberTicker) | latest |
| Datenbank | Supabase (PostgreSQL) | latest |
| Auth | Supabase Auth | latest |

---

## Architektur

```
app/
├── (app)/          → Geschützte Seiten (nach Login)
│   ├── dashboard/  → Übersicht mit Stats
│   ├── projects/   → Projekte + Projekt-Detail
│   ├── notes/      → Notizen (inkl. Task-Kategorie)
│   ├── calendar/   → Kalender mit Projekt-Verknüpfung
│   └── trash/      → Papierkorb (soft-delete)
├── (auth)/         → Login
└── page.tsx        → Landing Page (öffentlich)
```

### Datenbankschema (Supabase)
- **projects** – Projekte (name, color, archived_at)
- **notes** – Notizen & Tasks (content, category, app_name, done, priority, due_date)
- **calendar_entries** – Kalendereinträge (title, date, app_name)
- **tasks** – Legacy Tasks pro Projekt (wird langfristig durch notes ersetzt)

### Server Actions
Alle Datenbankoperationen laufen über Next.js Server Actions (`"use server"`) — kein separates API-Layer nötig.

---

## Deployment

**Platform:** Vercel (automatisch bei git push auf `master`)

```bash
git push origin master
# → Vercel baut und deployed automatisch
```

---

## Supabase

- **Projekt-ID:** `rnefrykihngtoromgppv`
- **Region:** EU (Frankfurt)
- **Auth:** E-Mail + Passwort

---

## Lokale Entwicklung

```bash
git clone https://github.com/bref457/NeoFlow.git
cd NeoFlow
npm install
cp .env.example .env.local
# .env.local mit Supabase-Keys füllen
npm run dev
```

### Benötigte Umgebungsvariablen
Siehe `.env.example` im Repo.
