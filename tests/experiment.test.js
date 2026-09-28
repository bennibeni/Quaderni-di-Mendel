import test from 'node:test';
import assert from 'node:assert/strict';
import { run, validate } from '../src/Mendel/lib/experiment.js';
import { SCENARIO_LIST } from '../src/Mendel/lib/scenarios.js';
test('tutti gli scenari producono risultati coerenti e distinti',()=>{for(const S of SCENARIO_LIST){const r=run({scenario:S.key,families:1000,seed:1});assert.equal(r.config.scenario,S.key);assert.equal(r.counts.total,1000);assert.equal(r.counts.known,200);assert.equal(r.laws.length,S.laws.length);assert.equal(r.ratios.length,S.ratios.length);for(const c of r.contest)assert.ok(Number.isFinite(c.m.scarto));}});
test('riproducibilità indipendente da esecuzioni di altri scenari',()=>{const cfg={scenario:'piselli',families:1000,seed:17};const a=run(cfg);run({...cfg,scenario:'sangue'});const b=run(cfg);assert.deepEqual(a.registry,b.registry);assert.deepEqual(a.contest,b.contest);assert.deepEqual(a.summary,b.summary);});
test('rifiuta input non validi',()=>{assert.throws(()=>validate({scenario:'altro'}));assert.throws(()=>validate({seed:0}));assert.throws(()=>validate({families:5}));});
