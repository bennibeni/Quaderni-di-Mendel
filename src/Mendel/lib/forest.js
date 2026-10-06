// I tre modelli che imparano dagli esempi: tabella di conteggio, albero di classificazione
// e Random Forest. Le proprietà sono piccoli interi (qui 0 o 1: sì/no), quindi l’albero prova ogni soglia.

/** Generatore pseudo-casuale con seme (mulberry32): stessi numeri a parità di seme. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(arr, random) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const V = 13; // valori possibili di una proprietà: 0..12

/**
 * Albero di classificazione (indice di Gini). `cols[f][r]` è la proprietà f della famiglia r,
 * `idx` le famiglie di addestramento (con ripetizioni nel campione bootstrap della foresta).
 * `mtry` proprietà estratte a caso per nodo: tutte per l'albero singolo, circa √13 = 3 nella foresta.
 */
export function buildTree(
  cols,
  y,
  idx,
  {
    K = 8,
    minLeaf = 5,
    maxDepth = 60,
    mtry = cols.length,
    random = Math.random,
  } = {},
) {
  const F = cols.length;
  const feat = [],
    thr = [],
    left = [],
    right = [],
    dist = [],
    size = [];
  const hist = new Float64Array(V * K),
    cnt = new Float64Array(K),
    cl = new Float64Array(K);
  const order = Array.from({ length: F }, (_, i) => i);
  idx = Int32Array.from(idx);

  function grow(start, end, depth) {
    const node = feat.length;
    feat.push(-1);
    thr.push(0);
    left.push(-1);
    right.push(-1);
    size.push(end - start);
    const n = end - start;
    cnt.fill(0);
    for (let p = start; p < end; p++) cnt[y[idx[p]]]++;
    dist.push(Float64Array.from(cnt, (c) => c / n));
    let pure = false,
      parent = 0;
    for (let k = 0; k < K; k++) {
      if (cnt[k] === n) pure = true;
      parent += cnt[k] * cnt[k];
    }
    if (pure || n < 2 * minLeaf || depth >= maxDepth) return node;

    if (mtry < F) shuffle(order, random);
    let best = -1,
      bestT = 0,
      bestScore = parent / n + 1e-9,
      tried = 0;
    for (const f of order) {
      // Come nella Random Forest classica: si provano `mtry` proprietà, e altre solo se nessuna divide il nodo.
      if (tried >= mtry && best >= 0) break;
      tried++;
      hist.fill(0);
      const col = cols[f];
      let maxv = 0;
      for (let p = start; p < end; p++) {
        const r = idx[p],
          v = col[r];
        hist[v * K + y[r]]++;
        if (v > maxv) maxv = v;
      }
      cl.fill(0);
      let nl = 0;
      for (let t = 0; t < maxv; t++) {
        let added = 0;
        for (let k = 0; k < K; k++) {
          const h = hist[t * K + k];
          cl[k] += h;
          added += h;
        }
        if (!added) continue;
        nl += added;
        const nr = n - nl;
        if (nl < minLeaf) continue;
        if (nr < minLeaf) break;
        let sl = 0,
          sr = 0;
        for (let k = 0; k < K; k++) {
          sl += cl[k] * cl[k];
          const cr = cnt[k] - cl[k];
          sr += cr * cr;
        }
        const score = sl / nl + sr / nr;
        if (score > bestScore) {
          bestScore = score;
          best = f;
          bestT = t;
        }
      }
    }
    if (best < 0) return node;

    const col = cols[best];
    let i = start,
      j = end - 1;
    while (i <= j) {
      if (col[idx[i]] <= bestT) i++;
      else {
        const tmp = idx[i];
        idx[i] = idx[j];
        idx[j] = tmp;
        j--;
      }
    }
    feat[node] = best;
    thr[node] = bestT;
    left[node] = grow(start, i, depth + 1);
    right[node] = grow(i, end, depth + 1);
    return node;
  }
  grow(0, idx.length, 0);
  return {
    feat: Int16Array.from(feat),
    thr: Uint8Array.from(thr),
    left: Int32Array.from(left),
    right: Int32Array.from(right),
    dist,
    size: Int32Array.from(size),
  };
}

/** Distribuzione della foglia in cui cade la famiglia `x` (vettore delle 13 proprietà). */
export function treeLeaf(tree, x) {
  let n = 0;
  while (tree.feat[n] >= 0)
    n = x[tree.feat[n]] <= tree.thr[n] ? tree.left[n] : tree.right[n];
  return tree.dist[n];
}

export function treeDepth(tree, n = 0) {
  return tree.feat[n] < 0
    ? 0
    : 1 +
        Math.max(treeDepth(tree, tree.left[n]), treeDepth(tree, tree.right[n]));
}
export const treeLeaves = (tree) =>
  tree.feat.reduce((s, f) => s + (f < 0 ? 1 : 0), 0);

/**
 * Random Forest: ogni albero vede un campione bootstrap delle famiglie (estratte con reimmissione)
 * e a ogni domanda solo `mtry` proprietà sorteggiate. `inbag[t]` segna le famiglie viste dall'albero t:
 * le altre («fuori dal sacco») servono a stimare l'errore senza toccare i dati di verifica.
 */
export function fitForest(
  cols,
  y,
  train,
  { trees = 100, minLeaf = 5, mtry, random, K = 8, onTree } = {},
) {
  const m = mtry || Math.max(1, Math.floor(Math.sqrt(cols.length)));
  const out = [],
    inbag = [];
  for (let t = 0; t < trees; t++) {
    const boot = new Int32Array(train.length),
      seen = new Set();
    for (let i = 0; i < boot.length; i++) {
      boot[i] = train[Math.floor(random() * train.length)];
      seen.add(boot[i]);
    }
    out.push(buildTree(cols, y, boot, { K, minLeaf, mtry: m, random }));
    inbag.push(seen);
    if (onTree) onTree(t + 1);
  }
  out.inbag = inbag;
  return out;
}

/** Previsione «fuori dal sacco» per la riga r: media dei soli alberi che non l'hanno vista. */
export function oobPredict(forest, x, r, K) {
  const p = new Float64Array(K);
  let n = 0;
  forest.forEach((tree, t) => {
    if (forest.inbag[t].has(r)) return;
    const d = treeLeaf(tree, x);
    for (let k = 0; k < K; k++) p[k] += d[k];
    n++;
  });
  if (!n) return null;
  for (let k = 0; k < K; k++) p[k] /= n;
  return p;
}

export function forestPredict(forest, x, count = forest.length, K = 8) {
  const p = new Float64Array(K);
  for (let t = 0; t < count; t++) {
    const d = treeLeaf(forest[t], x);
    for (let k = 0; k < K; k++) p[k] += d[k];
  }
  for (let k = 0; k < K; k++) p[k] /= count;
  return p;
}

/** Tabella di conteggio: per ogni famiglia identica già vista, la frequenza dei figli. Se mai vista, la media generale. */
export function fitTable(cols, y, train, K = 8) {
  const map = new Map(),
    global = new Float64Array(K);
  const keyOf = (r) => cols.map((c) => c[r]).join(",");
  for (const r of train) {
    const key = keyOf(r);
    if (!map.has(key)) map.set(key, new Float64Array(K));
    map.get(key)[y[r]]++;
    global[y[r]]++;
  }
  const norm = (a) => {
    const s = a.reduce((x, v) => x + v, 0);
    return Float64Array.from(a, (v) => v / s);
  };
  const table = new Map([...map].map(([k, v]) => [k, norm(v)])),
    fallback = norm(global);
  return {
    size: map.size,
    has: (x) => table.has(x.join(",")),
    predict: (x) => table.get(x.join(",")) || fallback,
  };
}

/**
 * Metriche sul 20% di prova. `P`, `E`: matrici n×K (modello, Mendel esatto); `y`: figlio realmente nato.
 * scarto = probabilità messa nel posto sbagliato rispetto a Mendel (0 = identico, 1 = tutto diverso);
 * sorpresa = log-loss (con un minimo di 0,001 per non esplodere); indovinato = gruppo più probabile = figlio nato.
 */
export function metrics(P, y, E, K = 8) {
  const n = y.length;
  let scarto = 0,
    sorpresa = 0,
    hit = 0;
  for (let r = 0; r < n; r++) {
    let tv = 0,
      arg = 0;
    for (let k = 0; k < K; k++) {
      tv += Math.abs(P[r * K + k] - E[r * K + k]);
      if (P[r * K + k] > P[r * K + arg]) arg = k;
    }
    scarto += tv / 2;
    sorpresa += -Math.log(Math.max(P[r * K + y[r]], 1e-3));
    if (arg === y[r]) hit++;
  }
  return { scarto: scarto / n, sorpresa: sorpresa / n, indovinato: hit / n };
}
