#!/usr/bin/env node
import { simulateBo1Veto, simulateBo3Veto } from './src/index.js';

console.log("=== CS2 Veto Minimax Draft Simulator (EsportsMath Labs) ===");

const sampleA = {
  Mirage: 0.65, Inferno: 0.55, Nuke: 0.45,
  'Dust II': 0.70, Ancient: 0.50, Anubis: 0.40, Vertigo: 0.30
};
const sampleB = {
  Mirage: 0.50, Inferno: 0.60, Nuke: 0.70,
  'Dust II': 0.40, Ancient: 0.55, Anubis: 0.65, Vertigo: 0.50
};

console.log("\n[Simulating Bo3 Veto]");
const resBo3 = simulateBo3Veto(sampleA, sampleB);
console.log("Map 1 (Pick A):", resBo3.map1.map, `(P(A) = ${(resBo3.map1.winProbabilityA * 100).toFixed(1)}%)`);
console.log("Map 2 (Pick B):", resBo3.map2.map, `(P(A) = ${(resBo3.map2.winProbabilityA * 100).toFixed(1)}%)`);
console.log("Decider Map:   ", resBo3.decider.map, `(P(A) = ${(resBo3.decider.winProbabilityA * 100).toFixed(1)}%)`);
console.log(`\nSeries Win Expectation: Team A ${(resBo3.series.probA * 100).toFixed(2)}% | Team B ${(resBo3.series.probB * 100).toFixed(2)}%`);
console.log("Score Matrix:", resBo3.series.scoreDistribution);
