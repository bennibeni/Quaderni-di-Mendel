import { compareError, bestModels } from "./lib/comparison.js";
import React from "react";
// Mendel · Il quaderno di Mendel: scoprire le leggi dell'ereditarietà con una Random Forest,
// su una parte dei dati, e verificarle poi sui dati completi e sulla verità degli alleli.
import { useEffect, useRef, useState } from "react";
import s from "./Mendel.module.css";
import { SCENARIOS, SCENARIO_LIST } from "./lib/scenarios.js";
import {
  DEFAULTS,
  FOREST,
  INDEPENDENCE,
  KNOWN_SHARE,
  LAW,
  LINKAGE,
  OPTIONS,
  RATIO,
  TREE,
} from "./lib/experiment.js";
import { dec, int, pct } from "./lib/format.js";
import Pheno, { PairLabel } from "./components/Pheno.jsx";
import Punnett from "./components/Punnett.jsx";
import ForestWalk from "./components/ForestWalk.jsx";

const VERDICT = {
  proposta: ["Proposta come legge", s.tagProposta],
  respinta: ["Respinta: c’è un controesempio", s.tagRespinta],
  dubbia: ["In dubbio", s.tagDubbia],
  indecisa: ["Troppo pochi casi", s.tagIndecisa],
  confermata: ["Confermata", s.tagConfermata],
  falsa: ["Falsa", s.tagFalsa],
  vera: ["Vera", s.tagVera],
};
const OUTCOME = {
  giusta: ["Giusta già con il 20%", s.outGiusta],
  sbagliata: ["Sbagliata", s.outSbagliata],
  "decisa con i dati completi": ["Decisa con i dati completi", s.outDecisa],
  "ancora aperta": ["Ancora aperta", s.outAperta],
};
const RSTATUS = {
  proposto: ["Rapporto proposto", s.tagProposto],
  ambiguo: ["Ambiguo: più rapporti plausibili", s.tagAmbiguo],
  "nessuno semplice": ["Nessun rapporto semplice", s.tagDubbia],
  "pochi dati": [`Meno di ${RATIO.minFamilies} famiglie`, s.tagPochi],
  "pochi per il test": ["Troppo pochi casi per questo rapporto", s.tagPochi],
};
const agree = (W, f, m) => (W.g === "f" ? f : m);
/** «a, b e c» */
const listIt = (a) =>
  a.length < 2
    ? a.join("")
    : `${a.slice(0, -1).join(", ")} e ${a[a.length - 1]}`;
const NUM = { 2: "due", 3: "tre", 4: "quattro", 6: "sei", 9: "nove" };
const num = (n) => NUM[n] || String(n);
/** Il primo figlio o, nelle cucciolate, i primi figli già nati: articoli e verbi concordati. */
const kin = (S) => {
  const L = S.litter || 1,
    W = S.words;
  return L === 1
    ? { un: `un ${W.primo}`, il: `il ${W.primo}`, verbo: "rivela", many: false }
    : {
        un: `${num(L)} ${W.figli} già nati`,
        il: `i ${W.primo}`,
        verbo: "rivelano",
        many: true,
      };
};
const Tag = ({ map, k }) => {
  const [t, c] = map[k] || [k, ""];
  return <span className={`${s.tag} ${c}`}>{t}</span>;
};

function startWorker() {
  try {
    return new Worker(new URL("./lib/worker.js", import.meta.url), {
      type: "module",
    });
  } catch {
    return null;
  }
}

function Bar({ value, color = "#284f43" }) {
  return (
    <span className={s.probTrack}>
      <span
        className={s.probBar}
        style={{
          width: pct(Math.max(0, Math.min(1, value))),
          background: color,
        }}
      />
    </span>
  );
}

// ------------------------------------------------------------------ sezioni della fase 1
function Registry({ S, rows, title }) {
  const K = S.phenotypes.length;
  return (
    <div
      className={s.tableWrap}
      tabIndex={0}
      role="region"
      aria-label="Tabella dati scorrevole"
    >
      <table className={s.table}>
        <thead>
          <tr>
            <th>
              {S.ordered
                ? `${S.words.madre} × ${S.words.padre}`
                : S.words.genitori}
            </th>
            <th>{S.words.famiglie}</th>
            {S.phenotypes.map((_, k) => (
              <th key={k}>
                <Pheno S={S} k={k} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>
                <PairLabel S={S} m={r.m} f={r.f} />
              </td>
              <td>
                {r.families ? (
                  int(r.families)
                ) : (
                  <span className={s.muted}>mai osservata</span>
                )}
              </td>
              {Array.from({ length: K }, (_, k) => (
                <td key={k} className={r.children[k] ? undefined : s.muted}>
                  {int(r.children[k])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className={s.note}>{title}</p>
    </div>
  );
}

function ForestMap({ S, rows }) {
  return (
    <div
      className={s.tableWrap}
      tabIndex={0}
      role="region"
      aria-label="Tabella dati scorrevole"
    >
      <table className={s.table}>
        <thead>
          <tr>
            <th>
              {S.ordered
                ? `${S.words.madre} × ${S.words.padre}`
                : S.words.genitori}
            </th>
            <th>
              {S.words.famiglie} {agree(S.words, "viste", "visti")}
            </th>
            {S.phenotypes.map((_, k) => (
              <th key={k}>
                <Pheno S={S} k={k} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>
                <PairLabel S={S} m={r.m} f={r.f} />
              </td>
              <td>
                {r.seen ? (
                  int(r.seen)
                ) : (
                  <span className={s.muted}>
                    {agree(S.words, "nessuna", "nessuno")}: ipotesi
                  </span>
                )}
              </td>
              {r.pred.map((v, k) => (
                <td key={k} className={v < 0.005 ? s.muted : undefined}>
                  {pct(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RatioCard({ S, r, phase }) {
  const d = phase === 1 ? r.p1 : r.p2;
  const n = d.counts.reduce((a, b) => a + b, 0);
  return (
    <div className={s.ratioCard}>
      <h3>{r.text}</h3>
      <p className={s.note} style={{ margin: "0 0 6px" }}>
        {int(d.families)} {S.words.famiglie}; {S.words.secondo}:
      </p>
      {r.classNames.map((name, k) => (
        <div key={k} className={s.ratioRow}>
          <span>{name}</span>
          <Bar value={n ? d.counts[k] / n : 0} />
          <span className={s.probValue}>
            {int(d.counts[k])} · {n ? pct(d.counts[k] / n) : "—"}
          </span>
        </div>
      ))}
      {d.outside > 0 && (
        <p className={s.note}>
          Altri {d.outside} {S.words.figli} di tipo diverso non entrano nel
          conteggio.
        </p>
      )}
      {phase === 1 && d.forest && (
        <p className={s.note} style={{ margin: "6px 0" }}>
          La foresta prevede:{" "}
          {r.classNames
            .map((name, k) => `${name} ${pct(d.forest[k])}`)
            .join(", ")}
          .
        </p>
      )}
      <p style={{ margin: "6px 0 0" }}>
        {d.status === "pochi dati" ? (
          <span className={`${s.tag} ${s.tagPochi}`}>
            Meno di {RATIO.minFamilies} {S.words.famiglie}
          </span>
        ) : (
          <Tag map={RSTATUS} k={d.status} />
        )}{" "}
        {d.proposal && (
          <strong className={s.big}>{d.proposal.join(" : ")}</strong>
        )}
      </p>
      {d.best && (
        <p className={s.note} style={{ margin: "4px 0 0" }}>
          Più compatibile: {d.best.ratio.join(":")} (p = {dec(d.best.p, 2)}).
          {d.plausible.length > 1
            ? ` Plausibili anche: ${d.plausible.filter((x) => x !== d.best.ratio.join(":")).join(", ")}.`
            : ""}
          {!d.plausible.length
            ? " Nessun rapporto semplice supera p = 0,05."
            : ""}
        </p>
      )}
    </div>
  );
}

function Linkage({ S, L, phase }) {
  const d = phase === 1 ? L.p1 : L.p2,
    W = S.words,
    T = S.linkage;
  const tag =
    d.verdict === "dipendenti"
      ? [`Dipendenti (p = ${dec(d.p, d.p < 0.001 ? 4 : 3)})`, s.tagRespinta]
      : d.verdict === "pochi dati"
        ? ["Troppo pochi casi", s.tagIndecisa]
        : [`Nessuna prova di dipendenza (p = ${dec(d.p, 2)})`, s.tagProposta];
  return (
    <div className={s.explain}>
      <p>
        <strong>
          {phase === 1
            ? "Una prova mirata: la tabella 2 × 2."
            : "La prova mirata con tutti i dati."}
        </strong>
        {phase === 1 &&
          ` Mendel sceglie le ${W.famiglie} in cui un genitore dovrebbe essere eterozigote per entrambi i geni (${T.label}) e divide i ${W.secondi} in una tabella: righe per un carattere, colonne per l’altro. Se i caratteri sono indipendenti, le proporzioni delle colonne sono le stesse in ogni riga.`}
      </p>
      <div
        className={s.tableWrap}
        tabIndex={0}
        role="region"
        aria-label="Tabella dati scorrevole"
      >
        <table className={s.table} style={{ width: "auto" }}>
          <thead>
            <tr>
              <th>{W.secondi}</th>
              {T.cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {T.rows.map((rw, x) => (
              <tr key={rw}>
                <td>{rw}</td>
                {d.table[x].map((v, y) => (
                  <td key={y}>{int(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ margin: "6px 0 0" }}>
        {int(d.families)} {W.famiglie}.{" "}
        <span className={`${s.tag} ${tag[1]}`}>{tag[0]}</span>
      </p>
      {phase === 1 && (
        <p className={s.note}>
          Il numero p viene dal test esatto di Fisher: fa la stessa domanda del
          chi quadro di indipendenza, ma è esatto e vale anche con{" "}
          {agree(W, "poche", "pochi")} {W.famiglie}. Sotto{" "}
          {dec(LINKAGE.alpha, 2)} Mendel conclude che i caratteri viaggiano
          insieme.
        </p>
      )}
    </div>
  );
}

export function Results({ r, S, step }) {
  const W = S.words;
  const NB = S.obs.length,
    NF = r.features || 3 * NB,
    KN = kin(S);
  const ownN = (t) =>
    3 * (S.traits.find((x) => x.name === t.name)?.own || [0]).length;
  const byKey = Object.fromEntries(r.contest.map((c) => [c.key, c.m]));
  const ranked = [...r.contest].sort((a, b) => a.m.scarto - b.m.scarto);
  const unseen = r.registry.filter((x) => !x.families).length;
  // Deduzione finale (piselli, polli, Labrador): due 3:1 confermati (e, se serve, l'indipendenza) danno il rapporto combinato.
  const D = S.deduction;
  const dA = D && r.ratios.find((x) => x.id === D.a),
    dB = D && r.ratios.find((x) => x.id === D.b),
    direct = D?.direct && r.ratios.find((x) => x.id === D.direct);
  const indep = r.independence.every((i) => i.p2.verdict === "non aiuta");
  const canDeduce =
    D &&
    dA?.p2.proposal?.join(":") === "3:1" &&
    dB?.p2.proposal?.join(":") === "3:1" &&
    (!D.needIndependent || indep);
  const sm = r.summary;

  return (
    <>
      {step === 1 && (
        <section className={s.card}>
          <p className={s.eyebrow}>03 · Fase 1 · Il registro di Mendel</p>
          <h2>Che cosa Mendel ha davanti</h2>
          <p>
            Mendel conosce {int(r.counts.known)} {W.famiglie}{" "}
            {agree(W, "complete", "completi")} su {int(r.counts.total)}. Per
            ogni coppia di {W.genitori} annota quanti {W.figli} di ciascun tipo
            ha visto nascere, contando sia {KN.il} sia il {W.secondo}.{" "}
            {S.ordered
              ? ` Qui l’ordine conta: ${W.madre} × ${W.padre} e l’incrocio inverso possono dare figli diversi, quindi ogni riga è una coppia ${W.madre} × ${W.padre}.`
              : " Il registro è simmetrico: scambiare i due genitori non cambia le probabilità degli esiti nel modello, quindi i due ordini finiscono nella stessa riga."}
          </p>
          <Registry
            S={S}
            rows={r.registry}
            title={
              unseen
                ? unseen === 1
                  ? `Una coppia di ${W.genitori} non compare mai nel 20%: su quella Mendel non ha alcun dato diretto.`
                  : `${unseen} coppie di ${W.genitori} non compaiono mai nel 20%: su quelle Mendel non ha alcun dato diretto.`
                : `Nel 20% compaiono tutte le coppie di ${W.genitori} possibili.`
            }
          />
          <div className={s.explain}>
            <p>
              <strong>Come leggerlo.</strong> Uno zero non significa
              «impossibile»: può voler dire che quel tipo di {W.figlio} è raro e
              non è ancora capitato. È proprio la trappola che Mendel deve
              evitare, e il motivo per cui si fa aiutare dalla foresta, che
              ragiona per somiglianze tra {W.famiglie} diverse invece di
              guardare solo le righe piene.
            </p>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className={s.card}>
          <p className={s.eyebrow}>04 · Fase 1 · L’assistente</p>
          <h2>La foresta impara dal 20%</h2>
          <p>
            La foresta riceve, per ogni {W.famiglia}{" "}
            {agree(W, "conosciuta", "conosciuto")},{" "}
            {KN.many
              ? `${num(NF)} proprietà: le osservazioni sì/no (${listIt(S.obs.map((o) => o.label))}) di ${W.madre} e ${W.padre} e, per ${KN.il}, quanti ce ne sono di ciascun tipo`
              : `le ${num(NF)} osservazioni sì/no (${listIt(S.obs.map((o) => o.label))} di ${W.madre}, ${W.padre} e ${W.primo})`}{" "}
            e il tipo del {W.secondo}. Costruisce {FOREST.trees} alberi di
            domande: ognuno vede un campione estratto a sorte{" "}
            {agree(W, "delle", "dei")} {int(r.counts.known)} {W.famiglie} e, a
            ogni domanda, solo {FOREST.mtry} delle {NF}{" "}
            {KN.many ? "proprietà" : "osservazioni"} sorteggiate; si ferma
            quando un gruppo scende sotto {TREE.minLeaf} {W.famiglie}. La
            previsione è la media dei {FOREST.trees} alberi.
          </p>
          <h3>Che cosa prevede per il {W.secondo}</h3>
          {S.key === "piselli" && r.forestWalk && (
            <ForestWalk examples={r.forestWalk} S={S} />
          )}
          <ForestMap S={S} rows={r.forestMap} />
          <p className={s.note}>
            Media delle previsioni {agree(W, "sulle", "sugli")} {W.famiglie}{" "}
            {agree(W, "conosciute", "conosciuti")} di ciascuna coppia. Per le
            coppie mai viste la foresta combina ciò che ha imparato dalle
            singole osservazioni: è un’ipotesi, non un conteggio.
          </p>
          <h3>Quali osservazioni usa</h3>
          {!S.ordered && (
            <p className={s.note}>
              Le osservazioni dei due genitori entrano nella foresta come dati
              separati. Una differenza nella loro importanza può dipendere dal
              campione e dall’addestramento: non dimostra una maggiore influenza
              genetica della madre o del padre. Per i caratteri studiati, i due
              ruoli sono equivalenti nel modello.
            </p>
          )}
          <div className={s.bars}>
            {r.importance.map((x) => {
              const max = r.importance[0].delta || 1;
              return (
                <div key={x.label} className={s.barRow}>
                  <span className={s.barLabel}>{x.label}</span>
                  <span className={s.barTrack}>
                    <span
                      className={s.bar}
                      style={{ width: pct(Math.max(0, x.delta / max)) }}
                    />
                  </span>
                  <span className={s.barValue}>
                    {x.delta > 0 ? "+" : ""}
                    {dec(x.delta, 3)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className={s.explain}>
            <p>
              <strong>Come si misura senza toccare i dati futuri.</strong> Ogni
              albero ha visto circa due terzi {agree(W, "delle", "degli")}{" "}
              {W.famiglie};{" "}
              {agree(W, "le altre sono rimaste", "gli altri sono rimasti")}{" "}
              «fuori dal sacco». Per {agree(W, "ciascuna", "ciascun")}{" "}
              {W.famiglia} si usa solo il parere degli alberi che non l’hanno{" "}
              {agree(W, "vista", "visto")}: è una prova onesta fatta con i soli
              dati di Mendel. Poi si rimescola un’osservazione tra{" "}
              {agree(W, "le", "gli")} {W.famiglie} e si guarda di quanto cresce
              la sorpresa media (partenza: {dec(r.oobBase, 3)}). Più cresce, più
              la foresta si affidava a quell’osservazione.
            </p>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className={s.card}>
          <p className={s.eyebrow}>05 · Fase 1 · Le leggi di esclusione</p>
          <h2>Mendel mette alla prova le sue ipotesi</h2>
          <p>
            Mendel scrive una lista di leggi candidate: alcune gli sembrano
            ovvie, altre sono tentazioni. Per ciascuna guarda due cose: se nel
            suo 20% esiste un controesempio, e quanta probabilità la foresta
            assegna, in media, ai {W.figli} che la legge vieterebbe.
          </p>
          <div
            className={s.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Tabella dati scorrevole"
          >
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Legge candidata</th>
                  <th>{W.famiglie} che la mettono alla prova</th>
                  <th>Controesempi</th>
                  <th>La foresta dà ai {W.figli} vietati</th>
                  <th>Verdetto di Mendel</th>
                </tr>
              </thead>
              <tbody>
                {r.laws.map((l) => (
                  <tr key={l.id}>
                    <td className={s.wrapCell}>{l.text}</td>
                    <td>{int(l.p1.support)}</td>
                    <td>{l.p1.violations ? int(l.p1.violations) : "—"}</td>
                    <td>{l.p1.support ? pct(l.p1.forestMax, 1) : "—"}</td>
                    <td>
                      <Tag map={VERDICT} k={l.p1.verdict} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={s.explain}>
            <p>
              <strong>Le regole del verdetto.</strong>
            </p>
            <p>
              • <strong>Respinta</strong> se nel 20% c’è almeno{" "}
              {agree(W, "una", "un")} {W.famiglia} che la viola: basta un
              controesempio.
            </p>
            <p>
              • <strong>Troppo pochi casi</strong> se meno di {LAW.minSupport}{" "}
              {W.famiglie} la mettono alla prova: Mendel non si pronuncia.
            </p>
            <p>
              • <strong>Proposta come legge</strong> se non ci sono controesempi
              e la foresta assegna ai {W.figli} vietati meno del{" "}
              {pct(LAW.threshold)}, in media {agree(W, "sulle", "sugli")}{" "}
              {W.famiglie} {agree(W, "coinvolte", "coinvolti")}.
            </p>
            <p>
              • <strong>In dubbio</strong> se non ci sono controesempi ma la
              foresta non se la sente di escluderli. Succede perché la foresta
              fa la media di molti alberi, e alcuni mescolano {W.famiglie}{" "}
              {agree(W, "diverse", "diversi")}: la sua prudenza segnala che i
              dati non bastano.
            </p>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className={s.card}>
          <p className={s.eyebrow}>06 · Fase 1 · I rapporti numerici</p>
          <h2>Riconoscere un 3 : 1 in pochi numeri</h2>
          <p>
            In alcune situazioni {KN.il} {KN.verbo} qualcosa {W.deiGenitori}, e
            i {W.secondi} si dividono in proporzioni fisse. Mendel conta, guarda
            la previsione della foresta e cerca il rapporto semplice più
            compatibile tra quelli che conosce (1:1, 3:1, 1:2:1, 2:1:1, 9:3:4,
            1:1:1:1, 3:3:1:1, 9:3:3:1). Se nessuno è compatibile lo dice: anche
            «nessun rapporto semplice» è una risposta, e a volte è quella
            giusta.
          </p>
          <div className={s.ratioGrid}>
            {r.ratios.map((x) => (
              <RatioCard key={x.id} S={S} r={x} phase={1} />
            ))}
          </div>
          <div className={s.explain}>
            <p>
              <strong>Il test del chi quadro.</strong> Per ogni rapporto
              candidato si calcola quanti {W.figli} ci si aspetterebbe in
              ciascuna classe e si misura lo scarto dai conteggi reali. Il
              numero <em>p</em> dice quanto è probabile uno scarto almeno così
              grande se il rapporto fosse quello vero: vicino a 1 =
              perfettamente compatibile, sotto 0,05 = poco credibile.
            </p>
            <p>
              <strong>La prudenza di Mendel.</strong> Con il solo 20% propone un
              rapporto solo se è l’unico con p sopra 0,05. Con pochi casi spesso
              restano plausibili sia 1:1 sia 3:1: allora lo dichiara ambiguo e
              aspetta i dati completi. Sotto le {RATIO.minFamilies} {W.famiglie}{" "}
              non ci prova nemmeno, e non propone un rapporto se in qualche
              classe si aspetterebbe meno di 5 casi: è la regola di validità del
              chi quadro (per un 9:3:3:1 servono almeno 80 {W.famiglie}).
            </p>
            <p>
              <strong>Con i dati completi</strong> aggiunge il rasoio di Occam:
              se il rapporto più compatibile è anche il più semplice tra quelli
              plausibili (somma dei termini più piccola: 1:1:1:1 fa 4, 3:3:1:1
              fa 8), lo propone anche se un rapporto più complicato non è del
              tutto escluso.
            </p>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className={s.card}>
          <p className={s.eyebrow}>07 · Fase 1 · Due caratteri o uno?</p>
          <h2>Per prevedere un carattere serve conoscere l’altro?</h2>
          <p>
            Mendel addestra, per ciascun carattere del {W.secondo}, due foreste:
            una vede tutte le {num(NF)} osservazioni, l’altra solo quelle dello
            stesso carattere ({W.madre}, {W.padre}, {W.primo}). Se la foresta
            completa non prevede meglio, il resto non porta informazione: i
            caratteri si comportano come indipendenti.
          </p>
          {NB > 2 && (
            <p className={s.note}>
              Qui ogni {W.individuo} ha {num(NB)} osservazioni. Quando due
              risposte descrivono lo stesso gene (per esempio{" "}
              {listIt(
                S.traits
                  .filter((t) => t.own?.length > 1)
                  .map((t) =>
                    t.own.map((b) => `«${S.obs[b].short}»`).join(" e "),
                  ),
              )}
              ) la foresta «propria» le vede entrambe: la domanda è se l’altro
              gene aiuta, non se aiuta un’altra faccia dello stesso.
            </p>
          )}
          <div
            className={s.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Tabella dati scorrevole"
          >
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Carattere del {W.secondo}</th>
                  <th>Sorpresa con {NF} osservazioni</th>
                  <th>con le sole proprie</th>
                  <th>Differenza</th>
                  <th>Verdetto</th>
                </tr>
              </thead>
              <tbody>
                {r.independence.map((i) => (
                  <tr key={i.name}>
                    <td>{i.name}</td>
                    <td>{dec(i.p1.full, 3)}</td>
                    <td>
                      {dec(i.p1.own, 3)}{" "}
                      <small className={s.muted}>({ownN(i)})</small>
                    </td>
                    <td>{dec(i.p1.own - i.p1.full, 3)}</td>
                    <td>
                      {i.p1.verdict === "aiuta"
                        ? "L’altro carattere aiuta"
                        : "L’altro carattere non aiuta"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={s.note}>
            Sorpresa media «fuori dal sacco» sul 20% (più bassa è meglio).
            Mendel considera utile l’altro carattere solo se fa scendere la
            sorpresa di almeno {dec(INDEPENDENCE.margin, 2)}. Una differenza
            negativa significa che le osservazioni in più hanno solo confuso la
            foresta.
          </p>
          {r.linkage && <Linkage S={S} L={r.linkage} phase={1} />}
        </section>
      )}

      {step === 6 && (
        <section className={s.card}>
          <p className={s.eyebrow}>08 · Fase 2 · Nascono gli altri {W.figli}</p>
          <h2>La foresta aveva previsto bene?</h2>
          <p>
            Ora si conosce il {W.secondo} di {agree(W, "tutte le", "tutti gli")}{" "}
            {int(r.counts.total)} {W.famiglie}. {agree(W, "Le", "I")}{" "}
            {int(r.counts.rest)} {agree(W, "nuove", "nuovi")} sono una prova
            severa: nessun modello{" "}
            {agree(W, "le aveva viste", "li aveva visti")}. Si confrontano la
            foresta, un albero singolo e una semplice tabella di conteggio,
            tutti addestrati sullo stesso 20%, con la risposta esatta calcolata
            dagli alleli.
          </p>
          <div
            className={s.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Tabella dati scorrevole"
          >
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Modello</th>
                  <th>
                    Scarto dalla risposta esatta<small>0 = identico</small>
                  </th>
                  <th>
                    Sorpresa media<small>più bassa è meglio</small>
                  </th>
                  <th>
                    Tipo indovinato<small>il più probabile è quello nato</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((c, i) => (
                  <tr key={c.key} className={i === 0 ? s.win : undefined}>
                    <td>
                      {c.label}
                      {i === 0 && <span className={s.badge}>migliore</span>}
                    </td>
                    <td>{dec(c.m.scarto, 3)}</td>
                    <td>{dec(c.m.sorpresa, 3)}</td>
                    <td>{pct(c.m.indovinato, 1)}</td>
                  </tr>
                ))}
                <tr className={s.ref}>
                  <td>Risposta esatta (alleli)</td>
                  <td>0</td>
                  <td>{dec(r.mendelExact.sorpresa, 3)}</td>
                  <td>{pct(r.mendelExact.indovinato, 1)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={s.explain}>
            <p>
              <strong>Come leggere il confronto.</strong> La tabella conosce
              solo le combinazioni già viste e per le altre usa la media
              generale; l’albero singolo si fida troppo dei piccoli gruppi di{" "}
              {W.famiglie}. La foresta media molti alberi diversi e addolcisce
              le coincidenze. In questa simulazione la foresta ha{" "}
              {compareError(byKey.foresta.scarto, byKey.albero.scarto)} rispetto
              all’albero e{" "}
              {compareError(byKey.foresta.scarto, byKey.tabella.scarto)}{" "}
              rispetto alla tabella.
            </p>
            <p>
              <strong>Il riferimento teorico.</strong> In questo campione,
              conoscendo gli alleli si indovina il tipo del {W.secondo} solo nel{" "}
              {pct(r.mendelExact.indovinato)} dei casi: quale allele passa è un
              lancio di moneta. Le leggi di Mendel sono leggi di probabilità: su
              un campione finito l’accuratezza osservata può oscillare attorno
              al riferimento teorico.
            </p>
          </div>
        </section>
      )}

      {step === 7 && (
        <section className={s.card}>
          <p className={s.eyebrow}>
            09 · Fase 2 · Le leggi alla prova dei dati completi
          </p>
          <h2>Che cosa resta in piedi</h2>
          <div
            className={s.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Tabella dati scorrevole"
          >
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Legge</th>
                  <th>Fase 1</th>
                  <th>
                    {agree(W, "Tutte le", "Tutti gli")} {W.famiglie}
                    <small>alla prova · controesempi</small>
                  </th>
                  <th>Dati completi</th>
                </tr>
              </thead>
              <tbody>
                {r.laws.map((l) => (
                  <tr key={l.id}>
                    <td className={s.wrapCell}>{l.text}</td>
                    <td>
                      <Tag map={VERDICT} k={l.p1.verdict} />
                    </td>
                    <td>
                      {int(l.p2.support)} ·{" "}
                      {l.p2.violations ? int(l.p2.violations) : "—"}
                    </td>
                    <td>
                      <Tag map={VERDICT} k={l.p2.verdict} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>I rapporti con tutti i dati</h3>
          <p className={s.note}>
            Ora vale anche il rasoio di Occam descritto nella sezione 06.
          </p>
          <div className={s.ratioGrid}>
            {r.ratios.map((x) => (
              <RatioCard key={x.id} S={S} r={x} phase={2} />
            ))}
          </div>
          <h3>L’indipendenza con tutti i dati</h3>
          {r.linkage && <Linkage S={S} L={r.linkage} phase={2} />}
          <p>
            Le due foreste della fase 1 vengono provate{" "}
            {agree(W, "sulle", "sui")} {int(r.counts.rest)} {W.famiglie}{" "}
            {agree(W, "nuove", "nuovi")}:{" "}
            {r.independence
              .map(
                (i) =>
                  `${i.name}: ${dec(i.p2.full, 3)} con ${NF} osservazioni, ${dec(i.p2.own, 3)} con ${ownN(i)} (${i.p2.verdict === "aiuta" ? "l’altro carattere aiuta" : "l’altro carattere non aiuta"})`,
              )
              .join("; ")}
            .
          </p>
        </section>
      )}

      {step === 8 && (
        <section className={s.card}>
          <p className={s.eyebrow}>10 · Fase 3 · La verità degli alleli</p>
          <h2>Perché le leggi sono quelle</h2>
          {S.alleles.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
          <h3>Le esclusioni</h3>
          <div
            className={s.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Tabella dati scorrevole"
          >
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Legge</th>
                  <th>Verità</th>
                  <th>Spiegazione con gli alleli</th>
                  <th>Mendel</th>
                </tr>
              </thead>
              <tbody>
                {r.laws.map((l) => (
                  <tr key={l.id}>
                    <td className={s.wrapCell}>{l.text}</td>
                    <td>
                      <Tag map={VERDICT} k={l.truth.verdict} />
                    </td>
                    <td className={s.wrapCell}>
                      {l.why}
                      {l.truth.counter &&
                        ` Esempio: ${l.truth.counter.m} × ${l.truth.counter.f} dà ${l.truth.counter.child} con probabilità ${pct(l.truth.counter.q)}.`}
                    </td>
                    <td>
                      <Tag map={OUTCOME} k={l.outcome} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>I rapporti</h3>
          <div className={s.truthGrid}>
            {r.ratios.map((x) => (
              <div key={x.id} className={s.ratioCard}>
                <h3>{x.text}</h3>
                <p style={{ margin: "4px 0" }}>
                  Rapporto vero:{" "}
                  <strong className={s.big}>
                    {x.truth.ratio
                      ? x.truth.ratio.join(" : ")
                      : x.truth.dist.map((v) => pct(v, 1)).join(" : ")}
                  </strong>{" "}
                  ({x.classNames.join(" : ")})
                </p>
                {!x.truth.simple && (
                  <p className={s.note} style={{ margin: "4px 0" }}>
                    {x.truth.ratio
                      ? "Non è tra i rapporti che Mendel conosceva:"
                      : "Non è un rapporto semplice:"}{" "}
                    la risposta giusta, per lui, era «nessun rapporto semplice».
                  </p>
                )}
                <p className={s.note} style={{ margin: "4px 0" }}>
                  {x.why}
                </p>
                <Punnett data={x.truth.punnett} />
                <p style={{ margin: "6px 0 0" }}>
                  <Tag map={OUTCOME} k={x.outcome} />
                  {x.p1.proposal && (
                    <span className={s.note}>
                      {" "}
                      · Mendel aveva proposto {x.p1.proposal.join(":")}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
          <h3>L’indipendenza</h3>
          <p>{S.independence}</p>
          {r.linkage && (
            <div className={s.explain}>
              <p>
                <strong>La prova mirata, con la verità.</strong> {S.linkage.why}{" "}
                {agree(W, "Nelle", "Negli")} {W.famiglie} della prova le
                probabilità esatte sono{" "}
                {S.linkage.rows
                  .flatMap((a, x) =>
                    S.linkage.cols.map(
                      (b, y) =>
                        `${a} con ${b} ${pct(r.linkage.truth.joint[x][y], 1)}`,
                    ),
                  )
                  .join(", ")}
                ; se i due geni fossero indipendenti sarebbero{" "}
                {S.linkage.rows
                  .flatMap((a, x) =>
                    S.linkage.cols.map((b, y) =>
                      pct(r.linkage.truth.product[x][y], 1),
                    ),
                  )
                  .join(", ")}
                . <Tag map={OUTCOME} k={r.linkage.outcome} />
              </p>
              <p>
                <strong>Perché la foresta non se ne accorge.</strong> La foresta
                misura l’aiuto medio su {agree(W, "tutte le", "tutti gli")}{" "}
                {W.famiglie}. L’associazione tra i geni conta solo{" "}
                {agree(W, "in quelle", "in quelli")} con un genitore eterozigote
                per entrambi, una piccola parte: diluito sulle altre, l’effetto
                scende sotto la soglia. La prova mirata guarda solo dove
                l’effetto c’è, e lo vede quasi sempre anche con il 20%. È una
                lezione generale: una media può nascondere un effetto forte ma
                concentrato.
              </p>
            </div>
          )}
          <div
            className={s.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Tabella dati scorrevole"
          >
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Carattere</th>
                  <th>Verità</th>
                  <th>
                    Informazione portata dall’altro carattere
                    <small>sorpresa risparmiata, esatta</small>
                  </th>
                  <th>Mendel (dati completi)</th>
                </tr>
              </thead>
              <tbody>
                {r.independence.map((i) => (
                  <tr key={i.name}>
                    <td>{i.name}</td>
                    <td>
                      {i.truth.verdict === "indipendente"
                        ? "Indipendente"
                        : "Dipendente"}
                    </td>
                    <td>{dec(i.truth.gain, 4)}</td>
                    <td>
                      {i.p2.verdict === "aiuta"
                        ? "L’altro carattere aiuta"
                        : "Non aiuta"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {S.key !== "sangue" &&
            !r.linkage &&
            r.independence.some(
              (i) =>
                i.truth.verdict === "dipendente" &&
                i.p2.verdict === "non aiuta",
            ) && (
              <div className={s.explain}>
                <p>
                  <strong>Un legame vero ma troppo piccolo per i dati.</strong>{" "}
                  La dipendenza esiste, ma l’informazione in più vale appena{" "}
                  {dec(Math.max(...r.independence.map((i) => i.truth.gain)), 4)}
                  , sotto la soglia di {dec(INDEPENDENCE.margin, 2)} che si
                  riesce a misurare con queste {W.famiglie}. Un effetto vero ma
                  raro richiede moltissimi dati: la foresta non sbaglia,
                  semplicemente non può vederlo.
                </p>
              </div>
            )}
          {S.key === "sangue" ? (
            <div className={s.explain}>
              <p>
                <strong>Una verità che i dati non vedono.</strong> Nel sangue i
                due «caratteri» sono legati, ma l’effetto riguarda quasi solo le
                famiglie con un genitore AB, che sono poche: la sorpresa
                risparmiata sarebbe di circa{" "}
                {dec(Math.max(...r.independence.map((i) => i.truth.gain)), 4)},
                molto sotto la soglia di {dec(INDEPENDENCE.margin, 2)} che si
                riesce a misurare con queste famiglie. È un limite onesto del
                metodo: un effetto vero ma raro richiede moltissimi dati. Mendel
                arriva comunque all’idea giusta per un’altra strada, dalle
                esclusioni: un genitore AB non ha mai figli 0, dunque A e B
                stanno «nello stesso posto» e se ne trasmette uno solo.
              </p>
            </div>
          ) : !D ? (
            S.finalNote && (
              <div className={s.explain}>
                <p>
                  <strong>{S.finalNote.title}</strong> {S.finalNote.text}
                </p>
              </div>
            )
          ) : (
            <div className={s.explain}>
              <p>
                <strong>{D.title}</strong> {D.text}
              </p>
              <p>
                {canDeduce
                  ? `Con i dati completi Mendel ha riconosciuto entrambi i 3:1${D.needIndependent ? " e l’indipendenza" : ""}: il ${D.result} lo ricava per deduzione, come fece il vero Mendel con i piselli.`
                  : `In questo esperimento non tutti i passaggi della deduzione sono stati confermati dai dati: vale la pena ripetere con più ${W.famiglie} o un altro seme.`}
              </p>
              {direct && (
                <p>
                  Il caso diretto ({D.directLabel}) è raro:{" "}
                  {int(direct.p2.families)} {W.famiglie} in tutto
                  {direct.p2.families
                    ? `, con conteggi ${direct.p2.counts.join(" : ")}`
                    : ""}
                  . Per questo la deduzione vale più dell’osservazione diretta.
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {step === 9 && (
        <section className={s.card}>
          <p className={s.eyebrow}>11 · Il bilancio</p>
          <h2>Che cosa ha scoperto Mendel</h2>
          <div className={s.kpis}>
            <div className={s.kpi}>
              <b>
                {sm.lawsRight} / {r.laws.length}
              </b>
              <span>leggi giudicate bene già con il 20%</span>
            </div>
            <div className={s.kpi}>
              <b>{sm.lawsWrong + sm.ratiosWrong}</b>
              <span>giudizi sbagliati (leggi e rapporti)</span>
            </div>
            <div className={s.kpi}>
              <b>
                {sm.ratiosRight} / {r.ratios.length}
              </b>
              <span>rapporti riconosciuti con il 20%</span>
            </div>
            <div className={s.kpi}>
              <b>{sm.lawsAdded + sm.ratiosAdded}</b>
              <span>regole aggiunte con i dati completi</span>
            </div>
          </div>
          <ul className={s.lessons}>
            <li>
              <strong>Con il 20% dei dati</strong> Mendel ha giudicato
              correttamente {sm.lawsRight} leggi di esclusione su{" "}
              {r.laws.length} e riconosciuto {sm.ratiosRight}{" "}
              {sm.ratiosRight === 1 ? "rapporto" : "rapporti"} su{" "}
              {r.ratios.length}
              {sm.lawsWrong + sm.ratiosWrong
                ? `, sbagliando ${sm.lawsWrong + sm.ratiosWrong === 1 ? "un giudizio" : `${sm.lawsWrong + sm.ratiosWrong} giudizi`}`
                : ", senza errori"}
              . La prudenza (non pronunciarsi con pochi casi o con più rapporti
              plausibili) è ciò che evita gli errori.
            </li>
            <li>
              <strong>I dati completi</strong> hanno deciso {sm.lawsAdded}{" "}
              {sm.lawsAdded === 1 ? "legge" : "leggi"} e {sm.ratiosAdded}{" "}
              {sm.ratiosAdded === 1 ? "rapporto rimasto" : "rapporti rimasti"}{" "}
              in sospeso
              {sm.lawsOpen + sm.ratiosOpen
                ? `; ${sm.lawsOpen + sm.ratiosOpen === 1 ? "1 resta aperto" : `${sm.lawsOpen + sm.ratiosOpen} restano aperti`} anche così, perché ${sm.lawsOpen + sm.ratiosOpen === 1 ? "riguarda" : "riguardano"} ${W.famiglie} ${agree(W, "troppo rare", "troppo rari")}`
                : ""}
              .
            </li>
            <li>
              <strong>Il confronto tra modelli.</strong> Il minore scarto dalla
              risposta esatta è ottenuto da: {bestModels(r.contest)}. La foresta
              ha contribuito a prevedere il {W.secondo} (scarto{" "}
              {dec(byKey.foresta.scarto, 3)} contro{" "}
              {dec(byKey.albero.scarto, 3)} dell’albero e{" "}
              {dec(byKey.tabella.scarto, 3)} della tabella) e ha dato a Mendel
              un criterio per le leggi. Ma non scrive le leggi da sola: le leggi
              nascono dall’incontro tra le sue previsioni, i conteggi e le
              ipotesi di Mendel.
            </li>
            <li>
              <strong>
                Le esclusioni si trovano presto, i rapporti tardi.
              </strong>{" "}
              Per smentire basta un caso; per riconoscere un 3:1 servono decine
              di {W.famiglie} nella stessa situazione. Per questo il vero Mendel
              contò migliaia di semi.
            </li>
            <li>
              <strong>Gli alleli spiegano tutto.</strong> Ogni legge trovata
              statisticamente coincide con una conseguenza di come gli alleli
              passano dai genitori ai figli: la statistica arriva fino alla
              soglia, la teoria fa il salto.
            </li>
          </ul>
        </section>
      )}
    </>
  );
}
