import test from "node:test";
import assert from "node:assert/strict";
import { compareError, bestModels } from "../src/Mendel/lib/comparison.js";
test("confronto corretto per vittoria, sconfitta, parità e riferimento zero", () => {
  assert.match(compareError(1, 2), /minore del 50%/);
  assert.match(compareError(3, 2), /maggiore del 50%/);
  assert.equal(compareError(0, 0), "lo stesso scarto");
  assert.match(compareError(1, 0), /riferimento ha scarto zero/);
  assert.equal(
    bestModels([
      { label: "Albero", m: { scarto: 1 } },
      { label: "Foresta", m: { scarto: 2 } },
    ]),
    "Albero",
  );
  assert.equal(
    bestModels([
      { label: "Albero", m: { scarto: 1 } },
      { label: "Foresta", m: { scarto: 1 } },
    ]),
    "Albero, Foresta",
  );
});
