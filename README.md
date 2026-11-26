# ValenciaSmash

Aplicación de la comunidad ValenciaSmash. La arquitectura y los requisitos están descritos en `docs/spec.md`.

Las decisiones y alternativas arquitectónicas se documentan en el [índice de ADR](docs/adr/README.md).

## Requisitos

- Node.js 22 o superior
- pnpm 10.22.0 (`corepack enable` y `corepack prepare pnpm@10.22.0 --activate`)
- PostgreSQL compatible con Neon para comandos de base de datos

## Desarrollo local

1. Instala dependencias: `corepack pnpm install`.
2. Copia `.env.example` a `.env.local`. No necesitas `DATABASE_URL` para usar la base local.
3. Inicializa y siembra la base local: `corepack pnpm db:local`.
4. Arranca Next.js: `corepack pnpm dev`.

La web está en `http://localhost:3000`; la comprobación de salud, en `/api/health`; el registro, en `/auth/sign-up`; y el inicio de sesión, en `/auth/sign-in`.
En desarrollo, `/api/dev/players` devuelve las fichas de prueba; esta ruta responde 404 en producción.

La base incluye estas cuentas de prueba verificadas:

| Usuario         | Rol        |
| --------------- | ---------- |
| `localadmin`    | `admin`    |
| `localimporter` | `importer` |
| `localplayer`   | `user`     |

Contraseña local de las tres: `SmashVLC-2026!`. No reutilices estas credenciales en producción.
Al registrarte en local, el enlace de verificación se imprime en la consola de `pnpm dev`.

## Base de datos local

- Sin `DATABASE_URL`, el entorno de desarrollo usa PGlite, un Postgres embebido que no requiere instalar Docker ni un servidor. Los datos se guardan en `.data/pglite/` (ignorado por Git).
- `pnpm db:local` aplica las migraciones Drizzle pendientes y agrega datos de ejemplo (admin, importer, usuario normal y jugador fantasma). Se puede repetir sin duplicar registros.
- `pnpm db:reset` elimina **solo** `.data/pglite/` y la vuelve a crear con la migración y las semillas.
- El historial Drizzle se consolidó en la migración inicial `0000` antes del primer despliegue. Esa baseline es solo para bases nuevas y no actualiza de forma segura esquemas previos; si tu PGlite conserva el historial anterior, ejecuta `pnpm db:reset`. Desde el primer despliegue real, cualquier cambio de esquema debe publicarse como migración incremental, preservando los datos y vínculos existentes.
- Para usar Neon en desarrollo, define `DATABASE_URL` en `.env.local`; esa URL tiene prioridad sobre PGlite.
- Todas las cuentas nuevas empiezan como `user`. Antes de promover a alguien a admin, verifica que controla las credenciales de la cuenta además de comprobar que el correo está verificado. Puedes exigir que restablezca su contraseña desde el enlace enviado a ese buzón (Better Auth tiene activa la revocación de sesiones al restablecerla), y entonces ejecutar `pnpm admin:promote correo@ejemplo.com --credential-reset`; como alternativa, confirma su identidad por un canal independiente del correo de la cuenta y ejecuta `pnpm admin:promote correo@ejemplo.com --identity-confirmed`. El flag elegido es una declaración del operador; no sustituye realizar la comprobación. Sin `DATABASE_URL`, el comando usa la base PGlite local; para Neon, define `DATABASE_URL` en el entorno de la terminal antes de ejecutarlo. Comprueba cuidadosamente la base destino antes de usarlo.
- Sin `RESEND_API_KEY` y `EMAIL_FROM`, los correos de verificación y recuperación se muestran en la consola local. En producción ambos secretos son obligatorios.
- Para producción configura `BETTER_AUTH_SECRET` (32+ caracteres aleatorios), `BETTER_AUTH_URL`, `RESEND_API_KEY` y `EMAIL_FROM` en los secretos del entorno; no los incluyas en Git.
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

## Auth y perfiles

- Better Auth usa username, correo y contraseña con verificación obligatoria. Los identificadores son UUID y `user` es la única tabla de usuarios.
- El perfil se edita en `/account` con Nick, nombre y apellidos, Twitter, Twitch, biografía y desplegables de personaje principal/secundario; se consulta en `/players/<username>`.
- Los 86 iconos usados por la app están en `public/characters/`. El archivo completo de variantes `public/Stock Icons/` se ignora en Git y se conserva solo localmente. Para regenerar los iconos con `pnpm assets:characters`, descarga la carpeta de origen y colócala localmente en esa ruta.
- La subida de fotos a R2 aún no está conectada; `wrangler.jsonc` declara el bucket `valenciasmash`, que tendrás que crear para despliegues.
- No se guardan secretos en el repositorio. Usa secretos de Cloudflare para despliegues.
- La compatibilidad real de OpenNext con Workers y los límites del nivel gratuito se validan en el primer despliegue.

## Assets y derechos de terceros

Los iconos de personajes proceden de una colección compartida por `u/Max_Hamm` en [Reddit](https://www.reddit.com/r/smashbros/comments/1g8u7ug/i_made_200x200_pixel_versions_of_every_stock_icon/) y [Google Drive](https://drive.google.com/drive/folders/1Gj5_5OEBy7fyroFoIP08IXTwu_ovthiG). El autor comentó en Reddit que se podían usar libremente y sin crédito, pero no hay una licencia formal en la carpeta. Su permiso no cubre los derechos de Nintendo sobre personajes y arte originales; el uso de los iconos mantiene ese riesgo y no se presenta como autorización legal.

ValenciaSmash es un proyecto comunitario independiente, no afiliado, patrocinado ni respaldado por Nintendo. Para solicitar la retirada o sustitución de un asset, [abre una incidencia en el repositorio](https://github.com/MMJ21/valenciasmashweb/issues/new?title=Solicitud%20de%20retirada%20de%20asset). El razonamiento y las alternativas están documentados en [ADR-0011](docs/adr/0011-iconos-de-personajes-de-terceros.md).

## Estructura

```text
src/app/                 Rutas Next.js y API
src/modules/             Módulos de dominio (auth, players, tournaments, ranking, pointmatches)
src/lib/                 Configuración, fechas, errores y acceso a infraestructura compartida
drizzle/                 Migraciones versionadas
tests/unit/              Vitest
tests/e2e/               Playwright
```
