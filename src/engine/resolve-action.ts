import type { ActionCalculation, BlockObjective, PlayAction, ProbabilityBranch } from '../domain/types';

const faces = ['skull', 'bothDown', 'push', 'push', 'stumble', 'pow'] as const;
type BlockFace = (typeof faces)[number];

const has = (action: PlayAction, skill: string, side: 'player' | 'opponent' = 'player') =>
  (side === 'player' ? action.player?.skills : action.opponent?.skills)?.includes(skill as never) ?? false;

export const probabilityForTarget = (target: number) => {
  const safeTarget = Number.isFinite(target) ? target : 3;
  return Math.max(0, Math.min(1, (7 - safeTarget) / 6));
};

export function armourDamage(armour = 10, mightyBlow = false) {
  let broken = 0;
  let stunned = 0;
  let ko = 0;
  let casualty = 0;
  for (let armourA = 1; armourA <= 6; armourA += 1) for (let armourB = 1; armourB <= 6; armourB += 1) {
    const roll = armourA + armourB;
    const canBreak = roll >= armour || (mightyBlow && roll + 1 >= armour);
    if (!canBreak) continue;
    for (let injuryA = 1; injuryA <= 6; injuryA += 1) for (let injuryB = 1; injuryB <= 6; injuryB += 1) {
      const injury = injuryA + injuryB;
      // MB is allocated after seeing armour, then only when it improves the chosen result.
      const boosted = mightyBlow && roll >= armour && injury + 1 >= 10 ? injury + 1 : injury;
      broken += 1;
      if (boosted >= 10) casualty += 1;
      else if (boosted >= 8) ko += 1;
      else stunned += 1;
    }
  }
  return { breakArmour: broken / 1296, stunned: stunned / 1296, ko: ko / 1296, casualty: casualty / 1296 };
}

function blockFaceValue(face: BlockFace, action: PlayAction): number {
  const objective: BlockObjective = action.blockObjective ?? 'avoidTurnover';
  const block = has(action, 'block');
  const dodgeCancelled = has(action, 'tackle') && has(action, 'dodge', 'opponent');
  const safe = face !== 'skull' && (face !== 'bothDown' || block || has(action, 'wrestle'));
  const knockdown = face === 'pow' || (face === 'stumble' && !has(action, 'dodge', 'opponent')) || face === 'bothDown';
  const push = face === 'push' || face === 'stumble' || face === 'pow';
  const defenderFalls = face === 'pow' || (face === 'stumble' && !dodgeCancelled) || (face === 'bothDown' && has(action, 'wrestle'));
  const damage = armourDamage(action.opponent?.armour, has(action, 'mightyBlow'));
  if (objective === 'avoidTurnover') return Number(safe);
  if (objective === 'push') return Number(push);
  if (objective === 'knockdown') return Number(knockdown);
  if (objective === 'safeKnockdown') return Number(defenderFalls && safe);
  if (objective === 'stripBall') return Number(push && !!action.opponent?.carriesBall && has(action, 'stripBall') && !has(action, 'sureHands', 'opponent'));
  if (objective === 'breakArmour') return defenderFalls ? damage.breakArmour : 0;
  if (objective === 'koOrCasualty') return defenderFalls ? damage.ko + damage.casualty : 0;
  return defenderFalls ? damage.casualty : 0;
}

function blockProbability(action: PlayAction): ActionCalculation {
  const dice = action.blockDice ?? 1;
  let successOutcomes = 0;
  const total = 6 ** dice;
  const iterate = (chosen: BlockFace[]) => {
    if (chosen.length === dice) {
      const outcomes = chosen.map((face) => blockFaceValue(face, action));
      successOutcomes += action.blockFavour === 'defender' ? Math.min(...outcomes) : Math.max(...outcomes);
      return;
    }
    faces.forEach((face) => iterate([...chosen, face]));
  };
  iterate([]);
  const success = successOutcomes / total;
  const defenderFalls = faces.filter((face) => blockFaceValue(face, { ...action, blockObjective: 'knockdown' }) > 0).length / 6;
  const detail = armourDamage(action.opponent?.armour, has(action, 'mightyBlow'));
  const turnover = action.blockObjective === 'avoidTurnover' ? 1 - success : 0;
  const description = `${dice} dado${dice > 1 ? 's' : ''} (${total} combinaciones): ${action.blockFavour === 'defender' ? 'el rival elige el peor resultado' : 'el atacante elige el mejor resultado'} para «${blockObjectiveLabel(action.blockObjective ?? 'avoidTurnover')}».${has(action, 'frenzy') ? ' Furia se señala como una segunda rama obligatoria tras empujón; la UI conserva la acción como prueba separada.' : ''}`;
  return { success, turnover, failure: Math.max(0, 1 - success - turnover), explanation: description, detail: defenderFalls ? detail : undefined, branches: branches(success, turnover, description) };
}

const blockObjectiveLabel = (objective: BlockObjective) => ({ avoidTurnover: 'Evitar turnover', push: 'Empujón o mejor', knockdown: 'Derribar', safeKnockdown: 'Derribo seguro', stripBall: 'Perder balón', breakArmour: 'Romper armadura', koOrCasualty: 'KO o baja', casualty: 'Baja' })[objective];
const branches = (success: number, turnover: number, description: string): ProbabilityBranch[] => [
  { probability: success, state: { actionIndex: 0, teamRerolls: 0, consumedResources: [] }, result: 'continue', description: `Éxito: ${description}` },
  ...(turnover ? [{ probability: turnover, state: { actionIndex: 0, teamRerolls: 0, consumedResources: [] }, result: 'turnover' as const, description: 'Fallo que provoca turnover.' }] : []),
];

function simpleAction(action: PlayAction): ActionCalculation {
  const agilitySkills = (has(action, 'twoHeads') ? 1 : 0) - (has(action, 'tentacles', 'opponent') ? 1 : 0);
  const configuredTarget = Number.isFinite(action.target) ? action.target as number : 3;
  const configuredModifier = Number.isFinite(action.modifier) ? action.modifier as number : 0;
  const target = Math.max(2, Math.min(6, configuredTarget - configuredModifier - agilitySkills));
  const traits: Record<string, number> = { bonehead: 2, reallyStupid: action.adjacentTeammate ? 2 : 4, animalSavage: 4, takeRoot: 2 };
  const actualTarget = action.type === 'activation' ? traits[action.activationTrait ?? 'bonehead'] : target;
  let success = probabilityForTarget(actualTarget);
  const skillReroll = (action.type === 'dodge' && has(action, 'dodge') && !has(action, 'tackle', 'opponent')) ||
    (action.type === 'pickup' && has(action, 'sureHands')) ||
    (action.type === 'gfi' && has(action, 'sureFeet')) ||
    (action.type === 'pass' && has(action, 'pass')) ||
    ((action.type === 'catch' || action.type === 'handoff') && has(action, 'catch')) || !!action.skillReroll;
  if (skillReroll) success = 1 - (1 - success) ** 2;
  const repeat = action.type === 'gfi' ? Math.max(1, action.squares ?? 1) : 1;
  success **= repeat;
  const turnover = action.turnover === false ? 0 : 1 - success;
  const failure = action.turnover === false ? 1 - success : 0;
  const rule = action.type === 'secureBall' ? 'Asegurar el balón usa su prueba propia; Manos seguras no la repite.' : skillReroll ? 'La habilidad aplicable repite solo esta tirada: nunca se repite una repetición.' : 'Se enumeran las seis caras del D6.';
  const description = `${actualTarget}+${action.modifier ? ` (modificador ${action.modifier > 0 ? '+' : ''}${action.modifier})` : ''}${repeat > 1 ? `, ${repeat} pruebas consecutivas` : ''}. ${rule}`;
  return { success, turnover, failure, explanation: description, branches: branches(success, turnover, description) };
}

export function calculateAction(action: PlayAction): ActionCalculation {
  return action.type === 'block' ? blockProbability(action) : simpleAction(action);
}
