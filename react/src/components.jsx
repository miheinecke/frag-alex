import { useEffect, useRef, useState } from 'react'
import * as C from './content'

/* Eingebettete/versteckte Kontexte: dann sofort Endzustand rendern */
const ANIM_OK = typeof document === 'undefined' ? true : !document.hidden

/* ───────── Bausteine ───────── */

export const Icon = ({ id, ...rest }) => (
  <svg className="icon" aria-hidden="true" {...rest}><use href={`#${id}`} /></svg>
)

export const BrandMark = () => (
  <svg className="brand-mark" viewBox="0 0 24 24" aria-hidden="true">
    <path className="lm-bubble" d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5c-1.51 0-2.93-.36-4.18-1L3 21l2-5.32A8.38 8.38 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5Z" />
    <polyline className="lm-check" points="8.5 12.2 11 14.7 15.5 9.7" />
  </svg>
)

/* Sanfter Reveal — IO + CSS-Transition (läuft auch in gedrosselten Kontexten) */
export const Reveal = ({ children, className = '', as = 'div', delay = 0, ...rest }) => {
  const Tag = as
  const ref = useRef(null)
  useEffect(() => {
    if (!ANIM_OK) { ref.current?.classList.add('on'); return }
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) { el?.classList.add('on'); return }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target) } })
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag ref={ref} className={`rv ${className}`} style={delay ? { transitionDelay: `${delay}s` } : undefined} {...rest}>
      {children}
    </Tag>
  )
}

/* Count-up — dezent, nur Zahlen */
function Count({ target }) {
  const ref = useRef(null)
  const [val, setVal] = useState(ANIM_OK ? 0 : target)
  useEffect(() => {
    if (!ANIM_OK) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = ref.current
    let raf
    const run = () => {
      if (reduce) { setVal(target); return }
      let start = null
      const tick = (ts) => {
        if (!start) start = ts
        const p = Math.min((ts - start) / 1100, 1)
        setVal(Math.round(target * (1 - Math.pow(1 - p, 4))))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      /* Fallback: falls rAF gedrosselt ist, Endwert garantieren */
      setTimeout(() => setVal(target), 1600)
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(); io.unobserve(e.target) } })
    }, { threshold: 0.6 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [target])
  return <span ref={ref}>{val}</span>
}

/* ───────── Nav ───────── */
export function Nav({ theme, onToggleTheme }) {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const handler = () => setSolid(window.scrollY > 12)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [open])

  const links = [['#leistungen', 'Angebot'], ['#ablauf', 'Ablauf'], ['#preise', 'Preise'], ['#faq', 'FAQ']]
  return (
    <>
      <nav className={`nav${solid ? ' solid' : ''}`} aria-label="Hauptnavigation">
        <div className="nav-inner">
          <a href="#" className="brand" aria-label="Frag Alex – zum Seitenanfang">
            <BrandMark />
            <span>frag alex<span style={{ color: 'var(--green)' }}>.</span></span>
          </a>
          <div className="nav-right">
            {links.map(([href, label]) => <a key={href} className="nav-link" href={href}>{label}</a>)}
            <button className="theme-toggle" onClick={onToggleTheme} aria-label="Dunkelmodus umschalten">
              <Icon id={theme === 'dark' ? 'i-moon' : 'i-sun'} />
            </button>
            <a href="#kontakt" className="btn btn-primary btn-sm">Anfragen</a>
            <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Menü öffnen" aria-expanded={open}>
              <Icon id="i-menu" />
            </button>
          </div>
        </div>
      </nav>
      {open && (
        <div className="mobile-menu">
          <button className="mobile-close" onClick={() => setOpen(false)} aria-label="Menü schliessen"><Icon id="i-x" /></button>
          {links.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
          <a href="#kontakt" className="btn btn-primary" onClick={() => setOpen(false)}>Jetzt anfragen</a>
        </div>
      )}
    </>
  )
}

/* ───────── Hero · Die Liste ───────── */
function TodoBox({ delay }) {
  return (
    <svg className="todo-box" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="6" />
      <path d="M7 12.5 L10.6 16 L17.5 8.5" style={{ '--td': delay }} />
    </svg>
  )
}

export function Hero() {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const noAnim = reduce || !ANIM_OK
  return (
    <header className={`hero wrap${noAnim ? ' no-anim' : ''}`} id="hero">
      <p className="kicker hero-kicker"><b>Frag Alex</b> — Hilfe für Haus, Garten &amp; Gäste</p>

      <ul className="todo-list" aria-label="Beispiele: was Alex übernimmt">
        {C.heroTodos.map((t, i) => (
          <li className="todo done-anim" key={t} style={{ '--td': `${0.5 + i * 0.42}s` }}>
            <TodoBox delay={`${0.5 + i * 0.42}s`} />
            <span className="todo-text">{t}</span>
          </li>
        ))}
      </ul>

      <h1 className="claim">
        <span className="row"><span className="up" style={{ '--cd': '2.2s' }}>Du fragst.</span></span>
        <span className="row"><span className="up" style={{ '--cd': '2.38s' }}>Ich <span className="serif">mach’s.</span></span></span>
      </h1>

      <p className="hero-sub">{C.hero.sub}</p>

      <div className="hero-cta">
        <a href={C.wa} className="btn btn-primary" aria-label="Alex per WhatsApp kontaktieren">
          <Icon id="i-whatsapp" /> {C.hero.ctaPrimary}
        </a>
        <a href="#leistungen" className="link-arrow">
          Was ich alles übernehme <Icon id="i-arrow-right" />
        </a>
      </div>

      <div className="hero-foot" aria-hidden="true">
        <div className="hero-foot-inner">
          <span className="kicker">{C.heroFoot.left}</span>
          <span className="kicker">{C.heroFoot.right}</span>
        </div>
      </div>
    </header>
  )
}

/* ───────── Leistungen · Der Index ───────── */
export function ServicesIndex() {
  const entries = [
    { nr: '01', title: C.scenes[0].title, items: C.scenes[0].items },
    { nr: '02', title: C.scenes[1].title, items: C.scenes[1].items },
    { nr: '03', title: C.scenes[2].title, items: C.scenes[2].items },
    { nr: '04', title: C.scenes[3].title, note: C.scenes[3].tag, items: C.scenes[3].items },
    { nr: '05', title: C.restRow.title, items: C.restRow.items },
  ]
  return (
    <section className="section wrap" id="leistungen" aria-labelledby="leistungen-title">
      <Reveal className="sec-head">
        <div>
          <p className="kicker">01 — Angebot</p>
          <h2 className="sec-title" id="leistungen-title" style={{ marginTop: '1.1rem' }}>
            Was du <span className="serif">abhaken</span> kannst.
          </h2>
          <p className="sec-text">{C.intro.text}</p>
        </div>
      </Reveal>
      <div className="index">
        {entries.map((e) => (
          <Reveal className="index-row" key={e.nr} as="article">
            <span className="index-num" aria-hidden="true">{e.nr}</span>
            <span className="index-check" aria-hidden="true">
              <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <div>
              <h3 className="index-title">
                {e.title}
                {e.note && <span className="index-note">{e.note}</span>}
              </h3>
              <p className="index-items">
                {e.items.map((it, i) => (
                  <span key={it}>{it}{i < e.items.length - 1 && <span className="dot" aria-hidden="true">·</span>}</span>
                ))}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ───────── Ablauf ───────── */
export function Ablauf() {
  return (
    <section className="section wrap" id="ablauf" aria-labelledby="ablauf-title">
      <Reveal className="sec-head">
        <div>
          <p className="kicker">02 — So läuft’s ab</p>
          <h2 className="sec-title" id="ablauf-title" style={{ marginTop: '1.1rem' }}>
            Unkompliziert, <span className="serif">von Anfang an.</span>
          </h2>
          <p className="sec-text">{C.steps.text}</p>
        </div>
      </Reveal>
      <div className="steps">
        {C.steps.list.map((st, i) => (
          <Reveal className="step" key={st.title} delay={i * 0.06}>
            <span className="step-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <h3>{st.title}</h3>
            <p>{st.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ───────── Zitat ───────── */
export function Quote() {
  return (
    <section className="quote" aria-label="Zitat">
      <Reveal className="wrap">
        <p>«{C.quote.line1} <em>{C.quote.line2}</em>»</p>
        <span className="kicker">{C.quote.sig}</span>
      </Reveal>
    </section>
  )
}

/* ───────── Preise · Tabelle ───────── */
export function Preise() {
  return (
    <section className="section wrap" id="preise" aria-labelledby="preise-title">
      <Reveal className="sec-head">
        <div>
          <p className="kicker">03 — Preise</p>
          <h2 className="sec-title" id="preise-title" style={{ marginTop: '1.1rem' }}>
            Faire Preise, <span className="serif">keine Überraschungen.</span>
          </h2>
          <p className="sec-text">{C.pricing.text}</p>
        </div>
      </Reveal>
      <Reveal className="price-table">
        {C.pricing.cards.map((card) => (
          <div className="price-row" key={card.name}>
            <div className="price-name">
              {card.name}
              <small>{card.text}</small>
            </div>
            <div className="price-amount">
              {card.amount
                ? <>CHF <Count target={card.amount} /><span className="unit">{card.unit}</span></>
                : <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400 }}>auf Anfrage</span>}
            </div>
          </div>
        ))}
      </Reveal>
      <div className="examples">
        {C.pricing.examples.map((ex, i) => (
          <Reveal className="example" key={ex.name} delay={i * 0.08}>
            <h3>{ex.name}</h3>
            <strong>{ex.what}</strong>
            <p>{ex.text}</p>
            <span className="mit">{ex.alex}</span>
          </Reveal>
        ))}
      </div>
      <Reveal><p className="price-note">{C.pricing.note}</p></Reveal>
    </section>
  )
}

/* ───────── Über Alex ───────── */
export function About() {
  return (
    <section className="section wrap" id="alex" aria-labelledby="alex-title">
      <Reveal>
        <p className="kicker">04 — Über mich</p>
        <h2 className="sec-title" id="alex-title" style={{ marginTop: '1.1rem', marginBottom: '2rem' }}>
          Hallo, ich bin <span className="serif">Alex.</span>
        </h2>
      </Reveal>
      <div className="about-grid">
        <Reveal className="about-photo">
          <img src="alex.jpg" alt="Alex – dein Allrounder für Haus, Garten und Gäste" width="880" height="1200" loading="lazy" />
        </Reveal>
        <div>
          <Reveal><p className="about-lead">{C.about.paras[0]}</p></Reveal>
          <Reveal className="about-cols" delay={0.08}>
            <p>{C.about.paras[1]}</p>
            <p>{C.about.paras[2]}</p>
          </Reveal>
          <Reveal as="ul" className="about-checks" delay={0.14}>
            {C.about.highlights.map((h) => (
              <li key={h}><Icon id="i-check" /> {h}</li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ───────── FAQ ───────── */
export function Faq() {
  return (
    <section className="section wrap" id="faq" aria-labelledby="faq-title">
      <Reveal className="sec-head">
        <div>
          <p className="kicker">05 — Häufige Fragen</p>
          <h2 className="sec-title" id="faq-title" style={{ marginTop: '1.1rem' }}>
            Gut zu <span className="serif">wissen.</span>
          </h2>
        </div>
      </Reveal>
      <Reveal className="faq-list">
        {C.faq.list.map((f) => (
          <details className="faq-item" key={f.q}>
            <summary>
              {f.q}
              <span className="faq-plus"><Icon id="i-plus" /></span>
            </summary>
            <div className="faq-body"><div><p className="faq-a">{f.a}</p></div></div>
          </details>
        ))}
      </Reveal>
    </section>
  )
}

/* ───────── Einsatzgebiet ───────── */
export function Area() {
  return (
    <section className="area wrap" aria-labelledby="area-title">
      <Reveal>
        <p className="kicker" id="area-title">Einsatzgebiet</p>
        <h2>{C.area.title}</h2>
        <p className="area-tags">
          {C.area.tags.map((t, i) => (
            <span key={t}>{t}{i < C.area.tags.length - 1 && <span className="dot" aria-hidden="true">·</span>}</span>
          ))}
        </p>
      </Reveal>
    </section>
  )
}

/* ───────── Kontakt ───────── */
export function Contact() {
  return (
    <section className="contact" id="kontakt" aria-labelledby="kontakt-title">
      <div className="wrap">
        <Reveal>
          <p className="kicker">{C.contact.label}</p>
          <h2 id="kontakt-title">Einfach <span className="serif">fragen</span> –<br />ich melde mich.</h2>
          <p className="lead">{C.contact.text}</p>
        </Reveal>
        <Reveal className="contact-rows">
          {C.contact.rows.map((row) => (
            <a href={row.href} className="contact-row" key={row.kind} aria-label={row.label}>
              <span className="contact-kind">{row.kind}</span>
              <span className="contact-value">{row.value}</span>
              <span className="contact-arrow"><Icon id="i-arrow-right" /></span>
            </a>
          ))}
        </Reveal>
        <Reveal>
          <p className="contact-note"><Icon id="i-clock" /> {C.contact.note}</p>
        </Reveal>
      </div>
    </section>
  )
}


/* ───────── Sackmesser «Original» · rot, schräg, klappt pro Sektion auf ───────── */
const KNIFE_SECTIONS = ['hero', 'leistungen', 'ablauf', 'preise', 'alex', 'faq', 'kontakt']

export function KnifeBuilder() {
  const [stage, setStage] = useState(ANIM_OK ? 0 : 7)
  const [onDark, setOnDark] = useState(false)
  const [bye, setBye] = useState(false)
  useEffect(() => {
    const handler = () => {
      const mid = window.innerHeight * 0.55
      let idx = 0
      KNIFE_SECTIONS.forEach((id, i) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= mid) idx = i
      })
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40) idx = KNIFE_SECTIONS.length - 1
      setStage(idx + 1)
      const k = document.getElementById('kontakt')
      setOnDark(k ? k.getBoundingClientRect().top <= window.innerHeight * 0.8 : false)
      /* Story erzählt: beim Footer leise verabschieden */
      const f = document.querySelector('footer')
      setBye(f ? f.getBoundingClientRect().top <= window.innerHeight - 40 : false)
    }
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler)
    return () => { window.removeEventListener('scroll', handler); window.removeEventListener('resize', handler) }
  }, [])
  return (
    <div className={`knife s${stage}${onDark ? ' on-dark' : ''}${bye ? ' bye' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <g transform="rotate(-32 100 120)">
          {/* Grosse Klinge */}
          <g className="kp kp-blade" style={{ transformOrigin: '140px 120px' }}>
            <path className="steel" d="M140 112.5 C100 109 70 111.5 56 118.5 C74 126 104 128.5 140 127.5 Z" />
            <path className="detail" d="M64 119 C88 124 114 126 136 126" />
            <path className="detail" d="M118 116.5 H130" strokeWidth="2.4" />
          </g>
          {/* Kapselheber — Haken, Schlitz-Spitze, Drahtabisolierer-Loch */}
          <g className="kp kp-cap" style={{ transformOrigin: '140px 120px' }}>
            <path className="steel" d="M140 114.5 H106 L99 117 L104.5 120 L99.5 122 L103 125.5 H140 Z" />
            <circle className="hole" cx="116" cy="120" r="1.8" />
          </g>
          {/* Dosenöffner — Schneidhaken */}
          <g className="kp kp-can" style={{ transformOrigin: '60px 120px' }}>
            <path className="steel" d="M60 115 H92 C99 115 102 117.5 100 120.5 L93.5 118.5 L89 124.5 H60 Z" />
          </g>
          {/* Kleine Klinge */}
          <g className="kp kp-small" style={{ transformOrigin: '60px 120px' }}>
            <path className="steel" d="M60 114.5 C86 112.5 102 114.5 110 119.5 C102 124.5 86 126 60 125.5 Z" />
            <path className="detail" d="M104 120 C92 123 78 124 64 124" />
          </g>
          {/* Korkenzieher */}
          <g className="kp kp-cork" style={{ transformOrigin: '140px 120px' }}>
            <path className="wire" d="M140 120 H114 q-4 -5.5 -8 0 q-4 5.5 -8 0 q-4 -5.5 -8 0 q-4 5.5 -8 0 l-4 -3" />
          </g>
          {/* Korpus — rote Schale, Schlüsselring, Schild mit Kreuz */}
          <g className="kp kp-body">
            <circle className="ring" cx="45" cy="124" r="5.5" />
            <rect className="scale" x="52" y="108" width="96" height="24" rx="12" />
            <path className="shield" d="M100 110.5 L107 113 V120 C107 124.5 104 127.5 100 129 C96 127.5 93 124.5 93 120 V113 Z" />
            <rect className="crossw" x="98.5" y="115" width="3" height="9.5" rx="0.8" />
            <rect className="crossw" x="95.3" y="118.2" width="9.5" height="3" rx="0.8" />
          </g>
          {/* Finale: kleines Häkchen — erledigt */}
          <g className="kp kp-check" style={{ transformOrigin: '160px 86px' }}>
            <circle className="badge" cx="160" cy="86" r="9" />
            <path className="tick" d="M155.8 86.4 L158.9 89.3 L164.4 83.2" />
          </g>
        </g>
      </svg>
    </div>
  )
}

/* ───────── Footer ───────── */
export function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <span className="footer-brand">
          <BrandMark />
          <span>frag alex<span style={{ color: 'var(--mint)' }}>.</span></span>
        </span>
        <span>© 2026 Frag Alex · Allrounder für Haus, Garten &amp; Küche</span>
        <a href="#kontakt">Kontakt</a>
      </div>
    </footer>
  )
}
