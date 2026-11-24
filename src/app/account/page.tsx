import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/app/components/players/profile-form";
import { DeleteAccountForm } from "@/app/components/auth/delete-account-form";
import { getAuth } from "@/modules/auth";
import { getOwnPlayerProfile } from "@/modules/players";

export const dynamic = "force-dynamic";

export default async function AccountPage(): Promise<React.JSX.Element> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (session === null) {
    redirect("/auth/sign-in");
  }

  const profile = await getOwnPlayerProfile(session.user.id);
  if (profile === null) {
    return (
      <main className="page-container auth-page">
        <section className="auth-card">
          <h1>No se encontró tu ficha</h1>
          <p className="auth-description">Contacta con el equipo para revisar tu cuenta.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-container profile-page">
      <span className="section-kicker">Tu cuenta</span>
      <h1>Tu ficha de jugador</h1>
      <p className="auth-description">Elige cómo quieres aparecer en la comunidad.</p>
      <ProfileForm initialProfile={profile} />
      <section aria-labelledby="delete-account-title" className="account-danger-zone">
        <h2 id="delete-account-title">Eliminar cuenta</h2>
        <p>Tu ficha se anonimizará y el historial competitivo se conservará.</p>
        <DeleteAccountForm />
      </section>
    </main>
  );
}
