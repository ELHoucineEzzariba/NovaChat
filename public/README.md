# NovaChat – Projekt-Assets

Alle hier enthaltenen Dateien sind bereits so benannt und strukturiert, dass sie 1:1 in
den `public/`-Ordner des im Build-Plan beschriebenen Next.js-App-Router-Projekts passen.
Einfach den kompletten Inhalt dieses Ordners in `novachat/public/` kopieren.

## Inhalt

```
public/
├── icons/                     Favicons & App-/PWA-Icons
│   ├── favicon.ico            Multi-Size (16/32/48px) – klassisches Favicon
│   ├── favicon.svg            Skalierbares Favicon (moderne Browser)
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon-48x48.png
│   ├── apple-touch-icon.png   180×180 – iOS Homescreen
│   ├── icon-192.png           PWA-Icon
│   ├── icon-512.png           PWA-Icon
│   ├── icon-1024.png          App-Store-taugliche Master-Größe
│   ├── maskable-icon-192.png  Android Adaptive Icon (Safe-Zone-Padding)
│   └── maskable-icon-512.png  Android Adaptive Icon (Safe-Zone-Padding)
├── images/
│   ├── brand/
│   │   ├── logo-mark.svg          Icon-Mark (quadratisch, Vektor)
│   │   ├── logo-mark-1024.png     Icon-Mark als PNG, 1024px
│   │   ├── logo-horizontal.svg    Logo mit Schriftzug (Vektor)
│   │   └── logo-horizontal.png    Logo mit Schriftzug als PNG (3x)
│   ├── avatars/                   6 vorgegebene Profil-Avatare (Punkt 4 "Auth" im Plan)
│   │   ├── profile-1-nova.png     Blob-Mascot, Indigo/Violett, lächelnd
│   │   ├── profile-2-ember.png    Blob-Mascot, Orange/Pink, breites Grinsen
│   │   ├── profile-3-tide.png     Blob-Mascot, Blau/Cyan, neutral
│   │   ├── profile-4-amber.png    Blob-Mascot, Amber/Rot, lächelnd
│   │   ├── profile-5-orchid.png   Blob-Mascot, Fuchsia/Violett, zwinkernd
│   │   └── profile-6-mint.png     Blob-Mascot, Smaragd/Cyan, neutral
│   └── og/
│       └── og-image.png           1200×630 Open-Graph/Social-Share-Bild
├── sounds/                         UI-Sounds, je als .wav und .mp3
│   ├── message-send.(wav|mp3)      dezenter Blip beim Senden einer Nachricht
│   ├── message-receive.(wav|mp3)   sanfter Zwei-Ton-Chime bei neuer Nachricht
│   └── notification.(wav|mp3)      auffälligerer Drei-Ton-Chime für @-Mentions
├── site.webmanifest                PWA-Manifest (verlinkt auf icons/*)
└── README.md                       diese Datei
```

## Hinweis zu uifaces.co / IconScout

Auf Wunsch wurde geprüft, ob sich Inhalte von uifaces.co (Profilbilder) und
iconscout.com/3d-icons (3D-Icons) eignen, um die bisherigen Assets zu ersetzen:

- **uifaces.co:** Lizenz erlaubt zwar kommerzielle Nutzung, rät aber selbst ausdrücklich von
  Live-Produkten ab ("not recommended for use in public, live projects") – zusätzlich sind es
  Fotos/Renderings realer-wirkender Gesichter, was bei "falschen" Beispiel-Nutzern in einem
  echten Produkt einen Persönlichkeitsrechte-Beigeschmack hätte. → Ersetzt durch selbst
  erstellte "Blob-Mascot"-Avatare (siehe unten), keine Lizenz-/Rechte-Fragen.
- **IconScout 3D-Icons:** Kostenpflichtiger Marktplatz – viele Icons sind Premium/Abo-gebunden,
  Lizenz variiert pro Asset. Ohne bestehendes Abo kein sauberer Download möglich. → Bestehendes
  selbst erstelltes Icon-/Favicon-Set (`icons/`) wurde beibehalten, da bereits konsistent zur
  Marke und komplett lizenzfrei. Bei Bedarf (z. B. mit vorhandenem IconScout-Abo) gerne konkrete
  Icon-Auswahl nennen, dann helfe ich beim Einbau.

## Markenkonzept

- **Motiv:** Sprechblase mit "Spark" (4-Zack-Stern) – steht für "Nova" (plötzliches Aufleuchten)
  und "Chat" (Konversation) gleichzeitig.
- **Primärfarben:** Indigo `#4F46E5` → Violett `#7C3AED` (Verlauf, 135°)
- **Akzentfarbe:** Warmes Gelb `#FDE68A` (nur für den Spark-Akzent)
- **Dark-Surface:** `#0B0B14` (z. B. für OG-Bild/Dark-Mode-Hintergründe)
- **Typografie:** Bold/800, Arial/Helvetica-Neue-Stack (keine externe Font-Abhängigkeit,
  kann bei Bedarf gegen z. B. Inter getauscht werden)

## Einbindung in Next.js (App Router)

**1. Favicon & App-Icons** – Next.js erkennt Dateien im `app/`-Ordner automatisch. Zwei Optionen:

- Einfach (empfohlen für den Start): `public/icons/favicon.ico` bleibt liegen, Next.js
  greift automatisch darauf zu. Zusätzlich im `<head>` von `app/layout.tsx` verlinken:

```tsx
export const metadata = {
  title: "NovaChat",
  description: "Team-Chat mit Channels, Threads und Live-Updates",
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};
```

- Alternativ (Next.js-Konvention): `icon-512.png` → `app/icon.png` und
  `apple-touch-icon.png` → `app/apple-icon.png` kopieren, dann übernimmt Next.js die
  `<link>`-Tags automatisch ohne manuelle `metadata.icons`-Angabe.

**2. Preset-Avatare** (siehe Punkt 4 "Auth" im Plan: *"6 vorgegebene Avatare"*):

```ts
export const PRESET_AVATARS = [
  "/images/avatars/profile-1-nova.png",
  "/images/avatars/profile-2-ember.png",
  "/images/avatars/profile-3-tide.png",
  "/images/avatars/profile-4-amber.png",
  "/images/avatars/profile-5-orchid.png",
  "/images/avatars/profile-6-mint.png",
] as const;
```

Die Auswahl wird laut Datenmodell in `users/{uid}.avatarUrl` gespeichert – einfach den
gewählten Pfad aus dieser Liste dort ablegen.

> **Warum keine Fotos von uifaces.co?** uifaces.co schreibt in den eigenen Lizenzbedingungen
> explizit *"not recommended for use in public, live projects"* – ungeeignet für ein echtes
> Produkt. Diese Blob-Mascot-Avatare sind komplett eigens erstellt (kein Foto einer echten
> Person, keine Lizenzfragen, kein Konsens-/Persönlichkeitsrechte-Thema) und im Stil an
> beliebte Open-Source-Avatar-Generatoren (z. B. DiceBear "Thumbs", CC0) angelehnt.

**3. UI-Sounds** (z. B. in `lib/hooks/useMessages.ts` beim Empfang einer neuen Nachricht):

```ts
const playSound = (src: string) => {
  const audio = new Audio(src);
  audio.volume = 0.5;
  audio.play().catch(() => {}); // Autoplay-Restriktionen abfangen
};

// bei eingehender Nachricht:
playSound("/sounds/message-receive.mp3");
// bei @-Mention:
playSound("/sounds/notification.mp3");
// beim Absenden:
playSound("/sounds/message-send.mp3");
```

MP3 zuerst versuchen (kleinste Datei, überall unterstützt), WAV liegt als verlustfreier
Fallback bei.

**4. OG-Image** (Social-Preview) in `app/layout.tsx`:

```tsx
export const metadata = {
  openGraph: {
    images: ["/images/og/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og/og-image.png"],
  },
};
```

**5. Logo im UI** (z. B. Sidebar-Header):

```tsx
import Image from "next/image";
<Image src="/images/brand/logo-horizontal.svg" alt="NovaChat" width={160} height={42} />
```

## Hinweis

Alle Grafiken sind vektor-basiert entstanden (SVG → gerendert) und liegen zusätzlich als
Vektordatei bei (`logo-mark.svg`, `logo-horizontal.svg`, `favicon.svg`) – bei Bedarf
verlustfrei in jeder Größe neu exportierbar.
