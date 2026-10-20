import type { CalculationResult, PlayAction, RerollPolicy } from '../domain/types';
import { calculateAction } from './resolve-action';

export interface SequenceOptions { teamRerolls?: number; policy?: RerollPolicy }
export const createInitialCalculationState = (teamRerolls = 0) => ({ actionIndex: 0, teamRerolls, consumedResources: [] });

function allowed(action: PlayAction, policy: RerollPolicy) {
  return action.rerollAllowed !== false && policy !== 'none' && (policy !== 'selected' || !!action.teamReroll);
}

export function calculateSequence(actions: PlayAction[], options: SequenceOptions = {}): CalculationResult {
  const policy = options.policy ?? 'first-failure';
  const initialRerolls = options.teamRerolls ?? 0;
  const memo = new Map<string, number>();
  const solve = (index: number, rerolls: number): number => {
    if (index >= actions.length) return 1;
    const key = `${index}:${rerolls}`;
    const existing = memo.get(key); if (existing !== undefined) return existing;
    const action = actions[index]; const base = calculateAction(action); const next = solve(index + 1, rerolls);
    const optional = action.turnover === false && action.mandatory === false;
    let result = next * (base.success + (optional ? 1 - base.success : 0));
    if (rerolls && allowed(action, policy)) {
      const afterRetry = solve(index + 1, rerolls - 1);
      const retryResult = base.success + (optional ? 1 - base.success : 0);
      const rerolled = base.success * next + (1 - base.success) * retryResult * afterRetry;
      result = policy === 'optimal' ? Math.max(result, rerolled) : rerolled;
    }
    memo.set(key, result); return result;
  };
  let rawCumulative = 1;
  const actionResults = actions.map((action) => {
    const result = calculateAction(action);
    rawCumulative *= result.success;
    return { ...result, cumulative: rawCumulative };
  });
  const success = solve(0, initialRerolls);
  let arrived = 1; const firstFailure: number[] = [];
  for (const action of actions) { const base = calculateAction(action); firstFailure.push(arrived * (1 - base.success)); arrived *= base.success; }
  const raw = actions.map(calculateAction);
  const riskiestAction = raw.length ? raw.reduce((best, current, index) => (current.success < raw[best].success ? index : best), 0) : null;
  const failureMass = Math.max(0, 1 - success);
  const turnover = raw.some((a) => a.turnover > 0) ? failureMass : 0;
  return { success, turnover, failure: Math.max(0, failureMass - turnover), actions: actionResults, firstFailure, riskiestAction, explanation: policy === 'optimal' ? 'Estrategia óptima calculada con programación dinámica: compara gastar y conservar cada repetición.' : 'Las ramas comparten el estado de repeticiones de equipo; las probabilidades se enumeran de forma exacta.' };
}
