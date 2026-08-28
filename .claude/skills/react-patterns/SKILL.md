---
name: react-patterns
description: Cómo se escribe React en este proyecto — componentes funcionales, hooks, sin clases, manejo de efectos y cancelación. Usar SIEMPRE al escribir o modificar un componente .jsx o un hook, al agregar estado, al hacer un llamado asincrónico desde la UI, o al resolver un warning de React.
---

# React: funcional, con hooks

Requisito explícito del challenge: **programación funcional y Hook Effects**. En este proyecto eso es
literal.

## Sin clases

Nada de `class X extends Component`, `this.state`, `componentDidMount` ni error boundaries de clase.
Todo componente es una función que devuelve JSX.

```jsx
export const Loading = ({ label = 'Loading' }) => (
  <Spinner animation="border" role="status">
    <span className="visually-hidden">{label}</span>
  </Spinner>
)
```

Componentes nombrados y exportados con `export const`, nunca `export default`: el default invita a
renombrar el import y rompe la búsqueda por nombre.

## Efectos

Todo efecto que dispara una petición debe:

1. **Declarar dependencias reales.** Un `useEffect` sin array corre en cada render y pega al API en
   bucle.
2. **Cancelarse al desmontar**, con `AbortController` en el cleanup.
3. **Ignorar el `AbortError`**: es el cleanup del propio efecto, no una falla que mostrarle al usuario.

```js
useEffect(() => {
  const controller = new AbortController()

  filesApi.fetchHealth({ signal: controller.signal })
    .then(setData)
    .catch((failure) => {
      if (failure.name === 'AbortError') return
      setError(failure.message)
    })

  return () => controller.abort()
}, [attempt])
```

Sin ese cleanup React avisa con "state update on an unmounted component", y peor: una respuesta vieja
puede pisar a una nueva.

## Recargar sin trampas

Para reintentar, cambiá una dependencia del efecto en lugar de extraer la función y llamarla a mano:

```js
const [attempt, setAttempt] = useState(0)
const reload = useCallback(() => setAttempt((n) => n + 1), [])
// useEffect(..., [attempt])
```

Es una sola fuente de verdad: el efecto sigue siendo el único lugar que dispara la petición.

## Estado

- `useState` con actualizaciones funcionales (`setN((n) => n + 1)`) cuando el valor nuevo depende del viejo.
- **No derives estado**: si algo se puede calcular de props o de otro estado, calculalo en el render.
- `useCallback` / `useMemo` sólo cuando hay una razón concreta —una dependencia de efecto, una lista
  grande—, no por reflejo.

## Listas

`key` estable y única, **nunca el índice del array**: con el índice, React reusa el nodo equivocado
cuando la lista se reordena o se filtra.

## Accesibilidad, porque además hace testeables los componentes

Los tests buscan por rol y por texto accesible, así que el markup accesible no es un extra:

- Spinners con `role="status"` y un texto en `.visually-hidden`.
- Errores en un `<Alert>` de React Bootstrap, que ya trae `role="alert"`.
- Botones con texto real, no sólo un ícono.

## React Bootstrap

Importar por componente, no el barril entero:

```js
import Container from 'react-bootstrap/Container'   // ✅
import { Container } from 'react-bootstrap'         // ❌ arrastra toda la librería
```

El CSS de Bootstrap se importa **una sola vez**, en `src/index.jsx`.
