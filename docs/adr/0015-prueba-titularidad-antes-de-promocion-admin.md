# ADR-0015: Prueba de titularidad antes de promover al admin

- **Estado:** Aceptado
- **Fecha:** 2026-11-26
- **Requisitos relacionados:** REQ-001, REQ-002, SEC-001
- **Sustituye a:** ADR-0014, para los medios aceptados de demostrar control de las credenciales

## Contexto

La verificación del correo acredita acceso al buzón, pero no demuestra por sí sola que la persona propietaria del buzón eligió las credenciales asociadas a una cuenta pendiente creada anteriormente por un tercero.

## Decisión

Antes de promover, el operador debe comprobar el control de las credenciales por uno de estos medios:

1. El propietario restablece la contraseña usando el enlace enviado a su buzón. Better Auth mantiene activa `revokeSessionsOnPasswordReset`, por lo que las sesiones anteriores se revocan.
2. El operador confirma la identidad mediante un canal independiente del correo de la cuenta.

El script exige exactamente uno de los flags `--credential-reset` o `--identity-confirmed` como declaración explícita del medio completado. En ambos casos conserva `assertEligibleForAdminPromotion`, que exige usuario existente, email verificado y cuenta no eliminada; el `UPDATE` vuelve a comprobar email verificado y ausencia de baja de forma atómica.

Los flags registran una declaración operativa, no evidencia independiente persistida. El operador debe completar de verdad la comprobación indicada antes de ejecutar el comando.

## Alternativas consideradas

- **Confiar solo en la verificación del correo:** descartado porque no reemplaza una contraseña que un tercero eligió para una cuenta pendiente.
- **Exigir únicamente restablecimiento de contraseña:** descartado como única opción para permitir la confirmación presencial o por otro canal independiente cuando el flujo de recuperación no sea viable.
- **Auditoría persistente:** diferida; la promoción inicial es excepcional y la aplicación aún no administra roles desde una interfaz.

## Consecuencias

### Positivas

- El procedimiento requiere evidencia adicional al email verificado.
- La baja concurrente sigue bloqueando la escritura final de promoción.

### Costes y riesgos

- La comprobación de canal independiente depende del criterio del operador.
- El flag no demuestra criptográficamente que la comprobación ocurrió.

## Referencias

- [Especificación](../spec.md), REQ-001, REQ-002 y SEC-001.
- [ADR-0014](0014-restablecimiento-antes-de-promocion-admin.md), alternativa de restablecimiento de contraseña.
