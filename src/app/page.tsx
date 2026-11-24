import Image from "next/image";
import Link from "next/link";
import { getSeasonPeriod } from "@/lib/season";
import { CHARACTERS } from "@/modules/players";
import { CURRENT_RANKING } from "@/modules/ranking";

export const revalidate = 3600;

function formatSeasonDate(date: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Madrid",
  })
    .format(new Date(`${date}T12:00:00Z`))
    .replaceAll(".", "");
}

export default function HomePage(): React.JSX.Element {
  const season = getSeasonPeriod(new Date());

  return (
    <main className="page-container home-page">
      <section aria-labelledby="hero-title" className="hero">
        <div className="hero-content">
          <span className="eyebrow">La comunidad de Smash Ultimate en Valencia</span>
          <h1 id="hero-title">
            El escenario es <span>nuestro.</span>
          </h1>
          <p className="hero-copy">
            Torneos, jugadores y rivalidades. Todo lo que mueve a la comunidad de Super Smash Bros.
            Ultimate en Valencia, en un mismo lugar.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/auth/sign-up">
              Únete a la comunidad <span aria-hidden="true">↗</span>
            </Link>
            <a className="button button-secondary" href="#torneos">
              Explorar ValenciaSmash
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="torneos-title" id="torneos">
        <div className="section-heading">
          <div>
            <span className="section-kicker">En Valencia y online</span>
            <h2 id="torneos-title">Próximos torneos</h2>
            <p>La próxima oportunidad para entrar en escena.</p>
          </div>
        </div>
        <div className="empty-card">
          <p>Pronto encontrarás aquí los próximos torneos de la comunidad.</p>
        </div>
      </section>

      <section aria-labelledby="ranking-title" className="ranking-section" id="ranking">
        <div className="ranking-heading">
          <div>
            <span className="section-kicker">Ranking actual</span>
            <h2 id="ranking-title">Temporada {season.key}</h2>
            <p className="ranking-period">
              {formatSeasonDate(season.startDate)} <span aria-hidden="true">–</span>{" "}
              {formatSeasonDate(season.endDate)}{" "}
            </p>
          </div>
        </div>

        <ol aria-label="Los cinco primeros del ranking actual" className="ranking-list">
          {CURRENT_RANKING.map((entry) => {
            const character = CHARACTERS.find(({ id }) => id === entry.characterId);
            if (character === undefined) {
              return null;
            }

            const movement =
              entry.movement.direction === "up"
                ? {
                    label: `Sube ${entry.movement.places} puestos`,
                    icon: "↑",
                    count: String(entry.movement.places),
                    className: "movement-up",
                  }
                : entry.movement.direction === "down"
                  ? {
                      label: `Baja ${entry.movement.places} puestos`,
                      icon: "↓",
                      count: String(entry.movement.places),
                      className: "movement-down",
                    }
                  : {
                      label: "Sin cambio",
                      icon: "—",
                      count: "",
                      className: "movement-same",
                    };

            return (
              <li className="ranking-row" key={entry.position}>
                <span aria-label={`Puesto ${entry.position}`} className="ranking-position">
                  {entry.position}
                </span>
                <div className="ranking-player">
                  <h3>{entry.username}</h3>
                </div>
                <div className="ranking-character">
                  <span
                    aria-label={movement.label}
                    className={`ranking-movement ${movement.className}`}
                    title={movement.label}
                  >
                    <span aria-hidden="true" className="movement-icon">
                      {movement.icon}
                    </span>
                    {movement.count.length === 0 ? null : (
                      <span className="movement-count">{movement.count}</span>
                    )}
                  </span>
                  <Image
                    alt={`Icono de ${character.name}`}
                    height={76}
                    src={character.icon}
                    unoptimized
                    width={76}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="comunidad-title" className="community-callout" id="comunidad">
        <div>
          <span className="section-kicker">Encuentra tu sitio</span>
          <h2 id="comunidad-title">Tu próxima partida empieza aquí.</h2>
          <p>Completa tu ficha, conoce a la comunidad y prepárate para el siguiente torneo.</p>
        </div>
        <Link className="button button-primary" href="/auth/sign-up">
          Únete a la comunidad <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </main>
  );
}
