/* Eine Quelle für alle Texte (Aline-geschliffen) — die Erzählung «Ein Tag mit Alex» */

export const IMG = {
  fern: 'https://images.unsplash.com/photo-1533563906091-fdfdffc3e3c4?auto=format&fit=crop&w=2000&q=80',
  mower: 'https://images.unsplash.com/photo-1748893790747-fc2646924cbe?auto=format&fit=crop&w=1800&q=80',
  tools: 'https://images.unsplash.com/photo-1761074342668-c38fc2e62e67?auto=format&fit=crop&w=1800&q=80',
  basket: 'https://images.unsplash.com/photo-1609842947419-ba4f04d5d60f?auto=format&fit=crop&w=1200&q=80',
  boxes: 'https://images.unsplash.com/photo-1730154838368-c37b1fdebcf6?auto=format&fit=crop&w=1200&q=80',
  apero: 'https://images.unsplash.com/photo-1553653760-d787a53b4bbe?auto=format&fit=crop&w=1800&q=80',
  grass: 'https://images.unsplash.com/photo-1544914379-806667cd9489?auto=format&fit=crop&w=2000&q=80',
  lake: 'https://images.unsplash.com/photo-1670067834437-f36e050fabc3?auto=format&fit=crop&w=2000&q=80',
}

export const hero = {
  badge: 'Langnau am Albis — Zürich',
  claim1: ['Du', 'fragst.'],
  claim2: ['Ich', "mach's."],
  sub: 'Die Hecke wuchert? Das Regal liegt noch im Karton? Am Samstag kommen Gäste? Schreib mir. Ich packe an – zuverlässig, persönlich und mit ehrlicher Freude an guter Arbeit.',
  ctaPrimary: 'Via WhatsApp melden',
  ctaSecondary: 'Ein Tag mit Alex',
}

export const chat = [
  { who: 'them', text: 'Hoi Alex! Kannst du am Samstag unsere Hecke schneiden?', time: '09:41' },
  { who: 'me', text: 'Klar, gerne! Samstag um 9 Uhr? Grüngut nehme ich gleich mit.', time: '09:52' },
  { who: 'them', text: 'Perfekt, bis Samstag!', time: '09:53' },
]

export const ticker = ['Rasenmähen', 'Möbelaufbau', 'Apero für 20', 'Umzugshilfe', 'Reparaturen', 'Einkäufe', 'Hecke schneiden', 'Keller räumen', 'Gartenpflege']

/* Der Tag: jede Leistung ist eine Szene */
export const scenes = [
  {
    id: 'garten',
    time: '07:00',
    place: 'Im Garten',
    title: 'Garten & Aussenpflege',
    items: ['Rasenmähen, Hecken schneiden', 'Beete anlegen und bepflanzen', 'Herbst- und Wintervorbereitung', 'Aufräumen, Entsorgung, Holzarbeiten'],
    img: 'mower',
    alt: 'Rasenmäher auf frisch gemähtem Rasen am Morgen',
    effect: 'mow',
  },
  {
    id: 'werkstatt',
    time: '09:30',
    place: 'In der Werkstatt',
    title: 'Reparaturen & Handwerk',
    items: ['Kleine Reparaturen im und ums Haus', 'Möbel montieren und aufbauen', 'Bilder, Regale, Lampen aufhängen', 'Handwerker koordinieren'],
    img: 'tools',
    alt: 'Werkzeugwand mit sortiertem Handwerkzeug',
    effect: 'spotlight',
    hint: 'Beweg die Maus — Alex leuchtet dir.',
  },
  {
    id: 'unterwegs',
    time: '13:00',
    place: 'Unterwegs & Zuhause',
    title: 'Besorgungen, Haus & Haushalt',
    items: ['Einkäufe und Behördengänge', 'Möbel- und Sperrguttransporte', 'Aufräumen und Entrümpeln', 'Umzugshilfe von A bis Z', 'Keller und Estrich räumen', 'Grundreinigungen'],
    img: 'basket',
    img2: 'boxes',
    alt: 'Korb mit frischem Gemüse vom Markt',
    alt2: 'Zimmer mit gepackten Umzugskartons und Pflanzen',
    effect: 'duo',
  },
  {
    id: 'apero',
    time: '18:00',
    place: 'Bei deinen Gästen',
    title: 'Apero für deine Gäste',
    tag: 'gelernter Koch',
    items: ['Aperos für bis zu 20 Personen', 'Einkauf und Vorbereitung inklusive', 'Auf Anfrage – einfach melden'],
    img: 'apero',
    alt: 'Apero-Platte mit Früchten, Fleisch und Wein',
    effect: 'warm',
  },
]

export const restRow = {
  title: 'Und was du sonst brauchst',
  items: ['Ferienbetreuung für Haus und Garten', 'Gesellschaft und Alltagsbegleitung', 'Individuelle Anfragen willkommen', 'Machbar? Dann bin ich dabei.'],
}

export const intro = {
  label: 'Das Angebot',
  title: 'Ein Tag mit Alex.',
  text: 'Von der Hecke bis zum vollen Keller: Ich bin dort, wo zwei Hände und Erfahrung gefragt sind. Nicht sicher, ob dein Projekt dazugehört? Frag einfach – deshalb heisst es ja so.',
}

export const steps = {
  label: 'So läuft’s ab',
  title: 'Unkompliziert von Anfang an.',
  text: 'Kein Papierkram, keine Warteschleife. Eine kurze Nachricht reicht – den Rest klären wir persönlich.',
  list: [
    { title: "Meld dich, wie's dir passt", text: "Per WhatsApp, Anruf oder E-Mail – wie's dir lieber ist. Zwei, drei Zeilen genügen. Ich freue mich auf deine Nachricht." },
    { title: 'Kurzes Gespräch, klare Abmachung', text: 'Ich melde mich innert Stunden zurück. Wir besprechen, was du brauchst, und einigen uns auf Termin und Preis. Das dauert meistens wenige Minuten.' },
    { title: 'Alex kommt – und packt an', text: "Pünktlich zum vereinbarten Zeitpunkt bin ich vor Ort. Ärmel hoch, los geht's. Du lehnst dich zurück; darum kümmere ich mich." },
    { title: 'Sauber erledigt, fair abgerechnet', text: 'Nach dem Einsatz bekommst du eine saubere Rechnung. Aktuell bin ich MWST-befreit – du zahlst also genau das, was abgemacht war.' },
  ],
}

export const quote = {
  line1: 'Am Abend ist deine Liste',
  line2: 'kürzer als am Morgen.',
  sig: 'Alex — Frag Alex',
}

export const pricing = {
  label: 'Preise',
  title: 'Faire Preise, keine Überraschungen.',
  text: 'Du weisst vorher, was es kostet – und nachher steht genau das auf der Rechnung. Aktuell MWST-befreit. Für grössere Projekte machen wir eine Pauschale ab.',
  cards: [
    { name: 'Stundensatz', amount: 120, unit: '/ Std.', text: 'Einzeleinsätze und kleinere Aufgaben. Mindestens 1 Stunde.' },
    { name: 'Halber Tag', amount: 420, unit: '/ ~4h', text: 'Garten, Umzugshilfe oder grössere Aufräumaktionen.' },
    { name: 'Ganzer Tag', amount: 820, unit: '/ ~8h', text: 'Projekte, die Raum und Zeit zum Durcharbeiten brauchen.' },
    { name: 'Apero & Spezial', amount: null, unit: '', text: 'Aperos und Spezialprojekte kalkuliere ich individuell.' },
  ],
  examples: [
    { name: 'Preisbeispiel 01', what: 'IKEA-Schrank aufbauen', text: 'Selber machen: 3–4 Stunden Frust & Werkzeug kaufen. Handwerker: ca. CHF 350–500.', alex: 'Mit Alex: ca. CHF 240 (2 Std.)' },
    { name: 'Preisbeispiel 02', what: 'Garten frühlingsklar machen', text: 'Selber machen: ganzes Wochenende. Gärtner: ab CHF 600–900.', alex: 'Mit Alex: ca. CHF 420 (halber Tag, inkl. Grüngut-Entsorgung)' },
  ],
  note: 'Anfahrt bis 30 Min. ab Langnau am Albis kostenlos · Keine Zusatzkosten ohne Absprache · Offerte jederzeit möglich · Aktuell MWST-befreit',
}

export const about = {
  label: 'Über mich',
  title: 'Hallo, ich bin Alex.',
  paras: [
    'Ich bin jemand, der gerne anpackt. Egal ob im Garten, im Haushalt oder beim Heimwerken: Was ich tue, mache ich gründlich, mit Sorgfalt und einem guten Schuss Humor.',
    'Handwerklich bin ich vielseitig unterwegs – vom Möbelaufbau über Reparaturen bis zur Gartenarbeit. Und als gelernter Koch übernehme ich auf Anfrage auch den Apero, wenn du Gäste hast.',
    'Frag Alex ist neu – und genau das ist mein Antrieb: Jeder Einsatz soll so gut sein, dass du mich weiterempfiehlst. Ich reagiere schnell, bin flexibel und halte, was ich verspreche.',
  ],
  highlights: ['Handwerklich geschickt', 'Zuverlässig & pünktlich', 'Vielseitig einsetzbar', 'Kurzfristig verfügbar', 'Gelernter Koch'],
}

export const faq = {
  label: 'Häufige Fragen',
  title: 'Gut zu wissen.',
  list: [
    { q: 'Was kostet eine Stunde bei Frag Alex?', a: 'Der Stundensatz liegt bei CHF 120. Für einen halben Tag (ca. 4 Stunden) berechne ich CHF 420, für einen ganzen Tag CHF 820. Aperos und Spezialprojekte kalkuliere ich individuell – am besten einfach anfragen. Aktuell bin ich MWST-befreit.' },
    { q: 'Wie schnell kann Alex einen Termin einrichten?', a: 'Oft klappt es innerhalb weniger Tage; bei dringenden Sachen manchmal schon am nächsten Tag. Am besten per WhatsApp melden – ich antworte in der Regel innert Stunden.' },
    { q: 'In welchem Gebiet ist Alex unterwegs?', a: 'Mein Ausgangspunkt ist Langnau am Albis. Von dort bin ich in der ganzen Region unterwegs – bis Stadt Zürich und Agglomeration. Weiter weg (z.B. Toggenburg) komme ich auf Anfrage gerne. Die Anfahrt bis 30 Minuten ab Langnau am Albis ist kostenlos.' },
    { q: 'Wie kann ich bezahlen?', a: 'Ich stelle dir nach dem Einsatz eine Rechnung. Aktuell bin ich MWST-befreit, das heisst du zahlst genau das, was abgemacht war – ohne Aufschläge.' },
  ],
}

export const area = {
  label: 'Einsatzgebiet',
  title: 'Ausgangspunkt Langnau am Albis – unterwegs bis Zürich und Agglomeration.',
  tags: ['Langnau am Albis & Umgebung', 'Zürich Stadt', 'Zürich Agglomeration', 'Weiter weg auf Anfrage'],
}

export const contact = {
  label: 'Feierabend? Erst, wenn du eine Antwort hast.',
  title1: 'Einfach fragen –',
  title2: 'ich melde mich.',
  text: 'Schreib mir per WhatsApp oder E-Mail. Ich melde mich innert Stunden – und meistens haben wir in fünf Minuten eine Lösung.',
  rows: [
    { kind: 'WhatsApp', value: '076 288 20 24', href: 'https://wa.me/41762882024', label: 'Alex per WhatsApp kontaktieren' },
    { kind: 'Telefon', value: '076 288 20 24', href: 'tel:+41762882024', label: 'Alex anrufen' },
    { kind: 'E-Mail', value: 'alex@superpraktisch.ch', href: 'mailto:alex@superpraktisch.ch', label: 'Alex per E-Mail kontaktieren' },
  ],
  note: 'Antwort in der Regel innert weniger Stunden',
}


export const heroTodos = ['Hecke schneiden', 'IKEA-Schrank aufbauen', 'Apero für 20 Gäste', 'Keller ausräumen']

export const heroFoot = {
  left: 'Langnau am Albis — Zürich · Anfahrt bis 30 Min. kostenlos',
  right: 'Antwort innert Stunden',
}

export const wa = 'https://wa.me/41762882024'
