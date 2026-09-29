import React from 'react';
import s from '../Mendel.module.css';

export default function ParentNote({ scenario: S }) {
  const plant = S.key === 'piselli' || S.key === 'odoroso';
  return <p className={s.note}><strong>I ruoli dei genitori.</strong>{' '}
    {plant && 'La pianta madre è quella che riceve il polline e sulla quale si sviluppano i semi; l’altra pianta dona il polline. Sono ruoli nel singolo incrocio: ciascuna pianta possiede fiori con organi maschili e femminili. '}
    {S.ordered
      ? 'In questo scenario scambiare i ruoli dei genitori può cambiare le probabilità degli esiti: nei gatti conta il gene sull’X, nella drosofila la ricombinazione avviene solo nelle femmine.'
      : 'Per i caratteri studiati in questo modello, i due genitori sono equivalenti: scambiarne i ruoli lascia invariate le probabilità degli esiti, anche se i risultati di singoli campioni possono differire. Questo non implica equivalenza per ogni carattere o processo biologico.'}
  </p>;
}
