import Link from "next/link";

interface VerifiedPageProps {
  readonly searchParams: Promise<{ readonly error?: string | readonly string[] }>;
}

export default async function VerifiedPage({
  searchParams,
}: VerifiedPageProps): Promise<React.JSX.Element> {
  const { error } = await searchParams;
  const hasError = error !== undefined;

  return (
    <main className="page-container auth-page">
      <section aria-labelledby="verified-title" className="auth-card">
        <span className="section-kicker">
          {hasError ? "Verificación pendiente" : "Cuenta activada"}
        </span>
        <h1 id="verified-title">
          {hasError ? "No se pudo verificar el correo" : "Correo verificado"}
        </h1>
        <p className="auth-description">
          {hasError
            ? "El enlace ha caducado o no es válido. Solicita uno nuevo para activar tu cuenta."
            : "Ya puedes entrar y empezar a completar tu ficha de jugador."}
        </p>
        <Link
          className="button button-primary auth-submit"
          href={hasError ? "/auth/resend-verification" : "/auth/sign-in"}
        >
          {hasError ? "Reenviar enlace" : "Iniciar sesión"}
        </Link>
      </section>
    </main>
  );
}
