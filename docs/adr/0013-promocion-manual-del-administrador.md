# ADR-0013: Promoción manual del administrador inicial

- **Estado:** Aceptado
- **Fecha:** 2026-11-26
- **Requisitos relacionados:** REQ-001, REQ-002, SEC-001
- **Sustituye a:** asignación de rol admin por `ADMIN_EMAILS` durante el alta, descrita en ADR-0004

## Contexto

Asignar el rol privilegiado durante el registro, antes de verificar el correo, permite que unas credenciales elegidas por un tercero queden asociadas a una cuenta incluida en una lista de administradores. La verificación posterior del buzón no demuestra que quien creó esas credenciales sea su propietario.

## Decisión

Todas las cuentas creadas mediante registro reciben el rol `user`. La promoción inicial a `admin` se realiza de forma manual con `pnpm admin:promote <correo>`, ejecutado por un operador con acceso a la base de datos. El script solo modifica cuentas existentes con correo verificado y sin marca de baja. Repetir la promoción es idempotente.

Sin `DATABASE_URL`, el script opera sobre la PGlite local. Para una base desplegada, el operador debe proporcionar `DATABASE_URL` explícitamente en el entorno de la terminal y verificar que apunta al destino correcto antes de ejecutarlo. El comando no se expone en la aplicación ni en CI.

## Alternativas consideradas

- **Promover por allowlist durante el alta:** descartado porque el rol se asigna antes de probar propiedad del buzón.
- **Promover automáticamente tras verificar el correo:** descartado porque una cuenta pendiente creada por un tercero podría conservar sus credenciales cuando el propietario verifica el correo.
- **Endpoint o interfaz para asignar roles:** descartado por ahora; la promoción inicial es una operación excepcional y no hay gestión general de usuarios implementada.

## Consecuencias

### Positivas

- Ningún registro público obtiene un rol privilegiado automáticamente.
- La promoción requiere evidencia de correo verificado y ejecución fuera de la superficie web.
- El procedimiento es repetible y deja una salida explícita para el operador.

### Costes y riesgos

- La promoción inicial requiere acceso a la base de datos y una operación manual.
- El script no proporciona auditoría persistente ni permite degradar o administrar otros roles.
- El operador debe proteger la cadena de conexión y confirmar el entorno destino.

## Referencias

- [Especificación](../spec.md), REQ-001, REQ-002 y SEC-001.
- [ADR-0004](0004-better-auth-username-password.md), autenticación con Better Auth.
