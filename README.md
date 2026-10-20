# NuffleCalc

NuffleCalc es una calculadora estática de probabilidades para Fantasy Football. Permite encadenar acciones, aplicar recursos compartidos y ver las ramas de fallo sin simulación aleatoria. «Tú preparas la jugada. Nuffle decide el resultado.»

## Requisitos y uso

Requiere Node.js 20 o posterior.

```bash
npm install
npm run dev
npm test
npm run lint
npm run typecheck
npm run build
```

`npm run build` produce `dist/`, una salida estática que funciona sin servidor. Vite usa `base: './'`, por lo que puede publicarse en un subdirectorio. Para GitHub Pages, publique el contenido de `dist/`; para Cloudflare Pages, use `npm run build` como comando y `dist` como directorio de salida. No hay variables de entorno, API ni backend.

## Arquitectura

El motor vive en `src/engine` y no importa React, el DOM ni `localStorage`. La API pública es:

```ts
export { calculateSequence, calculateAction, createInitialCalculationState } from './engine';
```

Los tipos públicos (`PlayAction`, `PlayerConfiguration`, `OpponentConfiguration`, `CalculationState`, `CalculationResult`, `ProbabilityBranch` y `SkillDefinition`) están en `src/domain/types.ts`. `resolve-action.ts` enumera las caras de D6, las 36/216 combinaciones de placaje y las combinaciones 2D6 de armadura/heridas. `calculate-sequence.ts` usa memoización para comparar gastar o guardar una repetición bajo la estrategia óptima.

Las configuraciones se guardan localmente con el prefijo `nufflecalc:` (`nufflecalc:last-play`) y se comparten con `#play=<configuración_serializada>`. El formato tiene versión para permitir evolucionarlo.

## Extensión e integración futura

Para añadir una acción, agregue el identificador a `ActionType`, sus valores iniciales en `domain/actions/defaults.ts`, un resolutor en `engine/resolve-action.ts` y la tarjeta de configuración. Para una habilidad, añada una definición con etiqueta española al catálogo y su efecto discreto al resolutor; una habilidad no debe aparecer como funcional hasta tener efecto matemático.

Para integrarlo en otra aplicación, copie `src/domain` y `src/engine`, conservando los modelos públicos. La aplicación anfitriona puede reemplazar el catálogo local de habilidades sin acoplarse a React.

## Matriz de reglas soportadas

| Área | Soportado |
| --- | --- |
| D6, modificadores, objetivos 2+–6+, turnover | Sí |
| Esquivar, A por ellos, recoger, asegurar, pasar, atrapar, entregar | Sí; repeticiones de habilidad relevantes |
| Activación | Cabeza hueca, Realmente estúpido con/sin apoyo, Animal salvaje, Echar raíces |
| Placaje | 1–3 dados, a favor/en contra, objetivos, Placar, Esquivar, Placaje, Luchador y cálculo de armadura/heridas |
| Armadura/heridas | Tabla 2–7/8–9/10–12 y Golpe mortífero optimizado |
| Recursos | equipo, habilidad y estrategia óptima con memoización |

Las etiquetas de Furia, Agarrar, Apartar, Mantenerse firme, Garras y Cabeza dura se mantienen en el catálogo para documentar alcance e integración. Sus interacciones de movimiento/elección compleja no se presentan como resueltas automáticamente; el README y la interfaz no las usan como resultados falsos. La aplicación es una herramienta no oficial y no usa marcas, logotipos ni material artístico protegido.
