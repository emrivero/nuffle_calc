import { useEffect, useMemo, useState } from 'react';
import { ActionCard } from './components/ActionCard';
import { Results } from './components/Results';
import { createAction } from './domain/actions/defaults';
import { calculateSequence } from './engine';
import { EXAMPLES } from './examples/plays';
import { decodePlay, encodePlay, loadPlay, savePlay, type SavedPlay } from './persistence/play-storage';
import type { ActionType, PlayAction, RerollPolicy } from './domain/types';

const initial: SavedPlay = { version: 1, actions: [createAction('dodge', { target: 2 })], teamRerolls: 1, policy: 'optimal' };
const POLICY_HELP: Record<RerollPolicy, string> = {
  none: 'Ignora las repeticiones de equipo para mostrar el riesgo de la jugada sin gastar recursos.',
  'first-failure': 'Gasta una repetición de equipo en la primera acción que falle y pueda repetirse.',
  selected: 'Solo gasta una repetición en las acciones donde actives «Marcar para repetición».',
  optimal: 'Compara gastar o guardar cada repetición y elige la opción con mayor probabilidad de completar la secuencia.',
};
function fromHash() { const match = location.hash.match(/^#play=([^&]+)$/); return match ? decodePlay(match[1]) : null; }

export default function App() {
  const [play, setPlay] = useState<SavedPlay>(() => fromHash() ?? loadPlay() ?? initial);
  const [notice, setNotice] = useState('');
  useEffect(() => savePlay(play), [play]);
  const result = useMemo(() => calculateSequence(play.actions, { teamRerolls: play.teamRerolls, policy: play.policy }), [play]);
  const withoutRerolls = useMemo(() => calculateSequence(play.actions, { policy: 'none' }).success, [play.actions]);
  const updateAction = (index: number, action: PlayAction) => setPlay((current) => ({ ...current, actions: current.actions.map((item, position) => position === index ? action : item) }));
  const add = (type: ActionType = 'dodge') => setPlay((current) => ({ ...current, actions: [...current.actions, createAction(type)] }));
  const duplicate = (index: number) => setPlay((current) => { const copy = { ...current.actions[index], id: `${current.actions[index].id}-copy-${Date.now()}` }; const actions = [...current.actions]; actions.splice(index + 1, 0, copy); return { ...current, actions }; });
  const move = (index: number, direction: -1 | 1) => setPlay((current) => { const actions = [...current.actions]; [actions[index], actions[index + direction]] = [actions[index + direction], actions[index]]; return { ...current, actions }; });
  const share = async () => { const hash = `#play=${encodePlay(play)}`; history.replaceState(null, '', hash); try { await navigator.clipboard.writeText(location.href); setNotice('Enlace compartible copiado.'); } catch { setNotice('El enlace ya está en la barra de direcciones.'); } };
  return <div className="shell"><header><div className="brand-mark" aria-hidden="true">⚄</div><div><h1>NuffleCalc</h1><p>Calcula la jugada antes de tentar a Nuffle.</p></div><span className="unofficial">Herramienta no oficial</span></header>
    <main><section className="intro"><p>Construye una secuencia de acciones y descubre la probabilidad real de completarla.</p><p className="muted">Tú preparas la jugada. Nuffle decide el resultado.</p></section>
      <section className="control-panel"><h2>Recursos y estrategia</h2><label>Repeticiones de equipo<input type="number" min="0" max="8" value={play.teamRerolls} onChange={(e) => setPlay({ ...play, teamRerolls: Math.max(0, Number(e.target.value)) })} /></label><label className="policy-control"><span className="policy-label">Política <details className="policy-info"><summary aria-label="Explicar política de repetición">?</summary><div className="policy-popover">{POLICY_HELP[play.policy]}</div></details></span><select value={play.policy} onChange={(e) => setPlay({ ...play, policy: e.target.value as RerollPolicy })}><option value="none">No usar repetición</option><option value="first-failure">Primer fallo</option><option value="selected">Solo acciones marcadas</option><option value="optimal">Estrategia óptima</option></select></label><label>Ejemplos<select defaultValue="" onChange={(e) => { const sample = EXAMPLES[e.target.value]; if (sample) setPlay({ ...play, actions: sample.actions.map((item) => ({ ...item, id: `${item.id}-${Date.now()}` })) }); }}><option value="">Cargar ejemplo…</option>{Object.entries(EXAMPLES).map(([id, sample]) => <option key={id} value={id}>{sample.label}</option>)}</select></label><button className="secondary" onClick={() => setPlay({ ...initial, actions: [createAction('dodge', { target: 2 })] })}>Reiniciar</button></section>
      <Results result={result} withoutRerolls={withoutRerolls} />
      <section className="sequence"><div className="section-heading"><div><p className="eyebrow">Secuencia de la jugada</p><h2>Acciones</h2></div><button onClick={() => add()}>+ Añadir acción</button></div>{play.actions.length ? play.actions.map((action, index) => <ActionCard key={action.id} action={action} index={index} total={play.actions.length} onChange={(value) => updateAction(index, value)} onDelete={() => setPlay((current) => ({ ...current, actions: current.actions.filter((_, itemIndex) => itemIndex !== index) }))} onDuplicate={() => duplicate(index)} onMove={(direction) => move(index, direction)} />) : <div className="empty">No hay acciones todavía. Añade una para empezar a calcular.</div>}</section>
      <section className="share"><button onClick={share}>Copiar / compartir jugada</button>{notice && <span>{notice}</span>}<small>Las jugadas se guardan solo en este navegador con claves <code>nufflecalc:</code>.</small></section>
    </main><footer>NuffleCalc — Calculadora de probabilidades para Fantasy Football.</footer></div>;
}
