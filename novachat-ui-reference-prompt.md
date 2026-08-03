# NovaChat – UI-Referenz-Prompt für Claude Code (1:1 Nachbau)

Das bisherige Farbschema gefällt nicht. Bitte das UI stattdessen exakt nach dieser Beschreibung umsetzen – sie beschreibt Element für Element ein konkretes Referenz-Design. Wo Text als Beispielinhalt markiert ist, darf er durch echte Daten ersetzt werden, Layout/Stil/Farben bitte 1:1 übernehmen.

Gesamtlayout: eine Topbar über voller Breite, darunter vier Spalten nebeneinander – (A) Haupt-Sidebar mit Navigation & Workspaces, (B) Kanal-/DM-Liste, (C) Chat-Bereich, (D) Kanal-Infopanel (ein-/ausblendbar).

## Topbar

- Volle Breite, dunkler Hintergrund, dezente untere Trennlinie.
- Links: quadratisches Logo-Icon mit Diagonal-Verlauf Blau→Violett, darin ein weißes abstraktes Pfeil-/Blitz-Symbol; daneben fett "NovaChat".
- Direkt daneben: kleiner Button "‹ ›" zum Ein-/Ausklappen der Sidebar.
- Mitte: breites Suchfeld, abgerundet, dunkler Fläche-Hintergrund, Lupe-Icon links, Platzhaltertext "Suche in NovaChat...", rechts im Feld ein kleines Shortcut-Badge "⌘K".
- Rechts: Mond-Icon + Sonne-Icon als Dark/Light-Umschalter nebeneinander, Glocken-Icon mit rotem runden Badge (Beispielwert "7"), Nutzer-Avatar (rund) mit kleinem Dropdown-Pfeil daneben.

## Spalte A – Haupt-Sidebar (fixe Breite ~260px)

Navigationsliste, jede Zeile Icon + Label, Badge rechts wo vorhanden:
- Dashboard (Haus-Icon)
- Erwähnungen (@-Icon) – Badge "12"
- Entdecken (Kompass-/Explore-Icon)
- Aktivität (Glocken-Icon)
- Favoriten (Stern-Icon)

Darunter Sektionslabel "WORKSPACES" (klein, Großbuchstaben, gedämpfte Farbe) mit "+"-Icon rechts zum Hinzufügen.

Workspace-Liste, jede Zeile: farbiges abgerundetes Quadrat mit einem Buchstaben + Name:
- "N" auf violettem Verlauf – "NovaLabs" – **aktiv/ausgewählt** (Zeile farblich hervorgehoben, z. B. Accent-Wash-Hintergrund)
- "D" auf pink/magenta – "Design Team"
- "</>" auf Blau – "Development"
- "M" auf Blau/Indigo – "Marketing"
- Zeile "Workspace hinzufügen" mit "+"-Icon, gedämpfter Text

Dekoratives Hintergrundelement: großflächige, abstrakte Wellen-/Aurora-Grafik in Blau-Violett-Verlauf, niedrige Deckkraft, sitzt hinter der unteren Hälfte der Sidebar (rein dekorativ, kein interaktives Element).

Unten fixiert: Nutzer-Karte mit Avatar, Name ("EL" als Beispiel), Status "Online" mit grünem Punkt, Zahnrad-Icon rechts für Einstellungen.

## Spalte B – Kanäle & Direktnachrichten (Breite ~260–280px, durch dünne Trennlinie von A und C abgesetzt)

"Kanäle"-Überschrift fett, "+"-Icon rechts zum Erstellen.

Kanalliste, jede Zeile "#" + Name, Badge rechts (ungelesen) wo vorhanden:
- # allgemein — 23
- # projekte — 8
- # design — 12
- # entwicklung — 6
- # marketing — (kein Badge)
- # feedback — 2
- # test1 — **aktiver Kanal**: eigener Rahmen in Akzentfarbe um die Zeile, Hintergrund leicht getönt, statt Badge ein kleines Personen-Icon rechts

"Direktnachrichten"-Überschrift mit "+"-Icon.

DM-Liste, jede Zeile: rundes illustriertes Avatar (bunte Cartoon-/Flat-Illustration, keine Fotos) + Name + darunter kleiner Statustext mit farbigem Punkt:
- Developer — Online (grüner Punkt)
- Max Mustermann — Abwesend (gedämpfter/grauer Punkt)
- Sarah Becker — Online
- David H. — Online
- Lisa Müller — Abwesend
- Frederik Beck — Online

## Spalte C – Chat-Bereich

**Kanal-Header:** "# test1" fett/groß, daneben Stern-Outline-Icon (Favorit umschalten). Rechts davon in einer Reihe: 3 überlappende runde Avatare + Mitgliederzahl "24", Kopfhörer-Icon (Voice-Call), "..."-Icon (weitere Optionen).

Darunter kleiner gedämpfter Systemtext: "Dies ist der Beginn von #[Kanalname]".

**Datums-Trenner:** zentrierte abgerundete Pille, z. B. "Heute, 12. Mai 2025".

**Nachrichtenzeilen:** rundes Avatar links, daneben Name (fett) + Uhrzeit (klein, gedämpft, gleiche Zeile), darunter die Bubble:
- Eigene Nachrichten (aktuell eingeloggter Nutzer): Bubble mit Accent-Farbe gefüllt.
- Nachrichten anderer Nutzer: dunkle Fläche mit dezentem Rahmen.
- @Mentions im Text farblich hervorgehoben (Accent-Farbe, chip-artig).
- Unter einzelnen Nachrichten optional Reaktions-Chips: Emoji + Zähler, abgerundet, dunkler Hintergrund mit Rahmen (Beispiele: "🔥 3", "👍 2 👀 1", "✅ 1").

**Eingabeleiste unten:** breites abgerundetes Eingabefeld, Platzhalter "Nachricht an #[Kanalname]". Innerhalb links: Büroklammer-Icon (Anhang), "GIF"-Button, Emoji-Icon. Rechts: Shortcut-Hinweis "⌘⏎", Mikrofon-Icon, runder Accent-farbener Senden-Button mit Papierflieger-Icon.

## Spalte D – Kanal-Infopanel (Breite ~300px, ausblendbar)

- Oben rechts kleines Maximieren-Icon.
- Großes Banner (abgerundete Karte, ca. 200px hoch): gefüllt mit der gleichen abstrakten Blau-Violett-Wellengrafik wie in Spalte A, Kanalname ("# test1") groß/fett unten links im Banner überlagert.
- Überschrift "Über diesen Kanal" + kurzer Beschreibungstext.
- Statistik-Bereich: "Mitglieder" (Zahl) und "Online" (Zahl, mit grünem Punkt) nebeneinander; darunter "Erstellt am" + Datum.
- Überschrift "Medien, Links & Dateien": Reihe aus 3 quadratischen Vorschaubildern + eine 4. Kachel mit "14+" als "mehr anzeigen"-Hinweis.
- Überschrift "Angepinnte Nachrichten": Liste, je Eintrag Avatar + Name (fett) + relative Zeit ("vor 3 Tagen"/"vor 1 Woche"), darunter gekürzter Nachrichtentext, kleines Pin-Icon.
- Ganz unten, durch Trennlinie abgesetzt: "Kanal verlassen" als roter Text-Link mit Exit-Icon.

## Farb- und Stilrichtung (löst das bisherige "alles schwarz")

- Grundhintergrund: sehr dunkel, aber mit leichtem Blau-Violett-Unterton statt neutralem Schwarz.
- Flächen (Sidebar, Karten, Bubbles anderer Nutzer): einen Schritt heller als der Hintergrund, mit dezentem Rahmen, damit sich Ebenen sichtbar voneinander abheben.
- Ein durchgehender Akzent-Verlauf Blau→Violett für: aktiven Workspace, aktiven Kanal-Rahmen, eigene Nachrichten-Bubble, Senden-Button, Erwähnungen-Badge, dekorative Hintergrundgrafik.
- Status-Grün für "Online", gedämpftes Grau für "Abwesend", Rot ausschließlich für Notification-Badge und "Kanal verlassen".
- Avatare: illustrierter, bunter Flat-Cartoon-Stil (nicht fotorealistisch), durchgängig für alle Nutzer.
- Icons: einfache, konsistente Linien-Icons (kein 3D-Look).

## Hinweis an Claude Code

Bestehende Datenstruktur (Channels, Messages, Threads, Users) aus dem Build-Plan unverändert lassen – dies hier ist ausschließlich die visuelle/Layout-Spezifikation, keine neue Funktionalität. Wo diese Beschreibung von früheren Farb-Tokens abweicht, hat diese Datei Vorrang.
