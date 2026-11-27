import Link from "next/link";
import { ForgotPasswordForm } from "@/app/components/auth/forgot-password-form";

export default function ForgotPasswordPage(): React.JSX.Element {
  return (
    <main className="page-container auth-page">
      <section aria-labelledby="forgot-password-title" className="auth-card">
        <span className="section-kicker">Recuperación de cuenta</span>
        <h1 id="forgot-password-title">Restablecer contraseña</h1>
        <p className="auth-description">Te enviaremos un enlace al correo asociado a tu cuenta.</p>
        <ForgotPasswordForm />
        <p className="auth-switch">
          <Link href="/auth/sign-in">Volver al inicio de sesión</Link>
        </p>
      </section>
    </main>
  );
}
