# ValenciaSmash

Esqueleto de la plataforma comunitaria ValenciaSmash. La arquitectura sigue el enfoque modular descrito en `docs/spec.md`.

## Requisitos

- Node.js 22 o superior
- pnpm 10.22.0 (`corepack enable` y `corepack prepare pnpm@10.22.0 --activate`)
- PostgreSQL compatible con Neon para comandos de base de datos

## Desarrollo local

1. Instala dependencias: `pnpm install`.
2. Copia `.env.example` a `.env.local`. No necesitas `DATABASE_URL` para usar la base local.
3. Inicializa y siembra la base local: `pnpm db:local`.
4. Arranca Next.js: `pnpm dev`.

La landing está en `http://localhost:3000` y la comprobación de salud en `/api/health`.
En desarrollo, `/api/dev/players` devuelve las fichas de prueba; esta ruta responde 404 en producción.

## Base de datos local

- Sin `DATABASE_URL`, el entorno de desarrollo usa PGlite, un Postgres embebido que no requiere instalar Docker ni un servidor. Los datos se guardan en `.data/pglite/` (ignorado por Git).
- `pnpm db:local` aplica las migraciones Drizzle pendientes y agrega datos de ejemplo (admin, importer, usuario normal y jugador fantasma). Se puede repetir sin duplicar registros.
- `pnpm db:reset` elimina **solo** `.data/pglite/` y la vuelve a crear con la migración y las semillas.
- Para usar Neon en desarrollo, define `DATABASE_URL` en `.env.local`; esa URL tiene prioridad sobre PGlite.
- La ruta de jugadores de depuración no implementa autenticación porque solo está habilitada en `NODE_ENV=development`; no debe usarse para servir datos de una cuenta real.

PGlite comparte el dialecto PostgreSQL y el historial de migraciones, pero no sustituye una prueba de concurrencia real en Neon: el matchmaking y los bloqueos se validarán contra PostgreSQL cuando se implemente esa funcionalidad.

El proyecto configura pnpm con `node-linker=hoisted` para que el trazado standalone de Next/OpenNext funcione también en Windows sin necesitar crear enlaces simbólicos en `.next`.

## Comandos

| Comando            | Uso                                 |
| ------------------ | ----------------------------------- |
| `pnpm lint`        | ESLint y límites entre módulos      |
| `pnpm typecheck`   | TypeScript sin emitir archivos      |
| `pnpm test`        | Pruebas unitarias Vitest            |
| `pnpm test:e2e`    | Smoke tests de Playwright           |
| `pnpm db:generate` | Generar migraciones Drizzle         |
| `pnpm preview`     | Compilar y previsualizar en Workers |
| `pnpm deploy`      | Compilar y desplegar en Cloudflare  |

## Estado de fundaciones

- Better Auth está decidido, pero deliberadamente no se instala ni se crean sus tablas en la migración inicial (opción A). Se incorporará con T-1.1.
- Las tablas base `users`, `players`, `player_characters` y `startgg_links` son el primer esquema de dominio. Durante T-1.1 se debe integrar la identidad de Better Auth y ajustar esta migración antes de usarla en producción.
- No se guardan secretos en el repositorio. Usa secretos de Cloudflare para despliegues.
- `wrangler.jsonc` declara el bucket R2 `valenciasmash`; créalo en la cuenta Cloudflare antes de desplegar.
- La compatibilidad real de OpenNext con Workers y los límites del nivel gratuito se validan en el primer despliegue.

## Estructura

```text
src/app/                 Rutas Next.js y API
src/modules/             Módulos de dominio (auth, players, tournaments, ranking, pointmatches)
src/lib/                 Configuración, fechas, errores y acceso a infraestructura compartida
drizzle/                 Migraciones versionadas
tests/unit/              Vitest
tests/e2e/               Playwright
```
