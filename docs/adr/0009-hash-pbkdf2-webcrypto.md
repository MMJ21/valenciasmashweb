# ADR-0009: Hash de contraseñas con PBKDF2 mediante Web Crypto

- **Estado:** Aceptado con reserva
- **Fecha:** 2026-11-24 (documentado)
- **Requisitos relacionados:** NFR-002, NFR-004, SEC-002
- **Sustituye a:** hash por defecto de Better Auth (scrypt)

## Contexto

La autenticación se ejecuta en Workers y tiene un presupuesto de CPU reducido. El hash debe ser salado, lento y compatible con Web Crypto, evitando dependencias Node que fallen en el runtime objetivo.

## Decisión

Configurar Better Auth con PBKDF2-HMAC-SHA-256, 600 000 iteraciones y salt aleatorio por contraseña, mediante `crypto.subtle`. El formato almacenado incluye algoritmo, iteraciones, salt y hash derivados.

## Alternativas consideradas

- **Scrypt predeterminado de Better Auth:** ofrece buen hash para Node, pero puede ser costoso o depender de primitivas no disponibles/adecuadas en Workers.
- **bcrypt:** descartado por coste de compatibilidad y su orientación a runtimes con librerías nativas.

## Consecuencias

### Positivas

- Usa Web Crypto estándar y no importa `node:crypto`.
- Salt aleatorio y comparación del hash sin salida anticipada por byte.

### Costes y riesgos

- Las 600 000 iteraciones son una decisión de seguridad provisional: el coste de CPU real debe medirse en Workers antes del despliegue público. Si excede NFR-004, debe reemplazarse mediante un ADR nuevo y migración/rehash segura.
- Los tests de unidad no sustituyen la prueba de latencia y CPU en Cloudflare.

## Referencias

- [Especificación](../spec.md), NFR-002, NFR-004, SEC-002.
