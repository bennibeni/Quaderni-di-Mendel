// Il quaderno di Mendel, in tre fasi.
// Fase 1: Mendel conosce il secondo figlio solo nel 20% delle famiglie; addestra la foresta e propone leggi.
// Fase 2: nascono i secondi figli del restante 80%; si verificano previsioni e leggi sui dati completi.
// Fase 3: la verità degli alleli, che Mendel non conosceva, giudica tutto.
import { SCENARIOS } from './scenarios.js';
import { prepare, featuresOf, Y } from './genetics.js';
import { buildTree, fitForest, fitTable, forestPredict, metrics, oobPredict, rng, shuffle, treeLeaf } from './forest.js';
import { bestRatio, candidates, chiSquare, fisher, sameRatio } from './stats.js';
import { int } from './format.js';

export const OPTIONS = { families: [1000, 2500, 5000, 10000] };
export const DEFAULTS = { scenario: 'piselli', families: 2500, seed: 1 };
export const KNOWN_SHARE = 0.2;
export const FOREST = { trees: 100, minLeaf: 5, mtry: 3 };
export const TREE = { minLeaf: 5 };
export const LAW = { minSupport: 5, threshold: 0.05, stat: 'mean' };
export const RATIO = { minFamilies: 10 };
export const INDEPENDENCE = { margin: 0.01, minLeaf: 20 };
export const LINKAGE = { alpha: 0.05 };

export function validate(input) {
  const c = { ...DEFAULTS, ...input };
  if (!SCENARIOS[c.scenario]) throw new Error('Scenario sconosciuto.');
  const families = Number(c.families), seed = Math.floor(Number(c.seed));
  if (!OPTIONS.families.includes(families)) throw new Error('Numero di famiglie non valido.');
  if (!Number.isFinite(seed) || seed < 1) throw new Error('Il seme deve essere un intero positivo.');
  return { scenario: c.scenario, families, seed };
}

const sorpresa = (p, y) => -Math.log(Math.max(p[y], 1e-3));
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
/** 0,75/0,25 → [3, 1]; 2/3, 1/3 → [2, 1]. null se le proporzioni non sono frazioni semplici (miscele di incroci). */
function toRatio(dist) {
  for (let d = 1; d <= 64; d++) {
    const n = dist.map(v => v * d);
    if (n.every(v => Math.abs(v - Math.round(v)) < 1e-6)) {
      const r = n.map(Math.round), g = r.reduce((a, b) => gcd(a, b), 0) || 1;
      return r.map(v => v / g);
    }
  }
  return null;
}

export function run(input, progress = () => {}) {
  const cfg = validate(input), S = SCENARIOS[cfg.scenario], P = prepare(S), K = P.K, random = rng(cfg.seed);
  const t0 = Date.now();
  const names = S.phenotypes;
  // Coppie di genitori: non ordinate (A × B = B × A) oppure ordinate madre × padre, quando i due sessi
  // trasmettono in modo diverso (geni legati all'X, ricombinazione solo nelle femmine).
  const pairKey = (m, f) => (P.ordered || m <= f ? `${m}-${f}` : `${f}-${m}`);
  const PAIRS = [];
  if (P.ordered) { for (const m of P.motherPhenos) for (const f of P.fatherPhenos) PAIRS.push({ m, f, key: `${m}-${f}`, label: `${names[m]} × ${names[f]}` }); }
  else for (let m = 0; m < K; m++) for (let f = m; f < K; f++) PAIRS.push({ m, f, key: `${m}-${f}`, label: `${names[m]} × ${names[f]}` });

  progress(`Si formano ${int(cfg.families)} ${S.words.famiglie}…`);
  const fams = Array.from({ length: cfg.families }, () => P.family(random));
  const X = fams.map(x => featuresOf(S, x.m, x.f, x.sibs));
  const F = X[0].length;
  const cols = Array.from({ length: F }, (_, j) => Uint8Array.from(X, x => x[j]));
  const y = Uint8Array.from(fams, x => x.c2);
  const nKnown = Math.round(cfg.families * KNOWN_SHARE);
  const known = [...Array(nKnown).keys()], rest = Array.from({ length: cfg.families - nKnown }, (_, i) => nKnown + i);

  // ------------------------------------------------------------------ FASE 1
  progress('Fase 1 · il registro di Mendel…');
  const registry = Object.fromEntries(PAIRS.map(p => [p.key, { ...p, families: 0, children: new Array(K).fill(0) }]));
  const fill = (reg, rows) => rows.forEach(r => { const x = fams[r], e = reg[pairKey(x.m, x.f)]; e.families++; x.sibs.forEach(z => e.children[z]++); e.children[x.c2]++; });
  fill(registry, known);

  progress('Fase 1 · la foresta impara dal 20%…');
  const table = fitTable(cols, y, known, K);
  const tree = buildTree(cols, y, known, { K, minLeaf: TREE.minLeaf, random });
  const forest = fitForest(cols, y, known, { K, trees: FOREST.trees, minLeaf: FOREST.minLeaf, mtry: FOREST.mtry, random, onTree: t => { if (t % 25 === 0) progress(`Fase 1 · la foresta impara dal 20%: albero ${t} di ${FOREST.trees}…`); } });
  const fp = x => forestPredict(forest, x, forest.length, K);

  // Mappa della foresta: per ogni coppia di genitori, la previsione media sui primi figli osservati.
  const forestMap = PAIRS.map(p => {
    const rows = known.filter(r => pairKey(fams[r].m, fams[r].f) === p.key);
    const inputs = rows.length ? rows.map(r => X[r]) : names.map((_, c) => featuresOf(S, p.m, p.f, Array(P.L).fill(c)));
    const avg = new Array(K).fill(0);
    inputs.forEach(x => fp(x).forEach((v, k) => (avg[k] += v / inputs.length)));
    return { key: p.key, m: p.m, f: p.f, label: p.label, seen: rows.length, pred: avg };
  });

  // Importanza delle 6 osservazioni, misurata solo sul 20% con le previsioni «fuori dal sacco».
  const obsLabels = P.L === 1
    ? [S.words.madre, S.words.padre, S.words.primo].flatMap(w => S.obs.map(o => `${o.label} · ${w}`))
    : [...[S.words.madre, S.words.padre].flatMap(w => S.obs.map(o => `${o.label} · ${w}`)), ...names.map(n => `${n}: quanti tra i ${S.words.primo}`)];
  const oobScore = xs => {
    let s = 0, n = 0;
    known.forEach((r, i) => { const p = oobPredict(forest, xs[i], r, K); if (p) { s += sorpresa(p, y[r]); n++; } });
    return s / n;
  };
  const baseX = known.map(r => X[r]);
  const oobBase = oobScore(baseX);
  const importance = obsLabels.map((label, j) => {
    const perm = shuffle(known.map(r => X[r][j]), random);
    return { label, delta: oobScore(baseX.map((x, i) => { const z = [...x]; z[j] = perm[i]; return z; })) - oobBase };
  }).sort((a, b) => b.delta - a.delta);

  // Leggi candidate: verdetto della fase 1.
  const lawEvidence = (rows, law) => {
    const hit = rows.filter(r => law.prem(fams[r].m, fams[r].f));
    const kids = r => [...fams[r].sibs, fams[r].c2];
    const viol = hit.filter(r => kids(r).some(z => law.forb(z)));
    return { support: hit.length, violations: viol.length, example: viol.length ? { m: fams[viol[0]].m, f: fams[viol[0]].f, child: kids(viol[0]).find(z => law.forb(z)) } : null, hit };
  };

  progress('Fase 1 · Mendel formula le sue leggi…');
  const laws = S.laws.map(law => {
    const ev = lawEvidence(known, law);
    const inputs = [...new Set(ev.hit.map(r => X[r].join('')))].map(s => [...s].map(Number));
    const forb = x => fp(x).reduce((s, v, z) => s + (law.forb(z) ? v : 0), 0);
    const forestMax = LAW.stat === 'max' ? inputs.reduce((mx, x) => Math.max(mx, forb(x)), 0) : ev.hit.reduce((s, r) => s + forb(X[r]), 0) / (ev.hit.length || 1);
    let phase1;
    if (ev.violations) phase1 = 'respinta';
    else if (ev.support < LAW.minSupport) phase1 = 'indecisa';
    else if (forestMax < LAW.threshold) phase1 = 'proposta';
    else phase1 = 'dubbia';
    return { id: law.id, text: law.text, why: law.why, p1: { support: ev.support, violations: ev.violations, example: ev.example, forestMax, verdict: phase1 } };
  });

  // Rapporti: conteggi del 20%, previsione della foresta, rapporto semplice proposto.
  const classOf = (ratio, z) => ratio.classes.findIndex(c => c.includes(z));
  const ratioEvidence = (rows, ratio, occam = false) => {
    const hit = rows.filter(r => ratio.cond(fams[r].m, fams[r].f, fams[r].c1, fams[r].sibs));
    const counts = new Array(ratio.classes.length).fill(0); let outside = 0;
    hit.forEach(r => { const k = classOf(ratio, fams[r].c2); if (k < 0) outside++; else counts[k]++; });
    const out = { families: hit.length, counts, outside };
    if (hit.length >= RATIO.minFamilies) {
      const b = bestRatio(counts);
      // Mendel propone un rapporto solo se è l'unico plausibile; altrimenti aspetta altri dati.
      // Fase 1: si propone solo un rapporto che sia l'unico plausibile. Fase 2 (occam): si propone anche
      // il più compatibile se è il più semplice tra i plausibili (somma dei termini minore).
      const size = r => r.split(':').reduce((s, v) => s + Number(v), 0);
      const bestKey = b.best.ratio.join(':');
      const simplest = b.plausible.length === 1 || (occam && b.plausible.includes(bestKey) && b.plausible.every(q => q === bestKey || size(q) > size(bestKey)));
      // Regola del chi quadro: ogni classe deve aspettarsi almeno 5 casi, altrimenti il test non è affidabile.
      const tot = b.best.ratio.reduce((x, v) => x + v, 0), valid = Math.min(...b.best.ratio.filter(v => v > 0)) * hit.length / tot >= 5;
      Object.assign(out, b, { proposal: simplest && valid ? b.best.ratio : null, status: simplest && !valid ? 'pochi per il test' : simplest ? 'proposto' : b.plausible.length ? 'ambiguo' : 'nessuno semplice' });
    } else out.status = 'pochi dati';
    return { ...out, hit };
  };
  const ratios = S.ratios.map(ratio => {
    const ev = ratioEvidence(known, ratio);
    const forestDist = new Array(ratio.classes.length).fill(0);
    ev.hit.forEach(r => { const p = fp(X[r]); ratio.classes.forEach((c, k) => { forestDist[k] += c.reduce((s, z) => s + p[z], 0) / ev.hit.length; }); });
    const { hit: _hit, ...rest } = ev;
    return { id: ratio.id, text: ratio.text, why: ratio.why, classNames: ratio.names || ratio.classes.map(c => names[c[0]]), p1: { ...rest, forest: ev.families ? forestDist : null } };
  });

  // Indipendenza: prevedere un carattere del secondo figlio serve anche l'altro carattere?
  progress('Fase 1 · i due caratteri sono indipendenti?');
  const LITTERS = P.litters();
  const independence = S.traits.map(trait => {
    const yt = Uint8Array.from(fams, x => Number(S.bits(x.c2)[trait.bit]));
    // Osservazioni «proprie» del carattere: di solito una, due se lo stesso gene si legge in due risposte
    // (rosso e nero nei gatti, diluito e doppio diluito nei cavalli).
    const ownBits = trait.own || [trait.bit];
    // Proprie: le osservazioni del carattere per madre e padre e, per i fratelli, quanti le mostrano.
    const ownOf = (m, f, sibs) => [...ownBits.map(b => Number(S.bits(m)[b])), ...ownBits.map(b => Number(S.bits(f)[b])), ...ownBits.map(b => sibs.filter(z => S.bits(z)[b]).length)];
    const ownX = fams.map(x => ownOf(x.m, x.f, x.sibs));
    const colsOwn = ownX[0].map((_, j) => Uint8Array.from(ownX, x => x[j]));
    const fFull = fitForest(cols, yt, known, { K: 2, trees: FOREST.trees, minLeaf: INDEPENDENCE.minLeaf, mtry: F, random });
    const fOwn = fitForest(colsOwn, yt, known, { K: 2, trees: FOREST.trees, minLeaf: INDEPENDENCE.minLeaf, mtry: colsOwn.length, random });
    const oob = (f, rows) => { let s = 0, n = 0; known.forEach(r => { const p = oobPredict(f, rows[r], r, 2); if (p) { s += sorpresa(p, yt[r]); n++; } }); return s / n; };
    const test = (f, rows) => rest.reduce((s, r) => s + sorpresa(forestPredict(f, rows[r], f.length, 2), yt[r]), 0) / rest.length;
    const full1 = oob(fFull, X), own1 = oob(fOwn, ownX);
    const full2 = test(fFull, X), own2 = test(fOwn, ownX);
    // Verità: la probabilità esatta del carattere cambia a parità delle sole osservazioni di quel carattere?
    const groups = new Map();
    for (let m = 0; m < K; m++) for (let f = 0; f < K; f++) for (const lt of LITTERS) {
      const p = P.exact(m, f, lt.sibs); if (!p) continue;
      const v = p.reduce((s, q, z) => s + (S.bits(z)[trait.bit] ? q : 0), 0);
      let w = 0;
      P.GM.forEach((a, i) => { if (a.ph !== m) return; P.GF.forEach((b, j) => { if (b.ph === f) w += a.p * b.p * P.litterP(i, j, lt); }); });
      const key = ownOf(m, f, lt.sibs).join('|');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ v, w });
    }
    const spread = Math.max(...[...groups.values()].map(a => Math.max(...a.map(x => x.v)) - Math.min(...a.map(x => x.v))));
    // Guadagno esatto (in «sorpresa» risparmiata) nel conoscere anche l'altro carattere: media pesata della
    // divergenza tra la probabilità vera e quella che si avrebbe guardando solo il proprio carattere.
    let gain = 0;
    for (const a of groups.values()) {
      const wt = a.reduce((s, x) => s + x.w, 0), o = Math.min(1 - 1e-12, Math.max(1e-12, a.reduce((s, x) => s + x.w * x.v, 0) / wt));
      for (const { v, w } of a) {
        const kl = (v > 1e-12 ? v * Math.log(v / o) : 0) + (v < 1 - 1e-12 ? (1 - v) * Math.log((1 - v) / (1 - o)) : 0);
        gain += w * kl;
      }
    }
    return {
      name: trait.name, label: trait.label,
      p1: { full: full1, own: own1, verdict: own1 - full1 > INDEPENDENCE.margin ? 'aiuta' : 'non aiuta' },
      p2: { full: full2, own: own2, verdict: own2 - full2 > INDEPENDENCE.margin ? 'aiuta' : 'non aiuta' },
      truth: { verdict: spread < 1e-9 ? 'indipendente' : 'dipendente', spread, gain },
    };
  });

  // Prova mirata della terza legge (solo negli scenari che la prevedono): nelle famiglie in cui un genitore è
  // quasi certamente eterozigote per entrambi i geni, i due caratteri dei secondi figli sono indipendenti?
  const L2 = S.linkage;
  const linkTable = rows => {
    const t = [[0, 0], [0, 0]];
    rows.forEach(r => { const x = fams[r]; if (!L2.cond(x.m, x.f, x.c1, x.sibs)) return; const bb = S.bits(x.c2); t[bb[L2.a] ? 0 : 1][bb[L2.b] ? 0 : 1]++; });
    const n = t[0][0] + t[0][1] + t[1][0] + t[1][1];
    const p = fisher(t);
    return { table: t, families: n, p, verdict: n < 4 ? 'pochi dati' : p < LINKAGE.alpha ? 'dipendenti' : 'nessuna prova' };
  };
  const linkage = L2 ? { p1: linkTable(known) } : null;

  // ------------------------------------------------------------------ FASE 2
  progress('Fase 2 · nascono i secondi figli dell’80%…');
  const yRest = Uint8Array.from(rest, r => y[r]);
  const E = new Float64Array(rest.length * K);
  const cacheE = new Map();
  rest.forEach((r, i) => { const x = fams[r], key = `${x.m}|${x.f}|${[...x.sibs].sort().join(',')}`; if (!cacheE.has(key)) cacheE.set(key, P.exact(x.m, x.f, x.sibs)); E.set(cacheE.get(key), i * K); });
  const predictAll = fn => { const out = new Float64Array(rest.length * K); rest.forEach((r, i) => out.set(fn(X[r]), i * K)); return out; };
  const contest = [
    { key: 'tabella', label: 'Tabella di conteggio', m: metrics(predictAll(x => table.predict(x)), yRest, E, K) },
    { key: 'albero', label: 'Albero singolo', m: metrics(predictAll(x => treeLeaf(tree, x)), yRest, E, K) },
    { key: 'foresta', label: `Random Forest (${FOREST.trees} alberi)`, m: metrics(predictAll(fp), yRest, E, K) },
  ];
  const mendelExact = metrics(E, yRest, E, K);

  const all = [...known, ...rest];
  const registryAll = Object.fromEntries(PAIRS.map(p => [p.key, { ...p, families: 0, children: new Array(K).fill(0) }]));
  fill(registryAll, all);

  // ------------------------------------------------------------------ FASE 3 (verità) e confronto
  progress('Verifica delle leggi con i dati completi e con gli alleli…');
  const GM = P.GM, GF = P.GF;
  laws.forEach((l, idx) => {
    const law = S.laws[idx];
    const ev = lawEvidence(all, law);
    l.p2 = { support: ev.support, violations: ev.violations, example: ev.example, verdict: ev.violations ? 'falsa' : ev.support >= LAW.minSupport ? 'confermata' : 'indecisa' };
    // Verità: esiste una coppia di genotipi che rispetta la premessa e può avere un figlio vietato?
    let counter = null;
    GM.forEach((a, i) => GF.forEach((b, j) => {
      if (!law.prem(a.ph, b.ph)) return;
      P.T[i][j].forEach((q, z) => { if (q > 0 && law.forb(z)) { const w = a.p * b.p * q; if (!counter || w > counter.w) counter = { w, m: a.name, f: b.name, child: names[z], q }; } });
    }));
    l.truth = { verdict: counter ? 'falsa' : 'vera', counter: counter && { m: counter.m, f: counter.f, child: counter.child, q: counter.q } };
    const said = l.p1.verdict === 'proposta' ? 'vera' : l.p1.verdict === 'respinta' ? 'falsa' : null;
    const late = l.p2.verdict === 'confermata' ? 'vera' : l.p2.verdict === 'falsa' ? 'falsa' : null;
    l.outcome = said === null ? (late === null ? 'ancora aperta' : late === l.truth.verdict ? 'decisa con i dati completi' : 'sbagliata') : said === l.truth.verdict ? 'giusta' : 'sbagliata';
  });

  ratios.forEach((r, idx) => {
    const ratio = S.ratios[idx];
    const ev = ratioEvidence(all, ratio, true);
    const { hit: _hit, ...rest2 } = ev;
    r.p2 = rest2;
    // Verità: distribuzione esatta delle classi sotto la condizione (media pesata sulle famiglie possibili).
    const dist = new Array(ratio.classes.length).fill(0); let cross = null;
    const LT = P.litters();
    GM.forEach((a, i) => GF.forEach((b, j) => {
      for (const lt of LT) {
        if (!ratio.cond(a.ph, b.ph, lt.sibs[0], lt.sibs)) continue;
        const w = a.p * b.p * P.litterP(i, j, lt); if (!w) continue;
        ratio.classes.forEach((cl, k) => { dist[k] += w * cl.reduce((s, z) => s + P.T[i][j][z], 0); });
        if (!cross || w > cross.w) cross = { w, i, j };
      }
    }));
    // Si normalizza sulle sole classi contate (per esempio i cuccioli scuri, esclusi i gialli).
    const inClasses = dist.reduce((s, v) => s + v, 0);
    const exactDist = dist.map(v => v / inClasses);
    // Un rapporto vero è «semplice» se è tra quelli che Mendel sa riconoscere; altrimenti (geni associati,
    // miscele di incroci diversi) la risposta giusta è proprio «nessun rapporto semplice».
    const simple = candidates(ratio.classes.length).some(c => sameRatio(c, exactDist));
    r.truth = { dist: exactDist, ratio: toRatio(exactDist), simple, cross: cross && { m: GM[cross.i].name, f: GF[cross.j].name } };
    r.truth.punnett = punnett(S, P, GM[cross.i], GF[cross.j], ratio);
    const guess = r.p1.proposal;
    if (simple) {
      r.p2.right = r.p2.proposal ? sameRatio(r.p2.proposal, exactDist) : null;
      r.outcome = !guess ? (r.p2.proposal ? (r.p2.right ? 'decisa con i dati completi' : 'sbagliata') : 'ancora aperta') : sameRatio(guess, exactDist) ? 'giusta' : 'sbagliata';
    } else {
      const none = st => st === 'nessuno semplice';
      r.p2.right = r.p2.proposal ? false : none(r.p2.status) ? true : null;
      r.outcome = guess ? 'sbagliata' : none(r.p1.status) ? 'giusta' : r.p2.proposal ? 'sbagliata' : none(r.p2.status) ? 'decisa con i dati completi' : 'ancora aperta';
    }
    r.p2.okTruth = r.p2.families ? chiSquare(r.p2.counts, exactDist).p : null;
  });

  if (linkage) {
    linkage.p2 = linkTable([...known, ...rest]);
    // Verità: distribuzione esatta dei due caratteri del secondo figlio nelle famiglie della prova.
    const joint = [[0, 0], [0, 0]]; let tot = 0;
    const LT = P.litters();
    GM.forEach((a, i) => GF.forEach((b, j) => {
      for (const lt of LT) {
        if (!L2.cond(a.ph, b.ph, lt.sibs[0], lt.sibs)) continue;
        const w = a.p * b.p * P.litterP(i, j, lt); if (!w) continue;
        tot += w;
        P.T[i][j].forEach((q, z) => { const bb = S.bits(z); joint[bb[L2.a] ? 0 : 1][bb[L2.b] ? 0 : 1] += w * q; });
      }
    }));
    const J = joint.map(row => row.map(v => v / tot));
    const ra = J[0][0] + J[0][1], cb = J[0][0] + J[1][0];
    const prod = [[ra * cb, ra * (1 - cb)], [(1 - ra) * cb, (1 - ra) * (1 - cb)]];
    const gap = Math.max(...J.flatMap((row, x) => row.map((v, y) => Math.abs(v - prod[x][y]))));
    linkage.truth = { joint: J, product: prod, verdict: gap > 1e-9 ? 'dipendenti' : 'indipendenti' };
    const said = v => (v === 'dipendenti' ? 'dipendenti' : null);
    linkage.outcome = said(linkage.p1.verdict) === linkage.truth.verdict ? 'giusta' : said(linkage.p2.verdict) === linkage.truth.verdict ? 'decisa con i dati completi' : 'ancora aperta';
  }

  const summary = {
    lawsRight: laws.filter(l => l.outcome === 'giusta').length,
    lawsWrong: laws.filter(l => l.outcome === 'sbagliata').length,
    lawsAdded: laws.filter(l => l.outcome === 'decisa con i dati completi').length,
    lawsOpen: laws.filter(l => l.outcome === 'ancora aperta').length,
    ratiosRight: ratios.filter(r => r.outcome === 'giusta').length,
    ratiosWrong: ratios.filter(r => r.outcome === 'sbagliata').length,
    ratiosAdded: ratios.filter(r => r.outcome === 'decisa con i dati completi').length,
    ratiosOpen: ratios.filter(r => r.outcome === 'ancora aperta').length,
  };

  return {
    config: cfg, seconds: (Date.now() - t0) / 1000,
    counts: { total: cfg.families, known: nKnown, rest: rest.length },
    registry: Object.values(registry), registryAll: Object.values(registryAll),
    forestMap, importance, oobBase, laws, ratios, independence, linkage, features: F,
    contest, mendelExact, best: [...contest].sort((a, b) => a.m.scarto - b.m.scarto)[0].key,
    summary,
  };
}

/** Quadrato di Punnett per l'incrocio (madre a × padre b), limitato ai loci che contano per il rapporto.
 *  Ogni gamete ha la sua probabilità: uguali nei casi classici, diverse con i geni associati. */
function punnett(S, P, a, b, ratio) {
  // Per i rapporti su un solo carattere (classi che raggruppano fenotipi) si mostra solo quel gene.
  const loci = ratio.locus != null ? [ratio.locus] : S.loci.map((_, l) => l);
  const alName = (l, al) => (al === Y ? 'Y' : S.loci[l].alleles[al]);
  const gametes = (g, sex) => {
    let out = [{ al: [], p: 1 }];
    loci.forEach(l => {
      // Gameti con la stessa sequenza di alleli si sommano (AA dà un solo tipo di gamete).
      const merged = new Map();
      for (const [al, p] of P.gametesOf(l, g.g[l], sex)) merged.set(al, (merged.get(al) || 0) + p);
      out = out.flatMap(x => [...merged].map(([al, p]) => ({ al: [...x.al, al], p: x.p * p })));
    });
    return out.filter(x => x.p > 0);
  };
  const ga = gametes(a, 'F'), gb = gametes(b, 'M');
  const cells = ga.map(x => gb.map(z => {
    const idx = loci.map((l, i) => [x.al[i], z.al[i]].sort((u, v) => u - v));
    // Fenotipo: per i loci non mostrati si usa il genotipo della madre (irrilevante per il carattere).
    const full = S.loci.map((_, l) => { const i = loci.indexOf(l); return i >= 0 ? idx[i] : a.g[l]; });
    const ph = S.pheno(full);
    const ci = ph == null ? -1 : ratio.classes.findIndex(c => c.includes(ph));
    const label = ph == null ? 'non nasce' : ratio.names && ci >= 0 ? ratio.names[ci] : S.phenotypes[ph];
    const sep = l => (S.loci[l].gametes ? '/' : S.loci[l].x ? ' ' : '');
    return { geno: idx.map((pair, i) => pair.map(al => alName(loci[i], al)).join(sep(loci[i]))).join(' '), label, dead: ph == null, p: x.p * z.p };
  }));
  const equal = ga.every(g => Math.abs(g.p - 1 / ga.length) < 1e-9) && gb.every(g => Math.abs(g.p - 1 / gb.length) < 1e-9);
  const gname = x => x.al.map((al, i) => alName(loci[i], al)).join(' ');
  const pick = (g) => loci.map(l => g.g[l].map(al => alName(l, al)).join(S.loci[l].gametes ? '/' : S.loci[l].x ? ' ' : '')).join(' ');
  return { rows: ga.map(gname), cols: gb.map(gname), rowP: ga.map(x => x.p), colP: gb.map(x => x.p), equal, cells, a: pick(a), b: pick(b), genes: loci.map(l => S.loci[l].name) };
}
