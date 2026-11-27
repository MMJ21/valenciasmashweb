# ADR-0019: Evitar despliegues de un SHA obsoleto de `master`

- **Estado:** Aceptado
- **Fecha:** 2026-11-27
- **Requisitos relacionados:** NFR-001, NFR-002, NFR-003
- **Sustituye a:** ADR-0017

## Contexto

El CD se dispara tras un `push` a `master` y espera aprobación del entorno `production`. Mientras una ejecución espera aprobación o realiza migraciones, `master` puede avanzar. La concurrencia serializa workflows, pero por sí sola no demuestra que el commit que va a desplegar siga siendo la punta de la rama. El CI requerido por la protección de ramas valida PRs, pero el workflow CD no repite ese CI.

## Decisión

- Mantener el CD en GitHub Actions con `push` a `master` y `workflow_dispatch`, limitado a esa rama, y exigir aprobación del entorno protegido `production` antes de acceder a los secretos.
- Serializar los despliegues sin cancelar uno en curso. El flujo instala dependencias, migra Neon, despliega el Worker y comprueba `/api/health`, en ese orden.
- No repetir el CI dentro del CD: las PR requieren que pase el CI antes del merge. Los secretos del entorno son `DATABASE_URL`, `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`; los secretos runtime del Worker permanecen en Cloudflare.
- Consultar la punta actual de `master` usando el token de lectura del workflow y compararla con `github.sha` antes de iniciar las migraciones. Si difieren, omitir migración, despliegue y healthcheck.
- Volver a consultar y comparar el SHA justo antes de `pnpm run deploy`. Si `master` avanzó durante las migraciones, omitir el despliegue y el healthcheck.
- Mantener `contents: read` como permiso del `GITHUB_TOKEN` y usarlo para la consulta de GitHub API. No se usa un PAT adicional.

## Alternativas consideradas

- **Confiar solo en concurrencia:** descartado porque serializa ejecuciones, pero no garantiza que una ejecución pendiente de aprobación corresponda a la versión más reciente de `master`.
- **Repetir todo el CI en CD:** descartado porque las PR ya requieren esos checks antes de fusionarse y el E2E consume tiempo adicional.
- **Hacer checkout del SHA actual en vez del SHA del evento:** descartado porque migraciones y código deben pertenecer al mismo commit probado, no cambiar a mitad del workflow.

## Consecuencias

### Positivas

- Las ejecuciones obsoletas detectadas antes de migrar no tocan Neon ni Cloudflare.
- Si `master` avanza durante la migración, no se publica el Worker construido desde el commit anterior.
- No se amplían los permisos del token de GitHub.

### Costes y riesgos

- Las consultas reducen, pero no eliminan, la ventana de carrera entre una comparación y el siguiente paso. Si la rama cambia durante `pnpm db:migrate`, esa migración puede quedar aplicada aunque el despliegue se omita; las migraciones deben seguir siendo compatibles hacia atrás.
- La ejecución omitida termina sin publicar el Worker. El `push` nuevo a `master` genera otra ejecución para el SHA más reciente.

## Referencias

- [ADR-0017](0017-cd-con-github-actions-y-aprobacion-de-produccion.md), workflow de CD y aprobación de producción.
- [Especificación](../spec.md), NFR-001, NFR-002 y NFR-003.
- [GitHub Actions: contexto de workflow](https://docs.github.com/en/actions/learn-github-actions/contexts).
