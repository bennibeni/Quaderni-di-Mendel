import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('il metodo della home si renderizza senza dipendere da uno scenario', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { default: Method } = await server.ssrLoadModule('/src/Mendel/Method.jsx');
    const html = renderToStaticMarkup(React.createElement(Method));
    assert.match(html, /01 · Il metodo/);
    assert.match(html, /primo seme/);
    assert.match(html, /Fase 3/);
  } finally {
    await server.close();
  }
});

test('schermata di recupero e risultati di tutti gli scenari sono renderizzabili', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { ErrorRecovery } = await server.ssrLoadModule('/src/ErrorBoundary.jsx');
    assert.match(renderToStaticMarkup(React.createElement(ErrorRecovery, {onRetry:()=>{}})), /Riprova dalla pagina principale/);
    const { Results } = await server.ssrLoadModule('/src/Mendel/Results.jsx');
    const { SCENARIO_LIST } = await server.ssrLoadModule('/src/Mendel/lib/scenarios.js');
    const { run } = await server.ssrLoadModule('/src/Mendel/lib/experiment.js');
    for (const S of SCENARIO_LIST) {
      const r = run({scenario:S.key,families:1000,seed:1});
      for(let step=1;step<=9;step++) assert.match(renderToStaticMarkup(React.createElement(Results,{S,r,step})), /<section/);
    }
  } finally { await server.close(); }
});
