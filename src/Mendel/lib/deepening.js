import { SCENARIOS } from "./scenarios.js";
import { prepare } from "./genetics.js";

export const DEEPENING_TITLES = {
  piselli: "Che cosa rivela il primo seme?",
  conigli: "Che cosa rivelano i primi quattro coniglietti?",
};

// Esempi indipendenti dalla sessione, con le frequenze dello scenario.
export function deepeningExample(key) {
  if (!DEEPENING_TITLES[key])
    throw new Error("Approfondimento non disponibile.");
  const model = prepare(SCENARIOS[key]);
  const probability = (observed) => {
    const p = model.exact(0, 0, observed);
    return key === "piselli" ? p[2] + p[3] : p[3];
  };
  return key === "piselli"
    ? [
        { label: "Prima di osservare il primo seme", p: probability([]) },
        { label: "Il primo seme è rugoso e giallo", p: probability([2]) },
      ]
    : [
        ...Array.from({ length: 5 }, (_, n) => ({
          label: n
            ? `${n} ${n === 1 ? "coniglietto osservato, a colore pieno" : "coniglietti osservati, tutti a colore pieno"}`
            : "Nessun coniglietto ancora osservato",
          p: probability(Array(n).fill(0)),
        })),
        {
          label: "Un albino e tre coniglietti a colore pieno",
          p: probability([3, 0, 0, 0]),
        },
      ];
}
