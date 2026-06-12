import { useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════
   Das Sackmesser als Begleiter der ganzen Seite.
   Fix im Viewport, bewegt sich NUR mit dem Scrollen:
   dreht, kippt, wandert — und klappt auf/zu (Modell-Swap
   exakt im Kantenmoment, wo der Wechsel unsichtbar ist).
   ═══════════════════════════════════════════════════════════ */

const HALF_PI = Math.PI / 2

/* Posen pro Sektion: x/y als Anteil der halben Viewportbreite/-höhe,
   s = Grösse, ry/rx = Rotation, o = Deckkraft, open = auf/zu */
const POSES = [
  { id: 'hero',       x: 0.62,  y: -0.04, s: 1.05, ry: 0.25,  rx: 0.10, o: 1.0,  open: false, m: { x: 0.34, y: 0.46, s: 0.5 } },
  { id: 'leistungen', x: -0.58, y: 0.02,  s: 0.82, ry: 2.95,  rx: 0.30, o: 0.5,  open: true,  m: { x: -0.5, y: 0.38, s: 0.5, o: 0.35 } },
  { id: 'ablauf',     x: 0.60,  y: -0.02, s: 0.92, ry: 4.30,  rx: 0.95, o: 0.55, open: true,  m: { x: 0.5, y: 0.38, s: 0.52, o: 0.4 } },
  { id: 'preise',     x: 0.05,  y: 0.06,  s: 1.40, ry: 5.60,  rx: 0.35, o: 0.20, open: true,  m: { s: 1.0, o: 0.14 } },
  { id: 'alex',       x: 0.56,  y: 0.0,   s: 0.74, ry: 6.28,  rx: 0.05, o: 0.55, open: true,  m: { x: 0.48, y: 0.4, s: 0.46, o: 0.4 } },
  { id: 'faq',        x: -0.62, y: 0.0,   s: 0.70, ry: 7.60,  rx: 0.55, o: 0.45, open: true,  m: { x: -0.5, y: 0.42, s: 0.44, o: 0.35 } },
  { id: 'kontakt',    x: 0.0,   y: -0.05, s: 0.85, ry: 9.10,  rx: 0.18, o: 0.9,  open: false, m: { y: 0.22, s: 0.58, o: 0.85 } },
]
const poseFor = (i) => {
  const p = POSES[i]
  return window.innerWidth < 880 && p.m ? { ...p, ...p.m } : p
}

const smooth = (t) => t * t * (3 - 2 * t)
const lerp = (a, b, t) => a + (b - a) * t

/* Scrollpunkt im Segment, an dem ry möglichst nah an einer Kantenansicht
   (ry mod π == π/2) liegt — dort wird auf/zu getauscht. */
function swapPoint(ryA, ryB) {
  let best = 0.5, bestDist = Infinity
  for (let k = -2; k < 8; k++) {
    const edge = k * Math.PI + HALF_PI
    const t = (edge - ryA) / (ryB - ryA)
    if (t > 0.05 && t < 0.95) {
      const d = Math.abs(t - 0.5)
      if (d < bestDist) { bestDist = d; best = t }
    }
  }
  return best
}

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

        /* Ziel-Pose: Übergang läuft, während die NÄCHSTE Sektion ins Bild fährt */
        const els = POSES.map((p) => document.getElementById(p.id))
        const target = { x: 0, y: 0, s: 1, ry: 0, rx: 0, o: 1, open: false }
        const computeTarget = () => {
          const vh = window.innerHeight
          let i = 0
          els.forEach((el, idx) => {
            if (el && el.getBoundingClientRect().top <= vh * 0.5) i = idx
          })
          const a = poseFor(i)
          let t = 0
          if (i < POSES.length - 1 && els[i + 1]) {
            const nextTop = els[i + 1].getBoundingClientRect().top
            t = Math.max(0, Math.min(1, (vh * 0.92 - nextTop) / (vh * 0.62)))
          }
          const b = i < POSES.length - 1 ? poseFor(i + 1) : a
          const ts = smooth(t)
          target.x = lerp(a.x, b.x, ts)
          target.y = lerp(a.y, b.y, ts)
          target.s = lerp(a.s, b.s, ts)
          target.ry = lerp(a.ry, b.ry, ts)
          target.rx = lerp(a.rx, b.rx, ts)
          target.o = lerp(a.o, b.o, ts)
          target.open = a.open === b.open ? a.open : (t < swapPoint(a.ry, b.ry) ? a.open : b.open)
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
          const f = 0.085
          cur.x += (target.x - cur.x) * f
          cur.y += (target.y - cur.y) * f
          cur.s += (target.s - cur.s) * f
          cur.ry += (target.ry - cur.ry) * f
          cur.rx += (target.rx - cur.rx) * f
          cur.o += (target.o - cur.o) * f
          const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
          const halfW = halfH * camera.aspect
          pivot.position.set(cur.x * halfW, cur.y * halfH, 0)
          pivot.scale.setScalar(cur.s)
          pivot.rotation.y = cur.ry
          pivot.rotation.x = cur.rx
          openModel.visible = target.open
          closedModel.visible = !target.open
          renderer.domElement.style.opacity = String(cur.o)
          renderer.render(scene, camera)
        }
        tick()
      } catch (e) {
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
