import React from 'react';
import ScenarioIcon from './components/ScenarioIcon.jsx';
import { DEEPENING_TITLES, deepeningExample } from './lib/deepening.js';
import { pct } from './lib/format.js';
import s from './Mendel.module.css';

export default function Deepening({ scenario: S, heading }) {
  const peas = S.key === 'piselli';
  const rows = deepeningExample(S.key);
  return <article className="deepening">
    <a className="back" href={`#/scenari/${S.key}/bilancio`}>← Torna al bilancio dello scenario</a>
    <div className="scenario-heading">
      <p className="overline">MENDEL / APPROFONDIMENTI / {S.title}</p>
      <h1 ref={heading} tabIndex={-1}><ScenarioIcon scenario={S.key}/>{DEEPENING_TITLES[S.key]}</h1>
      <p>Osservare la discendenza, aggiornare le ipotesi, capire che cosa può imparare una Random Forest.</p>
    </div>
    <section className={s.card}>
      <h2>1 · Partiamo da ciò che si vede</h2>
      {peas ? <>
        <p>Incrociamo due piante nate da semi lisci e gialli. Ci concentriamo sulla forma: ciascuna pianta può essere RR oppure Rr. Il seme liscio, da solo, non distingue i due genotipi.</p>
        <p>Nella popolazione dello scenario gli alleli R e r hanno la stessa frequenza e le piante sono abbinate a caso. Tra quelle nate da semi lisci, un terzo è RR e due terzi sono Rr. La probabilità che entrambe siano Rr è quindi 4/9; solo questo incrocio può dare semi rugosi, con probabilità 1/4 per seme. Prima di osservare la discendenza, la probabilità di un seme rugoso è 4/9 × 1/4 = 1/9.</p>
      </> : <>
        <p>Consideriamo due conigli a colore pieno. Il loro mantello rivela la presenza dell’allele C, ma l’altra copia può essere C, cchd, ch oppure c. Nel modello la dominanza segue l’ordine C &gt; cchd &gt; ch &gt; c; soltanto cc dà un albino.</p>
        <p>Con le frequenze dello scenario (C: 25%, cchd: 20%, ch: 20%, c: 35%), un genitore a colore pieno ha probabilità 40% di essere Cc. Prima di osservare i piccoli, la probabilità che entrambi siano Cc è 0,40 × 0,40: quella di un piccolo albino è quindi 4%.</p>
      </>}
      <p className={s.note}>Esempio guidato: non occorre avviare una simulazione. I valori usano le frequenze e il motore genetico di questo scenario; non sono risultati della foresta della tua sessione.</p>
    </section>
    <section className={s.card}>
      <h2>2 · L’osservazione cambia la previsione</h2>
      {peas ? <p>Il primo seme è rugoso: ha ricevuto r da entrambe le piante. Entrambe devono quindi essere Rr. La probabilità che il secondo seme sia rugoso sale a 1/4. Nell’esempio il primo seme è anche giallo, ma il colore non cambia questa deduzione sulla forma, perché i due geni sono indipendenti nel modello.</p>
        : <p>Confrontiamo due osservazioni. Quattro piccoli tutti a colore pieno rendono meno plausibile che entrambi i genitori siano Cc, senza escluderlo. Un solo albino, invece, dimostra che entrambi portano c: poiché sono a colore pieno, sono necessariamente Cc. Anche se gli altri tre piccoli sono a colore pieno, la probabilità che il quinto sia albino è 1/4.</p>}
      <div className={s.tableWrap} tabIndex={0} role="region" aria-label="Probabilità prima e dopo le osservazioni">
        <table className={s.table}>
          <caption>Probabilità esatta {peas ? 'che il secondo seme sia rugoso' : 'che il quinto coniglietto sia albino'}, date le informazioni disponibili</caption>
          <thead><tr><th>Informazione osservata</th><th>Probabilità</th></tr></thead>
          <tbody>{rows.map(row => <tr key={row.label}><td>{row.label}</td><td>{pct(row.p, 2)}</td></tr>)}</tbody>
        </table>
      </div>
      <p><strong>La discendenza osservata non modifica la genetica delle nascite successive: modifica ciò che sappiamo dei genitori.</strong> A genotipi fissati, le trasmissioni successive sono indipendenti nel modello. Finché i genotipi sono nascosti, un discendente fornisce informazioni utili anche per prevederne un altro.</p>
      {!peas && <p>La tabella rivela i primi quattro coniglietti uno alla volta, mantenendo come obiettivo il quinto. Nell’esperimento principale, invece, la foresta riceve insieme i conteggi dei quattro piccoli: non usa l’ordine delle loro nascite. Quattro piccoli a colore pieno non sono la stessa informazione di quattro piccoli genericamente «non albini».</p>}
    </section>
    <section className={s.card}>
      <h2>3 · Che cosa impara la foresta?</h2>
      <p>La Random Forest non vede gli alleli e non esegue questa deduzione genetica. Riceve i caratteri osservabili dei genitori e {peas ? 'del primo seme' : 'i conteggi dei primi quattro coniglietti per tipo di mantello'}, insieme agli esiti da prevedere nelle famiglie del 20% conosciuto. Gli alberi imparano quali osservazioni aiutano a separare gruppi con esiti diversi.</p>
      <p>{peas ? 'Un primo seme rugoso può diventare una domanda utile negli alberi: tra genitori lisci, distingue incroci in cui entrambi portano r.' : 'La presenza di un albino tra i primi quattro può diventare una domanda utile negli alberi: tra genitori a colore pieno, rivela una coppia di portatori di c.'} La media delle previsioni degli alberi fornisce una stima delle probabilità.</p>
      <div className={s.explain}><p><strong>Due strade da confrontare.</strong> I numeri della tabella sono calcolati con Mendel e Bayes: si pesano i genotipi compatibili con le osservazioni e si combinano le loro probabilità di trasmissione. La foresta stima gli esiti dai dati. Può avvicinarsi alla risposta esatta, ma non è obbligata a restituire esattamente il 25%: contano il campione, la rarità degli esempi e l’addestramento.</p></div>
      <p>Una previsione accurata non dimostra una legge universale. E l’osservazione più utile alla foresta non è necessariamente una causa: {peas ? 'il primo seme' : 'un coniglietto albino'} è un indizio sui genitori, non la causa del carattere del discendente successivo.</p>
    </section>
    <section className={s.card}>
      <h2>4 · Torna all’esperimento</h2>
      <p>Avvia lo scenario con 2.500 {S.words.famiglie}. Nella sezione «La foresta» osserva le informazioni più usate; nelle «Previsioni» confronta il modello con la risposta esatta; nella «Verità degli alleli» cerca la spiegazione genetica. Ripeti con un altro seme casuale: le stime possono cambiare, le regole di trasmissione restano le stesse.</p>
      <p>Le probabilità iniziali di questo esempio dipendono dalle frequenze degli alleli. In una popolazione diversa possono cambiare anche se la dominanza e le regole di trasmissione restano identiche.</p>
      <a className="primary-link" href={`#/scenari/${S.key}/scenario`}>Esplora {S.title} →</a>
    </section>
    <section className={s.card}>
      <h2>Per continuare: i paradossi bayesiani</h2>
      <p>La fallacia del tasso di base aiuta a capire perché contano le frequenze iniziali. Il paradosso dei due figli chiarisce perché «il primo ha un carattere» e «almeno uno lo ha» sono informazioni diverse: occorre precisare come si scelgono le famiglie da osservare. Il paradosso del corvo invita a distinguere conferme e dimostrazioni.</p>
      <a href="https://bayes-paradoxes.vercel.app/" target="_blank" rel="noopener noreferrer">Esplora i paradossi bayesiani (app esterna, nuova scheda) ↗</a>
    </section>
  </article>;
}
