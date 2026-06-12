/* ═══════════════════════════════════════════════════════════
   Macht aus dem verschmolzenen Scan des offenen Sackmessers
   ein klappbares Modell: Werkzeuge werden geometrisch
   segmentiert (Fächer-Winkel um die beiden Scharnier-Enden)
   und als starre Gruppen um die Scharnierachse gedreht.

   Der Scan hat keine benannten Teile — die Zerlegung passiert
   rein räumlich: Griff-Quader bleibt statisch, alles ausserhalb
   wird dem näheren Scharnier zugeordnet und nach Winkel in
   einzelne Werkzeuge geclustert.
   ═══════════════════════════════════════════════════════════ */

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const norm = (v) => {
  const l = Math.hypot(v[0], v[1], v[2])
  return [v[0] / l, v[1] / l, v[2] / l]
}
const mul3 = (M, v) => [dot(M[0], v), dot(M[1], v), dot(M[2], v)]

/* Grösster Eigenvektor einer symmetrischen 3×3-Matrix (Potenziteration) */
function topEigen(M, seed = [1, 0.31, 0.17]) {
  let v = norm(seed)
  for (let k = 0; k < 120; k++) v = norm(mul3(M, v))
  return v
}

/* Scharnierachse = dominante Flächennormale (die flachen Seiten
   des Fächers zeigen alle in ±Pin-Richtung) */
function pinAxis(posArr, idxArr) {
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (let t = 0; t < idxArr.length; t += 3) {
    const a = idxArr[t] * 3, b = idxArr[t + 1] * 3, c = idxArr[t + 2] * 3
    const ux = posArr[b] - posArr[a], uy = posArr[b + 1] - posArr[a + 1], uz = posArr[b + 2] - posArr[a + 2]
    const vx = posArr[c] - posArr[a], vy = posArr[c + 1] - posArr[a + 1], vz = posArr[c + 2] - posArr[a + 2]
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx
    C[0][0] += nx * nx; C[0][1] += nx * ny; C[0][2] += nx * nz
    C[1][1] += ny * ny; C[1][2] += ny * nz; C[2][2] += nz * nz
  }
  C[1][0] = C[0][1]; C[2][0] = C[0][2]; C[2][1] = C[1][2]
  return topEigen(C)
}

/* Längsachse = grösste Streuung in der Fächerebene */
function longAxis(posArr, pin) {
  const n = posArr.length / 3
  const m = [0, 0, 0]
  for (let i = 0; i < n; i++) { m[0] += posArr[i * 3]; m[1] += posArr[i * 3 + 1]; m[2] += posArr[i * 3 + 2] }
  m[0] /= n; m[1] /= n; m[2] /= n
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (let i = 0; i < n; i++) {
    let p = [posArr[i * 3] - m[0], posArr[i * 3 + 1] - m[1], posArr[i * 3 + 2] - m[2]]
    const d = dot(p, pin)
    p = [p[0] - d * pin[0], p[1] - d * pin[1], p[2] - d * pin[2]]
    for (let r = 0; r < 3; r++) for (let s = 0; s < 3; s++) C[r][s] += p[r] * p[s]
  }
  return { axis: topEigen(C), mean: m }
}

/**
 * Zerlegt das Mesh des offenen Messers in Griff + klappbare Werkzeuge.
 * Liefert { root, setFold } — setFold(0) = offen, setFold(1) = zugeklappt.
 * opts erlaubt Feintuning: handleLen/handleWid (Anteil der Bbox),
 * hingeInset (Scharnier-Abstand vom Griffende), gapDeg (Cluster-Trennwinkel).
 */
export function makeFoldable(THREE, mesh, opts = {}) {
  const { handleLen = 0.62, handleWid = 0.42, hingeInset = 0.1, gapDeg = 14, debugColors = false } = opts
  const geo = mesh.geometry
  /* Positionen deinterleaven — .array ist bei GLTF oft interleaved */
  const posAttr = geo.attributes.position
  const posArr = new Float32Array(posAttr.count * 3)
  for (let i = 0; i < posAttr.count; i++) {
    posArr[i * 3] = posAttr.getX(i)
    posArr[i * 3 + 1] = posAttr.getY(i)
    posArr[i * 3 + 2] = posAttr.getZ(i)
  }
  const idxArr = geo.index ? geo.index.array : Uint32Array.from({ length: posAttr.count }, (_, i) => i)
  const triCount = idxArr.length / 3

  const Z = pinAxis(posArr, idxArr)
  const { axis: X0, mean } = longAxis(posArr, Z)
  const Y = norm([Z[1] * X0[2] - Z[2] * X0[1], Z[2] * X0[0] - Z[0] * X0[2], Z[0] * X0[1] - Z[1] * X0[0]])
  const X = norm([Y[1] * Z[2] - Y[2] * Z[1], Y[2] * Z[0] - Y[0] * Z[2], Y[0] * Z[1] - Y[1] * Z[0]])

  /* Griff-Slab im (X,Y)-Rahmen bestimmen: Ausdehnung um die Mitte */
  const n = posArr.length / 3
  let minU = 1e9, maxU = -1e9, minV = 1e9, maxV = -1e9
  const U = new Float32Array(n), V = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const p = [posArr[i * 3] - mean[0], posArr[i * 3 + 1] - mean[1], posArr[i * 3 + 2] - mean[2]]
    U[i] = dot(p, X); V[i] = dot(p, Y)
    if (U[i] < minU) minU = U[i]; if (U[i] > maxU) maxU = U[i]
    if (V[i] < minV) minV = V[i]; if (V[i] > maxV) maxV = V[i]
  }
  const uSpan = maxU - minU, vSpan = maxV - minV
  const hLen = uSpan * handleLen / 2, hWid = vSpan * handleWid / 2
  const hingeU = hLen * (1 - hingeInset)

  /* Dreiecke zuordnen: Griff (statisch) oder Werkzeug an Scharnier ± */
  const triHinge = new Int8Array(triCount)   /* 0 Griff, +1/-1 Scharnierseite */
  const triTheta = new Float32Array(triCount)
  for (let t = 0; t < triCount; t++) {
    const a = idxArr[t * 3], b = idxArr[t * 3 + 1], c = idxArr[t * 3 + 2]
    const cu = (U[a] + U[b] + U[c]) / 3, cv = (V[a] + V[b] + V[c]) / 3
    if (Math.abs(cu) <= hLen && Math.abs(cv) <= hWid) { triHinge[t] = 0; continue }
    const side = cu >= 0 ? 1 : -1
    /* Winkel um das Scharnier, 0 = zeigt einwärts (Richtung anderes Griffende) */
    const du = (cu - side * hingeU) * -side
    triTheta[t] = Math.atan2(cv, du)
    triHinge[t] = side
  }

  /* Pro Scharnier: Winkel clustern (sortieren, Lücken > gapDeg trennen) */
  const gap = (gapDeg * Math.PI) / 180
  const bones = [{ hinge: 0, theta: 0 }]            /* bone 0 = Griff */
  const triBone = new Int16Array(triCount)
  for (const side of [1, -1]) {
    const list = []
    for (let t = 0; t < triCount; t++) if (triHinge[t] === side) list.push([triTheta[t], t])
    if (!list.length) continue
    list.sort((p, q) => p[0] - q[0])
    let start = 0
    const flush = (end) => {
      const cluster = list.slice(start, end)
      let sum = 0
      for (const [th] of cluster) sum += th
      const boneIdx = bones.length
      bones.push({ hinge: side, theta: sum / cluster.length })
      for (const [, t] of cluster) triBone[t] = boneIdx
    }
    for (let i = 1; i < list.length; i++) {
      if (list[i][0] - list[i - 1][0] > gap) { flush(i); start = i }
    }
    flush(list.length)
  }

  /* Winzige Cluster (Scan-Schutt) und kurze Anbauten (Haken, Ring,
     Griffschalen-Fragmente) zum Griff schlagen — nur echte Klingen
     mit Reichweite deutlich über das Scharnier hinaus klappen */
  const boneTris = new Array(bones.length).fill(0)
  const boneReach = new Array(bones.length).fill(0)
  for (let t = 0; t < triCount; t++) {
    const bi = triBone[t]
    boneTris[bi]++
    if (bi !== 0) {
      const a = idxArr[t * 3], b = idxArr[t * 3 + 1], c = idxArr[t * 3 + 2]
      const cu = (U[a] + U[b] + U[c]) / 3, cv = (V[a] + V[b] + V[c]) / 3
      const r = Math.hypot(cu - bones[bi].hinge * hingeU, cv)
      if (r > boneReach[bi]) boneReach[bi] = r
    }
  }
  const minReach = hLen * 0.8
  for (let t = 0; t < triCount; t++) {
    const bi = triBone[t]
    if (boneTris[bi] < 40 || boneReach[bi] < minReach) triBone[t] = 0
  }

  /* Pro Bone eigene Index-Liste — Attribute werden geteilt */
  const lists = bones.map(() => [])
  for (let t = 0; t < triCount; t++) {
    lists[triBone[t]].push(idxArr[t * 3], idxArr[t * 3 + 1], idxArr[t * 3 + 2])
  }

  const Xv = new THREE.Vector3(...X), Yv = new THREE.Vector3(...Y), Zv = new THREE.Vector3(...Z)
  const meanV = new THREE.Vector3(...mean)
  const root = new THREE.Group()
  const moving = []
  const palette = [0x888888, 0xe6194b, 0x3cb44b, 0xffe119, 0x4363d8, 0xf58231, 0x911eb4, 0x46f0f0, 0xf032e6, 0xbcf60c, 0xfabebe, 0x008080, 0xe6beff, 0x9a6324]
  bones.forEach((bone, i) => {
    if (!lists[i].length) return
    const g = new THREE.BufferGeometry()
    for (const name of Object.keys(geo.attributes)) g.setAttribute(name, geo.attributes[name])
    g.setIndex(lists[i])
    const mat = debugColors
      ? new THREE.MeshBasicMaterial({ color: palette[i % palette.length], wireframe: false })
      : mesh.material
    const m = new THREE.Mesh(g, mat)
    if (i === 0) { root.add(m); return }
    const pivot = meanV.clone().addScaledVector(Xv, bone.hinge * hingeU)
    const holder = new THREE.Group()
    holder.position.copy(pivot)
    m.position.copy(pivot.clone().negate())
    holder.add(m)
    root.add(holder)
    /* Drehrichtung: bringt θ auf 0 (einwärts, in den Griff); die
       effektive Achse ist î×Ŷ und hängt von der Scharnierseite ab */
    moving.push({ holder, angle: bone.theta, axis: Zv.clone().multiplyScalar(bone.hinge) })
  })

  const setFold = (f) => {
    const e = f * f * (3 - 2 * f)
    for (const { holder, angle, axis } of moving) {
      holder.quaternion.setFromAxisAngle(axis, angle * e)
    }
  }

  return { root, setFold, boneCount: bones.length, frame: { X, Y, Z, mean, hLen, hWid, hingeU } }
}
