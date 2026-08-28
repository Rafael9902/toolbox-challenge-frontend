---
name: testing-jest
description: Cómo se escriben y corren los tests de este frontend con Jest y React Testing Library. Usar SIEMPRE al crear o modificar archivos en test/, al agregar cobertura para una feature, al elegir qué mockear, o cuando un test falle por act(), timers o queries.
---

# Testing — Jest + React Testing Library

| Comando | Corre |
|---|---|
| `npm test` | todo |
| `npm run test:unit` | `test/unit/` — piezas aisladas: cliente HTTP, hooks, componentes sueltos |
| `npm run test:integration` | `test/integration/` — la app completa con `fetch` mockeado |

El positional de Jest es un **filtro** de rutas (`testPathPattern`), así que intersecta con el
`testMatch` del config en vez de reemplazarlo. Acota bien y no hace falta tocar `jest.config.js`.

## Qué se mockea en cada nivel

Acá **sí se pueden mockear módulos**: Babel transpila a CommonJS, así que `jest.mock()` funciona
—a diferencia del backend, que es ESM nativo y obliga a inyectar dependencias—.

| Qué testeás | Cómo |
|---|---|
| `shared/http` | `global.fetch = jest.fn()` |
| `*.api.js` | Rara vez solo; se cubre por el hook y por integración |
| `*.hooks.js` | `jest.mock('../../src/modules/<f>/<f>.api.js')` + `renderHook` |
| componentes sueltos | `render()` con props fijas |
| pantalla completa | `test/integration/`, con `global.fetch` mockeado |

**Cero red real en toda la suite**, en cualquier nivel.

## Consultá por rol, no por implementación

```js
screen.getByRole('button', { name: /retry/i })   // ✅ lo que ve el usuario
screen.getByRole('alert')                        // ✅
container.querySelector('.btn-outline-danger')   // ❌ acoplado a Bootstrap
```

Si un elemento no se puede encontrar por rol o texto accesible, el problema suele ser el markup, no
el test. Ver la skill `react-patterns`.

## Asincronía

Usá las utilidades que ya envuelven en `act()`; nunca `setTimeout` a mano:

```js
expect(await screen.findByText('ok')).toBeInTheDocument()   // aparece
await waitFor(() => expect(result.current.loading).toBe(false))
expect(screen.queryByRole('status')).not.toBeInTheDocument() // desapareció
```

`getBy*` lanza si no encuentra · `queryBy*` devuelve `null`, para afirmar ausencia · `findBy*` espera.

Si aparece un warning de `act()`, casi siempre es un `setState` después de que el test terminó: falta
esperar el resultado, o falta cancelar el efecto.

## Escenarios que toda pantalla con datos debe cubrir

1. Estado de carga.
2. Éxito, con los datos renderizados.
3. Error del API, con mensaje accionable.
4. Estado vacío, cuando aplique.
5. Reintento, si hay botón.
6. Que el mensaje técnico **no** se filtre a la UI.

## Setup

`test/setup.js` carga `@testing-library/jest-dom` (matchers como `toBeInTheDocument`).
`test/styleMock.js` reemplaza los imports de CSS, que Jest no necesita interpretar.
`clearMocks: true` en el config limpia los mocks entre tests; no hace falta hacerlo a mano.
