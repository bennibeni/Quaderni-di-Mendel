/** Una traccia fedele dei nodi attraversati, senza modificare l'albero. */
export function traceTree(tree, x) {
  const steps = [];
  let node = 0;
  while (tree.feat[node] >= 0) {
    const feature = tree.feat[node],
      threshold = tree.thr[node];
    const value = x[feature];
    steps.push({ feature, threshold, value });
    node = value <= threshold ? tree.left[node] : tree.right[node];
  }
  return {
    steps,
    distribution: Array.from(tree.dist[node]),
    size: tree.size[node],
  };
}

export function makeForestWalk(
  forest,
  families,
  inputs,
  heldOut,
  predict,
  exact,
) {
  // I primi tre incroci di verifica: nessuna selezione in base al successo.
  return heldOut.slice(0, 3).map((row) => {
    const family = families[row];
    return {
      id: row + 1,
      parents: [family.m, family.f],
      first: family.sibs[0],
      outcome: family.c2,
      trees: forest.map((tree) => traceTree(tree, inputs[row])),
      prediction: Array.from(predict(inputs[row])),
      exact: Array.from(exact(family.m, family.f, family.sibs)),
    };
  });
}
