import Link from "next/link";

export default function AvisoLegalPage(): React.JSX.Element {
  return (
    <main className="page-container legal-page">
      <span className="section-kicker">ValenciaSmash</span>
      <h1>Aviso legal</h1>
      <p>
        “ValenciaSmash” (de ahora en adelante “nosotros”, “nuestro”, “Staff de ValenciaSmash”, “esta
        página web” o “valenciasmash.com”) es un proyecto independiente creado por aficionados y sin
        ánimo de lucro. No está afiliado, patrocinado ni respaldado por Nintendo, Nintendo of
        Europe, HAL Laboratory, Sora Ltd. ni ninguna otra empresa titular de los derechos de la
        franquicia (incluyendo a compañías terceras que de alguna forma colaboran con Super Smash
        Bros.).
      </p>

      <h2>Actividad</h2>
      <p>
        ValenciaSmash es un proyecto comunitario independiente sobre Super Smash Bros. Ultimate
        centrado en la comunidad de Valencia. El sitio ofrece información comunitaria, cuentas,
        fichas de jugadores y, conforme se habiliten, funciones relacionadas con torneos y actividad
        competitiva.
      </p>

      <h2>Propiedad intelectual y marcas</h2>
      <p>
        Las marcas, personajes y otros materiales de terceros pertenecen a sus respectivos
        titulares. ValenciaSmash no está afiliado, patrocinado ni aprobado por Nintendo, HAL
        Laboratory o Sora Ltd. El contenido original de la web pertenece a sus respectivos autores.
        Para comunicar una posible infracción o solicitar una retirada, utiliza el enlace de
        contacto disponible en el pie de página.
      </p>

      <h2>Responsabilidad y enlaces</h2>
      <p>
        Procuramos mantener la información del sitio actualizada y aplicar medidas razonables de
        seguridad, sin garantizar la disponibilidad continua ni la ausencia total de errores o
        incidentes. Los enlaces a servicios externos se ofrecen por conveniencia; sus contenidos y
        tratamientos de datos se rigen por las condiciones de sus respectivos titulares.
      </p>
      <p>
        Consulta también los <Link href="/legal/terms">términos de uso</Link>, la{" "}
        <Link href="/legal/privacy">política de privacidad</Link> y la{" "}
        <Link href="/legal/cookies">política de cookies</Link>.
      </p>
    </main>
  );
}
