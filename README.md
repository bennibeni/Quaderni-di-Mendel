# Mendel · Il quaderno di Mendel

Applicazione React/Vite per esplorare gli esperimenti di Mendel.

## Avvio

Richiede Node.js 20.19+ oppure 22.12+.

```sh
npm install
npm run dev
```

`npm run build` genera `dist`; `npm run preview` visualizza la build; `npm test` verifica motore, isolamento e riproducibilità.

## Struttura

- `src/main.jsx`: navigazione hash, pagine, sessioni separate e gestione worker.
- `src/style.css`: layout responsive della nuova app.
- `src/Mendel/Method.jsx`: metodo nella pagina principale.
- `src/Mendel/Results.jsx`: contenuti originali con rendering di una sezione alla volta.
- `src/Mendel/lib/scenarios.js`: testi, definizioni genetiche e liste di leggi aggiornabili.
- `src/Mendel/lib/experiment.js`: motore originale.
- `src/Mendel/MendelLab.jsx` e `page.jsx`: componenti originali di riferimento, non usati come entrypoint.
- `docs/SIMULAZIONI.md`: analisi separata delle simulazioni interne e tra scenari.

Le URL hanno forma `#/scenari/piselli/registro`. La home è `#/`. Indietro/avanti del browser funzionano; URL sconosciute mostrano una pagina di recupero. Parametri e risultati sopravvivono ai cambi di pagina, ma non al ricaricamento del browser. Nessun servizio esterno è necessario.

## Guida agli scenari

Il pulsante «Guida» nella navigazione e «Leggi la guida ai dieci scenari» nella home aprono la guida comparativa. Ogni scheda include un pulsante che porta alla pagina dello scenario, senza azzerare le sessioni degli esperimenti. Escape chiude la guida.

I testi e le medie comparative sono in `src/Mendel/lib/guide.js`; la finestra è in `src/Mendel/components/ScenarioGuide.jsx`. Le medie sono quelle fornite dall’aggiornamento originale: non vengono ricalcolate dalle simulazioni dell’utente e vanno aggiornate se cambia il modello.
