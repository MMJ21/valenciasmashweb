# ADR-0008: Catálogo estático de 86 selecciones de personaje

- **Estado:** Aceptado
- **Fecha:** 2026-11-24 (documentado)
- **Requisitos relacionados:** REQ-013, REQ-201
- **Sustituye a:** ninguno

## Contexto

El perfil permite elegir luchadores de Smash Ultimate. La comunidad aportó los iconos de stock con variantes de color. La ficha inicial solo necesita el personaje principal y un secundario opcional; el selector de color se pospone.

## Decisión

Mantener un catálogo estático y versionado en TypeScript con 86 selecciones, IDs estables y un icono por entrada. Agrupar Pokémon Trainer, Pyra & Mythra e Ice Climbers; mantener a Samus y Zero Suit Samus separadas y los tres Miis como personajes distintos. Mostrar solo el primer color disponible por personaje.

## Alternativas consideradas

- **Catálogo en base de datos:** descartado porque el roster es fijo y no requiere administración dinámica.
- **Elegir color en v1:** pospuesto hasta que exista el selector de variantes.
- **Desglosar a Pokémon Trainer en Squirtle, Ivysaur y Charizard:** descartado porque el jugador selecciona Pokémon Trainer como personaje.

## Consecuencias

### Positivas

- Los datos y las rutas de iconos tienen IDs estables; validación Zod puede comprobar la selección.
- Las variantes originales permanecen disponibles para el futuro selector.

### Costes y riesgos

- Hay que revisar manualmente el catálogo si se agregan personajes o cambia la fuente de iconos.
- Los iconos de Nintendo requieren revisión de derechos y aviso de no afiliación antes del lanzamiento.

## Referencias

- [Especificación](../spec.md), REQ-013, REQ-201.
