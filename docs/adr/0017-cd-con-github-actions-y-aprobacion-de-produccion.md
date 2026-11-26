# ADR-0017: Despliegue continuo con GitHub Actions y aprobación de producción

- **Estado:** Aceptado
- **Fecha:** 2026-11-26
- **Requisitos relacionados:** NFR-001, NFR-002, NFR-003
- **Sustituye a:** ninguno

## Contexto

El repositorio ya ejecuta CI en las pull requests y exige que pase para permitir el merge. El despliegue necesita aplicar migraciones incrementales de Neon y publicar el Worker de Cloudflare en un orden controlado, sin repetir los tests costosos de CI dentro del CD. La producción debe requerir una aprobación humana antes de que el workflow acceda a credenciales de despliegue.

## Decisión

- Añadir un workflow de GitHub Actions que se active en `push` a `master` y permita `workflow_dispatch` limitado a `master`.
- Usar el entorno protegido de GitHub `production`, configurado con reviewers requeridos. El job no empieza hasta que una persona lo aprueba.
- En un único job serializado, instalar dependencias, aplicar `pnpm db:migrate`, ejecutar `pnpm run deploy` y comprobar `/api/health`. Si una etapa falla, las posteriores no se ejecutan.
- Guardar `DATABASE_URL`, `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` como secretos del entorno `production`; no almacenar secretos de runtime del Worker en GitHub.
- No invocar CI desde CD: la calidad se valida en la PR mediante los checks requeridos por la protección de `master`. Mantener la ejecución de CI en pushes a `master` como verificación independiente.
- Permitir una sola ejecución de despliegue a la vez y no cancelar una ejecución en curso.

## Alternativas consideradas

- **Despliegue manual desde una máquina local:** descartado como procedimiento habitual por depender de credenciales locales y no dejar un flujo de publicación verificable en el repositorio.
- **Cloudflare Workers Builds:** descartado porque el flujo requiere migraciones Neon controladas y una aprobación manual gestionada junto con el código.
- **Repetir CI completo dentro de CD:** descartado porque la política de ramas ya exige CI antes del merge y los E2E consumen tiempo adicional.

## Consecuencias

### Positivas

- Las migraciones preceden al código que las necesita y un fallo bloquea la publicación.
- La aprobación de GitHub Environment mantiene los secretos fuera de PRs no confiables.
- La prueba de salud detecta fallos básicos después del despliegue.

### Costes y riesgos

- Los administradores deben configurar `production` con reviewers requeridos y los tres secretos indicados. Sin esa configuración, el job no tiene la protección prevista o no puede desplegar.
- La protección de `master` debe exigir el CI de PR y, para asegurar que la rama probada sea la que se fusiona, requerir que la rama esté actualizada antes del merge.
- Las migraciones deben ser compatibles con la versión anterior del Worker. Si el despliegue falla después de migrar, la base de datos queda migrada aunque el Worker anterior siga publicado; el rollback del Worker no revierte la base de datos.
- `workflow_dispatch` debe seleccionarse sobre `master`; el `if` del job impide desplegar desde otras ramas.

## Referencias

- [Especificación](../spec.md), NFR-001, NFR-002 y NFR-003.
- [GitHub Actions: deployments and environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment).
- [Wrangler: despliegue de Workers](https://developers.cloudflare.com/workers/wrangler/commands/#deploy).
