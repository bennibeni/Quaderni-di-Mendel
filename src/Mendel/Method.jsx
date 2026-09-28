import React from 'react';
import s from './Mendel.module.css';
import { KNOWN_SHARE } from './lib/experiment.js';
import { pct } from './lib/format.js';
const agree=(W,f,m)=>W.g==='f'?f:m;
export default function Method(){const W={g:'f',famiglie:'famiglie',primo:'primo figlio',secondo:'secondo figlio',secondi:'secondi figli',individuo:'individuo',figlio:'figlio',figli:'figli'};return (<section className={s.card}>
        <p className={s.eyebrow}>01 · Il metodo</p>
        <h2>Tre fasi, come in un vero esperimento</h2>
        <div className={s.phases}>
          <div className={s.phase}><b>Fase 1 · Il 20%</b>{agree(W, 'Tutte le', 'Tutti gli')} {W.famiglie} hanno già un {W.primo}. Mendel conosce anche il {W.secondo} solo nel {pct(KNOWN_SHARE)} dei casi. Su questi dati tiene un registro, addestra la foresta e scrive le sue leggi.</div>
          <div className={s.phase}><b>Fase 2 · I dati completi</b>Nascono i {W.secondi} del restante {pct(1 - KNOWN_SHARE)}. Si controlla quanto bene la foresta li aveva previsti e se le leggi reggono: una sola eccezione basta a smentire una legge.</div>
          <div className={s.phase}><b>Fase 3 · La verità</b>La simulazione conosce i genotipi, cioè gli alleli che ogni {W.individuo} porta. Con questi si verifica ogni legge in modo esatto: è la risposta che il vero Mendel intuì senza poterla vedere.</div>
        </div>
        <div className={s.explain}>
          <p><strong>Che cosa conta come «legge».</strong> Mendel cerca tre tipi di regole:</p>
          <p>• <strong>Esclusioni</strong>: «da questi genitori non nasce mai quel tipo di {W.figlio}». Una sola eccezione le smentisce, ma nessun numero di conferme le dimostra del tutto.</p>
          <p>• <strong>Rapporti</strong>: «in queste condizioni i {W.figli} si dividono 3 a 1». Sono le leggi numeriche che resero famoso Mendel; per riconoscerle servono molti casi.</p>
          <p>• <strong>Indipendenza</strong>: «per prevedere un carattere non serve conoscere l’altro». Se è vera, i due caratteri viaggiano separati; se è falsa, dietro c’è un legame.</p>
        </div>
      </section>);}
