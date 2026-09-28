// Statistica minima per i rapporti: test del chi quadro e scelta del «rapporto semplice» più plausibile,
// come faceva Mendel quando riconosceva un 3:1 in 5.474 lisci e 1.850 rugosi.

function lnGamma(z) {
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/** Q(a, x): funzione gamma incompleta regolarizzata superiore. */
function gammaQ(a, x) {
  if (x <= 0) return 1;
  if (x < a + 1) {
    let sum = 1 / a, del = sum, ap = a;
    for (let n = 0; n < 200; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-12) break; }
    return 1 - sum * Math.exp(-x + a * Math.log(x) - lnGamma(a));
  }
  let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
  for (let i = 1; i < 200; i++) {
    const an = -i * (i - a); b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  return Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
}

/**
 * Chi quadro: quanto i conteggi osservati si discostano da quelli attesi con le proporzioni `ratio`.
 * p = probabilità di uno scostamento almeno così grande se il rapporto fosse vero (alta = compatibile).
 */
export function chiSquare(counts, ratio) {
  const n = counts.reduce((s, v) => s + v, 0), tot = ratio.reduce((s, v) => s + v, 0);
  let stat = 0;
  counts.forEach((o, k) => { const e = (n * ratio[k]) / tot; stat += e > 0 ? ((o - e) ** 2) / e : (o > 0 ? Infinity : 0); });
  const df = ratio.filter(v => v > 0).length - 1;
  return { stat, df, p: Number.isFinite(stat) ? (df > 0 ? gammaQ(df / 2, stat / 2) : 1) : 0 };
}

const BASE = { 2: [[1, 1], [3, 1]], 3: [[1, 2, 1], [2, 1, 1], [9, 3, 4]], 4: [[1, 1, 1, 1], [9, 3, 3, 1], [3, 3, 1, 1]] };
function permutations(a) {
  if (a.length <= 1) return [a];
  const out = [];
  a.forEach((v, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).forEach(p => out.push([v, ...p])));
  return out;
}
/** Tutti i rapporti semplici con k classi, in ogni ordine (3:1 e 1:3 sono diversi). */
export function candidates(k) {
  const seen = new Set(), out = [];
  for (const base of BASE[k] || []) for (const p of permutations(base)) { const key = p.join(':'); if (!seen.has(key)) { seen.add(key); out.push(p); } }
  return out;
}

/** Il rapporto semplice più compatibile con i conteggi, e quanti altri restano plausibili (p > 0,05). */
export function bestRatio(counts) {
  const scored = candidates(counts.length).map(r => ({ ratio: r, ...chiSquare(counts, r) })).sort((a, b) => b.p - a.p);
  return { best: scored[0], plausible: scored.filter(s => s.p > 0.05).map(s => s.ratio.join(':')) };
}

export const sameRatio = (a, b) => {
  const g = arr => { const s = arr.reduce((x, v) => x + v, 0); return arr.map(v => v / s); };
  const x = g(a), y = g(b);
  return x.every((v, i) => Math.abs(v - y[i]) < 1e-9);
};

const lnFact = n => lnGamma(n + 1);
/**
 * Test esatto di Fisher per una tabella 2×2 [[a, b], [c, d]]: stessa domanda del chi quadro di indipendenza
 * («le righe e le colonne sono indipendenti?»), ma calcolata esattamente, quindi valida anche con pochi casi.
 * p = probabilità, se fossero indipendenti, di una tabella con gli stessi totali e almeno così sbilanciata.
 */
export function fisher([[a, b], [c, d]]) {
  const r1 = a + b, r2 = c + d, c1 = a + c, n = r1 + r2;
  if (!r1 || !r2 || !c1 || c1 === n) return 1;
  const lp = x => lnFact(r1) + lnFact(r2) + lnFact(c1) + lnFact(n - c1) - lnFact(n) - lnFact(x) - lnFact(r1 - x) - lnFact(c1 - x) - lnFact(r2 - c1 + x);
  const obs = lp(a);
  let p = 0;
  for (let x = Math.max(0, c1 - r2); x <= Math.min(r1, c1); x++) { const v = lp(x); if (v <= obs + 1e-7) p += Math.exp(v); }
  return Math.min(1, p);
}
