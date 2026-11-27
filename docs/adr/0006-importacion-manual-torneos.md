# ADR-0006: Importación manual de torneos

- **Estado:** Aceptado
- **Fecha:** 2026-11-24 (documentado)
- **Requisitos relacionados:** REQ-300..310
- **Sustituye a:** ninguno

## Contexto

Los datos de torneos vienen de start.gg. El servicio debe evitar tareas programadas y mantener el control editorial en la comunidad.

## Decisión

Solo usuarios con rol `importer` o `admin` importan torneos desde un panel manual, con vista previa, confirmación, progreso por lotes y auditoría. No habrá cron ni importación automática.

## Alternativas consideradas

- **Cron periódico:** descartado expresamente por el usuario; además consumiría cuota sin necesidad.
- **Importación automática por webhook:** descartada porque la comunidad desea decidir qué torneos incorpora.

## Consecuencias

### Positivas

- Control de qué datos se publican y cuándo.
- Sin trabajo de fondo ni coste de jobs.

### Costes y riesgos

- Alguien con permisos debe iniciar importación y reimportación.
- Debe diseñarse idempotencia y ejecución por lotes para respetar límites de Workers y start.gg.

## Referencias

- [Especificación](../spec.md), REQ-300..310.
