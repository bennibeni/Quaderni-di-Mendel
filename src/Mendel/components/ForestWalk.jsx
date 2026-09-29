import React, { useEffect, useState } from 'react';
import Pheno from './Pheno.jsx';
import { pct } from '../lib/format.js';
import s from '../Mendel.module.css';
import './ForestWalk.css';

const subjects = ['Pianta genitrice 1', 'Pianta genitrice 2', 'Primo seme'];

export default function ForestWalk({ examples, S }) {
  const [open, setOpen] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [treeIndex, setTreeIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => { setStep(0); setPlaying(false); setExampleIndex(0); setTreeIndex(0); }, [examples]);
  const example = examples[exampleIndex], tree = example.trees[treeIndex];
  const leafStep = tree.steps.length + 1, meanStep = leafStep + 1, end = meanStep + 1;
  useEffect(() => {
    if (!playing || !open || step >= end) return;
    const timer = setTimeout(() => setStep(n => n + 1), 1800);
    return () => clearTimeout(timer);
  }, [playing, open, step, end]);
  const reset = () => { setStep(0); setPlaying(false); };
  const current = step > 0 && step < leafStep ? tree.steps[step - 1] : null;
  const question = item => `${subjects[Math.floor(item.feature / 2)]}: ${item.feature % 2 === 0 ? 'il seme è liscio?' : 'il seme è giallo?'}`;
  const phase = step === 0 ? 'Osserva i dati disponibili' : current ? `Domanda ${step} di ${tree.steps.length}` : step === leafStep ? 'La previsione di un albero' : step === meanStep ? 'La media di tutta la foresta' : 'Scopri il secondo seme';

  return <section className="forest-walk" aria-label="Segui un incrocio nella foresta">
    <p className={s.eyebrow}>IL LABORATORIO IN MOVIMENTO</p>
    <h3>Un incrocio, tante domande</h3>
    <p>Segui un esperimento del restante 80%, mai usato per addestrare gli alberi. Le domande e le probabilità sono quelle della foresta appena calcolata.</p>
    <button type="button" className={s.button} aria-expanded={open} onClick={() => { setOpen(v => !v); setPlaying(false); }}>{open ? 'Chiudi il percorso' : 'Segui un incrocio'}</button>
    {open && <div className="walk-body">
      <div className="walk-controls">
        <label>Esperimento<select value={exampleIndex} onChange={e => { setExampleIndex(Number(e.target.value)); reset(); }}>{examples.map((x, i) => <option key={x.id} value={i}>Incrocio {x.id}</option>)}</select></label>
        <label>Albero da seguire<select value={treeIndex} onChange={e => { setTreeIndex(Number(e.target.value)); reset(); }}>{example.trees.map((_, i) => <option key={i} value={i}>Albero {i + 1}</option>)}</select></label>
      </div>
      <p className={s.note}>Sono i primi tre incroci di verifica, non esempi scelti perché la previsione riesce bene. Ogni incrocio è indipendente: non è una successione di generazioni. Per le piante genitrici osserviamo il seme da cui sono nate; i due ruoli sono equivalenti per questi caratteri.</p>
      <div className="walk-family">
        {[...example.parents, example.first].map((k, i) => <div key={i}><span>{subjects[i]}</span><Pheno S={S} k={k}/></div>)}
        <div className={step === end ? 'walk-revealed' : ''}><span>Secondo seme</span>{step === end ? <Pheno S={S} k={example.outcome}/> : <b aria-label="Esito ancora nascosto">?</b>}</div>
      </div>
      <div className="walk-controls">
        <button type="button" className={s.button} disabled={step >= end} onClick={() => setPlaying(v => !v)}>{playing && step < end ? 'Pausa' : 'Anima il percorso'}</button>
        <button type="button" className={`${s.button} ${s.ghost}`} disabled={step === 0} onClick={() => { setPlaying(false); setStep(n => n - 1); }}>Indietro</button>
        <button type="button" className={`${s.button} ${s.ghost}`} disabled={step >= end} onClick={() => { setPlaying(false); setStep(n => n + 1); }}>Passo successivo</button>
        <button type="button" className={`${s.button} ${s.ghost}`} onClick={reset}>Ricomincia</button>
      </div>
      {reducedMotion && <p className={s.note}>Movimento ridotto attivo: puoi avviare il percorso automatico; gli effetti di movimento restano disattivati.</p>}
      <p role="status" className="walk-status">{phase} · {step + 1}/{end + 1}</p>
      <progress value={step} max={end} aria-label="Avanzamento nell’albero e nella verifica"/>
      <div className="walk-stage" key={`${exampleIndex}-${treeIndex}-${step}`}>
        {step === 0 && <p>La foresta conosce forma e colore delle due piante genitrici e del primo seme. Il secondo seme resta coperto fino alla verifica. Scegli un albero e segui le sue domande.</p>}
        {current && <div className="walk-question"><span aria-hidden="true">🌳</span><h4>{question(current)}</h4><div className="walk-branches"><span className={current.value === 0 ? 'walk-chosen' : ''}>No{current.value === 0 && ' ← ramo seguito'}</span><span className={current.value === 1 ? 'walk-chosen' : ''}>Sì{current.value === 1 && ' ← ramo seguito'}</span></div><p>L’albero usa questa osservazione per scegliere il ramo successivo. Non conosce i genotipi.</p></div>}
        {step >= leafStep && <>
          <h4>{step === leafStep ? `La foglia dell’albero ${treeIndex + 1}` : `Le probabilità dei ${example.trees.length} alberi si combinano`}</h4>
          {step === leafStep ? <p>In questa foglia arrivano {tree.size} esempi del campione di addestramento dell’albero, comprese le ripetizioni del campionamento con reimmissione. Le loro frequenze danno questa previsione.</p> : <p>La foresta fa la media delle probabilità di tutti gli alberi, compreso quello che hai seguito. Gli alberi possono fare domande diverse e raggiungere foglie diverse.</p>}
          <div className="walk-probabilities">{S.phenotypes.map((_, k) => <div key={k}><Pheno S={S} k={k}/><div className="walk-track"><span style={{width: ((step === leafStep ? tree.distribution : example.prediction)[k] * 100) + '%', background: S.colors[k]}}/></div><b>{pct((step === leafStep ? tree.distribution : example.prediction)[k], 1)}</b></div>)}</div>
        </>}
        {step === end && <div className={s.explain}><p><strong>Esito osservato:</strong> <Pheno S={S} k={example.outcome}/>. La foresta gli assegnava {pct(example.prediction[example.outcome], 1)}.</p><p>Un esito poco probabile può verificarsi: un solo seme non basta a giudicare la qualità delle probabilità. Il confronto complessivo usa molti incroci nella sezione «Le previsioni».</p><p>Per confronto, il modello genetico esatto, dati gli stessi caratteri osservabili, assegnava a questo esito {pct(example.exact[example.outcome], 1)}. È calcolato con Mendel e Bayes e non è una previsione della foresta.</p></div>}
      </div>
      {step > 0 && <details><summary>Rileggi le domande attraversate</summary><ol>{tree.steps.slice(0, Math.min(step, tree.steps.length)).map((item, i) => <li key={i}>{question(item)} <strong>{item.value ? 'Sì' : 'No'}</strong></li>)}</ol>{!tree.steps.length && <p>Questo albero non ha effettuato divisioni: la radice è già una foglia.</p>}</details>}
    </div>}
  </section>;
}
