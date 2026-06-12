# Design System «Frag Alex» 2.0 — MASTER

> Source of Truth für das Redesign. Erstellt mit ui-ux-pro-max (Pattern: Conversion-Optimized + Trust),
> angepasst an die Markenvorgabe: Grün bleibt, modernisiert · Mix aus warm/persönlich und premium/modern.

## Konzept: «Warm Glass»

Warme, naturnahe Grün-Identität (Vertrauen, Garten, Handwerk) kombiniert mit
Premium-Elementen: Soft-Glassmorphism auf Nav und Karten, tiefe Grün-Gradients,
sanfte Scroll-Reveal-Animationen. Conversion-Pattern: CTA above the fold,
Trust-Signale früh, Social-Proof-Elemente vor dem Kontakt-CTA.

## Farben (Semantic Tokens)

### Light Mode (Default)
| Token | Wert | Verwendung |
|---|---|---|
| `--bg` | `#FAF7F2` | Seiten-Hintergrund (warmes Creme) |
| `--bg-elevated` | `#FFFFFF` | Karten, Surfaces |
| `--bg-tint` | `#EEF6EF` | Alternierende Sektionen |
| `--ink` | `#13251A` | Primärtext (Kontrast ≥ 12:1 auf bg) |
| `--ink-muted` | `#46604F` | Sekundärtext (Kontrast ≥ 4.5:1) |
| `--brand` | `#2D6A4F` | Markengrün (Buttons, Links) |
| `--brand-deep` | `#143D2A` | Dunkle Sektionen, Hover |
| `--brand-bright` | `#3E8E68` | Akzente, Labels |
| `--brand-soft` | `#D8F3DC` | Pills, Badges |
| `--accent` | `#C2702E` | Warmer Amber-Akzent — sparsam (Highlights, Preisbeispiel-Werte). Auf dunklem Grund: `#F0A35E` |
| `--line` | `rgba(45,106,79,0.14)` | Borders, Divider |
| `--glass` | `rgba(255,255,255,0.62)` | Glassmorphism-Flächen |
| `--glass-line` | `rgba(255,255,255,0.5)` | Glass-Border |

### Dark Mode (`prefers-color-scheme` + Toggle)
Desaturierte, aufgehellte Grüntöne — keine invertierten Farben.
| Token | Wert |
|---|---|
| `--bg` | `#0C1812` |
| `--bg-elevated` | `#13241B` |
| `--bg-tint` | `#101F17` |
| `--ink` | `#E8F2EA` |
| `--ink-muted` | `#9DBBA8` (≥ 4.5:1 auf bg) |
| `--brand` | `#5CB386` |
| `--brand-deep` | `#0A130E` |
| `--brand-soft` | `rgba(92,179,134,0.16)` |
| `--accent` | `#F0A35E` |
| `--glass` | `rgba(19,36,27,0.6)` |

## Typografie

- **Headings:** Fraunces (warm-charaktervolle moderne Serif — persönlich UND premium; löst Playfair Display ab)
- **Body:** Plus Jakarta Sans (freundlich-moderne Sans, sehr gut lesbar)
- Basis 16px+, Body line-height 1.7, Headings 1.1–1.2, `clamp()` für fluid scale
- Zahlen in Preisen: `font-variant-numeric: tabular-nums`

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
```

## Effekte & Animation

- **Glassmorphism:** `backdrop-filter: blur(14px)` + transluzente Fläche + 1px heller Border. Nur auf Nav, Hero-Badge, Floating-Cards — nie auf Textflächen ohne Kontrastprüfung (4.5:1).
- **Gradients:** Tiefe Grün-Gradients (`#143D2A → #2D6A4F`) für dunkle Sektionen; weiche radiale Glows im Hero.
- **Scroll-Reveal:** IntersectionObserver, fadeUp 0.6s ease-out, Stagger 60–80ms, nur `transform`/`opacity`.
- **Micro-Interactions:** 150–300ms, ease-out beim Eintreten; Hover-Lift max. 4px; Scale-Feedback 0.98 bei Press.
- **`prefers-reduced-motion`:** alle Animationen deaktiviert.

## Komponenten-Regeln

- Icons: **Inline-SVG (Lucide-Stil, stroke 1.75)** — keine Emojis (Anti-Pattern!)
- Radius-Skala: 12 / 16 / 20 / 24px (Karten 20, Buttons pill, Inputs 14)
- Schatten-Skala: sm `0 2px 8px rgba(20,61,42,0.06)` · md `0 8px 30px rgba(20,61,42,0.1)` · lg `0 20px 50px rgba(20,61,42,0.14)`
- Touch-Targets ≥ 44×44px, Abstand ≥ 8px
- Ein primärer CTA pro Viewport (WhatsApp = grün), Sekundäres untergeordnet
- Spacing: 4/8px-Raster; Sektionen 96–128px vertikal (Desktop), 64–80px (Mobile)

## Seitenstruktur (Conversion-optimiert)

1. Nav (glass, sticky) — CTA rechts
2. Hero — Badge, H1, Sub, Dual-CTA, Glass-Stat-Chips
3. Trust-Bar (4 Signale)
4. Leistungen (6 Karten, SVG-Icons, Hover-Lift)
5. Ablauf (4 Schritte, Timeline)
6. Preise (dunkle Sektion, 4 Karten + 2 Preisbeispiele)
7. Über Alex (Foto + Text + Pills)
8. FAQ (Accordion, `<details>`-basiert, a11y)
9. Einsatzgebiet (Band)
10. Kontakt (3 Kanäle als Karten) — Finale CTA
11. Footer

## Anti-Patterns (vermeiden)

- Emojis als Icons (Alt-Bestand!) → SVG
- Versteckte Kontaktinfos → Telefon/WhatsApp überall sichtbar
- Glass-Effekt auf Text-Hintergründen ohne Kontrast-Check
- Mehr als 1–2 animierte Elemente pro Viewport
- `width/height`-Animationen → nur transform/opacity
- Grau-auf-Grau, Text < 16px im Body

---

## V2.1 «Next Level» — Ergänzungen (Juni 2026)

Nach Feedback (Referenz: 21st.dev/Reel-Ästhetik) deutlich expressiver:

- **Cinematic Hero**: immer dunkelgrün (beide Modi), Radial-Glows (animiert driftend),
  Wort-für-Wort-H1-Reveal, Grain-Overlay global (feTurbulence, 4–6% Opacity)
- **Chat-Mockup tippt sich selbst**: Bubbles cascaden (1.1s/2.3s/3.4s), Typing-Dots dazwischen
- **Selbstzeichnende Werkzeug-Linienkunst** (stroke-dashoffset): Hammer, Giesskanne, Schneebesen
- **Marquee-Band** in Holz/Amber (Zollstock-Farbwelt), -1.3° gekippt, 36s Loop, pausiert bei Hover
- **Bento-Grid** für Leistungen: 4 Spalten, Apero als dunkle Premium-Karte mit Amber,
  Abschlusskarte full-width; 3D-Tilt (max 5°, nur hover+fine pointer) + Cursor-Glow
- **Zollstock-Timeline**: Ablauf-Schritte auf Doppelmeter-Strip (Holz-Gradient + Tick-Marks),
  Schrittnummern als Gelenk-Nieten
- **Count-up-Preise** (1.3s ease-out-quart, IO-getriggert), Shine-Sweep auf Preis-/Primary-Buttons
- **Kontakt-Finale** dunkel wie Hero (Rahmen-Dramaturgie), Glass-Kontaktkarten
- **Scroll-Progress-Bar** (grün→amber), **WhatsApp-FAB** nach 70% Hero-Höhe
- Alles `prefers-reduced-motion`-sicher; neue Kontrastpaare verifiziert (12 Checks, alle ≥ AA)

---

## V2.2 «Real & Playful» — Ergänzungen (Juni 2026)

Feedback: verspielter, realistischer (echte Fotos), Grün → British Racing Green, Texte durch Aline poliert.

- **Palette → British Racing Green**: brand `#10654A`, deep `#07402C`, darker `#032A1D`,
  bright `#2E9168` · Gold/Amber als klassischer BRG-Partner (`#B06A24` / `#F0B26A`)
- **Echte Fotografie (Unsplash, hotlinked)**: Farn-Hero (photo-1533563906091), Rasenmäher,
  Werkzeugwand, Gemüsekorb, Umzugskartons, Apero-Platte, Gras-Band (photo-1544914379),
  Vierwaldstättersee-Panorama (Einsatzgebiet). **Für Produktion: Bilder herunterladen und
  selbst hosten** (Unsplash-Lizenz: frei, Namensnennung empfohlen)
- **Werkstatt-Pinnwand-Ästhetik (playful)**: Foto-Karten leicht rotiert (±0.7°),
  Klebeband-Streifen (CSS), handschriftliche Notizen in **Caveat**
  («frisch gemäht», «sitzt, passt & hält», «en Guete!»)
- **Gras-Zitat-Band** mit Parallax: «Du lehnst dich zurück. Ich packe an.» + Caveat-Signatur
- **Parallax** auf Hero-/Band-/Gebiet-Fotos (geklemmt auf Bild-Bleed, reduced-motion-safe)
- **Aline-Textschliff**: Hero-Sub als Fragen-Trio, «frag einfach – deshalb heisst es ja so»,
  «keine Warteschleife», «meistens haben wir in fünf Minuten eine Lösung».
  FAQ/Preise unverändert (Schema.org-Konsistenz!)
- Gotcha behoben: `.gebiet-band > *`-Regel hatte `position:absolute` des BG-Bildes
  überschrieben → `> :not(.gebiet-bg)`

---

## V3 «Swiss Editorial» — Kompletter Neuansatz (Juni 2026) ← AKTUELL

Feedback zu V2.2: Klebeband/Handschrift/Zollstock/Holz-Marquee = «Gebastel, zu ki-mässig».
Anforderung: modern, cool, authentisch. → Komplett neu gedacht als **Swiss Editorial**
(passt wörtlich zur Zürcher Marke): Typografie + Raster + echte Fotografie, null Skeuomorphismus.

### Typografie (NEU)
- **Display:** Space Grotesk 500/600 — gross, eng (tracking −0.03em), line-height ~1.0
- **Body:** Inter 400/500
- **Labels/Nummern/Ticker:** IBM Plex Mono, klein, uppercase, letter-spacing 0.14em
  («01 — Angebot», «01»–«06» Service-Nummern)
- Hero-Trick: ein Wort als Outline (`-webkit-text-stroke`), Akzentwort in Mint

### Layout-Prinzipien
- **Hairlines statt Schatten** (1px var(--line)), Borders strukturieren alles
- **Service-Zeilen statt Karten**: Grid 90px(Nr) / 1fr(Titel+Liste) / 340px(Foto), hover = Foto-Zoom + Entsättigung weg
- **Ablauf**: 4-Spalten-Raster, Mono-Nummern, kein Timeline-Schmuck
- **Preise**: 1px-Gap-Grid (Zellen statt Karten), Space-Grotesk-Beträge, Count-up bleibt
- **Kontakt**: grosse Link-Zeilen (Kind/Wert/Pfeil-Kreis), hover = indent + Pfeil rotiert -45°
- Fotos konsistent: `saturate(0.82)`, voll erst bei Hover
- **Logo (NEU)**: Sprechblase + Häkchen, zeichnet sich per stroke-dashoffset selbst
  (Bubble 1.1s, Check 0.5s versetzt), Hover = Wiggle; Wortmarke «frag alex.» lowercase;
  auch als SVG-Favicon (BRG-Bubble, Gold-Check)

### Kontrast-Lektion (kleine Mono-Labels!)
Labels < 18px brauchen 4.5:1 → section-label/srv-num/step-num = var(--brand) (6.6:1),
NICHT brand-bright (3.7:1). srv-tag: --accent-strong #8F5017. Dark-Btn: Grund #57BA8C.

### Gestrichen (Anti-Patterns dieses Brands)
Caveat/Handschrift · Klebeband · Karten-Rotation · Zollstock · Holz-Gradients ·
Fraunces-Serifen · Glas-Schimmer-Sweeps · 3D-Tilt → wirkt «gebastelt»

---

## V4 «Ein Tag mit Alex» — React-Rebuild (Juni 2026) ← AKTUELL

Feedback: «zu verbastelt, muss aus einem Guss kommen» + Wunsch React/JSX + ultra-realistisch
mit thematischen Animationen. → Kompletter Neubau als Vite+React-App in `react/`.

### Konzept
Die Seite erzählt **einen Arbeitstag**: Jede Leistung ist eine fotorealistische Szene mit
Uhrzeit-Label («07:00 — Im Garten» … «18:00 — Bei deinen Gästen»). Licht ist das Leitmotiv:
Morgenstrahlen → Taschenlampe → Kerzenlicht → Glühwürmchen am Abend.

### Architektur
- `react/src/content.js` — ALLE Texte zentral (Aline-Stand, gelernter Koch)
- `react/src/anim.js` — EINE Motion-Sprache (fadeUp/stagger/EASE) für alles
- `react/src/components.jsx` — Nav, Hero, Ticker, Szenen, Ablauf, Preise, About, FAQ, Area, Kontakt
- framer-motion: whileInView-Reveals, useScroll-Parallax (einheitlich ±6%), Scroll-Progress
- Magic MCP (21st.dev) genutzt: maskiertes Grid-Linien-Motiv als Sektions-Textur übernommen

### Die EINE krasse Sache pro Szene (statt Gimmick-Stapel)
- Hero 06:30: Sonnenstaub-Partikel (Canvas, Maus-Repulsion, Scroll-Gust) + God-Rays
- Garten 07:00: Mäh-Band (Scroll schneidet Gras) als Szenen-Auftakt
- Werkstatt 09:30: **Spotlight-Maske folgt der Maus** über dunkler Werkzeugwand
  (Touch: automatischer Lampen-Schwenk) + Hinweis «Beweg die Maus»
- Apero 18:00: warme Kerzen-Vignette + wenige warme Partikel
- Kontakt: Glühwürmchen (warme Partikel) auf Nacht-Gradient

### Gelernt (Tooling)
- Eingebettete Previews laden teils mit `document.hidden=true` → framer-Entrances
  via `ANIM_OK = !document.hidden` absichern (initial={false} im Hidden-Fall)
- Preview-Screenshots nutzen eine zweite Capture-Instanz: bei React-Apps können
  Captures jenseits des ersten Viewports leer sein → mit `elementFromPoint`/Eval verifizieren
- Vite-Dev-Server in launch.json via `bash -lc` starten (Node-PATH)

### Status statische Vorversion
`index.html` (V3.1) bleibt als Referenz im Root; produktiv ist künftig `react/`
(`npm run build` → `react/dist/`).

---

## V5 «Die Liste» — Creative-Director-Neubau (Juni 2026) ← AKTUELL

Brief: Herzensprojekt, «richtig schön, aus einem Guss», Agentur-Niveau (Apple/Stripe/Linear),
keine Stockfotos, kein Rasenmäher, brutal ehrliche V4-Kritik.

### V4-Kritik (Kurzfassung)
Unsplash-Zufallsbilder = Vertrauenskiller · Effekt-Stapel statt Handschrift ·
keine Weissräume · vier dunkle Szenen am Stück = monoton.

### Konzept
**Keine Fotos** (ehrlicher als Stock — bis echte Alex-Fotos existieren).
Die Marke hat eine eigene Geste: das Häkchen. Die Site IST die Haushalts-Liste,
die Alex abhakt. Hero: 4 Todos streichen sich durch → «Du fragst. Ich mach's.»

### System
- Palette: Papier `#FBFAF7` / Tinte `#151915` / EIN Grün `#0E5B40` (+ Mint auf Dunkel).
  Kontakt = der einzige grüne Vollflächen-Moment. 12 Kontrastpaare ≥ AA verifiziert.
- Typo: **Geist** (alles) + **Geist Mono** (Kicker/Nummern) + **Instrument Serif italic**
  nur für einzelne Akzentwörter («mach's.», «abhaken», «auf Anfrage»).
- Layout: max-w 1120, Hairlines, Riesen-Weissraum, Preise als Schweizer Tabelle
  (tabular-nums, Count-up), Leistungen als nummerierter Index (Hover: Häkchen + 10px-Shift),
  Kontakt als grosse Link-Zeilen mit Kreis-Pfeil (Hover: -45°).
- Motion: EIN Reveal (IO + CSS-Transition, 0.65s) + Hero-Checklist (CSS-Keyframes,
  Stagger 0.42s) + Claim-Rise. Sonst nichts. `prefers-reduced-motion` & Hidden-Kontexte safe.

### Tooling-Lektion
framer-motion-Reveals (rAF) frieren in der Screenshot-Capture-Instanz ein;
IO + CSS-Transitions laufen überall → Reveal framer-frei gebaut (Bundle: 53 KB gzip statt 96).
