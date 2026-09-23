import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIVE_DUTY_MAPS,
  calculateMapWinProbability,
  simulateBo1Veto,
  simulateBo3Veto
} from '../src/index.js';

test('Active Duty Map Pool Integrity', () => {
  assert.equal(ACTIVE_DUTY_MAPS.length, 7);
  assert.ok(ACTIVE_DUTY_MAPS.includes('Mirage'));
  assert.ok(ACTIVE_DUTY_MAPS.includes('Inferno'));
  assert.ok(ACTIVE_DUTY_MAPS.includes('Nuke'));
  assert.ok(ACTIVE_DUTY_MAPS.includes('Dust II'));
  assert.ok(ACTIVE_DUTY_MAPS.includes('Ancient'));
  assert.ok(ACTIVE_DUTY_MAPS.includes('Anubis'));
  assert.ok(ACTIVE_DUTY_MAPS.includes('Vertigo'));
});

test('Bradley-Terry Map Win Probability: Symmetric Ratings equal 0.50', () => {
  const p1 = calculateMapWinProbability(0.50, 0.50);
  assert.ok(Math.abs(p1 - 0.50) < 1e-6);

  const p2 = calculateMapWinProbability(0.70, 0.70);
  assert.ok(Math.abs(p2 - 0.50) < 1e-6);
});

test('Bradley-Terry Probability: Team with higher winrate has > 50%', () => {
  const p = calculateMapWinProbability(0.75, 0.25);
  assert.ok(p > 0.85);
});

test('Bo1 Veto simulation produces exactly 6 bans and 1 played map', () => {
  const dummyRatings = Object.fromEntries(ACTIVE_DUTY_MAPS.map((m, i) => [m, 0.40 + i * 0.05]));
  const res = simulateBo1Veto(dummyRatings, dummyRatings);
  
  assert.equal(res.history.length, 6);
  assert.ok(ACTIVE_DUTY_MAPS.includes(res.playedMap));
  assert.ok(Math.abs(res.winProbabilityA + res.winProbabilityB - 1.0) < 1e-6);
});

test('Bo3 Veto simulation produces 2 picks, 4 bans, and 1 decider', () => {
  const ratingsA = {
    Mirage: 0.65, Inferno: 0.55, Nuke: 0.45,
    'Dust II': 0.70, Ancient: 0.50, Anubis: 0.40, Vertigo: 0.30
  };
  const ratingsB = {
    Mirage: 0.50, Inferno: 0.60, Nuke: 0.70,
    'Dust II': 0.40, Ancient: 0.55, Anubis: 0.65, Vertigo: 0.50
  };

  const res = simulateBo3Veto(ratingsA, ratingsB);

  assert.equal(res.history.length, 6);
  assert.ok(res.map1.map);
  assert.ok(res.map2.map);
  assert.ok(res.decider.map);

  // Distinct maps check
  const mapSet = new Set([res.map1.map, res.map2.map, res.decider.map]);
  assert.equal(mapSet.size, 3);

  // Probability sum axiom
  assert.ok(Math.abs(res.series.probA + res.series.probB - 1.0) < 1e-6);

  // Score distribution sum
  const sumScores = Object.values(res.series.scoreDistribution).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sumScores - 1.0) < 1e-6);
});
