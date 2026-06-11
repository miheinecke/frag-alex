import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView, useReducedMotion } from 'framer-motion'
import { fadeUp, stagger, viewportOnce, EASE } from './anim'
import * as C from './content'

/* Eingebettete/versteckte Kontexte: rAF pausiert dort — dann sofort Endzustand rendern */
const ANIM_OK = typeof document === 'undefined' ? true : !document.hidden

/* ───────── Bausteine ───────── */

export const Icon = ({ id, ...rest }) => (
  <svg className="icon" aria-hidden="true" {...rest}><use href={`#${id}`} /></svg>
)

export const LogoMark = () => (
  <svg className="logo-mark" viewBox="0 0 24 24" aria-hidden="true">
    <path className="lm-bubble" d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5c-1.51 0-2.93-.36-4.18-1L3 21l2-5.32A8.38 8.38 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5Z" />
    <polyline className="lm-check" points="8.5 12.2 11 14.7 15.5 9.7" />
  </svg>
)

/* Parallax-Bild: eine Bewegungssprache für alle Szenen */
function ParallaxImg({ src, alt, className }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  return (
    <div ref={ref} className={className} aria-hidden="true">
      <motion.img src={src} alt={alt || ''} style={reduce ? undefined : { y }} loading="lazy" />
    </div>
  )
}

/* Count-up */
function Count({ target }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (reduce) { setVal(target); return }
    let start = null, raf
    const tick = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 1300, 1)
      setVal(Math.round(target * (1 - Math.pow(1 - p, 4))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, reduce])
  return <span ref={ref}>{val}</span>
}

/* Partikel: Sonnenstaub (Hero) & Glühwürmchen (Kontakt) */
function Particles({ density = 280, warm = false, className }) {
  const canvasRef = useRef(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    const canvas = canvasRef.current
    const parent = canvas.parentElement
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W, H, raf, running = true
    const mouse = { x: -9999, y: -9999 }
    let gust = 0, lastY = window.scrollY

    const sprite = (color) => {
      const c = document.createElement('canvas')
      c.width = c.height = 32
      const g = c.getContext('2d')
      const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16)
      grad.addColorStop(0, color)
      grad.addColorStop(0.35, color.replace('1)', '0.5)'))
      grad.addColorStop(1, color.replace('1)', '0)'))
      g.fillStyle = grad
      g.fillRect(0, 0, 32, 32)
      return c
    }
    const sprites = warm
      ? [sprite('rgba(240,178,106,1)'), sprite('rgba(255,214,150,1)'), sprite('rgba(143,227,182,1)')]
      : [sprite('rgba(143,227,182,1)'), sprite('rgba(240,178,106,1)'), sprite('rgba(87,186,140,1)'), sprite('rgba(244,250,245,1)')]

    const resize = () => {
      const r = parent.getBoundingClientRect()
      W = r.width; H = r.height
      canvas.width = W * dpr; canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const N = W < 1020 ? Math.round(density * 0.4) : density
    const parts = Array.from({ length: N }, () => {
      const z = 0.35 + Math.random() * 0.65
      return {
        x: Math.random() * W, y: Math.random() * H,
        vx: 0, vy: 0, z,
        r: (0.9 + Math.random() * 2.2) * z,
        s: sprites[(Math.random() * sprites.length) | 0],
        tw: Math.random() * Math.PI * 2,
      }
    })

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top
    }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    const onScroll = () => {
      const y = window.scrollY
      gust += Math.min(Math.abs(y - lastY), 60) * 0.015
      lastY = y
    }
    parent.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)
    window.addEventListener('scroll', onScroll, { passive: true })

    let t = 0
    const frame = () => {
      if (!running) return
      raf = requestAnimationFrame(frame)
      t += 16
      const pr = parent.getBoundingClientRect()
      if (pr.bottom < 0 || pr.top > window.innerHeight || document.hidden) return
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      gust *= 0.94
      for (const p of parts) {
        const ang = Math.sin(p.x * 0.0011 + t * 0.00035) * 1.8 + Math.cos(p.y * 0.0013 - t * 0.00028) * 1.8
        p.vx += Math.cos(ang) * 0.014 * p.z
        p.vy += Math.sin(ang) * 0.011 * p.z - 0.012 * p.z - gust * 0.05 * p.z
        const dx = p.x - mouse.x, dy = p.y - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < 19600) {
          const d = Math.sqrt(d2) || 1
          const f = (1 - d / 140) * 1.1
          p.vx += (dx / d) * f; p.vy += (dy / d) * f
        }
        p.vx *= 0.965; p.vy *= 0.965
        p.x += p.vx; p.y += p.vy
        if (p.x < -20) p.x = W + 18; if (p.x > W + 20) p.x = -18
        if (p.y < -20) p.y = H + 18; if (p.y > H + 20) p.y = -18
        const a = p.z * (0.38 + 0.34 * Math.sin(t * 0.0021 + p.tw))
        ctx.globalAlpha = Math.max(0.05, a)
        const sz = p.r * 7
        ctx.drawImage(p.s, p.x - sz / 2, p.y - sz / 2, sz, sz)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }
    raf = requestAnimationFrame(frame)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [density, warm, reduce])
  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}

/* ───────── Nav ───────── */
export function Nav({ theme, onToggleTheme }) {
  const [solid, setSolid] = useState(false)
  const [onDark, setOnDark] = useState(true)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const handler = () => {
      const hero = document.getElementById('hero')
      const y = window.scrollY
      setSolid(y > 12)
      setOnDark(hero ? y < hero.offsetHeight - 70 : false)
    }
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

  const links = [['#leistungen', 'Der Tag'], ['#ablauf', 'Ablauf'], ['#preise', 'Preise'], ['#alex', 'Über Alex'], ['#faq', 'FAQ']]
  return (
    <>
      <nav className={`nav${solid ? ' solid' : ''}${onDark ? ' on-dark' : ''}`} aria-label="Hauptnavigation">
        <a href="#" className="nav-logo" aria-label="Frag Alex – zum Seitenanfang">
          <LogoMark />
          <span>frag alex<span className="dot">.</span></span>
        </a>
        <div className="nav-links">
          {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </div>
        <div className="nav-actions">
          <button className="theme-toggle" onClick={onToggleTheme} aria-label="Dunkelmodus umschalten">
            <Icon id={theme === 'dark' ? 'i-moon' : 'i-sun'} />
          </button>
          <a href="#kontakt" className="btn btn-primary btn-nav nav-links">Jetzt anfragen</a>
          <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Menü öffnen" aria-expanded={open}>
            <Icon id="i-menu" />
          </button>
        </div>
      </nav>
      {open && (
        <div className="mobile-menu">
          <button className="mobile-menu-close" onClick={() => setOpen(false)} aria-label="Menü schliessen"><Icon id="i-x" /></button>
          {links.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
          <a href="#kontakt" className="btn btn-primary" onClick={() => setOpen(false)}>Jetzt anfragen</a>
        </div>
      )}
    </>
  )
}

/* ───────── Hero · 06:30 ───────── */
export function Hero() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  const word = (txt, i, cls = '') => (
    <motion.span key={i} className={`w ${cls}`} initial={reduce || !ANIM_OK ? false : { y: '110%' }} animate={{ y: 0 }}
      transition={{ duration: 0.85, ease: EASE, delay: 0.12 + i * 0.12 }}>{txt}&nbsp;</motion.span>
  )
  return (
    <header className="hero" id="hero" ref={ref}>
      <motion.img className="hero-bg" src={C.IMG.fern} alt="" width="2000" height="1333"
        fetchpriority="high" style={reduce ? undefined : { y: bgY }} aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-rays" aria-hidden="true" />
      <Particles density={280} className="hero-particles" />
      <div className="hero-inner">
        <div>
          <motion.span className="hero-badge" initial={reduce || !ANIM_OK ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.7 }}>
            {C.hero.badge}
          </motion.span>
          <h1>
            <span className="line">{word(C.hero.claim1[0], 0)}{word(C.hero.claim1[1], 1, 'outline')}</span>
            <span className="line">{word(C.hero.claim2[0], 2)}<motion.span className="w" initial={reduce || !ANIM_OK ? false : { y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.85, ease: EASE, delay: 0.48 }}><em>{C.hero.claim2[1]}</em></motion.span></span>
          </h1>
          <motion.p className="hero-sub" initial={reduce || !ANIM_OK ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.9 }}>
            {C.hero.sub}
          </motion.p>
          <motion.div className="hero-actions" initial={reduce || !ANIM_OK ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.9 }}>
            <a href={C.wa} className="btn btn-primary" aria-label="Alex per WhatsApp kontaktieren">
              <Icon id="i-whatsapp" /> {C.hero.ctaPrimary}
            </a>
            <a href="#leistungen" className="btn btn-ghost">{C.hero.ctaSecondary} <Icon id="i-arrow-right" /></a>
          </motion.div>
        </div>
        <motion.div className="hero-chat" aria-hidden="true" initial={reduce || !ANIM_OK ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
          <div className="chat-header">
            <div className="chat-avatar">A</div>
            <div className="chat-header-info">
              <strong>Alex</strong>
              <span className="chat-status">erreichbar</span>
            </div>
          </div>
          {C.chat.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.who} b${i}`}>
              {m.text}<span className="chat-time">{m.time}</span>
            </div>
          ))}
          <div className="chat-typing" style={{ order: 1 }}><span /><span /><span /></div>
        </motion.div>
      </div>
    </header>
  )
}

/* ───────── Ticker ───────── */
export function Ticker() {
  const items = (
    <span className="ticker-item">
      {C.ticker.map((t, i) => (<span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '3rem' }}>{t} <span className="sep">●</span></span>))}
    </span>
  )
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-inner">
        <div className="ticker-track">{items}</div>
        <div className="ticker-track">{items}</div>
      </div>
    </div>
  )
}

/* ───────── Intro + Mäh-Band ───────── */
export function Intro() {
  return (
    <section className="section grid-bg" id="leistungen" aria-labelledby="leistungen-title">
      <div className="container">
        <motion.div variants={stagger} initial={ANIM_OK ? 'hidden' : false} whileInView="show" viewport={viewportOnce}>
          <motion.p className="section-label" variants={fadeUp}>{C.intro.label}</motion.p>
          <motion.h2 id="leistungen-title" variants={fadeUp}>{C.intro.title}</motion.h2>
          <motion.p className="section-intro" variants={fadeUp}>{C.intro.text}</motion.p>
        </motion.div>
      </div>
    </section>
  )
}

export function MowBand() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.25'] })
  const [p, setP] = useState(reduce ? 0 : 0)
  useEffect(() => {
    if (reduce) return
    return scrollYProgress.on('change', (v) => setP(Math.max(0, Math.min(1, v))))
  }, [scrollYProgress, reduce])
  const cutX = p * 1290 - 45
  const tufts = []
  for (let x = -14; x < 1224; x += 34) {
    const flip = Math.round(x / 34) % 2 ? ` scale(-1,1) translate(${-(2 * x + 52)},0)` : ''
    tufts.push(<use key={`t${x}`} href="#tuft-tall" transform={`translate(${x},0)${flip}`} />)
  }
  const stubble = []
  for (let x = -14; x < 1224; x += 38) {
    stubble.push(<use key={`s${x}`} href="#tuft-cut" transform={`translate(${x},0)`} />)
  }
  return (
    <div className="mow" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 1200 150" preserveAspectRatio="xMidYMax meet">
        <defs>
          <g id="tuft-tall">
            <path d="M0 150 C3 105 -5 70 -9 28 C1 75 5 105 7 150 Z" fill="#2E9168" />
            <path d="M11 150 C16 95 11 60 18 18 C23 70 20 110 20 150 Z" fill="#10654A" />
            <path d="M24 150 C22 100 29 75 26 35 C33 85 31 115 33 150 Z" fill="#57BA8C" />
            <path d="M37 150 C40 100 35 60 42 25 C49 75 44 110 46 150 Z" fill="#1F7D58" />
            <path d="M50 150 C55 110 50 80 57 48 C62 95 57 115 59 150 Z" fill="#2E9168" />
          </g>
          <g id="tuft-cut">
            <path d="M2 150 L6 126 L10 150 Z" fill="#57BA8C" />
            <path d="M14 150 L18 130 L22 150 Z" fill="#2E9168" />
            <path d="M26 150 L30 124 L34 150 Z" fill="#48A87B" />
            <path d="M38 150 L42 132 L46 150 Z" fill="#2E9168" />
            <path d="M50 150 L54 127 L58 150 Z" fill="#57BA8C" />
          </g>
          <clipPath id="uncutClip"><rect x={Math.max(0, cutX)} y="0" width="1200" height="150" /></clipPath>
        </defs>
        <g>{stubble}</g>
        <g clipPath="url(#uncutClip)">{tufts}</g>
        {!reduce && (
          <g transform={`translate(${cutX},${150 + Math.sin(p * 46) * 1.6})`}>
            <path d="M-4 -18 L-30 -52" stroke="#06281C" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M-36 -56 L-24 -48" stroke="#06281C" strokeWidth="5" strokeLinecap="round" fill="none" />
            <rect x="-12" y="-30" width="34" height="17" rx="4" fill="#10654A" />
            <rect x="14" y="-25" width="12" height="12" rx="2" fill="#06281C" />
            <circle cx="-4" cy="-8" r="9" fill="#06281C" /><circle cx="-4" cy="-8" r="3.2" fill="#F4FAF5" />
            <circle cx="20" cy="-6" r="6.5" fill="#06281C" /><circle cx="20" cy="-6" r="2.4" fill="#F4FAF5" />
          </g>
        )}
      </svg>
    </div>
  )
}

/* ───────── Szenen ───────── */
function SceneShell({ scene, children, extraClass = '', bgExtra = null }) {
  return (
    <section className={`scene ${extraClass}`} id={scene.id} aria-labelledby={`${scene.id}-title`}>
      <ParallaxImg src={C.IMG[scene.img]} alt={scene.alt} className="scene-bg" />
      <div className="scene-shade" aria-hidden="true" />
      {bgExtra}
      <motion.div className="scene-content" variants={stagger} initial={ANIM_OK ? 'hidden' : false} whileInView="show" viewport={viewportOnce}>
        <div>
          <motion.p className="scene-time" variants={fadeUp}>{scene.time} — {scene.place}</motion.p>
          <motion.h2 id={`${scene.id}-title`} variants={fadeUp}>
            {scene.title}
            {scene.tag && <span className="scene-tag">{scene.tag}</span>}
          </motion.h2>
          <motion.ul variants={fadeUp}>
            {scene.items.map((it) => <li key={it}>{it}</li>)}
          </motion.ul>
        </div>
        {children}
      </motion.div>
    </section>
  )
}

export function SceneGarten() {
  return <SceneShell scene={C.scenes[0]} />
}

export function SceneWerkstatt() {
  const scene = C.scenes[1]
  const ref = useRef(null)
  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--sx', `${((e.clientX - r.left) / r.width) * 100}%`)
    el.style.setProperty('--sy', `${((e.clientY - r.top) / r.height) * 100}%`)
  }
  return (
    <section className="scene scene--spotlight" id={scene.id} aria-labelledby={`${scene.id}-title`} ref={ref} onMouseMove={onMove}>
      <ParallaxImg src={C.IMG[scene.img]} alt={scene.alt} className="scene-bg" />
      <div className="scene-shade" aria-hidden="true" />
      <div className="scene-grad" aria-hidden="true" />
      <motion.div className="scene-content" variants={stagger} initial={ANIM_OK ? 'hidden' : false} whileInView="show" viewport={viewportOnce}>
        <div>
          <motion.p className="scene-time" variants={fadeUp}>{scene.time} — {scene.place}</motion.p>
          <motion.h2 id={`${scene.id}-title`} variants={fadeUp}>{scene.title}</motion.h2>
          <motion.ul variants={fadeUp}>
            {scene.items.map((it) => <li key={it}>{it}</li>)}
          </motion.ul>
        </div>
        <motion.span className="scene-hint" variants={fadeUp}>{scene.hint}</motion.span>
      </motion.div>
    </section>
  )
}

export function SceneUnterwegs() {
  const scene = C.scenes[2]
  return (
    <section className="scene scene--duo" id={scene.id} aria-labelledby={`${scene.id}-title`}>
      <motion.div className="scene-content" variants={stagger} initial={ANIM_OK ? 'hidden' : false} whileInView="show" viewport={viewportOnce}>
        <div>
          <motion.p className="scene-time" variants={fadeUp}>{scene.time} — {scene.place}</motion.p>
          <motion.h2 id={`${scene.id}-title`} variants={fadeUp}>{scene.title}</motion.h2>
          <motion.div className="duo-grid" variants={fadeUp}>
            <ParallaxImg src={C.IMG[scene.img]} alt={scene.alt} className="duo-photo" />
            <ParallaxImg src={C.IMG[scene.img2]} alt={scene.alt2} className="duo-photo" />
          </motion.div>
          <motion.div className="duo-lists" variants={fadeUp}>
            <ul>{scene.items.slice(0, 3).map((it) => <li key={it}>{it}</li>)}</ul>
            <ul>{scene.items.slice(3).map((it) => <li key={it}>{it}</li>)}</ul>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

export function SceneApero() {
  const scene = C.scenes[3]
  return (
    <SceneShell scene={scene} extraClass="scene--warm" bgExtra={<Particles density={90} warm className="hero-particles" />} />
  )
}

export function RestRow() {
  return (
    <section className="section grid-bg" aria-label="Weitere Leistungen">
      <div className="container">
        <motion.div className="rest" variants={stagger} initial={ANIM_OK ? 'hidden' : false} whileInView="show" viewport={viewportOnce}>
          <motion.div className="rest-inner" variants={fadeUp}>
            <span className="rest-num" aria-hidden="true">+</span>
            <div>
              <h3>{C.restRow.title}</h3>
              <ul>{C.restRow.items.map((it) => <li key={it}>{it}</li>)}</ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ───────── Ablauf ───────── */
export function Ablauf() {
  return (
    <section className="section ablauf" id="ablauf" aria-labelledby="ablauf-title">
      <div className="container">
        <motion.div variants={stagger} initial={ANIM_OK ? 'hidden' : false} whileInView="show" viewport={viewportOnce}>
          <motion.p className="section-label" variants={fadeUp}>{C.steps.label}</motion.p>
          <motion.h2 id="ablauf-title" variants={fadeUp}>{C.steps.title}</motion.h2>
          <motion.p className="section-intro" variants={fadeUp}>{C.steps.text}</motion.p>
          <div className="steps">
            {C.steps.list.map((st, i) => (
              <motion.div className="step" key={st.title} variants={fadeUp}>
                <span className="step-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ───────── Quote ───────── */
export function Quote() {
  return (
    <div className="band" role="presentation">
      <ParallaxImg src={C.IMG.grass} alt="" className="band-bg" />
      <motion.div variants={stagger} initial={ANIM_OK ? 'hidden' : false} whileInView="show" viewport={viewportOnce}>
        <motion.p className="band-quote" variants={fadeUp}>«{C.quote.line1}<br /><em>{C.quote.line2}</em>»</motion.p>
        <motion.span className="band-sig" variants={fadeUp}>{C.quote.sig}</motion.span>
      </motion.div>
    </div>
  )
}

/* ───────── Preise ───────── */
export function Preise() {
  return (
    <section className="section preise" id="preise" aria-labelledby="preise-title">
      <div className="container">
        <motion.div variants={stagger} initial={ANIM_OK ? 'hidden' : false} whileInView="show" viewport={viewportOnce}>
          <motion.p className="section-label" variants={fadeUp}>{C.pricing.label}</motion.p>
          <motion.h2 id="preise-title" variants={fadeUp}>Faire Preise, <em>keine Überraschungen.</em></motion.h2>
          <motion.p className="section-intro" variants={fadeUp}>{C.pricing.text}</motion.p>
          <motion.div className="preis-cards" variants={fadeUp}>
            {C.pricing.cards.map((card) => (
              <div className="preis-card" key={card.name}>
                <h3>{card.name}</h3>
                <div className="preis-betrag">
                  {card.amount ? <>CHF <Count target={card.amount} /> <span className="unit">{card.unit}</span></> : 'auf Anfrage'}
                </div>
                <p>{card.text}</p>
              </div>
            ))}
          </motion.div>
          <motion.div className="beispiel-grid" variants={fadeUp}>
            {C.pricing.examples.map((ex) => (
              <div className="beispiel-card" key={ex.name}>
                <h3>{ex.name}</h3>
                <strong>{ex.what}</strong>
                <p>{ex.text}<br /><span className="mit-alex">{ex.alex}</span></p>
              </div>
            ))}
          </motion.div>
          <motion.p className="preis-note" variants={fadeUp}>{C.pricing.note}</motion.p>
        </motion.div>
      </div>
    </section>
  )
}

/* ───────── Über Alex ───────── */
export function About() {
  return (
    <section className="section grid-bg" id="alex" aria-labelledby="alex-title">
      <div className="container">
        <motion.div variants={stagger} initial={ANIM_OK ? 'hidden' : false} whileInView="show" viewport={viewportOnce}>
          <motion.p className="section-label" variants={fadeUp}>{C.about.label}</motion.p>
          <motion.h2 id="alex-title" variants={fadeUp}>Hallo, ich bin <em>Alex.</em></motion.h2>
          <div className="about-grid">
            <motion.div className="about-photo" variants={fadeUp}>
              <div className="photo-fallback" aria-hidden="true">
                <span className="mono-mark">A.</span>
                <span className="sub">Frag Alex</span>
              </div>
              <img src="/alex.jpg" alt="Alex – Allrounder für Haus, Garten und Küche im Raum Zürich" loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none' }} />
            </motion.div>
            <motion.div variants={fadeUp}>
              <div className="about-text">
                {C.about.paras.map((p) => <p key={p.slice(0, 16)}>{p}</p>)}
              </div>
              <ul className="about-highlights">
                {C.about.highlights.map((h) => <li key={h}><Icon id="i-check" /> {h}</li>)}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ───────── FAQ ───────── */
export function Faq() {
  return (
    <section className="section faq" id="faq" aria-labelledby="faq-title">
      <div className="container-narrow">
        <motion.div variants={stagger} initial={ANIM_OK ? 'hidden' : false} whileInView="show" viewport={viewportOnce}>
          <motion.p className="section-label" variants={fadeUp}>{C.faq.label}</motion.p>
          <motion.h2 id="faq-title" variants={fadeUp}>Gut zu <em>wissen.</em></motion.h2>
          <motion.div className="faq-list" variants={fadeUp}>
            {C.faq.list.map((f) => (
              <details className="faq-item" key={f.q}>
                <summary>
                  {f.q}
                  <span className="faq-plus"><Icon id="i-plus" /></span>
                </summary>
                <div className="faq-body"><div><p className="faq-a">{f.a}</p></div></div>
              </details>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ───────── Einsatzgebiet ───────── */
export function Area() {
  return (
    <section className="area" aria-labelledby="area-title">
      <ParallaxImg src={C.IMG.lake} alt="" className="area-bg" />
      <motion.div className="container" variants={stagger} initial={ANIM_OK ? 'hidden' : false} whileInView="show" viewport={viewportOnce}>
        <motion.p className="section-label" id="area-title" variants={fadeUp}>{C.area.label}</motion.p>
        <motion.h2 variants={fadeUp}>{C.area.title}</motion.h2>
        <motion.div className="area-tags" variants={fadeUp}>
          {C.area.tags.map((t) => <span className="area-tag" key={t}><Icon id="i-map-pin" /> {t}</span>)}
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ───────── Kontakt · Abend, Glühwürmchen ───────── */
export function Kontakt() {
  return (
    <section className="section kontakt" id="kontakt" aria-labelledby="kontakt-title">
      <Particles density={120} warm className="kontakt-particles" />
      <div className="container">
        <motion.div variants={stagger} initial={ANIM_OK ? 'hidden' : false} whileInView="show" viewport={viewportOnce}>
          <motion.p className="section-label" variants={fadeUp}>{C.contact.label}</motion.p>
          <motion.h2 id="kontakt-title" variants={fadeUp}>{C.contact.title1}<br />{C.contact.title2}</motion.h2>
          <motion.p className="lead" variants={fadeUp}>{C.contact.text}</motion.p>
          <motion.div className="contact-rows" variants={fadeUp}>
            {C.contact.rows.map((row) => (
              <a href={row.href} className="contact-row" key={row.kind} aria-label={row.label}>
                <span className="contact-kind">{row.kind}</span>
                <span className="contact-value">{row.value}</span>
                <span className="contact-arrow"><Icon id="i-arrow-right" /></span>
              </a>
            ))}
          </motion.div>
          <motion.p className="kontakt-note" variants={fadeUp}>
            <Icon id="i-clock" /> {C.contact.note}
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

/* ───────── Footer + FAB + Progress ───────── */
export function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <span className="footer-logo">
          <LogoMark />
          <span>frag alex<span className="dot">.</span></span>
        </span>
        <span>© 2026 Frag Alex · Allrounder für Haus, Garten & Küche · Fotos: Unsplash</span>
        <a href="#kontakt">Kontakt</a>
      </div>
    </footer>
  )
}

export function Fab() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const handler = () => {
      const hero = document.getElementById('hero')
      setShow(hero ? window.scrollY > hero.offsetHeight * 0.7 : true)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  if (!show) return null
  return (
    <motion.a href={C.wa} className="fab" aria-label="Alex per WhatsApp kontaktieren"
      initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35, ease: EASE }}>
      <Icon id="i-whatsapp" />
    </motion.a>
  )
}

export function Progress() {
  const { scrollYProgress } = useScroll()
  return <motion.div className="progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
}
