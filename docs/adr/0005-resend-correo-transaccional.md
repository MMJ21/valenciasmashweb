# ADR-0005: Resend para correo transaccional

- **Estado:** Aceptado
- **Fecha:** 2026-11-24 (documentado)
- **Requisitos relacionados:** REQ-200, REQ-206, NFR-001, NFR-002
- **Sustituye a:** ninguno

## Contexto

El registro debe verificar el email y Better Auth debe poder enviar enlaces de restablecimiento de contraseña. El backend se ejecuta en Workers, donde las conexiones SMTP directas no son apropiadas.

## Decisión

Enviar correo transaccional mediante la API HTTP de Resend. En local, si no hay credenciales de Resend, mostrar los enlaces en la consola. La clave y la dirección remitente se configuran solo en servidor (`RESEND_API_KEY`, `EMAIL_FROM`).

## Alternativas consideradas

- **SMTP propio:** descartado por la operación y la entregabilidad necesarias.
- **Brevo:** viable, pero se eligió Resend por su integración API sencilla.
- **Verificación manual por admin:** descartada como flujo normal porque no valida de forma escalable el control del correo.

## Consecuencias

### Positivas

- Pruebas locales sin cuenta de correo externa.
- Integración mediante `fetch`, sin SDK obligatorio.
- El proveedor se puede sustituir detrás del adaptador de correo.

### Costes y riesgos

- Producción necesita dominio verificado y configuración DNS SPF/DKIM; Resend aplica cuota diaria en el plan gratuito.
- El envío real aún no se ha probado: falta configurar dominio y API key.

## Referencias

- [Especificación](../spec.md), REQ-200, REQ-206, NFR-001, NFR-002.
