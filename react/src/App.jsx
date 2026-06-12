import { useEffect, useState } from 'react'
import {
  Nav, Hero, ServicesIndex, Ablauf, Quote, Preise,
  About, Faq, Area, Contact, Footer, HouseBuilder,
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
      <Nav theme={theme} onToggleTheme={toggleTheme} />
      <HouseBuilder />
      <main id="main">
        <Hero />
        <ServicesIndex />
        <Ablauf />
        <Quote />
        <Preise />
        <About />
        <Faq />
        <Area />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
