import { createAction } from '../domain/actions/defaults';
import type { PlayAction } from '../domain/types';

const action = (type: PlayAction['type'], patch: Partial<PlayAction> = {}): PlayAction => ({ ...createAction(type), ...patch });
export const EXAMPLES: Record<string, { label: string; actions: PlayAction[] }> = {
  twoDodges: { label: 'Dos esquivas a 2+', actions: [action('dodge', { target: 2 }), action('dodge', { target: 2 })] },
  blockDodge: { label: 'Placaje 1D + esquiva 2+', actions: [action('block', { player: { skills: ['block'] }, target: 2 }), action('dodge', { target: 2 })] },
  safePickup: { label: 'Recoger 3+ con Manos seguras', actions: [action('pickup', { target: 3, player: { skills: ['sureHands'] } })] },
  sillyBlitzGfi: { label: 'Realmente estúpido, placaje 2D y A por ellos', actions: [action('activation', { activationTrait: 'reallyStupid', adjacentTeammate: true }), action('block', { blockDice: 2, player: { skills: ['block'] } }), action('gfi', { target: 2 })] },
  passCatch: { label: 'Pase 3+ y recepción 2+', actions: [action('pass', { target: 3 }), action('catch', { target: 2 })] },
  mightyBlow: { label: 'Golpe mortífero contra AV 10+', actions: [action('block', { player: { skills: ['mightyBlow'] }, opponent: { skills: [], armour: 10 }, blockObjective: 'casualty' })] },
};
