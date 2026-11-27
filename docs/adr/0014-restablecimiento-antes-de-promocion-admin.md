# ADR-0014: Restablecimiento de credenciales antes de promover al admin

- **Estado:** Sustituido por [ADR-0015](0015-prueba-titularidad-antes-de-promocion-admin.md)
- **Fecha:** 2026-11-26
- **Requisitos relacionados:** REQ-001, REQ-002, SEC-001
- **Sustituye a:** salvaguardas de credenciales de ADR-0013; se mantiene la decisión de promoción manual

## Contexto

Una persona podría registrar una dirección de correo permitida para el futuro administrador y elegir una contraseña que no conoce el propietario del buzón. Verificar el correo por sí solo no reemplaza esas credenciales si la cuenta pendiente ya existe.

## Decisión

Antes de ejecutar la promoción manual, el propietario del buzón debe completar el restablecimiento de contraseña de Better Auth usando el enlace recibido en esa dirección. El operador invoca `pnpm admin:promote <correo> --credential-reset`; el flag requiere una confirmación explícita de que el paso se completó. El script comprueba correo verificado y cuenta activa tanto en la lectura inicial como en el `UPDATE` condicional, para evitar promover una cuenta cuya baja concurrente ya haya empezado.

El flag es una confirmación operativa, no evidencia criptográfica almacenada. La garantía depende de respetar el procedimiento de recuperación antes de ejecutar el comando.

## Alternativas consideradas

- **Promover solo después de verificar el correo:** descartado porque el registro previo por un tercero podría dejar credenciales que el propietario del correo no eligió.
- **Automatizar la promoción tras la verificación:** descartado por el mismo riesgo de credenciales pendientes.
- **Auditar la confirmación en una tabla:** diferido; la promoción inicial es una operación excepcional ejecutada por un operador.

## Consecuencias

### Positivas

- El dueño del buzón establece una contraseña nueva antes de que la cuenta obtenga privilegios.
- La promoción se vuelve a validar en la escritura final, incluso ante una baja concurrente.

### Costes y riesgos

- El procedimiento requiere completar recuperación de contraseña y confirmar el paso al ejecutar el script.
- El flag no demuestra técnicamente que el restablecimiento ocurrió; sigue siendo responsabilidad del operador.

## Referencias

- [Especificación](../spec.md), REQ-001, REQ-002 y SEC-001.
- [ADR-0013](0013-promocion-manual-del-administrador.md), promoción manual del admin inicial.
