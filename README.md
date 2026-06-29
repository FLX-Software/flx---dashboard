# FLX Dashboard

Internes Dashboard für die Geschäftsführung von FLX Software.

## Features

- **Anmeldung** mit E-Mail und Passwort (Supabase Auth)
- **E-Mail-Postfach** für info@flx-software.de (IMAP-Integration)
- **Support-Tickets** erstellen, bearbeiten und per Kanban verwalten
- **Aufgaben** (To-Do) mit Status: Offen, In Bearbeitung, Erledigt
- **Kalender** für Termine von Mitarbeitern und sich selbst
- **Dark & Light Mode** im FLX Design (Electric Blue)

## Schnellstart

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Supabase einrichten

1. Erstellen Sie ein Projekt auf [supabase.com](https://supabase.com)
2. Führen Sie die Migration aus: `supabase/migrations/001_initial_schema.sql` im SQL Editor
3. Erstellen Sie Benutzer unter **Authentication → Users** (E-Mail + Passwort)
4. Kopieren Sie URL und Anon Key in `.env.local`:

```bash
cp .env.local.example .env.local
```

### 3. E-Mail konfigurieren (Microsoft Graph)

E-Mails werden über die **Microsoft Graph API** mit OAuth2 (Client Credentials) abgerufen – kein IMAP, kein Basic Auth, kein App-Passwort.

1. **Azure App-Registrierung** erstellen (Microsoft Entra ID → App-Registrierungen)
2. **Application Permissions** hinzufügen und Admin-Einwilligung erteilen:
   - `Mail.Read` – E-Mails abrufen
   - `Mail.ReadWrite` – als gelesen markieren und löschen
3. **Client Secret** erstellen
4. Werte in `.env.local` eintragen:

```env
MICROSOFT_TENANT_ID=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MAILBOX_USER=info@flx-software.de
```

Ohne Konfiguration werden Demo-E-Mails angezeigt.

### 4. Website-Tickets (API)

Die Website sendet Tickets an `POST /api/tickets/public` mit Header `X-API-Key`.

**Dashboard (Vercel):**
```env
TICKET_API_SECRET=flx-ticket-sync-8k2m9p4x7n1q
```

**Website (Vercel):**
```env
DASHBOARD_API_URL=https://flx-dashboard.vercel.app
DASHBOARD_API_KEY=flx-ticket-sync-8k2m9p4x7n1q
```

`DASHBOARD_API_KEY` und `TICKET_API_SECRET` müssen identisch sein.

**Persistenz auf Vercel:** Ohne Supabase unter **Vercel → Storage → Blob** einen Store erstellen und mit dem Dashboard-Projekt verbinden (`BLOB_READ_WRITE_TOKEN` wird automatisch gesetzt).

### 5. Entwicklungsserver starten

```bash
npm run dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, PostgreSQL)
- Microsoft Graph API (E-Mail-Abruf via OAuth2)

## Projektstruktur

```
src/
  app/
    dashboard/     # Geschützte Dashboard-Seiten
    login/         # Anmeldung
    api/emails/    # E-Mail API
  components/      # UI-Komponenten
  lib/             # Supabase, Actions, Types
supabase/
  migrations/      # Datenbankschema
```
