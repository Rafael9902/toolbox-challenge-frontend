# toolbox-challenge-frontend

Cliente en React del API del challenge: consume `GET /files/data`, aplana la respuesta y la muestra
en una tabla.

> **Estado:** el alcance obligatorio del challenge está completo (`FRONTEND - TASK-001` a `TASK-006`).
> Los puntos opcionales siguen pendientes; el detalle está en [Puntos opcionales](#puntos-opcionales).

**Índice:** [Requisitos](#requisitos) · [Levantar la app completa](#levantar-la-app-completa) ·
[Qué se ve en pantalla](#qué-se-ve-en-pantalla) · [Decisiones de diseño](#decisiones-de-diseño) ·
[Puntos opcionales](#puntos-opcionales) · [Arquitectura](#arquitectura) ·
[Configuración](#configuración) · [Tests](#tests) · [CI y git hooks](#ci-y-git-hooks)

---

## Requisitos

| Ítem | Valor |
|---|---|
| Runtime | **NodeJS 16** (probado en `v16.20.2`, npm `8.19.4`) |
| Dependencias globales | ninguna — todo sale de `package.json` |
| Variables de entorno | ninguna, ni obligatoria ni opcional |
| Puerto del dev server | **8080** |
| Backend | tiene que estar corriendo en `http://localhost:3000` |

El repo incluye `.nvmrc`:

```bash
nvm use     # lee .nvmrc -> 16
node -v     # debe imprimir v16.20.2
```

A diferencia del backend, **NodeJS 16 sí tiene build nativa para Apple Silicon**: acá no hace falta
Rosetta.

## Levantar la app completa

La app no sirve datos por sí sola: necesita el API del repo `toolbox-challenge-backend`. Los dos
proyectos corren en **versiones distintas de NodeJS**, así que van en **dos terminales separadas**.

### Terminal 1 — el API, en NodeJS 14

```bash
cd toolbox-challenge-backend
nvm use          # -> 14
npm install
npm start        # queda escuchando en http://localhost:3000
```

> **En Apple Silicon**, NodeJS 14 no tiene build arm64: hay que abrir primero un shell x86_64 con
> `arch -x86_64 zsh` y recién ahí correr `nvm use`. El README del backend lo explica en detalle.
> Este repo no lo necesita.

### Terminal 2 — el frontend, en NodeJS 16

```bash
cd toolbox-challenge-frontend
nvm use          # -> 16
npm install
npm start        # abre http://localhost:8080
```

Abrí **http://localhost:8080** y vas a ver la tabla.

### Comandos

```bash
npm start                # dev server con hot reload en :8080
npm run build            # bundle de producción en dist/
npm test                 # toda la suite (Jest + React Testing Library)
npm run test:unit        # sólo los tests unitarios
npm run test:integration # sólo los tests de integración
```

## Qué se ve en pantalla

Una barra superior con el título y, debajo, la tabla con una fila por línea válida:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  React Test App                                                               │
├───────────┬──────────────┬───────────┬────────────────────────────────────────┤
│ File Name │ Text         │ Number    │ Hex                                    │
├───────────┼──────────────┼───────────┼────────────────────────────────────────┤
│ test2.csv │ YcCXKLtFlxm  │ 89632563  │ 17cd994543cc9428c90dbf011c269ea3       │
│ test3.csv │ g            │ 101382507 │ 65badd1f29e6235199261cd3026a97f5       │
│ test3.csv │ mwmBQxoeKkx… │ 57685292  │ cb6dfa6422d170d2ae99aaf3f99665e4       │
│ …         │ …            │ …         │ …                                      │
└───────────┴──────────────┴───────────┴────────────────────────────────────────┘
```

La tabla es **plana**: el nombre del archivo se repite en cada una de sus líneas.

### Van a faltar archivos, y está bien

El API externo del challenge sirve datos **sucios a propósito**, así que la mayoría de las líneas se
descartan antes de llegar acá. En la corrida del 2026-08-30 el API devolvió **7 archivos**, de los
cuales **4 llegaron sin ninguna línea válida** y sólo tres aportaron filas:

| Archivo | Filas en la tabla |
|---|---|
| `test2.csv` | 1 |
| `test3.csv` | 3 |
| `test9.csv` | 11 |
| `test1.csv`, `test6.csv`, `test15.csv`, `test18.csv` | 0 |

**Que la tabla muestre pocas filas no es una falla de la app**: es el descarte de líneas corruptas
funcionando. El desglose por motivo está en el README del backend. Los archivos sin líneas válidas
simplemente no aportan filas; si **ninguno** aporta, la pantalla muestra el estado vacío en lugar de
una tabla con encabezados y nada debajo.

### Los otros tres estados

| Estado | Cuándo | Qué se ve |
|---|---|---|
| Cargando | mientras la petición está en vuelo | spinner de React Bootstrap |
| Error | el API no responde o devuelve un status de falla | alerta roja con mensaje claro y botón **Retry** |
| Vacío | la respuesta llegó pero no hay ninguna línea válida | aviso de que no hay datos |

**Sólo uno de los cuatro estados se muestra a la vez**, incluso cuando el hook tiene datos viejos y una
petición nueva en vuelo. Es una invariante con tests propios; ver [Tests](#tests).

Si al abrir la app ves el estado de error, lo más probable es que **el backend no esté levantado**.

## Decisiones de diseño

### Herramientas

- **Webpack, no Vite.** El enunciado nombra Webpack en los requisitos técnicos del frontend. Vite sería
  mejor experiencia de desarrollo, pero acá manda la consigna.
- **Babel está permitido en el frontend.** El enunciado lo prohíbe explícitamente para el API, no para
  el cliente, y hace falta para JSX. Lo que sigue prohibido —y no se usa— es TypeScript.
- **Sin `"type": "module"`.** El código de `src/` es ESM y lo transpila Babel, mientras `webpack.config.js`,
  `babel.config.js`, `jest.config.js` y `commitlint.config.js` quedan en CommonJS. Declararlo rompería
  los cuatro configs de una.
- **Jest, no Vitest.** El punto opcional del enunciado nombra Jest.
- **CSS extraído en producción** con `mini-css-extract-plugin`. Sin él, los 227 KB de Bootstrap viajan
  dentro del bundle de JS y no se pueden cachear aparte. Con él, el build emite `main.[hash].js` (178 KB)
  y `main.[hash].css` (227 KB) por separado. En desarrollo el CSS sigue inline, para que funcione el HMR.

### Aplicación

- **Cross-origin resuelto con CORS en el backend**, no con el proxy del Dev Server. El API responde
  `Access-Control-Allow-Origin: *`, así que la app apunta a la URL absoluta. La alternativa —`devServer.proxy`
  y una baseUrl relativa— sólo funciona mientras el dev server esté en el medio, y deja de servir en
  cuanto el bundle se sirve como estático.
- **Sin Redux y sin router.** Hay una pantalla y un hook: Redux es un punto opcional con su propia
  tarjeta, y un router no tendría ninguna ruta que resolver. `pages/` distingue la vista *conectada* de
  los componentes presentacionales, no implica routing.
- **El aplanado vive en una función pura**, `toFileRows.js`, fuera del componente. Recibe
  `[{ file, lines }]` y devuelve filas planas, así se testea sin renderizar nada y la tabla sólo se
  ocupa de mostrar.
- **La `key` de cada fila es `file|number|hex`**, derivada de los datos y nunca del índice del array:
  con el índice, React reusa el nodo equivocado si la lista se filtra o se reordena.
- **Cada petición se cancela al desmontar** con `AbortController`, y el `AbortError` se ignora en vez de
  mostrarse: es el cleanup del propio efecto, no una falla que le importe al usuario.
- **Los mensajes técnicos no llegan a la UI.** `shared/http/httpClient.js` traduce las fallas de
  transporte a un `ApiError` con texto apto para mostrar; un `ECONNREFUSED` se ve como
  "The API is unreachable. Is it running?".

### Versiones fijadas por NodeJS 16

`webpack-dev-server@4`, `husky@8` y `@commitlint/cli@17`: las majors siguientes exigen Node 18+. Además
hay un `overrides` para `@testing-library/dom`, que npm resolvía a una 10.x incompatible aunque React
Testing Library 14 declara `^9.0.0`. El detalle está en `.claude/skills/node16-constraints/`.

## Puntos opcionales

Ninguno de los tres del frontend está implementado; el alcance entregado es el obligatorio completo.

| Punto opcional | Estado | Tarjeta |
|---|---|---|
| Filtro por `fileName` | pendiente | `TASK-007` |
| Redux | pendiente | `TASK-008` |
| Docker | pendiente | `TASK-010` |

Los tests con **Jest** —que el enunciado lista como opcional— sí están, desde el primer commit.

El código está preparado para el filtro: `FilesTable` recibe las filas ya aplanadas, así que filtrar es
cuestión de acotar el array antes de pasárselo, sin tocar el componente.

## Arquitectura

Modular por feature, con el mismo criterio que el backend. Cada módulo expone sólo lo que la app monta:

```
src/
├── index.jsx                       # entry point: monta React y carga el CSS de Bootstrap
├── App.jsx                         # compone el shell con las features
├── modules/
│   └── files/
│       ├── index.js                # barril: API pública del módulo (sólo la página)
│       ├── files.api.js            # única capa que habla HTTP
│       ├── toFileRows.js           # función pura: [{ file, lines }] -> filas planas
│       ├── hooks/useFilesData.js   # estado y efectos; devuelve datos planos
│       ├── components/FilesTable.jsx  # presentacional: recibe filas, no pide nada
│       └── pages/FilesPage.jsx     # vista conectada: cablea el hook con los componentes
└── shared/
    ├── config.js                   # configuración, valores hardcodeados
    ├── apiError.js                 # errores tipados
    ├── http/httpClient.js          # cliente del API
    └── components/                 # Layout, Loading, ErrorAlert, EmptyState
```

**Reglas de capa:** la página pregunta, el hook orquesta, el api trae, el componente muestra. Un
componente nunca llama a `fetch` ni a un hook de datos; un hook nunca devuelve JSX; `files.api.js` nunca
conoce React.

**Encapsulación:** un módulo declara su API pública en `index.js`. `App.jsx` nunca importa un archivo
interno de una feature, y un módulo sólo puede importar de sí mismo o de `shared/`, nunca de otro módulo.

**Programación funcional, sin clases.** Componentes función y hooks, que es requisito explícito del
challenge: no hay `class`, ni `this`, ni `componentDidMount`.

## Configuración

Todos los valores viven en `src/shared/config.js`. No se leen variables de entorno.

| Setting | Valor | Descripción |
|---|---|---|
| `api.baseUrl` | `http://localhost:3000` | Dónde escucha el API del challenge |

Si el backend corre en otro puerto, se cambia ahí.

## Tests

**Jest + React Testing Library**, sobre jsdom. La suite corre **sin red real**: `fetch` está mockeado en
todos los niveles.

```bash
npm test                 # 77 tests, 7 suites
npm run test:unit        # sólo test/unit
npm run test:integration # sólo test/integration
```

```
test/
├── setup.js              # carga los matchers de @testing-library/jest-dom
├── styleMock.js          # los imports de CSS que Jest no necesita interpretar
├── unit/                 # piezas aisladas
│   ├── httpClient.test.js    # traducción de fallas de red y de status a ApiError
│   ├── useFilesData.test.js  # ciclo de la petición, cancelación, reintento
│   ├── toFileRows.test.js    # el aplanado y la unicidad de las keys
│   ├── components.test.jsx   # Loading, ErrorAlert, FilesTable con props fijas
│   ├── layout.test.jsx       # grid responsive y ausencia de CSS propio
│   └── FilesPage.test.jsx    # los cuatro estados y su exclusividad
└── integration/
    └── App.test.jsx          # la app completa con fetch mockeado
```

Las consultas van **por rol y por texto accesible** (`getByRole('table')`, `getByRole('alert')`), nunca
por clases de Bootstrap: así un cambio de estilo no rompe los tests.

Dos tests merecen mención porque cuidan invariantes en vez de features:

- **Exclusividad de estados.** Una tabla de escenarios recorre cada combinación que el hook puede
  devolver —incluidos "reintento en vuelo sobre una falla previa" y "falla que llega sobre datos ya
  cargados"— y afirma que hay exactamente un estado en pantalla.
- **La `key` no es el índice.** Se verifica inspeccionando el elemento React, no el DOM, porque el DOM
  no expone las keys. El camino intuitivo —espiar el warning de React— no sirve: React deduplica ese
  warning por componente, así que el test pasaría aun sin keys.

## CI y git hooks

En cada push a `main` y en cada pull request, GitHub Actions corre sobre **NodeJS 16**
(`.github/workflows/ci.yml`):

| Check | Corre |
|---|---|
| `unit tests on NodeJS 16` | `npm run test:unit` |
| `integration tests on NodeJS 16` | `npm run test:integration` |
| `Production build on NodeJS 16` | `npm run build` |

Cada uno reporta su propio check, y ninguno cancela al otro, para ver cuál falló sin abrir el log. El
build va aparte porque **una suite verde no dice nada sobre si el bundle sigue compilando**.

`npm install` instala los hooks vía husky (script `prepare`):

| Hook | Qué corre | Bloquea si |
|---|---|---|
| `pre-commit` | `npm run test:unit` | algún test unitario falla |
| `commit-msg` | `commitlint` | el mensaje no sigue [Conventional Commits](https://www.conventionalcommits.org/) |

Types válidos: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`,
`test`. Para saltearlos en una emergencia: `git commit --no-verify`.

## Skills de Claude Code

`.claude/skills/` contiene las reglas de arquitectura de este proyecto en formato ejecutable por Claude
Code, y sirven como documentación de diseño:

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
