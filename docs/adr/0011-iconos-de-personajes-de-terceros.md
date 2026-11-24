# ADR-0011: Iconos de personajes aportados por la comunidad

- **Estado:** Aceptado con reserva
- **Fecha:** 2026-11-24 (documentado)
- **Requisitos relacionados:** REQ-013, REQ-201, NFR-005
- **Sustituye a:** ninguno

## Contexto

La ficha y el ranking muestran iconos de los personajes de Super Smash Bros. Ultimate. La comunidad aportó 704 archivos PNG de 200 × 200 px en `public/Stock Icons/`; los iconos proceden de una colección publicada en Google Drive y enlazada desde un hilo de Reddit por `u/Max_Hamm`. Según un comentario del autor de ese hilo, la mayoría se basan en iconos de la web de Smash recoloreados; algunos se hicieron desde cero o combinan elementos. El autor dijo: “People can use them however they want, no credit required”. La carpeta de Drive no contiene README ni archivo de licencia.

Ese comentario es un permiso informal del autor sobre su contribución, no una licencia formal y no concede derechos sobre el arte original de Nintendo. Las normas de Nintendo sobre vídeos e imágenes para plataformas de publicación no constituyen una autorización general para redistribuir estos archivos en una web.

## Decisión

Conservar en el repositorio solo los 86 iconos normalizados utilizados por la aplicación (`public/characters/`). Ignorar `public/Stock Icons/` en Git, pero no borrarla del disco local, para conservar el archivo original completo y las variantes de color. Mantener el código desacoplado de los nombres originales mediante IDs estables de personaje.

La web mostrará un aviso de que ValenciaSmash es independiente y no está afiliada ni patrocinada por Nintendo, atribuirá la fuente disponible y ofrecerá un canal para solicitar la retirada de contenido.

## Alternativas consideradas

- **Incluir los 704 iconos y todas sus variantes en Git:** descartado porque publica un archivo grande de imágenes derivadas innecesarias para la v1.
- **Retirar también los 86 iconos seleccionados:** reduce más la exposición, pero impediría mostrar la selección de personajes que solicita REQ-201.
- **Sustituirlos por una fuente con licencia explícita o por recursos propios:** es la salida preferida si se dispone de una colección adecuada, pero no está disponible actualmente.
- **Servir los mismos archivos desde R2:** descartado como mitigación legal; mover el alojamiento no cambia quién tiene los derechos.

## Consecuencias

### Positivas

- El historial público de Git no incluye la colección completa de variantes.
- El selector solo conserva los iconos necesarios para mostrar las 86 selecciones acordadas.
- Los archivos pueden sustituirse sin cambiar el esquema ni los IDs si llega una solicitud de retirada.

### Costes y riesgos

- Los 86 iconos publicados siguen reproduciendo o adaptando personajes y arte de Nintendo; esta decisión no determina que su uso esté legalmente autorizado.
- El permiso del autor es informal y podría no ser comprobable más adelante; la fuente y el comentario se registran aquí para trazabilidad.
- `pnpm assets:characters` requiere que el desarrollador obtenga localmente el archivo de origen en `public/Stock Icons/`; esa carpeta no se incluye al clonar el repositorio.
- Antes de abrir el servicio al público, revisar el aviso de no afiliación, el canal de retirada y el riesgo con asesoramiento legal si es necesario.

## Referencias

- [Hilo de Reddit del autor](https://www.reddit.com/r/smashbros/comments/1g8u7ug/i_made_200x200_pixel_versions_of_every_stock_icon/).
- [Carpeta de origen de Google Drive](https://drive.google.com/drive/folders/1Gj5_5OEBy7fyroFoIP08IXTwu_ovthiG).
- [Normas de Nintendo sobre contenido de juegos en plataformas de vídeo e imágenes](https://www.nintendo.co.jp/networkservice_guideline/es/index.html): se consultó como referencia; no se interpreta como una licencia para estos iconos.
- [Especificación](../spec.md), REQ-013, REQ-201, NFR-005.
