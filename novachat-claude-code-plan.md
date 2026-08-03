# NovaChat – Build-Plan für Claude Code

## 1. Was hier entsteht

NovaChat ist ein Team-Chat-Tool im Stil von Slack: Workspace mit Channels, Direktnachrichten, Threads, Live-Updates und Benutzerverwaltung. Es ist eine React/Next.js-Neuimplementierung eines bestehenden Angular-Projekts (Firebase/Firestore-Backend bleibt konzeptionell gleich) – **gleicher Funktionsumfang und gleiche Komplexität**, nicht vereinfacht. Ziel ist ein eigenständiges Portfolio-Projekt, kein Tutorial-Clone in reduzierter Form.

Bitte diesen Plan als verbindliche Spezifikation behandeln: Reihenfolge der Build-Phasen einhalten, Datenmodell wie beschrieben verwenden, keine Features aus Punkt 5 weglassen oder durch Platzhalter ersetzen, außer es wird explizit vermerkt.

## 2. Tech-Stack

- **Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion (für Panel-Übergänge, Thread-Öffnen, Reaktions-Popups)
- **Backend/Realtime:** Firebase (Auth + Firestore), `onSnapshot` für Live-Updates
- **State:** React Context oder Zustand für aktiven Channel/Thread/User-Session (kein Redux nötig)
- **Formulare/Validierung:** react-hook-form + zod
- **Icons:** lucide-react

## 3. Datenmodell (Firestore)

```
users/{uid}
  - uid: string
  - name: string
  - email: string
  - avatarUrl: string
  - status: "online" | "away" | "offline"
  - createdAt: timestamp

channels/{channelId}
  - name: string
  - description: string
  - createdBy: uid
  - memberIds: string[]
  - createdAt: timestamp

channels/{channelId}/messages/{messageId}
  - senderId: uid
  - text: string
  - createdAt: timestamp
  - editedAt: timestamp | null
  - reactions: { emoji: string, userIds: string[] }[]
  - threadReplyCount: number
  - mentionedUserIds: string[]

channels/{channelId}/messages/{messageId}/thread/{replyId}
  - senderId: uid
  - text: string
  - createdAt: timestamp
  - editedAt: timestamp | null

directMessages/{dmId}   // dmId = sortierte Kombination beider uids
  - participantIds: [uid, uid]

directMessages/{dmId}/messages/{messageId}
  - (gleiche Felder wie channel messages)
```

## 4. Feature-Liste (verbindlich, nicht kürzen)

### Auth
- Registrierung mit E-Mail/Passwort, inkl. Validierung (zod)
- Login mit E-Mail/Passwort und Google-Auth
- Passwort-vergessen-Flow (Reset-Mail via Firebase Auth)
- Avatar-Auswahl bei Registrierung: 6 vorgegebene Avatare, Auswahl wird in `users/{uid}.avatarUrl` gespeichert
- Route Protection: nicht eingeloggte Nutzer werden von `/chat/*` auf `/login` umgeleitet (Next.js Middleware)

### Layout
- 3-Spalten-Layout: Sidebar (Channels + DMs), Chat-Bereich, optionales Thread-Panel (rechts, ein-/ausblendbar)
- Mobile: Spalten werden zu Stack-Navigation (eine Ansicht sichtbar, Zurück-Navigation zwischen Sidebar → Chat → Thread)

### Sidebar
- Liste aller Channels, denen der Nutzer angehört
- Liste aller aktiven Direktnachrichten-Konversationen
- "Channel erstellen"-Button öffnet Modal (Name, Beschreibung, Mitglieder hinzufügen)
- Nutzer-Suche zum Start einer neuen Direktnachricht
- Online-Status-Indikator pro Nutzer in DM-Liste

### Chat-Bereich
- Scrollbare Nachrichtenliste, gruppiert nach Datum, mit "vor X Minuten/Stunden"-Zeitformatierung
- Nachricht senden (Enter zum Senden, Shift+Enter für neue Zeile)
- Eigene Nachrichten bearbeiten und löschen
- Emoji-Reaktionen auf Nachrichten (Hinzufügen/Entfernen, Anzeige mit Zähler)
- @-Mentions mit Autocomplete-Dropdown über Kanalmitglieder
- Klick auf Nachricht → "In Thread antworten" öffnet Thread-Panel

### Thread-Panel
- Zeigt Ursprungsnachricht + alle Replies chronologisch
- Eigene Antworten senden, bearbeiten, löschen
- Schließen des Panels über X oder Escape

### Channel-Verwaltung
- Channel bearbeiten (Name, Beschreibung) – nur durch Ersteller
- Mitglieder hinzufügen/entfernen
- Mitgliederliste mit Avatar + Name anzeigen

### Profil
- Profilmenü oben rechts: Name, Avatar, Status ändern
- Profil-Einstellungen: Name, Avatar, E-Mail bearbeiten
- Logout

## 5. Ordnerstruktur

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (chat)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── middleware.ts
├── lib/
│   ├── firebase/config.ts
│   ├── services/{auth.ts, db.ts}
│   ├── repositories/{users.ts, channels.ts, messages.ts}
│   └── hooks/{useAuth.ts, useChannels.ts, useMessages.ts, useThread.ts}
├── components/
│   ├── shell/{Sidebar.tsx, MainLayout.tsx}
│   ├── chat/{ChatArea.tsx, MessageList.tsx, MessageItem.tsx, MessageInput.tsx, ThreadPanel.tsx}
│   ├── channels/{ChannelForm.tsx, ChannelMembers.tsx}
│   ├── auth/{LoginForm.tsx, RegisterForm.tsx, AvatarSelection.tsx, ForgotPasswordForm.tsx}
│   └── profile/{ProfileMenu.tsx, ProfileSettings.tsx}
├── types/{channel.ts, user.ts, message.ts}
└── utils/relativeTime.ts
```

## 6. Build-Phasen (in dieser Reihenfolge umsetzen)

1. **Setup:** Next.js + TypeScript + Tailwind + Firebase-Projekt-Config (Env-Variablen aus `.env.local`, nicht hardcoden). Firebase-Zugangsdaten als Platzhalter markieren, echte Werte liefert der Nutzer selbst.
2. **Auth-Flow:** Login, Register, Avatar-Auswahl, Passwort-vergessen, Middleware für Route Protection. Erst wenn dieser Flow steht, weiter zu 3.
3. **Grundlayout:** 3-Spalten-Layout inkl. Responsive-Verhalten (auch ohne echte Daten, mit Mock-Daten testbar).
4. **Channels:** Channel erstellen/bearbeiten, Mitgliederverwaltung, Sidebar-Liste an echte Firestore-Daten anbinden.
5. **Messaging:** Nachrichten senden/anzeigen mit `onSnapshot`, bearbeiten/löschen, Zeitformatierung.
6. **Reaktionen & Mentions:** Emoji-Reaktionen, @-Mention-Autocomplete.
7. **Threads:** Thread-Panel, Replies, Reply-Zähler in der Hauptnachricht.
8. **Direktnachrichten:** Nutzer-Suche, DM-Konversationen anlegen und laden.
9. **Profil:** Profilmenü, Profil-Einstellungen, Status ändern, Logout.
10. **Politur:** Framer-Motion-Übergänge (Panel-Öffnen, Reaktions-Popup), leere Zustände (kein Channel ausgewählt, keine Nachrichten), Fehlerzustände (Firestore-Fehler, Auth-Fehler), Ladezustände (Skeleton für Nachrichtenliste).

Nach jeder Phase kurz innehalten und den aktuellen Stand lauffähig lassen, bevor die nächste Phase beginnt – nicht alle Phasen in einem Rutsch ohne Zwischenstand durchziehen.

## 7. Nicht-funktionale Anforderungen

- Vollständig responsive: 375px, 768px, 1440px testen
- Tastaturbedienbarkeit für Formulare, Nachrichteneingabe, Modal-Schließen (Escape)
- Sichtbare Lade-, Leer-, Fehler- und Erfolgszustände für: Login, Nachricht senden, Channel erstellen
- Keine Secrets im Code – Firebase-Config über Umgebungsvariablen
