# CS2 Veto & Map Draft Minimax Engine

[![Tests](https://img.shields.io/badge/Tests-Passing-00FF88.svg)](https://github.com/esportsmath-labs/cs2-veto-minimax)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Portal](https://img.shields.io/badge/Portal-esportsmath.org-00E5FF.svg)](https://esportsmath.org/en/tools/map-veto-analyzer/)
[![Affiliation](https://img.shields.io/badge/Institution-Applied%20Probability%20Institute-gold.svg)](https://esportsmath.org/en/about/)

Algorithmic backward induction draft simulator for professional Counter-Strike 2 (CS2) Active Duty map pools. Eliminates human drafting bias by solving for the subgame perfect Nash equilibrium in Bo1 and Bo3 pick/ban veto trees.

---

## 📐 Mathematical Formulation

### 1. Bradley-Terry Log-Odds Map Win Model
For each map $m$, given historical team winrates $w_A$ and $w_B$, the conditioned probability $P_m(A)$ is evaluated as:
$$P_m(A) = \frac{w_A(1 - w_B)}{w_A(1 - w_B) + w_B(1 - w_A)}$$

### 2. Minimax Ban Formulation
- **Team A Objective**: Minimizes opponent edge by eliminating $m^* = \arg\min_{m \in M} P_m(A)$.
- **Team B Objective**: Maximizes edge by banning $m^* = \arg\max_{m \in M} P_m(A)$.

### 3. Best-of-3 Series Partitioning
Given Map 1 ($p_1$), Map 2 ($p_2$), and Decider ($p_3$):
$$P(A \text{ wins } 2\text{-}0) = p_1 \cdot p_2$$
$$P(A \text{ wins } 2\text{-}1) = \Big(p_1(1 - p_2) + (1 - p_1)p_2\Big) \cdot p_3$$
$$P(\text{Series } A) = P(2\text{-}0) + P(2\text{-}1)$$

---

## 🚀 Quick Start

```bash
npm install @esportsmath/cs2-veto-minimax
```

### Running Tests
```bash
node --test test/*.test.js
```

### CLI Execution
```bash
node cli.js
```

---

## 🌐 Live Interactive Tool
Experience the live graphical draft engine and test custom matchups at [esportsmath.org/en/tools/map-veto-analyzer/](https://esportsmath.org/en/tools/map-veto-analyzer/).

## 📜 Citation
```bibtex
@software{esportsmath_veto2026,
  author = {{EsportsMath Labs}},
  title = {CS2 Veto Minimax: Backward Induction Pick/Ban Draft Engine},
  year = {2026},
  publisher = {GitHub},
  url = {https://github.com/esportsmath-labs/cs2-veto-minimax}
}
```
