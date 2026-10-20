import type { ActionType, PlayAction } from '../types';

let counter = 0;
export const createAction = (type: ActionType = 'dodge', patch: Partial<PlayAction> = {}): PlayAction => ({
  id: `action-${Date.now()}-${counter++}`,
  type,
  target: type === 'secureBall' ? 2 : 3,
  modifier: 0,
  squares: type === 'gfi' ? 1 : 1,
  player: { skills: [] },
  opponent: { skills: [], armour: 10 },
  turnover: true,
  mandatory: true,
  rerollAllowed: true,
  blockDice: 1,
  blockFavour: 'attacker',
  blockObjective: 'avoidTurnover',
  ...patch,
});

export const ACTION_LABELS: Record<ActionType, string> = { dodge: 'Esquivar', gfi: 'A por ellos', pickup: 'Recoger el balón', secureBall: 'Asegurar el balón', pass: 'Pasar', catch: 'Atrapar', handoff: 'Entregar el balón', activation: 'Prueba de activación', block: 'Placaje' };
