---
name: clean-code-solid
description: Principios de diseño de este frontend — simplicidad primero, clean code, SOLID en programación funcional, JSDoc, convención de commits y la lista de patrones descartados. Usar SIEMPRE antes de introducir una abstracción, una capa, una librería o un patrón nuevo; y al revisar o refactorizar código existente.
---

# Simple primero

**La simplicidad es el criterio de desempate.** Ante dos diseños que resuelven el problema, gana el
que tiene menos piezas. Un patrón se introduce cuando resuelve un problema que ya existe, nunca uno
que podría existir.

## SOLID en programación funcional

- **SRP** — un archivo, una responsabilidad. El `.api.js` sólo trae datos, el hook sólo orquesta, el
  componente sólo renderiza. Si el nombre necesita un "y", partilo.
- **OCP** — una feature nueva es una carpeta nueva en `src/modules/` más una línea en `App.jsx`.
- **Encapsulación** — un módulo declara su API pública en `index.js`. `App.jsx` nunca importa un
  archivo interno de una feature.
- **ISP** — un componente recibe las props que usa, no un objeto gigante "por si acaso".
- **DIP** — los componentes dependen de la forma de los datos, no de dónde vienen. Cambiar `fetch`
  por otra cosa toca `shared/http` y nada más.

## Idioma del código: inglés

**Todo lo que vive dentro de `src/` y `test/` se escribe en inglés**: identificadores, comentarios,
descripciones de tests, mensajes de error y **los textos de la UI**. La documentación (`README.md`,
estas skills) va en español.

## Documentación: JSDoc, y nada más

Las funciones y componentes exportados llevan **JSDoc**: una línea de descripción, y los `@param` /
`@returns` que apliquen. Es la única documentación que va en el código.

```js
/**
 * @param {Object} props
 * @param {string} props.message
 * @param {Function} [props.onRetry]  When given, renders a retry button.
 * @returns {JSX.Element}
 */
```

Usá `@typedef` cuando una forma se repite (`AsyncState`) en vez de describirla dos veces.

**Lo que NO va en el código:** prosa explicando por qué se eligió un diseño (va en estas skills),
comentarios que repiten la línea siguiente, historia del proyecto o referencias a tarjetas.

Comentarios `//` sueltos sólo para advertir de algo que rompería el código si se toca. Una línea.

## Clean code — reglas concretas

- Componentes cortos; si uno necesita scroll para leerse, partilo.
- **Sin props booleanas de control** que cambien el comportamiento: son dos componentes.
- Nombres del dominio en inglés: `discardedLines`, no `cnt2`.
- Early return en vez de `else` anidado — especialmente en las ramas loading / error / data.
- Inmutabilidad: `map` / `filter` / `reduce`, nunca mutar props ni estado.
- Sin código muerto, sin `TODO` sin dueño, sin variables sin usar.

## Mensajes de commit

[Conventional Commits](https://www.conventionalcommits.org/), verificado por `commitlint` en el hook
`commit-msg`. Un mensaje que no cumple bloquea el commit.

```
<type>: <subject en imperativo, minúscula, sin punto final>

<cuerpo opcional, líneas de hasta 100 caracteres>
```

Types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`.

Los acrónimos en el subject están permitidos (`feat: render the CSV table`): `subject-case` está
relajada a propósito. Lo prohibido es un subject entero en mayúsculas o en PascalCase.

El `pre-commit` corre `npm run test:unit`. Para saltear ambos hooks: `git commit --no-verify`.

## Patrones que se ganan el lugar acá

- **Custom hook** → aísla estado y efectos de la presentación.
- **Barril por módulo** → declara la superficie pública de la feature.
- **Cliente HTTP en `shared`** → un solo lugar traduce fallas de red a errores tipados.
- **Store de Redux Toolkit** → **entró por el enunciado, no por el tamaño del estado**. Ver abajo.

Cuatro. No hacen falta más.

## Redux: por qué está, y qué lo mantiene honesto

Redux **es un punto opcional explícito del challenge** (`TASK-008` / HU-FE-08), así que implementarlo
suma puntaje. Esa —y no el tamaño del estado— es la razón por la que está. Una pantalla y un hook no
piden un store: si el criterio fuera sólo técnico, no estaría.

**No lo saques "simplificando".** Si te parece sobreingeniería, tenés razón en lo técnico y estás
equivocado en lo contractual: el enunciado lo pide. Está acá deliberadamente y con esta nota para que
una sesión futura no lo "corrija".

Lo que sí se negocia es **cómo**, y ahí sigue mandando la simplicidad:

- **Un slice por feature**, en el módulo (`files.slice.js`), no un `store/` global con carpetas por
  tipo de archivo (`actions/`, `reducers/`, `types/`). El store sólo compone lo que cada feature expone.
- **Redux Toolkit, no Redux a mano.** `createSlice` + `createAsyncThunk` dan las tres acciones
  (inicio / éxito / error) y la inmutabilidad vía Immer sin constantes de tipo ni `switch`.
- **Sin ceremonia adicional:** nada de sagas, observables, middlewares propios, estado normalizado ni
  entity adapters para un array de archivos.
- **La página no cambió.** El store se lee desde el hook del módulo, así que `FilesPage` sigue
  recibiendo `{ data, loading, error, reload }` y decidiendo qué rama renderiza.

Si mañana el store creciera a varias features, esta estructura ya escala; y si nunca crece, tampoco
molesta.

## Descartados a propósito — no los reintroduzcas

Si creés que alguno hace falta, justificá con un problema **real y presente**, no hipotético.

| Descartado | Por qué |
|---|---|
| Zustand / Context global como store | El estado global ya vive en Redux Toolkit, que es el que nombra el enunciado. Dos mecanismos de estado global es uno de más. |
| React Query / SWR | El hook son 30 líneas. Una librería de caché para una request es desproporcionado. |
| TypeScript | Prohibido por el enunciado. Los tipos se documentan con JSDoc. |
| Componentes de clase | Requisito explícito: programación funcional y hooks. |
| CSS-in-JS o CSS propio | React Bootstrap ya trae el sistema de diseño. |
| Barrel `index.js` en `shared/` | `shared` no es una feature: se importa el archivo concreto. |
| Router | Hay una sola pantalla. |

## Antes de agregar una abstracción, preguntate

1. ¿Qué problema **concreto y actual** resuelve?
2. ¿Cuántos lugares la usarían hoy? Si es uno, no es abstracción: es indirección.
3. ¿Alguien que lee el código por primera vez la entiende sin explicación?
