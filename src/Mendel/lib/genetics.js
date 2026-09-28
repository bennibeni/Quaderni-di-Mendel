// Motore genetico generico: dai loci dello scenario costruisce i genotipi possibili di madri e padri con le
// loro frequenze, la tabella di trasmissione genitori → figlio e la risposta esatta (Mendel + Bayes).
//
// Casi supportati, oltre ai geni autosomici indipendenti:
// - locus legato al cromosoma X (`x: true`): le femmine hanno due alleli, i maschi uno solo più la Y;
// - locus di aplotipi (`gametes`): due geni sullo stesso cromosoma, con gameti ricombinanti;
// - alleli letali: se `pheno` restituisce null il figlio non nasce, e si contano solo i nati.

/** Indice riservato alla Y nei loci legati all'X (sempre dopo gli alleli veri). */
export const Y = 99;

const half = pair => [[pair[0], 0.5], [pair[1], 0.5]];

/** Gameti di un genitore per un locus: coppie [allele, probabilità]. */
function gametesOf(L, pair, sex) {
  if (L.gametes) return L.gametes(pair, sex);
  if (L.x && sex === 'M') return [[pair[0], 0.5], [Y, 0.5]];
  return half(pair);
}

/** Genotipi di un locus per un sesso, con le frequenze di Hardy–Weinberg. */
function genotypesOf(L, sex) {
  const out = [];
  if (L.x && sex === 'M') {
    L.alleles.forEach((_, a) => out.push({ pair: [a, Y], p: L.freq[a] }));
    return out;
  }
  for (let a = 0; a < L.alleles.length; a++) for (let b = a; b < L.alleles.length; b++) {
    out.push({ pair: [a, b], p: L.freq[a] * L.freq[b] * (a === b ? 1 : 2) });
  }
  return out;
}

/** Nome leggibile di un genotipo: «Aa Bb», «Xᴼ Y», «BV/bv» per gli aplotipi. */
export function genoName(S, g) {
  return g.map((pair, l) => {
    const L = S.loci[l];
    const al = a => (a === Y ? 'Y' : L.alleles[a]);
    return pair.map(al).join(L.gametes ? '/' : L.x ? ' ' : '');
  }).join(' ');
}

/** Prepara lo scenario: genotipi di madri e padri, fenotipi, trasmissione. */
export function prepare(S) {
  const K = S.phenotypes.length;
  const build = sex => {
    let G = [{ g: [], p: 1 }];
    for (const L of S.loci) G = G.flatMap(x => genotypesOf(L, sex).map(y => ({ g: [...x.g, y.pair], p: x.p * y.p })));
    G.forEach(x => { x.ph = S.pheno(x.g); x.name = genoName(S, x.g); });
    // I genotipi letali non esistono tra gli adulti: si tolgono e si rinormalizza.
    G = G.filter(x => x.ph != null && x.p > 0);
    const tot = G.reduce((s, x) => s + x.p, 0);
    G.forEach(x => (x.p /= tot));
    return G;
  };
  const hasX = S.loci.some(L => L.x);
  const GM = build('F');
  const GF = hasX ? build('M') : GM;

  // T[i][j][k]: probabilità che madre di genotipo i e padre di genotipo j abbiano un figlio (nato vivo) di fenotipo k.
  const T = GM.map(m => GF.map(f => {
    let combos = [{ g: [], p: 1 }];
    S.loci.forEach((L, l) => {
      const gm = gametesOf(L, m.g[l], 'F'), gf = gametesOf(L, f.g[l], 'M');
      const pairs = [];
      for (const [x, px] of gm) for (const [y, py] of gf) pairs.push({ pair: x <= y ? [x, y] : [y, x], p: px * py });
      combos = combos.flatMap(c => pairs.map(q => ({ g: [...c.g, q.pair], p: c.p * q.p })));
    });
    const d = new Array(K).fill(0);
    let alive = 0;
    for (const c of combos) { const k = S.pheno(c.g); if (k == null) continue; d[k] += c.p; alive += c.p; }
    return d.map(v => v / alive);
  }));

  const phenoFreq = S.phenotypes.map((_, k) => GM.reduce((s, x) => s + (x.ph === k ? x.p : 0), 0));
  const motherPhenos = [...new Set(GM.map(x => x.ph))].sort((a, b) => a - b);
  const fatherPhenos = [...new Set(GF.map(x => x.ph))].sort((a, b) => a - b);
  const cum = a => { let s = 0; return a.map(v => (s += v)); };
  const pick = (c, random) => { const u = random() * c[c.length - 1]; let i = 0; while (i < c.length - 1 && u >= c[i]) i++; return i; };
  const cumM = cum(GM.map(x => x.p)), cumF = cum(GF.map(x => x.p));

  /** Distribuzione congiunta dei genotipi dei genitori (i, j) dati i fenotipi e i primi figli
   *  (un fenotipo solo, o un elenco quando si conoscono più fratelli). */
  function posterior(m, f, sibs) {
    const list = sibs == null ? [] : Array.isArray(sibs) ? sibs : [sibs];
    const w = []; let tot = 0;
    GM.forEach((a, i) => {
      if (a.ph !== m) return;
      GF.forEach((b, j) => {
        if (b.ph !== f) return;
        let v = a.p * b.p;
        for (const c of list) v *= T[i][j][c];
        if (v > 0) { w.push({ i, j, v }); tot += v; }
      });
    });
    w.forEach(x => (x.v /= tot || 1));
    return { w, tot };
  }

  /** Risposta esatta: probabilità del secondo figlio (Mendel + Bayes). null se la famiglia è impossibile. */
  function exact(m, f, sibs) {
    const { w, tot } = posterior(m, f, sibs);
    if (!tot) return null;
    const p = new Array(K).fill(0);
    for (const { i, j, v } of w) for (let k = 0; k < K; k++) p[k] += v * T[i][j][k];
    return p;
  }

  const L = S.litter || 1;
  /** Una famiglia: genotipi (nascosti), fenotipi dei genitori, i primi L figli e il figlio da prevedere. */
  function family(random) {
    const i = pick(cumM, random), j = pick(cumF, random), c = cum(T[i][j]);
    const sibs = Array.from({ length: L }, () => pick(c, random));
    return { i, j, m: GM[i].ph, f: GF[j].ph, c1: sibs[0], sibs, c2: pick(c, random) };
  }

  /** Tutte le cucciolate possibili di L figli, come conteggi per fenotipo, con il coefficiente multinomiale. */
  function litters() {
    const out = [], fact = n => (n < 2 ? 1 : n * fact(n - 1));
    const rec = (k, left, acc) => {
      if (k === K - 1) { const n = [...acc, left]; out.push({ counts: n, sibs: n.flatMap((v, z) => Array(v).fill(z)), coef: fact(L) / n.reduce((s, v) => s * fact(v), 1) }); return; }
      for (let v = left; v >= 0; v--) rec(k + 1, left - v, [...acc, v]);
    };
    rec(0, L, []);
    return out;
  }
  /** Probabilità di una cucciolata (in un ordine qualunque) per la coppia di genotipi i, j. */
  const litterP = (i, j, lt) => lt.counts.reduce((p, v, z) => p * T[i][j][z] ** v, lt.coef);

  return { S, G: GM, GM, GF, T, K, L, litters, litterP, NG: GM.length, phenoFreq, motherPhenos, fatherPhenos, ordered: !!S.ordered, posterior, exact, family, gametesOf: (l, pair, sex) => gametesOf(S.loci[l], pair, sex) };
}

/** Le proprietà che vede la foresta: le osservazioni sì/no di madre e padre e, per i fratelli già nati,
 *  le stesse osservazioni del primo figlio oppure, se sono più di uno, quanti ce ne sono di ciascun tipo. */
export function featuresOf(S, m, f, sibs) {
  const list = Array.isArray(sibs) ? sibs : [sibs];
  const parents = [...S.bits(m), ...S.bits(f)].map(Number);
  if ((S.litter || 1) === 1) return [...parents, ...S.bits(list[0]).map(Number)];
  const counts = S.phenotypes.map((_, k) => list.filter(z => z === k).length);
  return [...parents, ...counts];
}
