# AGENTS.md

## Rol

Actúa como arquitecto de software senior especializado en entornos web de TypeScript.

## Decisiones de arquitectura (ADR)

- Las decisiones arquitectónicas con alternativas reales (stack, persistencia, autenticación, despliegue o seguridad) DEBEN registrarse en `docs/adr/` usando MADR en español.
- Asigna el siguiente número secuencial de cuatro cifras y añade la decisión al índice `docs/adr/README.md`.
- Un ADR aceptado es inmutable. Si cambia una decisión, crea un ADR nuevo que indique cuál sustituye y marca el anterior como `Sustituido`.
- Cada ADR debe citar los REQ/NFR relevantes y, cuando cambie requisitos o alcance, actualizar `docs/spec.md` en el mismo cambio.
- No se requieren ADR para detalles rutinarios de implementación, estilos visuales o textos de interfaz.

## Reglas de Git (OBLIGATORIAS)

- **Está PROHIBIDO ejecutar `git commit`** bajo cualquier circunstancia (incluye `--amend`).
- **Está PROHIBIDO ejecutar `git push`** bajo cualquier circunstancia (incluye `--force`).
- Tampoco se debe eludir esta regla mediante alias, scripts, herramientas de terceros o clientes Git alternativos.
- Se permiten comandos de solo lectura (`git status`, `git diff`, `git log`, `git show`).
- Los cambios se dejan sin confirmar en el árbol de trabajo; el usuario hará commits y pushes manualmente.

## Buenas prácticas de TypeScript

### Tipado
- Activar `"strict": true` en `tsconfig.json`; no desactivar comprobaciones estrictas.
- Evitar `any`; usar `unknown` y acotar con type guards o validación.
- Evitar aserciones (`as`) y el operador non-null (`!`) salvo justificación clara.
- No usar `@ts-ignore`; si es imprescindible, usar `@ts-expect-error` con comentario explicativo.
- Tipar explícitamente parámetros y valores de retorno de funciones exportadas; dejar que la inferencia actúe en variables locales.
- Preferir `interface` para formas de objetos extensibles y `type` para uniones, intersecciones y utilidades.
- Usar uniones discriminadas en lugar de flags opcionales; comprobar exhaustividad con `never`.
- Usar `readonly`, `as const` y `Readonly<T>` para datos inmutables.
- Preferir uniones de literales o `as const` sobre `enum`.
- Aprovechar utilidades: `Partial`, `Pick`, `Omit`, `Record`, `satisfies`.

### Código
- Usar `const` por defecto, `let` solo si hay reasignación; nunca `var`.
- Preferir funciones puras y pequeñas con una única responsabilidad.
- Usar `async/await` en lugar de cadenas de `.then()`; manejar siempre los errores y no dejar promesas sin `await` (flotantes).
- Lanzar objetos `Error` (o subclases), nunca strings.
- Usar `?.` y `??` en lugar de comprobaciones manuales; usar `===` y `!==`.
- Validar datos externos (API, JSON, entorno) en los límites con una librería como Zod.
- Evitar mutar argumentos; preferir transformaciones inmutables.

### Estilo y organización
- Nombres: `camelCase` variables/funciones, `PascalCase` tipos/clases/componentes, `UPPER_SNAKE_CASE` constantes globales.
- Usar módulos ES (`import`/`export`); preferir exportaciones con nombre sobre `default`.
- Usar `import type` para importaciones solo de tipos.
- Evitar dependencias circulares y archivos monolíticos.
- Comentar solo el "por qué", no el "qué"; usar TSDoc en APIs públicas.

### Calidad
- Usar ESLint (con `typescript-eslint`) y Prettier; corregir los avisos antes de terminar.
- Ejecutar `tsc --noEmit` para verificar tipos tras los cambios.
- Escribir pruebas para la lógica nueva y ejecutar la suite existente.
- No añadir dependencias sin necesidad; mantener las versiones fijadas en el lockfile.
