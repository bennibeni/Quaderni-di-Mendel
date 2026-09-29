import React from 'react';
import s from './Mendel.module.css';
import { KNOWN_SHARE } from './lib/experiment.js';
import { pct } from './lib/format.js';
export default function Method(){return (<section className={s.card}>
        <p className={s.eyebrow}>01 · Il metodo</p>
        <h2>Tre fasi, come in un vero esperimento</h2>
        <p>Il metodo è comune a tutti gli scenari: osservare una parte dei dati, formulare ipotesi e metterle alla prova. Per illustrarlo, prendiamo come esempio gli incroci tra piante di pisello.</p>
        <div className={s.phases}>
          <div className={s.phase}><b>Fase 1 · Il 20%</b>Per ogni incrocio di piselli, Mendel osserva i caratteri delle due piante genitrici e del primo seme. Conosce anche il secondo seme solo nel {pct(KNOWN_SHARE)} dei casi. Su questi dati tiene un registro, addestra la foresta e formula le sue ipotesi.</div>
          <div className={s.phase}><b>Fase 2 · I dati completi</b>Si rivelano i secondi semi del restante {pct(1 - KNOWN_SHARE)} degli incroci. Si controlla quanto bene la foresta ne aveva previsto i caratteri e se le regole proposte reggono: una sola eccezione basta a smentire una regola di esclusione.</div>
          <div className={s.phase}><b>Fase 3 · La verità</b>La simulazione conosce i genotipi, cioè gli alleli di ogni individuo: nell’esempio, di ogni pianta di pisello. Con questi si verifica ogni legge in modo esatto: è la risposta che il vero Mendel intuì senza poterla vedere.</div>
        </div>
        <div className={s.explain}>
          <p><strong>Che cosa conta come «legge».</strong> Mendel cerca tre tipi di regole:</p>
          <p>• <strong>Esclusioni</strong>: indicano quali esiti non possono verificarsi. Per esempio: «incrociando due piante nate da semi rugosi non si ottengono mai semi lisci». Una sola eccezione le smentisce, ma nessun numero di conferme le dimostra del tutto.</p>
          <p>• <strong>Rapporti</strong>: descrivono le proporzioni attese tra gli esiti. Per esempio, incrociando due piante entrambe eterozigoti per la forma del seme, ci si aspetta circa tre semi lisci per ogni seme rugoso. Sono le leggi numeriche che resero famoso Mendel; per riconoscerle servono molti casi.</p>
          <p>• <strong>Indipendenza</strong>: «per prevedere un carattere non serve conoscere l’altro». Nei piselli, per esempio, conoscere il colore del seme non aiuta a prevederne la forma. Se l’indipendenza è vera, i due caratteri si trasmettono separatamente; se è falsa, c’è un legame da indagare.</p>
        </div>
      </section>);}
