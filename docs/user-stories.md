# Historias de Usuario — Frontend (React + React Bootstrap)

**Challenge:** Toolbox — JavaScript Full Stack Code Challenge
**Componente:** SPA en React que actúa como cliente del API propio (`GET /files/data`) y muestra la información formateada en pantalla.
**Repositorio destino:** `toolbox-challenge-frontend`
**Fecha de elaboración:** 2026-08-27

> **Estado:** `TASK-001` está entregada (ver `Done` en el board). El resto sigue pendiente.
> Este documento es el backlog de planificación: los criterios de aceptación son el contrato;
> las *Notas técnicas* reflejan las decisiones ya tomadas durante la implementación.

---

## Contexto técnico (aplica a todas las HUs)

| Ítem | Valor |
|---|---|
| Runtime | NodeJS 16 |
| Lenguaje | JavaScript ES6+ (prohibido TypeScript, Dart, Elm o similares) |
| Bundler | Webpack |
| UI | React + React Bootstrap |
| Paradigma | Programación funcional + Hooks (`useEffect`, `useState`) — sin componentes de clase |
| API consumida | `GET /files/data` del backend propio (nunca el API Externo directamente) |
| Restricción | Sin dependencias globales, sin variables de entorno obligatorias, sin configuración de un SO específico |

### Supuesto sobre el wireframe

> ⚠️ El wireframe (`https://cs1.ssltrust.me/s/ECH9VusiMmi3ac1`) no está disponible en este análisis. Se asume el layout clásico del challenge:
> **navbar superior con el título de la app** + **tabla centrada** con las columnas `File Name | Text | Number | Hex`, y (para el punto opcional) un **campo/selector de filtro por nombre de archivo** sobre la tabla.
> **Validar contra el wireframe real antes de cerrar HU-FE-02 y HU-FE-04.**

### Flujo objetivo

```
Usuario → App React → GET /files/data (API propia) → tabla renderizada
                    ↳ estado de carga mientras espera
                    ↳ estado de error si la petición falla
```

### Definition of Ready (global)

- La HU tiene criterios de aceptación verificables.
- El contrato del endpoint consumido está definido (ver HUs del backend).
- El comportamiento visual está contrastado contra el wireframe.

### Definition of Done (global)

- Componentes funcionales con Hooks, en JavaScript ES6+ sin TypeScript.
- Build de Webpack sin errores y app ejecutable con `npm start`.
- Tests verdes (donde aplique la HU opcional de Jest).
- README actualizado si la HU cambia instrucciones de uso.
- Código commiteado y pusheado al repositorio público.

---

## Mapa de dependencias y orden sugerido

```
HU-FE-01 (base Webpack + React) ──┬── HU-FE-02 (layout React Bootstrap) ──┐
                                  └── HU-FE-03 (consumo de /files/data) ──┼── HU-FE-04 (tabla de datos)
                                                                          ├── HU-FE-05 (carga y error)
                                                                          └── HU-FE-06 (documentación)

Opcionales: HU-FE-07 (filtro por fileName) · HU-FE-08 (Redux) · HU-FE-09 (Jest) · HU-FE-10 (Docker)
```

**Dependencia externa:** HU-FE-03 requiere HU-BE-05 (o un mock del contrato). HU-FE-07 requiere HU-BE-09 y HU-BE-10.

---

# HUs obligatorias

## HU-FE-01 — Esqueleto de la SPA ejecutable con Webpack

**Como** evaluador del challenge
**Quiero** clonar el repositorio y levantar el frontend con un único comando
**Para** ver la aplicación funcionando sin configurar nada de mi entorno

### Criterios de aceptación

- **Dado** el repositorio recién clonado, **Cuando** ejecuto `npm install && npm start`, **Entonces** Webpack Dev Server levanta la app y la sirve en un puerto documentado.
- **Dado** la app levantada, **Cuando** la abro en el navegador, **Entonces** se renderiza el componente raíz de React sin errores en la consola.
- **Dado** el proyecto, **Cuando** inspecciono el código, **Entonces** no hay TypeScript, Dart, Elm ni componentes de clase.
- **Dado** NodeJS 16, **Cuando** ejecuto los scripts, **Entonces** funcionan sin dependencias globales ni variables de entorno obligatorias.
- **Dado** el proyecto, **Cuando** ejecuto `npm run build`, **Entonces** se genera el bundle de producción en `dist/`.

### Notas técnicas

- Webpack configurado manualmente (no `create-react-app`) para cumplir el requisito explícito del challenge.
- La URL base del API vive **hardcodeada** en `src/shared/config.js`. No se lee ninguna variable de entorno.
- Arquitectura **modular por feature**: cada módulo en `src/modules/<feature>/` expone sólo su página,
  con `<feature>.api.js` + `hooks/` + `components/` + `pages/`. Ver `.claude/skills/feature-module/`.
- Babel está permitido acá: el enunciado lo prohíbe para el API, no para el frontend, y hace falta
  para JSX. Lo que sigue prohibido es TypeScript.

### INVEST

- **I (Independiente):** no depende de ninguna otra HU; es la base del backlog.
- **N (Negociable):** la estructura de carpetas y el puerto son negociables.
- **V (Valiosa):** habilita que cualquier evaluador ejecute la app.
- **E (Estimable):** configuración conocida. Estimación: **3 pts**.
- **S (Pequeña):** una configuración de Webpack y el punto de entrada.
- **T (Testeable):** verificable levantando la app en el navegador.

---

## HU-FE-02 — Layout base según el wireframe con React Bootstrap

**Como** usuario de la aplicación
**Quiero** ver una pantalla ordenada y con estilo consistente
**Para** leer la información de los archivos con comodidad

### Criterios de aceptación

- **Dado** la app abierta, **Cuando** se renderiza, **Entonces** muestra una barra superior con el título de la aplicación, construida con componentes de React Bootstrap.
- **Dado** la app abierta, **Cuando** se renderiza, **Entonces** el contenido está dentro de un `Container` centrado, respetando el wireframe.
- **Dado** el layout, **Cuando** lo inspecciono, **Entonces** los estilos provienen de Bootstrap/React Bootstrap y no de CSS manual que duplique lo que ya provee la librería.
- **Dado** una ventana de ancho reducido, **Cuando** redimensiono, **Entonces** el layout se adapta sin romper (grid responsive de Bootstrap).
- **Dado** el layout, **Cuando** lo comparo con el wireframe entregado, **Entonces** la disposición de los elementos coincide.

### Notas técnicas

- Componentes esperados: `<Navbar>`, `<Container>`, `<Row>`/`<Col>`, `<Table>`.
- Importar el CSS de Bootstrap una única vez desde el punto de entrada.

### INVEST

- **I:** depende sólo de HU-FE-01; se construye con datos estáticos.
- **N:** los detalles visuales son negociables dentro de lo que marca el wireframe.
- **V:** es el requisito de layout explícito del challenge.
- **E:** alcance visual acotado. Estimación: **2 pts**.
- **S:** un componente de layout.
- **T:** verificable comparando contra el wireframe.

---

## HU-FE-03 — Consumo de `GET /files/data` con Hook Effects

**Como** usuario de la aplicación
**Quiero** que la app traiga automáticamente los datos del API al abrirse
**Para** ver la información sin realizar ninguna acción manual

### Criterios de aceptación

- **Dado** que el componente se monta, **Cuando** se ejecuta el `useEffect`, **Entonces** se dispara una única petición a `GET /files/data`.
- **Dado** el `useEffect`, **Cuando** lo inspecciono, **Entonces** tiene un array de dependencias correcto que evita peticiones en bucle.
- **Dado** una respuesta exitosa, **Cuando** llega, **Entonces** los datos quedan en el estado del componente mediante `useState`.
- **Dado** que el componente se desmonta antes de que la petición resuelva, **Cuando** la respuesta llega, **Entonces** no se intenta actualizar el estado (sin warnings de React).
- **Dado** el código, **Cuando** lo reviso, **Entonces** la llamada HTTP está encapsulada en un servicio o hook reutilizable, no inline en el JSX.
- **Dado** que el frontend corre en un origen distinto al del API, **Cuando** hace la petición, **Entonces** la comunicación funciona (CORS o proxy de Webpack Dev Server documentado).

### Notas técnicas

- Cancelación con `AbortController` en el cleanup del efecto.
- Depende del contrato de HU-BE-05; puede desarrollarse contra un mock del JSON de ejemplo.

### INVEST

- **I:** desarrollable contra un mock del contrato, sin esperar al backend.
- **N:** `fetch` vs. `axios` es negociable.
- **V:** sin datos no hay aplicación.
- **E:** patrón conocido. Estimación: **3 pts**.
- **S:** un hook y un servicio.
- **T:** testeable mockeando la capa HTTP.

---

## HU-FE-04 — Visualización de los datos en tabla

**Como** usuario de la aplicación
**Quiero** ver el contenido de todos los archivos en una tabla ordenada
**Para** leer de un vistazo el nombre del archivo, el texto, el número y el hexadecimal

### Criterios de aceptación

- **Dado** la respuesta del API, **Cuando** se renderiza, **Entonces** la tabla muestra las columnas `File Name`, `Text`, `Number` y `Hex` con sus encabezados.
- **Dado** un archivo con varias líneas, **Cuando** se renderiza, **Entonces** cada línea es una fila y la columna `File Name` repite el nombre del archivo en cada una.
- **Dado** varios archivos, **Cuando** se renderiza, **Entonces** las filas de todos los archivos aparecen aplanadas en la misma tabla.
- **Dado** un archivo con `lines: []`, **Cuando** se renderiza, **Entonces** no genera filas vacías ni rompe el render.
- **Dado** una respuesta vacía (`[]`), **Cuando** se renderiza, **Entonces** se muestra un mensaje de "no hay datos disponibles" en lugar de una tabla vacía.
- **Dado** el render de la lista, **Cuando** lo inspecciono, **Entonces** cada fila tiene una `key` estable y única (no el índice del array).

### Notas técnicas

- Usar `<Table striped bordered hover>` de React Bootstrap.
- La transformación de `[{ file, lines }]` a filas planas vive en una función pura, separada del componente, para poder testearla.

### INVEST

- **I:** desarrollable con datos estáticos, sin depender de HU-FE-03.
- **N:** el estilo de la tabla y el texto del estado vacío son negociables.
- **V:** es lo que el usuario efectivamente ve; núcleo del punto 2 del challenge.
- **E:** render acotado. Estimación: **3 pts**.
- **S:** un componente de tabla más un transformador.
- **T:** testeable con Jest + React Testing Library sobre datos fijos.

---

## HU-FE-05 — Estados de carga y de error

**Como** usuario de la aplicación
**Quiero** saber si los datos se están cargando o si algo falló
**Para** entender qué está pasando en lugar de ver una pantalla en blanco

### Criterios de aceptación

- **Dado** que la petición está en curso, **Cuando** miro la pantalla, **Entonces** se muestra un indicador de carga (`<Spinner>` de React Bootstrap).
- **Dado** que la petición finaliza con éxito, **Cuando** llegan los datos, **Entonces** el indicador de carga desaparece y se muestra la tabla.
- **Dado** que el API responde un error o no está disponible, **Cuando** falla la petición, **Entonces** se muestra un `<Alert variant="danger">` con un mensaje claro y sin exponer detalles técnicos.
- **Dado** el estado de error, **Cuando** lo veo, **Entonces** dispongo de una acción para reintentar la carga.
- **Dado** cualquier estado (carga, error, éxito, vacío), **Cuando** se renderiza, **Entonces** sólo uno de ellos se muestra a la vez.

### INVEST

- **I:** se apoya en HU-FE-03 pero puede simularse con estado local.
- **N:** el diseño del spinner y del mensaje son negociables.
- **V:** evita la pantalla en blanco, criterio de calidad visible.
- **E:** alcance chico. Estimación: **2 pts**.
- **S:** condicionales de render sobre el estado.
- **T:** testeable forzando cada estado con mocks.

---

## HU-FE-06 — Documentación e instrucciones de ejecución

**Como** evaluador del challenge
**Quiero** un README claro y prolijo
**Para** instalar, ejecutar y entender la app en pocos minutos

### Criterios de aceptación

- **Dado** el README, **Cuando** lo leo, **Entonces** encuentro: requisitos previos (NodeJS 16), instalación, `npm start`, `npm run build` y el puerto por defecto.
- **Dado** el README, **Cuando** lo leo, **Entonces** indica cómo apuntar el frontend a la URL del API y que el backend debe estar levantado.
- **Dado** el README, **Cuando** lo leo, **Entonces** documenta las decisiones tomadas y qué puntos opcionales fueron implementados.
- **Dado** el README, **Cuando** lo leo, **Entonces** incluye una captura o descripción de la pantalla resultante.
- **Dado** un desarrollador sin contexto, **Cuando** sigue el README paso a paso, **Entonces** levanta la app sin ayuda adicional.

### INVEST

- **I:** independiente del código, se completa al cierre.
- **N:** el formato y la extensión son negociables.
- **V:** el enunciado evalúa explícitamente la prolijidad de la documentación.
- **E:** trabajo acotado. Estimación: **1 pt**.
- **S:** un solo archivo.
- **T:** verificable ejecutando las instrucciones desde cero.

---

# HUs opcionales (suman, no restan)

## HU-FE-07 (Opcional) — Filtro por nombre de archivo

**Como** usuario de la aplicación
**Quiero** filtrar la tabla por nombre de archivo
**Para** concentrarme en el contenido de un archivo puntual

### Criterios de aceptación

- **Dado** la app cargada, **Cuando** se renderiza, **Entonces** muestra un selector/campo de filtro poblado con los nombres obtenidos de `GET /files/list`.
- **Dado** que selecciono un archivo, **Cuando** aplico el filtro, **Entonces** la app consulta `GET /files/data?fileName=<archivo>` y la tabla muestra sólo las filas de ese archivo.
- **Dado** un filtro aplicado, **Cuando** lo limpio, **Entonces** la tabla vuelve a mostrar los datos de todos los archivos.
- **Dado** un filtro cuyo resultado no tiene líneas, **Cuando** se aplica, **Entonces** se muestra el mensaje de estado vacío en lugar de una tabla sin filas.
- **Dado** que el filtro dispara una petición, **Cuando** está en curso, **Entonces** se muestra el estado de carga de HU-FE-05.
- **Dado** que `GET /files/list` falla, **Cuando** ocurre, **Entonces** la app sigue funcionando mostrando todos los datos, con el filtro deshabilitado.

### Notas técnicas

- Depende de HU-BE-09 (`/files/list`) y HU-BE-10 (`?fileName=`).
- El filtro es del lado del servidor, no un `filter` en memoria, para aprovechar los puntos opcionales del API.

### INVEST

- **I:** no altera el flujo por defecto de la app.
- **N:** dropdown vs. input de texto es negociable.
- **V:** punto opcional explícito del challenge.
- **E:** un componente más una petición. Estimación: **3 pts**.
- **S:** acotada a un componente y su estado.
- **T:** testeable simulando la selección y verificando la URL llamada.

---

## HU-FE-08 (Opcional) — Gestión de estado con Redux

**Como** equipo de desarrollo
**Quiero** centralizar el estado de la aplicación en Redux
**Para** desacoplar los datos de los componentes y escalar la app con previsibilidad

### Criterios de aceptación

- **Dado** la app, **Cuando** se inicializa, **Entonces** el store de Redux se provee desde la raíz mediante `<Provider>`.
- **Dado** el estado global, **Cuando** lo inspecciono, **Entonces** contiene al menos: datos de archivos, lista de archivos, flag de carga y error.
- **Dado** una petición al API, **Cuando** se ejecuta, **Entonces** despacha acciones de inicio, éxito y error, y los reducers actualizan el estado de forma inmutable.
- **Dado** los componentes de presentación, **Cuando** los reviso, **Entonces** consumen el estado con hooks (`useSelector`/`useDispatch`) y no mantienen copias locales de los datos del API.
- **Dado** el comportamiento de la app, **Cuando** se usa, **Entonces** es funcionalmente idéntico al de las HUs obligatorias.

### INVEST

- **I:** refactor interno; no cambia el comportamiento visible.
- **N:** Redux Toolkit vs. Redux clásico es negociable.
- **V:** punto opcional explícito del challenge.
- **E:** store, acciones y reducers acotados. Estimación: **3 pts**.
- **S:** alcance limitado a la capa de estado.
- **T:** los reducers son funciones puras, directamente testeables.

---

## HU-FE-09 (Opcional) — Tests unitarios con Jest

**Como** evaluador del challenge
**Quiero** correr los tests del frontend y ver la validación automática
**Para** confirmar que los componentes se comportan como se espera

### Criterios de aceptación

- **Dado** el repositorio, **Cuando** ejecuto `npm test`, **Entonces** corre la suite de Jest y termina con exit code `0` si todo pasa.
- **Dado** los tests, **Cuando** se ejecutan, **Entonces** no realizan llamadas HTTP reales (la capa de servicios está mockeada).
- **Dado** la suite, **Cuando** la reviso, **Entonces** cubre: render de la tabla con datos, estado de carga, estado de error, estado vacío y la función de aplanado de `lines`.
- **Dado** el filtro (si HU-FE-07 está implementada), **Cuando** se testea, **Entonces** se verifica que dispara la petición con el `fileName` correcto.
- **Dado** los reducers (si HU-FE-08 está implementada), **Cuando** se testean, **Entonces** se valida cada transición de estado.

### INVEST

- **I:** puede escribirse en paralelo a la implementación.
- **N:** el nivel de cobertura es negociable.
- **V:** punto opcional explícito del challenge.
- **E:** escenarios enumerados. Estimación: **3 pts**.
- **S:** una suite acotada por componente.
- **T:** es la HU de testeo en sí misma.

---

## HU-FE-10 (Opcional) — Ejecución con Docker

**Como** evaluador del challenge
**Quiero** levantar el frontend con Docker sin instalar NodeJS localmente
**Para** reproducir el entorno de forma idéntica y sin fricción

### Criterios de aceptación

- **Dado** el `Dockerfile`, **Cuando** construyo la imagen, **Entonces** usa una imagen base de NodeJS 16 y la build finaliza sin errores.
- **Dado** la imagen construida, **Cuando** ejecuto el contenedor, **Entonces** la app es accesible desde el navegador en el puerto publicado.
- **Dado** `docker compose up` en este repo, **Cuando** el API también está levantado, **Entonces** la app abre en `http://localhost:8080` y muestra los datos que sirve.
  > Corrección sobre la suposición original: el bundle es estático y su JavaScript **corre en el navegador**, no en el contenedor. Por eso alcanza `localhost:3000` de la máquina anfitriona y **no** necesita resolver el API por el nombre del servicio de Compose. Lo único que hace falta es que el API publique su puerto.
- **Dado** el README, **Cuando** lo leo, **Entonces** documenta los comandos de build y run.
- **Dado** el contenedor, **Cuando** arranca, **Entonces** no requiere variables de entorno definidas por el evaluador.

### Notas técnicas

- `.dockerignore` excluyendo `node_modules` y `.git`.
- Coordinar con HU-BE-12: la URL del API dentro de la red de Compose no es `localhost`.

### INVEST

- **I:** no altera el código de la aplicación.
- **N:** servir el bundle con `serve` o con Nginx es negociable.
- **V:** punto opcional global del challenge.
- **E:** dos archivos de infraestructura. Estimación: **2 pts**.
- **S:** acotada.
- **T:** verificable levantando los contenedores.

---

# HUs globales (transversales a ambos repositorios)

## HU-GL-01 — Entrega en repositorio git público

**Como** evaluador del challenge
**Quiero** acceder al código en un repositorio git público
**Para** revisar la solución y su historial

### Criterios de aceptación

- **Dado** el repositorio del frontend, **Cuando** lo abro con la URL enviada, **Entonces** es accesible públicamente (o con las credenciales informadas).
- **Dado** el historial, **Cuando** lo reviso, **Entonces** hay commits incrementales con mensajes descriptivos, no un único commit masivo.
- **Dado** el repositorio, **Cuando** lo clono, **Entonces** no contiene `node_modules` ni `dist/` (`.gitignore` correcto).
- **Dado** la entrega, **Cuando** se envía, **Entonces** el mensaje incluye las URLs de ambos repositorios y los datos de acceso necesarios.

### INVEST

- **I:** independiente del contenido de las demás HUs.
- **N:** el proveedor git es negociable.
- **V:** sin esto no hay entrega.
- **E:** trivial. Estimación: **1 pt**.
- **S:** acotada.
- **T:** verificable abriendo la URL en una sesión anónima.

---

## Resumen de estimación

| HU | Título | Prioridad | Pts |
|---|---|---|---|
| HU-FE-01 | Esqueleto de la SPA con Webpack | Obligatoria | 3 |
| HU-FE-02 | Layout base con React Bootstrap | Obligatoria | 2 |
| HU-FE-03 | Consumo de `/files/data` con Hook Effects | Obligatoria | 3 |
| HU-FE-04 | Visualización de los datos en tabla | Obligatoria | 3 |
| HU-FE-05 | Estados de carga y de error | Obligatoria | 2 |
| HU-FE-06 | Documentación e instrucciones | Obligatoria | 1 |
| HU-FE-07 | Filtro por nombre de archivo | Opcional | 3 |
| HU-FE-08 | Gestión de estado con Redux | Opcional | 3 |
| HU-FE-09 | Tests unitarios con Jest | Opcional | 3 |
| HU-FE-10 | Docker | Opcional | 2 |
| HU-GL-01 | Entrega en repositorio público | Global | 1 |
| | **Total obligatorio** | | **14** |
| | **Total con opcionales** | | **25** |

---

## Dudas a consultar con quien envió el challenge

1. ¿El wireframe incluye el campo de filtro por archivo, o éste sólo corresponde al punto opcional?
2. ¿Se espera paginación o scroll en la tabla si el volumen de filas es alto?
4. ¿Se espera algún manejo de orden (por archivo, por número) en la tabla?
5. ¿Se prefiere `npm start` en modo desarrollo (Dev Server) o sirviendo el bundle de producción?
