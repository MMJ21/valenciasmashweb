# ADR-0001: Monolito modular con Next.js y TypeScript

- **Estado:** Aceptado
- **Fecha:** 2026-11-24 (documentado)
- **Requisitos relacionados:** REQ-001, ARQ-001, ARQ-002
- **Sustituye a:** ninguno

## Contexto

ValenciaSmash es una aplicación para una comunidad local y un volumen previsto de cientos de usuarios. Hace falta mantener bajo el coste y evitar operar servicios separados sin necesidad. La lógica debe quedar separada por módulos y las reglas de dominio han de poder probarse sin I/O.

## Decisión

Construir un monolito modular con Next.js App Router, TypeScript estricto y módulos de dominio, aplicación e infraestructura.

## Alternativas consideradas

- **.NET:** el equipo tiene experiencia, pero el despliegue gratuito compatible con los requisitos resultaba menos directo.
- **Django/HTMX u otro framework monolítico:** viable, pero con menor alineación con el stack TypeScript elegido.
- **SPA más backend separado:** descartado porque añade despliegues y operación sin beneficio para la escala prevista.

## Consecuencias

### Positivas

- Un único repositorio y despliegue para frontend y backend.
- Tipos compartidos en toda la aplicación y límites entre módulos comprobados con ESLint.
- Menor coste operativo que mantener varios servicios.

### Costes y riesgos

- Hay que mantener los límites de módulos y evitar que el monolito se convierta en código acoplado.
- OpenNext introduce restricciones específicas del runtime de Workers.

## Referencias

- [Especificación](../spec.md), REQ-001, ARQ-001, ARQ-002.
