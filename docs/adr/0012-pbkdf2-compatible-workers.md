# ADR-0012: Límite PBKDF2 conservador para Workers

- **Estado:** Aceptado con reserva
- **Fecha:** 2026-11-24
- **Requisitos relacionados:** REQ-200, REQ-206, NFR-002, NFR-004, SEC-002
- **Sustituye a:** [ADR-0009](0009-hash-pbkdf2-webcrypto.md)

## Contexto

ADR-0009 eligió PBKDF2-HMAC-SHA-256 con 600 000 iteraciones según la recomendación de seguridad para este algoritmo. La aplicación se desplegará en Cloudflare Workers Free. Un reporte de producción de Cloudflare Community, con `compatibility_date` 2026-10-04, registra `NotSupportedError` al solicitar 240 000 iteraciones y un máximo observado de 100 000.

La documentación general de Web Crypto de Cloudflare no publica este tope en su tabla de algoritmos. Además, una prueba con `wrangler dev --local` y `compatibility_date` 2026-11-20 aceptó 100 001 iteraciones, por lo que el comportamiento local no confirma el límite del servicio gestionado. No se dispone aún de un despliegue propio para probarlo directamente.

## Decisión

Las contraseñas nuevas usan PBKDF2-HMAC-SHA-256 con **100 000 iteraciones**, salt aleatorio de 16 bytes y clave derivada de 256 bits. Este valor se elige de forma conservadora para el límite reportado en Workers Free; queda pendiente confirmar el límite efectivo en un Worker gestionado con `compatibility_date` 2026-11-20. `verifyPasswordHash` rechaza iteraciones superiores a 100 000 fuera del desarrollo local.

En `NODE_ENV=development`, el verificador admite temporalmente hashes locales previos de hasta 600 000 iteraciones, para no bloquear cuentas de prueba creadas antes de esta decisión. No se generan hashes nuevos con el valor anterior y este modo heredado no se habilita en producción.

## Alternativas consideradas

- **Mantener 600 000 iteraciones en Workers:** descartado provisionalmente por el reporte del límite en producción; deberá reconsiderarse si una prueba gestionada con la fecha de compatibilidad objetivo demuestra que ya se admite.
- **Usar PBKDF2 puro en JavaScript o WASM:** descartado por el coste de CPU, la complejidad y el límite de Workers.
- **Delegar autenticación/hash a un servicio externo o cambiar a un runtime Node:** pospuesto por coste e infraestructura adicionales; se reevalúa si el nivel de protección requerido no es aceptable con el límite de Workers.

## Consecuencias

### Positivas

- El alta y el login pueden ejecutar `crypto.subtle` dentro del límite de iteraciones del runtime.
- El formato versionado conserva explícitos algoritmo, iteraciones, salt y hash.
- No se requiere `node:crypto` ni una dependencia de criptografía adicional.

### Costes y riesgos

- 100 000 iteraciones es inferior a la recomendación actual de OWASP para PBKDF2-HMAC-SHA-256 (600 000). La decisión acepta provisionalmente menor coste de ataque offline para evitar que el login falle en el plan objetivo.
- La prueba local con Wrangler y el reporte de producción no coinciden. El límite aún no está confirmado para un Worker gestionado con `compatibility_date: 2026-11-20`; verificarlo antes de producción y crear un ADR sustituto si el resultado cambia.
- NFR-004 requiere medir el tiempo de CPU real del alta y login en producción. Si el nivel de seguridad no es suficiente, se debe reconsiderar el runtime/proveedor de autenticación en un nuevo ADR, no elevar las iteraciones por encima del límite.
- Los hashes ya creados a 600 000 no son válidos en producción Workers. No hay usuarios de producción todavía; las cuentas de desarrollo antiguas se mantienen verificables solo en Node local.

## Referencias

- [Cloudflare Workers Web Crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/): confirma que Workers implementa Web Crypto, pero no documenta actualmente el máximo de iteraciones de PBKDF2.
- [Cloudflare workerd issue #1346](https://github.com/cloudflare/workerd/issues/1346): seguimiento del máximo de 100 000 iteraciones en el runtime.
- [Reporte de Workers Free con compatibility date 2026-10-04](https://community.cloudflare.com/t/pbkdf2-iteration-limit-on-workers-free/965725): muestra `NotSupportedError` por 240 000 iteraciones.
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html): recomendación de PBKDF2-HMAC-SHA-256.
- [ADR-0009](0009-hash-pbkdf2-webcrypto.md), sustituido.
