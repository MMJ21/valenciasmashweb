import { ResetPasswordForm } from "@/app/components/auth/reset-password-form";

export default function ResetPasswordPage(): React.JSX.Element {
  return (
    <main className="page-container auth-page">
      <section aria-labelledby="reset-password-title" className="auth-card">
        <span className="section-kicker">Recuperación de cuenta</span>
        <h1 id="reset-password-title">Elige una contraseña nueva</h1>
        <p className="auth-description">Usa al menos 12 caracteres.</p>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
