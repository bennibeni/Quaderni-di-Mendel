import ScenarioIcon from './ScenarioIcon.jsx';
import React from 'react';
// Guida ai dieci scenari, in una finestra sopra la pagina: schede in ordine di difficoltà,
// con dati, elaborazione, risultati e attinenza con la biologia.
import { useEffect, useRef } from 'react';
import s from '../Mendel.module.css';
import { SCENARIOS } from '../lib/scenarios.js';
import { GUIDE, MEASURED } from '../lib/guide.js';
import { dec } from '../lib/format.js';
import Pheno from './Pheno.jsx';

const one = v => dec(v, 1);
const LEVEL = { Facile: s.lvlEasy, Medio: s.lvlMid, 'Medio-difficile': s.lvlMidHard, Difficile: s.lvlHard, 'Molto difficile': s.lvlVeryHard };
const MAX_ADV = 40;

function AdvBar({ v }) {
  return (
    <span className={s.gBarWrap}>
      <span className={s.gBar}><span style={{ width: `${Math.max(0, Math.min(100, (v / MAX_ADV) * 100))}%` }} /></span>
      <b>{v}%</b>
    </span>
  );
}

export default function ScenarioGuide({ onClose, onPick }) {
  const box = useRef(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); }
      if (e.key === 'Tab') {
        const focusable = box.current?.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]');
        if (!focusable?.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === box.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    box.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); previousFocus?.focus(); };
  }, []);

  return (
    <div className={s.guideBackdrop} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={s.guide} role="dialog" aria-modal="true" aria-labelledby="guide-title" tabIndex={-1} ref={box}>
        <div className={s.guideHead}>
          <div>
            <p className={s.eyebrow}>Mendel · Guida agli scenari</p>
            <h2 id="guide-title">I dieci scenari, dal più facile al più difficile</h2>
          </div>
          <button type="button" className={`${s.button} ${s.small}`} onClick={onClose}>Chiudi ✕</button>
        </div>

        <section className={s.guideSection}>
          <p>Tutti e dieci gli scenari si prestano alla Random Forest: nelle medie riportate con 2.500 famiglie, in ciascuno la foresta prevede il {'secondo figlio'} meglio di un albero singolo e di una tabella di conteggio, e con il solo 20% dei dati le leggi di esclusione non sono quasi mai sbagliate. Cambiano invece la genetica che c’è sotto, quante combinazioni i dati devono coprire e che cosa Mendel riesce a scoprire.</p>
          <p><strong>Che cosa vuol dire «difficile».</strong> L’ordine è quello della difficoltà per Mendel: quante leggi e quanti rapporti riconosce già con il 20%, quanti ne deve rimandare ai dati completi, quanti giudizi sbaglia e quanto la biologia si allontana dal modello semplice dei piselli. Non coincide con la bontà per la foresta: la foresta brilla dove le combinazioni sono tante rispetto ai dati, e tra gli scenari più difficili ci sono quelli in cui vince di più.</p>
        </section>

        <section className={s.guideSection}>
          <h3>Il confronto in una tabella</h3>
          <div className={s.tableWrap} tabIndex={0} role="region" aria-label="Tabella dati scorrevole">
            <table className={`${s.table} ${s.guideTable}`}>
              <thead>
                <tr>
                  <th>#</th><th>Scenario</th><th>Genetica</th><th>Tipi · coppie</th>
                  <th>Foresta meglio della tabella<small>2.500 famiglie</small></th>
                  <th>…dell’albero</th>
                  <th>…della tabella<small>10.000 famiglie</small></th>
                  <th>Leggi giuste col 20%</th>
                  <th>Rapporti col 20% · dopo</th>
                  <th>Giudizi sbagliati</th>
                  <th>Tetto di Mendel<small>tipo indovinato con gli alleli</small></th>
                </tr>
              </thead>
              <tbody>
                {GUIDE.map((g, i) => {
                  const m = MEASURED[g.key], S = SCENARIOS[g.key];
                  return (
                    <tr key={g.key}>
                      <td>{i + 1}</td>
                      <td style={{ textAlign: 'left' }}><button type="button" className={s.guideLink} onClick={() => document.getElementById(`guida-${g.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><ScenarioIcon scenario={S.key}/>{S.title}</button><br /><span className={`${s.lvl} ${LEVEL[g.level]}`}>{g.level}</span></td>
                      <td style={{ textAlign: 'left' }}>{m.genes}</td>
                      <td>{m.K} · {m.pairs}</td>
                      <td><AdvBar v={m.advT} /></td>
                      <td>{m.adv}%</td>
                      <td>{m.advT10}%</td>
                      <td>{one(m.laws.right)} / {m.laws.tot}</td>
                      <td>{one(m.ratios.right)} · {one(m.ratios.later)} / {m.ratios.tot}</td>
                      <td>{one(m.laws.wrong + m.ratios.wrong)}</td>
                      <td>{m.acc}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className={s.note}>Medie su 10 semi con 2.500 famiglie (Mendel ne conosce 500); la colonna con 10.000 famiglie è la media di 3 semi. «Foresta meglio di…» è la riduzione dello scarto dalla risposta esatta. Il tetto di Mendel è la quota di {'secondi figli'} indovinati da chi conosce gli alleli dei genitori: è un riferimento teorico in media, non un limite invalicabile per ogni singolo campione.</p>
        </section>

        {GUIDE.map((g, i) => {
          const S = SCENARIOS[g.key], m = MEASURED[g.key];
          return (
            <article key={g.key} id={`guida-${g.key}`} className={s.guideCard}>
              <div className={s.guideCardHead}>
                <span className={s.guideRank}>{i + 1}</span>
                <div style={{ minWidth: 0 }}>
                  <h3><ScenarioIcon scenario={S.key}/>{S.title} <span className={`${s.lvl} ${LEVEL[g.level]}`}>{g.level}</span></h3>
                  <p className={s.guideIdea}>{g.idea}</p>
                  <span className={s.guideChips}>{S.phenotypes.map((_, k) => <Pheno key={k} S={S} k={k} />)}</span>
                </div>
              </div>
              <div className={s.guideFacts}>
                <div><b>{m.genes}</b><span>genetica</span></div>
                <div><b>{m.K} tipi · {m.GM === m.GF ? `${m.GM} genotipi` : `${m.GM} genotipi (madri), ${m.GF} (padri)`}</b><span>dati</span></div>
                <div><b>{m.pairs} coppie{S.ordered ? ' ordinate' : ''} · {m.features} proprietà</b><span>{m.litter > 1 ? `${m.litter} fratelli già nati` : '1 fratello già nato'}</span></div>
                <div><b>{m.advT}% · {m.adv}%</b><span>foresta meglio di tabella · albero</span></div>
              </div>
              <h4>Che cosa lo rende particolare</h4>
              <p>{g.peculiar}</p>
              <h4>I dati</h4>
              <p>{g.data}</p>
              <h4>L’elaborazione</h4>
              <p>{g.processing} <em>Osservazione più usata dalla foresta: {m.top}.</em></p>
              <h4>I risultati</h4>
              <p>{g.results}</p>
              <ul className={s.guideList}>
                <li>Leggi di esclusione: {one(m.laws.right)} giuste già col 20%, {one(m.laws.later)} decise con i dati completi, {one(m.laws.wrong)} sbagliate, su {m.laws.tot}.</li>
                <li>Rapporti: {one(m.ratios.right)} riconosciuti col 20%, {one(m.ratios.later)} con i dati completi, {one(m.ratios.open)} aperti, {one(m.ratios.wrong)} sbagliati, su {m.ratios.tot}.</li>
                <li>Indipendenza: {m.ind}.</li>
                <li>Vantaggio della foresta sulla tabella: {m.advT}% con 2.500 famiglie, {m.advT10}% con 10.000.</li>
              </ul>
              <h4>La biologia</h4>
              <p>{g.biology}</p>
              <button type="button" className={`${s.button} ${s.small} ${s.ghost}`} onClick={() => onPick(g.key)}>Prova questo scenario</button>
            </article>
          );
        })}

        <p className={s.note}>I numeri di questa guida sono stati misurati con lo stesso codice della pagina. Ripetendo l’esperimento con un seme diverso i risultati di un singolo esperimento possono scostarsi dalle medie.</p>
      </div>
    </div>
  );
}
