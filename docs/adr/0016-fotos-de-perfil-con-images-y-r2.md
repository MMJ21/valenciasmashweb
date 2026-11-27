# ADR-0016: Recodificar fotos de perfil con Images y almacenarlas en R2

- **Estado:** Aceptado con reserva
- **Fecha:** 2026-11-26
- **Requisitos relacionados:** REQ-001, REQ-203, REQ-205, NFR-001, NFR-004
- **Sustituye a:** ninguno

## Contexto

Las fotos recibidas son contenido no confiable y deben validarse y recodificarse en servidor. El límite publicado para Workers Free es 10 ms de CPU por petición; la recodificación con WASM dentro del Worker no se ha medido y no se adopta por el riesgo de excederlo. La transformación de Cloudflare Images se ejecuta mediante un binding de servicio y puede recibir bytes sin publicar la imagen original.

## Decisión

- El cliente envía el archivo al endpoint autenticado del servidor (máximo 2 MiB); no se conceden URL de escritura firmadas.
- El servidor comprueba firmas binarias JPEG, PNG o WebP y Cloudflare Images decodifica y recodifica la entrada como WebP cuadrado de 512 × 512 con `fit=cover`.
- El resultado se guarda en el bucket privado R2 bajo una clave determinista del usuario. La ficha solo guarda una URL servida por una ruta del Worker; el bucket no es público.
- Al reemplazar se sobrescribe la misma clave. Al iniciar la baja se borra el objeto de R2 y después se anonimiza la ficha.

## Alternativas consideradas

- **Subida directa firmada a R2:** descartada para v1; requiere emitir y limitar credenciales temporales y añade complejidad al flujo. El máximo de 2 MiB hace aceptable pasar por el servidor.
- **Recodificación WASM dentro del Worker:** descartada por el límite gratuito de CPU (10 ms publicados) y falta de mediciones que demuestren que un códec cabe en ese presupuesto.
- **Cloudflare Images Storage:** descartada para mantener el almacenamiento en R2 y evitar un producto de almacenamiento de pago.

## Consecuencias

### Positivas

- El original nunca queda publicado ni se conserva en R2.
- La aplicación controla autenticación, tamaño y formato permitido; se elimina metadato al recodificar.
- Cloudflare Images ofrece 5 000 transformaciones únicas mensuales gratuitas; exceder el límite gratuito provoca error, no cobro.

### Costes y riesgos

- Images debe estar habilitado en la cuenta y el binding `IMAGES` disponible en el Worker; esto queda por validar en el próximo despliegue. Se debe crear el bucket R2 `valenciasmash-avatars`.
- El plan gratuito de Workers y la cuota de transformaciones pueden cambiar. Una denegación del servicio Images hace fallar la subida sin guardar el original.
- El spike se fundamentó en documentación, no en una medición de CPU de producción. El recorte exacto debe comprobarse en el entorno remoto.
- La eliminación en R2 ocurre antes de anonimizar la cuenta: si falla, la baja no continúa y se puede reintentar. Esto evita dejar una foto almacenada tras una baja completada.

## Referencias

- [Especificación](../spec.md), REQ-203, REQ-205, NFR-001 y NFR-004.
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/): CPU de Workers Free.
- [Images binding](https://developers.cloudflare.com/images/optimization/binding/): entrada raw y transformación desde Worker.
- [Images pricing](https://developers.cloudflare.com/images/pricing/): cuota gratuita de transformaciones.
