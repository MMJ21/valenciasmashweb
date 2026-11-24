import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicPlayerProfile } from "@/modules/players";
import { CHARACTERS } from "@/modules/players";

export const revalidate = 300;

interface PlayerPageProps {
  readonly params: Promise<{ readonly username: string }>;
}

export default async function PlayerPage({ params }: PlayerPageProps): Promise<React.JSX.Element> {
  const { username } = await params;
  const profile = await getPublicPlayerProfile(username);
  if (profile === null) {
    notFound();
  }

  const selectedCharacters = profile.characters
    .map((entry) => ({
      ...entry,
      character: CHARACTERS.find(({ id }) => id === entry.id),
    }))
    .filter((entry) => entry.character !== undefined);
  const fullName = [profile.firstName, profile.lastName]
    .filter((name): name is string => name !== null && name.length > 0)
    .join(" ");

  return (
    <main className="page-container public-profile">
      <section className="public-profile-card">
        <div className="profile-avatar" aria-hidden="true">
          {profile.avatarUrl === null ? (
            (profile.firstName?.slice(0, 1).toLocaleUpperCase("es-ES") ?? "V")
          ) : (
            <Image alt="" height={104} src={profile.avatarUrl} unoptimized width={104} />
          )}
        </div>
        <span className="section-kicker">Jugador de ValenciaSmash</span>
        <h1>{fullName || profile.username}</h1>
        <p className="profile-handle">@{profile.username}</p>
        {profile.gamertag === null ? null : (
          <p className="profile-gamertag">Nick: {profile.gamertag}</p>
        )}
        {profile.twitter === null && profile.twitch === null ? null : (
          <nav aria-label="Redes sociales" className="profile-social-links">
            {profile.twitter === null ? null : (
              <a
                href={`https://x.com/${encodeURIComponent(profile.twitter.replace(/^@/, ""))}`}
                rel="noreferrer"
                target="_blank"
              >
                Twitter / X
              </a>
            )}
            {profile.twitch === null ? null : (
              <a
                href={`https://www.twitch.tv/${encodeURIComponent(profile.twitch.replace(/^@/, ""))}`}
                rel="noreferrer"
                target="_blank"
              >
                Twitch
              </a>
            )}
          </nav>
        )}
        {profile.bio === null || profile.bio.length === 0 ? (
          <p className="auth-description">Este jugador todavía no ha escrito su biografía.</p>
        ) : (
          <p className="profile-bio">{profile.bio}</p>
        )}
      </section>

      <section aria-labelledby="characters-title" className="profile-characters">
        <span className="section-kicker">En selección</span>
        <h2 id="characters-title">Personajes</h2>
        {selectedCharacters.length === 0 ? (
          <p className="empty-card">Este jugador todavía no ha seleccionado personajes.</p>
        ) : (
          <ul className="profile-character-list">
            {selectedCharacters.map(({ id, isMain, character }) =>
              character === undefined ? null : (
                <li className="profile-character" key={id}>
                  <Image alt="" height={64} src={character.icon} unoptimized width={64} />
                  <span>{character.name}</span>
                  {isMain ? <span className="main-character-badge">Principal</span> : null}
                </li>
              ),
            )}
          </ul>
        )}
      </section>
    </main>
  );
}
