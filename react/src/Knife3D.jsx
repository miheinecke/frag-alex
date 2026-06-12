import { useEffect, useRef, useState } from 'react'
import { makeFoldable } from './knifeFold'

/* ═══════════════════════════════════════════════════════════
   Das Sackmesser als Begleiter der ganzen Seite.
   Fix im Viewport, bewegt sich NUR mit dem Scrollen:
   dreht, kippt, wandert — und klappt auf/zu (Modell-Swap
   exakt im Kantenmoment, wo der Wechsel unsichtbar ist).
   ═══════════════════════════════════════════════════════════ */

/* Posen pro Sektion: x/y als Anteil der halben Viewportbreite/-höhe,
   s = Grösse, ry/rx = Rotation, o = Deckkraft, open = auf/zu */
const POSES = [
  { id: 'hero',       x: 0.74,  y: -0.02, s: 0.88, ry: 0.35,  rx: 0.18, o: 1.0,  open: true,  m: { x: 0.6, y: 0.52, s: 0.38 } },
  { id: 'leistungen', x: -0.9,  y: 0.02,  s: 0.78, ry: 2.95,  rx: 0.30, o: 0.6,  open: true,  m: { x: -1.0, y: 0.38, s: 0.36, o: 0.28 } },
  { id: 'ablauf',     x: 0.68,  y: -0.02, s: 0.95, ry: 4.30,  rx: 0.95, o: 0.6,  open: true,  m: { x: 1.0, y: 0.38, s: 0.36, o: 0.28 } },
  { id: 'preise',     x: -1.13, y: 0.06,  s: 0.72, ry: 5.60,  rx: 0.35, o: 0.22, open: false, m: { x: -0.95, s: 0.45, o: 0.18 } },
  { id: 'alex',       x: 1.0,   y: 0.0,   s: 0.8,  ry: 8.40,  rx: 0.05, o: 0.6,  open: true,  m: { x: 1.0, y: 0.4, s: 0.36, o: 0.28 } },
  { id: 'faq',        x: -1.05, y: 0.0,   s: 0.75, ry: 9.60,  rx: 0.55, o: 0.5,  open: true,  m: { x: -1.0, y: 0.42, s: 0.36, o: 0.26 } },
  { id: 'kontakt',    x: 0.72,  y: -0.33, s: 0.62, ry: 11.60, rx: 0.18, o: 0.9,  open: false, m: { x: 0.55, y: 0.25, s: 0.45, o: 0.85 } },
]
const poseFor = (i) => {
  const p = POSES[i]
  return window.innerWidth < 880 && p.m ? { ...p, ...p.m } : p
}

/* Spurführung: Diese Text-Blöcke darf das Messer nicht überlagern.
   Pro Sektion die Seite, auf der das Messer wohnt, plus Selektoren.
   Kontakt ist bewusst ausgenommen (komponierter Schlussmoment). */
const LANES = {
  hero:       { side: 'r', sels: ['#hero .todo-list', '#hero .claim .up', '#hero .hero-sub', '#hero .hero-cta > *'] },
  leistungen: { side: 'l', sels: ['#leistungen .sec-head > div', '#leistungen .index'] },
  ablauf:     { side: 'r', sels: ['#ablauf .sec-head > div', '#ablauf .steps'] },
  preise:     { side: 'l', sels: ['#preise .sec-head > div', '#preise .price-table', '#preise .examples'] },
  alex:       { side: 'r', sels: ['#alex .about-lead', '#alex .about-cols', '#alex .about-checks'] },
  faq:        { side: 'l', sels: ['#faq .sec-head > div', '#faq .faq-list'] },
}
const CAM_HALF_H = Math.tan((30 * Math.PI) / 360) * 4.4   /* fov 30°, z 4.4 */

const smooth = (t) => t * t * (3 - 2 * t)
const lerp = (a, b, t) => a + (b - a) * t

export default function Knife3D() {
  const mountRef = useRef(null)
  const [failed, setFailed] = useState(false)
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (reduce) return
    let renderer, raf, disposed = false
    let cleanupEvents = null
    const mount = mountRef.current

    ;(async () => {
      try {
        const THREE = await import('three')
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
        const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')

        const loader = new GLTFLoader()
        const load = (url) => new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject))
        const [openGltf, closedGltf] = await Promise.all([load('knife-open.glb'), load('knife-closed.glb')])
        if (disposed) return

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60)
        camera.position.set(0, 0, 4.4)

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 880 ? 1.5 : 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 0.92
        mount.appendChild(renderer.domElement)

        /* Studio-Umgebung: scharfe Reflexionen auf dem Stahl */
        const pmrem = new THREE.PMREMGenerator(renderer)
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
        scene.add(new THREE.AmbientLight(0xffffff, 0.22))
        const key = new THREE.DirectionalLight(0xffffff, 1.1)
        key.position.set(2.5, 3, 4)
        scene.add(key)

        const maxAniso = renderer.capabilities.getMaxAnisotropy()
        const prep = (gltf) => {
          const obj = gltf.scene
          obj.traverse((n) => {
            if (n.isMesh && n.material) {
              if (n.material.map) n.material.map.anisotropy = maxAniso
              n.material.envMapIntensity = 0.85
            }
          })
          const box = new THREE.Box3().setFromObject(obj)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3()).length()
          obj.position.sub(center)
          obj.scale.setScalar(3.0 / size)
          const g = new THREE.Group()
          g.add(obj)
          return g
        }
        /* Offenes Modell wird klappbar gemacht: Werkzeuge als starre
           Gruppen um die Scharniere (siehe knifeFold.js) */
        const DEBUG = typeof location !== 'undefined' && location.hash.includes('knife-debug')
        let openMesh = null
        openGltf.scene.traverse((node) => { if (node.isMesh) openMesh = node })
        const foldable = makeFoldable(THREE, openMesh, { debugColors: location.hash.includes('knife-colors') })
        openGltf.scene.clear()
        openGltf.scene.add(foldable.root)

        const openModel = prep(openGltf)
        const closedModel = prep(closedGltf)
        const pivot = new THREE.Group()
        pivot.add(openModel, closedModel)
        scene.add(pivot)

        const resize = () => {
          renderer.setSize(window.innerWidth, window.innerHeight)
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
        }
        resize()

        if (DEBUG) {
          closedModel.visible = false
          openModel.visible = true
          scene.background = new THREE.Color(0xf5f5f0)
          renderer.domElement.style.filter = 'none'
          mount.style.zIndex = 50
          scene.add(new THREE.AxesHelper(1.8))
          const dbg = { fold: 0, ry: 0, rx: 0, s: 1 }
          window.__knifeDebug = {
            info: { bones: foldable.boneCount, frame: foldable.frame },
            set(p) { Object.assign(dbg, p); foldable.setFold(dbg.fold) },
          }
          foldable.setFold(0)
          const dtick = () => {
            if (disposed) return
            raf = requestAnimationFrame(dtick)
            pivot.rotation.set(dbg.rx, dbg.ry, 0)
            pivot.scale.setScalar(dbg.s)
            renderer.render(scene, camera)
          }
          window.addEventListener('resize', resize)
          cleanupEvents = () => window.removeEventListener('resize', resize)
          dtick()
          return
        }

        /* Sichtbare Ausdehnung des Messers (Welt-Einheiten) pro Pose:
           echte Vertices samplen und mit der Posen-Rotation projizieren */
        openModel.updateMatrixWorld(true)
        const samples = []
        {
          let sampled = false
          openModel.traverse((node) => {
            if (sampled || !node.isMesh) return
            sampled = true
            const pa = node.geometry.attributes.position
            const step = Math.max(1, Math.floor(pa.count / 900))
            for (let vi = 0; vi < pa.count; vi += step) {
              samples.push(node.localToWorld(new THREE.Vector3().fromBufferAttribute(pa, vi)))
            }
          })
        }
        const extentCache = new Map()
        const extentFor = (p) => {
          const key = p.ry + '/' + p.rx
          let e = extentCache.get(key)
          if (!e) {
            const eul = new THREE.Euler(p.rx, p.ry, 0)
            let hw = 0, hh = 0
            const v = new THREE.Vector3()
            for (const c of samples) {
              v.copy(c).applyEuler(eul)
              if (Math.abs(v.x) > hw) hw = Math.abs(v.x)
              if (Math.abs(v.y) > hh) hh = Math.abs(v.y)
            }
            e = { hw, hh }
            extentCache.set(key, e)
          }
          return e
        }

        /* Spur-Klemmung: Pose so verschieben/verkleinern, dass das Messer
           neben dem Text bleibt. Gibt es keine Spur (mobil), wird es zum
           dezenten Wasserzeichen statt den Text zu stören. */
        const laneEls = {}
        for (const [id, lane] of Object.entries(LANES)) {
          laneEls[id] = lane.sels.flatMap((sel) => [...document.querySelectorAll(sel)])
        }
        const clampPose = (p) => {
          const lane = LANES[p.id]
          const lels = laneEls[p.id]
          if (!lane || !lels || !lels.length) return p
          const vw = window.innerWidth, vh = window.innerHeight
          const ppu = (vh / 2) / CAM_HALF_H
          const ext = extentFor(p)
          let s = p.s, o = p.o
          let halfW = ext.hw * s * ppu
          const halfH = ext.hh * s * ppu
          const cy = (1 - p.y) * vh / 2
          const mirror = lane.side === 'r'
          let edge = Infinity
          for (const el of lels) {
            const r = el.getBoundingClientRect()
            if (!r.width || !r.height) continue
            if (r.bottom < cy - halfH || r.top > cy + halfH) continue
            edge = Math.min(edge, mirror ? vw - r.right : r.left)
          }
          if (!isFinite(edge)) return p
          const gap = vw < 880 ? 14 : 26
          const lanePx = Math.max(0, edge - gap)
          let c = mirror ? vw - (1 + p.x) * vw / 2 : (1 + p.x) * vw / 2
          if (lanePx < 90) {
            /* keine echte Spur → Wasserzeichen unter dem Text */
            return { ...p, o: Math.min(o, 0.3) }
          }
          if (c + halfW > lanePx) {
            const f = Math.max(0.42, Math.min(1, lanePx / (2 * halfW * 0.62)))
            if (f < 1) {
              s *= f; halfW *= f
              o *= Math.max(0.6, f)
            }
            c = lanePx - halfW
            if (lanePx < halfW * 0.7) o = Math.max(0.12, Math.min(o, 0.35))
          }
          const cx = mirror ? vw - c : c
          return { ...p, x: cx / (vw / 2) - 1, s, o }
        }

        /* Ziel-Pose: Übergang läuft, während die NÄCHSTE Sektion ins Bild fährt */
        const els = POSES.map((p) => document.getElementById(p.id))
        const target = { x: 0, y: 0, s: 1, ry: 0, rx: 0, o: 1, fold: 0 }
        const computeTarget = () => {
          const vh = window.innerHeight
          let i = 0
          els.forEach((el, idx) => {
            if (el && el.getBoundingClientRect().top <= vh * 0.5) i = idx
          })
          const a = clampPose(poseFor(i))
          let t = 0
          if (i < POSES.length - 1 && els[i + 1]) {
            const nextTop = els[i + 1].getBoundingClientRect().top
            t = Math.max(0, Math.min(1, (vh * 0.92 - nextTop) / (vh * 0.62)))
          }
          const bRaw = i < POSES.length - 1 ? poseFor(i + 1) : null
          const b = bRaw ? (t > 0 ? clampPose(bRaw) : bRaw) : a
          const ts = smooth(t)
          target.x = lerp(a.x, b.x, ts)
          target.y = lerp(a.y, b.y, ts)
          target.s = lerp(a.s, b.s, ts)
          target.ry = lerp(a.ry, b.ry, ts)
          target.rx = lerp(a.rx, b.rx, ts)
          target.o = lerp(a.o, b.o, ts)
          /* Echtes Klappen statt Modell-Swap. Timing so, dass man es SIEHT:
             zuklappen früh (noch gut sichtbar in der alten Spur),
             aufklappen spät (angekommen in der neuen Spur) — dazwischen
             gleitet das Messer gedimmt über die Seite */
          if (a.open === b.open) {
            target.fold = a.open ? 0 : 1
          } else {
            const ft = b.open
              ? Math.max(0, Math.min(1, (t - 0.58) / 0.38))
              : Math.max(0, Math.min(1, (t - 0.04) / 0.38))
            target.fold = lerp(a.open ? 0 : 1, b.open ? 0 : 1, smooth(ft))
          }
          /* Seitenwechsel links↔rechts: Opacity dippt in der Mitte,
             damit das Messer nie sichtbar unter dem Text durchfährt.
             Je schmaler das Fenster, desto tiefer der Dip. */
          if (a.x * b.x < 0 && t > 0) {
            const dip = window.innerWidth < 1280 ? 0.95 : 0.8
            target.o *= 1 - dip * Math.sin(Math.PI * ts)
          }
        }
        computeTarget()
        window.__knife = target

        const onScroll = () => computeTarget()
        const onResize = () => { resize(); computeTarget() }
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onResize)
        cleanupEvents = () => {
          window.removeEventListener('scroll', onScroll)
          window.removeEventListener('resize', onResize)
        }

        /* Sanft nachführen — Bewegung kommt ausschliesslich vom Scrollen */
        const cur = { ...target }
        const tick = () => {
          if (disposed) return
          raf = requestAnimationFrame(tick)
          if (document.hidden) return
          const f = window.__knifeJump ? 1 : 0.085
          cur.x += (target.x - cur.x) * f
          cur.y += (target.y - cur.y) * f
          cur.s += (target.s - cur.s) * f
          cur.ry += (target.ry - cur.ry) * f
          cur.rx += (target.rx - cur.rx) * f
          cur.o += (target.o - cur.o) * f
          cur.fold += (target.fold - cur.fold) * f
          const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
          const halfW = halfH * camera.aspect
          pivot.position.set(cur.x * halfW, cur.y * halfH, 0)
          pivot.scale.setScalar(cur.s)
          pivot.rotation.y = cur.ry
          pivot.rotation.x = cur.rx
          /* Werkzeuge klappen wirklich — erst ganz am Schluss übernimmt
             der Scan des geschlossenen Messers (sauberere Silhouette) */
          foldable.setFold(Math.min(1, cur.fold * 1.08))
          const closedNow = cur.fold > 0.93
          openModel.visible = !closedNow
          closedModel.visible = closedNow
          renderer.domElement.style.opacity = String(cur.o)
          renderer.render(scene, camera)
        }
        tick()
      } catch (e) {
        console.error('Knife3D:', e)
        if (!disposed) setFailed(true)
      }
    })()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      if (cleanupEvents) cleanupEvents()
      if (renderer) {
        renderer.dispose()
        renderer.domElement.remove()
      }
    }
  }, [reduce])

  if (reduce || failed) return null
  return <div ref={mountRef} className="knife-stage" aria-hidden="true" />
}
