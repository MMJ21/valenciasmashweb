# ADR-0002: Cloudflare Workers con OpenNext

- **Estado:** Aceptado
- **Fecha:** 2026-11-24 (documentado)
- **Requisitos relacionados:** NFR-001, NFR-003, NFR-004
- **Sustituye a:** ninguno

## Contexto

El alojamiento debe costar 0 €/mes salvo el dominio. La aplicación usa Next.js App Router y necesita ejecutar lógica de servidor, con rutas públicas susceptibles de caché.

## Decisión

Desplegar Next.js en Cloudflare Workers mediante `@opennextjs/cloudflare`; usar Cloudflare R2 para imágenes cuando se implemente esa funcionalidad.

## Alternativas consideradas

- **VPS:** coste mensual y mantenimiento de servidor.
- **PaaS tradicional:** niveles gratuitos menos previsibles o incompatibles con coste cero.
- **Hosting estático:** no ejecutaría autenticación ni casos de uso del servidor.

## Consecuencias

### Positivas

- CDN y runtime serverless con nivel gratuito y despliegue cercano a los usuarios.
- Integración prevista con R2 para almacenar fotos.

### Costes y riesgos

- El límite de CPU y subrequests condiciona autenticación, transformaciones de imágenes e importaciones por lotes.
- OpenNext advierte de compatibilidad limitada en Windows; los builds locales de este repo han funcionado, pero falta un despliegue real de validación.

## Referencias

- [Especificación](../spec.md), NFR-001, NFR-003, NFR-004, REQ-203.
