import React from 'react';
import s from '../Mendel.module.css';

/** Seme disegnato: liscio (cerchio) o rugoso (contorno ondulato), giallo o verde. */
function Seed({ smooth, yellow, size = 18 }) {
  const fill = yellow ? '#e2c044' : '#6d9a4a', stroke = yellow ? '#a8862a' : '#44672f';
  const r = size / 2 - 1.5, c = size / 2;
  let d = '';
  if (!smooth) {
    const n = 9;
    for (let i = 0; i <= n * 2; i++) {
      const a = (Math.PI * i) / n, rr = i % 2 ? r * 0.8 : r;
      d += `${i ? 'L' : 'M'}${(c + rr * Math.cos(a)).toFixed(2)},${(c + rr * Math.sin(a)).toFixed(2)}`;
    }
    d += 'Z';
  }
  return (
    <svg className={s.seedIcon} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {smooth ? <circle cx={c} cy={c} r={r} fill={fill} stroke={stroke} strokeWidth="1.2" /> : <path d={d} fill={fill} stroke={stroke} strokeWidth="1" strokeLinejoin="round" />}
    </svg>
  );
}

/** Il fenotipo k dello scenario: gettone colorato per il sangue, seme disegnato per i piselli. */
export default function Pheno({ S, k, plain = false }) {
  if (S.key === 'piselli') {
    const [smooth, yellow] = S.bits(k);
    return <span className={s.pheno}><Seed smooth={smooth} yellow={yellow} />{!plain && S.phenotypes[k]}</span>;
  }
  // Sui colori chiari (himalayano, albino…) il testo diventa scuro e compare un bordo.
  const hex = S.colors[k].replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
  const light = 0.299 * r + 0.587 * g + 0.114 * b > 170;
  // Mantelli a chiazze (gatti tartarugati): due colori a strisce oblique.
  const patch = S.patches?.[k];
  const background = patch ? `repeating-linear-gradient(135deg, ${patch[0]} 0 6px, ${patch[1]} 6px 12px)` : S.colors[k];
  return (
    <span className={s.chip} style={{ background, minWidth: 34, height: 24, fontSize: 12, color: light ? '#26261F' : '#fff', border: light ? '1px solid #bdb5a3' : undefined, textShadow: patch ? '0 0 3px #000, 0 0 2px #000' : undefined, gap: S.eyes ? 5 : undefined }}>
      {S.eyes && <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: '50%', background: S.eyes[k], boxShadow: '0 0 0 1.5px #fff', flex: 'none' }} />}
      {S.phenotypes[k]}
    </span>
  );
}

/** Coppia di genitori «X × Y» con i due fenotipi. */
export function PairLabel({ S, m, f }) {
  return <span className={s.pheno}><Pheno S={S} k={m} /> × <Pheno S={S} k={f} /></span>;
}
