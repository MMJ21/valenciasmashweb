# ADR-0007: Semestre derivado de la fecha

- **Estado:** Aceptado
- **Fecha:** 2026-11-24 (documentado)
- **Requisitos relacionados:** REQ-011, REQ-402, AC-401, AC-501
- **Sustituye a:** ninguno

## Contexto

Los rankings y point matches se agrupan por semestre natural, con límites definidos por calendario de Valencia.

## Decisión

Derivar `YYYY-S1` o `YYYY-S2` a partir de la fecha en `Europe/Madrid`. No crear una tabla de temporadas.

## Alternativas consideradas

- **Tabla `seasons`:** descartada porque las fechas son fijas y se calculan sin administración adicional.
- **Usar UTC para el corte:** descartado porque puede desplazar eventos alrededor de medianoche respecto al día local.

## Consecuencias

### Positivas

- Una única función pura y testeable define el periodo para rankings y point matches.
- No se requieren registros de temporada ni un job de reinicio.

### Costes y riesgos

- Las consultas y límites deben usar explícitamente la zona `Europe/Madrid`, especialmente cerca de los cambios de semestre.

## Referencias

- [Especificación](../spec.md), REQ-011, REQ-402, AC-401, AC-501.
