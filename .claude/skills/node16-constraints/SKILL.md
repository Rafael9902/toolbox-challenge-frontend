---
name: node16-constraints
description: Guardarraíles del runtime NodeJS 16 y del toolchain Webpack + Babel de este frontend. Usar SIEMPRE antes de agregar o actualizar una dependencia, de tocar webpack.config.js o babel.config.js, o de usar una API de Node/JavaScript en el build.
---

# NodeJS 16 + Webpack + Babel

El challenge exige **NodeJS 16** para el frontend. El repo trae `.nvmrc`:

```bash
nvm use          # -> 16
```

A diferencia del backend, Node 16 **sí tiene build nativa para Apple Silicon**: no hace falta Rosetta.

## Versiones máximas compatibles

Muchas librerías actuales exigen Node 18+. Al agregar o actualizar cualquier paquete, verificá su
campo `engines`.

| Paquete | Versión | Por qué no la última |
|---|---|---|
| `webpack` | 5.x | |
| `webpack-cli` | 5.x | |
| `webpack-dev-server` | **4.x** | **5.x exige Node 18+** |
| `jest` | 29.x | |
| `@testing-library/react` | 14.x | 15+ exige React 18.3 y Node 18 |
| `husky` | **8.x** | **9.x exige Node 18+** |
| `@commitlint/cli` | **17.x** | **18.x exige Node 18+** |
| `react` / `react-dom` | 18.x | |
| `react-bootstrap` | 2.x | requiere `bootstrap` 5 |
| `@reduxjs/toolkit` | 2.x | ninguna: **la última major sí corre en Node 16** (ver abajo) |
| `react-redux` | 9.x | ninguna: pide React 18+, que ya usamos |

`vite` y `vitest` **no se usan acá**: el enunciado nombra Webpack en los requisitos técnicos.

### Un paquete sin `engines` no está aprobado: está sin declarar

`npm view <paquete>@<major> engines.node` es el primer filtro, no el único. Cuando **no imprime nada**,
como pasa con todo el árbol de Redux, el paquete no declaró requisito y hay que verificarlo a mano:

```bash
npm view @reduxjs/toolkit@2 engines.node   # sin salida -> no declara
npm view @reduxjs/toolkit@2 exports.\".\"    # a dónde resuelve cada condición
```

Lo que se revisó antes de fijar `@reduxjs/toolkit@2` + `react-redux@9` + `redux@5` en Node 16:

1. **`npm install` sin `EBADENGINE`** para los paquetes nuevos ni sus transitivas.
2. **`require()` real en Node 16**, creando un store y despachando una acción.
3. **El mapa de `exports`.** Es lo que rompe en Jest: `jest-environment-jsdom` resuelve con la
   condición `browser`, y si esa rama apunta sólo a ESM, Jest falla con *"Cannot use import statement
   outside a module"*. Acá no pasa: en RTK la condición `browser` tiene un `default` que va al CJS
   (`dist/cjs/index.js`) y `react-redux` ni siquiera declara `browser`. Por eso **no hace falta**
   `customExportConditions` en `jest.config.js`.
4. **`npm test` y `npm run build` en `v16.20.2`.**

Si alguna de las cuatro fallara, el plan B era bajar a `@reduxjs/toolkit@1` + `react-redux@8` +
`redux@4`, que son las últimas majors previas al salto de empaquetado. No hizo falta.

`node-releases@2.0.54` sí avisa `EBADENGINE` (pide Node 18+), pero **ya venía en el lockfile**: es una
transitiva de `browserslist` que sólo aporta datos al build de Babel, y CI en Node 16 pasa con ella.

## Dependencias transitivas: `overrides`

Una dependencia directa compatible puede arrastrar una transitiva que no lo es. `@testing-library/react@14`
declara `@testing-library/dom@^9.0.0`, pero npm resolvía la 10.x, que exige Node 18 y avisa con
`EBADENGINE`. Se fija con `overrides` en `package.json`:

```json
"overrides": { "@testing-library/dom": "^9.3.4" }
```

Si aparece un `EBADENGINE` nuevo en `npm ci`, no lo ignores: significa que algo del árbol dejó de
soportar Node 16. Identificá el paquete y agregalo acá.

## Babel sí está permitido en el frontend

El enunciado prohíbe Babel **en el API**, no acá:

> Backend: *"no utilizar: Babel, TypeScript, Dart, Elm"*
> Frontend: *"No están permitidas: TypeScript, Dart, Elm, ni similares"*

Por eso `babel-loader` para JSX es legítimo. Lo que sigue prohibido es **TypeScript**: nada de `.ts`,
`.tsx` ni tipos en el código. Los tipos se documentan con JSDoc.

## Módulos: el código fuente es ESM, los configs son CommonJS

`package.json` **no** declara `"type": "module"`. Consecuencia:

- `src/` y `test/` usan `import` / `export` — Babel los transpila.
- `webpack.config.js`, `babel.config.js`, `jest.config.js` y `commitlint.config.js` usan
  `module.exports`.

No agregues `"type": "module"`: rompería los cuatro configs de una.

## APIs ausentes o distintas en Node 16

Sólo importa para el **toolchain**; el código de `src/` corre en el navegador.

| No usar en configs / scripts | Usar en su lugar |
|---|---|
| `fetch` global | Node 16 no lo tiene estable; en el navegador sí existe |
| `structuredClone` | spread o `JSON.parse(JSON.stringify())` |
| `Array.prototype.findLast` | `[...arr].reverse().find(...)` |
| `Object.groupBy` | `reduce` |

## Verificar en el runtime real

```bash
nvm use          # confirmá que `node -v` diga v16.x
npm ci
npm test
npm run build
```

Si `node -v` no dice `v16.x`, lo que estés verificando no vale.
