// Gli scenari di Mendel. Ogni scenario descrive: i geni (loci) con i loro alleli e le frequenze nella
// popolazione, come si passa dal genotipo al fenotipo, le due osservazioni sì/no che Mendel può fare
// su ogni individuo, le leggi candidate (alcune vere, alcune false) e i rapporti da mettere alla prova.
// Mendel NON conosce gli alleli: servono solo alla simulazione e alla verifica finale.

const eq = (m, f, a, b) => (m === a && f === b) || (m === b && f === a);

// ---------------------------------------------------------------- Gruppi sanguigni (A=0, B=1, AB=2, 0=3)
const hasA = k => k === 0 || k === 2;
const hasB = k => k === 1 || k === 2;

const sangue = {
  key: 'sangue',
  title: 'Gruppi sanguigni',
  lead: 'Famiglie umane: il gruppo sanguigno ABO dei genitori, del primo figlio e del secondo figlio.',
  words: { g: 'f', deiGenitori: 'dei genitori', individuo: 'persona', famiglia: 'famiglia', famiglie: 'famiglie', genitori: 'genitori', genitore: 'genitore', madre: 'madre', padre: 'padre', primo: 'primo figlio', secondo: 'secondo figlio', secondi: 'secondi figli', figli: 'figli', figlio: 'figlio', incrocio: 'coppia' },
  loci: [{ name: 'gene ABO', alleles: ['A', 'B', '0'], freq: [0.27, 0.07, 0.66] }],
  phenotypes: ['A', 'B', 'AB', '0'],
  colors: ['#c65a43', '#4a79a8', '#8a5aa8', '#6f7f5c'],
  pheno: g => {
    const [a, b] = g[0];
    if (a !== b && a < 2 && b < 2) return 2;
    if (a === 0 || b === 0) return 0;
    if (a === 1 || b === 1) return 1;
    return 3;
  },
  obs: [
    { label: 'reazione all’anti-A', yes: 'ha l’antigene A', no: 'non ha l’antigene A', short: 'anti-A' },
    { label: 'reazione all’anti-B', yes: 'ha l’antigene B', no: 'non ha l’antigene B', short: 'anti-B' },
  ],
  bits: k => [hasA(k), hasB(k)],
  observation: 'In laboratorio il gruppo sanguigno si determina con due reazioni: si mescola una goccia di sangue con un siero anti-A e con un siero anti-B e si guarda se agglutina. A reagisce solo all’anti-A, B solo all’anti-B, AB a entrambi, 0 a nessuno. Sono queste due risposte sì/no che Mendel annota per ogni persona, e sono queste che dà alla foresta.',
  population: 'Frequenze degli alleli approssimate di una popolazione europea: A 27%, B 7%, 0 66%. Le coppie si formano a caso.',
  alleles: [
    'Il gruppo dipende da un solo gene con tre varianti (alleli): A, B e 0. Ogni persona ne porta due, uno ricevuto dalla madre e uno dal padre, e ne trasmette uno a caso a ciascun figlio.',
    'A e B sono dominanti su 0: A0 è di gruppo A, B0 è di gruppo B. A e B sono codominanti: chi ha A e B è di gruppo AB. Solo 00 è di gruppo 0.',
    'Per questo il gruppo non dice tutto: una persona A può essere AA oppure A0. Il primo figlio può svelarlo: se nasce un figlio 0, entrambi i genitori portano un allele 0.',
  ],
  laws: [
    { id: 'L1', text: '0 × 0: nascono solo figli 0.', prem: (m, f) => m === 3 && f === 3, forb: z => z !== 3, why: 'Chi è di gruppo 0 ha genotipo 00. Due genitori 00 possono passare solo alleli 0: ogni figlio è 00.' },
    { id: 'L2', text: 'Se un genitore è AB, non nasce mai un figlio 0.', prem: (m, f) => m === 2 || f === 2, forb: z => z === 3, why: 'Il genitore AB passa sempre A oppure B: il figlio riceve almeno un allele A o B e non può essere 00.' },
    { id: 'L3', text: 'Se un genitore è 0, non nasce mai un figlio AB.', prem: (m, f) => m === 3 || f === 3, forb: z => z === 2, why: 'Il genitore 00 passa sempre un allele 0: il figlio ha al massimo uno tra A e B, mai entrambi.' },
    { id: 'L4', text: 'Un figlio ha l’antigene A solo se almeno un genitore ce l’ha.', prem: (m, f) => !hasA(m) && !hasA(f), forb: z => hasA(z), why: 'L’allele A deve arrivare da un genitore, e chi porta l’allele A mostra sempre l’antigene A.' },
    { id: 'L5', text: 'Un figlio ha l’antigene B solo se almeno un genitore ce l’ha.', prem: (m, f) => !hasB(m) && !hasB(f), forb: z => hasB(z), why: 'Come per A: l’allele B deve arrivare da un genitore che lo mostra.' },
    { id: 'L6', text: 'A × A: nascono solo figli A.', prem: (m, f) => m === 0 && f === 0, forb: z => z !== 0, why: 'Falsa: un genitore A può essere A0. Due genitori A0 hanno un figlio 00, di gruppo 0, una volta su quattro.' },
    { id: 'L7', text: 'AB × AB: nascono solo figli AB.', prem: (m, f) => m === 2 && f === 2, forb: z => z !== 2, why: 'Falsa: AB × AB dà AA (gruppo A), AB e BB (gruppo B) nel rapporto 1:2:1.' },
    { id: 'L8', text: 'A × B: non nasce mai un figlio 0.', prem: (m, f) => eq(m, f, 0, 1), forb: z => z === 3, why: 'Falsa: se i genitori sono A0 e B0, un figlio su quattro riceve due alleli 0.' },
  ],
  ratios: [
    { id: 'R1', text: 'A × 0, quando il primo figlio è 0', cond: (m, f, c) => eq(m, f, 0, 3) && c === 3, classes: [[0], [3]], why: 'Il primo figlio 0 dimostra che il genitore A è A0. A0 × 00 dà A0 e 00 in parti uguali.' },
    { id: 'R2', text: 'AB × 0, qualunque sia il primo figlio', cond: (m, f) => eq(m, f, 2, 3), classes: [[0], [1]], why: 'AB × 00 dà A0 (gruppo A) e B0 (gruppo B) in parti uguali.' },
    { id: 'R3', text: 'A × A, quando il primo figlio è 0', cond: (m, f, c) => m === 0 && f === 0 && c === 3, classes: [[0], [3]], why: 'Entrambi i genitori sono A0. A0 × A0 dà AA, A0, 0A, 00: tre figli A e uno 0.' },
    { id: 'R4', text: 'A × B, quando il primo figlio è 0', cond: (m, f, c) => eq(m, f, 0, 1) && c === 3, classes: [[0], [1], [2], [3]], why: 'I genitori sono A0 e B0: nascono AB, A0, B0, 00, un figlio per ciascun gruppo.' },
    { id: 'R5', text: 'B × 0, quando il primo figlio è 0', cond: (m, f, c) => eq(m, f, 1, 3) && c === 3, classes: [[1], [3]], why: 'Il genitore B è B0: B0 × 00 dà B0 e 00 in parti uguali.' },
  ],
  traits: [
    { bit: 0, label: 'l’antigene A', name: 'antigene A' },
    { bit: 1, label: 'l’antigene B', name: 'antigene B' },
  ],
  independence: 'Nel sangue A e B sono due varianti dello stesso gene: un genitore AB passa A oppure B, mai entrambi e mai nessuno. Sapere se un genitore ha B cambia quindi la probabilità che passi A. I due «caratteri» non sono indipendenti: è l’indizio che dietro c’è un solo gene con più alleli.',
};

// ---------------------------------------------------------------- Piselli (0 liscio giallo, 1 liscio verde, 2 rugoso giallo, 3 rugoso verde)
const liscio = k => k < 2;
const giallo = k => k % 2 === 0;

const piselli = {
  key: 'piselli',
  title: 'Piselli di Mendel',
  lead: 'Incroci di piante di pisello: forma e colore dei semi da cui sono nate le due piante genitrici, del primo seme e del secondo seme.',
  words: { g: 'm', deiGenitori: 'delle piante genitrici', individuo: 'pianta', famiglia: 'incrocio', famiglie: 'incroci', genitori: 'piante genitrici', genitore: 'genitore', madre: 'pianta madre', padre: 'pianta donatrice di polline', primo: 'primo seme', secondo: 'secondo seme', secondi: 'secondi semi', figli: 'semi', figlio: 'seme', incrocio: 'incrocio' },
  loci: [
    { name: 'gene della forma', alleles: ['R', 'r'], freq: [0.5, 0.5] },
    { name: 'gene del colore', alleles: ['Y', 'y'], freq: [0.5, 0.5] },
  ],
  phenotypes: ['liscio giallo', 'liscio verde', 'rugoso giallo', 'rugoso verde'],
  colors: ['#d9b53f', '#6d9a4a', '#b8913a', '#4f6f3a'],
  pheno: g => (g[0].includes(0) ? 0 : 2) + (g[1].includes(0) ? 0 : 1),
  obs: [
    { label: 'forma del seme', yes: 'è liscio', no: 'è rugoso', short: 'liscio' },
    { label: 'colore del seme', yes: 'è giallo', no: 'è verde', short: 'giallo' },
  ],
  bits: k => [liscio(k), giallo(k)],
  observation: 'Di ogni pianta Mendel guarda due cose del seme da cui è nata: se è liscio o rugoso, se è giallo o verde. Sono i due caratteri che il vero Mendel studiò insieme nel 1865. Queste due risposte sì/no, per le due piante genitrici e per il primo seme, sono ciò che la foresta vede.',
  population: 'Un campo di varietà mescolate: metà degli alleli della forma sono R e metà r, lo stesso per il colore (Y e y). Le piante da incrociare sono scelte a caso e impollinate a mano.',
  alleles: [
    'Qui i geni sono due, uno per la forma e uno per il colore, ciascuno con due alleli. Forma: R (liscio) domina su r (rugoso). Colore: Y (giallo) domina su y (verde).',
    'Una pianta liscia può essere RR oppure Rr; una rugosa è sempre rr. Una gialla può essere YY oppure Yy; una verde è sempre yy.',
    'I due geni si trasmettono in modo indipendente: quale allele della forma passa al seme non influisce su quale allele del colore passa. È la terza legge di Mendel.',
  ],
  laws: [
    { id: 'L1', text: 'Rugoso × rugoso: nascono solo semi rugosi.', prem: (m, f) => !liscio(m) && !liscio(f), forb: z => liscio(z), why: 'Rugoso è recessivo: una pianta rugosa è rr. Due piante rr passano solo r, e ogni seme è rr.' },
    { id: 'L2', text: 'Verde × verde: nascono solo semi verdi.', prem: (m, f) => !giallo(m) && !giallo(f), forb: z => giallo(z), why: 'Verde è recessivo: una pianta verde è yy. Due piante yy passano solo y.' },
    { id: 'L3', text: 'Rugoso verde × rugoso verde: nascono solo semi rugosi verdi.', prem: (m, f) => m === 3 && f === 3, forb: z => z !== 3, why: 'Entrambe le piante sono rr yy: possono passare solo r e y.' },
    { id: 'L4', text: 'Liscio × liscio: nascono solo semi lisci.', prem: (m, f) => liscio(m) && liscio(f), forb: z => !liscio(z), why: 'Falsa: due piante lisce possono essere entrambe Rr. Allora un seme su quattro è rr, rugoso.' },
    { id: 'L5', text: 'Giallo × giallo: nascono solo semi gialli.', prem: (m, f) => giallo(m) && giallo(f), forb: z => !giallo(z), why: 'Falsa: due piante Yy hanno un seme verde (yy) su quattro.' },
    { id: 'L6', text: 'Se un genitore è rugoso verde, non nasce mai un seme liscio giallo.', prem: (m, f) => m === 3 || f === 3, forb: z => z === 0, why: 'Falsa: rr yy × Rr Yy (o × RR YY) dà semi Rr Yy, lisci e gialli.' },
    { id: 'L7', text: 'Liscio giallo × liscio giallo: non nasce mai un seme rugoso verde.', prem: (m, f) => m === 0 && f === 0, forb: z => z === 3, why: 'Falsa: Rr Yy × Rr Yy dà un seme rr yy su sedici.' },
  ],
  ratios: [
    { locus: 0, id: 'R1', text: 'Forma · liscio × liscio, quando il primo seme è rugoso', cond: (m, f, c) => liscio(m) && liscio(f) && !liscio(c), classes: [[0, 1], [2, 3]], names: ['liscio', 'rugoso'], why: 'Il seme rugoso dimostra che entrambe le piante sono Rr. Rr × Rr dà RR, Rr, rR, rr: tre lisci e un rugoso.' },
    { locus: 0, id: 'R2', text: 'Forma · liscio × rugoso, quando il primo seme è rugoso', cond: (m, f, c) => liscio(m) !== liscio(f) && !liscio(c), classes: [[0, 1], [2, 3]], names: ['liscio', 'rugoso'], why: 'La pianta liscia è Rr (ha passato una r). Rr × rr dà Rr e rr in parti uguali.' },
    { locus: 1, id: 'R3', text: 'Colore · giallo × giallo, quando il primo seme è verde', cond: (m, f, c) => giallo(m) && giallo(f) && !giallo(c), classes: [[0, 2], [1, 3]], names: ['giallo', 'verde'], why: 'Entrambe le piante sono Yy. Yy × Yy dà tre gialli e un verde.' },
    { locus: 1, id: 'R4', text: 'Colore · giallo × verde, quando il primo seme è verde', cond: (m, f, c) => giallo(m) !== giallo(f) && !giallo(c), classes: [[0, 2], [1, 3]], names: ['giallo', 'verde'], why: 'La pianta gialla è Yy. Yy × yy dà gialli e verdi in parti uguali.' },
    { id: 'R5', text: 'Forma e colore · liscio giallo × liscio giallo, quando il primo seme è rugoso verde', cond: (m, f, c) => m === 0 && f === 0 && c === 3, classes: [[0], [1], [2], [3]], why: 'Entrambe le piante sono Rr Yy. Forma 3:1 e colore 3:1, indipendenti: 9 lisci gialli, 3 lisci verdi, 3 rugosi gialli, 1 rugoso verde su 16.' },
  ],
  traits: [
    { bit: 0, label: 'la forma', name: 'forma' },
    { bit: 1, label: 'il colore', name: 'colore' },
  ],
  independence: 'Nei piselli forma e colore dipendono da due geni diversi, che si separano indipendentemente nella formazione dei gameti. Il colore delle piante genitrici non dice nulla sulla forma dei semi, e viceversa.',
  deduction: {
    title: 'La terza legge di Mendel.',
    text: 'Forma e colore non si informano a vicenda: la sorpresa risparmiata è esattamente zero. Da qui Mendel può fare il passo decisivo: se la forma segue il 3:1 e il colore segue il 3:1, e i due sono indipendenti, allora insieme devono dare (3:1) × (3:1) = 9 lisci gialli : 3 lisci verdi : 3 rugosi gialli : 1 rugoso verde.',
    a: 'R1', b: 'R3', result: '9:3:3:1', needIndependent: true, direct: 'R5', directLabel: 'due piante liscio giallo con un primo seme rugoso verde',
  },
};


// ---------------------------------------------------------------- Cresta dei polli (0 noce, 1 rosa, 2 pisello, 3 semplice)
const tRosa = k => k === 0 || k === 1;
const tPisello = k => k === 0 || k === 2;

const polli = {
  key: 'polli',
  title: 'Cresta dei polli',
  lead: 'Incroci di polli: la forma della cresta della gallina, del gallo, del primo pulcino e del secondo pulcino.',
  words: { g: 'm', deiGenitori: 'dei genitori', individuo: 'pollo', famiglia: 'incrocio', famiglie: 'incroci', genitori: 'genitori', genitore: 'genitore', madre: 'gallina', padre: 'gallo', primo: 'primo pulcino', secondo: 'secondo pulcino', secondi: 'secondi pulcini', figli: 'pulcini', figlio: 'pulcino', incrocio: 'incrocio' },
  loci: [
    { name: 'gene della cresta a rosa', alleles: ['R', 'r'], freq: [0.4, 0.6] },
    { name: 'gene della cresta a pisello', alleles: ['P', 'p'], freq: [0.4, 0.6] },
  ],
  phenotypes: ['noce', 'rosa', 'pisello', 'semplice'],
  colors: ['#8a5a3c', '#c9567a', '#6d8f3e', '#8f9993'],
  pheno: g => { const R = g[0].includes(0), P = g[1].includes(0); return R && P ? 0 : R ? 1 : P ? 2 : 3; },
  obs: [
    { label: 'tratto «rosa» della cresta', yes: 'ha il tratto rosa', no: 'non ha il tratto rosa', short: 'rosa' },
    { label: 'tratto «pisello» della cresta', yes: 'ha il tratto pisello', no: 'non ha il tratto pisello', short: 'pisello' },
  ],
  bits: k => [tRosa(k), tPisello(k)],
  observation: 'Mendel guarda la cresta di ogni pollo e riconosce due tratti. Il tratto «rosa»: cresta bassa e larga, coperta di piccole punte. Il tratto «pisello»: tre file parallele di piccole creste. Se un pollo li mostra entrambi la cresta prende la forma di un gheriglio di noce; se non ne mostra nessuno ha la cresta semplice, a lama dentellata. Le due risposte sì/no (tratto rosa? tratto pisello?) di gallina, gallo e primo pulcino sono ciò che vede la foresta.',
  population: 'Un allevamento di razze mescolate: il 40% degli alleli del primo gene è R e il 60% r; lo stesso per il secondo (P 40%, p 60%). Galli e galline si accoppiano a caso.',
  alleles: [
    'I geni sono due. R (tratto rosa) domina su r; P (tratto pisello) domina su p.',
    'R_ pp dà la cresta a rosa, rr P_ la cresta a pisello, rr pp la cresta semplice. Quando ci sono entrambi (R_ P_) i due tratti si combinano in una forma nuova: la cresta a noce.',
    'È il caso studiato da William Bateson e Reginald Punnett nel 1905, lo stesso Punnett del quadrato: la prima prova che due geni possono collaborare a un solo carattere. I due geni si trasmettono in modo indipendente, come forma e colore nei piselli.',
  ],
  laws: [
    { id: 'L1', text: 'Semplice × semplice: nascono solo pulcini con la cresta semplice.', prem: (m, f) => m === 3 && f === 3, forb: z => z !== 3, why: 'Entrambi i genitori sono rr pp: possono passare solo r e p.' },
    { id: 'L2', text: 'Rosa × rosa: non nasce mai un pulcino con il tratto pisello.', prem: (m, f) => m === 1 && f === 1, forb: z => tPisello(z), why: 'Una cresta a rosa è R_ pp. Due genitori pp passano solo p: nessun pulcino ha il tratto pisello.' },
    { id: 'L3', text: 'Pisello × pisello: non nasce mai un pulcino con il tratto rosa.', prem: (m, f) => m === 2 && f === 2, forb: z => tRosa(z), why: 'Una cresta a pisello è rr P_. Due genitori rr passano solo r.' },
    { id: 'L4', text: 'Un pulcino a noce nasce solo se i genitori, insieme, mostrano sia il tratto rosa sia il tratto pisello.', prem: (m, f) => !(tRosa(m) || tRosa(f)) || !(tPisello(m) || tPisello(f)), forb: z => z === 0, why: 'Il pulcino a noce deve ricevere almeno un R e almeno un P. Chi porta R mostra il tratto rosa, chi porta P il tratto pisello.' },
    { id: 'L5', text: 'Rosa × pisello: nascono solo pulcini a rosa o a pisello.', prem: (m, f) => eq(m, f, 1, 2), forb: z => z === 0 || z === 3, why: 'Falsa, ed è la sorpresa di Bateson: RR pp × rr PP dà solo Rr Pp, cresta a noce, una forma che nessuno dei genitori mostrava. Con genitori eterozigoti nascono anche creste semplici.' },
    { id: 'L6', text: 'Noce × noce: nascono solo pulcini a noce.', prem: (m, f) => m === 0 && f === 0, forb: z => z !== 0, why: 'Falsa: Rr Pp × Rr Pp dà tutti e quattro i tipi di cresta.' },
    { id: 'L7', text: 'Se un genitore ha la cresta semplice, non nasce mai un pulcino a noce.', prem: (m, f) => m === 3 || f === 3, forb: z => z === 0, why: 'Falsa: rr pp × RR PP dà solo pulcini Rr Pp, a noce.' },
  ],
  ratios: [
    { locus: 0, id: 'R1', text: 'Tratto rosa · entrambi i genitori con il tratto, quando il primo pulcino non ce l’ha', cond: (m, f, c) => tRosa(m) && tRosa(f) && !tRosa(c), classes: [[0, 1], [2, 3]], names: ['con tratto rosa', 'senza'], why: 'Il pulcino senza tratto rosa (rr) dimostra che entrambi i genitori sono Rr. Rr × Rr: tre pulcini con il tratto e uno senza.' },
    { locus: 0, id: 'R2', text: 'Tratto rosa · un solo genitore con il tratto, quando il primo pulcino non ce l’ha', cond: (m, f, c) => tRosa(m) !== tRosa(f) && !tRosa(c), classes: [[0, 1], [2, 3]], names: ['con tratto rosa', 'senza'], why: 'Il genitore con il tratto è Rr. Rr × rr dà metà pulcini con il tratto e metà senza.' },
    { locus: 1, id: 'R3', text: 'Tratto pisello · entrambi i genitori con il tratto, quando il primo pulcino non ce l’ha', cond: (m, f, c) => tPisello(m) && tPisello(f) && !tPisello(c), classes: [[0, 2], [1, 3]], names: ['con tratto pisello', 'senza'], why: 'Entrambi i genitori sono Pp: tre pulcini con il tratto e uno senza.' },
    { locus: 1, id: 'R4', text: 'Tratto pisello · un solo genitore con il tratto, quando il primo pulcino non ce l’ha', cond: (m, f, c) => tPisello(m) !== tPisello(f) && !tPisello(c), classes: [[0, 2], [1, 3]], names: ['con tratto pisello', 'senza'], why: 'Pp × pp dà metà pulcini con il tratto e metà senza.' },
    { id: 'R5', text: 'Noce × noce, quando il primo pulcino ha la cresta semplice', cond: (m, f, c) => m === 0 && f === 0 && c === 3, classes: [[0], [1], [2], [3]], why: 'Entrambi i genitori sono Rr Pp: 9 noce, 3 rosa, 3 pisello, 1 semplice su 16.' },
  ],
  traits: [
    { bit: 0, label: 'il tratto rosa', name: 'tratto rosa' },
    { bit: 1, label: 'il tratto pisello', name: 'tratto pisello' },
  ],
  independence: 'Il tratto rosa e il tratto pisello dipendono da due geni diversi che si separano indipendentemente: sapere se i genitori hanno il tratto pisello non dice nulla sul tratto rosa del pulcino.',
  deduction: {
    title: 'Due geni, una cresta nuova.',
    text: 'I due tratti non si informano a vicenda. Se il tratto rosa segue il 3:1 e il tratto pisello segue il 3:1, insieme devono dare (3:1) × (3:1) = 9 noce : 3 rosa : 3 pisello : 1 semplice. È il rapporto che Bateson e Punnett trovarono nel 1905: la cresta a noce non è un terzo gene, ma l’incontro di due.',
    a: 'R1', b: 'R3', result: '9:3:3:1', needIndependent: true, direct: 'R5', directLabel: 'gallina e gallo a noce con un primo pulcino a cresta semplice',
  },
};

// ---------------------------------------------------------------- Mantello del Labrador (0 nero, 1 cioccolato, 2 giallo)
const labrador = {
  key: 'labrador',
  title: 'Mantello del Labrador',
  lead: 'Cucciolate di Labrador: il colore del mantello della madre, del padre, del primo cucciolo e del secondo cucciolo.',
  words: { g: 'f', deiGenitori: 'dei genitori', individuo: 'cane', famiglia: 'cucciolata', famiglie: 'cucciolate', genitori: 'genitori', genitore: 'genitore', madre: 'madre', padre: 'padre', primo: 'primo cucciolo', secondo: 'secondo cucciolo', secondi: 'secondi cuccioli', figli: 'cuccioli', figlio: 'cucciolo', incrocio: 'coppia' },
  loci: [
    { name: 'gene del nero (B)', alleles: ['B', 'b'], freq: [0.6, 0.4] },
    { name: 'gene del pigmento (E)', alleles: ['E', 'e'], freq: [0.6, 0.4] },
  ],
  phenotypes: ['nero', 'cioccolato', 'giallo'],
  colors: ['#2b2b2b', '#6b4226', '#c79a3e'],
  pheno: g => (!g[1].includes(0) ? 2 : g[0].includes(0) ? 0 : 1),
  obs: [
    { label: 'mantello scuro', yes: 'è scuro (nero o cioccolato)', no: 'è giallo', short: 'scuro' },
    { label: 'mantello nero', yes: 'è nero', no: 'non è nero', short: 'nero' },
  ],
  bits: k => [k !== 2, k === 0],
  observation: 'Mendel guarda il colore del mantello: nero, cioccolato (marrone) o giallo (dal crema al rosso volpe). Per ogni cane annota due risposte sì/no: il mantello è scuro (nero o cioccolato)? ed è proprio nero? Per madre, padre e primo cucciolo sono queste sei risposte che vede la foresta.',
  population: 'Un allevamento di Labrador: il 60% degli alleli del gene del nero è B e il 40% b; il 60% degli alleli del gene del pigmento è E e il 40% e. Gli accoppiamenti sono casuali.',
  alleles: [
    'I geni sono due. Il gene B decide il colore del pigmento: B (nero) domina su b (cioccolato). Il gene E decide se il pigmento arriva nel pelo: E domina su e.',
    'Un cane ee è giallo qualunque siano i suoi alleli B: il gene E «copre» il gene B. Si chiama epistasi. Con almeno una E, B_ è nero e bb è cioccolato.',
    'I due geni si separano indipendentemente, ma nei colori non si vede: un cane giallo nasconde i suoi alleli B, e un giallo incrociato con un cioccolato può avere cuccioli tutti neri.',
  ],
  laws: [
    { id: 'L1', text: 'Giallo × giallo: nascono solo cuccioli gialli.', prem: (m, f) => m === 2 && f === 2, forb: z => z !== 2, why: 'Un cane giallo è ee. Due genitori ee passano solo e: ogni cucciolo è ee, giallo.' },
    { id: 'L2', text: 'Cioccolato × cioccolato: non nasce mai un cucciolo nero.', prem: (m, f) => m === 1 && f === 1, forb: z => z === 0, why: 'Un cane cioccolato è bb. Due genitori bb passano solo b: nessun cucciolo è B_, quindi nessuno è nero.' },
    { id: 'L3', text: 'Un cucciolo nero ha sempre almeno un genitore nero.', prem: (m, f) => m !== 0 && f !== 0, forb: z => z === 0, why: 'Falsa, ed è l’effetto dell’epistasi: un giallo BB ee e un cioccolato bb EE hanno cuccioli Bb Ee, tutti neri.' },
    { id: 'L4', text: 'Cioccolato × cioccolato: nascono solo cuccioli cioccolato.', prem: (m, f) => m === 1 && f === 1, forb: z => z !== 1, why: 'Falsa: bb Ee × bb Ee dà un cucciolo bb ee, giallo, su quattro.' },
    { id: 'L5', text: 'Nero × nero: nascono solo cuccioli neri.', prem: (m, f) => m === 0 && f === 0, forb: z => z !== 0, why: 'Falsa: Bb Ee × Bb Ee dà anche cuccioli cioccolato (bb E_) e gialli (ee).' },
    { id: 'L6', text: 'Se un genitore è nero, non nasce mai un cucciolo giallo.', prem: (m, f) => m === 0 || f === 0, forb: z => z === 2, why: 'Falsa: un nero Ee con un giallo ee ha cuccioli gialli nella metà dei casi.' },
  ],
  ratios: [
    { locus: 1, id: 'R1', text: 'Pigmento · scuro × scuro, quando il primo cucciolo è giallo', cond: (m, f, c) => m !== 2 && f !== 2 && c === 2, classes: [[0, 1], [2]], names: ['scuro', 'giallo'], why: 'Il cucciolo giallo (ee) dimostra che entrambi i genitori sono Ee. Ee × Ee: tre cuccioli scuri e uno giallo.' },
    { locus: 1, id: 'R2', text: 'Pigmento · scuro × giallo, quando il primo cucciolo è giallo', cond: (m, f, c) => (m !== 2) !== (f !== 2) && c === 2, classes: [[0, 1], [2]], names: ['scuro', 'giallo'], why: 'Il genitore scuro è Ee. Ee × ee dà metà cuccioli scuri e metà gialli.' },
    { locus: 0, id: 'R3', text: 'Nero o cioccolato · nero × nero, quando il primo cucciolo è cioccolato (si contano solo i cuccioli scuri)', cond: (m, f, c) => m === 0 && f === 0 && c === 1, classes: [[0], [1]], why: 'Il cucciolo cioccolato (bb) dimostra che entrambi i genitori sono Bb. Tra i cuccioli scuri, Bb × Bb dà tre neri e un cioccolato; i gialli dipendono dall’altro gene e non si contano.' },
    { locus: 0, id: 'R4', text: 'Nero o cioccolato · nero × cioccolato, quando il primo cucciolo è cioccolato (solo cuccioli scuri)', cond: (m, f, c) => eq(m, f, 0, 1) && c === 1, classes: [[0], [1]], why: 'Il genitore nero è Bb. Tra i cuccioli scuri, Bb × bb dà neri e cioccolato in parti uguali.' },
  ],
  traits: [
    { bit: 0, label: 'il pigmento (scuro o giallo)', name: 'scuro o giallo' },
    { bit: 1, label: 'il nero', name: 'nero o no' },
  ],
  independence: 'Qui i due geni sono indipendenti, ma i due caratteri osservati non del tutto: un genitore «non nero» può essere cioccolato (porta b ma ha il pigmento) oppure giallo (non mostra il pigmento e può nascondere B). Per prevedere se il cucciolo sarà nero, sapere quale dei due è aiuterebbe. È l’impronta dell’epistasi: l’effetto di un gene dipende dall’altro. L’aiuto però è piccolo, perché i cani cioccolato sono pochi.',
  deduction: {
    title: 'L’impronta dell’epistasi.',
    text: 'Il pigmento segue il 3:1 (scuri : gialli) e, tra i cuccioli scuri, il nero segue il 3:1 (neri : cioccolato). Se i due geni si separano indipendentemente, da due genitori Bb Ee nascono 3/4 × 3/4 = 9 neri, 1/4 × 3/4 = 3 cioccolato e tutti gli ee, 4 su 16, gialli: il rapporto 9:3:4, il segno classico dell’epistasi.',
    a: 'R1', b: 'R3', result: '9:3:4', needIndependent: false, direct: null,
  },
};

// ---------------------------------------------------------------- Mantello del coniglio, serie dell'albinismo (0 pieno, 1 cincillà, 2 himalayano, 3 albino)
const conigli = {
  key: 'conigli',
  title: 'Mantello dei conigli',
  lead: 'Cucciolate di conigli: colore pieno, cincillà, himalayano o albino per la madre, il padre, i primi quattro coniglietti e il quinto.',
  litter: 4,
  words: { g: 'f', deiGenitori: 'dei genitori', individuo: 'coniglio', famiglia: 'cucciolata', famiglie: 'cucciolate', genitori: 'genitori', genitore: 'genitore', madre: 'madre', padre: 'padre', primo: 'primi quattro coniglietti', secondo: 'quinto coniglietto', secondi: 'quinti coniglietti', figli: 'coniglietti', figlio: 'coniglietto', incrocio: 'coppia' },
  loci: [{ name: 'gene C (serie dell’albinismo)', alleles: ['C', 'cchd', 'ch', 'c'], freq: [0.25, 0.2, 0.2, 0.35] }],
  phenotypes: ['pieno', 'cincillà', 'himalayano', 'albino'],
  colors: ['#2E2B28', '#8F8C86', '#D9CFC2', '#F4EFE6'],
  // L'allele più in alto nella scala di dominanza decide il mantello.
  pheno: g => Math.min(g[0][0], g[0][1]),
  obs: [
    { label: 'corpo colorato', yes: 'ha il corpo colorato', no: 'ha il corpo bianco', short: 'corpo colorato' },
    { label: 'colore scuro intenso', yes: 'ha colore scuro intenso (su tutto il corpo o sulle punte)', no: 'non ha colore scuro intenso', short: 'scuro intenso' },
  ],
  bits: k => [k <= 1, k === 0 || k === 2],
  observation: 'Di ogni coniglio Mendel guarda il mantello e risponde a due domande. Il corpo è colorato? (sì per il colore pieno e per il cincillà, grigio argento; no per l’himalayano e l’albino, che hanno il corpo bianco). C’è colore scuro intenso? (sì per il colore pieno, su tutto il corpo, e per l’himalayano, solo su orecchie, naso e zampe; no per il cincillà e l’albino). La foresta riceve le quattro risposte di madre e padre e, per i primi quattro coniglietti della cucciolata, quanti ce ne sono di ciascun tipo: deve prevedere il mantello del quinto.',
  population: 'Un allevamento misto: il 25% degli alleli è C, il 20% cchd, il 20% ch e il 35% c. Ne risultano circa 44% di conigli a colore pieno, 26% cincillà, 18% himalayani e 12% albini. Le coppie si formano a caso e ogni cucciolata ha almeno cinque piccoli. Sono gli albini a svelare gli alleli nascosti.',
  alleles: [
    'Il mantello dipende da un solo gene con quattro alleli, disposti in una scala di dominanza: C (colore pieno) > cchd (cincillà) > ch (himalayano) > c (albino). Ogni coniglio ne porta due e si vede quello più in alto nella scala.',
    'Così un coniglio a colore pieno può nascondere uno qualunque degli altri tre alleli, un cincillà può nascondere ch o c, un himalayano può nascondere c; solo l’albino è sempre c c.',
    'È diverso dai gruppi sanguigni: anche lì c’è un solo gene con più alleli, ma A e B sono codominanti e si vedono insieme (AB). Qui invece vince sempre uno solo, e nascono coniglietti diversi da entrambi i genitori solo quando un allele nascosto viene allo scoperto.',
  ],
  laws: [
    { id: 'L1', text: 'Due genitori a corpo bianco (himalayani o albini) hanno solo coniglietti a corpo bianco.', prem: (m, f) => m >= 2 && f >= 2, forb: z => z <= 1, why: 'Himalayani e albini portano solo ch e c: nessuno dei due può passare C o cchd, gli alleli che colorano il corpo.' },
    { id: 'L2', text: 'Pieno × pieno: nascono solo coniglietti a colore pieno.', prem: (m, f) => m === 0 && f === 0, forb: z => z !== 0, why: 'Falsa: due genitori C c hanno un coniglietto c c, albino, su quattro; C cchd × C ch può dare un cincillà.' },
    { id: 'L3', text: 'Un coniglietto a colore pieno ha sempre almeno un genitore a colore pieno.', prem: (m, f) => m !== 0 && f !== 0, forb: z => z === 0, why: 'L’allele C deve arrivare da un genitore, e chi porta C ha sempre il colore pieno perché C sta in cima alla scala.' },
    { id: 'L4', text: 'Cincillà × himalayano: non nasce mai un coniglietto a colore pieno.', prem: (m, f) => eq(m, f, 1, 2), forb: z => z === 0, why: 'Nessuno dei due genitori porta C.' },
    { id: 'L5', text: 'Himalayano × himalayano: nascono solo himalayani.', prem: (m, f) => m === 2 && f === 2, forb: z => z !== 2, why: 'Falsa: ch c × ch c dà un coniglietto c c, albino, su quattro.' },
    { id: 'L6', text: 'Pieno × albino: i coniglietti sono sempre a colore pieno oppure albini, come uno dei genitori.', prem: (m, f) => eq(m, f, 0, 3), forb: z => z === 1 || z === 2, why: 'Falsa: C cchd × c c dà anche cchd c, cincillà, un mantello che nessuno dei due genitori mostra.' },
    { id: 'L7', text: 'Cincillà × cincillà: nascono solo cincillà.', prem: (m, f) => m === 1 && f === 1, forb: z => z !== 1, why: 'Falsa: cchd ch × cchd ch dà un coniglietto ch ch, himalayano, su quattro.' },
  ],
  ratios: [
    { id: 'R1', text: 'Pieno × albino, quando tra i primi quattro c’è un albino', cond: (m, f, c, sibs) => eq(m, f, 0, 3) && sibs.includes(3), classes: [[0], [3]], why: 'Il coniglietto albino dimostra che il genitore pieno è C c. C c × c c: metà pieni e metà albini.' },
    { id: 'R2', text: 'Pieno × pieno, quando tra i primi quattro c’è un albino', cond: (m, f, c, sibs) => m === 0 && f === 0 && sibs.includes(3), classes: [[0], [3]], why: 'Entrambi i genitori sono C c. C c × C c: tre pieni e un albino.' },
    { id: 'R3', text: 'Himalayano × himalayano, quando tra i primi quattro c’è un albino', cond: (m, f, c, sibs) => m === 2 && f === 2 && sibs.includes(3), classes: [[2], [3]], why: 'Entrambi sono ch c. ch c × ch c: tre himalayani e un albino.' },
    { id: 'R4', text: 'Cincillà × albino, quando tra i primi quattro c’è un albino', cond: (m, f, c, sibs) => eq(m, f, 1, 3) && sibs.includes(3), classes: [[1], [3]], why: 'Il genitore cincillà è cchd c. cchd c × c c: metà cincillà e metà albini.' },
    { id: 'R5', text: 'Himalayano × albino, quando tra i primi quattro c’è un albino', cond: (m, f, c, sibs) => eq(m, f, 2, 3) && sibs.includes(3), classes: [[2], [3]], why: 'Il genitore himalayano è ch c. ch c × c c: metà himalayani e metà albini.' },
    { id: 'R6', text: 'Cincillà × himalayano, quando tra i primi quattro c’è un albino', cond: (m, f, c, sibs) => eq(m, f, 1, 2) && sibs.includes(3), classes: [[1], [2], [3]], why: 'I genitori sono cchd c e ch c. Nascono cchd ch e cchd c (cincillà), ch c (himalayano), c c (albino): 2 : 1 : 1.' },
    { id: 'R7', text: 'Pieno × himalayano, quando tra i primi quattro c’è un albino', cond: (m, f, c, sibs) => eq(m, f, 0, 2) && sibs.includes(3), classes: [[0], [2], [3]], why: 'I genitori sono C c e ch c. Nascono C ch e C c (pieni), ch c (himalayano), c c (albino): 2 : 1 : 1.' },
  ],
  traits: [
    { bit: 0, label: 'il corpo colorato', name: 'corpo colorato' },
    { bit: 1, label: 'il colore scuro intenso', name: 'scuro intenso' },
  ],
  independence: 'Le due osservazioni dipendono dallo stesso gene: «corpo colorato» e «scuro intenso» sono due modi di guardare lo stesso allele dominante. Sapere che un genitore è himalayano (corpo bianco ma punte scure) dice che porta ch, e cambia le probabilità di entrambe le osservazioni nei figli.',
  finalNote: {
    title: 'Una scala, non due geni.',
    text: 'Nelle esclusioni si vede la struttura del gene: da genitori «più in basso» nella scala non nasce mai un coniglietto «più in alto» (un pieno richiede un genitore pieno, due himalayani non danno mai un cincillà), mentre da genitori «più in alto» possono nascere coniglietti più in basso quando due alleli nascosti si incontrano. È il segno di una serie allelica: un solo gene con più varianti ordinate. I rapporti 2:1:1 lo confermano: tre tipi diversi da una sola coppia, cosa impossibile con due soli alleli. I rapporti si vedono solo nelle cucciolate in cui è già nato un albino, che svela gli alleli nascosti dei genitori. Con un solo fratello conosciuto erano rarissime; con quattro coniglietti già nati diventano abbastanza da riconoscere quasi tutti i rapporti con i dati completi. Anche la foresta ne approfitta: le combinazioni tra genitori e cucciolate sono moltissime, la tabella di conteggio ne vede solo una piccola parte, e qui la foresta la batte più che in qualunque altro scenario.',
  },
};

// ---------------------------------------------------------------- Gatti, gene arancio sul cromosoma X
// 0 nero, 1 blu, 2 rosso, 3 crema, 4 tartarugata, 5 tartarugata diluita
const gRosso = k => k >= 2;
const gNero = k => k <= 1 || k >= 4;
const gDil = k => k % 2 === 1;
const gatti = {
  key: 'gatti',
  title: 'Gatti tartarugati',
  lead: 'Cucciolate di gatti: nero, blu, rosso, crema o tartarugato per la gatta madre, il gatto padre, il primo e il secondo gattino.',
  ordered: true,
  words: { g: 'f', deiGenitori: 'dei genitori', individuo: 'gatto', famiglia: 'cucciolata', famiglie: 'cucciolate', genitori: 'genitori', genitore: 'genitore', madre: 'gatta madre', padre: 'gatto padre', primo: 'primo gattino', secondo: 'secondo gattino', secondi: 'secondi gattini', figli: 'gattini', figlio: 'gattino', incrocio: 'coppia' },
  loci: [
    { name: 'gene O (arancio), sul cromosoma X', alleles: ['O', 'n'], freq: [0.3, 0.7], x: true },
    { name: 'gene D (diluizione)', alleles: ['D', 'd'], freq: [0.6, 0.4] },
  ],
  phenotypes: ['nero', 'blu', 'rosso', 'crema', 'tartarugata', 'tartarugata diluita'],
  colors: ['#2b2b2b', '#7b8794', '#c8692a', '#e6c296', '#4a3426', '#a39184'],
  patches: { 4: ['#2b2b2b', '#c8692a'], 5: ['#7b8794', '#e6c296'] },
  pheno: g => {
    const [a, b] = g[0], dil = g[1][0] === 1 && g[1][1] === 1 ? 1 : 0;
    const male = b > 1;
    const orange = male ? a === 0 : a === 0 && b === 0;
    const tortie = !male && a !== b;
    return (tortie ? 4 : orange ? 2 : 0) + dil;
  },
  obs: [
    { label: 'pelo rosso', yes: 'ha pelo rosso o crema', no: 'non ha pelo rosso', short: 'rosso' },
    { label: 'pelo nero', yes: 'ha pelo nero o blu', no: 'non ha pelo nero', short: 'nero' },
    { label: 'colore diluito', yes: 'ha il colore diluito (blu, crema)', no: 'ha il colore intenso', short: 'diluito' },
  ],
  bits: k => [gRosso(k), gNero(k), gDil(k)],
  observation: 'Di ogni gatto Mendel guarda il pelo e risponde a tre domande. C’è pelo rosso (arancio, o crema se tenue)? C’è pelo nero (o blu, cioè grigio, se tenue)? Il colore è diluito, cioè tenue? Un gatto tartarugato risponde sì alle prime due: ha il mantello a chiazze rosse e nere. Queste nove risposte, per gatta madre, gatto padre e primo gattino, sono ciò che vede la foresta. Il sesso dei gattini non viene annotato.',
  population: 'Una colonia di gatti di casa: il 30% dei cromosomi X porta l’allele arancio O, il 70% l’allele non arancio n; per la diluizione, D 60% e d 40%. Gatte e gatti si accoppiano a caso.',
  alleles: [
    'Il gene O sta sul cromosoma X. Le femmine hanno due X, i maschi una X e una Y, che non porta il gene: si scrive per esempio O n per una femmina, O Y per un maschio. Un maschio mostra quindi sempre il colore della sua unica X: rosso se la sua X porta O, nero se porta n (non arancio).',
    'Una femmina O n è tartarugata: in ogni zona della pelle una delle due X si spegne a caso, e il pelo nasce rosso o nero a chiazze. Per questo i gatti tartarugati sono quasi sempre femmine, e la madre qui può esserlo mentre il padre no.',
    'Il figlio maschio riceve la X dalla madre e la Y dal padre; la figlia riceve una X da ciascuno. È l’ereditarietà «incrociata»: i maschi prendono il colore dalla madre. Il gene D, invece, è su un cromosoma comune (autosoma): d d diluisce il nero in blu e il rosso in crema.',
  ],
  laws: [
    { id: 'L1', text: 'Se la madre non ha pelo rosso, non nasce mai un gattino tutto rosso o crema.', prem: m => !gRosso(m), forb: z => z === 2 || z === 3, why: 'La madre n n passa solo n. Un maschio riceve la sua unica X da lei ed è nero o blu; una femmina riceve da lei un allele n e al massimo è tartarugata.' },
    { id: 'L2', text: 'Se il padre non ha pelo rosso, non nasce mai un gattino tutto rosso o crema.', prem: (m, f) => !gRosso(f), forb: z => z === 2 || z === 3, why: 'Falsa, ed è l’asimmetria dei sessi: una madre tartarugata O n passa O a metà dei figli maschi, che sono rossi qualunque sia il padre.' },
    { id: 'L3', text: 'Madre e padre senza pelo rosso: nessun gattino ha pelo rosso.', prem: (m, f) => !gRosso(m) && !gRosso(f), forb: z => gRosso(z), why: 'Nessuno dei due genitori porta O: nessun gattino può riceverla.' },
    { id: 'L4', text: 'Madre rossa × padre nero: nessun gattino è nero o blu.', prem: (m, f) => m === 2 && f === 0, forb: z => z === 0 || z === 1, why: 'I maschi ricevono O dalla madre e sono rossi o crema; le femmine ricevono O dalla madre e n dal padre e sono tartarugate.' },
    { id: 'L5', text: 'Madre tartarugata × padre rosso: non nasce mai un gattino nero.', prem: (m, f) => m === 4 && f === 2, forb: z => z === 0, why: 'Falsa: la madre O n passa n a metà dei figli maschi, che sono neri (o blu).' },
    { id: 'L6', text: 'Nero × nero: nascono solo gattini neri.', prem: (m, f) => m === 0 && f === 0, forb: z => z !== 0, why: 'Falsa: due genitori neri D d hanno un gattino d d, blu, su quattro.' },
    { id: 'L7', text: 'Due genitori diluiti: nascono solo gattini diluiti.', prem: (m, f) => gDil(m) && gDil(f), forb: z => !gDil(z), why: 'I genitori diluiti sono d d: passano solo d, e ogni gattino è d d.' },
  ],
  ratios: [
    { locus: 0, id: 'R1', text: 'Rosso · madre tartarugata × padre nero o blu', cond: (m, f) => (m === 4 || m === 5) && (f === 0 || f === 1), classes: [[4, 5], [0, 1], [2, 3]], names: ['tartarugato', 'nero o blu', 'rosso o crema'], why: 'Figlie: O oppure n dalla madre, n dal padre, quindi tartarugate o nere. Figli: O oppure n dalla madre e la Y, quindi rossi o neri. Su quattro gattini: 1 tartarugato, 2 neri, 1 rosso.' },
    { locus: 0, id: 'R2', text: 'Rosso · madre nera o blu × padre rosso o crema', cond: (m, f) => (m === 0 || m === 1) && (f === 2 || f === 3), classes: [[4, 5], [0, 1]], names: ['tartarugato', 'nero o blu'], why: 'Le figlie ricevono n dalla madre e O dal padre: tartarugate. I figli ricevono n dalla madre: neri o blu. Metà e metà.' },
    { locus: 0, id: 'R3', text: 'Rosso · madre rossa o crema × padre nero o blu', cond: (m, f) => (m === 2 || m === 3) && (f === 0 || f === 1), classes: [[4, 5], [2, 3]], names: ['tartarugato', 'rosso o crema'], why: 'L’incrocio inverso: le figlie sono tartarugate, i figli prendono O dalla madre e sono rossi. Metà e metà, ma i gattini non tartarugati ora sono rossi.' },
    { locus: 1, id: 'R4', text: 'Diluizione · due genitori intensi, quando il primo gattino è diluito', cond: (m, f, c) => !gDil(m) && !gDil(f) && gDil(c), classes: [[0, 2, 4], [1, 3, 5]], names: ['intenso', 'diluito'], why: 'Il gattino diluito (d d) dimostra che entrambi i genitori sono D d: tre intensi e un diluito.' },
    { locus: 1, id: 'R5', text: 'Diluizione · un genitore intenso e uno diluito, quando il primo gattino è diluito', cond: (m, f, c) => gDil(m) !== gDil(f) && gDil(c), classes: [[0, 2, 4], [1, 3, 5]], names: ['intenso', 'diluito'], why: 'Il genitore intenso è D d: D d × d d dà metà intensi e metà diluiti.' },
  ],
  traits: [
    { bit: 0, own: [0, 1], label: 'il pelo rosso', name: 'pelo rosso' },
    { bit: 2, label: 'la diluizione', name: 'diluizione' },
  ],
  independence: 'Il pelo rosso dipende dal gene O sul cromosoma X, la diluizione dal gene D su un altro cromosoma: sapere se i genitori sono diluiti non dice nulla sul rosso dei gattini, e viceversa.',
  finalNote: {
    title: 'Madre e padre non sono intercambiabili.',
    text: 'Negli scenari con genitori equivalenti per i caratteri studiati, «A × B» e «B × A» hanno le stesse probabilità degli esiti. Nei gatti, come nella drosofila, il ruolo dei genitori conta. Qui le leggi L1 e L2 dicono la stessa cosa scambiando madre e padre, ma la prima è vera e la seconda falsa; i rapporti R2 e R3 sono incroci inversi con risultati diversi. È il segno di un gene sul cromosoma X, lo stesso ragionamento con cui Thomas Morgan nel 1910 collocò sull’X il gene degli occhi bianchi del moscerino. Nel registro, per questo, le coppie sono sempre scritte madre × padre.',
  },
};

// ---------------------------------------------------------------- Topi gialli, allele letale
// 0 giallo, 1 agouti, 2 cannella, 3 nero, 4 marrone
const tGiallo = k => k === 0;
const tBande = k => k === 1 || k === 2;
const tMarrone = k => k === 2 || k === 4;
const topi = {
  key: 'topi',
  title: 'Topi colorati',
  lead: 'Cucciolate di topi: giallo, agouti, cannella, nero o marrone per la madre, il padre, il primo e il secondo topolino.',
  words: { g: 'f', deiGenitori: 'dei genitori', individuo: 'topo', famiglia: 'cucciolata', famiglie: 'cucciolate', genitori: 'genitori', genitore: 'genitore', madre: 'madre', padre: 'padre', primo: 'primo topolino', secondo: 'secondo topolino', secondi: 'secondi topolini', figli: 'topolini', figlio: 'topolino', incrocio: 'coppia' },
  loci: [
    { name: 'gene agouti (A)', alleles: ['Aʸ', 'A', 'a'], freq: [0.3, 0.2, 0.5] },
    { name: 'gene del marrone (B)', alleles: ['B', 'b'], freq: [0.5, 0.5] },
  ],
  phenotypes: ['giallo', 'agouti', 'cannella', 'nero', 'marrone'],
  colors: ['#d9a93a', '#7a6247', '#a8764a', '#262422', '#5b3a26'],
  pheno: g => {
    const [a, b] = g[0], brown = g[1][0] === 1 && g[1][1] === 1;
    if (a === 0 && b === 0) return null; // Aʸ Aʸ: l'embrione non si sviluppa
    if (a === 0) return 0;
    if (a === 1) return brown ? 2 : 1;
    return brown ? 4 : 3;
  },
  obs: [
    { label: 'pelo giallo', yes: 'è giallo', no: 'non è giallo', short: 'giallo' },
    { label: 'pelo a bande', yes: 'ha il pelo a bande (agouti o cannella)', no: 'non ha il pelo a bande', short: 'bande' },
    { label: 'pigmento marrone', yes: 'ha il pigmento marrone (cannella o marrone)', no: 'non ha il pigmento marrone', short: 'marrone' },
  ],
  bits: k => [tGiallo(k), tBande(k), tMarrone(k)],
  observation: 'Di ogni topo Mendel guarda il pelo e risponde a tre domande. È giallo? Ha il pelo «a bande», cioè ogni pelo scuro alla base e chiaro sotto la punta, come il topo selvatico (agouti)? Il pigmento scuro è marrone invece che nero? Il topo giallo risponde sì solo alla prima. Queste nove risposte per madre, padre e primo topolino sono ciò che vede la foresta.',
  population: 'Un allevamento di topi da laboratorio: per il gene agouti il 30% degli alleli è Aʸ (giallo), il 20% A e il 50% a; per il marrone, B e b metà ciascuno. Gli accoppiamenti sono casuali. Tra gli adulti non ci sono Aʸ Aʸ: non nascono mai.',
  alleles: [
    'Il gene agouti ha tre alleli in scala di dominanza: Aʸ (giallo) > A (pelo a bande) > a (colore uniforme). Il gene B decide il pigmento scuro: B (nero) domina su b (marrone). Il giallo copre il pigmento scuro, come il giallo del Labrador.',
    'L’allele Aʸ ha un secondo effetto, nascosto: in doppia dose (Aʸ Aʸ) l’embrione muore nelle prime fasi dello sviluppo. Tutti i topi gialli sono quindi Aʸ A oppure Aʸ a, mai Aʸ Aʸ.',
    'Lo scoprì Lucien Cuénot nel 1905: incrociando gialli con gialli non riusciva mai a ottenere una linea pura di gialli, e i figli gialli non erano i tre quarti attesi ma circa due terzi. È il primo allele letale conosciuto.',
  ],
  laws: [
    { id: 'L1', text: 'Un topolino giallo ha sempre almeno un genitore giallo.', prem: (m, f) => !tGiallo(m) && !tGiallo(f), forb: z => tGiallo(z), why: 'Aʸ è dominante: chi lo porta è giallo. L’allele deve arrivare da un genitore, che quindi è giallo.' },
    { id: 'L2', text: 'Genitori senza pelo a bande e non gialli (neri o marroni): nessun topolino giallo o a bande.', prem: (m, f) => m >= 3 && f >= 3, forb: z => z <= 2, why: 'Neri e marroni sono a a: passano solo a, e ogni topolino è a a.' },
    { id: 'L3', text: 'Due genitori con il pigmento marrone (cannella o marroni): nessun topolino ha il pigmento nero.', prem: (m, f) => tMarrone(m) && tMarrone(f), forb: z => z === 1 || z === 3, why: 'Entrambi i genitori sono b b: passano solo b. I figli possono essere gialli, cannella o marroni, ma mai agouti o neri.' },
    { id: 'L4', text: 'Giallo × giallo: nascono solo topolini gialli.', prem: (m, f) => m === 0 && f === 0, forb: z => z !== 0, why: 'Falsa: i gialli sono tutti eterozigoti (Aʸ A o Aʸ a) e un figlio su tre (tra i nati) non è giallo. Una linea pura di gialli non esiste.' },
    { id: 'L5', text: 'Agouti × agouti: nascono solo topolini agouti.', prem: (m, f) => m === 1 && f === 1, forb: z => z !== 1, why: 'Falsa: A a × A a dà un topolino a a, senza bande, su quattro; B b × B b dà anche cannella.' },
    { id: 'L6', text: 'Giallo × nero: nascono solo topolini gialli o neri.', prem: (m, f) => eq(m, f, 0, 3), forb: z => z !== 0 && z !== 3, why: 'Falsa: un giallo Aʸ A passa A a metà dei figli, che sono agouti; e il giallo può nascondere b, da cui nascono topolini marroni.' },
    { id: 'L7', text: 'Nero × marrone: nascono solo topolini neri o marroni.', prem: (m, f) => eq(m, f, 3, 4), forb: z => z !== 3 && z !== 4, why: 'Entrambi sono a a: i figli sono a a, senza bande e non gialli; il gene B decide solo tra nero e marrone.' },
  ],
  ratios: [
    { locus: 0, id: 'R1', text: 'Giallo · giallo × giallo', cond: (m, f) => m === 0 && f === 0, classes: [[0], [1, 2, 3, 4]], names: ['giallo', 'non giallo'], why: 'Aʸ ? × Aʸ ? dà Aʸ Aʸ, Aʸ ?, ? Aʸ e ? ? in parti uguali. Ma Aʸ Aʸ non nasce: tra i nati restano due gialli e un non giallo, 2 : 1 invece di 3 : 1.' },
    { locus: 0, id: 'R2', text: 'Giallo · giallo × non giallo', cond: (m, f) => tGiallo(m) !== tGiallo(f), classes: [[0], [1, 2, 3, 4]], names: ['giallo', 'non giallo'], why: 'Il genitore giallo è sempre eterozigote e passa Aʸ a metà dei figli: 1 : 1.' },
    { locus: 0, id: 'R3', text: 'Bande · agouti o cannella × agouti o cannella, quando il primo topolino non ha bande', cond: (m, f, c) => tBande(m) && tBande(f) && (c === 3 || c === 4), classes: [[1, 2], [3, 4]], names: ['a bande', 'senza bande'], why: 'Il topolino a a dimostra che entrambi i genitori sono A a: tre con le bande e uno senza.' },
    { locus: 1, id: 'R4', text: 'Pigmento · due genitori con il pigmento nero (agouti o neri), quando il primo topolino ha il pigmento marrone', cond: (m, f, c) => (m === 1 || m === 3) && (f === 1 || f === 3) && tMarrone(c), classes: [[1, 3], [2, 4]], names: ['pigmento nero', 'pigmento marrone'], why: 'Il topolino b b dimostra che entrambi i genitori sono B b: tre con il pigmento nero e uno marrone. Nessuno dei due porta Aʸ, quindi non nascono gialli.' },
    { locus: 0, id: 'R5', text: 'Giallo × agouti, quando il primo topolino è nero o marrone', cond: (m, f, c) => eq(m, f, 0, 1) && (c === 3 || c === 4), classes: [[0], [1, 2], [3, 4]], names: ['giallo', 'a bande', 'senza bande'], why: 'Il topolino a a dimostra che i genitori sono Aʸ a e A a. Nascono Aʸ A e Aʸ a (gialli), A a (a bande), a a (senza bande): 2 : 1 : 1.' },
  ],
  traits: [
    { bit: 0, own: [0, 1], label: 'il giallo', name: 'giallo' },
    { bit: 2, label: 'il pigmento marrone', name: 'marrone' },
  ],
  independence: 'Il giallo e il marrone dipendono da due geni diversi che si separano indipendentemente. Ma il giallo copre il pigmento: un genitore giallo può nascondere b, e sapere che è giallo cambia la probabilità di un figlio marrone. Come nel Labrador, l’epistasi lega i due caratteri osservati anche se i geni sono indipendenti.',
  finalNote: {
    title: 'Il 2 : 1 che non doveva esserci.',
    text: 'Con i dati completi il giallo × giallo dà circa due gialli per ogni non giallo. Mendel conosce il 3 : 1 e l’1 : 1, ma questo non è nessuno dei due. La spiegazione di Cuénot: il quarto mancante sono gli Aʸ Aʸ, che muoiono prima di nascere. Le cucciolate di giallo × giallo sono infatti più piccole di un quarto, e non esiste un topo giallo «puro». È un caso in cui le leggi di Mendel valgono perfettamente, ma la morte di una classe di figli cambia il rapporto che si osserva. Con il solo 20% delle cucciolate, però, la differenza tra due terzi e tre quarti è piccola: in circa metà degli esperimenti Mendel scambia il 2 : 1 per un 3 : 1, lo stesso errore che si poteva fare all’epoca con pochi conteggi.',
  },
};

// ---------------------------------------------------------------- Pisello odoroso, epistasi complementare
// 0 viola lungo, 1 viola tondo, 2 bianco lungo, 3 bianco tondo
const oViola = k => k < 2;
const oLungo = k => k % 2 === 0;
const odoroso = {
  key: 'odoroso',
  title: 'Pisello odoroso',
  lead: 'Incroci di pisello odoroso: colore del fiore e forma del polline delle due piante genitrici e delle piante che si sviluppano dal primo e dal secondo seme.',
  words: { g: 'm', deiGenitori: 'delle piante genitrici', individuo: 'pianta', famiglia: 'incrocio', famiglie: 'incroci', genitori: 'piante genitrici', genitore: 'genitore', madre: 'pianta madre', padre: 'pianta donatrice di polline', primo: 'primo seme', secondo: 'secondo seme', secondi: 'secondi semi', figli: 'semi', figlio: 'seme', incrocio: 'incrocio' },
  loci: [
    { name: 'gene C (colore)', alleles: ['C', 'c'], freq: [0.4, 0.6] },
    { name: 'gene P (porpora)', alleles: ['P', 'p'], freq: [0.4, 0.6] },
    { name: 'gene L (polline lungo)', alleles: ['L', 'l'], freq: [0.5, 0.5] },
  ],
  phenotypes: ['viola, polline lungo', 'viola, polline tondo', 'bianco, polline lungo', 'bianco, polline tondo'],
  colors: ['#7b3f8c', '#a877b5', '#e9e4dc', '#f6f3ee'],
  pheno: g => ((g[0].includes(0) && g[1].includes(0)) ? 0 : 2) + (g[2].includes(0) ? 0 : 1),
  obs: [
    { label: 'fiore viola', yes: 'ha il fiore viola', no: 'ha il fiore bianco', short: 'viola' },
    { label: 'polline lungo', yes: 'ha il polline lungo', no: 'ha il polline tondo', short: 'lungo' },
  ],
  bits: k => [oViola(k), oLungo(k)],
  observation: 'Di ogni pianta Mendel guarda il colore del fiore (viola o bianco) e, al microscopio, la forma dei granuli di polline (allungati o tondi). Queste due risposte sì/no per le due piante genitrici e per il primo seme, una volta cresciuto, sono ciò che vede la foresta.',
  population: 'Un vivaio con varietà mescolate: C e P sono presenti nel 40% degli alleli, L nel 50%. Le piante da incrociare sono scelte a caso.',
  alleles: [
    'Il colore dipende da due geni: il fiore è viola solo se c’è almeno una C e almeno una P. Basta che uno dei due sia in doppia dose recessiva (c c oppure p p) e il fiore resta bianco: ognuno dei due geni fa un passo diverso della stessa catena che produce il pigmento, e se un passo manca il pigmento non c’è.',
    'Per questo due piante bianche possono avere figli viola: una c c P P e una C C p p danno solo C c P p, viola. Lo videro William Bateson e Reginald Punnett nel 1905 e lo chiamarono epistasi complementare.',
    'Il polline dipende da un terzo gene: L (lungo) domina su l (tondo). Nel vero pisello odoroso L sta sullo stesso cromosoma di P ed è proprio lì che Bateson e Punnett videro la prima associazione tra geni; qui lo trattiamo come indipendente, per isolare l’epistasi. L’associazione è il tema dello scenario della drosofila.',
  ],
  laws: [
    { id: 'L1', text: 'Bianco × bianco: nascono solo fiori bianchi.', prem: (m, f) => !oViola(m) && !oViola(f), forb: z => oViola(z), why: 'Falsa, ed è la sorpresa di Bateson: c c P P × C C p p dà solo C c P p, viola.' },
    { id: 'L2', text: 'Viola × bianco: nascono solo fiori viola.', prem: (m, f) => oViola(m) !== oViola(f), forb: z => !oViola(z), why: 'Falsa: C c P P × c c P P dà metà semi c c P P, bianchi.' },
    { id: 'L3', text: 'Viola × viola: nascono solo fiori viola.', prem: (m, f) => oViola(m) && oViola(f), forb: z => !oViola(z), why: 'Falsa: C c P p × C c P p dà 7 bianchi su 16.' },
    { id: 'L4', text: 'Polline tondo × polline tondo: nascono solo piante con il polline tondo.', prem: (m, f) => !oLungo(m) && !oLungo(f), forb: z => oLungo(z), why: 'Il polline tondo è recessivo: due genitori l l passano solo l.' },
    { id: 'L5', text: 'Polline lungo × polline lungo: nascono solo piante con il polline lungo.', prem: (m, f) => oLungo(m) && oLungo(f), forb: z => !oLungo(z), why: 'Falsa: L l × L l dà un seme l l su quattro.' },
    { id: 'L6', text: 'Bianco tondo × bianco tondo: non nasce mai un fiore viola con polline lungo.', prem: (m, f) => m === 3 && f === 3, forb: z => z === 0, why: 'Il fiore viola può nascere, ma il polline lungo no: i due genitori sono l l.' },
  ],
  ratios: [
    { locus: 2, id: 'R1', text: 'Polline · lungo × lungo, quando il primo seme ha il polline tondo', cond: (m, f, c) => oLungo(m) && oLungo(f) && !oLungo(c), classes: [[0, 2], [1, 3]], names: ['lungo', 'tondo'], why: 'Entrambe le piante sono L l: tre lunghi e un tondo.' },
    { locus: 2, id: 'R2', text: 'Polline · lungo × tondo, quando il primo seme ha il polline tondo', cond: (m, f, c) => oLungo(m) !== oLungo(f) && !oLungo(c), classes: [[0, 2], [1, 3]], names: ['lungo', 'tondo'], why: 'La pianta con il polline lungo è L l: metà e metà.' },
  ],
  traits: [
    { bit: 0, label: 'il colore', name: 'colore' },
    { bit: 1, label: 'il polline', name: 'polline' },
  ],
  independence: 'Colore e polline dipendono da geni diversi che, in questo scenario, si separano indipendentemente: la forma del polline dei genitori non dice nulla sul colore dei semi.',
  finalNote: {
    title: 'Due geni per un colore: il 9 : 7.',
    text: 'Per il polline Mendel ritrova i suoi rapporti. Per il colore no: le esclusioni sono tutte false (da due bianchi può nascere un viola) e i rapporti non sono semplici, perché dietro lo stesso fiore bianco si nascondono cinque genotipi diversi e un solo fratello non basta a distinguerli. Il rapporto «vero» dell’epistasi complementare si vede solo con incroci controllati, come fece Bateson: due linee pure bianche (c c P P e C C p p) danno una prima generazione tutta viola, C c P p; incrociando queste piante tra loro nascono 9 viola e 7 bianchi su 16, cioè il 9 : 3 : 3 : 1 in cui le ultime tre classi hanno lo stesso colore. È un limite del metodo di Mendel quando si osservano incroci presi a caso.',
  },
};

// ---------------------------------------------------------------- Drosofila, geni associati sullo stesso cromosoma
// Un solo locus di aplotipi: 0 «+ +», 1 «+ pr», 2 «b +», 3 «b pr» (corpo, occhi).
// Fenotipi: 0 grigio occhi rossi, 1 grigio occhi porpora, 2 nero occhi rossi, 3 nero occhi porpora.
const RECOMB = 0.06;
const hBody = h => h >> 1, hEye = h => h & 1;
const dGrigio = k => k < 2;
const dRossi = k => k % 2 === 0;
const drosofila = {
  key: 'drosofila',
  title: 'Moscerino della frutta',
  lead: 'Incroci di Drosophila: colore del corpo e degli occhi della femmina, del maschio, del primo e del secondo figlio.',
  ordered: true,
  words: { g: 'm', deiGenitori: 'dei genitori', individuo: 'moscerino', famiglia: 'incrocio', famiglie: 'incroci', genitori: 'genitori', genitore: 'genitore', madre: 'femmina', padre: 'maschio', primo: 'primo figlio', secondo: 'secondo figlio', secondi: 'secondi figli', figli: 'figli', figlio: 'figlio', incrocio: 'incrocio' },
  loci: [{
    name: 'cromosoma 2: geni b (corpo) e pr (occhi)',
    alleles: ['+ +', '+ pr', 'b +', 'b pr'],
    freq: [0.35, 0.1, 0.1, 0.45],
    recomb: RECOMB,
    // Le femmine producono anche gameti ricombinanti; i maschi di Drosophila no.
    gametes(pair, sex) {
      const [h1, h2] = pair, r = this.recomb;
      if (sex === 'M' || h1 === h2) return [[h1, 0.5], [h2, 0.5]];
      const r1 = (hBody(h1) << 1) | hEye(h2), r2 = (hBody(h2) << 1) | hEye(h1);
      return [[h1, (1 - r) / 2], [h2, (1 - r) / 2], [r1, r / 2], [r2, r / 2]];
    },
  }],
  phenotypes: ['grigio, occhi rossi', 'grigio, occhi porpora', 'nero, occhi rossi', 'nero, occhi porpora'],
  colors: ['#b59a6a', '#9c7f7a', '#3a342c', '#3d2a33'],
  eyes: ['#c8322a', '#6b2346', '#c8322a', '#6b2346'],
  pheno: g => {
    const [h1, h2] = g[0];
    const grey = hBody(h1) === 0 || hBody(h2) === 0, red = hEye(h1) === 0 || hEye(h2) === 0;
    return (grey ? 0 : 2) + (red ? 0 : 1);
  },
  obs: [
    { label: 'corpo grigio', yes: 'ha il corpo grigio', no: 'ha il corpo nero', short: 'grigio' },
    { label: 'occhi rossi', yes: 'ha gli occhi rosso vivo', no: 'ha gli occhi porpora scuro', short: 'occhi rossi' },
  ],
  bits: k => [dGrigio(k), dRossi(k)],
  observation: 'Di ogni moscerino Mendel guarda, con la lente, il colore del corpo (grigio come il moscerino selvatico, oppure nero) e quello degli occhi (rosso vivo, oppure porpora scuro). Queste due risposte sì/no per la femmina, il maschio e il primo figlio sono ciò che vede la foresta.',
  population: 'Una popolazione di laboratorio nata mescolando un ceppo selvatico (+ +) e un ceppo mutante nero con occhi porpora (b pr): per questo le combinazioni originali «+ +» (35%) e «b pr» (45%) sono molto più frequenti di quelle miste «+ pr» e «b +» (10% ciascuna). Gli accoppiamenti sono casuali.',
  alleles: [
    'Il corpo dipende dal gene b: + (grigio) domina su b (nero). Gli occhi dal gene pr: + (rossi) domina su pr (porpora). Fin qui è come nei piselli.',
    'Ma i due geni stanno sullo stesso cromosoma, vicinissimi. Un moscerino non riceve dai genitori due alleli separati, ma due pezzi di cromosoma interi: per esempio «+ +» da un genitore e «b pr» dall’altro, scritto + +/b pr. E li trasmette per lo più così come sono.',
    'Nelle femmine, durante la formazione delle uova, i due cromosomi possono scambiarsi un tratto (crossing-over): circa il 6% delle uova porta una combinazione nuova, «+ pr» o «b +». Nei maschi di Drosophila lo scambio non avviene mai. È la scoperta di Thomas Morgan e dei suoi allievi Alfred Sturtevant e Calvin Bridges (1911-1916), da cui nacquero le prime mappe dei geni.',
  ],
  laws: [
    { id: 'L1', text: 'Nero × nero: nascono solo moscerini neri.', prem: (m, f) => !dGrigio(m) && !dGrigio(f), forb: z => dGrigio(z), why: 'Il nero è recessivo: due genitori b b passano solo b.' },
    { id: 'L2', text: 'Occhi porpora × occhi porpora: nascono solo moscerini con gli occhi porpora.', prem: (m, f) => !dRossi(m) && !dRossi(f), forb: z => dRossi(z), why: 'Gli occhi porpora sono recessivi: due genitori pr pr passano solo pr.' },
    { id: 'L3', text: 'Grigio × grigio: nascono solo moscerini grigi.', prem: (m, f) => dGrigio(m) && dGrigio(f), forb: z => !dGrigio(z), why: 'Falsa: due genitori eterozigoti per b hanno un figlio nero su quattro.' },
    { id: 'L4', text: 'Grigio con occhi porpora × nero con occhi rossi: non nasce mai un moscerino grigio con gli occhi rossi.', prem: (m, f) => eq(m, f, 1, 2), forb: z => z === 0, why: 'Falsa: + pr/+ pr × b +/b + dà solo + pr/b +, grigio con occhi rossi: ogni genitore porta il dominante che manca all’altro.' },
    { id: 'L5', text: 'Nero porpora × nero porpora: nascono solo moscerini neri con occhi porpora.', prem: (m, f) => m === 3 && f === 3, forb: z => z !== 3, why: 'Entrambi i genitori sono b pr/b pr.' },
    { id: 'L6', text: 'Rossi × rossi: nascono solo moscerini con gli occhi rossi.', prem: (m, f) => dRossi(m) && dRossi(f), forb: z => !dRossi(z), why: 'Falsa: due genitori eterozigoti per pr hanno un figlio con gli occhi porpora su quattro.' },
  ],
  ratios: [
    { locus: 0, id: 'R1', text: 'Corpo · grigio × grigio, quando il primo figlio è nero', cond: (m, f, c) => dGrigio(m) && dGrigio(f) && !dGrigio(c), classes: [[0, 1], [2, 3]], names: ['grigio', 'nero'], why: 'Guardando un gene alla volta Mendel vale ancora: entrambi i genitori sono + b per il corpo, e nascono tre grigi e un nero.' },
    { locus: 0, id: 'R2', text: 'Occhi · rossi × rossi, quando il primo figlio ha gli occhi porpora', cond: (m, f, c) => dRossi(m) && dRossi(f) && !dRossi(c), classes: [[0, 2], [1, 3]], names: ['rossi', 'porpora'], why: 'Entrambi i genitori sono + pr per gli occhi: tre con gli occhi rossi e uno porpora.' },
    { id: 'R3', text: 'Femmina grigia con occhi rossi × maschio nero porpora, quando il primo figlio è nero porpora', cond: (m, f, c) => m === 0 && f === 3 && c === 3, classes: [[0], [1], [2], [3]], why: 'Il figlio nero porpora dimostra che la femmina porta b e pr. Se i geni fossero indipendenti nascerebbero i quattro tipi in parti uguali, 1 : 1 : 1 : 1. Invece la femmina passa quasi sempre i due pezzi di cromosoma interi: 47% «+ +» e 47% «b pr», solo 3% «+ pr» e 3% «b +». Nessun rapporto semplice.' },
    { id: 'R4', text: 'Femmina nera porpora × maschio grigio con occhi rossi, quando il primo figlio è nero porpora', cond: (m, f, c) => m === 3 && f === 0 && c === 3, classes: [[0], [1], [2], [3]], why: 'L’incrocio inverso. Il maschio + +/b pr non ricombina: passa «+ +» oppure «b pr», metà e metà. Nascono solo grigi con occhi rossi e neri porpora, 1 : 0 : 0 : 1: un rapporto che due geni indipendenti non darebbero mai.' },
  ],
  traits: [
    { bit: 0, label: 'il corpo', name: 'corpo' },
    { bit: 1, label: 'gli occhi', name: 'occhi' },
  ],
  linkage: {
    cond: (m, f, c) => m === 0 && f === 3 && c === 3,
    label: 'femmina grigia con occhi rossi × maschio nero porpora, con un primo figlio nero porpora',
    a: 0, b: 1, rows: ['grigio', 'nero'], cols: ['occhi rossi', 'occhi porpora'],
    why: 'In queste famiglie la femmina è quasi certamente + +/b pr e il maschio passa sempre b pr: il corpo e gli occhi del figlio dipendono solo da quale cromosoma passa la madre. Se i geni fossero indipendenti le quattro caselle sarebbero simili; invece i figli sono quasi tutti grigi con occhi rossi o neri porpora.',
  },
  independence: 'Qui i due geni non sono indipendenti: stanno sullo stesso cromosoma e viaggiano insieme. Se un genitore ha passato «b pr» al primo figlio, probabilmente passerà di nuovo b insieme a pr. Per prevedere il corpo del secondo figlio servirebbe quindi anche guardare gli occhi del primo. Ma l’aiuto riguarda solo le famiglie con un genitore eterozigote per entrambi i geni, e in media resta piccolo.',
  finalNote: {
    title: 'La prima mappa dei geni.',
    text: 'Nei rapporti R3 e R4 Mendel si aspetta 1 : 1 : 1 : 1 e non lo trova. Nel primo caso le combinazioni nuove (grigio con occhi porpora, nero con occhi rossi) sono poche, circa il 6%; nel secondo non compaiono mai, perché i maschi non ricombinano. Sturtevant ebbe l’idea decisiva: la percentuale di combinazioni nuove misura la distanza tra due geni sul cromosoma. Il 6% tra b e pr diventa «6 unità di mappa», e da tre o più geni si ricava il loro ordine. È il punto in cui la terza legge di Mendel smette di valere: vale solo per geni lontani o su cromosomi diversi.',
  },
};

// ---------------------------------------------------------------- Cavalli, diluizione crema
// 0 baio, 1 isabella, 2 perlino, 3 sauro, 4 palomino, 5 cremello
const cScuri = k => k <= 2;
const cDil = k => k % 3 >= 1;
const cDoppio = k => k % 3 === 2;
const cavalli = {
  key: 'cavalli',
  title: 'Mantello dei cavalli',
  lead: 'Puledri: baio, isabella, perlino, sauro, palomino o cremello per la cavalla, lo stallone, il primo e il secondo puledro.',
  words: { g: 'm', deiGenitori: 'dei genitori', individuo: 'cavallo', famiglia: 'accoppiamento', famiglie: 'accoppiamenti', genitori: 'genitori', genitore: 'genitore', madre: 'cavalla', padre: 'stallone', primo: 'primo puledro', secondo: 'secondo puledro', secondi: 'secondi puledri', figli: 'puledri', figlio: 'puledro', incrocio: 'accoppiamento' },
  loci: [
    { name: 'gene E (estensione del nero)', alleles: ['E', 'e'], freq: [0.5, 0.5] },
    { name: 'gene Cr (crema)', alleles: ['n', 'Cr'], freq: [0.65, 0.35] },
  ],
  phenotypes: ['baio', 'isabella', 'perlino', 'sauro', 'palomino', 'cremello'],
  colors: ['#6b3a1f', '#c9a063', '#eadfc9', '#a8532a', '#e0b45a', '#f3ead8'],
  pheno: g => (g[0].includes(0) ? 0 : 3) + g[1].filter(a => a === 1).length,
  obs: [
    { label: 'punti scuri', yes: 'ha criniera, coda e zampe scure', no: 'non ha i punti scuri', short: 'punti scuri' },
    { label: 'diluito', yes: 'ha il mantello schiarito', no: 'ha il mantello pieno', short: 'diluito' },
    { label: 'doppio diluito', yes: 'è color crema chiarissimo, con occhi azzurri', no: 'non è color crema chiarissimo', short: 'doppio' },
  ],
  bits: k => [cScuri(k), cDil(k), cDoppio(k)],
  observation: 'Di ogni cavallo Mendel risponde a tre domande. Ha i «punti» scuri, cioè criniera, coda e parte bassa delle zampe più scure del corpo? Il mantello è schiarito? È schiarito fino al crema chiarissimo, con la pelle rosa e gli occhi azzurri? Il perlino ha ancora i punti un po’ più scuri del corpo, il cremello no. Queste nove risposte per cavalla, stallone e primo puledro sono ciò che vede la foresta.',
  population: 'Un allevamento misto: per il gene E metà degli alleli è E e metà e; per il gene crema il 35% è Cr e il 65% n (non diluito). Tutti i cavalli hanno qui la versione dominante del gene agouti, che rende bai quelli con E. Gli accoppiamenti sono casuali.',
  alleles: [
    'Il gene E decide se il pigmento nero arriva nel pelo. E (dominante) dà i punti scuri: con il gene agouti il cavallo è baio, corpo bruno-rossiccio e criniera nera. e e non produce nero: il cavallo è sauro, tutto rosso.',
    'Il gene crema Cr ha dominanza incompleta, come i polli blu: una dose schiarisce il rosso ma non il nero, e il baio diventa isabella (corpo dorato, criniera nera), il sauro palomino (corpo dorato, criniera chiara). Due dosi schiariscono tutto: perlino dal baio, cremello dal sauro.',
    'Dal mantello si legge quindi il numero esatto di alleli Cr (0, 1 o 2), mentre un cavallo con i punti scuri può essere E E oppure E e. I due geni stanno su cromosomi diversi e si trasmettono in modo indipendente.',
  ],
  laws: [
    { id: 'L1', text: 'Sauro × sauro (o palomino, o cremello): nessun puledro ha i punti scuri.', prem: (m, f) => !cScuri(m) && !cScuri(f), forb: z => cScuri(z), why: 'Senza punti scuri un cavallo è e e: due genitori e e passano solo e.' },
    { id: 'L2', text: 'Un puledro diluito ha sempre almeno un genitore diluito.', prem: (m, f) => !cDil(m) && !cDil(f), forb: z => cDil(z), why: 'L’allele Cr si vede sempre, anche in una sola dose: se nessun genitore è diluito, nessuno lo porta.' },
    { id: 'L3', text: 'Un puledro perlino o cremello ha sempre entrambi i genitori diluiti.', prem: (m, f) => !cDil(m) || !cDil(f), forb: z => cDoppio(z), why: 'Il doppio diluito è Cr Cr: riceve un Cr da ciascun genitore.' },
    { id: 'L4', text: 'Sauro × cremello: nascono solo puledri palomino.', prem: (m, f) => eq(m, f, 3, 5), forb: z => z !== 4, why: 'e e n n × e e Cr Cr dà sempre e e n Cr: palomino.' },
    { id: 'L5', text: 'Baio × baio: nascono solo puledri bai.', prem: (m, f) => m === 0 && f === 0, forb: z => z !== 0, why: 'Falsa: E e × E e dà un puledro e e, sauro, su quattro.' },
    { id: 'L6', text: 'Palomino × palomino: nascono solo palomino.', prem: (m, f) => m === 4 && f === 4, forb: z => z !== 4, why: 'Falsa: n Cr × n Cr dà sauro, palomino e cremello nel rapporto 1 : 2 : 1. Un palomino «puro» non esiste.' },
    { id: 'L7', text: 'Isabella × sauro: nascono solo puledri isabella o sauri.', prem: (m, f) => eq(m, f, 1, 3), forb: z => z !== 1 && z !== 3, why: 'Falsa: E e n Cr × e e n n dà anche bai (E e n n) e palomino (e e n Cr).' },
  ],
  ratios: [
    { locus: 1, id: 'R1', text: 'Crema · due genitori diluiti una volta (isabella o palomino)', cond: (m, f) => cDil(m) && !cDoppio(m) && cDil(f) && !cDoppio(f), classes: [[0, 3], [1, 4], [2, 5]], names: ['pieno', 'diluito una volta', 'doppio diluito'], why: 'Entrambi sono n Cr: 1 : 2 : 1, qualunque sia il gene E.' },
    { locus: 1, id: 'R2', text: 'Crema · un genitore diluito una volta e uno non diluito', cond: (m, f) => (cDil(m) && !cDoppio(m) && !cDil(f)) || (cDil(f) && !cDoppio(f) && !cDil(m)), classes: [[0, 3], [1, 4]], names: ['pieno', 'diluito una volta'], why: 'n Cr × n n: metà dei puledri riceve Cr.' },
    { locus: 0, id: 'R3', text: 'Nero · due genitori con i punti scuri, quando il primo puledro non li ha', cond: (m, f, c) => cScuri(m) && cScuri(f) && !cScuri(c), classes: [[0, 1, 2], [3, 4, 5]], names: ['punti scuri', 'senza'], why: 'Il puledro e e dimostra che entrambi i genitori sono E e: tre con i punti scuri e uno senza.' },
    { locus: 0, id: 'R4', text: 'Nero · un genitore con i punti scuri e uno senza, quando il primo puledro non li ha', cond: (m, f, c) => cScuri(m) !== cScuri(f) && !cScuri(c), classes: [[0, 1, 2], [3, 4, 5]], names: ['punti scuri', 'senza'], why: 'Il genitore con i punti scuri è E e: metà e metà.' },
  ],
  traits: [
    { bit: 0, label: 'i punti scuri', name: 'punti scuri' },
    { bit: 1, own: [1, 2], label: 'la diluizione', name: 'diluizione' },
  ],
  independence: 'I punti scuri dipendono dal gene E, la diluizione dal gene crema: due geni su cromosomi diversi. Il crema non nasconde il gene E (anche il perlino ha i punti un po’ scuri), quindi sapere se i genitori sono diluiti non dice nulla sui punti scuri dei puledri.',
  finalNote: {
    title: 'Contare le dosi.',
    text: 'Con la dominanza completa (i piselli, il gene E) un mantello non dice se un allele c’è una volta o due. Con la dominanza incompleta del crema sì: pieno, schiarito, crema chiarissimo sono zero, una, due dosi. Per questo le leggi sul crema sono quasi tutte esclusioni sicure e i rapporti 1 : 2 : 1 si vedono direttamente, senza aspettare un fratello rivelatore; tutta l’incertezza sta nel gene E, dove un baio può nascondere un e.',
  },
};

export const SCENARIOS = { sangue, piselli, polli, labrador, conigli, gatti, topi, odoroso, drosofila, cavalli };
// In ordine di difficoltà crescente per Mendel.
export const SCENARIO_LIST = [piselli, polli, cavalli, sangue, gatti, labrador, odoroso, conigli, topi, drosofila];
