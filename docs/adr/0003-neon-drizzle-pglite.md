# ADR-0003: Neon/PostgreSQL, Drizzle y PGlite local

- **Estado:** Aceptado
- **Fecha:** 2026-11-24 (documentado)
- **Requisitos relacionados:** REQ-010, REQ-011, REQ-012, ARQ-001
- **Sustituye a:** ninguno

## Contexto

La aplicación requiere PostgreSQL, restricciones de unicidad e idempotencia, `jsonb` y transacciones para algunas operaciones. El desarrollo local debe funcionar sin Docker.

## Decisión

Usar Neon PostgreSQL en despliegues, Drizzle ORM y migraciones versionadas. Usar PGlite persistente en `.data/pglite/` para `next dev` y pruebas locales; aplicar los mismos archivos de migración.

## Alternativas consideradas

- **SQLite:** descartado porque requeriría otro dialecto/esquema y no ejercita las semánticas PostgreSQL del sistema.
- **Docker PostgreSQL:** ofrecería Postgres local real, pero el entorno del desarrollador no dispone de Docker.
- **Cloudflare D1:** no es PostgreSQL y diverge del modelo y los requisitos transaccionales.

## Consecuencias

### Positivas

- Un dialecto y un conjunto de migraciones para local y producción.
- No hace falta instalar un servidor local ni Docker.

### Costes y riesgos

- PGlite no sustituye pruebas de concurrencia real; matchmaking deberá validarse en PostgreSQL.
- Neon, la URL de producción y las migraciones desplegadas requieren configuración externa.

## Referencias

- [Especificación](../spec.md), REQ-010..012, ARQ-001.
