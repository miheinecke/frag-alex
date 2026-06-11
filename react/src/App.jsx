import { useEffect, useState } from 'react'
import {
  Nav, Hero, Ticker, Intro, MowBand,
  SceneGarten, SceneWerkstatt, SceneUnterwegs, SceneApero,
  RestRow, Ablauf, Quote, Preise, About, Faq, Area, Kontakt,
  Footer, Fab, Progress,
} from './components'

export default function App() {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('fragalex-theme')
      if (stored) return stored
    } catch { /* private mode */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
    else document.documentElement.removeAttribute('data-theme')
  }, [theme])

  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem('fragalex-theme', next) } catch { /* private mode */ }
      return next
    })
  }

  return (
    <>
      <a href="#main" className="skip-link">Zum Inhalt springen</a>
      <div className="grain" aria-hidden="true" />
      <Progress />
      <Nav theme={theme} onToggleTheme={toggleTheme} />
      <main id="main">
        <Hero />
        <Ticker />
        <Intro />
        <MowBand />
        <SceneGarten />
        <SceneWerkstatt />
        <SceneUnterwegs />
        <SceneApero />
        <RestRow />
        <Ablauf />
        <Quote />
        <Preise />
        <About />
        <Faq />
        <Area />
        <Kontakt />
      </main>
      <Footer />
      <Fab />
    </>
  )
}
