import type { SkillDefinition } from '../types';

export const SKILLS: SkillDefinition[] = [
  { id: 'block', label: 'Placar', relevantTo: ['block'], description: 'Convierte ambos derribados en un resultado seguro para el atacante.' },
  { id: 'dodge', label: 'Esquivar', relevantTo: ['dodge', 'block'], description: 'Repite una esquiva fallida; evita defensor tropieza al bloquear.' },
  { id: 'sureHands', label: 'Manos seguras', relevantTo: ['pickup'], description: 'Repite una recogida fallida.' },
  { id: 'sureFeet', label: 'Pies firmes', relevantTo: ['gfi'], description: 'Repite una tirada de A por ellos fallida.' },
  { id: 'pass', label: 'Pasar', relevantTo: ['pass'], description: 'Repite un pase fallido.' },
  { id: 'catch', label: 'Atrapar', relevantTo: ['catch', 'handoff'], description: 'Repite una recepción fallida.' },
  { id: 'pro', label: 'Profesional', relevantTo: ['dodge', 'gfi', 'pickup', 'pass', 'catch', 'handoff', 'block'], description: 'Puede habilitar una repetición con 3+.' },
  { id: 'loner', label: 'Solitario', relevantTo: ['dodge', 'gfi', 'pickup', 'pass', 'catch', 'handoff', 'block'], description: 'La repetición de equipo requiere una prueba.' },
  { id: 'tackle', label: 'Placaje', relevantTo: ['dodge', 'block'], description: 'Anula Esquivar del rival.' },
  { id: 'wrestle', label: 'Luchador', relevantTo: ['block'], description: 'Puede colocar boca abajo a ambos jugadores.' },
  { id: 'brawler', label: 'Brawler', relevantTo: ['block'], description: 'Repite un ambos derribados en un placaje.' },
  { id: 'mightyBlow', label: 'Golpe mortífero', relevantTo: ['block'], description: 'Optimiza +1 en armadura o heridas.' },
  { id: 'breakTackle', label: 'Break Tackle', relevantTo: ['dodge'], description: 'Modificador manual de esquiva.' },
  { id: 'twoHeads', label: 'Dos cabezas', relevantTo: ['dodge'], description: 'Modificador manual de esquiva.' },
  { id: 'tentacles', label: 'Cola prensil', relevantTo: ['dodge'], description: 'Modificador manual de esquiva.' },
  { id: 'standFirm', label: 'Mantenerse firme', relevantTo: ['block'], description: 'Evita ser empujado.' },
  { id: 'stripBall', label: 'Robar balón', relevantTo: ['block'], description: 'El empujón puede soltar el balón.' },
  { id: 'frenzy', label: 'Furia', relevantTo: ['block'], description: 'Requiere un segundo placaje tras un empujón.' },
  { id: 'grab', label: 'Agarrar', relevantTo: ['block'], description: 'Controla el empujón.' },
  { id: 'claws', label: 'Garras', relevantTo: ['block'], description: 'Mejora la armadura como regla local documentada.' },
  { id: 'thickSkull', label: 'Cabeza dura', relevantTo: ['block'], description: 'Reduce KO según la regla aplicable.' },
  { id: 'sidestep', label: 'Escurridizo', relevantTo: ['block'], description: 'El defensor controla su desplazamiento.' },
];

// Only expose selectors for effects that have a discrete resolver. The complete catalogue
// remains local so unsupported rules can be documented without implying an effect.
const RESOLVED = new Set(['block', 'dodge', 'sureHands', 'sureFeet', 'pass', 'catch', 'tackle', 'wrestle', 'mightyBlow', 'stripBall', 'twoHeads', 'tentacles']);
export const skillsFor = (type: string) => SKILLS.filter((skill) => RESOLVED.has(skill.id) && skill.relevantTo.includes(type as never));
