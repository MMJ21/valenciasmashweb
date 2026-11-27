import { SignUpForm } from "@/app/components/auth/sign-up-form";

export default function SignUpPage(): React.JSX.Element {
  return (
    <main className="page-container auth-page">
      <section aria-labelledby="sign-up-title" className="auth-card">
        <span className="section-kicker">Empieza tu recorrido</span>
        <h1 id="sign-up-title">Únete a ValenciaSmash</h1>
        <p className="auth-description">
          Crea tu cuenta para configurar tu ficha y seguir la escena competitiva.
        </p>
        <SignUpForm />
      </section>
    </main>
  );
}
