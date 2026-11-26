# Architecture Decision Records

Este directorio registra las decisiones de arquitectura de ValenciaSmash mediante el formato MADR reducido, en español.

## Convenciones

- Cada decisión tiene un documento numerado secuencialmente (`0001`, `0002`, …) y estado explícito.
- Estados usados: `Propuesto`, `Aceptado`, `Aceptado con reserva`, `Rechazado` y `Sustituido`.
- Los ADR aceptados no se reescriben. Un cambio se registra en un ADR nuevo, que enlaza al anterior; después se actualizan la spec y este índice.
- Los ADR explican por qué se eligió una solución. Los requisitos funcionales y criterios verificables siguen en [`../spec.md`](../spec.md).
- Las decisiones de interfaz rutinarias y detalles de implementación no requieren ADR.

## Índice

| ADR                                                         | Decisión                                                      | Estado               |
| ----------------------------------------------------------- | ------------------------------------------------------------- | -------------------- |
| [0001](0001-monolito-modular-nextjs.md)                     | Monolito modular con Next.js y TypeScript                     | Aceptado             |
| [0002](0002-cloudflare-workers-opennext.md)                 | Cloudflare Workers con OpenNext                               | Aceptado             |
| [0003](0003-neon-drizzle-pglite.md)                         | Neon/PostgreSQL, Drizzle y PGlite local                       | Aceptado             |
| [0004](0004-better-auth-username-password.md)               | Better Auth con username, contraseña y verificación de correo | Sustituido           |
| [0005](0005-resend-correo-transaccional.md)                 | Resend para correo transaccional                              | Aceptado             |
| [0006](0006-importacion-manual-torneos.md)                  | Importación manual de torneos                                 | Aceptado             |
| [0007](0007-semestre-derivado-de-fecha.md)                  | Semestre derivado de la fecha local                           | Aceptado             |
| [0008](0008-catalogo-estatico-personajes.md)                | Catálogo estático de 86 selecciones                           | Aceptado             |
| [0009](0009-hash-pbkdf2-webcrypto.md)                       | PBKDF2 mediante Web Crypto (decisión sustituida)              | Sustituido           |
| [0010](0010-pwa-en-lugar-de-app-nativa.md)                  | PWA antes que una app nativa                                  | Aceptado             |
| [0011](0011-iconos-de-personajes-de-terceros.md)            | Uso de iconos de personajes aportados por la comunidad        | Aceptado con reserva |
| [0012](0012-pbkdf2-compatible-workers.md)                   | Límite PBKDF2 conservador para Workers                        | Aceptado con reserva |
| [0013](0013-promocion-manual-del-administrador.md)          | Promoción manual del administrador inicial                    | Sustituido           |
| [0014](0014-restablecimiento-antes-de-promocion-admin.md)   | Recuperar credenciales antes de promover al admin inicial     | Sustituido           |
| [0015](0015-prueba-titularidad-antes-de-promocion-admin.md) | Prueba de titularidad antes de promover al admin              | Aceptado             |
| [0016](0016-fotos-de-perfil-con-images-y-r2.md)             | Recodificar fotos con Images y almacenarlas en R2             | Aceptado con reserva |

## Plantilla

Usa [`0000-plantilla.md`](0000-plantilla.md) para nuevas decisiones.
