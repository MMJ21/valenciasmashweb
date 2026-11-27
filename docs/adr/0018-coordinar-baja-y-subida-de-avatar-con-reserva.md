# ADR-0018: Coordinar baja y subida de avatar mediante reserva en la base de datos

- **Estado:** Aceptado
- **Fecha:** 2026-11-27
- **Requisitos relacionados:** REQ-203, REQ-205, AC-203, AC-208, SEC-001
- **Sustituye a:** ninguno

## Contexto

La subida guarda el avatar en R2 y después actualiza `players.avatar_url`. La baja también borra el objeto de R2. Sin coordinación, una subida que todavía está procesando la imagen puede escribir el objeto después del borrado de la baja, incluso si luego la actualización del perfil detecta que la cuenta está inactiva.

## Decisión

- Antes de transformar y escribir una imagen, el servidor crea una reserva única por usuario en `avatar_uploads`, mediante un `INSERT ... SELECT` que bloquea la fila del usuario y solo inserta si la cuenta está activa.
- La reserva se mantiene durante la transformación, el `PUT` de R2 y la actualización de la ficha. Se elimina en un `finally`.
- La baja bloquea y marca la cuenta inactiva primero, impidiendo reservas nuevas. Luego espera la reserva existente, borra el avatar de R2 y solo entonces anonimiza la ficha y continúa con la eliminación.
- La actualización del avatar en Neon también bloquea y vuelve a comprobar la fila activa. Si detecta una baja en curso, la operación falla con `AppError("CONFLICT")`; la ruta borra el objeto antes de liberar la reserva.
- La espera tiene un límite de 60 segundos. Si se supera, la baja no continúa y devuelve un conflicto para que pueda reintentarse; la cuenta queda en estado pendiente.

## Alternativas consideradas

- **Borrar R2 antes de marcar la cuenta inactiva:** descartado porque permite que una subida ya iniciada cree el objeto después del borrado.
- **Bloqueo en memoria del Worker:** descartado porque no coordina peticiones atendidas por distintos isolates o instancias.
- **Durable Object por usuario:** descartado en este alcance; añade un binding y una nueva capa persistente cuando una reserva en Neon ya proporciona la coordinación necesaria.

## Consecuencias

### Positivas

- Una baja no se completa mientras la subida reservada pueda dejar un objeto en R2.
- Las nuevas subidas quedan rechazadas desde que la cuenta se marca inactiva.
- El bloqueo se comparte entre instancias del Worker porque vive en Neon.

### Costes y riesgos

- Añade la tabla `avatar_uploads` y la migración incremental `0003`.
- Si una instancia termina abruptamente antes de liberar la reserva, la baja no se completará al vencer la espera; el usuario puede reintentarlo. Se prefiere fallar de forma cerrada a completar la baja con un posible objeto residual.
- La baja marca primero `deletedAt`; si la espera o el borrado R2 fallan, la cuenta permanece en estado pendiente para reintentar.

## Referencias

- [Especificación](../spec.md), REQ-203, REQ-205, AC-203, AC-208 y SEC-001.
- [Esquema de reserva de avatar](../../src/modules/players/infra/schema.ts).
- [Flujo de subida](../../src/modules/players/application/avatar-upload.ts).
