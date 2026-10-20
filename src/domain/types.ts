export type ActionType =
  | 'dodge'
  | 'gfi'
  | 'pickup'
  | 'secureBall'
  | 'pass'
  | 'catch'
  | 'handoff'
  | 'activation'
  | 'block';
export type RerollPolicy = 'none' | 'first-failure' | 'selected' | 'optimal';
export type SkillId =
  | 'block'
  | 'dodge'
  | 'sureHands'
  | 'sureFeet'
  | 'pass'
  | 'catch'
  | 'pro'
  | 'loner'
  | 'tackle'
  | 'wrestle'
  | 'brawler'
  | 'mightyBlow'
  | 'breakTackle'
  | 'twoHeads'
  | 'tentacles'
  | 'standFirm'
  | 'stripBall'
  | 'frenzy'
  | 'grab'
  | 'claws'
  | 'thickSkull'
  | 'sidestep';

export interface PlayerConfiguration { skills: SkillId[]; lonerTarget?: number; pro?: boolean }
export interface OpponentConfiguration { skills: SkillId[]; carriesBall?: boolean; armour?: number }
export interface PlayAction {
  id: string;
  type: ActionType;
  label?: string;
  target?: number;
  modifier?: number;
  squares?: number;
  player?: PlayerConfiguration;
  opponent?: OpponentConfiguration;
  skillReroll?: boolean;
  teamReroll?: boolean;
  turnover?: boolean;
  mandatory?: boolean;
  rerollAllowed?: boolean;
  activationTrait?: 'bonehead' | 'reallyStupid' | 'animalSavage' | 'takeRoot';
  adjacentTeammate?: boolean;
  blockDice?: 1 | 2 | 3;
  blockFavour?: 'attacker' | 'defender';
  blockObjective?: BlockObjective;
  blitz?: boolean;
  followUp?: boolean;
}
export type BlockObjective = 'avoidTurnover' | 'push' | 'knockdown' | 'safeKnockdown' | 'stripBall' | 'breakArmour' | 'koOrCasualty' | 'casualty';
export interface CalculationState { actionIndex: number; teamRerolls: number; consumedResources: string[] }
export interface ProbabilityBranch { probability: number; state: CalculationState; result: 'continue' | 'success' | 'failure' | 'turnover'; description: string }
export interface ActionCalculation { success: number; turnover: number; failure: number; explanation: string; branches: ProbabilityBranch[]; detail?: { breakArmour?: number; stunned?: number; ko?: number; casualty?: number } }
export interface CalculationResult { success: number; turnover: number; failure: number; actions: Array<ActionCalculation & { cumulative: number }>; firstFailure: number[]; riskiestAction: number | null; explanation: string }
export interface SkillDefinition { id: SkillId; label: string; relevantTo: ActionType[]; description: string }
