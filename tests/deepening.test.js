import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { deepeningExample } from "../src/Mendel/lib/deepening.js";

test("un seme rugoso rivela due genitori eterozigoti", () => {
  const rows = deepeningExample("piselli");
  assert.ok(Math.abs(rows[0].p - 1 / 9) < 1e-12);
  assert.ok(Math.abs(rows[1].p - 1 / 4) < 1e-12);
});

test("assenza di albini riduce senza escludere la probabilità, un albino rivela i portatori", () => {
  const rows = deepeningExample("conigli");
  assert.ok(Math.abs(rows[0].p - 0.04) < 1e-12);
  for (let i = 1; i <= 4; i++) {
    assert.ok(rows[i].p > 0);
    assert.ok(rows[i].p < rows[i - 1].p);
  }
  assert.ok(Math.abs(rows[5].p - 0.25) < 1e-12);
});

test("approfondimenti leggibili senza una sessione e con ritorno allo scenario", async () => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  try {
    const { default: Deepening } = await server.ssrLoadModule(
      "/src/Mendel/Deepening.jsx",
    );
    const { SCENARIOS } = await server.ssrLoadModule(
      "/src/Mendel/lib/scenarios.js",
    );
    for (const key of ["piselli", "conigli"]) {
      const html = renderToStaticMarkup(
        React.createElement(Deepening, { scenario: SCENARIOS[key] }),
      );
      assert.match(html, new RegExp(`href="#/scenari/${key}/bilancio"`));
      assert.match(html, new RegExp(`href="#/scenari/${key}/scenario"`));
      assert.match(html, /https:\/\/bayes-paradoxes.vercel.app\//);
      assert.match(html, /non sono risultati della foresta/);
      assert.doesNotMatch(html, /NaN|undefined|R38|giardino dei conigli/);
    }
  } finally {
    await server.close();
  }
});
