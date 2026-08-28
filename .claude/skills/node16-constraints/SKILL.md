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

`vite` y `vitest` **no se usan acá**: el enunciado nombra Webpack en los requisitos técnicos.

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
