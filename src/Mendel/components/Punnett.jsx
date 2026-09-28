import React from 'react';
import s from '../Mendel.module.css';
import { pct } from '../lib/format.js';

/** Quadrato di Punnett: sulle righe i gameti della madre, sulle colonne quelli del padre.
 *  Se i gameti non sono ugualmente probabili (geni associati) si mostrano le probabilità. */
export default function Punnett({ data }) {
  if (!data) return null;
  const unequal = data.equal === false;
  return (
    <div className={s.tableWrap}>
      <table className={s.punnett}>
        <caption className={s.note} style={{ captionSide: 'bottom', textAlign: 'left', paddingTop: 4 }}>
          Righe: gameti di {data.a}; colonne: gameti di {data.b} ({data.genes.join(' e ')}).{' '}
          {unequal ? 'I gameti non sono ugualmente probabili: accanto a ciascuno la sua frequenza, in ogni casella la probabilità del figlio.' : 'Ogni casella è ugualmente probabile.'}
          {data.cells.some(row => row.some(c => c.dead)) && ' «Non nasce»: combinazione letale, l’embrione non si sviluppa.'}
        </caption>
        <thead>
          <tr><th>gameti</th>{data.cols.map((g, j) => <th key={j}>{g}{unequal && <small>{pct(data.colP[j], 1)}</small>}</th>)}</tr>
        </thead>
        <tbody>
          {data.rows.map((g, i) => (
            <tr key={i}>
              <th>{g}{unequal && <small>{pct(data.rowP[i], 1)}</small>}</th>
              {data.cells[i].map((c, j) => (
                <td key={j} style={c.dead ? { opacity: 0.55, textDecoration: 'line-through' } : undefined}>
                  {c.geno}<small>{c.label}{unequal && ` · ${pct(c.p, 1)}`}</small>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
