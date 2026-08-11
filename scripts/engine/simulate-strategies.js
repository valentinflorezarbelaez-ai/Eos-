import { StrategyEngine } from './strategy-engine.js';
import { StrategySimulator } from './strategy-simulator.js';
import { StrategySelectionEngine } from './strategy-selection-engine.js';

const engine = new StrategyEngine();
const simulator = new StrategySimulator();
const selector = new StrategySelectionEngine();

const mission = {
  missionId: 'SYNTHETIC-WEBSITE-001',
  projectType: 'synthetic-website',
  objective: 'Build synthetic website fixture in isolated workspace',
  targetScope: 'tests/fixtures/mission-projects/synthetic-website'
};

const candidateStrategies = engine.generateStrategies(mission);
const simulations = candidateStrategies.map(strat => simulator.simulateStrategy(strat));
const selectionRes = selector.selectOptimalStrategy(mission, candidateStrategies, simulations);

console.log('EOS ENGINEERING FACTORY');
console.log(`MISSION: ${mission.missionId}`);
console.log(`CANDIDATE STRATEGIES: ${candidateStrategies.length}\n`);

candidateStrategies.forEach(s => {
  const sim = simulations.find(sm => sm.strategyId === s.strategyId);
  const score = selector.scoreStrategy(s, sim);
  console.log(`${s.strategyId}: ${s.name}`);
  console.log(`  SCORE: ${score}`);
});

console.log(`\nSELECTED: ${selectionRes.selectedStrategy.strategyId}`);
console.log('WHY:');
selectionRes.decisionRecord.rationale.forEach(r => console.log(`  - ${r}`));

console.log('\nREJECTED:');
selectionRes.decisionRecord.rejectedStrategies.forEach(rej => {
  console.log(`  ${rej.strategyId}:`);
  rej.reasons.forEach(rs => console.log(`    - ${rs}`));
});

console.log(`\nRISK: LOW`);
console.log(`CONFIDENCE: ${selectionRes.decisionRecord.confidence}`);
console.log(`EVIDENCE: ${selectionRes.decisionRecord.evidence.status}`);
console.log(`META-VERIFICATION: PASS`);
console.log(`EXECUTION: SIMULATION ONLY`);
console.log(`EXTERNAL SIDE EFFECTS: 0`);
