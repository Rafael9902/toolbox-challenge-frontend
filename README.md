# toolbox-challenge-frontend

Cliente en React del API del challenge: consume `/files/data` y muestra la información en pantalla.

> **Estado:** esqueleto de la aplicación (`FRONTEND - TASK-001` y `TASK-002`).
> El consumo de `/files/data` y la tabla de datos corresponden a `TASK-003` y `TASK-004`
> y todavía no están implementados. Hoy la app renderiza el layout y verifica que el API responde.

---

## Requisitos

- **NodeJS 16** (probado en v16.20.2)

El repo incluye `.nvmrc`:

```bash
nvm use
```

A diferencia del backend, NodeJS 16 tiene build nativa para Apple Silicon: no hace falta Rosetta.

## Instalación y uso

```bash
npm install              # instalar dependencias
npm start                # dev server en http://localhost:8080
npm run build            # bundle de producción en dist/
npm test                 # toda la suite (Jest + React Testing Library)
npm run test:unit        # sólo los tests unitarios
npm run test:integration # sólo los tests de integración
```

**El backend tiene que estar levantado** en `http://localhost:3000` para que la app muestre datos.
Ver el repo `toolbox-challenge-backend`.

No hace falta configurar ninguna variable de entorno: todos los valores están en
`src/shared/config.js`.

## Git hooks

`npm install` instala los hooks vía husky (script `prepare`):

| Hook | Qué corre | Bloquea si |
|---|---|---|
| `pre-commit` | `npm run test:unit` | algún test unitario falla |
| `commit-msg` | `commitlint` | el mensaje no sigue [Conventional Commits](https://www.conventionalcommits.org/) |

Para saltearlos en una emergencia: `git commit --no-verify`.

## Arquitectura

Modular por feature, con el mismo criterio que el backend. Cada módulo es autocontenido y expone sólo
lo que la app monta:

```
src/
├── index.jsx                     # entry point: monta React y carga el CSS de Bootstrap
├── App.jsx                       # compone el shell con las features
├── modules/
│   └── files/
│       ├── index.js              # barril: API pública del módulo
│       ├── files.api.js          # única capa que habla HTTP
│       ├── hooks/                # estado y efectos; devuelven datos planos
│       ├── components/           # presentacionales: reciben props
│       └── pages/                # vista conectada: cablea hooks con componentes
└── shared/
    ├── config.js                 # configuración, valores hardcodeados
    ├── apiError.js               # errores tipados
    ├── http/httpClient.js        # cliente del API
    └── components/               # Layout, Loading, ErrorAlert
```

**Reglas de capa:** la página pregunta, el hook orquesta, el api trae, el componente muestra. Un
componente nunca llama a `fetch` ni a un hook de datos; un hook nunca devuelve JSX; el `.api.js` nunca
conoce React.

**`pages/` no implica router.** El challenge es una sola pantalla y el filtro por `fileName` es un
control de UI, no una ruta, así que no hay `react-router-dom`. `pages/` distingue la vista *conectada*
de los componentes presentacionales.

**Encapsulación:** un módulo declara su API pública en `index.js`. `App.jsx` nunca importa un hook ni
un api de una feature. Un módulo sólo puede importar de sí mismo o de `shared/`, nunca de otro módulo.

**Programación funcional:** sin clases, sin `this`, sin `componentDidMount`. Componentes función y
hooks, que es requisito explícito del challenge.

## Estado del servidor

Todo hook que trae datos expone `{ data, loading, error, reload }`, y la pantalla renderiza las tres
ramas. El efecto se cancela con `AbortController` al desmontar, y el `AbortError` se ignora: es el
cleanup del propio efecto, no una falla que mostrarle al usuario.

## Tests

```bash
npm test
```

Jest + React Testing Library, sobre jsdom. La suite corre **sin red real**: `fetch` está mockeado en
todos los niveles.

| Comando | Corre |
|---|---|
| `npm test` | Todo |
| `npm run test:unit` | `test/unit/` — cliente HTTP, hooks, componentes sueltos |
| `npm run test:integration` | `test/integration/` — la app completa con `fetch` mockeado |

Las consultas van por rol y por texto accesible (`getByRole('alert')`), no por clases de Bootstrap,
para que un cambio de estilo no rompa los tests.

En cada push a `main` y en cada pull request, GitHub Actions corre unit, integration y el build de
producción sobre **NodeJS 16** (`.github/workflows/ci.yml`). El build va como paso propio porque una
suite verde no dice nada sobre si el bundle sigue compilando.

## Decisiones de diseño

- **Webpack**, no Vite: el enunciado lo nombra en los requisitos técnicos del frontend.
- **Babel está permitido acá.** El enunciado lo prohíbe para el API, no para el frontend; hace falta
  para JSX. Lo que sigue prohibido es TypeScript.
- **Sin `"type": "module"`.** El código de `src/` es ESM y lo transpila Babel, mientras los cuatro
  configs (`webpack`, `babel`, `jest`, `commitlint`) quedan en CommonJS sin fricción.
- **CSS separado en producción** con `mini-css-extract-plugin`: sin él, el CSS de Bootstrap viajaba
  dentro del bundle de JS y no se podía cachear aparte.
- **Sin Redux ni React Query**: hay una pantalla y un hook. Redux es punto opcional del challenge y se
  evaluará cuando exista estado compartido de verdad.
- **Versiones fijadas por Node 16**: `webpack-dev-server@4`, `husky@8`, `@commitlint/cli@17` — las
  siguientes majors exigen Node 18+. Y un `overrides` para `@testing-library/dom`, que npm resolvía a
  una 10.x incompatible pese a que React Testing Library declara `^9.0.0`. Ver
  `.claude/skills/node16-constraints/`.

## Skills de Claude Code

`.claude/skills/` contiene las reglas de arquitectura de este proyecto en formato ejecutable por
Claude Code, y sirven como documentación de diseño:

| Skill | Cubre |
|---|---|
| `feature-module` | Capas de un módulo, encapsulación, reglas de import |
| `react-patterns` | Componentes funcionales, efectos, cancelación, accesibilidad |
| `node16-constraints` | Versiones compatibles, Webpack + Babel, ESM vs CommonJS |
| `testing-jest` | Qué se mockea en cada nivel, queries por rol, escenarios obligatorios |
| `clean-code-solid` | SOLID funcional, JSDoc, commits, patrones descartados |

## Historias de usuario

El backlog completo del proyecto —las 10 historias con criterios de aceptación en Gherkin, estimación
y chequeo INVEST— está en [`docs/user-stories.md`](docs/user-stories.md).
