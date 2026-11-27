# ADR-0010: PWA en lugar de aplicación nativa en la v1

- **Estado:** Aceptado
- **Fecha:** 2026-11-24 (documentado)
- **Requisitos relacionados:** NFR-001, NFR-008, REQ-600..622
- **Sustituye a:** ninguno

## Contexto

Se quiere ofrecer una experiencia instalable en Android e iOS con el menor coste posible. Publicar aplicaciones en tiendas añade cuentas, revisión y mantenimiento.

## Decisión

Construir una PWA instalable en v1 y posponer Capacitor, Expo u otras aplicaciones nativas hasta que exista demanda.

## Alternativas consideradas

- **Capacitor:** viable para reutilizar la web, pero añade empaquetado y revisión de tienda; una app principalmente web puede no cumplir expectativas de tienda.
- **React Native/Expo o nativo:** descartado inicialmente por coste de desarrollo y mantenimiento duplicado.
- **Solo web responsive sin PWA:** descartado porque la comunidad solicitó instalación y uso offline básico.

## Consecuencias

### Positivas

- Una aplicación web sirve a escritorio y móvil con un solo código base.
- Evita inicialmente tarifas de publicación y procesos de tienda.

### Costes y riesgos

- Web Push tiene requisitos específicos en iOS y la compatibilidad del service worker con OpenNext/Workers debe validarse.
- No proporciona todas las capacidades ni visibilidad de una aplicación de tienda.

## Referencias

- [Especificación](../spec.md), NFR-001, NFR-008, REQ-600..622.
