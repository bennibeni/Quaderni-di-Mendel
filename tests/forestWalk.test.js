import test from 'node:test';
import assert from 'node:assert/strict';
import { traceTree } from '../src/Mendel/lib/forestWalk.js';
import { treeLeaf } from '../src/Mendel/lib/forest.js';
import { run } from '../src/Mendel/lib/experiment.js';

test('la traccia segue realmente soglie, rami e foglia dell’albero', () => {
  const tree = { feat: [0, -1, 1, -1, -1], thr: [0, 0, 0, 0, 0], left: [1, -1, 3, -1, -1], right: [2, -1, 4, -1, -1], dist: [[.5,.5], [1,0], [.3,.7], [.6,.4], [0,1]], size: [20,10,10,5,5] };
  for (const x of [[0,0], [1,0], [1,1]]) {
    const trace = traceTree(tree, x);
    assert.deepEqual(trace.distribution, Array.from(treeLeaf(tree, x)));
    assert.equal(trace.steps.length, x[0] ? 2 : 1);
    assert.equal(trace.steps[0].value, x[0]);
  }
});

test('le visite usano incroci esclusi dall’addestramento e la media di tutti gli alberi', () => {
  const result = run({scenario: 'piselli', families: 1000, seed: 1});
  assert.equal(result.forestWalk.length, 3);
  result.forestWalk.forEach((example, i) => {
    assert.equal(example.id, result.counts.known + i + 1);
    assert.equal(example.trees.length, 100);
    for (let k = 0; k < 4; k++) {
      const mean = example.trees.reduce((sum, t) => sum + t.distribution[k], 0) / example.trees.length;
      assert.ok(Math.abs(mean - example.prediction[k]) < 1e-12);
    }
    for (const tree of example.trees) for (const step of tree.steps) {
      assert.equal(step.threshold, 0);
      assert.ok([0, 1].includes(step.value));
    }
    assert.ok(example.exact[example.outcome] > 0);
  });
  assert.doesNotThrow(() => structuredClone(result.forestWalk));
});
