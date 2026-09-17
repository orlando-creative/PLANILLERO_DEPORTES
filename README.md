# Planillero Deportivo Institucional

Sistema web para la gestion de competiciones deportivas escolares de la U.E. "Luz del Mundo A". Permite consultar partidos, resultados, posiciones, equipos, jugadores y reglamentos, ademas de administrar encuentros y llevar una planilla arbitral en vivo.

El proyecto es una aplicacion web estatica construida con HTML, CSS y JavaScript nativo. Los datos se almacenan y consultan mediante la API REST y Auth de Supabase.

## Contenido

- [Caracteristicas](#caracteristicas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Paginas HTML](#paginas-html)
- [Modulos JavaScript](#modulos-javascript)
- [Hojas de estilo](#hojas-de-estilo)
- [Base de datos](#base-de-datos)
- [Flujo de funcionamiento](#flujo-de-funcionamiento)
- [Roles y permisos](#roles-y-permisos)
- [Instalacion y ejecucion local](#instalacion-y-ejecucion-local)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Mantenimiento](#mantenimiento)

## Caracteristicas

- Portal publico de competiciones deportivas.
- Calendario y fixture de partidos.
- Resultados y actas oficiales.
- Tabla de posiciones y clasificaciones.
- Consulta de goleadores y estadisticas.
- Gestion de competiciones, equipos, jugadores y reglamentos.
- Planilla digital para control arbitral en vivo.
- Registro de goles, tarjetas, sustituciones y otros eventos del partido.
- Inicio de sesion para administradores y arbitros.
- Control de permisos por rol.
- Auditoria de operaciones administrativas.
- Interfaz adaptable para escritorio y dispositivos moviles.
- Menu hamburguesa para la navegacion movil.

## Estructura del proyecto

```text
PLANILLERO_DEPORTES/
|-- index.html
|-- administracion.html
|-- calendario.html
|-- competiciones.html
|-- equipos.html
|-- inicio-sesion.html
|-- jugadores.html
|-- partido.html
|-- perfil.html
|-- planilla.html
|-- posiciones.html
|-- reglamento.html
|-- resultados.html
|-- README.md
|-- vercel.json
|-- assets/
|-- css/
|-- js/
|-- public/
`-- sql/
```

Las paginas HTML se encuentran en la raiz porque Vercel sirve directamente el sitio estatico desde esa carpeta. Los imports de JavaScript dentro de las paginas deben conservar el prefijo relativo `./js/`.

## Paginas HTML

### Paginas publicas

- `index.html`: pagina principal. Muestra partidos destacados, competiciones activas, posiciones resumidas y goleadores.
- `calendario.html`: fixture completo y filtros de partidos. Permite acceder al acta de cada encuentro.
- `competiciones.html`: listado de competiciones, estado, categoria, reglamento y equipos asociados.
- `equipos.html`: listado de equipos registrados y acceso a sus plantillas.
- `jugadores.html`: listado de jugadores, filtros y datos de las nominas.
- `partido.html`: acta oficial de un encuentro, marcador, equipos, eventos y datos del partido.
- `posiciones.html`: tabla de posiciones por competicion y clasificacion de equipos.
- `reglamento.html`: consulta de reglamentos y bases tecnicas.
- `resultados.html`: historial de resultados oficiales y acceso a las actas.

### Paginas de acceso y gestion

- `inicio-sesion.html`: formulario de inicio de sesion y recuperacion de contrasena.
- `perfil.html`: informacion del usuario autenticado y accesos segun permisos.
- `administracion.html`: panel administrativo para gestionar datos, configuracion y auditoria.
- `planilla.html`: planilla digital en vivo para controlar un partido y registrar eventos.

Cada pagina carga `js/navegacion.js` para construir el encabezado, el menu, el pie institucional y los controles de sesion.

## Modulos JavaScript

Todos los modulos se encuentran en `js/` y utilizan modulos ES nativos. Los imports entre modulos usan rutas relativas como `./supabase.js`.

- `supabase.js`: cliente propio para comunicarse con Supabase mediante `fetch`, REST de PostgREST y endpoints de autenticacion. Gestiona la URL, la clave anonima, las consultas, sesiones y configuracion.
- `autenticacion.js`: inicio de sesion, cierre de sesion, recuperacion de contrasena y consulta del usuario actual.
- `permisos.js`: determina si el usuario es administrador, protege paginas privadas y adapta los controles visibles segun el rol.
- `navegacion.js`: renderiza encabezado, menu hamburguesa movil, enlaces institucionales, pie de pagina y acciones de sesion.
- `competiciones.js`: operaciones CRUD de competiciones y gestion de equipos asociados.
- `equipos.js`: consulta, alta, edicion y eliminacion logica de equipos.
- `jugadores.js`: consulta, alta, edicion y eliminacion logica de jugadores.
- `partidos.js`: consulta y gestion de partidos, estados, marcador y eliminacion.
- `eventos-partido.js`: registra, revierte, restaura y elimina eventos del partido; recalcula el marcador.
- `posiciones.js`: calcula y consulta tablas de posiciones y clasificaciones.
- `estadisticas.js`: obtiene goleadores y estadisticas derivadas.
- `reglamentos.js`: consulta y administra reglamentos deportivos.
- `auditoria.js`: registra y consulta operaciones administrativas.
- `cursos_categorias.js`: constantes y utilidades para categorias, niveles, grados y paralelos escolares.
- `interfaz.js`: notificaciones, confirmaciones, modales, estados de carga y estados vacios.
- `utilidades.js`: sanitizacion HTML, UUID, fechas, tiempos, estados y nombres de eventos.

## Hojas de estilo

Todas las hojas estan dentro de `css/` y se cargan segun las necesidades de cada pagina.

- `principal.css`: variables visuales, tipografia, colores, contenedores, tarjetas, botones y estilos generales.
- `encabezado.css`: encabezado institucional, navegacion de escritorio, menu hamburguesa, menu desplegable movil y pie.
- `responsive.css`: adaptacion para tabletas y moviles, rejillas, formularios, botones y tablas.
- `formularios.css`: campos, etiquetas, formularios, grupos de controles y validacion visual.
- `tablas.css`: tablas deportivas, encabezados, filas, posiciones y presentacion responsive.
- `partidos.css`: tarjetas de partidos, marcadores, equipos, estados y acciones.
- `competiciones.css`: tarjetas y componentes visuales de competiciones.
- `administracion.css`: paneles, indicadores y componentes del area administrativa.
- `planilla.css`: controles de planilla, marcador en vivo, eventos y panel arbitral.

## Recursos y configuracion

- `assets/`: recursos visuales usados por el sitio, incluido el escudo institucional.
- `public/`: carpeta auxiliar de recursos publicos. La pagina principal del proyecto esta en la raiz, no dentro de `public`.
- `vercel.json`: configuracion minima para que Vercel sirva el proyecto estatico.
- `README.md`: esta documentacion general del proyecto.

## Base de datos

La base de datos utiliza Supabase. El esquema y los datos iniciales se encuentran en `sql/`.

### `sql/01_esquema_completo.sql`

Crea la estructura principal:

- `usuarios`: perfiles, correos, nombres y roles.
- `reglamentos`: bases tecnicas y reglamentos.
- `competiciones`: torneos, deportes, categorias, fechas y estados.
- `equipos`: equipos participantes y sus datos institucionales.
- `competicion_equipos`: relacion muchos a muchos entre competiciones y equipos.
- `jugadores`: estudiantes, equipos, cursos, dorsales y visibilidad.
- `partidos`: encuentros, equipos, fecha, cancha, estado y marcador.
- `eventos_partido`: goles, tarjetas, sustituciones y eventos arbitrales.
- `posiciones`: clasificacion calculada de cada competicion.
- `registros_auditoria`: historial de acciones administrativas.

Tambien define:

- Triggers para fechas de actualizacion.
- Creacion automatica del perfil al registrar un usuario.
- Actualizacion automatica del marcador.
- Recalculo de posiciones.
- Funcion para comprobar administradores.
- Politicas RLS de lectura y escritura por tabla.

### `sql/02_datos_iniciales.sql`

Inserta datos de ejemplo o iniciales para comenzar a utilizar el sistema:

- Reglamentos.
- Equipos.
- Competiciones.
- Relaciones entre equipos y competiciones.
- Jugadores.
- Partidos.
- Eventos de partidos.

## Flujo de funcionamiento

1. El navegador carga una pagina HTML y `js/navegacion.js` construye la interfaz comun.
2. La pagina importa el modulo de dominio que necesita, por ejemplo `partidos.js` o `competiciones.js`.
3. El modulo usa `clienteSupabase` para construir una consulta REST.
4. Supabase valida la clave anonima, la sesion y las politicas RLS.
5. Los datos se renderizan en tablas, tarjetas, marcadores o formularios.
6. Las operaciones administrativas registran cambios en `registros_auditoria`.
7. Los triggers de la base de datos actualizan marcadores, fechas y posiciones cuando corresponde.

## Roles y permisos

### Espectador

Puede consultar la informacion publica: competiciones, equipos, jugadores visibles, calendario, resultados, posiciones y reglamentos.

### Administrador

Ademas de consultar la informacion publica, puede gestionar competiciones, equipos, jugadores, partidos y reglamentos; acceder a la planilla en vivo y revisar auditoria.

### Arbitro

Puede acceder a las funciones de control de partidos que se le habiliten mediante el sistema de autenticacion y permisos.

La proteccion de paginas se realiza desde `js/permisos.js`. La seguridad definitiva debe mantenerse siempre en Supabase mediante RLS; ocultar controles en el navegador no sustituye las politicas de la base de datos.

## Instalacion y ejecucion local

El proyecto no necesita un proceso de compilacion ni dependencias de npm para ejecutarse. Se puede abrir con un servidor estatico, por ejemplo Live Server en VS Code.

Recomendacion:

1. Abrir la carpeta del proyecto en VS Code.
2. Iniciar Live Server desde `index.html` o desde la raiz del proyecto.
3. Abrir la URL local proporcionada por Live Server.
4. No abrir las paginas directamente con `file://`, porque los modulos ES y las peticiones de red pueden ser bloqueados por el navegador.

Para trabajar correctamente, las paginas deben servirse desde la raiz del proyecto, donde existen `index.html`, `js/`, `css/` y `assets/`.

## Despliegue en Vercel

El repositorio se conecta con Vercel desde la rama `main`.

Configuracion recomendada:

- Root Directory: raiz del repositorio (`.`).
- Framework Preset: `Other`.
- Build Command: vacio.
- Output Directory: vacio.
- Install Command: vacio.

El sitio debe publicar la raiz del repositorio porque alli estan las paginas HTML. No se debe configurar `public/` como carpeta raiz del sitio, ya que esa carpeta no contiene `index.html`.

Proceso de publicacion:

```bash
git add .
git commit -m "descripcion del cambio"
git push origin main
```

Cada push a `main` genera un nuevo despliegue. Despues del despliegue, conviene probar la pagina principal, una pagina publica, el inicio de sesion y una pagina administrativa.

## Mantenimiento

- Mantener los imports de las paginas HTML con `./js/archivo.js`.
- Mantener los imports internos de `js/` con `./archivo.js`.
- No mover `index.html`, `css/`, `js/` o `assets/` a otra carpeta sin actualizar todas las rutas.
- No exponer una clave secreta de Supabase en el frontend. La clave anonima es la destinada al navegador y debe estar protegida por RLS.
- Ejecutar el esquema SQL en el orden indicado antes de insertar los datos iniciales.
- Probar en un servidor HTTP, no con doble clic sobre los archivos HTML.
- Revisar la consola del navegador y la pestaña Network cuando falle una pagina.
- Verificar que el commit correcto este desplegado en Vercel antes de diagnosticar errores antiguos.

## Diagnostico rapido

### `Failed to resolve module specifier`

El import no es relativo. Cambiar, por ejemplo:

```js
import { iniciarSesion } from 'js/autenticacion.js';
```

por:

```js
import { iniciarSesion } from './js/autenticacion.js';
```

### Error 404 en Vercel

Comprobar que Root Directory apunte a la raiz del repositorio y que Vercel no este publicando solamente `public/`.

### La pagina carga pero no muestra datos

Revisar la consola del navegador, la URL de Supabase, la clave anonima, la sesion del usuario y las politicas RLS. Tambien confirmar que se hayan ejecutado los dos archivos SQL.

### El menu movil no aparece

Comprobar que `js/navegacion.js` se cargue correctamente y que `css/encabezado.css` y `css/responsive.css` esten enlazados en la pagina.

## Resumen tecnico

- Frontend: HTML5, CSS3 y JavaScript ES Modules.
- Backend y persistencia: Supabase REST API, Auth, PostgreSQL, triggers y RLS.
- Hosting: Vercel como servidor estatico.
- Desarrollo local: Live Server u otro servidor HTTP estatico.
- Arquitectura: paginas estaticas con modulos de dominio reutilizables y una capa propia de acceso a Supabase.
