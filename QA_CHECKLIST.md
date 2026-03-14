# NeoFlow QA Checklist

Kurzer Smoke-Test vor `Commit + Push`.

## 1. Auth
- Login funktioniert.
- Logout funktioniert.

## 2. Notes
- Notiz erstellen, bearbeiten, löschen.
- Nach Löschen erscheint `Rückgängig` und funktioniert.
- Suchfilter (`q`) liefert korrekte Treffer.
- Kategorie-Filter (note/feedback/brainstorming/infra/claude) funktioniert.
- App-Filter (gartenplaner/aria/dishboard/neoflow) funktioniert.
- Kategorie-Badge erscheint korrekt auf jedem Eintrag.

## 2b. Feedback
- Feedback-Seite unter `/feedback` erreichbar.
- Neues Feedback mit App + Quelle erfassen.
- Filter nach App funktioniert.

## 3. Projects
- Projekt erstellen (inkl. Farbe), bearbeiten, löschen.
- Nach Löschen im Papierkorb sichtbar.
- Filter (Name/Farbe) funktioniert.

## 4. Tasks
- Task erstellen mit Priorität + optionalem Termin.
- Task bearbeiten (Titel/Priorität/Termin).
- Status umschalten (`offen/erledigt`) funktioniert.
- Sortierung wirkt sinnvoll: Priorität > Termin > Neueste.

## 5. Calendar
- Eintrag erstellen/bearbeiten/löschen.
- Wiederholung testen:
  - täglich ohne Enddatum
  - wöchentlich mit Enddatum
- Tagesansicht und Monatszähler stimmen.

## 6. Papierkorb
- Gelöschte Einträge erscheinen korrekt.
- `Wiederherstellen` funktioniert.
- `Endgültig löschen` funktioniert.

## 7. Mobile (iPhone-Check)
- Hauptseiten ohne gequetschte Buttons.
- Aktionen sind gut antippbar.
- Filter/Formulare bleiben bedienbar.

## 8. Tech
- `npm run lint` läuft ohne Fehler.

