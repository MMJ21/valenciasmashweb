import Link from "next/link";

export default function VerifiedPage(): React.JSX.Element {
  return (
    <main className="page-container auth-page">
      <section aria-labelledby="verified-title" className="auth-card">
        <span className="section-kicker">Cuenta activada</span>
        <h1 id="verified-title">Correo verificado</h1>
        <p className="auth-description">
          Ya puedes entrar y empezar a completar tu ficha de jugador.
        </p>
        <Link className="button button-primary auth-submit" href="/auth/sign-in">
          Iniciar sesión
        </Link>
      </section>
    </main>
  );
}
