/**
 * @esportsmath/cs2-veto-minimax
 * Algorithmic Game-Theoretic Draft Engine for Counter-Strike 2 Active Duty Map Pool.
 * Developed by EsportsMath Labs (Applied Probability Institute).
 */

export const ACTIVE_DUTY_MAPS = [
  'Mirage',
  'Inferno',
  'Nuke',
  'Dust II',
  'Ancient',
  'Anubis',
  'Vertigo'
];

/**
 * Calculates win probability of Team A vs Team B on a specific map
 * using the Bradley-Terry log-odds ratio formulation:
 * P(A wins map) = (wA * (1 - wB)) / (wA * (1 - wB) + wB * (1 - wA))
 *
 * @param {number} wrA - Team A historical win rate on map [0, 1]
 * @param {number} wrB - Team B historical win rate on map [0, 1]
 * @returns {number} Probability that Team A wins the map [0, 1]
 */
export function calculateMapWinProbability(wrA, wrB) {
  // Clamping to avoid division by zero while preserving competitive variance
  const pA = Math.max(0.01, Math.min(0.99, wrA));
  const pB = Math.max(0.01, Math.min(0.99, wrB));
  
  const num = pA * (1 - pB);
  const den = num + pB * (1 - pA);
  return num / den;
}

/**
 * Simulates a standard Tier-1 Best-of-1 (Bo1) Map Veto.
 * Sequence:
 * 1. Team A bans 1
 * 2. Team B bans 1
 * 3. Team A bans 1
 * 4. Team B bans 1
 * 5. Team A bans 1
 * 6. Team B bans 1
 * 7. Remaining map is played.
 *
 * @param {Record<string, number>} ratingsA - Team A winrates per map
 * @param {Record<string, number>} ratingsB - Team B winrates per map
 * @param {boolean} teamAFirstBan - Whether Team A bans first
 */
export function simulateBo1Veto(ratingsA, ratingsB, teamAFirstBan = true) {
  let pool = [...ACTIVE_DUTY_MAPS];
  const history = [];
  let turnA = teamAFirstBan;

  while (pool.length > 1) {
    let chosenMap = null;
    if (turnA) {
      // Team A wants to eliminate the map where Team A's win probability is lowest
      let minProb = Infinity;
      for (const map of pool) {
        const prob = calculateMapWinProbability(ratingsA[map] ?? 0.5, ratingsB[map] ?? 0.5);
        if (prob < minProb) {
          minProb = prob;
          chosenMap = map;
        }
      }
      history.push({ action: 'ban', team: 'A', map: chosenMap });
    } else {
      // Team B wants to eliminate the map where Team A's win probability is highest
      let maxProb = -Infinity;
      for (const map of pool) {
        const prob = calculateMapWinProbability(ratingsA[map] ?? 0.5, ratingsB[map] ?? 0.5);
        if (prob > maxProb) {
          maxProb = prob;
          chosenMap = map;
        }
      }
      history.push({ action: 'ban', team: 'B', map: chosenMap });
    }
    pool = pool.filter(m => m !== chosenMap);
    turnA = !turnA;
  }

  const finalMap = pool[0];
  const expectedProbA = calculateMapWinProbability(ratingsA[finalMap] ?? 0.5, ratingsB[finalMap] ?? 0.5);

  return {
    format: 'Bo1',
    history,
    playedMap: finalMap,
    winProbabilityA: expectedProbA,
    winProbabilityB: 1 - expectedProbA
  };
}

/**
 * Simulates a standard Tier-1 Best-of-3 (Bo3) Map Veto.
 * Sequence:
 * 1. Team A bans
 * 2. Team B bans
 * 3. Team A picks (Map 1)
 * 4. Team B picks (Map 2)
 * 5. Team A bans
 * 6. Team B bans
 * 7. Decider Map remains (Map 3)
 *
 * @param {Record<string, number>} ratingsA
 * @param {Record<string, number>} ratingsB
 */
export function simulateBo3Veto(ratingsA, ratingsB) {
  let pool = [...ACTIVE_DUTY_MAPS];
  const history = [];

  // Helper for map prob
  const prob = (map) => calculateMapWinProbability(ratingsA[map] ?? 0.5, ratingsB[map] ?? 0.5);

  // 1. Team A Ban (eliminate lowest prob)
  let banA1 = pool.reduce((minM, m) => prob(m) < prob(minM) ? m : minM, pool[0]);
  history.push({ action: 'ban', team: 'A', map: banA1 });
  pool = pool.filter(m => m !== banA1);

  // 2. Team B Ban (eliminate highest prob)
  let banB1 = pool.reduce((maxM, m) => prob(m) > prob(maxM) ? m : maxM, pool[0]);
  history.push({ action: 'ban', team: 'B', map: banB1 });
  pool = pool.filter(m => m !== banB1);

  // 3. Team A Pick (pick highest prob)
  let pickA = pool.reduce((maxM, m) => prob(m) > prob(maxM) ? m : maxM, pool[0]);
  history.push({ action: 'pick', team: 'A', map: pickA });
  pool = pool.filter(m => m !== pickA);

  // 4. Team B Pick (pick lowest prob for A = highest for B)
  let pickB = pool.reduce((minM, m) => prob(m) < prob(minM) ? m : minM, pool[0]);
  history.push({ action: 'pick', team: 'B', map: pickB });
  pool = pool.filter(m => m !== pickB);

  // 5. Team A Second Ban
  let banA2 = pool.reduce((minM, m) => prob(m) < prob(minM) ? m : minM, pool[0]);
  history.push({ action: 'ban', team: 'A', map: banA2 });
  pool = pool.filter(m => m !== banA2);

  // 6. Team B Second Ban
  let banB2 = pool.reduce((maxM, m) => prob(m) > prob(maxM) ? m : maxM, pool[0]);
  history.push({ action: 'ban', team: 'B', map: banB2 });
  pool = pool.filter(m => m !== banB2);

  const decider = pool[0];

  const p1 = prob(pickA);
  const p2 = prob(pickB);
  const p3 = prob(decider);

  // Bo3 Series Probabilities:
  // Team A 2-0: p1 * p2
  // Team A 2-1: p1 * (1 - p2) * p3 + (1 - p1) * p2 * p3
  // Team B 2-0: (1 - p1) * (1 - p2)
  // Team B 2-1: (1 - p1) * p2 * (1 - p3) + p1 * (1 - p2) * (1 - p3)

  const probA_2_0 = p1 * p2;
  const probA_2_1 = (p1 * (1 - p2) + (1 - p1) * p2) * p3;
  const seriesProbA = probA_2_0 + probA_2_1;

  const probB_2_0 = (1 - p1) * (1 - p2);
  const probB_2_1 = (p1 * (1 - p2) + (1 - p1) * p2) * (1 - p3);
  const seriesProbB = probB_2_0 + probB_2_1;

  return {
    format: 'Bo3',
    history,
    map1: { map: pickA, pickedBy: 'A', winProbabilityA: p1 },
    map2: { map: pickB, pickedBy: 'B', winProbabilityA: p2 },
    decider: { map: decider, winProbabilityA: p3 },
    series: {
      probA: seriesProbA,
      probB: seriesProbB,
      scoreDistribution: {
        '2-0': probA_2_0,
        '2-1': probA_2_1,
        '0-2': probB_2_0,
        '1-2': probB_2_1
      }
    }
  };
}
