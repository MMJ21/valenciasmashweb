# ValenciaSmash: Especificación (Spec-Driven Development)

Versión: 0.2 | Estado: implementación parcial; requisitos revisados el 24 nov 2026

## 0. Convenciones
- Palabras clave: **DEBE** (obligatorio), **DEBERÍA** (recomendado), **PUEDE** (opcional).
- Cada requisito tiene un ID (`REQ-xxx`) y criterios de aceptación (`AC-xxx`) verificables. Las pruebas y los commits DEBEN referenciar estos IDs.
- Los valores marcados con `[CFG]` son parámetros de configuración, no constantes en código.

## 1. Visión y alcance
Web de la comunidad ValenciaSmash (Smash Ultimate, torneos en start.gg) con: landing, cuentas y fichas de jugador, importación de torneos, leaderboard semestral y "point matches" (apuestas con puntos virtuales).

**Fuera de alcance:** pagos o dinero real, importación automática (cron), matchmaking en tiempo real, app móvil nativa, otros juegos.

## 2. Glosario
- **Semestre:** S1 = 1 ene a 30 jun, S2 = 1 jul a 31 dic. Se deriva de la fecha (zona `Europe/Madrid`). No hay tabla de semestres.
- **Jugador fantasma:** `player` creado en una importación sin `user` asociado. Se reclama al vincular start.gg.
- **Point match (PM):** set entre dos jugadores con una apuesta de puntos virtuales.
- **Planeado:** PM con rival y apuesta elegidos por el retador. **Matchmaking:** PM con rival aleatorio y apuesta fija.

## 3. Stack y restricciones
| Capa | Decisión |
|---|---|
| Framework | Next.js (App Router, TypeScript estricto) |
| Hosting | Cloudflare Workers con OpenNext (`@opennextjs/cloudflare`) |
| BD | Neon PostgreSQL, driver `@neondatabase/serverless` |
| ORM / migraciones | Drizzle ORM + drizzle-kit |
| Auth | Better Auth con usuario, correo y contraseña; verificación por correo obligatoria |
| Correo transaccional | Resend API, con adaptador de consola en desarrollo |
| Imágenes | Cloudflare R2 |
| Validación | Zod en todas las entradas del servidor |
| Tests | Vitest (unitarios), Playwright (E2E) |
| CI | GitHub Actions: lint, typecheck y tests; automático en `master`, también manual (`workflow_dispatch`) |

El contexto, las alternativas y las consecuencias de estas decisiones se recogen en [`docs/adr/`](adr/README.md).

Restricciones:
- **NFR-001** Coste de infraestructura DEBE ser 0 €/mes (salvo dominio).
- **NFR-002** Los secretos (token start.gg, Better Auth, Resend y credenciales) DEBEN estar solo en el servidor.
- **NFR-003** Las rutas públicas DEBERÍAN cachearse (ISR/`revalidate`) por el límite de CPU del plan gratuito.
- **NFR-004** Ninguna petición DEBE depender de más de ~10 ms de CPU. El trabajo pesado va por lotes.
- **NFR-005** UI en español, accesible (WCAG AA básico) y responsive.
- **NFR-006** Cumplimiento RGPD: consentimiento, exportación y borrado de cuenta, política de privacidad.
- **NFR-008** La web DEBE ser una PWA instalable (ver 6.7). No se publicará app nativa en la v1.

## 4. Roles y permisos
| Rol | Permisos |
|---|---|
| `user` | Editar su ficha, vincular start.gg, usar point matches |
| `importer` | Lo de `user` + importar y reimportar torneos |
| `admin` | Lo de `importer` + gestionar roles, resolver disputas, verificar vínculos, moderar |

- **REQ-001** Los permisos DEBEN comprobarse en el servidor en cada acción, nunca solo en la UI.
- **REQ-002** El primer admin se asigna por coincidencia de correo con `ADMIN_EMAILS` al registrarse.

## 5. Modelo de datos

```
user             (id UUID, name, username UNIQUE, email UNIQUE, email_verified, role, adult_confirmed,
                  terms_accepted, deleted_at, created_at, updated_at)
session          (id UUID, user_id, token UNIQUE, expires_at, ip_address, user_agent)
account          (id UUID, user_id, provider_id, account_id, password, timestamps)
verification     (id UUID, identifier, value, expires_at, timestamps)
rateLimit        (key PK, count, last_request)
players          (id, user_id NULL UNIQUE, startgg_player_id UNIQUE NULL, startgg_slug,
                  gamertag, first_name, last_name, twitter, twitch, avatar_url, bio, created_at)
player_characters(player_id, character_id, is_main)          -- PK compuesta; máximo 2 en v1
startgg_links    (id, user_id, startgg_user_id, status: pending|verified|rejected, verified_via: oauth|admin, created_at)
tournaments      (id, startgg_id UNIQUE, name, slug, start_at, city, is_online,
                  state: upcoming|ongoing|completed, num_attendees, url, imported_at)
events           (id, startgg_id UNIQUE, tournament_id, name, videogame_id, num_entrants)
standings        (event_id, player_id, placement)             -- PK compuesta
sets             (id, startgg_id UNIQUE, event_id, round_text, player1_id, player2_id,
                  winner_id, score1, score2, is_dq, completed_at)
import_log       (id, user_id, tournament_id, action: preview|import|reimport, status, details jsonb, created_at)
point_matches    (id, kind: planned|matchmaking, challenger_id, opponent_id, points_wagered,
                  status, best_of, challenger_wins, opponent_wins, winner_id,
                  reported_by, challenger_report jsonb, opponent_report jsonb,
                  played_at, created_at, confirmed_at)
point_match_games(match_id, game_number, challenger_character, opponent_character, winner_id)
matchmaking_queue(id, player_id UNIQUE, joined_at, expires_at)
season_titles    (season_key, title: thief|duelist|gambler, player_id, value)
app_config       (key PK, value jsonb)
```

- **REQ-010** Todo ID externo de start.gg DEBE tener restricción UNIQUE para permitir upsert idempotente.
- **REQ-011** `season_key` tiene formato `YYYY-S1` o `YYYY-S2`.
- **REQ-012** `players.user_id` es único: un usuario solo puede reclamar un jugador.
- **REQ-013** Los personajes provienen de un catálogo estático versionado en el repositorio. La ficha v1 presenta 86 selecciones según la agrupación de la comunidad: Pokémon Trainer, Pyra & Mythra e Ice Climbers son una entrada cada uno; Samus y Zero Suit Samus y los tres Miis son entradas separadas. Se conserva un icono por entrada en el catálogo de perfiles.
- En v1 se ofrece un icono por personaje usando el primer color disponible; el selector de variantes queda para una fase posterior.

## 6. Funcionalidades

### 6.1 Landing
- **REQ-100** Muestra los próximos torneos (`state = upcoming`, fecha futura, Valencia o `is_online` según filtro) ordenados por fecha.
- **REQ-101** Muestra los resultados del último torneo `completed`: nombre, fecha, top 8 de cada evento y enlace a start.gg.
- **REQ-102** Muestra un resumen del top 5 del leaderboard del semestre en curso.
- **REQ-103** La landing usa la identidad visual de ValenciaSmash: tema oscuro con acentos ámbar y azul, logo proporcionado por la comunidad e interfaz responsive.
- **REQ-104** El bloque del ranking actual muestra puesto, jugador, variación, e icono del personaje principal para los cinco primeros.
- **AC-100** Dado un torneo futuro importado, aparece en la landing sin intervención adicional.
- **AC-101** Sin torneos, se muestran estados vacíos legibles, sin errores.
- **AC-102** La página se sirve cacheada y se revalida al importar o reimportar (`revalidateTag`).

### 6.2 Autenticación y ficha de jugador
- **REQ-200** Registro e inicio de sesión con username y contraseña (mín. 12, máx. 128 caracteres). El registro requiere un email único, confirmación de mayoría de edad y aceptación de términos; la sesión no se habilita hasta verificar el email. Al crear la cuenta se crea un `player` vacío.
- **REQ-201** El usuario DEBE poder editar: Nick (almacenado como `gamertag`), nombre, apellidos, Twitter, Twitch, foto, personaje principal y personaje secundario opcional, y bio (máx. 500 caracteres). El principal y el secundario se eligen en desplegables con icono y nombre; el secundario no puede duplicar al principal.
- **REQ-202** La bio DEBE sanearse (texto plano o Markdown limitado, sin HTML).
- **REQ-203** Foto: JPEG/PNG/WebP, máx. 2 MB [CFG], redimensionada y recodificada en servidor a WebP 512×512, subida a R2 con subida directa firmada o por el servidor.
- **REQ-204** La ficha pública `/players/[username]` muestra: Nick, nombre y apellidos, redes sociales, personajes, ranking actual, historial de torneos, estadísticas de point matches y títulos.
- **REQ-205** El usuario DEBE poder eliminar su cuenta. Se anonimiza el `player` (se conserva el historial de torneos).
- **REQ-206** El sistema DEBE enviar enlaces de verificación y recuperación de contraseña por correo. En producción usa Resend; en desarrollo local los enlaces se muestran en la consola.
- **AC-200** Un usuario sin sesión no puede editar ninguna ficha (403).
- **AC-201** Un archivo que no sea imagen o supere el límite se rechaza con mensaje claro.

### 6.3 Vinculación con start.gg
- **REQ-210** Método principal: OAuth2 de start.gg (scope `user.identity`). Tras el callback se consulta `currentUser { id slug player { id gamerTag } }`.
- **REQ-211** Si existe un `player` con ese `startgg_player_id` sin `user`, se fusiona con el jugador del usuario y se reclama su historial. Si ya pertenece a otro usuario, se rechaza con error.
- **REQ-212** El token de usuario NO se persiste.
- **REQ-213** Respaldo: el usuario introduce su slug, el vínculo queda `pending` y un admin lo aprueba o rechaza.
- **REQ-214** El usuario PUEDE desvincular; el historial permanece en el jugador.
- **AC-210** Un vínculo `verified` por OAuth queda activo sin intervención de admin.
- **AC-211** Dos usuarios no pueden verificar el mismo `startgg_player_id`.
- **Riesgo abierto:** confirmar scopes y campos reales de start.gg con una prueba temprana (spike T-2.0).

### 6.4 Importación de torneos (solo manual)
- **REQ-300** Solo `importer` y `admin` acceden a `/admin/import`. NO existen jobs programados.
- **REQ-301** Flujo: pegar URL o slug, luego previsualización (nombre, fecha, ciudad, eventos de Smash Ultimate `videogameId = 1386`, participantes), luego confirmar e importar.
- **REQ-302** Solo se importan eventos de Smash Ultimate. Los demás se ignoran y se informa.
- **REQ-303** La importación DEBE ser idempotente: upsert por `startgg_id` y reimportar no duplica datos.
- **REQ-304** La importación DEBE ejecutarse por lotes (torneo, eventos, standings paginados, sets paginados) con endpoints por paso y progreso visible en el cliente, para respetar los límites de CPU y subrequests de Workers.
- **REQ-305** El cliente de start.gg DEBE respetar el límite de 80 peticiones por 60 s, con *throttling* y reintento con *backoff* ante 429.
- **REQ-306** Se admiten torneos futuros (`upcoming`, sin sets) y se pueden reimportar con un botón "actualizar" al finalizar.
- **REQ-307** Cada acción queda registrada en `import_log` (quién, qué, cuándo, resultado).
- **REQ-308** Los jugadores nuevos se crean como fantasmas. Si el `startgg_player_id` ya existe, se reutiliza.
- **REQ-309** Tras importar un torneo completado se invalida la caché del leaderboard del semestre afectado.
- **REQ-310** Se DEBERÍA permitir borrar un torneo importado por error (solo `admin`), con recálculo.
- **AC-300** Reimportar el mismo torneo dos veces deja el mismo número de filas.
- **AC-301** Un `user` sin permiso recibe 403 en cualquier endpoint de importación.
- **AC-302** Un fallo a mitad de importación permite reanudar sin duplicar ni corromper datos.

### 6.5 Ranking semestral
- **REQ-400** Existe la interfaz:
  ```ts
  interface RatingAlgorithm {
    id: string
    compute(sets: SetResult[], opts: Record<string, unknown>): RatingResult[]
  }
  ```
  Es una función pura y determinista.
- **REQ-401** Implementación inicial: Elo con inicial 1000 [CFG], K = 32 [CFG]. Los sets se procesan en orden cronológico (`completed_at`, desempate por `id`). Los DQ se ignoran [CFG].
- **REQ-402** El leaderboard del semestre usa solo sets de torneos con `start_at` dentro del semestre.
- **REQ-403** Se muestra posición, jugador, rating, sets ganados/perdidos y nº de torneos. Mínimo de torneos para aparecer: 1 [CFG].
- **REQ-404** El resultado se recalcula entero (no incremental) tras cada importación y se guarda en `ratings_snapshot (season_key, algorithm_id, player_id, rating, rank, wins, losses, tournaments)`.
- **REQ-405** Cambiar de algoritmo DEBE ser registrar otra implementación y fijar `ACTIVE_ALGORITHM`, sin migrar datos.
- **REQ-406** Selector de semestres anteriores.
- **AC-400** Con un conjunto de sets fijo, la salida del Elo es idéntica entre ejecuciones (test con vectores conocidos).
- **AC-401** Un set de un torneo de junio no afecta al semestre S2.
- **Pendiente:** el algoritmo definitivo llegará como especificación aparte (puede usar placements).

### 6.6 Point matches

#### Reglas de puntos
- **REQ-500** Los puntos son virtuales, sin valor monetario, no comprables, canjeables ni transferibles.
- **REQ-501** Todos empiezan a 0 cada semestre. El saldo es derivado: `Σ apuestas ganadas − Σ apuestas perdidas` de PM `confirmed` con `played_at` en el semestre. No hay tabla de saldo ni de reinicio.
- **REQ-502** Se puede apostar sin saldo y el saldo puede ser negativo.
- **REQ-503** Un jugador no puede desafiarse a sí mismo.

#### Tipos
| | Planeado | Matchmaking |
|---|---|---|
| Apuesta | 1 a 1000 pts [CFG `pm.max_wager`] | Fija 100 pts [CFG `pm.mm_wager`] |
| Rival | Elegido | Aleatorio |
| Límite | 5 por jugador y día [CFG `pm.max_planned_per_day`] | Sin límite diario, restricción de repetición |

- **REQ-510** El límite de 5 planeados/día cuenta, para cada jugador, los planeados creados ese día (día `Europe/Madrid`) en estados `proposed`, `accepted`, `reported`, `confirmed` y `disputed`. Se aplica al retador y al receptor: no se puede crear ni aceptar un PM si alguno ya llegó al límite.
- **REQ-511** El servidor DEBE forzar la apuesta del matchmaking a 100, ignorando la entrada del cliente.
- **REQ-512** Un jugador solo puede aparecer en un PM abierto con el mismo rival a la vez.

#### Estados
```
proposed -> accepted -> reported -> confirmed
   |           |            \-> disputed -> confirmed | voided (admin)
   |           \-> cancelled
   \-> rejected | cancelled | expired
```
- **REQ-520** Un `proposed` sin respuesta caduca a las 48 h [CFG] y pasa a `expired`. Se evalúa al consultar, sin cron.
- **REQ-521** Reporte: tras jugarse, cualquiera de los dos reporta `best_of`, victorias de cada uno y, opcionalmente, personajes por partida. El otro jugador confirma o disputa.
- **REQ-522** Si ambos reportan datos idénticos, o el segundo confirma el reporte del primero, pasa a `confirmed`. Si difieren, `disputed`.
- **REQ-523** Un `admin` resuelve las disputas fijando el resultado final o anulando (`voided`). Se registra quién y cuándo.
- **REQ-524** El resultado DEBE ser coherente: ganador con `ceil(best_of/2)` victorias, `best_of` ∈ {1, 3, 5, 7} [CFG].
- **REQ-525** El `played_at` (que fija el semestre) se establece en la confirmación. Un PM confirmado es inmutable salvo corrección por admin.
- **REQ-526** Los reportes sin respuesta durante 7 días [CFG] pasan a `expired` y no puntúan.
- **REQ-527** Las transiciones DEBEN ser transaccionales y validar el estado previo, para evitar condiciones de carrera (doble confirmación).

#### Matchmaking aleatorio
- **REQ-530** Acción "buscar rival": si hay alguien elegible en `matchmaking_queue`, se crea el PM en estado `accepted` con ambos jugadores y ambos se retiran de la cola. Si no, el jugador entra en la cola.
- **REQ-531** Elegible significa: no es el mismo jugador, no ha jugado matchmaking con ese rival más de 1 vez en los últimos 7 días [CFG], y la entrada no ha expirado.
- **REQ-532** Las entradas de la cola expiran a las 24 h [CFG] y se purgan al consultar.
- **REQ-533** El emparejamiento DEBE ser atómico (p. ej. `SELECT ... FOR UPDATE SKIP LOCKED`) para que dos jugadores no sean emparejados dos veces.
- **REQ-534** El jugador puede salir de la cola. Su estado se ve al recargar o por polling ligero (sin websockets).

#### Leaderboards (por semestre, solo PM `confirmed`)
- **REQ-540 Ladrón de la temporada:** mayor suma neta de puntos. Líder provisional durante el semestre, titular al cierre.
- **REQ-541 Mejor duelista:** mayor % de sets ganados, con un mínimo de 5 sets jugados [CFG `pm.min_sets_duelist`]. Desempate por más sets.
- **REQ-542 Mayor gambler:** mayor nº de sets jugados.
- **REQ-543** Al cerrar un semestre, los campeones se guardan en `season_titles` y se muestran en la ficha.
- **REQ-544** Un "set" es un point match confirmado. Si se prefiere contar partidas individuales, se aclara antes de implementar.
- **AC-500** Un jugador con 1 set ganado no aparece en el ranking de duelista.
- **AC-501** Un PM confirmado el 30 de junio cuenta en S1 y uno del 1 de julio en S2.
- **AC-502** Sumar los puntos de todos los jugadores del semestre es igual a 0.
- **AC-503** Intentar crear el 6.º planeado del día devuelve error de límite.
- **AC-504** Dos reportes distintos dejan el PM en `disputed` y fuera de los leaderboards.

### 6.7 PWA (Progressive Web App)
- **REQ-600** La web DEBE ser instalable en Android e iOS: `manifest.webmanifest` (nombre, `short_name`, `display: standalone`, `start_url: /`, `theme_color`, `background_color`, `lang: es`) e iconos 192, 512 y maskable, más `apple-touch-icon`.
- **REQ-601** Service worker (Serwist o equivalente compatible con OpenNext/Workers) con estrategias:
  - Assets estáticos: *cache-first*.
  - Landing y leaderboards públicos: *stale-while-revalidate*.
  - Rutas autenticadas y mutaciones (`/point-matches`, `/admin`, `POST`): *network-only*, nunca cacheadas.
- **REQ-602** Página offline (`/offline`) con mensaje claro cuando no hay conexión y la ruta no está en caché.
- **REQ-603** Se muestra un aviso de instalación (botón "Instalar app") usando `beforeinstallprompt` en Android. En iOS, instrucciones de "Añadir a pantalla de inicio". PUEDE ocultarse tras descartarlo.
- **REQ-604** Notificaciones push (Web Push con VAPID, sin coste), con opt-in explícito por usuario y por categoría:
  - Point match: desafío recibido, aceptado, rival ha reportado, disputa resuelta, emparejamiento encontrado.
  - Torneos: nuevo torneo importado (opcional).
- **REQ-605** Tabla `push_subscriptions (id, user_id, endpoint UNIQUE, p256dh, auth, user_agent, created_at)` y `notification_prefs (user_id, category, enabled)`. Las suscripciones caducadas (410/404) se eliminan al enviar.
- **REQ-606** El envío se dispara desde los casos de uso (sin jobs ni colas) y NO debe bloquear la respuesta (`waitUntil` de Workers). Un fallo de push no debe revertir la acción de negocio.
- **REQ-607** En iOS el push solo funciona con la PWA instalada (iOS 16.4+). La UI DEBE explicarlo y no pedir permiso antes de la instalación.
- **REQ-608** Al cerrar sesión o eliminar la cuenta se borran sus suscripciones push y se limpia la caché de datos de usuario.
- **REQ-609** Las claves VAPID se guardan como secretos de servidor.
- **NFR-007** Lighthouse PWA: instalable, y rendimiento ≥ 90 en móvil en la landing.
- **AC-600** Lighthouse marca la app como instalable en producción (HTTPS).
- **AC-601** Sin conexión, la landing cacheada se muestra y las rutas de point matches muestran `/offline`, sin datos de sesión en caché.
- **AC-602** Un usuario que desactiva una categoría no recibe esa notificación.
- **AC-603** Una suscripción con endpoint expirado se elimina automáticamente al intentar enviar.
- **AC-604** Un fallo del servicio push no impide que el point match cambie de estado.

### 6.8 Preparación para app nativa futura
- **REQ-620** La lógica de negocio DEBE exponerse también como API HTTP versionada (`/api/v1/...`, JSON, validada con Zod) además de las *server actions*, de modo que una futura app (Capacitor o Expo) pueda consumirla sin reescribir el backend.
- **REQ-621** La API DEBERÍA admitir autenticación por token (Bearer) además de cookie de sesión.
- **REQ-622** Los contratos DEBERÍAN documentarse con OpenAPI generado desde los esquemas Zod.
- Fuera de alcance de la v1: publicación en Google Play y App Store.

## 7. Seguridad y abuso
- **SEC-001** Validación Zod en todas las entradas y comprobación de autorización por recurso (solo participantes ven y modifican su PM).
- **SEC-002** Limitación de tasa en endpoints de escritura (p. ej. Cloudflare rate limiting o tabla de contadores).
- **SEC-003** Protección CSRF y cookies `HttpOnly`, `Secure`, `SameSite=Lax`.
- **SEC-004** Cabeceras de seguridad (CSP, X-Content-Type-Options, etc.).
- **SEC-005** Aviso legal visible en las páginas de PM: puntos sin valor y sin intermediación. El registro exige confirmar mayoría de edad y aceptar los términos; el texto legal actual es un borrador que requiere revisión antes de abrir el servicio al público.
- **SEC-006** Registro de auditoría de acciones de admin (roles, disputas, importaciones, verificaciones).
- **SEC-007** Detección de farmeo: informe admin de parejas con muchos PM entre sí.

## 8. Configuración (`app_config`, editable por admin)
`pm.max_wager=1000`, `pm.mm_wager=100`, `pm.max_planned_per_day=5`, `pm.proposal_ttl_h=48`, `pm.report_ttl_d=7`, `pm.min_sets_duelist=5`, `pm.mm_queue_ttl_h=24`, `pm.mm_repeat_per_week=1`, `elo.initial=1000`, `elo.k=32`, `ranking.active_algorithm=elo`, `ranking.min_tournaments=1`.

Configuración de autenticación/cuenta: `ADMIN_EMAILS` es la lista separada por comas de correos que reciben `admin` al registrarse; el resto empieza como `user`. El rate limit de Better Auth es persistente en BD en producción. La ficha admite dos personajes como máximo (principal y secundario opcional). Las contraseñas nuevas usan PBKDF2-HMAC-SHA-256 con 100 000 iteraciones, valor conservador mientras se valida el límite efectivo y la CPU del Worker desplegado (NFR-004, ADR-0012).

## 9. Estructura del proyecto
```
src/
  app/                 rutas Next.js (público, /players, /leaderboard, /point-matches, /admin)
  modules/
    auth/  players/  tournaments/  ranking/  pointmatches/
      domain/          lógica pura (sin I/O): reglas, estados, algoritmos
      application/     casos de uso (orquestan repositorios)
      infra/           Drizzle, cliente start.gg, R2
  lib/                 config, semestre, fechas, errores
drizzle/               migraciones
tests/                 unit/ e e2e/
```
- **ARQ-001** La lógica de dominio (Elo, semestres, máquina de estados, reglas del límite diario) DEBE ser pura y testeable sin BD.
- **ARQ-002** Los módulos solo se comunican por sus casos de uso públicos.

## 10. Plan de implementación por fases
Cada tarea se cierra cuando sus AC pasan.

| Fase | Tareas | Reqs |
|---|---|---|
| **0. Fundaciones** | T-0.1 Repo, TS estricto, lint, CI. T-0.2 Next.js + OpenNext en Cloudflare (hello world desplegado). T-0.3 Neon + Drizzle + migración inicial. T-0.4 `lib/season` con tests | NFR-001..004, REQ-011 |
| **1. Auth y fichas** | T-1.1 Better Auth (username/correo/contraseña), verificación con Resend y roles. T-1.2 Ficha editable. T-1.3 Foto a R2. T-1.4 Perfil público | REQ-001, 002, 200..206 |
| **2. start.gg** | **T-2.0 Spike OAuth/API real (scopes, campos)**. T-2.1 Cliente GraphQL con throttling. T-2.2 Previsualización. T-2.3 Importación por lotes e idempotente. T-2.4 Panel y auditoría. T-2.5 OAuth y vinculación (+ respaldo admin). T-2.6 Landing | REQ-100..102, 210..214, 300..310 |
| **3. Ranking** | T-3.1 Interfaz y Elo con tests de vectores. T-3.2 Snapshots y recálculo. T-3.3 UI del leaderboard | REQ-400..406 |
| **4. Point matches** | T-4.1 Máquina de estados y reglas puras. T-4.2 Planeados y límite diario. T-4.3 Reporte y confirmación. T-4.4 Disputas admin. T-4.5 Cola de matchmaking. T-4.6 Tres leaderboards y títulos | REQ-500..544 |
| **5. Cierre** | T-5.1 Panel admin y configuración. T-5.2 RGPD y textos legales. T-5.3 SEO, Sentry, UptimeRobot. T-5.4 E2E de los flujos críticos | NFR-005, 006, SEC-* |
| **6. PWA** | T-6.1 Manifest, iconos y aviso de instalación. T-6.2 Service worker y página offline. T-6.3 Web Push (VAPID, suscripciones, preferencias). T-6.4 Notificaciones en casos de uso de point matches. T-6.5 API `/api/v1` y OpenAPI | REQ-600..622, NFR-007 |

### Estado de implementación (24 nov 2026)
- **Fase 0:** Next.js, OpenNext, Neon/Drizzle, PGlite local, migraciones y `lib/season` implementados. Builds de Next.js y OpenNext comprobadas localmente; el despliegue real en Cloudflare/Neon está pendiente.
- **Fase 1 implementada parcialmente:** landing con logo/paleta; Better Auth con username, contraseña, verificación y recuperación por email; adaptador Resend en producción y enlaces por consola en desarrollo; roles por `ADMIN_EMAILS`; aceptación de edad/términos; ficha editable y pública, redes sociales, borrado/anonimización y selector principal/secundario; catálogo estático de 86 entradas.
- El catálogo muestra un icono del primer color disponible por personaje. Se mantienen los iconos de variantes originales en `public/Stock Icons/`; los 86 iconos de ficha están normalizados en `public/characters/`.
- La migración `0003` elimina `players.display_name`; la ficha usa `first_name` y `last_name`.
- La landing muestra un top 5 provisional mantenido en `modules/ranking/domain/current-ranking.ts` con los datos proporcionados por la comunidad (MVL/Diddy Kong, Nub/Joker, Samu/Roy, Sir William/Palutena y Raptor/Meta Knight, con sus variaciones). Aún no se calcula desde `ratings_snapshot`; eso corresponde a la Fase 3.
- **Pendiente:** subida/recodificación de fotos WebP a R2 (T-1.3), datos reales de torneos, cálculo persistente del ranking, y revisión legal final de los términos. Resend real no se valida hasta configurar dominio verificado y API key.
- **Verificación local:** 17 pruebas unitarias, `lint`, `typecheck`, `format:check`, `next build` y build de OpenNext comprobadas. E2E de Playwright todavía pendiente de ejecutar con Chromium instalado.

## 11. Definición de hecho (DoD)
- Todos los AC de la tarea pasan en CI.
- Lógica de dominio con cobertura unitaria alta, y sin I/O.
- Migraciones versionadas y reversibles.
- Sin secretos en el cliente ni en el repositorio.
- Desplegado en Cloudflare en un entorno de preview.

## 12. Riesgos y preguntas abiertas
1. **start.gg OAuth/API:** confirmar scopes y campos (spike T-2.0).
2. **Límites de Workers gratuito** (CPU, subrequests): validar con un torneo grande real. Plan B: ejecutar la importación desde un endpoint por lotes más pequeños.
3. **Neon free:** latencia en frío. Mitigado con caché de la landing.
4. **Algoritmo de ranking definitivo:** pendiente. La interfaz debe admitir placements y no solo sets.
5. **Definición de "set" en leaderboards de PM:** ¿PM completo o partidas individuales? (REQ-544).
6. **Moderación de contenido** (fotos y bios ofensivas): por ahora, reporte manual a admin.
7. **Assets de Nintendo:** los iconos de personajes tienen permiso informal de su autor en Reddit, sin archivo de licencia; ese permiso no cubre los derechos sobre el arte original. Ver [ADR-0011](adr/0011-iconos-de-personajes-de-terceros.md). Mantener aviso de no afiliación y mecanismo de retirada.
8. **Edad mínima y términos legales:** redacción revisada por la comunidad.
9. **Service worker en OpenNext/Cloudflare:** validar compatibilidad (Serwist) en la fase 0 con un spike, antes de la fase 6.
10. **Push en iOS:** requiere PWA instalada y iOS 16.4+. Adopción limitada, y las notificaciones in-app (campana) son el respaldo.
11. **Límite de CPU del plan gratuito** al enviar push a muchos suscriptores: enviar en lotes pequeños con `waitUntil`.
12. **PBKDF2 en Workers:** hay un reporte de producción que observa un máximo de 100 000 iteraciones con `compatibility_date` 2026-10-04, mientras `wrangler dev --local` con `compatibility_date` 2026-11-20 aceptó 100 001. Validar el límite del servicio gestionado y CPU antes de producción. Ver ADR-0012.
