import { ACTION_LABELS } from '../domain/actions/defaults';
import { skillsFor } from '../domain/skills/catalog';
import type { ActionType, BlockObjective, PlayAction } from '../domain/types';

interface Props { action: PlayAction; index: number; total: number; onChange(action: PlayAction): void; onDelete(): void; onDuplicate(): void; onMove(direction: -1 | 1): void }
const actionTypes = Object.keys(ACTION_LABELS) as ActionType[];
const objectives: Record<BlockObjective, string> = { avoidTurnover: 'Evitar turnover', push: 'Empujón o mejor', knockdown: 'Derribar', safeKnockdown: 'Derribo seguro', stripBall: 'Hacer perder el balón', breakArmour: 'Romper armadura', koOrCasualty: 'KO o baja', casualty: 'Baja' };
const opponentLabels: Record<string, string> = { tackle: 'Placaje', dodge: 'Esquivar', sureHands: 'Manos seguras', tentacles: 'Cola prensil' };

export function ActionCard({ action, index, total, onChange, onDelete, onDuplicate, onMove }: Props) {
  const patch = (value: Partial<PlayAction>) => onChange({ ...action, ...value });
  const playerSkills = action.player?.skills ?? [];
  const opponentSkills = action.opponent?.skills ?? [];
  const setSkill = (skill: string, checked: boolean) => patch({ player: { ...action.player, skills: checked ? [...playerSkills, skill as never] : playerSkills.filter((item) => item !== skill) } });
  const setOpponentSkill = (skill: string, checked: boolean) => patch({ opponent: { ...action.opponent, skills: checked ? [...opponentSkills, skill as never] : opponentSkills.filter((item) => item !== skill) } });
  const normal = action.type !== 'block' && action.type !== 'activation';
  return <article className="action-card">
    <div className="card-title"><span className="action-number">{index + 1}</span><select aria-label={`Tipo de acción ${index + 1}`} value={action.type} onChange={(e) => patch({ type: e.target.value as ActionType, target: e.target.value === 'secureBall' ? 2 : action.target })}>{actionTypes.map((type) => <option key={type} value={type}>{ACTION_LABELS[type]}</option>)}</select><div className="actions"><button title="Subir" disabled={!index} onClick={() => onMove(-1)}>↑</button><button title="Bajar" disabled={index === total - 1} onClick={() => onMove(1)}>↓</button><button title="Duplicar" onClick={onDuplicate}>⧉</button><button title="Eliminar" className="danger" onClick={onDelete}>×</button></div></div>
    <div className="fields">
      {normal && <><label>Dificultad<select value={action.target ?? 3} onChange={(e) => patch({ target: Number(e.target.value) })}>{[2, 3, 4, 5, 6].map((target) => <option key={target} value={target}>{target}+</option>)}</select></label><label>Modificador<input type="number" min="-3" max="3" value={action.modifier ?? 0} onChange={(e) => patch({ modifier: Number(e.target.value) })} /></label></>}
      {action.type === 'gfi' && <label>Casillas<input type="number" min="1" max="6" value={action.squares ?? 1} onChange={(e) => patch({ squares: Number(e.target.value) })} /></label>}
      {action.type === 'activation' && <><label>Rasgo<select value={action.activationTrait ?? 'bonehead'} onChange={(e) => patch({ activationTrait: e.target.value as PlayAction['activationTrait'] })}><option value="bonehead">Cabeza hueca</option><option value="reallyStupid">Realmente estúpido</option><option value="animalSavage">Animal salvaje</option><option value="takeRoot">Echar raíces</option></select></label>{action.activationTrait === 'reallyStupid' && <label className="check"><input type="checkbox" checked={!!action.adjacentTeammate} onChange={(e) => patch({ adjacentTeammate: e.target.checked })} /> Compañero adyacente</label>}</>}
      {action.type === 'block' && <><label>Dados<select value={action.blockDice ?? 1} onChange={(e) => patch({ blockDice: Number(e.target.value) as 1 | 2 | 3 })}>{[1, 2, 3].map((d) => <option key={d} value={d}>{d}</option>)}</select></label><label>Elección<select value={action.blockFavour} onChange={(e) => patch({ blockFavour: e.target.value as 'attacker' | 'defender' })}><option value="attacker">A favor</option><option value="defender">En contra</option></select></label><label>Objetivo<select value={action.blockObjective} onChange={(e) => patch({ blockObjective: e.target.value as BlockObjective })}>{Object.entries(objectives).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label>Armadura<select value={action.opponent?.armour ?? 10} onChange={(e) => patch({ opponent: { ...action.opponent, skills: action.opponent?.skills ?? [], armour: Number(e.target.value) } })}>{Array.from({ length: 9 }, (_, i) => i + 3).map((av) => <option key={av} value={av}>{av}+</option>)}</select></label></>}
      <label className="check"><input type="checkbox" checked={action.teamReroll ?? false} onChange={(e) => patch({ teamReroll: e.target.checked })} /> Marcar para repetición</label>
    </div>
    {skillsFor(action.type).length > 0 && <fieldset><legend>Habilidades relevantes del jugador</legend><div className="skills">{skillsFor(action.type).map((skill) => <label key={skill.id} title={skill.description}><input type="checkbox" checked={playerSkills.includes(skill.id)} onChange={(e) => setSkill(skill.id, e.target.checked)} /> {skill.label}</label>)}</div></fieldset>}
    {(action.type === 'dodge' || action.type === 'block') && <fieldset><legend>Habilidades relevantes del rival</legend><div className="skills">{['tackle', 'dodge', 'sureHands', 'tentacles'].map((skill) => <label key={skill}><input type="checkbox" checked={opponentSkills.includes(skill as never)} onChange={(e) => setOpponentSkill(skill, e.target.checked)} /> {opponentLabels[skill]}</label>)}</div></fieldset>}
  </article>;
}
