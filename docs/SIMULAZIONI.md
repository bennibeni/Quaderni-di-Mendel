# Mendel · Analisi dell’operabilità delle simulazioni

## Architettura realizzata

L’app usa i dieci scenari esportati da `src/Mendel/lib/scenarios.js`: piselli, polli, cavalli, sangue, gatti, labrador, odoroso, conigli, topi, drosofila. I contenuti e il motore di Mendel sono conservati. Il metodo è nella home; ogni scenario ha dieci sezioni indirizzabili tramite URL hash, compatibili anche con hosting statici. L’indice e precedente/successivo mostrano una sola sezione alla volta. Le sezioni dei risultati sono disponibili dopo l’esecuzione; prima mostrano un invito a preparare l’esperimento.

## Nello stesso scenario

Configurazione, stato, errore e ultimo risultato appartengono allo scenario e vivono nel componente radice. Spostarsi tra sezioni o tornare alla home non azzera la sessione. La simulazione esegue le tre fasi insieme in un Web Worker; la lettura le presenta progressivamente senza ricalcolo. Si può annullare il calcolo. Ripetere sostituisce l’ultimo risultato soltanto quando il nuovo calcolo termina; durante l’attesa rimangono leggibili i risultati precedenti. Il riepilogo indica sempre i parametri del risultato, e segnala parametri modificati ma non ancora applicati.

Il seme rende riproducibile una corsa soltanto a parità di scenario, numero di famiglie e versione del motore. Non è un identificativo universale di una famiglia. Le sessioni sono in memoria: aggiornare o chiudere la scheda le azzera. Non è ancora implementato un archivio di esperimenti.

## Tra scenari diversi

Ogni scenario ha un worker e uno stato distinti. Una simulazione può continuare mentre si legge un altro scenario, e più scenari possono calcolare contemporaneamente. Il worker restituisce dati serializzabili; le funzioni biologiche restano nel modulo degli scenari. Un risultato non viene mai assegnato alla pagina attualmente visibile per caso: viene assegnato alla chiave che ha avviato il lavoro. I worker vengono terminati alla conclusione, all’annullamento e allo smontaggio dell’app. Molti calcoli contemporanei possono aumentare l’uso di CPU; una coda globale è un possibile sviluppo per dispositivi meno potenti.

Non esistono nel motore incroci biologici tra scenari. Non si devono unire genotipi, famiglie, fenotipi o modelli addestrati su sangue e piselli: le variabili e i loro significati sono diversi. Un confronto trasversale può riguardare il metodo: quota di leggi correttamente valutate, rapporti riconosciuti, ipotesi aperte, miglioramento rispetto a una baseline. I conteggi grezzi di leggi non sono direttamente confrontabili se le liste candidate hanno lunghezza diversa. Anche accuratezza e sorpresa dipendono dalla distribuzione dei fenotipi: evitare una classifica assoluta degli scenari.

## Futuro confronto di esperimenti

Per confronti attendibili, conservare record immutabili con id corsa, scenario, versione del modello, numero di famiglie, seme, parametri della foresta, durata e risultati. Separare confronti nello stesso scenario (variazione di seme o numerosità) da confronti del metodo tra scenari. Usare più semi e riportare la variabilità, non soltanto una singola corsa. Lo stesso seme fra scenari non genera popolazioni biologicamente appaiate. Importazione/esportazione, storico, coda globale e pagina di confronto sono sviluppi proposti, non funzioni già implementate.

## Limiti scientifici ereditati da Mendel

Questo lavoro organizza l’app, non certifica il modello genetico o statistico. Il motore usa frequenze prefissate e accoppiamenti casuali; non rappresenta tutte le complessità biologiche. I confronti tra modelli mostrano ora vantaggio, svantaggio o parità secondo i risultati effettivi. Le medie della guida sono dati editoriali forniti con i contenuti, non nuove misurazioni eseguite durante la lettura. Resta necessaria prudenza nell’interpretare assenza di vantaggio predittivo come indipendenza e nella scelta tra rapporti plausibili.
