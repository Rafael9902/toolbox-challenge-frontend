---
name: feature-module
description: Reglas de la arquitectura modular por feature de este frontend (api → hooks → components, encapsulación del módulo, reglas de import). Usar SIEMPRE al crear o modificar archivos dentro de src/modules/ o src/shared/, al agregar una pantalla o un llamado al API, al mover lógica entre capas, o al decidir dónde va una pieza nueva.
---

# Arquitectura modular por feature

Cada feature es una carpeta autocontenida en `src/modules/<feature>/`.

**Todo el código va en inglés** —nombres, comentarios, textos de UI—. Ver la skill `clean-code-solid`.

## Anatomía de un módulo

```
src/modules/<feature>/
├── index.js                  # barril: declara la API pública del módulo
├── <feature>.api.js          # única capa que habla HTTP
├── hooks/
│   └── useThing.js           # estado y efectos; devuelven datos planos
├── components/
│   └── Thing.jsx             # presentacionales: reciben props, sin estado propio
└── pages/
    └── <Feature>Page.jsx     # vista conectada: cablea hooks con componentes
```

Un archivo por hook y por componente, nombrado como lo que exporta (`useHealth.js`, `HealthBadge.jsx`).
El `.api.js` queda plano: es un solo archivo, y una carpeta para un archivo no organiza nada.

**No agregues capas que no tengan trabajo real.** Si la feature no llama al API, no lleva `.api.js`;
si no tiene estado asincrónico, no lleva hook.

### `pages/` no implica router

**Este proyecto no tiene router y no lo necesita:** el challenge es una sola pantalla, y el filtro por
`fileName` es un control de UI, no una ruta. `pages/` acá significa **vista conectada** —la que llama
hooks y decide qué rama renderizar— por oposición a `components/`, que son presentacionales puros.

No agregues `react-router-dom` porque exista una carpeta `pages`. Ver la tabla de descartados en
`clean-code-solid`.

## Reglas de capa

| Capa | Puede | NUNCA |
|---|---|---|
| `*.api.js` | Llamar al backend vía `shared/http`, devolver datos planos, lanzar `ApiError` tipado | Conocer React, tocar estado, formatear para la vista |
| `hooks/` | `useState` / `useEffect`, orquestar llamadas, exponer `{ data, loading, error }` | Devolver JSX, importar componentes, conocer clases de CSS |
| `pages/` | Llamar hooks, decidir qué rama se renderiza, componer componentes | Llamar al `.api.js` directo, contener lógica de negocio |
| `components/` | Renderizar props, emitir eventos hacia arriba | Llamar hooks de datos, hacer requests, tener estado de servidor |

Regla mnemotécnica: **la página pregunta, el hook orquesta, el api trae, el componente muestra.**
Si un componente importa `*.api.js` o un hook de datos, está mal.

El corte entre `pages/` y `components/` no es cosmético: un componente que sólo recibe props se testea
con `render(<X prop="..." />)` y sin mocks, mientras que la página se testea con el hook mockeado o
por integración.

## Encapsulación: el barril es la única puerta

Un módulo expone **los componentes que la app monta, y nada más**. El hook y el api son privados.

```js
// src/modules/files/index.js
export { FilesHealth } from './FilesHealth.jsx'

// src/App.jsx
import { FilesHealth } from './modules/files/index.js'
```

`App.jsx` **nunca** importa un hook ni un api de una feature. Si necesita hacerlo, la abstracción del
módulo está rota.

Reglas del barril: **sólo reexporta**, cero lógica. Y sólo lo que la app realmente monta.

## Reglas de import

Un archivo de `src/modules/<feature>/` puede importar de:

1. **su propio módulo**;
2. **`src/shared/`** — config, cliente HTTP, errores, componentes transversales.

Y de ningún otro lado. **Un módulo nunca importa de otro módulo.** Si dos features necesitan lo mismo,
eso va a `shared/`.

El cableado entre capas es import directo, con namespace import cuando aclara el origen:

```js
// files.hooks.js
import * as filesApi from './files.api.js'
```

## Estado servidor: siempre las tres ramas

Un hook que trae datos expone `{ data, loading, error }` y el componente **renderiza las tres**, más
el caso vacío cuando aplica. Nunca asumas que `data` llegó:

```jsx
if (loading) return <Loading />
if (error) return <ErrorAlert message={error} onRetry={reload} />
return <Table rows={data} />
```

## Checklist para agregar una feature

1. Crear `src/modules/<feature>/` con las capas que realmente necesite.
2. Escribir el `.api.js`, después el hook, después los componentes, y al final la página que los une.
3. Reexportar la página en `index.js` y montarla en `App.jsx`.
4. Test unitario del hook con el api mockeado + test de integración de la pantalla —
   ver la skill `testing-jest`.

## Módulo `shared`

`src/shared/` es para lo genuinamente transversal: config, errores, cliente HTTP y componentes que
usa más de una feature (`Layout`, `Loading`, `ErrorAlert`). **No es un cajón de utilidades**: si lo
usa un solo módulo, va dentro de ese módulo.
