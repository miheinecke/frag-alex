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
