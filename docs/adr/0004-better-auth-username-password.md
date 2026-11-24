# ADR-0004: Better Auth con username, contraseña y verificación de correo

- **Estado:** Aceptado
- **Fecha:** 2026-11-24 (documentado)
- **Requisitos relacionados:** REQ-001, REQ-002, REQ-200, REQ-205, SEC-003, SEC-005
- **Sustituye a:** propuesta inicial de Discord OAuth (no implementada)

## Contexto

Discord se había propuesto como proveedor de login, pero la comunidad prefiere no depender de Discord para gestionar cuentas. Se requiere un acceso sencillo con username, correo y contraseña, además de verificación de email. También se necesita un único modelo de identidad que pueda servir a Better Auth y a las fichas.

## Decisión

Usar Better Auth con plugin de username y email/password. La tabla `user` de Better Auth es la única entidad de usuario, con roles y campos de confirmación/aceptación. El email debe verificarse antes de iniciar sesión. La baja elimina la cuenta de autenticación y anonimiza la ficha conservando el jugador y su historial.

## Alternativas consideradas

- **Discord OAuth:** descartado a petición del usuario; obligaba a los jugadores a usar Discord.
- **Auth.js:** descartado porque Better Auth aporta flujos integrados para username, verificación, recuperación y adaptador Drizzle.
- **Enlace mágico:** descartado por requerir email en cada login.
- **Tabla de usuarios propia en paralelo:** descartada para evitar duplicar y sincronizar identidades.

## Consecuencias

### Positivas

- Login independiente de proveedores sociales y un único modelo de usuario.
- Verificación y recuperación por email quedan en el mismo flujo.
- Las comprobaciones de rol se realizan en servidor; `ADMIN_EMAILS` concede admin al crear la cuenta.

### Costes y riesgos

- Hay que proteger contraseñas y controlar coste de cómputo en Workers.
- Se guardan datos personales y hashes, por lo que hay que completar textos y procesos RGPD antes de producción.
- La propuesta anterior de Discord queda sustituida; no se crean aplicación ni secretos de Discord.

## Referencias

- [Especificación](../spec.md), REQ-001, REQ-002, REQ-200..206, SEC-003, SEC-005.
