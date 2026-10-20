import { describe, expect, it } from 'vitest';
import { createAction } from '../domain/actions/defaults';
import { calculateAction, calculateSequence } from '../engine';
import { armourDamage } from '../engine/resolve-action';

const close = (value: number, expected: number) => expect(value).toBeCloseTo(expected, 10);
describe('motor exacto de NuffleCalc', () => {
  it('resuelve D6, habilidades y una repetición', () => {
    close(calculateAction(createAction('dodge', { target: 2 })).success, 5 / 6);
    close(calculateAction(createAction('dodge', { target: 3 })).success, 4 / 6);
    close(calculateAction(createAction('dodge', { target: 2, player: { skills: ['dodge'] } })).success, 35 / 36);
    close(calculateSequence([createAction('dodge', { target: 2 })], { teamRerolls: 1, policy: 'first-failure' }).success, 35 / 36);
    close(calculateAction(createAction('dodge', { target: Number.NaN })).success, 4 / 6);
  });
  it('calcula secuencias sin multiplicar recursos compartidos incorrectamente', () => close(calculateSequence([createAction('dodge', { target: 2 }), createAction('dodge', { target: 2 })], { policy: 'none' }).success, 25 / 36));
  it('enumera 1, 2 y 3 dados de placaje con elección opuesta', () => {
    close(calculateAction(createAction('block')).success, 4 / 6);
    close(calculateAction(createAction('block', { player: { skills: ['block'] } })).success, 5 / 6);
    close(calculateAction(createAction('block', { blockDice: 2, player: { skills: ['block'] } })).success, 35 / 36);
    expect(calculateAction(createAction('block', { blockDice: 2, blockFavour: 'defender', player: { skills: ['block'] } })).success).toBeLessThan(5 / 6);
  });
  it('combina placaje y esquiva', () => close(calculateSequence([createAction('block', { player: { skills: ['block'] } }), createAction('dodge', { target: 2 })], { policy: 'none' }).success, 25 / 36));
  it('aplica recoger, asegurar y activación', () => {
    close(calculateAction(createAction('pickup', { target: 3, player: { skills: ['sureHands'] } })).success, 8 / 9);
    close(calculateAction(createAction('secureBall', { target: 2, player: { skills: ['sureHands'] } })).success, 5 / 6);
    close(calculateAction(createAction('activation', { activationTrait: 'reallyStupid', adjacentTeammate: true })).success, 5 / 6);
    close(calculateAction(createAction('activation', { activationTrait: 'reallyStupid', adjacentTeammate: false })).success, 3 / 6);
  });
  it('enumera armadura y heridas, incluido Golpe mortífero', () => {
    close(armourDamage(10).casualty, 1 / 36);
    close(armourDamage(10, true).casualty, 7 / 108);
    close(armourDamage(9).casualty, 1 / 21.6);
    close(armourDamage(8).casualty, 1 / 14.4);
  });
  it('la estrategia óptima no es voraz', () => {
    const play = [createAction('activation', { activationTrait: 'animalSavage', mandatory: false, turnover: false }), createAction('dodge', { target: 2 })];
    expect(calculateSequence(play, { teamRerolls: 1, policy: 'optimal' }).success).toBeGreaterThan(calculateSequence(play, { teamRerolls: 1, policy: 'first-failure' }).success);
  });
});
